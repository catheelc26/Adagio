import { useState } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { GROUPS, PAYMENT_METHODS, WEEKDAYS } from "../../lib/constants";
import { compressImage } from "../../lib/image";
import { Field, inputCls } from "../../components/ui";

export function SettingsView() {
  const { settings, schedule, rateHistory, toast } = useAppData();
  const s = settings.value;

  const [rateInput, setRateInput] = useState(String(s.officialRate || ""));
  const [feeInput, setFeeInput] = useState(String(s.inscriptionFee ?? 15));
  const [teacherPinInput, setTeacherPinInput] = useState(s.teacherPin || "");
  const [newSlot, setNewSlot] = useState({ group: GROUPS[0].id, weekday: 0, startTime: "16:00", endTime: "17:00" });

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
        <p className="t11 text-muted">No aplica a Adultos ni Salsa.</p>
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
        <h2 className="t12 font-semibold uppercase tracking-wide text-bronze-dark">Horario semanal de clases</h2>
        <div className="space-y-2">
          {schedule.items.map((slot) => {
            const g = GROUPS.find((g) => g.id === slot.group);
            return (
              <div key={slot.id} className="flex items-center gap-3 rounded-lg bg-cream-dim p-2.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g?.color }} />
                <span className="t13 flex-1 text-ink">{g?.name} · {WEEKDAYS[slot.weekday]} {slot.startTime}–{slot.endTime}</span>
                <button onClick={() => schedule.remove(slot.id)} className="text-wine hover:opacity-70"><Trash2 size={15} /></button>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <select className={inputCls} value={newSlot.group} onChange={(e) => setNewSlot({ ...newSlot, group: e.target.value })}>
            {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
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
    </div>
  );
}
