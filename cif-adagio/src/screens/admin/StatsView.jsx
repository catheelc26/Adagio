import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { effectivePrice, isActive, owesMonthlyFee } from "../../lib/business";
import { currentMonthKey, monthLabel, uid, usd } from "../../lib/format";
import { useAppData } from "../../lib/AppDataContext";
import { ConfirmDialog, Field, inputCls } from "../../components/ui";

const PAYMENT_TYPE_LABELS = {
  mensualidad: "Mensualidades",
  inscripcion: "Inscripciones",
  clase: "Clases sueltas",
  cuota_participacion: "Cuotas de participación",
  extra: "Extras",
};

function Stat({ label, value, tone }) {
  return (
    <div className="card p-4">
      <p className="t11 uppercase tracking-wide text-muted">{label}</p>
      <p className={`font-display text-2xl ${tone === "negative" ? "text-wine" : tone === "positive" ? "text-teal-dark" : "text-ink"}`}>{value}</p>
    </div>
  );
}

const emptyExpenseForm = () => ({ concept: "", amount: "", date: new Date().toISOString().slice(0, 10), notes: "" });

function ExpenseFormModal({ expense, onClose }) {
  const { expenses, toast } = useAppData();
  const [f, setF] = useState(() => (expense ? { concept: expense.concept, amount: String(expense.amount), date: expense.date, notes: expense.notes || "" } : emptyExpenseForm()));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!f.concept.trim()) return setError("Escribe un concepto.");
    if (!(Number(f.amount) > 0)) return setError("Ingresa un monto válido.");
    if (!f.date) return setError("Selecciona la fecha.");
    setSaving(true);
    try {
      const payload = { concept: f.concept.trim(), amount: Number(f.amount), date: f.date, notes: f.notes.trim() || null };
      if (expense?.id) await expenses.update(expense.id, payload);
      else await expenses.add({ id: uid(), ...payload });
      toast(expense?.id ? "Gasto actualizado." : "Gasto registrado.");
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo guardar el gasto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="modal-panel w-full max-w-sm rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">{expense?.id ? "Editar gasto" : "Nuevo gasto"}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <Field label="Concepto" required>
            <input className={inputCls} value={f.concept} onChange={(e) => setF({ ...f, concept: e.target.value })} placeholder="Ej. Alquiler del salón" />
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

export function StatsView() {
  const { students, payments, attendance, groups, tickets, expenses } = useAppData();
  const month = currentMonthKey();
  const [statsMonth, setStatsMonth] = useState(month);
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);

  const active = students.items.filter(isActive);
  const owing = active.filter(owesMonthlyFee);
  const paidThisMonth = owing.filter((s) =>
    payments.items.some((p) => p.studentId === s.id && p.type === "mensualidad" && p.month === month && p.confirmed !== false)
  );
  const collectionRate = owing.length ? Math.round((paidThisMonth.length / owing.length) * 100) : 100;

  const attendanceTotal = attendance.items.length;
  const attendancePresent = attendance.items.filter((a) => a.present).length;
  const attendanceRate = attendanceTotal ? Math.round((attendancePresent / attendanceTotal) * 100) : null;

  // Meses con algún dato (pagos, entradas o gastos) para elegir en el selector
  // — siempre incluye el mes actual aunque todavía no tenga nada.
  const availableMonths = useMemo(() => {
    const set = new Set([month]);
    payments.items.forEach((p) => p.date && set.add(p.date.slice(0, 7)));
    tickets.items.forEach((t) => t.date && set.add(t.date.slice(0, 7)));
    expenses.items.forEach((e) => e.date && set.add(e.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [payments.items, tickets.items, expenses.items, month]);

  const isAllMonths = statsMonth === "all";
  const inSelectedMonth = (dateStr) => isAllMonths || dateStr?.startsWith(statsMonth);

  const periodPayments = payments.items.filter((p) => p.confirmed !== false && inSelectedMonth(p.date));
  const periodTickets = tickets.items.filter((t) => t.confirmed !== false && inSelectedMonth(t.date));
  const collectedByType = {
    mensualidad: periodPayments.filter((p) => p.type === "mensualidad").reduce((s, p) => s + p.amount, 0),
    inscripcion: periodPayments.filter((p) => p.type === "inscripcion").reduce((s, p) => s + p.amount, 0),
    clase: periodPayments.filter((p) => p.type === "clase").reduce((s, p) => s + p.amount, 0),
    cuota_participacion: periodPayments.filter((p) => p.type === "cuota_participacion").reduce((s, p) => s + p.amount, 0),
    extra: periodPayments.filter((p) => p.type === "extra").reduce((s, p) => s + p.amount, 0),
  };
  const ticketRevenue = periodTickets.reduce((s, t) => s + (t.price || 0), 0);
  const collectedThisPeriod = Object.values(collectedByType).reduce((a, b) => a + b, 0) + ticketRevenue;

  const periodExpenses = expenses.items.filter((e) => inSelectedMonth(e.date)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const expensesTotal = periodExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netThisPeriod = collectedThisPeriod - expensesTotal;

  const allTimeRevenue =
    payments.items.filter((p) => p.confirmed !== false).reduce((s, p) => s + p.amount, 0) +
    tickets.items.filter((t) => t.confirmed !== false).reduce((s, t) => s + (t.price || 0), 0);
  const allTimeExpenses = expenses.items.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const scholarshipCounts = {
    none: active.filter((s) => !s.scholarshipType || s.scholarshipType === "none").length,
    partial: active.filter((s) => s.scholarshipType === "partial").length,
    full: active.filter((s) => s.scholarshipType === "full").length,
  };

  const byGroup = groups.items.map((g) => {
    const inGroup = active.filter((s) => s.group === g.id);
    const revenue = inGroup.reduce((s, st) => s + effectivePrice(st, groups.items), 0);
    return { ...g, count: inGroup.length, revenue };
  });
  const totalExpectedIncome = byGroup.reduce((s, g) => s + g.revenue, 0);

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    await expenses.remove(deletingExpense.id);
    setDeletingExpense(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="font-display text-2xl text-ink">Estadísticas</h1>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Cobro del mes" value={`${collectionRate}%`} />
        <Stat label="Asistencia" value={attendanceRate === null ? "—" : `${attendanceRate}%`} />
        <Stat label="Estudiantes activos" value={active.length} />
      </div>

      <select className="field-input sm:w-56" value={statsMonth} onChange={(e) => setStatsMonth(e.target.value)}>
        <option value="all">Todos los meses</option>
        {availableMonths.map((m) => (
          <option key={m} value={m}>{monthLabel(m)}</option>
        ))}
      </select>

      <div>
        <h2 className="font-display mb-3 text-lg text-ink">Cobrado {isAllMonths ? "en total" : `en ${monthLabel(statsMonth)}`}</h2>
        <div className="card space-y-3 p-4">
          <p className="font-display text-3xl text-ink">{usd(collectedThisPeriod)}</p>
          <div className="divide-y divide-line-soft border-t border-line-soft">
            {Object.entries(PAYMENT_TYPE_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="t13 text-muted">{label}</span>
                <span className="t13 font-medium text-ink">{usd(collectedByType[key])}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="t13 text-muted">Entradas vendidas</span>
              <span className="t13 font-medium text-ink">{usd(ticketRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Gastos {isAllMonths ? "en total" : `en ${monthLabel(statsMonth)}`}</h2>
          <button onClick={() => setCreatingExpense(true)} className="btn btn-ghost">
            <Plus size={15} /> Nuevo gasto
          </button>
        </div>
        <div className="space-y-2">
          {periodExpenses.map((e) => (
            <div key={e.id} className="card flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="t13 text-ink">{e.concept}</p>
                <p className="t11 text-muted">{e.date}{e.notes ? ` · ${e.notes}` : ""}</p>
              </div>
              <span className="t13 font-medium text-wine">{usd(e.amount)}</span>
              <button onClick={() => setEditingExpense(e)} className="rounded-lg p-1.5 text-muted hover:bg-line hover:text-ink"><Pencil size={15} /></button>
              <button onClick={() => setDeletingExpense(e)} className="rounded-lg p-1.5 text-wine hover:bg-wine/10"><Trash2 size={15} /></button>
            </div>
          ))}
          {periodExpenses.length === 0 && (
            <p className="t13 rounded-xl bg-cream-dim p-4 text-center text-muted">Sin gastos registrados {isAllMonths ? "" : "este mes"}.</p>
          )}
          {periodExpenses.length > 0 && (
            <div className="card flex items-center justify-between border-l-4 border-l-wine p-3">
              <span className="t13 font-semibold text-ink">Total de gastos</span>
              <span className="font-display text-lg text-ink">{usd(expensesTotal)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={`card flex items-center justify-between border-l-4 p-4 ${netThisPeriod >= 0 ? "border-l-teal" : "border-l-wine"}`}>
        <div>
          <p className="t11 uppercase tracking-wide text-muted">Resultado {isAllMonths ? "general" : `de ${monthLabel(statsMonth)}`}</p>
          <p className="t12 text-faint">{usd(collectedThisPeriod)} cobrado − {usd(expensesTotal)} de gastos</p>
        </div>
        <p className={`font-display text-2xl ${netThisPeriod >= 0 ? "text-teal-dark" : "text-wine"}`}>{usd(netThisPeriod)}</p>
      </div>

      <div>
        <h2 className="font-display mb-3 text-lg text-ink">Por grupo</h2>
        <div className="space-y-2">
          {byGroup.map((g) => (
            <div key={g.id} className="card flex items-center gap-3 p-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: g.color }} />
              <span className="t13 flex-1 text-ink">{g.name}</span>
              <span className="t12 text-muted">{g.count} estudiantes</span>
              <span className="t13 font-medium text-ink">{usd(g.revenue)}/mes</span>
            </div>
          ))}
          <div className="card flex items-center justify-between border-l-4 border-l-teal p-3">
            <span className="t13 font-semibold text-ink">Total de ingreso esperado</span>
            <span className="font-display text-lg text-ink">{usd(totalExpectedIncome)}/mes</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display mb-3 text-lg text-ink">Becas</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Sin beca" value={scholarshipCounts.none} />
          <Stat label="Parcial" value={scholarshipCounts.partial} />
          <Stat label="Completa" value={scholarshipCounts.full} />
        </div>
      </div>

      <div>
        <h2 className="font-display mb-3 text-lg text-ink">En general</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Recaudado" value={usd(allTimeRevenue)} />
          <Stat label="Gastos" value={usd(allTimeExpenses)} />
          <Stat label="Neto" value={usd(allTimeRevenue - allTimeExpenses)} tone={allTimeRevenue - allTimeExpenses >= 0 ? "positive" : "negative"} />
        </div>
      </div>

      {(creatingExpense || editingExpense) && (
        <ExpenseFormModal
          expense={editingExpense}
          onClose={() => { setCreatingExpense(false); setEditingExpense(null); }}
        />
      )}
      {deletingExpense && (
        <ConfirmDialog
          title="Eliminar gasto"
          message={`Se eliminará "${deletingExpense.concept}" (${usd(deletingExpense.amount)}). Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          destructive
          onConfirm={handleDeleteExpense}
          onCancel={() => setDeletingExpense(null)}
        />
      )}
    </div>
  );
}
