import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { EVENT_TYPES, GROUPS, eventTypeInfo } from "../../lib/constants";
import { Field, inputCls } from "../../components/ui";

const emptyEvent = () => ({
  title: "",
  type: "ensayo",
  date: new Date().toISOString().slice(0, 10),
  startTime: "16:00",
  endTime: "17:00",
  group: "",
  notes: "",
});

export function CalendarEventsView() {
  const { events, toast } = useAppData();
  const [creating, setCreating] = useState(null);

  const sorted = events.items.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = sorted.filter((e) => e.date >= todayStr);
  const past = sorted.filter((e) => e.date < todayStr);

  const save = async () => {
    const payload = { ...creating, group: creating.group || null };
    if (!payload.title.trim()) return toast("El título es requerido.");
    await events.add(payload);
    setCreating(null);
    toast("Evento creado.");
  };

  const EventRow = ({ e }) => {
    const info = eventTypeInfo(e.type);
    const g = e.group ? GROUPS.find((g) => g.id === e.group) : null;
    return (
      <div className="card flex items-center gap-3 p-3">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: info.color }} />
        <div className="flex-1">
          <p className="t13 font-medium text-ink">{e.title}</p>
          <p className="t11 text-muted">
            {info.label} · {e.date} · {e.startTime}–{e.endTime} · {g ? g.name : "Todos los grupos"}
          </p>
        </div>
        <button onClick={() => events.remove(e.id)} className="rounded-lg p-2 text-wine hover:bg-wine/10">
          <Trash2 size={15} />
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Calendario</h1>
        <button onClick={() => setCreating(emptyEvent())} className="btn btn-primary">
          <Plus size={15} /> Nuevo evento
        </button>
      </div>

      <div>
        <h2 className="t12 mb-2 font-semibold uppercase tracking-wide text-bronze-dark">Próximos</h2>
        <div className="space-y-2">
          {upcoming.map((e) => <EventRow key={e.id} e={e} />)}
          {upcoming.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-4 text-muted">Sin eventos próximos.</p>}
        </div>
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="t12 mb-2 font-semibold uppercase tracking-wide text-faint">Pasados</h2>
          <div className="space-y-2 opacity-70">
            {past.map((e) => <EventRow key={e.id} e={e} />)}
          </div>
        </div>
      )}

      {creating && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="modal-panel w-full max-w-md rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">Nuevo evento</h3>
              <button onClick={() => setCreating(null)} className="text-muted hover:text-ink"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Field label="Título" required>
                <input className={inputCls} value={creating.title} onChange={(e) => setCreating({ ...creating, title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo">
                  <select className={inputCls} value={creating.type} onChange={(e) => setCreating({ ...creating, type: e.target.value })}>
                    {EVENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Grupo">
                  <select className={inputCls} value={creating.group} onChange={(e) => setCreating({ ...creating, group: e.target.value })}>
                    <option value="">Todos</option>
                    {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </Field>
                <Field label="Fecha">
                  <input type="date" className={inputCls} value={creating.date} onChange={(e) => setCreating({ ...creating, date: e.target.value })} />
                </Field>
                <div className="flex gap-2">
                  <Field label="Inicio">
                    <input type="time" className={inputCls} value={creating.startTime} onChange={(e) => setCreating({ ...creating, startTime: e.target.value })} />
                  </Field>
                  <Field label="Fin">
                    <input type="time" className={inputCls} value={creating.endTime} onChange={(e) => setCreating({ ...creating, endTime: e.target.value })} />
                  </Field>
                </div>
              </div>
              <Field label="Notas">
                <textarea rows={2} className={inputCls} value={creating.notes} onChange={(e) => setCreating({ ...creating, notes: e.target.value })} />
              </Field>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setCreating(null)} className="btn btn-ghost flex-1">Cancelar</button>
              <button onClick={save} className="btn btn-primary flex-1">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
