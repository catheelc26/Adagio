"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "@/lib/actions/auth";

const initialState: FormState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm text-cream-dim/80">
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-1.5 w-full rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-cream outline-none focus:border-gold"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.name[0]}</p>
        )}
      </div>

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

      <div>
        <label htmlFor="password" className="block text-sm text-cream-dim/80">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="mt-1.5 w-full rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-cream outline-none focus:border-gold"
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {isPending ? "Creando tu cuenta…" : "Crear mi cuenta"}
      </button>

      <p className="text-center text-sm text-cream-dim/70">
        ¿Ya tienes cuenta?{" "}
        <Link href="/iniciar-sesion" className="text-gold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
