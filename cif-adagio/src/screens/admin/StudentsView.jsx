import { useMemo, useState } from "react";
import { FileSpreadsheet, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { GROUPS, groupById } from "../../lib/constants";
import { effectivePrice, isActive } from "../../lib/business";
import { usd } from "../../lib/format";
import { exportStudentsToExcel } from "../../lib/exportExcel";
import { COLLECTIONS, deleteImage } from "../../lib/db";
import { ActionMenu, Chip, ConfirmDialog, MenuItem, StudentAvatar } from "../../components/ui";
import { StudentForm } from "../../components/StudentForm";
import { StudentAccountModal } from "../../components/StudentAccountModal";

export function StudentsView() {
  const { students, toast } = useAppData();
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    return students.items
      .filter((s) => (groupFilter === "all" ? true : s.group === groupFilter))
      .filter((s) => (statusFilter === "all" ? true : statusFilter === "active" ? isActive(s) : !isActive(s)))
      .filter((s) => s.fullName?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [students.items, search, groupFilter, statusFilter]);

  const confirmRegistration = async (s) => {
    await students.update(s.id, { pendingReview: false });
    toast("Registro confirmado.");
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await students.remove(deleting.id);
      if (deleting.hasPhoto) await deleteImage(COLLECTIONS.studentPhotos, deleting.id).catch(() => {});
      toast("Estudiante eliminado.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Estudiantes</h1>
          <p className="t13 text-muted">{filtered.length} de {students.items.length}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportStudentsToExcel(filtered)} className="btn btn-ghost">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={() => setCreating(true)} className="btn btn-primary">
            <Plus size={15} /> Nuevo
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input className="field-input pl-9" placeholder="Buscar por nombre…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="field-input sm:w-48" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
          <option value="all">Todos los grupos</option>
          {GROUPS.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <select className="field-input sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="all">Todos</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((s) => {
          const g = groupById(s.group);
          return (
            <div key={s.id} className="card flex items-center gap-3 p-3">
              <button className="flex flex-1 items-center gap-3 text-left" onClick={() => setViewing(s)}>
                <StudentAvatar student={s} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="t13 truncate font-medium text-ink">{s.fullName}</p>
                    {s.pendingReview && <Chip color="#B8935B">Por revisar</Chip>}
                    {!isActive(s) && <Chip color="#9CA5BC">Inactivo</Chip>}
                  </div>
                  <p className="t11 text-muted">{g?.name}{s.level ? ` · ${s.level}` : ""} · {usd(effectivePrice(s))}</p>
                </div>
              </button>
              <ActionMenu>
                {s.pendingReview && <MenuItem icon={<ShieldCheck size={15} />} label="Confirmar registro" onClick={() => confirmRegistration(s)} />}
                <MenuItem icon={<Pencil size={15} />} label="Editar" onClick={() => setEditing(s)} />
                <MenuItem icon={<Trash2 size={15} />} label="Eliminar" danger onClick={() => setDeleting(s)} />
              </ActionMenu>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-6 text-center text-muted">No hay estudiantes que coincidan.</p>}
      </div>

      {(creating || editing) && (
        <StudentForm
          student={editing}
          isAdmin
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
      {viewing && <StudentAccountModal student={viewing} onClose={() => setViewing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Eliminar estudiante"
          message={`Esto eliminará a ${deleting.fullName} y no se puede deshacer. Los pagos asociados se conservarán.`}
          confirmLabel="Eliminar"
          destructive
          requireTyping="ELIMINAR"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
