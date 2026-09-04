import { useState } from "react";
import { X } from "lucide-react";
import { groupById, MONTH_NAMES } from "../lib/constants";
import { effectivePrice, owesMonthlyFee } from "../lib/business";
import { usd } from "../lib/format";
import { useAppData } from "../lib/AppDataContext";
import { ReceiptModal } from "./ReceiptModal";

export function StudentAccountModal({ student, onClose }) {
  const { payments, attendance, students } = useAppData();
  const [receiptId, setReceiptId] = useState(null);

  const studentPayments = payments.items
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const confirmed = studentPayments.filter((p) => p.confirmed !== false);
  const allTimeTotal = confirmed.reduce((s, p) => s + p.amount, 0);
  const now = new Date();
  const year = now.getFullYear();
  const yearTotal = confirmed.filter((p) => p.date?.startsWith(String(year))).reduce((s, p) => s + p.amount, 0);
  const owes = owesMonthlyFee(student);
  const currentMonthIdx = now.getMonth();

  const monthCells = Array.from({ length: 12 }, (_, i) => {
    const key = `${year}-${String(i + 1).padStart(2, "0")}`;
    const paid = confirmed.some((p) => p.type === "mensualidad" && p.month === key);
    let status = "future";
    if (!owes) status = "notOwed";
    else if (paid) status = "paid";
    else if (i <= currentMonthIdx) status = "pending";
    return { key, label: MONTH_NAMES[i].slice(0, 3), status };
  });

  const studentAttendance = attendance.items
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const attendanceRate = studentAttendance.length
    ? Math.round((studentAttendance.filter((a) => a.present).length / studentAttendance.length) * 100)
    : null;

  const transactionIds = Array.from(new Set(studentPayments.map((p) => p.transactionId || p.id)));

  const statusColor = {
    paid: "bg-teal text-white",
    pending: "bg-wine text-white",
    notOwed: "bg-cream-dim text-faint",
    future: "bg-cream-dim text-faint",
  };

  const g = groupById(student.group);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="modal-panel max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-cream shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream px-5 pb-3 pt-5">
          <div>
            <h3 className="font-display text-lg text-ink">{student.fullName}</h3>
            <p className="t12 text-muted">{g?.name} · {usd(effectivePrice(student))}/mes</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-3 text-center">
              <p className="t10 uppercase text-faint">Histórico</p>
              <p className="font-display text-lg text-ink">{usd(allTimeTotal)}</p>
            </div>
            <div className="card p-3 text-center">
              <p className="t10 uppercase text-faint">{year}</p>
              <p className="font-display text-lg text-ink">{usd(yearTotal)}</p>
            </div>
            <div className="card p-3 text-center">
              <p className="t10 uppercase text-faint">Asistencia</p>
              <p className="font-display text-lg text-ink">{attendanceRate === null ? "—" : `${attendanceRate}%`}</p>
            </div>
          </div>

          <div>
            <p className="t11 mb-2 font-semibold uppercase tracking-wide text-bronze-dark">Estado de mensualidades {year}</p>
            <div className="grid grid-cols-6 gap-1.5">
              {monthCells.map((m) => (
                <div key={m.key} className={`t11 rounded-lg py-2 text-center font-medium ${statusColor[m.status]}`}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {studentAttendance.length > 0 && (
            <div>
              <p className="t11 mb-2 font-semibold uppercase tracking-wide text-bronze-dark">Últimas asistencias</p>
              <div className="flex flex-wrap gap-1.5">
                {studentAttendance.slice(0, 10).map((a) => (
                  <span key={a.id} className={`t11 rounded-full px-2.5 py-1 ${a.present ? "bg-teal/15 text-teal-dark" : "bg-wine/10 text-wine"}`}>
                    {a.date}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="t11 mb-2 font-semibold uppercase tracking-wide text-bronze-dark">Transacciones</p>
            <div className="space-y-2">
              {transactionIds.length === 0 && <p className="t13 text-muted">Sin pagos registrados.</p>}
              {transactionIds.map((tid) => {
                const first = studentPayments.find((p) => (p.transactionId || p.id) === tid);
                const sum = studentPayments.filter((p) => (p.transactionId || p.id) === tid).reduce((s, p) => s + p.amount, 0);
                return (
                  <button key={tid} onClick={() => setReceiptId(tid)} className="card flex w-full items-center justify-between p-3 text-left">
                    <span className="t13 text-ink">{first.date} · {first.concept}{first.confirmed === false ? " (por confirmar)" : ""}</span>
                    <span className="t13 font-medium text-ink">{usd(sum)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {receiptId && (
        <ReceiptModal transactionId={receiptId} payments={payments.items} students={students.items} onClose={() => setReceiptId(null)} />
      )}
    </div>
  );
}
