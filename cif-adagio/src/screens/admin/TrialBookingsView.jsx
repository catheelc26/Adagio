import { useState } from "react";
import { CalendarClock, MessageCircle, Trash2, X } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { groupById, WEEKDAYS } from "../../lib/constants";
import { trialStatus, weekdayIndexForDate } from "../../lib/business";
import { trialContactText, waLink } from "../../lib/format";
import { ActionMenu, Chip, Field, inputCls, MenuItem } from "../../components/ui";

const STATUS_LABEL = { pendiente: "Pendiente", realizada: "Realizada", cancelado: "Cancelada" };
const STATUS_COLOR = { pendiente: "var(--color-bronze)", realizada: "var(--color-teal)", cancelado: "var(--color-faint)" };

function RescheduleModal({ booking, onClose }) {
  const { trialBookings, toast } = useAppData();
  const [date, setDate] = useState(booking.date);
  const [startTime, setStartTime] = useState(booking.startTime);
  const [endTime, setEndTime] = useState(booking.endTime);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!date || !startTime || !endTime) return setError("Completa fecha y horario.");
    setSaving(true);
    try {
      await trialBookings.update(booking.id, { date, startTime, endTime, weekday: weekdayIndexForDate(date) });
      toast("Clase de prueba reprogramada.");
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo reprogramar la clase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="modal-panel w-full max-w-sm rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">Reprogramar clase de prueba</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <p className="t13 mb-4 text-muted">{booking.fullName}</p>
        <div className="space-y-4">
          <Field label="Nueva fecha" required>
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hora inicio" required>
              <input type="time" className={inputCls} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </Field>
            <Field label="Hora fin" required>
              <input type="time" className={inputCls} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </Field>
          </div>
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

export function TrialBookingsView() {
  const { trialBookings, groups, toast } = useAppData();
  const sorted = trialBookings.items.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const [rescheduling, setRescheduling] = useState(null);

  const setCancelled = async (b, cancelled) => {
    await trialBookings.update(b.id, { status: cancelled ? "cancelado" : "pendiente" });
    toast(cancelled ? "Marcada como cancelada." : "Reactivada.");
  };

  const setAttended = async (b, attended) => {
    await trialBookings.update(b.id, { attended });
    toast("Actualizado.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Clases de prueba</h1>
        <p className="t13 text-muted">{sorted.length} solicitudes</p>
      </div>

      <div className="space-y-2">
        {sorted.map((b) => {
          const g = groupById(groups.items, b.group);
          const st = trialStatus(b);
          return (
            <div key={b.id} className="card flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="t13 font-medium text-ink">{b.fullName}</p>
                  <Chip color={STATUS_COLOR[st]}>{STATUS_LABEL[st]}</Chip>
                </div>
                <p className="t11 text-muted">
                  {g?.name} · {WEEKDAYS[b.weekday]} {b.startTime}–{b.endTime} · {b.date} · {b.phone}
                </p>
                {b.notes && <p className="t11 mt-1 text-faint">{b.notes}</p>}
              </div>
              {st === "realizada" && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => setAttended(b, true)}
                    className={`t12 rounded-lg px-2.5 py-1.5 font-medium ${b.attended === true ? "bg-teal text-white" : "bg-cream-dim text-muted"}`}
                  >
                    Vino
                  </button>
                  <button
                    onClick={() => setAttended(b, false)}
                    className={`t12 rounded-lg px-2.5 py-1.5 font-medium ${b.attended === false ? "bg-wine text-white" : "bg-cream-dim text-muted"}`}
                  >
                    No vino
                  </button>
                </div>
              )}
              <a href={waLink(b.phone, trialContactText(b, g?.name || ""))} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg p-2 text-teal hover:bg-teal/10" title="Contactar por WhatsApp">
                <MessageCircle size={16} />
              </a>
              <ActionMenu>
                <MenuItem icon={<CalendarClock size={15} />} label="Reprogramar" onClick={() => setRescheduling(b)} />
                {st !== "cancelado" && <MenuItem label="Marcar cancelada" onClick={() => setCancelled(b, true)} />}
                {st === "cancelado" && <MenuItem label="Reactivar" onClick={() => setCancelled(b, false)} />}
                <MenuItem icon={<Trash2 size={15} />} label="Eliminar" danger onClick={() => trialBookings.remove(b.id)} />
              </ActionMenu>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-6 text-center text-muted">Sin solicitudes de clase de prueba.</p>}
      </div>

      {rescheduling && <RescheduleModal booking={rescheduling} onClose={() => setRescheduling(null)} />}
    </div>
  );
}
