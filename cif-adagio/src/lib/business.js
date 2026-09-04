import { groupById } from "./constants";

export const isActive = (student) => student.status !== "inactive";

// Mensualidad efectiva de un estudiante, aplicando modalidad de pareja (Salsa) y becas.
export function effectivePrice(student) {
  const g = groupById(student.group);
  if (!g) return 0;
  const basePrice =
    student.group === "salsa" && student.salsaModality === "pareja"
      ? (g.pairPrice || g.price * 2) / 2
      : g.price;
  if (student.scholarshipType === "full") return 0;
  if (student.scholarshipType === "partial") {
    return Math.max(0, basePrice - (Number(student.scholarshipDiscount) || 0));
  }
  return basePrice;
}

// Becados 100% y adultos facturados por clase nunca "deben" una mensualidad mensual.
export const owesMonthlyFee = (student) =>
  student.scholarshipType !== "full" && student.billingMode !== "por_clase";

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

// Próximas N fechas (YYYY-MM-DD) que caen en un día de la semana dado (0=Lunes...6=Domingo).
export function nextDatesForWeekday(weekdayIndex, count = 4) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const jsToOurIndex = (jsDay) => (jsDay === 0 ? 6 : jsDay - 1);
  const cursor = new Date(today);
  while (dates.length < count) {
    if (jsToOurIndex(cursor.getDay()) === weekdayIndex) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates.map((d) => d.toISOString().slice(0, 10));
}
