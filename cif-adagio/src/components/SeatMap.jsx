import { CENTER_PRICE, SIDE_PRICE, THEATER_ROWS, THEATER_SEAT_LETTERS, isCenterRow, isSeatTaken, seatKey } from "../lib/tickets";

/**
 * Mapa de butacas del teatro: 21 filas × 15 asientos. Las filas 8–14 son la
 * sección central (resaltada, $12); el resto son laterales ($10). Los
 * asientos ya vendidos quedan deshabilitados; los seleccionados se marcan.
 */
export function SeatMap({ showId, tickets, selected, onToggle }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-ink py-2 text-center">
        <p className="t11 font-semibold uppercase tracking-[0.3em] text-cream/80">Escenario</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-blue/20" />
          <span className="t10 text-muted">Lateral ${SIDE_PRICE}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-bronze/25" />
          <span className="t10 text-muted">Centro ${CENTER_PRICE}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-line" />
          <span className="t10 text-muted">Ocupado</span>
        </div>
      </div>

      <div className="space-y-1 overflow-x-auto pb-1">
        <div className="min-w-max space-y-1">
          {THEATER_ROWS.map((row) => (
            <div key={row} className={`flex items-center gap-1.5 rounded-lg px-1 py-0.5 ${isCenterRow(row) ? "bg-bronze/5" : ""}`}>
              <span className="w-5 shrink-0 text-center t10 font-semibold text-faint">{row}</span>
              <div className="flex gap-1">
                {THEATER_SEAT_LETTERS.map((seat) => {
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
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded t10 font-medium transition-colors ${
                        taken
                          ? "cursor-not-allowed bg-line text-faint"
                          : isSelected
                          ? "bg-teal text-white"
                          : isCenterRow(row)
                          ? "bg-bronze/25 text-bronze-dark hover:bg-bronze/40"
                          : "bg-blue/20 text-blue-dark hover:bg-blue/35"
                      }`}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
