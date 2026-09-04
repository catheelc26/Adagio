import { MessageCircle, Trash2 } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { groupById, WEEKDAYS } from "../../lib/constants";
import { waLink } from "../../lib/format";
import { ActionMenu, Chip, MenuItem } from "../../components/ui";

const STATUS_LABEL = { pendiente: "Pendiente", completado: "Completado", cancelado: "Cancelado" };
const STATUS_COLOR = { pendiente: "#B8935B", completado: "#2F7F92", cancelado: "#9CA5BC" };

export function TrialBookingsView() {
  const { trialBookings, toast } = useAppData();
  const sorted = trialBookings.items.slice().sort((a, b) => (a.date < b.date ? -1 : 1));

  const setStatus = async (b, status) => {
    await trialBookings.update(b.id, { status });
    toast("Actualizado.");
  };

  const notifyText = (b) => {
    const g = groupById(b.group);
    return `Hola ${b.fullName}, te escribimos de CIF Adagio sobre tu clase de prueba de ${g?.name} el ${b.date} (${b.startTime}). Hubo un pequeño cambio, ¿tienes un momento para coordinar?`;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Clases de prueba</h1>
        <p className="t13 text-muted">{sorted.length} solicitudes</p>
      </div>

      <div className="space-y-2">
        {sorted.map((b) => {
          const g = groupById(b.group);
          return (
            <div key={b.id} className="card flex items-center gap-3 p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="t13 font-medium text-ink">{b.fullName}</p>
                  <Chip color={STATUS_COLOR[b.status]}>{STATUS_LABEL[b.status]}</Chip>
                </div>
                <p className="t11 text-muted">
                  {g?.name} · {WEEKDAYS[b.weekday]} {b.startTime}–{b.endTime} · {b.date} · {b.phone}
                </p>
                {b.notes && <p className="t11 mt-1 text-faint">{b.notes}</p>}
              </div>
              <a href={waLink(b.phone, notifyText(b))} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-teal hover:bg-teal/10">
                <MessageCircle size={16} />
              </a>
              <ActionMenu>
                {b.status !== "completado" && <MenuItem label="Marcar completado" onClick={() => setStatus(b, "completado")} />}
                {b.status !== "cancelado" && <MenuItem label="Marcar cancelado" onClick={() => setStatus(b, "cancelado")} />}
                {b.status !== "pendiente" && <MenuItem label="Volver a pendiente" onClick={() => setStatus(b, "pendiente")} />}
                <MenuItem icon={<Trash2 size={15} />} label="Eliminar" danger onClick={() => trialBookings.remove(b.id)} />
              </ActionMenu>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-6 text-center text-muted">Sin solicitudes de clase de prueba.</p>}
      </div>
    </div>
  );
}
