"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string>;
        createSubscription: (
          data: unknown,
          actions: { subscription: { create: (opts: { plan_id: string }) => Promise<string> } }
        ) => Promise<string>;
        onApprove: (data: { subscriptionID?: string }) => void;
        onCancel: () => void;
        onError: (err: unknown) => void;
      }) => { render: (selector: string) => void };
    };
  }
}

let sdkPromise: Promise<void> | null = null;

function loadPaypalSdk(clientId: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&currency=USD`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPal."));
    document.body.appendChild(script);
  });

  return sdkPromise;
}

export function PaypalSubscribeButton({
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

    loadPaypalSdk(clientId)
      .then(() => {
        if (cancelled || !window.paypal || !containerRef.current) return;

        window.paypal
          .Buttons({
            style: { shape: "pill", color: "gold", label: "subscribe", layout: "horizontal" },
            createSubscription: (_data, actions) =>
              actions.subscription.create({ plan_id: planId }),
            onApprove: async (data) => {
              if (!data.subscriptionID) return;
              setIsConfirming(true);
              try {
                const response = await fetch("/api/paypal/confirm-subscription", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ subscriptionId: data.subscriptionID }),
                });
                if (!response.ok) {
                  throw new Error("No se pudo confirmar la suscripción.");
                }
                router.push("/perfil?checkout=success");
                router.refresh();
              } catch {
                setIsConfirming(false);
                setError("Se aprobó el pago en PayPal, pero no pudimos confirmarlo en el sitio. Escríbenos si tu acceso no se activa.");
              }
            },
            onCancel: () => {
              router.push("/precios?checkout=cancelled");
            },
            onError: () => {
              setError("Ocurrió un problema con PayPal. Intenta de nuevo.");
            },
          })
          .render(`#paypal-button-${planId}`);
      })
      .catch(() => setError("No se pudo cargar PayPal. Revisa tu conexión e intenta de nuevo."));

    return () => {
      cancelled = true;
    };
  }, [planId, clientId, router]);

  if (isConfirming) {
    return <p className="text-center text-sm text-cream-dim/70">Confirmando tu suscripción…</p>;
  }

  return (
    <div>
      <div id={`paypal-button-${planId}`} ref={containerRef} />
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
