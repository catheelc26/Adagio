import { useState } from "react";
import { X } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { monthIsSettled } from "../lib/business";
import { currentMonthKey, monthLabel, studentDisplayName } from "../lib/format";
import { Field, inputCls } from "./ui";

/**
 * Corrige un pago ya registrado — típicamente porque un representante se
 * equivocó de mes al reportarlo (ej. pagó octubre pero quedó registrado
 * como septiembre). Deja editar concepto, monto, mes (si es mensualidad),
 * fecha y referencia; el tipo y método de pago no se tocan aquí.
 */
export function EditPaymentModal({ payment, onClose }) {
  const { payments, students, groups, toast } = useAppData();
  const student = students.items.find((s) => s.id === payment.studentId);

  const [concept, setConcept] = useState(payment.concept || "");
  const [amount, setAmount] = useState(String(payment.amount ?? ""));
  const [month, setMonth] = useState(payment.month || currentMonthKey());
  const [date, setDate] = useState(payment.date || "");
  const [reference, setReference] = useState(payment.reference || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isMensualidad = payment.type === "mensualidad";
  const isExoneracion = payment.type === "exoneracion";

  // Si el nuevo mes elegido ya está resuelto por OTRO pago (sin contar este
  // mismo, que se está moviendo), avisamos — pero no bloqueamos, puede ser
  // justo la corrección que hace falta.
  const monthChanged = isMensualidad && month !== payment.month;
  const otherPayments = payments.items.filter((p) => p.id !== payment.id);
  const targetMonthAlreadySettled =
    monthChanged && student ? monthIsSettled(otherPayments, student, month, groups.items) : false;

  const submit = async () => {
    setError("");
    if (!concept.trim()) return setError("Escribe un concepto.");
    if (!isExoneracion && !(Number(amount) > 0)) return setError("Ingresa un monto válido.");
    if (isMensualidad && !month) return setError("Selecciona el mes que cubre.");
    if (!date) return setError("Selecciona la fecha.");

    setSaving(true);
    try {
      const patch = {
        concept: concept.trim(),
        date,
        reference: reference.trim() || null,
      };
      if (isMensualidad) patch.month = month;
      if (!isExoneracion) {
        const newAmount = Number(amount);
        patch.amount = newAmount;
        if (payment.currency === "VES" && payment.rateUsed) {
          patch.amountVES = Math.round(newAmount * payment.rateUsed * 100) / 100;
        }
      }
      await payments.update(payment.id, patch);
      toast("Pago corregido.");
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo corregir el pago.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="modal-panel w-full max-w-sm rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">Corregir pago</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        {student && <p className="t13 mb-4 text-muted">{studentDisplayName(student)}</p>}

        <div className="space-y-4">
          <Field label="Concepto" required>
            <input className={inputCls} value={concept} onChange={(e) => setConcept(e.target.value)} />
          </Field>

          {isMensualidad && (
            <Field label="Mes que cubre" required>
              <input type="month" className={inputCls} value={month} onChange={(e) => setMonth(e.target.value)} />
              {monthChanged && (
                <p className="t11 mt-1.5 text-bronze-dark">
                  Se moverá de {monthLabel(payment.month)} a {monthLabel(month)}.
                  {targetMonthAlreadySettled && ` Ojo: ${monthLabel(month)} ya tiene otro pago que lo cubre para este estudiante.`}
                </p>
              )}
            </Field>
          )}

          {!isExoneracion && (
            <Field label="Monto ($)" required>
              <input type="number" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
              {payment.currency === "VES" && payment.rateUsed > 0 && (
                <p className="t11 mt-1 text-muted">
                  Equivalente en bolívares: Bs. {(Number(amount || 0) * payment.rateUsed).toFixed(2)} (tasa {payment.rateUsed})
                </p>
              )}
            </Field>
          )}

          <Field label="Fecha" required>
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>

          <Field label="Referencia">
            <input className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>

          {!isExoneracion && (
            <p className="t11 text-faint">Método de pago: {payment.method || "—"} (no se puede cambiar aquí).</p>
          )}
        </div>

        {error && <p className="t13 mt-3 text-wine">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button onClick={submit} disabled={saving} className="btn btn-primary flex-1">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
