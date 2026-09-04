import { useState } from "react";
import { X, Camera, Copy, CheckCircle2 } from "lucide-react";
import { GROUPS, WEEKDAYS, levelsForGroup } from "../lib/constants";
import { genAccessCode, uid } from "../lib/format";
import { compressImage } from "../lib/image";
import { COLLECTIONS, setImage } from "../lib/db";
import { useAppData } from "../lib/AppDataContext";
import { Field, inputCls } from "./ui";
import { ReglamentoModal } from "./ReglamentoModal";

const emptyStudent = () => ({
  fullName: "",
  age: "",
  group: GROUPS[0].id,
  level: "",
  phone: "",
  email: "",
  address: "",
  cedula: "",
  sex: "",
  birthDate: "",
  hasExperience: false,
  experienceWhere: "",
  health: "",
  surgery: "",
  medications: "",
  isMinor: false,
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelationship: "",
  emergencyPhone2: "",
  scheduleFrequency: "",
  photoVideoConsent: "",
  termsAccepted: false,
  salsaModality: "individual",
  salsaPartnerName: "",
  billingMode: "mensual",
  status: "active",
  scholarshipType: "none",
  scholarshipDiscount: "",
  paymentSchedule: "mensual",
  adminNotes: "",
  hasPhoto: false,
});

/**
 * Crear/editar estudiante. En modo admin (isAdmin) expone campos internos
 * (beca, estado, notas). En modo autorregistro (representante) exige
 * aceptar el reglamento y al guardar genera el código de acceso.
 */
