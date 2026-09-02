"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import type { FormState } from "@/lib/actions/auth";

const initialState: FormState = {};

export function ProfileForm({ name, bio }: { name: string; bio: string }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm text-cream-dim/80">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={name}
          required
          className="mt-1.5 w-full rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-cream outline-none focus:border-gold"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm text-cream-dim/80">
          Biografía
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={bio}
          placeholder="Cuéntanos un poco sobre ti y tu recorrido en la danza."
          className="mt-1.5 w-full resize-none rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-cream outline-none focus:border-gold"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
