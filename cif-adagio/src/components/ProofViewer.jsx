import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { COLLECTIONS, getImage } from "../lib/db";

export function ProofViewer({ transactionId, onClose }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getImage(COLLECTIONS.paymentProofs, transactionId)
      .then((val) => {
        if (!cancelled) setSrc(val);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="modal-panel w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex justify-end">
          <button onClick={onClose} className="rounded-full bg-ink p-1.5 text-white">
            <X size={16} />
          </button>
        </div>
        <div className="flex min-h-[30rem] items-center justify-center overflow-hidden rounded-xl bg-white">
          {error && <p className="t13 p-6 text-muted">No se pudo cargar el comprobante.</p>}
          {!error && !src && <p className="t13 p-6 text-muted">Cargando…</p>}
          {src && <img src={src} alt="Comprobante de pago" className="h-auto w-full" />}
        </div>
      </div>
    </div>
  );
}
