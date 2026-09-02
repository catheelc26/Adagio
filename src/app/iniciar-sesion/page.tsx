import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/biblioteca");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-20">
      <Eyebrow>Hola de nuevo</Eyebrow>
      <h1 className="mt-2 font-serif text-3xl text-cream">
        Inicia sesión en tu ecosistema
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-cream-dim/70">
        Accede a tu perfil, tus clases favoritas y la biblioteca completa de
        The Adagio Method.
      </p>

      <div className="mt-8 rounded-2xl border border-cream/10 bg-navy-900/60 p-8">
        <LoginForm />
      </div>
    </div>
  );
}
