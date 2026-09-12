import { useState } from "react";
import { Camera, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { PAYMENT_METHODS, WEEKDAYS, slugifyGroupId } from "../../lib/constants";
import { compressImage } from "../../lib/image";
import { Field, inputCls } from "../../components/ui";

const emptyGroupForm = () => ({ name: "", price: "", classPrice: "", pairPrice: "", color: "#3D7A6E", requiresInscription: true });

export function SettingsView() {
  const { settings, schedule, rateHistory, groups, students, toast } = useAppData();
  const s = settings.value;

  const [rateInput, setRateInput] = useState(String(s.officialRate || ""));
  const [feeInput, setFeeInput] = useState(String(s.inscriptionFee ?? 15));
  const [teacherPinInput, setTeacherPinInput] = useState(s.teacherPin || "");
  const [newSlot, setNewSlot] = useState({ group: groups.items[0]?.id || "", weekday: 0, startTime: "16:00", endTime: "17:00" });
  const [editingGroup, setEditingGroup] = useState(null); // grupo existente, o {} para uno nuevo
  const [groupForm, setGroupForm] = useState(emptyGroupForm());

  const saveRate = async () => {
    const rate = Number(rateInput);
    if (!(rate > 0)) return toast("Ingresa una tasa válida.");
    const today = new Date().toISOString().slice(0, 10);
    await settings.save({ officialRate: rate, rateDate: today });
    const existing = rateHistory.items.find((r) => r.date === today);
    if (existing) await rateHistory.update(existing.id, { rate });
    else await rateHistory.add({ date: today, rate });
    toast("Tasa actualizada.");
  };

  const saveFee = async () => {
    await settings.save({ inscriptionFee: Number(feeInput) || 0 });
    toast("Cuota de inscripción actualizada.");
  };

  const saveTeacherPin = async () => {
    await settings.save({ teacherPin: teacherPinInput.trim() });
    toast("PIN de maestros actualizado.");
  };

  const updatePaymentDetail = async (methodId, text) => {
    await settings.save({ paymentDetails: { ...(s.paymentDetails || {}), [methodId]: text } });
  };

  const handleStudioPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 500, 0.75);
    await settings.save({ studioPhoto: compressed });
    toast("Foto de portada actualizada.");
  };

  const addSlot = async () => {
    await schedule.add(newSlot);
    toast("Horario agregado.");
  };

  const openNewGroup = () => {
    setGroupForm(emptyGroupForm());
    setEditingGroup({});
  };
  const openEditGroup = (g) => {
    setGroupForm({
      name: g.name, price: String(g.price ?? ""), classPrice: String(g.classPrice ?? ""),
      pairPrice: String(g.pairPrice ?? ""), color: g.color || "#3D7A6E", requiresInscription: g.requiresInscription !== false,
    });
    setEditingGroup(g);
  };

  const saveGroup = async () => {
    if (!groupForm.name.trim()) return toast("Ponle un nombre al grupo.");
    if (!(Number(groupForm.price) >= 0)) return toast("Ingresa un precio de mensualidad válido.");
    const payload = {
      name: groupForm.name.trim(),
      price: Number(groupForm.price) || 0,
      classPrice: groupForm.classPrice ? Number(groupForm.classPrice) : undefined,
      pairPrice: groupForm.pairPrice ? Number(groupForm.pairPrice) : undefined,
      color: groupForm.color,
      requiresInscription: groupForm.requiresInscription,
    };
    if (editingGroup?.id) {
      await groups.update(editingGroup.id, payload);
      toast("Grupo actualizado.");
    } else {
      const id = slugifyGroupId(groupForm.name, groups.items.map((g) => g.id));
      await groups.add({ id, ...payload });
      toast("Grupo agregado.");
    }
    setEditingGroup(null);
  };

  const deleteGroup = async (g) => {
    const inUse = students.items.some((st) => st.group === g.id);
    if (inUse) return toast("No puedes eliminar un grupo con estudiantes asignados. Cámbialos de grupo primero.");
    await groups.remove(g.id);
    toast("Grupo eliminado.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-6">
      <h1 className="font-display text-2xl text-ink">Ajustes</h1>

      <section className="card space-y-3 p-4">
        <h2 className="t12 font-semibold uppercase tracking-wide text-bronze-dark">Foto de portada</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-cream-dim">
            {s.studioPhoto ? <img src={s.studioPhoto} alt="" className="h-full w-full object-cover" /> : <Camera size={20} className="text-faint" />}
          </div>
          <label className="btn btn-ghost cursor-pointer">
            Cambiar foto
            <input type="file" accept="image/*" className="hidden" onChange={handleStudioPhoto} />
          </label>
        </div>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="t12 font-semibold uppercase tracking-wide text-bronze-dark">Tasa oficial (Bs. por $1)</h2>
        <div className="flex gap-2">
          <input type="number" className={inputCls} value={rateInput} onChange={(e) => setRateInput(e.target.value)} />
          <button onClick={saveRate} className="btn btn-teal whitespace-nowrap">Guardar</button>
        </div>
        {s.rateDate && <p className="t11 text-muted">Última actualización: {s.rateDate}</p>}
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="t12 font-semibold uppercase tracking-wide text-bronze-dark">Cuota de inscripción anual ($)</h2>
        <div className="flex gap-2">
          <input type="number" className={inputCls} value={feeInput} onChange={(e) => setFeeInput(e.target.value)} />
          <button onClick={saveFee} className="btn btn-teal whitespace-nowrap">Guardar</button>
        </div>
        <p className="t11 text-muted">No aplica a los grupos marcados como "sin inscripción" (ver Grupos y precios abajo).</p>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="t12 font-semibold uppercase tracking-wide text-bronze-dark">PIN de maestros</h2>
        <div className="flex gap-2">
          <input className={inputCls} value={teacherPinInput} onChange={(e) => setTeacherPinInput(e.target.value)} placeholder="PIN compartido" />
          <button onClick={saveTeacherPin} className="btn btn-teal whitespace-nowrap">Guardar</button>
        </div>
      </section>

      <section className="card space-y-4 p-4">
        <h2 className="t12 font-semibold uppercase tracking-wide text-bronze-dark">Datos de pago por método</h2>
        {PAYMENT_METHODS.map((m) => (
          <Field key={m.id} label={m.label}>
            <textarea
              rows={2}
              className={inputCls}
              value={(s.paymentDetails || {})[m.id] || ""}
              onChange={(e) => updatePaymentDetail(m.id, e.target.value)}
              placeholder="Datos bancarios / instrucciones para este método"
            />
          </Field>
        ))}
      </section>

      <section className="card space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="t12 font-semibold uppercase tracking-wide text-bronze-dark">Grupos y precios</h2>
          <button onClick={openNewGroup} className="btn btn-ghost">
            <Plus size={15} /> Nuevo grupo
          </button>
        </div>
        <div className="space-y-2">
          {groups.items.map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-lg bg-cream-dim p-2.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: g.color }} />
              <div className="flex-1">
                <p className="t13 text-ink">{g.name}</p>
                <p className="t11 text-muted">
                  ${g.price}/mes{g.classPrice ? ` · $${g.classPrice}/clase` : ""}{g.pairPrice ? ` · $${g.pairPrice} en pareja` : ""}
                  {g.requiresInscription === false ? " · sin inscripción" : ""}
                </p>
              </div>
              <button onClick={() => openEditGroup(g)} className="rounded-lg p-1.5 text-muted hover:bg-line hover:text-ink"><Pencil size={15} /></button>
              <button onClick={() => deleteGroup(g)} className="rounded-lg p-1.5 text-wine hover:bg-wine/10"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-4 p-4">
        <h2 className="t12 font-semibold uppercase tracking-wide text-bronze-dark">Horario semanal de clases</h2>
        <div className="space-y-2">
          {schedule.items.map((slot) => {
            const g = groups.items.find((g) => g.id === slot.group);
            return (
              <div key={slot.id} className="flex items-center gap-3 rounded-lg bg-cream-dim p-2.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g?.color }} />
                <span className="t13 flex-1 text-ink">{g?.name} · {WEEKDAYS[slot.weekday]} {slot.startTime}–{slot.endTime}</span>
                <button onClick={() => schedule.remove(slot.id)} className="text-wine hover:opacity-70"><Trash2 size={15} /></button>
              </div>
            );
          })}
          {schedule.items.length === 0 && <p className="t13 text-muted">Aún no hay horarios configurados.</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <select className={inputCls} value={newSlot.group} onChange={(e) => setNewSlot({ ...newSlot, group: e.target.value })}>
            {groups.items.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select className={inputCls} value={newSlot.weekday} onChange={(e) => setNewSlot({ ...newSlot, weekday: Number(e.target.value) })}>
            {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
          <input type="time" className={inputCls} value={newSlot.startTime} onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })} />
          <input type="time" className={inputCls} value={newSlot.endTime} onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })} />
        </div>
        <button onClick={addSlot} className="btn btn-ghost">
          <Plus size={15} /> Agregar horario
        </button>
      </section>

      {editingGroup && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="modal-panel w-full max-w-md rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">{editingGroup.id ? "Editar grupo" : "Nuevo grupo"}</h3>
              <button onClick={() => setEditingGroup(null)} className="text-muted hover:text-ink"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Field label="Nombre" required>
                <input className={inputCls} value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="Ej. Hip Hop juvenil" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Mensualidad ($)" required>
                  <input type="number" className={inputCls} value={groupForm.price} onChange={(e) => setGroupForm({ ...groupForm, price: e.target.value })} />
                </Field>
                <Field label="Color">
                  <input type="color" className={`${inputCls} h-10 p-1`} value={groupForm.color} onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })} />
                </Field>
                <Field label="Precio por clase suelta (opcional)">
                  <input type="number" className={inputCls} value={groupForm.classPrice} onChange={(e) => setGroupForm({ ...groupForm, classPrice: e.target.value })} />
                </Field>
                <Field label="Precio en pareja (opcional)">
                  <input type="number" className={inputCls} value={groupForm.pairPrice} onChange={(e) => setGroupForm({ ...groupForm, pairPrice: e.target.value })} />
                </Field>
              </div>
              <label className="t13 flex items-center gap-2 text-ink">
                <input type="checkbox" checked={groupForm.requiresInscription} onChange={(e) => setGroupForm({ ...groupForm, requiresInscription: e.target.checked })} />
                Cobra inscripción anual
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setEditingGroup(null)} className="btn btn-ghost flex-1">Cancelar</button>
              <button onClick={saveGroup} className="btn btn-primary flex-1">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
