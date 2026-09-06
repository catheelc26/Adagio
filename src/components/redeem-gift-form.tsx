"use client";

import { useActionState } from "react";
import Link from "next/link";
import { redeemGiftCodeAction, type RedeemState } from "@/lib/actions/gift-codes";

const initialState: RedeemState = {};

export function RedeemGiftForm({ defaultCode }: { defaultCode?: string }) {
  const [state, formAction, isPending] = useActionState(redeemGiftCodeAction, initialState);

  if (state.success) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-cream-dim/80">
          Listo, ya tienes acceso completo a la biblioteca.
        </p>
        <Link
          href="/biblioteca"
          className="inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light"
        >
          Ir a la biblioteca
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="code" className="block text-sm text-cream-dim/80">
          Código de regalo
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          defaultValue={defaultCode}
          autoCapitalize="characters"
          autoComplete="off"
          className="mt-1.5 w-full rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-center font-mono text-lg tracking-[0.2em] text-cream outline-none focus:border-gold"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {isPending ? "Canjeando…" : "Canjear código"}
      </button>
    </form>
  );
}