export function StudentForm({ student, isAdmin, onClose, onSaved }) {
  const { students, schedule, toast } = useAppData();
  const [f, setF] = useState(() => (student ? { ...emptyStudent(), ...student } : emptyStudent()));
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showReglamento, setShowReglamento] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (patch) => setF((prev) => ({ ...prev, ...patch }));
  const slotsForGroup = schedule.items.filter((s) => s.group === f.group);
  const levels = levelsForGroup(f.group);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 400, 0.75);
    setPhotoPreview(compressed);
  };

  const validate = () => {
    const e = {};
    if (!f.fullName.trim()) e.fullName = "Requerido";
    if (!(Number(f.age) > 0)) e.age = "Requerido";
    if (!f.phone.trim()) e.phone = "Requerido";
    if (!f.emergencyName.trim()) e.emergencyName = "Requerido";
    if (!f.emergencyPhone.trim()) e.emergencyPhone = "Requerido";
    if (f.isMinor) {
      if (!f.guardianName.trim()) e.guardianName = "Requerido";
      if (!f.guardianPhone.trim()) e.guardianPhone = "Requerido";
    }
    if (f.photoVideoConsent !== "si" && f.photoVideoConsent !== "no") e.photoVideoConsent = "Elige una opción";
    if (!isAdmin && !f.termsAccepted) e.termsAccepted = "Debes aceptar el reglamento";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const level = levels.some((l) => l.id === f.level) ? f.level : "";
      const payload = {
        ...f,
        age: Number(f.age),
        level,
        scholarshipDiscount: f.scholarshipType === "partial" ? Number(f.scholarshipDiscount) || 0 : 0,
      };

      let id = student?.id;
      if (id) {
        await students.update(id, payload);
      } else {
        id = uid();
        const accessCode = genAccessCode();
        const extra = !isAdmin ? { pendingReview: true, source: "representante" } : {};
        await students.add({ ...payload, id, accessCode, hasPhoto: Boolean(photoPreview), ...extra });
        setCreatedCode(accessCode);
      }

      if (photoPreview) {
        await setImage(COLLECTIONS.studentPhotos, id, photoPreview);
        if (student?.id) await students.update(id, { hasPhoto: true });
      }

      if (student?.id) {
        onSaved?.(id);
        onClose();
      }
      // si es un estudiante nuevo, se muestra la pantalla de código antes de cerrar
    } catch (err) {
      toast(err.message || "No se pudo guardar el estudiante.");
    } finally {
      setSaving(false);
    }
  };

  if (createdCode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-paper p-6 text-center shadow-2xl">
          <CheckCircle2 size={44} className="mx-auto mb-3 text-teal" />
          <h3 className="font-display mb-1 text-xl text-ink">¡Registro guardado!</h3>
          <p className="t13 mb-4 text-muted">Este es el código de acceso al portal. Guárdalo, lo necesitarás para entrar.</p>
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-cream-dim py-3">
            <span className="font-display text-2xl tracking-[0.3em] text-ink">{createdCode}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(createdCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-lg p-1.5 text-muted hover:bg-line hover:text-ink"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={() => {
              onSaved?.(student?.id);
              onClose();
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-cream shadow-2xl sm:max-w-xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream px-5 pb-3 pt-5">
          <h3 className="font-display text-lg text-ink">{student ? "Editar estudiante" : "Nuevo estudiante"}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-cream-dim">
                {photoPreview ? <img src={photoPreview} alt="" className="h-full w-full object-cover" /> : <Camera size={22} className="text-faint" />}
              </div>
              <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-ink p-1.5 text-cream">
                <Camera size={12} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
            <p className="t12 text-muted">Foto del estudiante (opcional)</p>
          </div>

          <section className="space-y-4">
            <h4 className="t11 font-semibold uppercase tracking-wide text-bronze-dark">Datos básicos</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Nombre completo" required>
                  <input className={inputCls} value={f.fullName} onChange={(e) => set({ fullName: e.target.value })} />
                  {errors.fullName && <p className="t11 mt-1 text-wine">{errors.fullName}</p>}
                </Field>
              </div>
              <Field label="Edad" required>
                <input type="number" className={inputCls} value={f.age} onChange={(e) => set({ age: e.target.value })} />
                {errors.age && <p className="t11 mt-1 text-wine">{errors.age}</p>}
              </Field>
              <Field label="Sexo">
                <select className={inputCls} value={f.sex} onChange={(e) => set({ sex: e.target.value })}>
                  <option value="">—</option>
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                </select>
              </Field>
              <Field label="Cédula">
                <input className={inputCls} value={f.cedula} onChange={(e) => set({ cedula: e.target.value })} placeholder="V-00000000" />
              </Field>
              <Field label="Fecha de nacimiento">
                <input type="date" className={inputCls} value={f.birthDate} onChange={(e) => set({ birthDate: e.target.value })} />
              </Field>
              <Field label="Teléfono" required>
                <input className={inputCls} value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
                {errors.phone && <p className="t11 mt-1 text-wine">{errors.phone}</p>}
              </Field>
              <Field label="Correo">
                <input type="email" className={inputCls} value={f.email} onChange={(e) => set({ email: e.target.value })} />
              </Field>
              <div className="col-span-2">
                <Field label="Dirección">
                  <input className={inputCls} value={f.address} onChange={(e) => set({ address: e.target.value })} />
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="t11 font-semibold uppercase tracking-wide text-bronze-dark">Grupo y horario</h4>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Grupo" required>
                <select className={inputCls} value={f.group} onChange={(e) => set({ group: e.target.value, level: "" })}>
                  {GROUPS.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </Field>
              {levels.length > 0 && (
                <Field label="Nivel">
                  <select className={inputCls} value={f.level} onChange={(e) => set({ level: e.target.value })}>
                    <option value="">—</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </Field>
              )}
              {f.group === "salsa" && (
                <>
                  <Field label="Modalidad">
                    <select className={inputCls} value={f.salsaModality} onChange={(e) => set({ salsaModality: e.target.value })}>
                      <option value="individual">Individual</option>
                      <option value="pareja">En pareja</option>
                    </select>
                  </Field>
                  {f.salsaModality === "pareja" && (
                    <Field label="Nombre de la pareja">
                      <input className={inputCls} value={f.salsaPartnerName} onChange={(e) => set({ salsaPartnerName: e.target.value })} />
                    </Field>
                  )}
                </>
              )}
              {f.group === "adultos" && (
                <Field label="Modalidad de facturación">
                  <select className={inputCls} value={f.billingMode} onChange={(e) => set({ billingMode: e.target.value })}>
                    <option value="mensual">Mensual</option>
                    <option value="por_clase">Por clase</option>
                  </select>
                </Field>
              )}
              <div className="col-span-2">
                <Field label="Horario acordado">
                  {slotsForGroup.length > 0 ? (
                    <select className={inputCls} value={f.scheduleFrequency} onChange={(e) => set({ scheduleFrequency: e.target.value })}>
                      <option value="">—</option>
                      {slotsForGroup.map((s) => {
                        const label = `${WEEKDAYS[s.weekday]} ${s.startTime}–${s.endTime}`;
                        return <option key={s.id} value={label}>{label}</option>;
                      })}
                    </select>
                  ) : (
                    <input className={inputCls} value={f.scheduleFrequency} onChange={(e) => set({ scheduleFrequency: e.target.value })} placeholder="Ej. Lunes 16:00–17:00" />
                  )}
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="t11 font-semibold uppercase tracking-wide text-bronze-dark">Experiencia y salud</h4>
            <label className="flex items-center gap-2 t13 text-ink">
              <input type="checkbox" checked={f.hasExperience} onChange={(e) => set({ hasExperience: e.target.checked })} /> Tiene experiencia previa en danza
            </label>
            {f.hasExperience && (
              <Field label="¿Dónde?">
                <input className={inputCls} value={f.experienceWhere} onChange={(e) => set({ experienceWhere: e.target.value })} />
              </Field>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Enfermedad / alergia">
                <input className={inputCls} value={f.health} onChange={(e) => set({ health: e.target.value })} />
              </Field>
              <Field label="Cirugías">
                <input className={inputCls} value={f.surgery} onChange={(e) => set({ surgery: e.target.value })} />
              </Field>
              <Field label="Medicamentos">
                <input className={inputCls} value={f.medications} onChange={(e) => set({ medications: e.target.value })} />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="t11 font-semibold uppercase tracking-wide text-bronze-dark">Representante y emergencia</h4>
            <label className="flex items-center gap-2 t13 text-ink">
              <input type="checkbox" checked={f.isMinor} onChange={(e) => set({ isMinor: e.target.checked })} /> Es menor de edad
            </label>
            {f.isMinor && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Nombre del representante" required>
                  <input className={inputCls} value={f.guardianName} onChange={(e) => set({ guardianName: e.target.value })} />
                  {errors.guardianName && <p className="t11 mt-1 text-wine">{errors.guardianName}</p>}
                </Field>
                <Field label="Teléfono del representante" required>
                  <input className={inputCls} value={f.guardianPhone} onChange={(e) => set({ guardianPhone: e.target.value })} />
                  {errors.guardianPhone && <p className="t11 mt-1 text-wine">{errors.guardianPhone}</p>}
                </Field>
                <Field label="Correo del representante">
                  <input type="email" className={inputCls} value={f.guardianEmail} onChange={(e) => set({ guardianEmail: e.target.value })} />
                </Field>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Contacto de emergencia" required>
                <input className={inputCls} value={f.emergencyName} onChange={(e) => set({ emergencyName: e.target.value })} />
                {errors.emergencyName && <p className="t11 mt-1 text-wine">{errors.emergencyName}</p>}
              </Field>
              <Field label="Parentesco">
                <input className={inputCls} value={f.emergencyRelationship} onChange={(e) => set({ emergencyRelationship: e.target.value })} />
              </Field>
              <Field label="Teléfono de emergencia" required>
                <input className={inputCls} value={f.emergencyPhone} onChange={(e) => set({ emergencyPhone: e.target.value })} />
                {errors.emergencyPhone && <p className="t11 mt-1 text-wine">{errors.emergencyPhone}</p>}
              </Field>
              <Field label="Teléfono de emergencia (2)">
                <input className={inputCls} value={f.emergencyPhone2} onChange={(e) => set({ emergencyPhone2: e.target.value })} />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="t11 font-semibold uppercase tracking-wide text-bronze-dark">Consentimientos</h4>
            <Field label="¿Autoriza el uso de fotos/videos en redes de la escuela?" required>
              <div className="mt-1 flex gap-3">
                {["si", "no"].map((v) => (
                  <label key={v} className={`t13 flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center ${f.photoVideoConsent === v ? "border-teal bg-teal/10 text-teal-dark" : "border-line text-muted"}`}>
                    <input type="radio" className="hidden" checked={f.photoVideoConsent === v} onChange={() => set({ photoVideoConsent: v })} />
                    {v === "si" ? "Sí" : "No"}
                  </label>
                ))}
              </div>
              {errors.photoVideoConsent && <p className="t11 mt-1 text-wine">{errors.photoVideoConsent}</p>}
            </Field>
            {!isAdmin && (
              <label className="t13 flex items-start gap-2 text-ink">
                <input type="checkbox" className="mt-0.5" checked={f.termsAccepted} onChange={(e) => set({ termsAccepted: e.target.checked })} />
                <span>
                  He leído y acepto el{" "}
                  <button type="button" onClick={() => setShowReglamento(true)} className="font-medium text-teal underline">
                    reglamento de CIF Adagio
                  </button>
                  .
                </span>
              </label>
            )}
            {errors.termsAccepted && <p className="t11 text-wine">{errors.termsAccepted}</p>}
          </section>

          {isAdmin && (
            <section className="space-y-4 rounded-xl border border-dashed border-line p-4">
              <h4 className="t11 font-semibold uppercase tracking-wide text-bronze-dark">Solo administración</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Estado">
                  <select className={inputCls} value={f.status} onChange={(e) => set({ status: e.target.value })}>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </Field>
                <Field label="Modalidad de pago acordada">
                  <select className={inputCls} value={f.paymentSchedule} onChange={(e) => set({ paymentSchedule: e.target.value })}>
                    <option value="mensual">Mensual</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="bimestral">Bimestral</option>
                  </select>
                </Field>
                <Field label="Beca">
                  <select className={inputCls} value={f.scholarshipType} onChange={(e) => set({ scholarshipType: e.target.value })}>
                    <option value="none">Sin beca</option>
                    <option value="partial">Parcial</option>
                    <option value="full">Completa</option>
                  </select>
                </Field>
                {f.scholarshipType === "partial" && (
                  <Field label="Descuento de beca ($)">
                    <input type="number" className={inputCls} value={f.scholarshipDiscount} onChange={(e) => set({ scholarshipDiscount: e.target.value })} />
                  </Field>
                )}
                <div className="col-span-2">
                  <Field label="Notas internas">
                    <textarea rows={3} className={inputCls} value={f.adminNotes} onChange={(e) => set({ adminNotes: e.target.value })} />
                  </Field>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-line bg-cream p-4">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button onClick={submit} disabled={saving} className="btn btn-primary flex-1">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      {showReglamento && <ReglamentoModal onClose={() => setShowReglamento(false)} />}
    </div>
  );
}
