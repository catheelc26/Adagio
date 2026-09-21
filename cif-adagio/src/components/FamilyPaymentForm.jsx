import { useMemo, useState } from "react";
import { Camera, ChevronDown, Plus, Trash2, UserPlus, X } from "lucide-react";
import { groupById, PAYMENT_METHODS, paymentMethodInfo, requiresInscription } from "../lib/constants";
import { effectivePrice, familyMembersOf, pagoMovilAccountForGroup, proratedFirstMonth } from "../lib/business";
import { currentMonthKey, monthLabel, studentDisplayName, uid, usd } from "../lib/format";
import { compressImage } from "../lib/image";
import { COLLECTIONS, setImage } from "../lib/db";
import { useAppData } from "../lib/AppDataContext";
import { notifyPush } from "../lib/push";
import { CopyButton, CopyRow, Field, inputCls, StudentAvatar } from "./ui";

const newItemFor = (student, groups) => ({
  key: uid(),
  type: "mensualidad",
  concept: "Mensualidad",
  amount: String(effectivePrice(student, groups)),
  month: currentMonthKey(),
});

/**
 * Como PaymentForm, pero para un representante con varios hijos/familiares
 * vinculados: deja registrar el pago de todos en un solo paso. Cada estudiante
 * sigue guardándose como una transacción totalmente independiente (nada se
 * mezcla para administración) — lo único que se comparte es la foto del
 * comprobante y la referencia, y solo entre quienes pagan a la MISMA cuenta.
 * Si hay hermanos que pagan a cuentas de Pago Móvil distintas, se piden
 * comprobantes por separado, uno por cuenta.
 */
