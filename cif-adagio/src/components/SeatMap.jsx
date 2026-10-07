import { useLayoutEffect, useRef, useState } from "react";
import { Armchair } from "lucide-react";
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

/** Encoge el contenido (vía transform: scale) para que quepa en el ancho
 * disponible sin desbordarse — así se ven todas las butacas sin tener que
 * deslizar el dedo a los lados. Nunca agranda más allá del tamaño natural. */
function useFitWidth() {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const recalc = () => {
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;
      const wrapperWidth = wrapper.clientWidth;
      if (!contentWidth || !wrapperWidth) return;
      const nextScale = Math.min(1, wrapperWidth / contentWidth);
      setScale(nextScale);
      setHeight(contentHeight * nextScale);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  return { wrapperRef, contentRef, scale, height };
}

/**
 * Mapa de butacas del teatro: 16 filas (A a la Ñ, y la fila O al fondo) de
 * 21 asientos cada una, agrupados en 3 bloques (izquierdo, centro, derecho)
 * con pasillos bien marcados entre ellos. Los asientos 8 a 14 son la
 * sección central (resaltada, $12); el resto son laterales ($10). La fila O
 * tiene los pasillos corridos un puesto hacia cada lado. Los asientos ya
 * vendidos quedan deshabilitados; los seleccionados se marcan.
 */
export function SeatMap({ showId, tickets, selected, onToggle }) {
  const { wrapperRef, contentRef, scale, height } = useFitWidth();

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

      {/* -mx-5 compensa el padding lateral de la pantalla de compra (px-5) para
          aprovechar todo el ancho disponible y que quepan las 21 columnas. */}
      <div ref={wrapperRef} className="-mx-5" style={height ? { height } : undefined}>
        <div
          ref={contentRef}
          className="w-max space-y-2 px-1"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {THEATER_ROW_LETTERS.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-3 shrink-0 text-center t10 font-semibold text-faint">{row}</span>
              <div className="flex gap-5">
                {seatGroupsForRow(row).map(([from, to], groupIdx) => (
                  <div key={groupIdx} className="flex gap-1">
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
                          className={`relative flex h-8 w-7 shrink-0 items-center justify-center transition-transform ${
                            taken ? "cursor-not-allowed" : "hover:scale-110"
                          }`}
                        >
                          <Armchair size={24} strokeWidth={1.5} fill={colors.fill} stroke={colors.stroke} />
                          {isSelected && (
                            <span className="pointer-events-none absolute bottom-[5px] t10 font-semibold text-white">{seat}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <span className="w-3 shrink-0 text-center t10 font-semibold text-faint">{row}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
