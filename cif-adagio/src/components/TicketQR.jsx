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
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="bg-ink px-4 py-3 text-center">
        <p className="t11 font-semibold uppercase tracking-[0.3em] text-cream/80">CIF Adagio</p>
        <p className="t13 mt-0.5 text-cream">{show?.title || "Función"}</p>
        {show?.date && (
          <p className="t11 text-cream/70">
            {new Date(`${show.date}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            {show.time ? ` · ${show.time}` : ""}
          </p>
        )}
      </div>
      <div className="flex flex-col items-center gap-3 p-5">
        {qr ? (
          <img src={qr} alt="Código QR de la entrada" className="h-40 w-40" />
        ) : (
          <div className="h-40 w-40 animate-pulse rounded-xl bg-cream-dim" />
        )}
        <div className="text-center">
          <p className="font-display text-xl text-ink">Fila {ticket.row} · Asiento {ticket.seat}</p>
          <p className="t12 text-muted">{seatSection(ticket.seat)} · ${ticket.price}</p>
        </div>
        {ticket.checkedIn && (
          <span className="t11 rounded-full bg-teal/15 px-3 py-1 font-medium text-teal-dark">Ya fue escaneada</span>
        )}
        {!ticket.checkedIn && ticket.confirmed === false && (
          <span className="t11 rounded-full bg-bronze/15 px-3 py-1 font-medium text-bronze-dark">Pago por confirmar</span>
        )}
      </div>
    </div>
  );
}
