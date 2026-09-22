import { useState } from "react";
import { X } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { monthIsSettled } from "../lib/business";
import { currentMonthKey, monthLabel, studentDisplayName, uid } from "../lib/format";
import { Field, inputCls } from "./ui";

/**
 * Exonera la mensualidad de un mes puntual (ayuda económica, becas de un solo
 * mes, situaciones especiales) sin registrar ningún cobro — administración
 * únicamente. El mes queda marcado como resuelto en todas las vistas de
 * pagos pendientes, con el motivo guardado para referencia futura.
 */
export function ExemptMonthModal({ student: fixedStudent, monthOptions, onClose }) {
  const { students, payments, groups, toast } = useAppData();
  const [studentId, setStudentId] = useState(fixedStudent?.id || "");
  const student = fixedStudent || students.items.find((s) => s.id === studentId);
  const [month, setMonth] = useState(monthOptions?.[0] || currentMonthKey());
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!student) return setError("Selecciona un estudiante.");
    if (!month) return setError("Selecciona el mes a exonerar.");
    if (!reason.trim()) return setError("Escribe el motivo de la exoneración.");
    if (monthIsSettled(payments.items, student, month, groups.items)) {
      return setError(`${monthLabel(month)} ya tiene un pago o exoneración registrada.`);
    }
    setSaving(true);
    try {
      await payments.add({
        id: uid(),
        transactionId: uid(),
        studentId: student.id,
        type: "exoneracion",
        concept: reason.trim(),
        amount: 0,
        currency: "USD",
        amountVES: null,
        rateUsed: null,
        month,
        date: new Date().toISOString().slice(0, 10),
        method: null,
        reference: null,
        hasProof: false,
        confirmed: true,
        reportedBy: "admin",
      });
      toast(`${monthLabel(month)} exonerado para ${studentDisplayName(student)}.`);
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo registrar la exoneración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="modal-panel w-full max-w-sm rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">Exonerar mes</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {!fixedStudent && (
            <Field label="Estudiante" required>
              <select className={inputCls} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Selecciona…</option>
                {students.items.map((s) => (
                  <option key={s.id} value={s.id}>{studentDisplayName(s)}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Mes a exonerar" required>
            {monthOptions?.length ? (
              <select className={inputCls} value={month} onChange={(e) => setMonth(e.target.value)}>
                {monthOptions.map((m) => (
                  <option key={m} value={m}>{monthLabel(m)}</option>
                ))}
              </select>
            ) : (
              <input type="month" className={inputCls} value={month} onChange={(e) => setMonth(e.target.value)} />
            )}
          </Field>

          <Field label="Motivo" required>
            <textarea
              rows={3}
              className={inputCls}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Ayuda económica, situación familiar…"
            />
          </Field>

          <p className="t11 text-muted">
            Este mes quedará marcado como resuelto{student ? ` para ${studentDisplayName(student)}` : ""}, sin registrar ningún cobro.
          </p>
        </div>

        {error && <p className="t13 mt-3 text-wine">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button onClick={submit} disabled={saving} className="btn btn-primary flex-1">
            {saving ? "Guardando…" : "Exonerar"}
          </button>
        </div>
      </div>
    </div>
  );
}
