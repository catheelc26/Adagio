import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default function OlvidePasswordPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-20">
      <Eyebrow>¿Olvidaste tu contraseña?</Eyebrow>
      <h1 className="mt-2 font-serif text-3xl text-cream">Recupera el acceso a tu cuenta</h1>
      <p className="mt-3 text-sm leading-relaxed text-cream-dim/70">
        Escribe el email con el que te registraste y te enviaremos un enlace
        para elegir una nueva contraseña.
      </p>

      <div className="mt-8 rounded-2xl border border-cream/10 bg-navy-900/60 p-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
