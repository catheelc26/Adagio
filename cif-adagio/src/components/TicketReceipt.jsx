import { paymentMethodInfo } from "../lib/constants";
import { usd } from "../lib/format";
import { seatSection } from "../lib/tickets";
import { Barre } from "./Decor";

/**
 * Resumen de una compra de entradas con todos los asientos juntos — se
 * muestra antes de las tarjetas individuales de cada entrada cuando la
 * persona compró más de un asiento en la misma transacción.
 */
export function TicketReceipt({ tickets, show }) {
  if (!tickets || tickets.length === 0) return null;
  const first = tickets[0];
  const sorted = tickets.slice().sort((a, b) => (a.row === b.row ? a.seat - b.seat : a.row.localeCompare(b.row)));
  const total = tickets.reduce((s, t) => s + (t.price || 0), 0);

  return (
    <div className="rounded-2xl border border-line bg-paper p-5 shadow-soft">
      <div className="mb-3 text-center">
        <p className="font-display text-lg text-ink">CIF Adagio</p>
        <p className="t12 text-muted">{show?.title || "Función"}</p>
      </div>
      <Barre className="mb-3" />
      <div className="t13 mb-3 space-y-1 text-ink">
        <p><span className="text-muted">Comprador:</span> {first.buyerName}</p>
        <p><span className="text-muted">Fecha:</span> {first.date}</p>
        <p><span className="text-muted">Método:</span> {paymentMethodInfo(first.method).label}</p>
        {first.reference && <p><span className="text-muted">Referencia:</span> {first.reference}</p>}
      </div>
      <div className="mb-3 divide-y divide-line-soft border-y border-line-soft">
        {sorted.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-2 t13">
            <span className="text-ink">
              Fila {t.row} · Asiento {t.seat} <span className="text-faint">({seatSection(t.seat)})</span>
            </span>
            <span className="font-medium text-ink">{usd(t.price)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-display text-base text-ink">Total · {tickets.length} asiento{tickets.length > 1 ? "s" : ""}</span>
        <span className="font-display text-lg text-ink">{usd(total)}</span>
      </div>
      {first.confirmed === false && (
        <p className="t11 mt-2 text-center text-bronze-dark">Pago por confirmar</p>
      )}
    </div>
  );
}
