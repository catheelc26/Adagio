import { groupById } from "./constants";

export const isActive = (student) => student.status !== "inactive";

// Mensualidad efectiva de un estudiante, aplicando modalidad de pareja (Salsa) y becas.
// En modalidad "pareja" el registro representa a las DOS personas a la vez (un solo
// registro, un solo pago que cubre a ambas), así que el precio es el de la pareja completa.
export function effectivePrice(student, groups) {
  const g = groupById(groups, student.group);
  if (!g) return 0;
  const basePrice =
    student.group === "salsa" && student.salsaModality === "pareja"
      ? g.pairPrice || g.price * 2
      : g.price;
  if (student.scholarshipType === "full") return 0;
  if (student.scholarshipType === "partial") {
    return Math.max(0, basePrice - (Number(student.scholarshipDiscount) || 0));
  }
  return basePrice;
}

// Cuenta de Pago Móvil que corresponde a un grupo. Cada cuenta puede marcar a qué
// grupos aplica (groupIds); la primera cuenta sin grupos marcados es la que se usa
// por defecto para cualquier grupo que no esté asignado explícitamente a otra.
export function pagoMovilAccountForGroup(accounts, groupId) {
  const list = accounts || [];
  if (list.length === 0) return null;
  const specific = list.find((a) => (a.groupIds || []).includes(groupId));
  if (specific) return specific;
  return list.find((a) => (a.groupIds || []).length === 0) || list[0];
}

// Estudiante actual + todos los vinculados a su misma familia (hermanos, etc.), en ese orden.
export function familyMembersOf(students, student) {
  if (!student.familyId) return [student];
  const siblings = students.filter((s) => s.familyId === student.familyId && s.id !== student.id);
  return [student, ...siblings];
}

// Becados 100% y adultos facturados por clase nunca "deben" una mensualidad mensual.
export const owesMonthlyFee = (student) =>
  student.scholarshipType !== "full" && student.billingMode !== "por_clase";

// Ordena estudiantes por el orden configurado de los grupos (Ajustes → Grupos y
// precios) y, dentro de cada grupo, alfabéticamente por nombre.
export function sortByGroupThenName(students, groups) {
  const order = new Map(groups.map((g, i) => [g.id, i]));
  return [...students].sort((a, b) => {
    const ga = order.has(a.group) ? order.get(a.group) : groups.length;
    const gb = order.has(b.group) ? order.get(b.group) : groups.length;
    if (ga !== gb) return ga - gb;
    return (a.fullName || "").localeCompare(b.fullName || "");
  });
}

// Cuánto ha pagado un estudiante de mensualidad (solo pagos confirmados) para
// un mes dado — sumando todos los abonos, no solo el último.
export const monthPaidAmount = (payments, studentId, month) =>
  payments
    .filter((p) => p.studentId === studentId && p.type === "mensualidad" && p.month === month && p.confirmed !== false)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

// Recargo por mora del reglamento ("Las personas con pagos pendientes estarán
// sujetas a un incremento de 5$ de su mensualidad"). El reglamento pide pagar
// dentro de los primeros 5 días de cada mes, pero el recargo en sí es por
// tener un MES VENCIDO — o sea, se le da todo ese mes para pagar; el recargo
// solo se aplica una vez que ese mes ya quedó completamente atrás (estamos en
// un mes calendario posterior) y sigue sin pagarse por completo.
// Nota: el reglamento adelanta el vencimiento de agosto y diciembre a julio y
// noviembre respectivamente — eso todavía no está contemplado aquí.
export const LATE_FEE = 5;
export const PAYMENT_DUE_DAY = 5;

// Último día (YYYY-MM-DD) de un mes dado.
function monthLastDateStr(month) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(y, m, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
}

// Un mes queda "vencido" cuando ya estamos en un mes calendario posterior —
// el mes en curso nunca está vencido, sin importar qué día sea.
export function isMonthOverdue(month, today = new Date()) {
  const currentKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  return month < currentKey;
}

// Días que faltan para que termine un mes — para avisar unos días antes de
// que, si sigue sin pagarse, empiece a correr el recargo al pasar a vencido.
export function daysUntilMonthEnd(month, today = new Date()) {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((lastDay - start) / 86400000);
}

