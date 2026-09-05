"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscriptionAction } from "@/lib/actions/subscription";

export function CancelSubscriptionButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("¿Cancelar tu suscripción? Mantendrás el acceso hasta el final del periodo ya pagado.")) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const result = await cancelSubscriptionAction();
            if (result.error) {
              setError(result.error);
            } else {
              router.refresh();
            }
          });
        }}
        className="w-full rounded-full border border-cream/20 px-5 py-2.5 text-sm text-cream-dim/80 transition-colors hover:border-red-400/50 hover:text-red-400 disabled:opacity-60"
      >
        {isPending ? "Cancelando…" : "Cancelar suscripción"}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
