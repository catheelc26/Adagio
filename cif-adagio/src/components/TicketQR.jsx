import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { seatSection } from "../lib/tickets";

// Prefijo para que el escáner de administración distingua un QR de entrada
// de cualquier otro código que alguien pudiera apuntar a la cámara.
export const ticketQrPayload = (ticketId) => `ADAGIO-TICKET:${ticketId}`;
export const parseTicketQrPayload = (text) => (text?.startsWith("ADAGIO-TICKET:") ? text.slice("ADAGIO-TICKET:".length) : null);

/** Tarjeta imprimible de una entrada, con su código QR (fila + asiento codificados por id). */
export function TicketQR({ ticket, show }) {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(ticketQrPayload(ticket.id), { width: 220, margin: 1, color: { dark: "#2B3238", light: "#FFFFFF" } })
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ticket.id]);

  return (
    <div className="ticket-card">
      <div className="relative h-32 overflow-hidden rounded-t-2xl">
        <img src="/brand/cascanueces-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/5" />
        <div className="relative flex h-full flex-col items-center justify-end pb-2.5 text-center">
          <p className="t10 font-semibold uppercase tracking-[0.4em] text-bronze-light/90">CIF Adagio</p>
          <p className="font-ticket text-2xl italic leading-tight text-cream">{show?.title || "Función"}</p>
          {show?.date && (
            <p className="t11 text-cream/75">
              {new Date(`${show.date}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              {show.time ? ` · ${show.time}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="ticket-perforation" />

      <div className="flex items-center gap-4 rounded-b-2xl bg-paper p-5">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl text-ink">Fila {ticket.row} · Asiento {ticket.seat}</p>
          <p className="t12 text-muted">{seatSection(ticket.seat)} · ${ticket.price}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ticket.checkedIn && (
              <span className="t11 rounded-full bg-teal/15 px-3 py-1 font-medium text-teal-dark">Ya fue escaneada</span>
            )}
            {!ticket.checkedIn && ticket.confirmed === false && (
              <span className="t11 rounded-full bg-bronze/15 px-3 py-1 font-medium text-bronze-dark">Pago por confirmar</span>
            )}
          </div>
        </div>
        {qr ? (
          <img src={qr} alt="Código QR de la entrada" className="h-24 w-24 shrink-0" />
        ) : (
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-cream-dim" />
        )}
      </div>
    </div>
  );
}
