import { useState } from "react";
import { UserPlus, Users, X } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { studentDisplayName, uid } from "../lib/format";
import { StudentAvatar } from "./ui";
import { StudentForm } from "./StudentForm";

/**
 * Botón discreto (pensado para ir junto a la campanita de notificaciones) que
 * deja a un representante registrar a otro estudiante de su familia (hermanos,
 * u otro hijo en otro grupo) directamente desde aquí, y cambiar entre ellos sin
 * tener que cerrar sesión y volver a escribir ningún código.
 */
export function FamilyMenu({ student, onSwitchStudent }) {
  const { students, toast } = useAppData();
  const [open, setOpen] = useState(false);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [pendingFamilyId, setPendingFamilyId] = useState(null);
  const [preparing, setPreparing] = useState(false);

  const familyMembers = student.familyId
    ? students.items.filter((s) => s.familyId === student.familyId && s.id !== student.id)
    : [];

  const openNewMemberForm = async () => {
    setPreparing(true);
    try {
      let familyId = student.familyId;
      if (!familyId) {
        familyId = uid();
        await students.update(student.id, { familyId });
      }
      setPendingFamilyId(familyId);
      setOpen(false);
      setShowNewMemberForm(true);
    } catch {
      toast("No se pudo preparar el registro familiar. Intenta de nuevo.");
    } finally {
      setPreparing(false);
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
          <div className="modal-panel max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">Familia</h3>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <p className="t12 mb-4 text-muted">
              Si tienes más hijos o familiares en la escuela, regístralos aquí para ver y cambiar entre ellos sin
              cerrar sesión.
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

            <button onClick={openNewMemberForm} disabled={preparing} className="btn btn-teal w-full">
              <UserPlus size={15} /> Registrar otro estudiante de la familia
            </button>
          </div>
        </div>
      )}

      {showNewMemberForm && (
        <StudentForm
          isAdmin={false}
          extraFields={{ familyId: pendingFamilyId }}
          onClose={() => setShowNewMemberForm(false)}
          onSaved={() => {
            setShowNewMemberForm(false);
            toast("Nuevo estudiante de la familia registrado.");
          }}
        />
      )}
    </>
  );
}
