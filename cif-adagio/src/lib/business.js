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

// Meses (más reciente al final) en los que un estudiante debe mensualidad sin pago
// confirmado, mirando hacia atrás desde el mes actual — sin pasar de su fecha de
// registro, para no marcar meses previos a su inscripción.
export function owedMonths(student, payments, monthsBack = 60) {
  const months = [];
  const now = new Date();
  const enrolled = student.createdAt ? new Date(student.createdAt) : null;
  const enrolledFloor = enrolled ? new Date(enrolled.getFullYear(), enrolled.getMonth(), 1) : null;
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    if (enrolledFloor && d < enrolledFloor) break;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const paid = payments.some((p) => p.studentId === student.id && p.type === "mensualidad" && p.month === key && p.confirmed !== false);
    if (!paid) months.push(key);
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
