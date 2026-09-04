import { Mail, MessageCircle } from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { groupById } from "../../lib/constants";
import { effectivePrice, isActive, owesMonthlyFee } from "../../lib/business";
import {
  buildReminderText, currentMonthKey, mailtoLink, monthLabel, reminderContactEmail,
  reminderContactName, reminderContactPhone, usd, waLink,
} from "../../lib/format";
import { StudentAvatar } from "../../components/ui";

export function RemindersView() {
  const { students, payments, reminders } = useAppData();
  const month = currentMonthKey();
  const today = new Date();
  const overdue = today.getDate() > 5;

  const pending = students.items.filter((s) => {
    if (!isActive(s) || !owesMonthlyFee(s)) return false;
    return !payments.items.some((p) => p.studentId === s.id && p.type === "mensualidad" && p.month === month && p.confirmed !== false);
  });

  const logReminder = async (studentId, channel) => {
    await reminders.add({ studentId, month, date: new Date().toISOString(), channel });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Recordatorios</h1>
        <p className="t13 text-muted">
          {pending.length} pendientes de {monthLabel(month)}
          {overdue && <span className="ml-1 text-wine">· ya pasaron los primeros 5 días del mes</span>}
        </p>
      </div>

      <div className="space-y-2">
        {pending.map((s) => {
          const g = groupById(s.group);
          const text = buildReminderText(s, g, month);
          const phone = reminderContactPhone(s);
          const email = reminderContactEmail(s);
          return (
            <div key={s.id} className="card flex items-center gap-3 p-3">
              <StudentAvatar student={s} size={36} />
              <div className="flex-1">
                <p className="t13 font-medium text-ink">{s.fullName}</p>
                <p className="t11 text-muted">{g?.name} · {usd(effectivePrice(s))} · para {reminderContactName(s)}</p>
              </div>
              {phone && (
                <a href={waLink(phone, text)} target="_blank" rel="noreferrer" onClick={() => logReminder(s.id, "whatsapp")} className="rounded-lg p-2 text-teal hover:bg-teal/10">
                  <MessageCircle size={17} />
                </a>
              )}
              {email && (
                <a href={mailtoLink(email, "Mensualidad pendiente — CIF Adagio", text)} onClick={() => logReminder(s.id, "email")} className="rounded-lg p-2 text-bronze-dark hover:bg-bronze/10">
                  <Mail size={17} />
                </a>
              )}
            </div>
          );
        })}
        {pending.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-6 text-center text-muted">Nadie tiene mensualidades pendientes este mes. 🎉</p>}
      </div>
    </div>
  );
}
