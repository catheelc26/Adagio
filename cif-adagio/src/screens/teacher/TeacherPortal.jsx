import { useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, ClipboardList, LogOut, StickyNote, Trash2 } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { GROUPS, WEEKDAYS, groupById } from "../../lib/constants";
import { isActive } from "../../lib/business";
import { inputCls } from "../../components/ui";
import { PushToggle } from "../../components/PushToggle";

const TABS = [
  { id: "trials", label: "Pruebas", icon: CalendarCheck },
  { id: "attendance", label: "Asistencia", icon: CheckCircle2 },
  { id: "notes", label: "Notas", icon: StickyNote },
  { id: "tasks", label: "Tareas", icon: ClipboardList },
];

export function TeacherPortal({ teacherName, onLogout }) {
  const [tab, setTab] = useState("attendance");

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-cream/95 px-5 py-3 backdrop-blur">
        <div>
          <p className="font-display text-lg leading-none text-ink">Hola, {teacherName}</p>
          <p className="t10 uppercase tracking-widest text-faint">Portal de maestros</p>
        </div>
        <div className="flex items-center gap-1">
          <PushToggle role="teacher" />
          <button onClick={onLogout} className="flex items-center gap-1.5 t12 text-muted hover:text-wine">
            <LogOut size={15} /> Salir
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-6 pb-24">
        {tab === "trials" && <TrialsTab />}
        {tab === "attendance" && <AttendanceTab teacherName={teacherName} />}
        {tab === "notes" && <NotesTab teacherName={teacherName} />}
        {tab === "tasks" && <TasksTab teacherName={teacherName} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-1 flex-col items-center gap-1 py-2.5 t10 font-medium ${tab === t.id ? "text-teal" : "text-faint"}`}>
              <t.icon size={19} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function TrialsTab() {
  const { trialBookings } = useAppData();
  const upcoming = trialBookings.items
    .filter((b) => b.status === "pendiente")
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div className="space-y-2">
      <h2 className="font-display mb-2 text-xl text-ink">Próximas clases de prueba</h2>
      {upcoming.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-4 text-muted">Sin clases de prueba próximas.</p>}
      {upcoming.map((b) => {
        const g = groupById(b.group);
        return (
          <div key={b.id} className="card p-3">
            <p className="t13 font-medium text-ink">{b.fullName} · {g?.name}</p>
            <p className="t11 text-muted">{WEEKDAYS[b.weekday]} {b.startTime}–{b.endTime} · {b.date}</p>
          </div>
        );
      })}
    </div>
  );
}

function AttendanceTab({ teacherName }) {
  const { students, attendance } = useAppData();
  const [group, setGroup] = useState(GROUPS[0].id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const groupStudents = students.items.filter((s) => s.group === group && isActive(s));
  const existingForDay = (studentId) => attendance.items.find((a) => a.group === group && a.date === date && a.studentId === studentId);

  const recentDates = Array.from(
    new Set(attendance.items.filter((a) => a.group === group).map((a) => a.date))
  ).sort().reverse().slice(0, 5);

  const mark = async (studentId, present) => {
    const existing = existingForDay(studentId);
    if (existing) await attendance.update(existing.id, { present });
    else await attendance.add({ group, date, studentId, present, teacherName, createdAt: new Date().toISOString() });
  };

  const markAllPresent = async () => {
    for (const s of groupStudents) await mark(s.id, true);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-ink">Asistencia</h2>
      <div className="grid grid-cols-2 gap-3">
        <select className={inputCls} value={group} onChange={(e) => setGroup(e.target.value)}>
          {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {recentDates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recentDates.map((d) => (
            <button key={d} onClick={() => setDate(d)} className={`t11 rounded-full px-3 py-1 ${d === date ? "bg-ink text-cream" : "bg-cream-dim text-muted"}`}>
              {d}
            </button>
          ))}
        </div>
      )}
      <button onClick={markAllPresent} className="btn btn-ghost w-full">Marcar todos presentes</button>
      <div className="space-y-2">
        {groupStudents.map((s) => {
          const rec = existingForDay(s.id);
          return (
            <div key={s.id} className="card flex items-center gap-3 p-3">
              <p className="t13 flex-1 text-ink">{s.fullName}</p>
              <button onClick={() => mark(s.id, true)} className={`t12 rounded-lg px-3 py-1.5 font-medium ${rec?.present === true ? "bg-teal text-white" : "bg-cream-dim text-muted"}`}>
                Presente
              </button>
              <button onClick={() => mark(s.id, false)} className={`t12 rounded-lg px-3 py-1.5 font-medium ${rec?.present === false ? "bg-wine text-white" : "bg-cream-dim text-muted"}`}>
                Ausente
              </button>
            </div>
          );
        })}
        {groupStudents.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-4 text-muted">Sin estudiantes activos en este grupo.</p>}
      </div>
    </div>
  );
}

function NotesTab({ teacherName }) {
  const { teacherNotes } = useAppData();
  const [group, setGroup] = useState(GROUPS[0].id);
  const [text, setText] = useState("");

  const notes = useMemo(
    () => teacherNotes.items.filter((n) => n.group === group).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [teacherNotes.items, group]
  );

  const save = async () => {
    if (!text.trim()) return;
    await teacherNotes.add({
      group,
      text: text.trim(),
      teacherName,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    });
    setText("");
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-ink">Notas del día</h2>
      <select className={inputCls} value={group} onChange={(e) => setGroup(e.target.value)}>
        {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <textarea rows={3} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe una nota…" />
      <button onClick={save} className="btn btn-primary w-full">Guardar nota</button>
      <div className="space-y-2">
        {notes.map((n) => (
          <div key={n.id} className="card flex items-start gap-3 p-3">
            <div className="flex-1">
              <p className="t13 text-ink">{n.text}</p>
              <p className="t11 text-muted">{n.date} · {n.teacherName}</p>
            </div>
            <button onClick={() => teacherNotes.remove(n.id)} className="rounded-lg p-1.5 text-wine hover:bg-wine/10"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksTab({ teacherName }) {
  const { tasks } = useAppData();
  const [group, setGroup] = useState(GROUPS[0].id);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const groupTasks = useMemo(
    () => tasks.items.filter((t) => t.group === group).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [tasks.items, group]
  );

  const save = async () => {
    if (!description.trim()) return;
    await tasks.add({
      group,
      description: description.trim(),
      dueDate: dueDate || null,
      teacherName,
      createdAt: new Date().toISOString(),
    });
    setDescription("");
    setDueDate("");
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-ink">Tareas</h2>
      <select className={inputCls} value={group} onChange={(e) => setGroup(e.target.value)}>
        {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <textarea rows={2} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción de la tarea…" />
      <input type="date" className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <button onClick={save} className="btn btn-primary w-full">Asignar tarea</button>
      <div className="space-y-2">
        {groupTasks.map((t) => (
          <div key={t.id} className="card flex items-start gap-3 p-3">
            <div className="flex-1">
              <p className="t13 text-ink">{t.description}</p>
              <p className="t11 text-muted">{t.dueDate ? `Para ${t.dueDate} · ` : ""}{t.teacherName}</p>
            </div>
            <button onClick={() => tasks.remove(t.id)} className="rounded-lg p-1.5 text-wine hover:bg-wine/10"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
