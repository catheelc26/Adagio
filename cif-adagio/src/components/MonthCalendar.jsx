import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_NAMES, DAY_HEADERS, eventTypeInfo } from "../lib/constants";

// Calendario estilo "planner": cada celda muestra el número del día, una
// franja de color si es día de clase, y el nombre del primer evento del día
// (con un "+N" si hay más), en vez de solo puntitos.
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

  const isClassDay = (jsWeekday) => {
    const ourIdx = jsWeekday === 0 ? 6 : jsWeekday - 1;
    return weeklySlots.some((sl) => sl.weekday === ourIdx);
  };
  const eventsOnDay = (dateStr) => events.filter((e) => e.date === dateStr);

  return (
    <div className="card p-3.5">
      <div className="mb-3 flex items-center justify-between px-1">
        <button onClick={goPrev} className="rounded-full p-1.5 text-muted hover:bg-cream-dim hover:text-ink">
          <ChevronLeft size={17} />
        </button>
        <h3 className="font-display text-base font-semibold capitalize text-ink">
          {MONTH_NAMES[monthIndex]} {year}
        </h3>
        <button onClick={goNext} className="rounded-full p-1.5 text-muted hover:bg-cream-dim hover:text-ink">
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="t10 text-center font-semibold uppercase text-faint">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="aspect-square" />;
          const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const jsWeekday = new Date(year, monthIndex, d).getDay();
          const classDay = isClassDay(jsWeekday);
          const dayEvents = eventsOnDay(dateStr);
          const isToday = dateStr === todayStr;
          const firstEvent = dayEvents[0];
          return (
            <div
              key={i}
              className="flex aspect-square flex-col overflow-hidden rounded-lg p-1"
              style={isToday ? { backgroundColor: "var(--color-bronze-light)", boxShadow: "inset 0 0 0 1.5px var(--color-bronze)" } : classDay ? { backgroundColor: "var(--color-cream-dim)" } : {}}
            >
              <span className={`t10 leading-none ${isToday ? "font-bold text-bronze-dark" : "font-medium text-ink"}`}>{d}</span>
              {classDay && !firstEvent && (
                <span className="mt-auto h-1 w-full rounded-full" style={{ backgroundColor: groupColor }} />
              )}
              {firstEvent && (
                <span className="mt-auto space-y-0.5">
                  <span
                    className="block truncate rounded px-0.5 text-[7px] font-semibold leading-tight text-white"
                    style={{ backgroundColor: eventTypeInfo(firstEvent.type).color }}
                  >
                    {firstEvent.title}
                  </span>
                  {dayEvents.length > 1 && <span className="block text-[7px] font-medium leading-none text-faint">+{dayEvents.length - 1}</span>}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-line-soft pt-3">
        <span className="t11 flex items-center gap-1.5 text-muted">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: groupColor }} /> Día de clase
        </span>
      </div>
    </div>
  );
}
