import { useMemo, useState } from "react";
import { CheckCircle2, FileSpreadsheet, HeartHandshake, Image as ImageIcon, Pencil, Plus, Receipt, Search, Trash2 } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { groupById, paymentMethodInfo } from "../../lib/constants";
import { currentMonthKey, monthLabel, studentDisplayName, usd } from "../../lib/format";
import { exportPaymentsAnalysisToExcel } from "../../lib/exportExcel";
import { ActionMenu, ConfirmDialog, MenuItem, StudentAvatar } from "../../components/ui";
import { PaymentForm } from "../../components/PaymentForm";
import { ExemptMonthModal } from "../../components/ExemptMonthModal";
import { EditPaymentModal } from "../../components/EditPaymentModal";
import { ReceiptModal } from "../../components/ReceiptModal";
import { ProofViewer } from "../../components/ProofViewer";

export function PaymentsView() {
  const { payments, students, groups, toast } = useAppData();
  const [month, setMonth] = useState(currentMonthKey());
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [exempting, setExempting] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [proofId, setProofId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);

  const months = useMemo(() => {
    const set = new Set(payments.items.map((p) => p.date?.slice(0, 7)).filter(Boolean));
    set.add(currentMonthKey());
    return Array.from(set).sort().reverse();
  }, [payments.items]);

  // Buscar por nombre, concepto o referencia — a propósito ignora el mes
  // elegido arriba y busca en TODO el historial, porque el objetivo es
  // encontrar un pago puntual (ej. una inscripción duplicada de otro año)
  // sin tener que ir cambiando de mes en mes para dar con él.
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = (
    normalizedSearch
      ? payments.items.filter((p) => {
          const student = students.items.find((s) => s.id === p.studentId);
          const haystack = [student ? studentDisplayName(student) : "", p.concept, p.reference]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedSearch);
        })
      : payments.items.filter((p) => (month === "all" ? true : p.date?.startsWith(month)))
  ).sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = filtered.filter((p) => p.confirmed !== false).reduce((s, p) => s + p.amount, 0);

  const confirmPayment = async (p) => {
    try {
      await payments.update(p.id, { confirmed: true });
      toast("Pago confirmado.");
    } catch (err) {
      toast(err.message || "No se pudo confirmar el pago. Intenta de nuevo.");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await payments.remove(deleting.id);
    setDeleting(null);
    toast("Pago eliminado.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Pagos</h1>
          <p className="t13 text-muted">Total confirmado: {usd(total)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportPaymentsAnalysisToExcel(students.items, payments.items, groups.items)} className="btn btn-ghost">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={() => setExempting(true)} className="btn btn-ghost">
            <HeartHandshake size={15} /> Exonerar mes
          </button>
          <button onClick={() => setCreating(true)} className="btn btn-primary">
            <Plus size={15} /> Nuevo
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            className="field-input pl-9"
            placeholder="Buscar por estudiante, concepto o referencia…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="field-input sm:w-56" value={month} onChange={(e) => setMonth(e.target.value)} disabled={Boolean(normalizedSearch)}>
          <option value="all">Todos los meses</option>
          {months.map((m) => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
      </div>
      {normalizedSearch && (
        <p className="t11 -mt-2 text-muted">
          Buscando en todo el historial, sin importar el mes elegido arriba — {filtered.length} resultado{filtered.length === 1 ? "" : "s"}.
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((p) => {
          const student = students.items.find((s) => s.id === p.studentId);
          const g = student ? groupById(groups.items, student.group) : null;
          return (
            <div key={p.id} className="card flex items-center gap-3 p-3">
              {student && <StudentAvatar student={student} size={36} />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="t13 font-medium text-ink">{student ? studentDisplayName(student) : "Estudiante eliminado"}</p>
                  {p.confirmed === false && <span className="t10 rounded-full bg-bronze/15 px-2 py-0.5 font-medium text-bronze-dark">Por confirmar</span>}
                  {p.type === "exoneracion" && <span className="t10 rounded-full bg-plum/15 px-2 py-0.5 font-medium text-plum">Exonerado</span>}
                </div>
                <p className="t11 text-muted">
                  {g?.name ? `${g.name} · ` : ""}{p.concept}{p.month ? ` · ${monthLabel(p.month)}` : ""} · {p.date}
                  {p.type !== "exoneracion" && ` · ${paymentMethodInfo(p.method).label}`}
                </p>
              </div>
              {p.type !== "exoneracion" && <span className="t13 font-medium text-ink">{usd(p.amount)}</span>}
              <ActionMenu>
                {p.confirmed === false && <MenuItem icon={<CheckCircle2 size={15} />} label="Confirmar" onClick={() => confirmPayment(p)} />}
                <MenuItem icon={<Pencil size={15} />} label="Corregir (mes, monto…)" onClick={() => setEditing(p)} />
                <MenuItem icon={<Receipt size={15} />} label="Ver recibo" onClick={() => setReceiptId(p.transactionId || p.id)} />
                {p.hasProof && <MenuItem icon={<ImageIcon size={15} />} label="Ver comprobante" onClick={() => setProofId(p.transactionId || p.id)} />}
                <MenuItem icon={<Trash2 size={15} />} label="Eliminar" danger onClick={() => setDeleting(p)} />
              </ActionMenu>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="t13 rounded-xl bg-cream-dim p-6 text-center text-muted">
            {normalizedSearch ? "No se encontró ningún pago con esa búsqueda." : "No hay pagos este mes."}
          </p>
        )}
      </div>

      {creating && <PaymentForm isAdmin onClose={() => setCreating(false)} />}
      {exempting && <ExemptMonthModal onClose={() => setExempting(false)} />}
      {editing && <EditPaymentModal payment={editing} onClose={() => setEditing(null)} />}
      {receiptId && <ReceiptModal transactionId={receiptId} payments={payments.items} students={students.items} onClose={() => setReceiptId(null)} />}
      {proofId && <ProofViewer transactionId={proofId} onClose={() => setProofId(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Eliminar pago"
          message="Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
