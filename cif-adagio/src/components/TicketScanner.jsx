import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { CheckCircle2, Search, ShieldAlert, X } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { parseTicketQrPayload } from "./TicketQR";
import { seatSection } from "../lib/tickets";
import { inputCls } from "./ui";

/**
 * Escáner de entradas para el equipo en la puerta: enciende la cámara, lee el
 * código QR con jsQR (funciona en cualquier navegador, incluido Safari) y
 * busca la entrada correspondiente dentro de los tickets ya cargados. Incluye
 * una búsqueda manual por si la cámara no está disponible.
 */
export function TicketScanner({ onClose }) {
  const { tickets, shows, toast } = useAppData();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);

  const [cameraError, setCameraError] = useState("");
  const [result, setResult] = useState(null); // { ticket } | { notFoundCode } | null
  const [manualCode, setManualCode] = useState("");

  const lookup = (rawCode) => {
    const id = parseTicketQrPayload(rawCode) || rawCode.trim();
    const ticket = tickets.items.find((t) => t.id === id);
    pausedRef.current = true;
    setResult(ticket ? { ticket } : { notFoundCode: id });
  };

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        const tick = () => {
          if (cancelled) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!pausedRef.current && video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code?.data) lookup(code.data);
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => {
        if (!cancelled) setCameraError("No se pudo acceder a la cámara. Puedes buscar la entrada manualmente abajo.");
      });
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rescan = () => {
    setResult(null);
    pausedRef.current = false;
  };

  const checkIn = async () => {
    if (!result?.ticket) return;
    await tickets.update(result.ticket.id, { checkedIn: true, checkedInAt: new Date().toISOString() });
    toast("Entrada marcada como escaneada.");
    setResult({ ticket: { ...result.ticket, checkedIn: true, checkedInAt: new Date().toISOString() } });
  };

  const show = result?.ticket ? shows.items.find((s) => s.id === result.ticket.showId) : null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="modal-panel max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-cream shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream px-5 pb-3 pt-5">
          <h3 className="font-display text-lg text-ink">Verificar entrada</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {!result && (
            <>
              <div className="relative overflow-hidden rounded-2xl bg-ink">
                <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-cream/70" />
              </div>
              {cameraError && <p className="t13 text-wine">{cameraError}</p>}
              <p className="t11 text-center text-muted">Apunta la cámara al código QR de la entrada.</p>
            </>
          )}

          {result?.ticket && (
            <div className="rounded-2xl border border-line bg-paper p-4 text-center">
              {result.ticket.checkedIn ? (
                <ShieldAlert size={30} className="mx-auto mb-2 text-bronze-dark" />
              ) : (
                <CheckCircle2 size={30} className="mx-auto mb-2 text-teal" />
              )}
              <p className="font-display text-xl text-ink">Fila {result.ticket.row} · Asiento {result.ticket.seat}</p>
              <p className="t12 text-muted">{seatSection(result.ticket.row)} · ${result.ticket.price} · {show?.title || "Función"}</p>
              <p className="t12 mt-1 text-ink">{result.ticket.buyerName}</p>
              {result.ticket.confirmed === false && <p className="t11 mt-2 text-wine">Pago aún sin confirmar por administración.</p>}
              {result.ticket.checkedIn ? (
                <p className="t12 mt-3 font-medium text-bronze-dark">
                  Esta entrada ya fue escaneada{result.ticket.checkedInAt ? ` — ${new Date(result.ticket.checkedInAt).toLocaleString("es-ES")}` : ""}.
                </p>
              ) : (
                <button onClick={checkIn} className="btn btn-primary mt-3 w-full">Marcar como escaneada</button>
              )}
              <button onClick={rescan} className="btn btn-ghost mt-2 w-full">Escanear otra</button>
            </div>
          )}

          {result?.notFoundCode && (
            <div className="rounded-2xl border border-wine/30 bg-wine/5 p-4 text-center">
              <ShieldAlert size={30} className="mx-auto mb-2 text-wine" />
              <p className="t13 text-ink">Ese código no corresponde a ninguna entrada registrada.</p>
              <button onClick={rescan} className="btn btn-ghost mt-3 w-full">Intentar de nuevo</button>
            </div>
          )}

          <div className="border-t border-line-soft pt-4">
            <p className="t11 mb-2 font-medium uppercase tracking-wide text-muted">Buscar manualmente</p>
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="Código o id de la entrada"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <button
                onClick={() => manualCode.trim() && lookup(manualCode.trim())}
                className="btn btn-ghost shrink-0"
              >
                <Search size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
