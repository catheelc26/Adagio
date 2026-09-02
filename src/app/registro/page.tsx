import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/register-form";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/biblioteca");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-20">
      <Eyebrow>Bienvenida</Eyebrow>
      <h1 className="mt-2 font-serif text-3xl text-cream">
        Únete al ecosistema Adagio
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-cream-dim/70">
        Crea tu cuenta gratis para guardar tus clases favoritas y llevar tu
        progreso. Podrás suscribirte cuando quieras para desbloquear la
        biblioteca completa.
      </p>

      <div className="mt-8 rounded-2xl border border-cream/10 bg-navy-900/60 p-8">
        <RegisterForm />
      </div>
    </div>
  );
}