export function FamilyPaymentForm({ student, onClose }) {
  const { students, payments, settings, groups, toast } = useAppData();
  const familyMembers = useMemo(() => familyMembersOf(students.items, student), [students.items, student]);

  const [entries, setEntries] = useState([{ studentId: student.id, items: [newItemFor(student, groups.items)] }]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [referenceByGroup, setReferenceByGroup] = useState({});
  const [proofByGroup, setProofByGroup] = useState({});
  const [proofErrorByGroup, setProofErrorByGroup] = useState({});
  const [compressingGroup, setCompressingGroup] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const currency = paymentMethodInfo(method).currency;
  const rate = Number(settings.value.officialRate) || 0;
  const studentOf = (id) => familyMembers.find((s) => s.id === id);
  const availableToAdd = familyMembers.filter((m) => !entries.some((e) => e.studentId === m.id));

  const updateEntryItems = (studentId, updater) =>
    setEntries((prev) => prev.map((e) => (e.studentId === studentId ? { ...e, items: updater(e.items) } : e)));

  const addMember = (memberId) => {
    const m = studentOf(memberId);
    setEntries((prev) => [...prev, { studentId: memberId, items: [newItemFor(m, groups.items)] }]);
    setShowAddMember(false);
  };
  const removeMember = (studentId) => setEntries((prev) => prev.filter((e) => e.studentId !== studentId));

  const addItem = (studentId) => updateEntryItems(studentId, (items) => [...items, { key: uid(), type: "extra", concept: "", amount: "" }]);
  const removeItem = (studentId, key) => updateEntryItems(studentId, (items) => items.filter((it) => it.key !== key));
  const updateItem = (studentId, key, patch) =>
    updateEntryItems(studentId, (items) => items.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  const setItemType = (entryStudent, key, type) => {
    const g = groupById(groups.items, entryStudent.group);
    let concept = "";
    let amount = "";
    let month;
    if (type === "mensualidad") {
      concept = "Mensualidad";
      amount = String(effectivePrice(entryStudent, groups.items));
      month = currentMonthKey();
    } else if (type === "clase") {
      concept = "Clase individual";
      amount = g?.classPrice ? String(g.classPrice) : "";
    } else if (type === "inscripcion") {
      concept = "Inscripción anual";
      amount = String(settings.value.inscriptionFee || 0);
    }
    updateItem(entryStudent.id, key, { type, concept, amount, month });
  };

  const applyProration = (entryStudent, key) => {
    const { amount, monthKey, nextMonthKey, suggestNextMonth } = proratedFirstMonth(effectivePrice(entryStudent, groups.items), date);
    updateItem(entryStudent.id, key, { amount: String(amount), month: suggestNextMonth ? nextMonthKey : monthKey });
  };

  // Agrupa las entradas por a qué cuenta de Pago Móvil corresponde pagar (o un
  // solo grupo "all" si el método no es Pago Móvil) — cada grupo pide su
  // propio comprobante y referencia.
  const accountGroups = useMemo(() => {
    if (method !== "pago_movil") return [{ key: "all", account: null, entries }];
    const map = new Map();
    for (const entry of entries) {
      const s = studentOf(entry.studentId);
      const g = s ? groupById(groups.items, s.group) : null;
      const account = g ? pagoMovilAccountForGroup(settings.value.pagoMovilAccounts, g.id) : null;
      const key = account?.id || "sin_cuenta";
      if (!map.has(key)) map.set(key, { key, account, entries: [] });
      map.get(key).entries.push(entry);
    }
    return Array.from(map.values());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, entries, groups.items, settings.value.pagoMovilAccounts]);

  const groupTotal = (grp) => grp.entries.reduce((sum, e) => sum + e.items.reduce((s, it) => s + (Number(it.amount) || 0), 0), 0);
  const total = entries.reduce((sum, e) => sum + e.items.reduce((s, it) => s + (Number(it.amount) || 0), 0), 0);
  const methodNote = method !== "pago_movil" ? (settings.value.paymentDetails || {})[method] : null;

  const handleProof = async (groupKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofErrorByGroup((prev) => ({ ...prev, [groupKey]: "" }));
    setCompressingGroup(groupKey);
    try {
      const compressed = await compressImage(file);
      setProofByGroup((prev) => ({ ...prev, [groupKey]: compressed }));
    } catch {
      setProofErrorByGroup((prev) => ({ ...prev, [groupKey]: "No se pudo cargar esa foto. Prueba con otra." }));
    } finally {
      setCompressingGroup(null);
      e.target.value = "";
    }
  };

  const submit = async () => {
    setError("");
    if (entries.length === 0) return setError("Agrega al menos un estudiante.");
    for (const entry of entries) {
      const name = studentDisplayName(studentOf(entry.studentId));
      if (entry.items.length === 0) return setError(`Agrega al menos un ítem para ${name}.`);
      for (const it of entry.items) {
        if (it.type === "extra" && !it.concept.trim()) return setError(`Cada ítem "Extra" de ${name} necesita un concepto.`);
        if (!(Number(it.amount) > 0)) return setError(`${name} tiene un ítem sin monto válido.`);
      }
    }
    if (currency === "VES" && !(rate > 0)) return setError("Configura la tasa oficial en Ajustes antes de registrar pagos en bolívares.");
    for (const grp of accountGroups) {
      if (!proofByGroup[grp.key]) {
        const names = grp.entries.map((e) => studentDisplayName(studentOf(e.studentId))).join(", ");
        return setError(`Adjunta el comprobante de pago para: ${names}.`);
      }
    }
    for (const entry of entries) {
      const name = studentDisplayName(studentOf(entry.studentId));
      for (const it of entry.items) {
        if (it.type === "mensualidad") {
          const dup = payments.items.some((p) => p.studentId === entry.studentId && p.type === "mensualidad" && p.month === it.month);
          if (dup) return setError(`${name} ya tiene un pago de mensualidad para ${monthLabel(it.month)}. Elimínalo primero si es una corrección.`);
          const exempted = payments.items.some((p) => p.studentId === entry.studentId && p.type === "exoneracion" && p.month === it.month && p.confirmed !== false);
          if (exempted) return setError(`${monthLabel(it.month)} ya está exonerado para ${name}.`);
        }
      }
    }

    setSaving(true);
    try {
      for (const grp of accountGroups) {
        const proofDataUrl = proofByGroup[grp.key];
        const reference = (referenceByGroup[grp.key] || "").trim() || null;
        for (const entry of grp.entries) {
          const transactionId = uid();
          for (const it of entry.items) {
            const amount = Number(it.amount);
            const amountVES = currency === "VES" ? Math.round(amount * rate * 100) / 100 : null;
            await payments.add({
              id: uid(),
              transactionId,
              studentId: entry.studentId,
              type: it.type,
              concept: it.concept,
              amount,
              currency,
              amountVES,
              rateUsed: currency === "VES" ? rate : null,
              month: it.type === "mensualidad" ? it.month : null,
              date,
              method,
              reference,
              hasProof: Boolean(proofDataUrl),
              confirmed: false,
              reportedBy: "representante",
            });
          }
          if (proofDataUrl) await setImage(COLLECTIONS.paymentProofs, transactionId, proofDataUrl);
        }
      }
      const names = entries.map((e) => studentDisplayName(studentOf(e.studentId))).join(", ");
      toast(entries.length > 1 ? "Pagos reportados, quedarán confirmados por administración." : "Pago reportado, quedará confirmado por administración.");
      notifyPush({
        target: { role: "admin" },
        title: entries.length > 1 ? "Nuevos pagos reportados" : "Nuevo pago reportado",
        body: `${names} — ${usd(total)} por confirmar.`,
        url: "/admin",
      });
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo registrar el pago.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="modal-panel max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-cream shadow-2xl sm:max-w-xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream px-5 pb-3 pt-5">
          <h3 className="font-display text-lg text-ink">Registrar pago</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="space-y-3">
            {entries.map((entry) => {
              const entryStudent = studentOf(entry.studentId);
              if (!entryStudent) return null;
              const g = groupById(groups.items, entryStudent.group);
              return (
                <div key={entry.studentId} className="card space-y-3 p-3">
                  <div className="flex items-center gap-2">
                    <StudentAvatar student={entryStudent} size={30} />
                    <p className="t13 flex-1 font-semibold text-ink">{studentDisplayName(entryStudent)}</p>
                    {entries.length > 1 && (
                      <button onClick={() => removeMember(entry.studentId)} className="rounded-lg p-1.5 text-wine hover:bg-wine/10" title="Quitar de este pago">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {entry.items.map((it) => (
                      <div key={it.key} className="rounded-lg bg-cream-dim p-2.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <select className={inputCls} value={it.type} onChange={(e) => setItemType(entryStudent, it.key, e.target.value)}>
                            <option value="mensualidad">Mensualidad</option>
                            {g?.classPrice && <option value="clase">Clase</option>}
                            {g && requiresInscription(groups.items, g.id) && <option value="inscripcion">Inscripción</option>}
                            <option value="extra">Extra</option>
                          </select>
                          {entry.items.length > 1 && (
                            <button onClick={() => removeItem(entry.studentId, it.key)} className="rounded-lg p-2 text-wine hover:bg-wine/10">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        {it.type === "extra" ? (
                          <input className={inputCls} placeholder="Concepto" value={it.concept} onChange={(e) => updateItem(entry.studentId, it.key, { concept: e.target.value })} />
                        ) : (
                          <p className="t13 text-muted">{it.concept}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <input type="number" className={inputCls} placeholder="Monto ($)" value={it.amount} onChange={(e) => updateItem(entry.studentId, it.key, { amount: e.target.value })} />
                          {it.type === "mensualidad" && (
                            <button type="button" onClick={() => applyProration(entryStudent, it.key)} className="btn btn-ghost whitespace-nowrap">
                              Prorratear
                            </button>
                          )}
                        </div>
                        {it.type === "mensualidad" && (
                          <Field label="Mes que cubre">
                            <input type="month" className={inputCls} value={it.month} onChange={(e) => updateItem(entry.studentId, it.key, { month: e.target.value })} />
                          </Field>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addItem(entry.studentId)} className="btn btn-ghost w-full">
                    <Plus size={15} /> Agregar ítem para {entryStudent.fullName.split(" ")[0]}
                  </button>
                </div>
              );
            })}
          </div>

          {availableToAdd.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowAddMember((v) => !v)} className="btn btn-ghost w-full">
                <UserPlus size={15} /> Agregar pago de un familiar <ChevronDown size={14} />
              </button>
              {showAddMember && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-paper shadow-2xl">
                  {availableToAdd.map((m) => (
                    <button key={m.id} onClick={() => addMember(m.id)} className="t13 flex w-full items-center gap-2 px-3 py-2.5 text-left text-ink hover:bg-cream-dim">
                      <StudentAvatar student={m} size={24} /> {studentDisplayName(m)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-line-soft pt-4">
            <Field label="Fecha" required>
              <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Método" required>
              <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {methodNote && (
            <div className="rounded-xl bg-cream-dim p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="t11 mb-1 font-semibold uppercase tracking-wide text-bronze-dark">Datos para {paymentMethodInfo(method).label}</p>
                  <p className="t13 whitespace-pre-wrap text-ink">{methodNote}</p>
                </div>
                <CopyButton value={methodNote} />
              </div>
            </div>
          )}

          {accountGroups.length > 1 && (
            <p className="t12 rounded-lg bg-bronze/10 p-3 text-bronze-dark">
              Tus familiares pagan a {accountGroups.length} cuentas de Pago Móvil distintas — sube un comprobante por cada una abajo.
            </p>
          )}

          <div className="space-y-4">
            {accountGroups.map((grp) => {
              const names = grp.entries.map((e) => studentDisplayName(studentOf(e.studentId))).join(", ");
              const subtotal = groupTotal(grp);
              return (
                <div key={grp.key} className="space-y-3 rounded-xl border border-line-soft p-3">
                  <p className="t11 font-semibold uppercase tracking-wide text-bronze-dark">Pago de: {names}</p>

                  {method === "pago_movil" && (
                    grp.account ? (
                      <div className="rounded-xl bg-cream-dim p-3 space-y-1.5">
                        {grp.account.label && <p className="t12 mb-1 text-muted">{grp.account.label}</p>}
                        <CopyRow label="Banco" value={grp.account.bank} />
                        <CopyRow label="Cédula" value={grp.account.cedula} />
                        <CopyRow label="Teléfono" value={grp.account.phone} />
                      </div>
                    ) : (
                      <p className="t13 rounded-xl bg-cream-dim p-3 text-muted">Administración aún no ha configurado los datos de Pago Móvil.</p>
                    )
                  )}

                  {currency === "VES" && (
                    <div className="rounded-xl bg-teal/10 p-3">
                      <p className="t12 font-medium text-teal-dark">Tasa oficial: {rate > 0 ? `Bs. ${rate}` : "sin configurar"}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="font-display text-xl text-ink">{rate > 0 ? `Bs. ${(subtotal * rate).toFixed(2)}` : "—"}</p>
                        {rate > 0 && <CopyButton value={(subtotal * rate).toFixed(2)} />}
                      </div>
                      <p className="t11 text-muted">Equivalente en bolívares ({usd(subtotal)})</p>
                    </div>
                  )}

                  <Field label="Referencia">
                    <input
                      className={inputCls}
                      value={referenceByGroup[grp.key] || ""}
                      onChange={(e) => setReferenceByGroup((prev) => ({ ...prev, [grp.key]: e.target.value }))}
                    />
                  </Field>

                  <Field label="Comprobante (foto)" required>
                    <label className="btn btn-ghost w-full cursor-pointer">
                      <Camera size={16} />
                      {compressingGroup === grp.key ? "Cargando…" : proofByGroup[grp.key] ? "Cambiar foto" : "Adjuntar comprobante"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProof(grp.key, e)} disabled={compressingGroup === grp.key} />
                    </label>
                    <p className="t11 mt-1.5 text-muted">Obligatorio para reportar este pago.</p>
                    {proofErrorByGroup[grp.key] && <p className="t11 mt-1 text-wine">{proofErrorByGroup[grp.key]}</p>}
                    {proofByGroup[grp.key] && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={proofByGroup[grp.key]} alt="" className="h-20 w-20 rounded-lg object-cover" />
                        <button type="button" onClick={() => setProofByGroup((prev) => ({ ...prev, [grp.key]: null }))} className="t12 text-wine underline underline-offset-2">
                          Quitar foto
                        </button>
                      </div>
                    )}
                  </Field>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-line-soft pt-4">
            <span className="t13 font-medium text-muted">Total</span>
            <span className="font-display text-xl text-ink">{usd(total)}</span>
          </div>

          {error && <p className="t13 text-wine">{error}</p>}
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-line bg-cream p-4">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button onClick={submit} disabled={saving} className="btn btn-primary flex-1">
            {saving ? "Guardando…" : "Guardar pago"}
          </button>
        </div>
      </div>
    </div>
  );
}
