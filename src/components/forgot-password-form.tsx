"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type FormState } from "@/lib/actions/auth";

const initialState: FormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <p className="text-sm leading-relaxed text-cream-dim/80">
        Si existe una cuenta con ese email, te acabamos de enviar un enlace
        para restablecer tu contraseña. Revisa también la carpeta de spam.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm text-cream-dim/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-cream outline-none focus:border-gold"
        />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {isPending ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>

      <p className="text-center text-sm text-cream-dim/70">
        <Link href="/iniciar-sesion" className="text-gold hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
