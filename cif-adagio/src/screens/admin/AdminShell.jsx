import { useState } from "react";
import {
  LayoutDashboard, Users, Wallet, MoreHorizontal, LogOut, X,
  CalendarCheck, Calendar, Megaphone, Bell, BarChart3, Settings as SettingsIcon,
} from "lucide-react";
import { useAdminSession } from "../../lib/session";
import { Dashboard } from "./Dashboard";
import { StudentsView } from "./StudentsView";
import { PaymentsView } from "./PaymentsView";
import { TrialBookingsView } from "./TrialBookingsView";
import { CalendarEventsView } from "./CalendarEventsView";
import { AnnouncementsView } from "./AnnouncementsView";
import { RemindersView } from "./RemindersView";
import { StatsView } from "./StatsView";
import { SettingsView } from "./SettingsView";

const PRIMARY_TABS = [
  { id: "dashboard", label: "Resumen", icon: LayoutDashboard },
  { id: "students", label: "Estudiantes", icon: Users },
  { id: "payments", label: "Pagos", icon: Wallet },
];

const SECONDARY_TABS = [
  { id: "trials", label: "Clases de prueba", icon: CalendarCheck },
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "announcements", label: "Avisos", icon: Megaphone },
  { id: "reminders", label: "Recordatorios", icon: Bell },
  { id: "stats", label: "Estadísticas", icon: BarChart3 },
  { id: "settings", label: "Ajustes", icon: SettingsIcon },
];

const VIEWS = {
  dashboard: Dashboard,
  students: StudentsView,
  payments: PaymentsView,
  trials: TrialBookingsView,
  calendar: CalendarEventsView,
  announcements: AnnouncementsView,
  reminders: RemindersView,
  stats: StatsView,
  settings: SettingsView,
};

export function AdminShell() {
  const [, setSession] = useAdminSession();
  const [tab, setTab] = useState("dashboard");
  const [showMore, setShowMore] = useState(false);

  const ActiveView = VIEWS[tab];
  const isSecondary = SECONDARY_TABS.some((t) => t.id === tab);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-cream/95 px-5 py-3 backdrop-blur">
        <div>
          <p className="font-display text-lg leading-none text-ink">CIF Adagio</p>
          <p className="t10 uppercase tracking-widest text-faint">Administración</p>
        </div>
        <button onClick={() => setSession(null)} className="flex items-center gap-1.5 t12 text-muted hover:text-wine">
          <LogOut size={15} /> Salir
        </button>
      </header>

      <main className="flex-1 pb-24">
        <ActiveView />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {PRIMARY_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setShowMore(false); }}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 t10 font-medium ${tab === t.id ? "text-teal" : "text-faint"}`}
            >
              <t.icon size={19} />
              {t.label}
            </button>
          ))}
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 t10 font-medium ${isSecondary ? "text-teal" : "text-faint"}`}
          >
            <MoreHorizontal size={19} />
            Más
          </button>
        </div>
      </nav>

      {showMore && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40" onClick={() => setShowMore(false)}>
          <div className="w-full max-w-lg rounded-t-2xl bg-paper p-3 pb-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between px-2 pt-2">
              <p className="t12 font-semibold uppercase tracking-wide text-muted">Más opciones</p>
              <button onClick={() => setShowMore(false)} className="text-muted hover:text-ink">
                <X size={18} />
              </button>
            </div>
            {SECONDARY_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setShowMore(false); }}
                className={`t13 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${tab === t.id ? "bg-teal/10 text-teal-dark" : "text-ink hover:bg-cream-dim"}`}
              >
                <t.icon size={17} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
