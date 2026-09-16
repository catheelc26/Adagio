import { useState } from "react";
import { Users, X } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { studentDisplayName, uid } from "../lib/format";
import { StudentAvatar } from "./ui";

/**
 * Botón discreto (pensado para ir junto a la campanita de notificaciones) que
 * deja a un representante vincular a otros estudiantes de la familia (hermanos,
 * u otro hijo en otro grupo) usando su código de acceso, y cambiar entre ellos
 * sin tener que cerrar sesión y volver a escribir el código cada vez.
 */
export function FamilyMenu({ student, onSwitchStudent }) {
  const { students, toast } = useAppData();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [linking, setLinking] = useState(false);

  const familyMembers = student.familyId
    ? students.items.filter((s) => s.familyId === student.familyId && s.id !== student.id)
    : [];

  const linkMember = async () => {
    setError("");
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return setError("Ingresa el código de acceso del familiar.");
    const target = students.items.find((s) => (s.accessCode || "").toUpperCase() === trimmed);
    if (!target) return setError("Código no encontrado. Verifica que esté bien escrito.");
    if (target.id === student.id) return setError("Ese es el código de este mismo estudiante.");
    if (student.familyId && target.familyId === student.familyId) return setError("Ya está vinculado a esta familia.");
    setLinking(true);
    try {
      const familyId = student.familyId || target.familyId || uid();
      const currentFamily = students.items.filter((s) => student.familyId && s.familyId === student.familyId);
      const targetFamily = students.items.filter((s) => target.familyId && s.familyId === target.familyId);
      const ids = new Set([student.id, target.id, ...currentFamily.map((s) => s.id), ...targetFamily.map((s) => s.id)]);
      for (const id of ids) await students.update(id, { familyId });
      toast(`${studentDisplayName(target)} fue vinculado a la familia.`);
      setCode("");
    } catch (err) {
      setError(err.message || "No se pudo vincular.");
    } finally {
      setLinking(false);
    }
  };

  const unlink = async (member) => {
    await students.update(member.id, { familyId: null });
    toast(`${studentDisplayName(member)} fue desvinculado.`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Familia"
        className="rounded-full p-2 text-faint hover:bg-cream-dim hover:text-ink"
      >
        <Users size={16} />
      </button>

      {open && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="modal-panel w-full max-w-sm rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">Familia</h3>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <p className="t12 mb-4 text-muted">
              Si tienes más hijos o familiares inscritos en la escuela, vincúlalos aquí para ver y cambiar entre
              ellos sin cerrar sesión.
            </p>

            {familyMembers.length > 0 && (
              <div className="mb-4 space-y-2">
                {familyMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl bg-cream-dim p-2.5">
                    <StudentAvatar student={m} size={36} />
                    <p className="t13 flex-1 truncate font-medium text-ink">{studentDisplayName(m)}</p>
                    <button
                      onClick={() => { onSwitchStudent(m.id); setOpen(false); }}
                      className="t12 rounded-lg bg-teal px-3 py-1.5 font-medium text-white"
                    >
                      Ver
                    </button>
                    <button onClick={() => unlink(m)} className="t11 text-wine underline underline-offset-2">
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border-t border-line-soft pt-4">
              <p className="t11 font-medium uppercase tracking-wide text-muted">Vincular otro estudiante</p>
              <input
                className="field-input text-center tracking-[0.2em]"
                placeholder="Código de acceso"
                maxLength={20}
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && linkMember()}
              />
              {error && <p className="t11 text-wine">{error}</p>}
              <button onClick={linkMember} disabled={linking} className="btn btn-teal w-full">
                {linking ? "Vinculando…" : "Vincular"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
