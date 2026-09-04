import { effectivePrice } from "./business";

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

export const reminderContactName = (student) => (student.isMinor ? student.guardianName : student.fullName) || student.fullName;
export const reminderContactPhone = (student) => (student.isMinor ? student.guardianPhone : student.phone) || "";
export const reminderContactEmail = (student) => (student.isMinor ? student.guardianEmail : student.email) || "";

export const buildReminderText = (student, group, mKey) => {
  const name = reminderContactName(student);
  return `Hola ${name}, te escribimos de CIF Adagio para recordarte que la mensualidad de ${student.fullName} correspondiente a ${monthLabel(mKey)} (grupo ${group.name}, ${usd(effectivePrice(student))}) sigue pendiente. Cualquier duda, con gusto te ayudamos. ¡Gracias!`;
};

export const waLink = (phone, text) => `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(text)}`;
export const mailtoLink = (email, subject, body) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
