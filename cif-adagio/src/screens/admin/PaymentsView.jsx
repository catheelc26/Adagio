import { useMemo, useState } from "react";
import { CheckCircle2, FileSpreadsheet, Image as ImageIcon, Plus, Receipt, Trash2 } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { paymentMethodInfo } from "../../lib/constants";
import { currentMonthKey, monthLabel, usd } from "../../lib/format";
import { exportPaymentsAnalysisToExcel } from "../../lib/exportExcel";
import { ActionMenu, ConfirmDialog, MenuItem } from "../../components/ui";
import { PaymentForm } from "../../components/PaymentForm";
import { ReceiptModal } from "../../components/ReceiptModal";
import { ProofViewer } from "../../components/ProofViewer";

export function PaymentsView() {
  const { payments, students, toast } = useAppData();
  const [month, setMonth] = useState(currentMonthKey());
  const [creating, setCreating] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [proofId, setProofId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const months = useMemo(() => {
    const set = new Set(payments.items.map((p) => p.date?.slice(0, 7)).filter(Boolean));
    set.add(currentMonthKey());
    return Array.from(set).sort().reverse();
  }, [payments.items]);

  const filtered = payments.items
    .filter((p) => (month === "all" ? true : p.date?.startsWith(month)))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = filtered.filter((p) => p.confirmed !== false).reduce((s, p) => s + p.amount, 0);

  const confirmPayment = async (p) => {
    await payments.update(p.id, { confirmed: true });
    toast("Pago confirmado.");
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
        <div className="flex gap-2">
          <button onClick={() => exportPaymentsAnalysisToExcel(students.items, payments.items)} className="btn btn-ghost">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={() => setCreating(true)} className="btn btn-primary">
            <Plus size={15} /> Nuevo
          </button>
        </div>
      </div>

      <select className="field-input sm:w-56" value={month} onChange={(e) => setMonth(e.target.value)}>
        <option value="all">Todos los meses</option>
        {months.map((m) => (
          <option key={m} value={m}>{monthLabel(m)}</option>
        ))}
      </select>

      <div className="space-y-2">
        {filtered.map((p) => {
          const student = students.items.find((s) => s.id === p.studentId);
          return (
            <div key={p.id} className="card flex items-center gap-3 p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="t13 font-medium text-ink">{student?.fullName || "Estudiante eliminado"}</p>
                  {p.confirmed === false && <span className="t10 rounded-full bg-bronze/15 px-2 py-0.5 font-medium text-bronze-dark">Por confirmar</span>}
                </div>
                <p className="t11 text-muted">
                  {p.concept}{p.month ? ` · ${monthLabel(p.month)}` : ""} · {p.date} · {paymentMethodInfo(p.method).label}
                </p>
              </div>
              <span className="t13 font-medium text-ink">{usd(p.amount)}</span>
              <ActionMenu>
                {p.confirmed === false && <MenuItem icon={<CheckCircle2 size={15} />} label="Confirmar" onClick={() => confirmPayment(p)} />}
                <MenuItem icon={<Receipt size={15} />} label="Ver recibo" onClick={() => setReceiptId(p.transactionId || p.id)} />
                {p.hasProof && <MenuItem icon={<ImageIcon size={15} />} label="Ver comprobante" onClick={() => setProofId(p.transactionId || p.id)} />}
                <MenuItem icon={<Trash2 size={15} />} label="Eliminar" danger onClick={() => setDeleting(p)} />
              </ActionMenu>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-6 text-center text-muted">No hay pagos este mes.</p>}
      </div>

      {creating && <PaymentForm isAdmin onClose={() => setCreating(false)} />}
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
