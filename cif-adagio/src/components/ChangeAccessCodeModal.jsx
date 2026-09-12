import { useState } from "react";
import { X } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { Field, inputCls } from "./ui";

/** Deja que un representante elija su propio código de acceso (en vez del generado al azar). */
export function ChangeAccessCodeModal({ student, onClose }) {
  const { students, toast } = useAppData();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) return setError("Usa al menos 4 caracteres.");
    const taken = students.items.some((s) => s.id !== student.id && (s.accessCode || "").toUpperCase() === trimmed);
    if (taken) return setError("Ese código ya lo está usando otra persona. Elige otro.");
    setSaving(true);
    try {
      await students.update(student.id, { accessCode: trimmed });
      toast("Código de acceso actualizado.");
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el código.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="modal-panel w-full max-w-sm rounded-2xl bg-cream p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">Cambiar código de acceso</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <p className="t13 mb-4 text-muted">
          Tu código actual es <strong className="text-ink">{student.accessCode}</strong>. Elige uno nuevo y fácil de
          recordar — lo necesitarás para entrar la próxima vez. Administración siempre puede verlo si se te olvida.
        </p>
        <Field label="Nuevo código">
          <input
            className={`${inputCls} text-center tracking-[0.2em]`}
            maxLength={20}
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ej. MIFAMILIA"
          />
        </Field>
        {error && <p className="t11 mt-2 text-wine">{error}</p>}
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
