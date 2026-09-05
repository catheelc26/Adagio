import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
};

export default async function RestablecerPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-20">
      <Eyebrow>Nueva contraseña</Eyebrow>
      <h1 className="mt-2 font-serif text-3xl text-cream">Elige tu nueva contraseña</h1>

      <div className="mt-8 rounded-2xl border border-cream/10 bg-navy-900/60 p-8">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-cream-dim/80">
              Este enlace no es válido. Solicita uno nuevo para restablecer tu contraseña.
            </p>
            <Link href="/olvide-password" className="text-sm text-gold hover:underline">
              Solicitar enlace de recuperación
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
