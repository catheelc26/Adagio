import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_NAMES, DAY_HEADERS, EVENT_TYPES, eventTypeInfo } from "../lib/constants";

// Cuadrícula mensual: marca los días de clase del grupo (recurrentes cada semana)
// y las actividades puntuales (ensayos, eventos) que caen ese día.
export function MonthCalendar({ weeklySlots, events, groupColor }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());

  const goPrev = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else setMonthIndex((m) => m - 1);
  };
  const goNext = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else setMonthIndex((m) => m + 1);
  };

  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonthCount = new Date(year, monthIndex + 1, 0).getDate();
  const todayStr = now.toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonthCount; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isClassDay = (jsWeekday) => {
    const ourIdx = jsWeekday === 0 ? 6 : jsWeekday - 1;
    return weeklySlots.some((sl) => sl.weekday === ourIdx);
  };
  const eventsOnDay = (dateStr) => events.filter((e) => e.date === dateStr);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={goPrev} className="rounded-lg p-1.5 text-muted hover:bg-cream-dim hover:text-ink">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-display text-lg capitalize text-ink">
          {MONTH_NAMES[monthIndex]} {year}
        </h3>
        <button onClick={goNext} className="rounded-lg p-1.5 text-muted hover:bg-cream-dim hover:text-ink">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="t10 text-center font-medium uppercase text-faint">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const jsWeekday = new Date(year, monthIndex, d).getDay();
          const classDay = isClassDay(jsWeekday);
          const dayEvents = eventsOnDay(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <div
              key={i}
              className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg"
              style={isToday ? { backgroundColor: "rgba(184,147,91,0.16)", border: "1px solid #B8935B" } : classDay ? { backgroundColor: "var(--color-cream-dim)" } : {}}
            >
              <span className={`t11 ${isToday ? "font-semibold text-teal" : "text-ink"}`}>{d}</span>
              <div className="flex h-1.5 gap-0.5">
                {classDay && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: groupColor }} />}
                {dayEvents.slice(0, 2).map((e, idx) => (
                  <span key={idx} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: eventTypeInfo(e.type).color }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line-soft pt-3">
        <span className="t11 flex items-center gap-1.5 text-muted">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: groupColor }} /> Día de clase
        </span>
        {EVENT_TYPES.map((t) => (
          <span key={t.id} className="t11 flex items-center gap-1.5 text-muted">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} /> {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
