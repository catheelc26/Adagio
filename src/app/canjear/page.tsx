import type { Metadata } from "next";
import { auth } from "@/auth";
import { RedeemGiftForm } from "@/components/redeem-gift-form";
import { Eyebrow, ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Canjear código de regalo",
};

export default async function CanjearPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const { codigo } = await searchParams;
  const session = await auth();

  const callbackUrl = codigo ? `/canjear?codigo=${encodeURIComponent(codigo)}` : "/canjear";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-20">
      <Eyebrow>Un regalo para ti</Eyebrow>
      <h1 className="mt-2 font-serif text-3xl text-cream">Canjea tu código</h1>
      <p className="mt-3 text-sm leading-relaxed text-cream-dim/70">
        Alguien te regaló acceso completo a The Adagio Method. Escribe el
        código que recibiste para activarlo.
      </p>

      <div className="mt-8 rounded-2xl border border-cream/10 bg-navy-900/60 p-8">
        {session?.user ? (
          <RedeemGiftForm defaultCode={codigo} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-cream-dim/80">
              Primero necesitas una cuenta (es gratis) o iniciar sesión si ya tienes una.
            </p>
            <ButtonLink href={`/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="w-full">
              Crear cuenta
            </ButtonLink>
            <ButtonLink
              href={`/iniciar-sesion?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              variant="secondary"
              className="w-full"
            >
              Ya tengo cuenta
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