// Cuánto de la mensualidad de un mes se pagó (confirmado) con fecha dentro de
// ese mismo mes — decide si corresponde el recargo, sin importar cuándo se
// terminó de confirmar el pago después. Si ya se cubrió el precio completo
// con fecha dentro del mes, ese mes nunca carga el recargo aunque hoy ya
// estemos en meses posteriores.
export const monthPaidOnTime = (payments, studentId, month) => {
  const deadline = monthLastDateStr(month);
  return payments
    .filter((p) => p.studentId === studentId && p.type === "mensualidad" && p.month === month && p.confirmed !== false && p.date && p.date <= deadline)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

// Lo que corresponde pagar por la mensualidad de un mes puntual: el precio
// normal, más el recargo de $5 si ese mes ya venció (quedó completamente
// atrás) sin haberse pagado por completo dentro del mismo. Los becados al
// 100% (precio $0) nunca cargan el recargo, porque de entrada no deben nada.
export function monthDueAmount(payments, student, month, groups) {
  const base = effectivePrice(student, groups);
  if (base <= 0) return 0;
  const paidOnTime = monthPaidOnTime(payments, student.id, month) >= base;
  const surcharge = !paidOnTime && isMonthOverdue(month) ? LATE_FEE : 0;
  return base + surcharge;
}

// Un mes queda "resuelto" para un estudiante si hay una exoneración confirmada,
// un abono marcado como prorrateo (primer mes parcial, ya completo aunque sea
// menos que la mensualidad llena), o si lo pagado en total alcanza lo que
// corresponde ese mes (precio + recargo si ya venció) — así un abono parcial
// (ej. pagó 25 de 50) sigue dejando el mes como pendiente por la diferencia,
// en vez de darlo por pagado.
export function monthIsSettled(payments, student, month, groups) {
  const monthPayments = payments.filter((p) => p.studentId === student.id && p.month === month && p.confirmed !== false);
  if (monthPayments.some((p) => p.type === "exoneracion")) return true;
  if (monthPayments.some((p) => p.type === "mensualidad" && p.prorated)) return true;
  const due = monthDueAmount(payments, student, month, groups);
  if (due <= 0) return true;
  return monthPaidAmount(payments, student.id, month) >= due;
}

// Cuánto le falta a un estudiante por pagar de un mes puntual (0 si ya quedó resuelto).
export function monthOwedAmount(payments, student, month, groups) {
  if (monthIsSettled(payments, student, month, groups)) return 0;
  return Math.max(0, monthDueAmount(payments, student, month, groups) - monthPaidAmount(payments, student.id, month));
}

// Meses (más reciente al final) en los que un estudiante debe mensualidad sin pago
// confirmado ni exoneración, mirando hacia atrás desde el mes actual — sin pasar de
// su fecha de registro, para no marcar meses previos a su inscripción.
export function owedMonths(student, payments, groups, monthsBack = 60) {
  const months = [];
  const now = new Date();
  const enrolled = student.createdAt ? new Date(student.createdAt) : null;
  const enrolledFloor = enrolled ? new Date(enrolled.getFullYear(), enrolled.getMonth(), 1) : null;
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    if (enrolledFloor && d < enrolledFloor) break;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthIsSettled(payments, student, key, groups)) months.push(key);
  }
  return months.reverse();
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Prorratea el primer mes según los días restantes desde la fecha de inscripción.
export function proratedFirstMonth(fullPrice, startDateStr) {
  const d = new Date(startDateStr + "T00:00:00");
  const year = d.getFullYear();
  const monthIndex = d.getMonth();
  const totalDays = daysInMonth(year, monthIndex);
  const dayOfMonth = d.getDate();
  const remainingDays = totalDays - dayOfMonth + 1;
  const amount = Math.round(((fullPrice * remainingDays) / totalDays) * 100) / 100;
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const nextMonthDate = new Date(year, monthIndex + 1, 1);
  const nextMonthKey = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;
  return {
    amount,
    remainingDays,
    totalDays,
    monthKey,
    nextMonthKey,
    suggestNextMonth: remainingDays <= 5,
  };
}

// Índice de día de la semana (0=Lunes...6=Domingo) de una fecha YYYY-MM-DD, en
// la misma convención que usa el horario semanal de la escuela.
export const weekdayIndexForDate = (dateStr) => {
  const jsDay = new Date(`${dateStr}T00:00:00`).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
};

// Próximas N fechas (YYYY-MM-DD) que caen en un día de la semana dado (0=Lunes...6=Domingo).
export function nextDatesForWeekday(weekdayIndex, count = 4) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);
  while (dates.length < count) {
    if (weekdayIndexForDate(cursor.toISOString().slice(0, 10)) === weekdayIndex) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates.map((d) => d.toISOString().slice(0, 10));
}

// Estado real de una clase de prueba: si quedó cancelada se respeta esa marca;
// si no, se considera "realizada" en cuanto pasa el día (ya no depende de que
// alguien la marque a mano) y "pendiente" mientras sigue por venir.
export function trialStatus(booking) {
  if (booking.status === "cancelado") return "cancelado";
  const today = new Date().toISOString().slice(0, 10);
  return booking.date < today ? "realizada" : "pendiente";
}
