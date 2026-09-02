"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "@/lib/actions/auth";

const initialState: FormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

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
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-cream-dim/80">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-cream outline-none focus:border-gold"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {isPending ? "Entrando…" : "Iniciar sesión"}
      </button>

      <p className="text-center text-sm text-cream-dim/70">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="text-gold hover:underline">
          Únete al ecosistema
        </Link>
      </p>
    </form>
  );
}
