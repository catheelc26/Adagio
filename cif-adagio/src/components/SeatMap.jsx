import { CENTER_PRICE, SIDE_PRICE, THEATER_ROW_LETTERS, isCenterSeat, isSeatTaken, seatGroupsForRow, seatKey } from "../lib/tickets";

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
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded t10 font-medium transition-colors ${
                            taken
                              ? "cursor-not-allowed bg-line text-faint"
                              : isSelected
                              ? "bg-teal text-white"
                              : isCenterSeat(seat)
                              ? "bg-bronze/25 text-bronze-dark hover:bg-bronze/40"
                              : "bg-blue/20 text-blue-dark hover:bg-blue/35"
                          }`}
                        >
                          {seat}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
