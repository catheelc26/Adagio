import { groupById, levelLabel, paymentMethodInfo, PAYMENT_SCHEDULE_LABELS } from "./constants";
import { effectivePrice, isActive } from "./business";
import { monthLabel, studentDisplayName } from "./format";

// xlsx (SheetJS) es pesado y solo lo usan estas dos exportaciones admin —
// se carga en el momento en que realmente se hace clic en "Excel".
async function loadXLSX() {
  return await import("xlsx");
}

export async function exportStudentsToExcel(students, groups) {
  const XLSX = await loadXLSX();
  const rows = students.map((s) => ({
    "Nombre completo": s.fullName,
    "Pareja (Salsa)": s.group === "salsa" && s.salsaModality === "pareja" ? s.partnerFullName || "" : "",
    "Edad pareja (Salsa)": s.group === "salsa" && s.salsaModality === "pareja" ? s.partnerAge || "" : "",
    "Estado": isActive(s) ? "Activo" : "Inactivo",
    "Cédula": s.cedula || "",
    "Sexo": s.sex === "F" ? "Femenino" : s.sex === "M" ? "Masculino" : "",
    "Fecha de nacimiento": s.birthDate || "",
    "Edad": s.age,
    "Grupo": groupById(groups, s.group)?.name || s.group,
    "Nivel": s.level ? levelLabel(s.group, s.level) : "",
    "Mensualidad estándar ($)": groupById(groups, s.group)?.price || "",
    "Beca": s.scholarshipType === "full" ? "Completa" : s.scholarshipType === "partial" ? "Parcial" : "Sin beca",
    "Descuento de beca ($)": s.scholarshipType === "partial" ? Number(s.scholarshipDiscount) || 0 : "",
    "Mensualidad efectiva ($)": effectivePrice(s, groups),
    "Modalidad de pago acordada": PAYMENT_SCHEDULE_LABELS[s.paymentSchedule] || "Mensual",
    "Modalidad de facturación (Adultos)": s.group === "adultos" ? (s.billingMode === "por_clase" ? "Por clase" : "Mensual") : "",
    "Modalidad Salsa": s.group === "salsa" ? (s.salsaModality === "pareja" ? "Pareja" : "Individual") : "",
    "Frecuencia de horario acordada": s.scheduleFrequency || "",
    "Código de acceso": s.accessCode || "",
    "Teléfono": s.phone,
    "Correo": s.email || "",
    "Dirección": s.address || "",
    "Experiencia previa": s.hasExperience ? s.experienceWhere || "Sí" : "No",
    "Enfermedad / alergia": s.health || "",
    "Cirugías": s.surgery || "",
    "Medicamentos": s.medications || "",
    "Es menor de edad": s.isMinor ? "Sí" : "No",
    "Representante": s.isMinor ? s.guardianName || "" : "",
    "Teléfono representante": s.isMinor ? s.guardianPhone || "" : "",
    "Correo representante": s.isMinor ? s.guardianEmail || "" : "",
    "Contacto de emergencia": s.emergencyName || "",
    "Parentesco": s.emergencyRelationship || "",
    "Teléfono de emergencia (1)": s.emergencyPhone || "",
    "Teléfono de emergencia (2)": s.emergencyPhone2 || "",
    "Autoriza fotos/videos": s.photoVideoConsent === "si" ? "Sí" : s.photoVideoConsent === "no" ? "No" : "",
    "Reglamento aceptado": s.termsAccepted ? "Sí" : "No",
    "Origen del registro": s.source === "representante" ? "Autorregistro" : "Administración",
    "Pendiente de revisión": s.pendingReview ? "Sí" : "No",
    "Notas internas": s.adminNotes || "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Estudiantes");
  XLSX.writeFile(wb, `estudiantes-ballet-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportPaymentsAnalysisToExcel(students, payments, groups) {
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();

  const detailRows = payments
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((p) => {
      const student = students.find((s) => s.id === p.studentId);
      const g = student ? groupById(groups, student.group) : null;
      return {
        "Fecha": p.date,
        "Estudiante": student ? studentDisplayName(student) : "Estudiante eliminado",
        "Grupo": g?.name || "",
        "Tipo": p.type === "mensualidad" ? "Mensualidad" : "Extra",
        "Concepto": p.concept,
        "Mes correspondiente": p.month ? monthLabel(p.month) : "",
        "Monto ($)": p.amount,
        "Moneda de pago": p.currency === "VES" ? "Bolívares" : "Divisa",
        "Monto (Bs)": p.amountVES || "",
        "Tasa usada": p.rateUsed || "",
        "Método": paymentMethodInfo(p.method).label,
        "Referencia": p.reference || "",
        "Estado": p.confirmed === false ? "Por confirmar" : "Confirmado",
        "Registrado por": p.reportedBy === "representante" ? "Representante" : "Administración",
      };
    });
  const wsDetail = XLSX.utils.json_to_sheet(detailRows);
  wsDetail["!cols"] = Object.keys(detailRows[0] || {}).map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, wsDetail, "Detalle de pagos");

  const months = Array.from(
    new Set(payments.filter((p) => p.type === "mensualidad" && p.month).map((p) => p.month))
  ).sort();

  const analysisRows = students.map((s) => {
    const g = groupById(groups, s.group);
    const row = { "Estudiante": studentDisplayName(s), "Grupo": g?.name || "" };
    let total = 0;
    months.forEach((m) => {
      const sum = payments
        .filter((p) => p.studentId === s.id && p.type === "mensualidad" && p.month === m && p.confirmed !== false)
        .reduce((acc, p) => acc + p.amount, 0);
      row[monthLabel(m)] = sum > 0 ? sum : "";
      total += sum;
    });
    const extrasTotal = payments
      .filter((p) => p.studentId === s.id && p.type === "extra" && p.confirmed !== false)
      .reduce((acc, p) => acc + p.amount, 0);
    row["Total extras ($)"] = extrasTotal || "";
    row["Total pagado ($)"] = total + extrasTotal;
    return row;
  });
  const wsAnalysis = XLSX.utils.json_to_sheet(analysisRows);
  wsAnalysis["!cols"] = Object.keys(analysisRows[0] || {}).map(() => ({ wch: 16 }));
  XLSX.utils.book_append_sheet(wb, wsAnalysis, "Análisis por mes");

  XLSX.writeFile(wb, `analisis-pagos-ballet-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
