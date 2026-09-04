import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { GROUPS } from "../../lib/constants";
import { Field, inputCls } from "../../components/ui";

export function AnnouncementsView() {
  const { announcements, toast } = useAppData();
  const [text, setText] = useState("");
  const [group, setGroup] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const sorted = announcements.items.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const publish = async () => {
    if (!text.trim()) return;
    await announcements.add({
      text: text.trim(),
      group: group || null,
      expiresAt: expiresAt || null,
      createdAt: new Date().toISOString(),
    });
    setText("");
    setGroup("");
    setExpiresAt("");
    toast("Aviso publicado.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="font-display text-2xl text-ink">Avisos</h1>

      <div className="card space-y-4 p-4">
        <Field label="Nuevo aviso">
          <textarea rows={3} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe el aviso para los representantes…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Grupo (opcional)">
            <select className={inputCls} value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="">Todos los grupos</option>
              {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
          <Field label="Expira (opcional)">
            <input type="date" className={inputCls} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </Field>
        </div>
        <button onClick={publish} className="btn btn-primary">
          <Plus size={15} /> Publicar
        </button>
      </div>

      <div className="space-y-2">
        {sorted.map((a) => {
          const g = a.group ? GROUPS.find((g) => g.id === a.group) : null;
          return (
            <div key={a.id} className="card flex items-start gap-3 p-3">
              <div className="flex-1">
                <p className="t13 text-ink">{a.text}</p>
                <p className="t11 mt-1 text-muted">
                  {g ? g.name : "Todos los grupos"}{a.expiresAt ? ` · expira ${a.expiresAt}` : ""}
                </p>
              </div>
              <button onClick={() => announcements.remove(a.id)} className="rounded-lg p-2 text-wine hover:bg-wine/10">
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-6 text-center text-muted">Sin avisos publicados.</p>}
      </div>
    </div>
  );
}
