"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PaypalNamespace = {
  Buttons: (config: {
    style?: Record<string, string>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => void;
    onCancel: () => void;
    onError: (err: unknown) => void;
  }) => { render: (selector: string) => void };
};

declare global {
  interface Window {
    paypal_onetime?: PaypalNamespace;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadPaypalOneTimeSdk(clientId: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.paypal_onetime) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&intent=capture&currency=USD&enable-funding=card`;
    script.dataset.namespace = "paypal_onetime";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPal."));
    document.body.appendChild(script);
  });

  return sdkPromise;
}

export function PaypalOneTimeButton({
  planId,
  clientId,
}: {
  planId: string;
  clientId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadPaypalOneTimeSdk(clientId)
      .then(() => {
        if (cancelled || !window.paypal_onetime || !containerRef.current) return;

        window.paypal_onetime
          .Buttons({
            style: { shape: "pill", layout: "horizontal" },
            createOrder: async () => {
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error ?? "No se pudo crear la orden.");
              return data.id as string;
            },
            onApprove: async (data) => {
              setIsConfirming(true);
              try {
                const response = await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: data.orderID, planId }),
                });
                if (!response.ok) throw new Error("No se pudo confirmar el pago.");
                router.push("/perfil?checkout=success");
                router.refresh();
              } catch {
                setIsConfirming(false);
                setError("Se completó el pago en PayPal, pero no pudimos confirmarlo en el sitio. Escríbenos si tu acceso no se activa.");
              }
            },
            onCancel: () => {
              router.push("/precios?checkout=cancelled");
            },
            onError: () => {
              setError("Ocurrió un problema con el pago. Intenta de nuevo.");
            },
          })
          .render(`#paypal-onetime-button-${planId}`);
      })
      .catch(() => setError("No se pudo cargar PayPal. Revisa tu conexión e intenta de nuevo."));

    return () => {
      cancelled = true;
    };
  }, [planId, clientId, router]);

  if (isConfirming) {
    return <p className="text-center text-sm text-cream-dim/70">Confirmando tu pago…</p>;
  }

  return (
    <div>
      <div id={`paypal-onetime-button-${planId}`} ref={containerRef} />
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
