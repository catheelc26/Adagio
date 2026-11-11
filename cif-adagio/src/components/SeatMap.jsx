import { ArrowLeftRight, Armchair } from "lucide-react";
import { CENTER_PRICE, SIDE_PRICE, THEATER_ROW_LETTERS, isCenterSeat, isSeatTaken, seatGroupsForRow, seatKey } from "../lib/tickets";

// Azul vibrante y rojo navideño (como en el arte de "El Cascanueces"), gris
// para ocupado y el verde-azulado de la marca para el asiento elegido —
// asientos como siluetas de butaca llenas de color, no cuadros.
const SEAT_COLORS = {
  lateral: { fill: "#2F6FEE", stroke: "#1D4ED8" },
  centro: { fill: "#C8102E", stroke: "#960E22" },
  selected: { fill: "#0D9488", stroke: "#0B766B" },
  taken: { fill: "#9CA3AF", stroke: "#7C838C" },
};

const LEGEND = [
  { label: "Lateral", price: SIDE_PRICE, colors: SEAT_COLORS.lateral },
  { label: "Centro", price: CENTER_PRICE, colors: SEAT_COLORS.centro },
  { label: "Elegido", price: null, colors: SEAT_COLORS.selected },
  { label: "Ocupado", price: null, colors: SEAT_COLORS.taken },
];

/**
 * Mapa de butacas del teatro: 16 filas (A a la Ñ, y la fila O al fondo) de
 * 21 asientos cada una, agrupados en 3 bloques (izquierdo, centro, derecho)
 * con pasillos bien marcados entre ellos. Los asientos 8 a 14 son la
 * sección central (resaltada, $12); el resto son laterales ($10). La fila O
 * tiene los pasillos corridos un puesto hacia cada lado. Los asientos ya
 * vendidos quedan deshabilitados; los seleccionados se marcan.
 */
export function SeatMap({ showId, tickets, selected, onToggle }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl bg-cream-dim px-4 py-3">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex flex-col items-center gap-0.5">
            <Armchair size={24} strokeWidth={1.5} fill={l.colors.fill} stroke={l.colors.stroke} />
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

      {/* Antes se encogían las 21 columnas para que cupieran sin deslizar el
          dedo — pero eso hacía los asientos casi imposibles de tocar bien.
          Ahora se quedan a su tamaño real (fácil de tocar) y, si no caben
          todas en la pantalla, simplemente se desliza hacia los lados — las
          letras de fila quedan fijas para no perderse. */}
      <p className="flex items-center justify-center gap-1.5 t11 text-muted">
        <ArrowLeftRight size={13} /> Desliza hacia los lados para ver todos los asientos
      </p>
      {/* -mx-5 compensa el padding lateral de la pantalla de compra (px-5) para
          aprovechar todo el ancho disponible. */}
      <div className="-mx-5 overflow-x-auto px-5 pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="w-max space-y-3">
          {THEATER_ROW_LETTERS.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="sticky left-0 z-10 w-5 shrink-0 bg-cream text-center t10 font-semibold text-faint">{row}</span>
              <div className="flex gap-4">
                {seatGroupsForRow(row).map(([from, to], groupIdx) => (
                  <div key={groupIdx} className="flex gap-1.5">
                    {Array.from({ length: to - from + 1 }, (_, i) => from + i).map((seat) => {
                      const key = seatKey(row, seat);
                      const taken = isSeatTaken(tickets, showId, row, seat);
                      const isSelected = selected.includes(key);
                      const colors = taken
                        ? SEAT_COLORS.taken
                        : isSelected
                        ? SEAT_COLORS.selected
                        : isCenterSeat(seat)
                        ? SEAT_COLORS.centro
                        : SEAT_COLORS.lateral;
                      return (
                        <button
                          key={seat}
                          type="button"
                          disabled={taken}
                          onClick={() => onToggle(row, seat)}
                          title={`Fila ${row} · Asiento ${seat}`}
                          className={`relative flex h-10 w-9 shrink-0 items-center justify-center transition-transform ${
                            taken ? "cursor-not-allowed" : "hover:scale-110 active:scale-95"
                          }`}
                        >
                          <Armchair size={28} strokeWidth={1.5} fill={colors.fill} stroke={colors.stroke} />
                          {isSelected && (
                            <span className="pointer-events-none absolute bottom-[6px] t10 font-semibold text-white">{seat}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <span className="sticky right-0 z-10 w-5 shrink-0 bg-cream text-center t10 font-semibold text-faint">{row}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
