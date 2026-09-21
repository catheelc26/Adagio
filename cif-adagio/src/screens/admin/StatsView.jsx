import { effectivePrice, isActive, owesMonthlyFee } from "../../lib/business";
import { currentMonthKey, usd } from "../../lib/format";
import { useAppData } from "../../lib/AppDataContext";

function Stat({ label, value }) {
  return (
    <div className="card p-4">
      <p className="t11 uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display text-2xl text-ink">{value}</p>
    </div>
  );
}

export function StatsView() {
  const { students, payments, attendance, groups } = useAppData();
  const month = currentMonthKey();
  const year = new Date().getFullYear();

  const active = students.items.filter(isActive);
  const owing = active.filter(owesMonthlyFee);
  const paidThisMonth = owing.filter((s) =>
    payments.items.some((p) => p.studentId === s.id && p.type === "mensualidad" && p.month === month && p.confirmed !== false)
  );
  const collectionRate = owing.length ? Math.round((paidThisMonth.length / owing.length) * 100) : 100;

  const monthPayments = payments.items.filter((p) => p.confirmed !== false && p.date?.startsWith(month));
  const collectedThisMonth = monthPayments.reduce((s, p) => s + p.amount, 0);
  const collectedByType = {
    mensualidad: monthPayments.filter((p) => p.type === "mensualidad").reduce((s, p) => s + p.amount, 0),
    inscripcion: monthPayments.filter((p) => p.type === "inscripcion").reduce((s, p) => s + p.amount, 0),
    clase: monthPayments.filter((p) => p.type === "clase").reduce((s, p) => s + p.amount, 0),
    extra: monthPayments.filter((p) => p.type === "extra").reduce((s, p) => s + p.amount, 0),
  };

  const yearTotal = payments.items
    .filter((p) => p.confirmed !== false && p.date?.startsWith(String(year)))
    .reduce((s, p) => s + p.amount, 0);

  const attendanceTotal = attendance.items.length;
  const attendancePresent = attendance.items.filter((a) => a.present).length;
  const attendanceRate = attendanceTotal ? Math.round((attendancePresent / attendanceTotal) * 100) : null;

  const scholarshipCounts = {
    none: active.filter((s) => !s.scholarshipType || s.scholarshipType === "none").length,
    partial: active.filter((s) => s.scholarshipType === "partial").length,
    full: active.filter((s) => s.scholarshipType === "full").length,
  };

  const byGroup = groups.items.map((g) => {
    const inGroup = active.filter((s) => s.group === g.id);
    const revenue = inGroup.reduce((s, st) => s + effectivePrice(st, groups.items), 0);
    return { ...g, count: inGroup.length, revenue };
  });
  const totalExpectedIncome = byGroup.reduce((s, g) => s + g.revenue, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="font-display text-2xl text-ink">Estadísticas</h1>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Cobro del mes" value={`${collectionRate}%`} />
        <Stat label="Asistencia" value={attendanceRate === null ? "—" : `${attendanceRate}%`} />
        <Stat label="Estudiantes activos" value={active.length} />
      </div>

      <div>
        <h2 className="font-display mb-3 text-lg text-ink">Cobrado este mes</h2>
        <div className="card space-y-3 p-4">
          <p className="font-display text-3xl text-ink">{usd(collectedThisMonth)}</p>
          <div className="divide-y divide-line-soft border-t border-line-soft">
            <div className="flex items-center justify-between py-2">
              <span className="t13 text-muted">Mensualidades</span>
              <span className="t13 font-medium text-ink">{usd(collectedByType.mensualidad)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="t13 text-muted">Inscripciones</span>
              <span className="t13 font-medium text-ink">{usd(collectedByType.inscripcion)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="t13 text-muted">Clases sueltas</span>
              <span className="t13 font-medium text-ink">{usd(collectedByType.clase)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="t13 text-muted">Extras</span>
              <span className="t13 font-medium text-ink">{usd(collectedByType.extra)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display mb-3 text-lg text-ink">Por grupo</h2>
        <div className="space-y-2">
          {byGroup.map((g) => (
            <div key={g.id} className="card flex items-center gap-3 p-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: g.color }} />
              <span className="t13 flex-1 text-ink">{g.name}</span>
              <span className="t12 text-muted">{g.count} estudiantes</span>
              <span className="t13 font-medium text-ink">{usd(g.revenue)}/mes</span>
            </div>
          ))}
          <div className="card flex items-center justify-between border-l-4 border-l-teal p-3">
            <span className="t13 font-semibold text-ink">Total de ingreso esperado</span>
            <span className="font-display text-lg text-ink">{usd(totalExpectedIncome)}/mes</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display mb-3 text-lg text-ink">Becas</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Sin beca" value={scholarshipCounts.none} />
          <Stat label="Parcial" value={scholarshipCounts.partial} />
          <Stat label="Completa" value={scholarshipCounts.full} />
        </div>
      </div>

      <Stat label={`Ingresos ${year}`} value={usd(yearTotal)} />
    </div>
  );
}
