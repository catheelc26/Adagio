import { useMemo, useState } from "react";
import { Lock, Pencil, Plus, Trash2, X } from "lucide-react";
import { currentMonthKey, monthLabel, uid, usd } from "../../lib/format";
import { useAppData } from "../../lib/AppDataContext";
import { ConfirmDialog, Field, inputCls } from "../../components/ui";

function Stat({ label, value, tone }) {
  return (
    <div className="card p-4">
      <p className="t11 uppercase tracking-wide text-muted">{label}</p>
      <p className={`font-display text-2xl ${tone === "negative" ? "text-wine" : tone === "positive" ? "text-teal-dark" : "text-ink"}`}>{value}</p>
    </div>
  );
}

const emptyEntryForm = () => ({ type: "ingreso", concept: "", amount: "", date: new Date().toISOString().slice(0, 10), notes: "" });

function EntryFormModal({ entry, onClose }) {
  const { personalFinances, toast } = useAppData();
  const [f, setF] = useState(() =>
    entry
      ? { type: entry.type || "gasto", concept: entry.concept, amount: String(entry.amount), date: entry.date, notes: entry.notes || "" }
      : emptyEntryForm()
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!f.concept.trim()) return setError("Escribe un concepto.");
    if (!(Number(f.amount) > 0)) return setError("Ingresa un monto válido.");
    if (!f.date) return setError("Selecciona la fecha.");
    setSaving(true);
    try {
      const payload = { type: f.type, concept: f.concept.trim(), amount: Number(f.amount), date: f.date, notes: f.notes.trim() || null };
      if (entry?.id) await personalFinances.update(entry.id, payload);
      else await personalFinances.add({ id: uid(), ...payload });
      toast(entry?.id ? "Movimiento actualizado." : "Movimiento registrado.");
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo guardar el movimiento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="modal-panel w-full max-w-sm rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">{entry?.id ? "Editar movimiento" : "Nuevo movimiento"}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <Field label="Tipo" required>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setF({ ...f, type: "ingreso" })}
                className={`flex-1 rounded-xl border px-3 py-2 t13 font-medium ${f.type === "ingreso" ? "border-teal bg-teal/10 text-teal-dark" : "border-line text-muted"}`}
              >
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setF({ ...f, type: "gasto" })}
                className={`flex-1 rounded-xl border px-3 py-2 t13 font-medium ${f.type === "gasto" ? "border-wine bg-wine/10 text-wine" : "border-line text-muted"}`}
              >
                Gasto
              </button>
            </div>
          </Field>
          <Field label="Concepto" required>
            <input className={inputCls} value={f.concept} onChange={(e) => setF({ ...f, concept: e.target.value })} placeholder="Ej. Retiro personal, compra de dólares" />
          </Field>
          <Field label="Monto ($)" required>
            <input type="number" className={inputCls} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          </Field>
          <Field label="Fecha" required>
            <input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </Field>
          <Field label="Notas (opcional)">
            <textarea rows={2} className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </Field>
        </div>
        {error && <p className="t13 mt-3 text-wine">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button onClick={submit} disabled={saving} className="btn btn-primary flex-1">{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Finanzas personales — aparte de todo lo demás, solo para quien entre con
 * el PIN de dueña (ver AdminShell/AdminGate/SettingsView). Mismo patrón que
 * Gastos en Estadísticas, pero con ingresos y gastos propios, nada que ver
 * con la contabilidad de la escuela.
 */
export function FinancesView() {
  const { personalFinances, toast } = useAppData();
  const month = currentMonthKey();
  const [financeMonth, setFinanceMonth] = useState(month);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const availableMonths = useMemo(() => {
    const set = new Set([month]);
    personalFinances.items.forEach((e) => e.date && set.add(e.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [personalFinances.items, month]);

  const isAllMonths = financeMonth === "all";
  const inSelectedMonth = (dateStr) => isAllMonths || dateStr?.startsWith(financeMonth);

  const periodEntries = personalFinances.items.filter((e) => inSelectedMonth(e.date)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const periodIncome = periodEntries.filter((e) => e.type === "ingreso").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const periodExpense = periodEntries.filter((e) => e.type !== "ingreso").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const periodNet = periodIncome - periodExpense;

  const allTimeIncome = personalFinances.items.filter((e) => e.type === "ingreso").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const allTimeExpense = personalFinances.items.filter((e) => e.type !== "ingreso").reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const handleDelete = async () => {
    if (!deleting) return;
    await personalFinances.remove(deleting.id);
    setDeleting(null);
    toast("Movimiento eliminado.");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-6">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Lock size={16} className="text-muted" />
          <h1 className="font-display text-2xl text-ink">Finanzas personales</h1>
        </div>
        <p className="t13 text-muted">
          Aparte de la contabilidad de la escuela — solo tú ves este apartado, ni con el PIN de administración normal se puede entrar aquí.
        </p>
      </div>

      <select className="field-input" value={financeMonth} onChange={(e) => setFinanceMonth(e.target.value)}>
        <option value="all">Todos los meses</option>
        {availableMonths.map((m) => (
          <option key={m} value={m}>{monthLabel(m)}</option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Ingresos" value={usd(periodIncome)} tone="positive" />
        <Stat label="Gastos" value={usd(periodExpense)} tone="negative" />
        <Stat label="Neto" value={usd(periodNet)} tone={periodNet >= 0 ? "positive" : "negative"} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Movimientos {isAllMonths ? "en total" : `en ${monthLabel(financeMonth)}`}</h2>
          <button onClick={() => setCreating(true)} className="btn btn-ghost">
            <Plus size={15} /> Nuevo
          </button>
        </div>
        <div className="space-y-2">
          {periodEntries.map((e) => (
            <div key={e.id} className="card flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="t13 text-ink">{e.concept}</p>
                <p className="t11 text-muted">{e.date}{e.notes ? ` · ${e.notes}` : ""}</p>
              </div>
              <span className={`t13 font-semibold ${e.type === "ingreso" ? "text-teal-dark" : "text-wine"}`}>
                {e.type === "ingreso" ? "+" : "−"}{usd(e.amount)}
              </span>
              <button onClick={() => setEditing(e)} className="rounded-lg p-1.5 text-muted hover:bg-line hover:text-ink"><Pencil size={15} /></button>
              <button onClick={() => setDeleting(e)} className="rounded-lg p-1.5 text-wine hover:bg-wine/10"><Trash2 size={15} /></button>
            </div>
          ))}
          {periodEntries.length === 0 && (
            <p className="t13 rounded-xl bg-cream-dim p-4 text-center text-muted">Sin movimientos registrados {isAllMonths ? "" : "este mes"}.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display mb-3 text-lg text-ink">En general</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Ingresos" value={usd(allTimeIncome)} />
          <Stat label="Gastos" value={usd(allTimeExpense)} />
          <Stat label="Neto" value={usd(allTimeIncome - allTimeExpense)} tone={allTimeIncome - allTimeExpense >= 0 ? "positive" : "negative"} />
        </div>
      </div>

      {(creating || editing) && <EntryFormModal entry={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
      {deleting && (
        <ConfirmDialog
          title="Eliminar movimiento"
          message={`Se eliminará "${deleting.concept}" (${usd(deleting.amount)}). Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
