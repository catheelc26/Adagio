import { useState } from "react";
import { AlertCircle, HeartHandshake, Users, GraduationCap, Clock } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { groupById } from "../../lib/constants";
import { effectivePrice, isActive, owedMonths, owesMonthlyFee, sortByGroupThenName } from "../../lib/business";
import { monthLabel, studentDisplayName, usd } from "../../lib/format";
import { ActionMenu, MenuItem, StudentAvatar } from "../../components/ui";
import { ExemptMonthModal } from "../../components/ExemptMonthModal";

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
  const { students, payments, groups } = useAppData();
  const activeStudents = students.items.filter(isActive);
  const [exemptingEntry, setExemptingEntry] = useState(null);

  const pendingEntries = sortByGroupThenName(activeStudents.filter(owesMonthlyFee), groups.items)
    .map((s) => ({ student: s, owed: owedMonths(s, payments.items) }))
    .filter((e) => e.owed.length > 0);

  const unconfirmed = payments.items.filter((p) => p.confirmed === false);
  const scholarships = activeStudents.filter((s) => s.scholarshipType && s.scholarshipType !== "none");

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Inicio</h1>
        <p className="t13 text-muted">Vista general de la escuela este mes.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Users} label="Estudiantes activos" value={activeStudents.length} tone={0} />
        <StatCard icon={Clock} label="Mensualidades pendientes" value={pendingEntries.length} tone={2} />
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
        {pendingEntries.length === 0 ? (
          <p className="t13 rounded-xl bg-cream-dim p-4 text-muted">Todos los estudiantes están al día. 🎉</p>
        ) : (
          <div className="space-y-2">
            {pendingEntries.map((entry) => {
              const { student: s, owed } = entry;
              const g = groupById(groups.items, s.group);
              return (
                <div key={s.id} className="card flex items-center gap-3 p-3">
                  <StudentAvatar student={s} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="t13 font-medium text-ink">{studentDisplayName(s)}</p>
                    <p className="t11 text-muted">{g?.name}</p>
                    <p className="t11 text-wine">Debe: {owed.map(monthLabel).join(", ")}</p>
                  </div>
                  <span className="t13 font-medium text-wine">{usd(effectivePrice(s, groups.items) * owed.length)}</span>
                  <ActionMenu>
                    <MenuItem icon={<HeartHandshake size={15} />} label="Exonerar un mes" onClick={() => setExemptingEntry(entry)} />
                  </ActionMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {exemptingEntry && (
        <ExemptMonthModal
          student={exemptingEntry.student}
          monthOptions={exemptingEntry.owed}
          onClose={() => setExemptingEntry(null)}
        />
      )}
    </div>
  );
}
