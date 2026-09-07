"use client";

import { useEffect, useRef, useState } from "react";

type PaypalNamespace = {
  HostedButtons: (config: { hostedButtonId: string }) => { render: (selector: string) => void };
};

declare global {
  interface Window {
    paypal_hosted?: PaypalNamespace;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadHostedButtonsSdk(clientId: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.paypal_hosted) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=hosted-buttons&disable-funding=venmo&currency=USD`;
    script.dataset.namespace = "paypal_hosted";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPal."));
    document.body.appendChild(script);
  });

  return sdkPromise;
}

// Este es el botón que genera PayPal desde su propia herramienta sin código
// (Pagos del sitio web → Botones de pago). PayPal decide ahí mismo, según la
// cuenta, si mostrar solo el botón de PayPal o también uno de tarjeta —
// nuestro código solo lo incrusta tal cual.
export function PaypalHostedButton({
  hostedButtonId,
  clientId,
}: {
  hostedButtonId: string;
  clientId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadHostedButtonsSdk(clientId)
      .then(() => {
        if (cancelled || !window.paypal_hosted || !containerRef.current) return;
        window.paypal_hosted
          .HostedButtons({ hostedButtonId })
          .render(`#paypal-hosted-button-${hostedButtonId}`);
      })
      .catch(() => setError("No se pudo cargar PayPal. Revisa tu conexión e intenta de nuevo."));

    return () => {
      cancelled = true;
    };
  }, [hostedButtonId, clientId]);

  return (
    <div>
      <div id={`paypal-hosted-button-${hostedButtonId}`} ref={containerRef} />
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
