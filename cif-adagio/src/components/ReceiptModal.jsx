import { Printer, X } from "lucide-react";
import { groupById, paymentMethodInfo } from "../lib/constants";
import { bs, monthLabel, usd } from "../lib/format";
import { Barre } from "./Decor";

export function ReceiptModal({ transactionId, payments, students, onClose }) {
  const items = payments.filter((p) => (p.transactionId || p.id) === transactionId);
  const first = items[0];
  const student = students.find((s) => s.id === first?.studentId);
  const g = student ? groupById(student.group) : null;
  const total = items.reduce((s, p) => s + p.amount, 0);
  const totalVES = items.reduce((s, p) => s + (p.amountVES || 0), 0);

  if (!first) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div className="w-full max-w-sm rounded-2xl bg-paper p-6 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="t13 text-muted">No se encontró información de este pago.</p>
          <button onClick={onClose} className="btn btn-ghost mt-4">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-paper shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="no-print sticky top-0 flex items-center justify-between border-b border-line bg-paper px-5 pb-3 pt-5">
          <h3 className="font-display text-lg text-ink">Recibo de pago</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="printable-receipt p-6">
          <div className="mb-4 text-center">
            <p className="font-display text-lg text-ink">CIF Adagio</p>
            <p className="t12 text-muted">Ballet Clásico</p>
          </div>
          <Barre className="mb-4" />
          <div className="t13 mb-4 space-y-1 text-ink">
            <p><span className="text-muted">Estudiante:</span> {student?.fullName || "—"}</p>
            <p><span className="text-muted">Grupo:</span> {g?.name || "—"}</p>
            <p><span className="text-muted">Fecha:</span> {first.date}</p>
            <p><span className="text-muted">Método:</span> {paymentMethodInfo(first.method).label}</p>
            {first.reference && <p><span className="text-muted">Referencia:</span> {first.reference}</p>}
          </div>
          <div className="mb-4 divide-y divide-line-soft border-y border-line-soft">
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 t13">
                <span className="text-ink">{p.concept}{p.month ? ` — ${monthLabel(p.month)}` : ""}</span>
                <span className="font-medium text-ink">{usd(p.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display text-base text-ink">Total</span>
            <span className="font-display text-lg text-ink">{usd(total)}</span>
          </div>
          {first.currency === "VES" && (
            <p className="t12 mt-1 text-right text-muted">
              {bs(totalVES)} · tasa {first.rateUsed}
            </p>
          )}
        </div>

        <div className="no-print border-t border-line p-4">
          <button onClick={() => window.print()} className="btn btn-primary w-full">
            <Printer size={15} /> Guardar como PDF
          </button>
        </div>
      </div>
    </div>
  );
}
