import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { GROUPS, WEEKDAYS } from "../lib/constants";
import { nextDatesForWeekday } from "../lib/business";
import { useAppData } from "../lib/AppDataContext";
import { notifyPush } from "../lib/push";
import { Field, inputCls } from "../components/ui";
import { Barre } from "../components/Decor";

const STEPS = ["Grupo", "Horario", "Datos", "Listo"];
const EASE_OUT = [0.23, 1, 0.32, 1];
const stepMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: EASE_OUT },
};

export function TrialBookingFlow() {
  const { schedule, trialBookings, toast } = useAppData();
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState(null);
  const [slot, setSlot] = useState(null);
  const [date, setDate] = useState(null);
  const [form, setForm] = useState({ fullName: "", age: "", phone: "", email: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const slotsForGroup = schedule.items.filter((s) => s.group === group?.id);
  const upcomingDates = slot ? nextDatesForWeekday(slot.weekday) : [];

  const chooseGroup = (g) => {
    setGroup(g);
    setSlot(null);
    setDate(null);
    setStep(1);
  };
  const chooseSlot = (s) => {
    setSlot(s);
    setDate(null);
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Requerido";
    if (!(Number(form.age) > 0)) e.age = "Requerido";
    if (!form.phone.trim()) e.phone = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validateStep3()) return;
    setSaving(true);
    try {
      await trialBookings.add({
        fullName: form.fullName.trim(),
        age: Number(form.age),
        phone: form.phone.trim(),
        email: form.email.trim(),
        notes: form.notes.trim(),
        group: group.id,
        weekday: slot.weekday,
        startTime: slot.startTime,
        endTime: slot.endTime,
        date,
        status: "pendiente",
        createdAt: new Date().toISOString(),
      });
      setStep(3);
      notifyPush({
        target: { role: "admin" },
        title: "Nueva clase de prueba",
        body: `${form.fullName.trim()} agendó ${group.name}, ${WEEKDAYS[slot.weekday]} ${slot.startTime}.`,
        url: "/admin",
      });
    } catch {
      toast("No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} /> Inicio
        </Link>
        <span className="t11 uppercase tracking-widest text-faint">Clase de prueba</span>
      </div>

      {step < 3 && (
        <div className="mb-8 flex items-center gap-2">
          {STEPS.slice(0, 3).map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full t12 font-semibold ${i <= step ? "bg-ink text-cream" : "bg-cream-dim text-faint"}`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`h-px flex-1 ${i < step ? "bg-ink" : "bg-line"}`} />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
      {step === 0 && (
        <motion.div key="step-0" {...stepMotion}>
          <h1 className="font-display mb-1 text-2xl text-ink">Elige un grupo</h1>
          <p className="t13 mb-6 text-muted">Selecciona la clase a la que te gustaría asistir de prueba.</p>
          <div className="grid grid-cols-2 gap-3">
            {GROUPS.map((g) => (
              <button key={g.id} onClick={() => chooseGroup(g)} className="card flex flex-col items-start gap-2 p-4 text-left transition hover:shadow-lift">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: g.color }} />
                <span className="t13 font-semibold text-ink">{g.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 1 && group && (
        <motion.div key="step-1" {...stepMotion}>
          <h1 className="font-display mb-1 text-2xl text-ink">Horario de {group.name}</h1>
          {slotsForGroup.length === 0 ? (
            <p className="t13 mt-4 rounded-xl bg-cream-dim p-4 text-muted">
              Aún no hay horarios configurados para este grupo. Contáctanos directamente para coordinar tu clase de prueba.
            </p>
          ) : (
            <>
              <p className="t13 mb-4 text-muted">Elige el día y horario que prefieras.</p>
              <div className="space-y-2">
                {slotsForGroup.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => chooseSlot(s)}
                    className={`card flex w-full items-center justify-between p-4 text-left ${slot?.id === s.id ? "ring-2 ring-teal" : ""}`}
                  >
                    <span className="t13 font-medium text-ink">{WEEKDAYS[s.weekday]}</span>
                    <span className="t13 text-muted">{s.startTime} – {s.endTime}</span>
                  </button>
                ))}
              </div>
              {slot && (
                <div className="mt-6">
                  <p className="t12 mb-2 font-medium text-muted">Próximas fechas disponibles</p>
                  <div className="grid grid-cols-2 gap-2">
                    {upcomingDates.map((d) => (
                      <button key={d} onClick={() => setDate(d)} className={`card p-3 text-center t13 ${date === d ? "ring-2 ring-teal" : ""}`}>
                        {new Date(d + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button disabled={!date} onClick={() => setStep(2)} className="btn btn-primary mt-6 w-full">
                Continuar <ChevronRight size={16} />
              </button>
            </>
          )}
        </motion.div>
      )}

      {step === 2 && (
        <motion.div key="step-2" {...stepMotion}>
          <h1 className="font-display mb-1 text-2xl text-ink">Tus datos</h1>
          <p className="t13 mb-6 text-muted">
            {group.name} · {WEEKDAYS[slot.weekday]} {slot.startTime}–{slot.endTime} ·{" "}
            {date && new Date(date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
          </p>
          <div className="space-y-4">
            <Field label="Nombre completo" required>
              <input className={inputCls} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              {errors.fullName && <p className="t11 mt-1 text-wine">{errors.fullName}</p>}
            </Field>
            <Field label="Edad" required>
              <input type="number" className={inputCls} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              {errors.age && <p className="t11 mt-1 text-wine">{errors.age}</p>}
            </Field>
            <Field label="Teléfono" required>
              <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {errors.phone && <p className="t11 mt-1 text-wine">{errors.phone}</p>}
            </Field>
            <Field label="Correo">
              <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="¿Algo que debamos saber?">
              <textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
          <button disabled={saving} onClick={submit} className="btn btn-primary mt-6 w-full">
            {saving ? "Enviando…" : "Confirmar clase de prueba"}
          </button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div key="step-3" {...stepMotion} className="flex flex-col items-center pt-4 text-center">
          <div className="relative mb-5 h-40 w-full overflow-hidden rounded-[24px] shadow-lift">
            <img src="/photos-web/group-smile.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(43,50,56,0.35)" }}>
              <CheckCircle2 size={44} className="text-white" />
            </div>
          </div>
          <h1 className="font-display mb-2 text-2xl text-ink">¡Todo listo!</h1>
          <p className="t13 mb-2 max-w-xs text-muted">
            Tu clase de prueba de <strong className="text-ink">{group.name}</strong> quedó reservada para el{" "}
            {new Date(date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}, {slot.startTime}.
          </p>
          <Barre className="my-4 max-w-[160px]" />
          <p className="t12 mb-6 max-w-xs text-faint">Si necesitas cambiar algo, contáctanos directamente. ¡Te esperamos!</p>
          <Link to="/" className="btn btn-ghost">
            Volver al inicio
          </Link>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
