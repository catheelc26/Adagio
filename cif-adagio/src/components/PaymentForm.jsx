import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { GROUPS_NO_INSCRIPTION, groupById, PAYMENT_METHODS, paymentMethodInfo } from "../lib/constants";
import { effectivePrice, proratedFirstMonth } from "../lib/business";
import { currentMonthKey, monthLabel, uid, usd } from "../lib/format";
import { compressImage } from "../lib/image";
import { COLLECTIONS, setImage } from "../lib/db";
import { useAppData } from "../lib/AppDataContext";
import { Field, inputCls } from "./ui";

const newItem = (student) => ({
  key: uid(),
  type: "mensualidad",
  concept: "Mensualidad",
  amount: student ? String(effectivePrice(student)) : "",
  month: currentMonthKey(),
});

/**
 * Registra una transacción de pago (uno o más ítems) para un estudiante.
 * `student` fijo = modo representante (autorreporta, queda sin confirmar).
 * `isAdmin` = modo administración (confirmado de inmediato, elige estudiante).
 */
export function PaymentForm({ student: fixedStudent, isAdmin, onClose }) {
  const { students, payments, settings, toast } = useAppData();
  const [studentId, setStudentId] = useState(fixedStudent?.id || "");
  const student = fixedStudent || students.items.find((s) => s.id === studentId);

  const [items, setItems] = useState([newItem(student)]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [reference, setReference] = useState("");
  const [proofPreview, setProofPreview] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const currency = paymentMethodInfo(method).currency;
  const rate = Number(settings.value.officialRate) || 0;
  const group = student ? groupById(student.group) : null;

  const updateItem = (key, patch) => setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => [...prev, { key: uid(), type: "extra", concept: "", amount: "" }]);
  const removeItem = (key) => setItems((prev) => prev.filter((it) => it.key !== key));

  const setItemType = (key, type) => {
    let concept = "";
    let amount = "";
    let month;
    if (type === "mensualidad") {
      concept = "Mensualidad";
      amount = student ? String(effectivePrice(student)) : "";
      month = currentMonthKey();
    } else if (type === "clase") {
      concept = "Clase individual";
      amount = group?.classPrice ? String(group.classPrice) : "";
    } else if (type === "inscripcion") {
      concept = "Inscripción anual";
      amount = String(settings.value.inscriptionFee || 0);
    }
    updateItem(key, { type, concept, amount, month });
  };

  const applyProration = (key) => {
    if (!student) return;
    const { amount, monthKey, nextMonthKey, suggestNextMonth } = proratedFirstMonth(group.price, date);
    updateItem(key, { amount: String(amount), month: suggestNextMonth ? nextMonthKey : monthKey });
  };

  const handleProof = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setProofPreview(compressed);
  };

  const total = useMemo(() => items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0), [items]);

  const submit = async () => {
    setError("");
    if (!student) return setError("Selecciona un estudiante.");
    if (items.length === 0) return setError("Agrega al menos un ítem.");
    for (const it of items) {
      if (it.type === "extra" && !it.concept.trim()) return setError("Cada ítem 'Extra' necesita un concepto.");
      if (!(Number(it.amount) > 0)) return setError("Cada ítem necesita un monto válido.");
    }
    if (currency === "VES" && !(rate > 0)) return setError("Configura la tasa oficial en Ajustes antes de registrar pagos en bolívares.");

    // Guardia de mes duplicado
    for (const it of items) {
      if (it.type === "mensualidad") {
        const dup = payments.items.some((p) => p.studentId === student.id && p.type === "mensualidad" && p.month === it.month);
        if (dup) return setError(`Ya existe un pago de mensualidad para ${monthLabel(it.month)}. Elimínalo primero si es una corrección.`);
      }
    }

    setSaving(true);
    try {
      const transactionId = uid();
      const hasProof = Boolean(proofPreview);
      for (const it of items) {
        const amount = Number(it.amount);
        const amountVES = currency === "VES" ? Math.round(amount * rate * 100) / 100 : null;
        await payments.add({
          id: uid(),
          transactionId,
          studentId: student.id,
          type: it.type,
          concept: it.concept,
          amount,
          currency,
          amountVES,
          rateUsed: currency === "VES" ? rate : null,
          month: it.type === "mensualidad" ? it.month : null,
          date,
          method,
          reference: reference.trim() || null,
          hasProof,
          confirmed: isAdmin,
          reportedBy: isAdmin ? "admin" : "representante",
        });
      }
      if (proofPreview) await setImage(COLLECTIONS.paymentProofs, transactionId, proofPreview);
      toast(isAdmin ? "Pago registrado." : "Pago reportado, quedará confirmado por administración.");
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo registrar el pago.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-cream shadow-2xl sm:max-w-xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream px-5 pb-3 pt-5">
          <h3 className="font-display text-lg text-ink">Registrar pago</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {!fixedStudent && (
            <Field label="Estudiante" required>
              <select className={inputCls} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Selecciona…</option>
                {students.items.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            </Field>
          )}

          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.key} className="card space-y-3 p-3">
                <div className="flex items-center justify-between gap-2">
                  <select className={inputCls} value={it.type} onChange={(e) => setItemType(it.key, e.target.value)}>
                    <option value="mensualidad">Mensualidad</option>
                    {group?.classPrice && <option value="clase">Clase</option>}
                    {group && !GROUPS_NO_INSCRIPTION.includes(group.id) && <option value="inscripcion">Inscripción</option>}
                    <option value="extra">Extra</option>
                  </select>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(it.key)} className="rounded-lg p-2 text-wine hover:bg-wine/10">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                {it.type === "extra" ? (
                  <input className={inputCls} placeholder="Concepto" value={it.concept} onChange={(e) => updateItem(it.key, { concept: e.target.value })} />
                ) : (
                  <p className="t13 text-muted">{it.concept}</p>
                )}
                <div className="flex items-center gap-2">
                  <input type="number" className={inputCls} placeholder="Monto ($)" value={it.amount} onChange={(e) => updateItem(it.key, { amount: e.target.value })} />
                  {it.type === "mensualidad" && (
                    <button type="button" onClick={() => applyProration(it.key)} className="btn btn-ghost whitespace-nowrap">
                      Prorratear
                    </button>
                  )}
                </div>
                {it.type === "mensualidad" && (
                  <Field label="Mes que cubre">
                    <input type="month" className={inputCls} value={it.month} onChange={(e) => updateItem(it.key, { month: e.target.value })} />
                  </Field>
                )}
              </div>
            ))}
            <button onClick={addItem} className="btn btn-ghost w-full">
              <Plus size={15} /> Agregar ítem
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="col-span-2">
              <Field label="Referencia">
                <input className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} />
              </Field>
            </div>
            {currency === "VES" && (
              <div className="col-span-2 rounded-lg bg-cream-dim p-3 t12 text-muted">
                Tasa oficial: {rate > 0 ? `Bs. ${rate}` : "sin configurar"} · Equivalente: {rate > 0 ? `Bs. ${(total * rate).toFixed(2)}` : "—"}
              </div>
            )}
            <div className="col-span-2">
              <Field label="Comprobante (foto)">
                <input type="file" accept="image/*" onChange={handleProof} />
                {proofPreview && <img src={proofPreview} alt="" className="mt-2 h-24 rounded-lg object-cover" />}
              </Field>
            </div>
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
