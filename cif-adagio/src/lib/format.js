export const usd = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export const bs = (n) => `Bs. ${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n || 0)}`;

export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (key) => {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  const label = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const genAccessCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

export const digitsOnly = (str) => (str || "").replace(/\D/g, "");

// Normaliza un teléfono venezolano a formato internacional +58, sin duplicar
// el código si ya lo tenía y quitando el 0 inicial que llevan los números
// locales (0412... -> +58412...). Idempotente: aplicarlo varias veces sobre
// el mismo número da siempre el mismo resultado.
export const normalizePhoneVE = (raw) => {
  const digits = digitsOnly(raw);
  if (!digits) return "";
  let national = digits.startsWith("58") && digits.length >= 12 ? digits.slice(2) : digits;
  if (national.startsWith("0")) national = national.slice(1);
  return `+58${national}`;
};

export const reminderContactName = (student) => (student.isMinor ? student.guardianName : student.fullName) || student.fullName;
export const reminderContactPhone = (student) => (student.isMinor ? student.guardianPhone : student.phone) || "";
export const reminderContactEmail = (student) => (student.isMinor ? student.guardianEmail : student.email) || "";

export const buildReminderText = (student, group, mKey, amountOwed) => {
  const name = reminderContactName(student);
  return `Hola ${name}, te escribimos de CIF Adagio para recordarte que la mensualidad de ${student.fullName} correspondiente a ${monthLabel(mKey)} (grupo ${group.name}, ${usd(amountOwed)}) sigue pendiente. Cualquier duda, con gusto te ayudamos. ¡Gracias!`;
};

export const studentDisplayName = (student) =>
  student.group === "salsa" && student.salsaModality === "pareja" && student.partnerFullName
    ? `${student.fullName} & ${student.partnerFullName}`
    : student.fullName;

export const trialContactText = (booking, groupName) =>
  `Hola ${booking.fullName}, te escribimos de CIF Adagio sobre tu clase de prueba de ${groupName} el ${booking.date} (${booking.startTime}). Hubo un pequeño cambio, ¿tienes un momento para coordinar?`;

export const specialistContactText = (specialist) =>
  `Hola ${specialist.name}, soy representante de una familia de CIF Adagio y me gustaría agendar una consulta de ${specialist.specialty}.`;

export const waLink = (phone, text) => `https://wa.me/${digitsOnly(normalizePhoneVE(phone))}?text=${encodeURIComponent(text)}`;
export const mailtoLink = (email, subject, body) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
