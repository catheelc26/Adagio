import { AlertCircle, Users, Wallet, GraduationCap, Clock } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { groupById } from "../../lib/constants";
import { effectivePrice, isActive, owesMonthlyFee } from "../../lib/business";
import { currentMonthKey, usd } from "../../lib/format";
import { StudentAvatar } from "../../components/ui";

const TONES = ["bg-cream-dim", "bg-teal/10", "bg-bronze/10", "bg-blush/10"];

function StatCard({ icon: Icon, label, value, tone = 0 }) {
  return (
    <div className={`card flex items-center gap-3 p-4 ${TONES[tone % TONES.length]}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper">
        <Icon size={18} className="text-ink" />
      </div>
      <div>
        <p className="t11 uppercase tracking-wide text-muted">{label}</p>
        <p className="font-display text-xl text-ink">{value}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { students, payments } = useAppData();
  const activeStudents = students.items.filter(isActive);
  const month = currentMonthKey();

  const collectedThisMonth = payments.items
    .filter((p) => p.confirmed !== false && p.date?.startsWith(month))
    .reduce((s, p) => s + p.amount, 0);

  const pendingStudents = activeStudents.filter((s) => {
    if (!owesMonthlyFee(s)) return false;
    const paid = payments.items.some((p) => p.studentId === s.id && p.type === "mensualidad" && p.month === month && p.confirmed !== false);
    return !paid;
  });

  const unconfirmed = payments.items.filter((p) => p.confirmed === false);
  const scholarships = activeStudents.filter((s) => s.scholarshipType && s.scholarshipType !== "none");

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Resumen</h1>
        <p className="t13 text-muted">Vista general de la escuela este mes.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} label="Estudiantes activos" value={activeStudents.length} tone={0} />
        <StatCard icon={Wallet} label="Cobrado este mes" value={usd(collectedThisMonth)} tone={1} />
        <StatCard icon={Clock} label="Mensualidades pendientes" value={pendingStudents.length} tone={2} />
        <StatCard icon={GraduationCap} label="Con beca" value={scholarships.length} tone={3} />
      </div>

      {unconfirmed.length > 0 && (
        <div className="card flex items-center gap-3 border-l-4 border-l-bronze p-4">
          <AlertCircle size={18} className="text-bronze-dark" />
          <p className="t13 text-ink">
            {unconfirmed.length} pago{unconfirmed.length === 1 ? "" : "s"} reportado{unconfirmed.length === 1 ? "" : "s"} por representantes esperan confirmación.
          </p>
        </div>
      )}

      <div>
        <h2 className="font-display mb-3 text-lg text-ink">Pendientes de este mes</h2>
        {pendingStudents.length === 0 ? (
          <p className="t13 rounded-xl bg-cream-dim p-4 text-muted">Todos los estudiantes están al día. 🎉</p>
        ) : (
          <div className="space-y-2">
            {pendingStudents.map((s) => {
              const g = groupById(s.group);
              return (
                <div key={s.id} className="card flex items-center gap-3 p-3">
                  <StudentAvatar student={s} size={36} />
                  <div className="flex-1">
                    <p className="t13 font-medium text-ink">{s.fullName}</p>
                    <p className="t11 text-muted">{g?.name}</p>
                  </div>
                  <span className="t13 font-medium text-wine">{usd(effectivePrice(s))}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
