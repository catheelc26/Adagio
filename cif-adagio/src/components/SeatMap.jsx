import { Armchair } from "lucide-react";
import { CENTER_PRICE, SIDE_PRICE, THEATER_ROW_LETTERS, isCenterSeat, isSeatTaken, seatGroupsForRow, seatKey } from "../lib/tickets";

const LEGEND = [
  { label: "Lateral", price: SIDE_PRICE, icon: "text-blue-dark", bg: "bg-blue/20" },
  { label: "Centro", price: CENTER_PRICE, icon: "text-bronze-dark", bg: "bg-bronze/25" },
  { label: "Elegido", price: null, icon: "text-white", bg: "bg-teal" },
  { label: "Ocupado", price: null, icon: "text-faint", bg: "bg-line" },
];

/**
 * Mapa de butacas del teatro: 16 filas (A a la Ñ, y la fila O al fondo) de
 * 21 asientos cada una, agrupados en 3 bloques (izquierdo, centro, derecho)
 * con pasillos entre ellos. Los asientos 8 a 14 son la sección central
 * (resaltada, $12); el resto son laterales ($10). La fila O tiene los
 * pasillos corridos un puesto hacia cada lado. Los asientos ya vendidos
 * quedan deshabilitados; los seleccionados se marcan.
 */
export function SeatMap({ showId, tickets, selected, onToggle }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-xl bg-cream-dim px-4 py-3">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex flex-col items-center gap-1">
            <span className={`flex h-7 w-7 items-center justify-center rounded-md ${l.bg}`}>
              <Armchair size={16} className={l.icon} />
            </span>
            <span className="t10 text-center leading-tight text-muted">
              {l.label}
              {l.price != null && <><br />${l.price}</>}
            </span>
          </div>
        ))}
      </div>

      <div className="relative mx-auto h-10 w-full max-w-sm">
        <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="screenArc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-line)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--color-blue)" />
              <stop offset="100%" stopColor="var(--color-line)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M10,34 Q200,2 390,34" fill="none" stroke="url(#screenArc)" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="absolute inset-x-0 bottom-0 text-center t10 font-semibold uppercase tracking-[0.4em] text-faint">Escenario</p>
      </div>

      <div className="space-y-1.5 overflow-x-auto pb-1">
        <div className="min-w-max space-y-1.5">
          {THEATER_ROW_LETTERS.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-4 shrink-0 text-center t10 font-semibold text-faint">{row}</span>
              <div className="flex gap-2.5">
                {seatGroupsForRow(row).map(([from, to], groupIdx) => (
                  <div key={groupIdx} className="flex gap-1">
                    {Array.from({ length: to - from + 1 }, (_, i) => from + i).map((seat) => {
                      const key = seatKey(row, seat);
                      const taken = isSeatTaken(tickets, showId, row, seat);
                      const isSelected = selected.includes(key);
                      return (
                        <button
                          key={seat}
                          type="button"
                          disabled={taken}
                          onClick={() => onToggle(row, seat)}
                          title={`Fila ${row} · Asiento ${seat}`}
                          className={`flex h-9 w-7 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md transition-colors ${
                            taken
                              ? "cursor-not-allowed bg-line"
                              : isSelected
                              ? "bg-teal"
                              : isCenterSeat(seat)
                              ? "bg-bronze/25 hover:bg-bronze/40"
                              : "bg-blue/20 hover:bg-blue/35"
                          }`}
                        >
                          <Armchair
                            size={15}
                            className={taken ? "text-faint" : isSelected ? "text-white" : isCenterSeat(seat) ? "text-bronze-dark" : "text-blue-dark"}
                          />
                          <span className={`t10 leading-none ${taken ? "text-faint" : isSelected ? "text-white" : "text-ink/70"}`}>{seat}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <span className="w-4 shrink-0 text-center t10 font-semibold text-faint">{row}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
