import type { Metadata } from "next";
import { auth } from "@/auth";
import { PLANS } from "@/lib/plans";
import { isPaypalConfigured } from "@/lib/paypal";
import { hasActiveAccess } from "@/lib/subscription";
import { SectionHeading, ButtonLink, Card } from "@/components/ui";
import { PaypalSubscribeButton } from "@/components/paypal-subscribe-button";
import { PaypalHostedButton } from "@/components/paypal-hosted-button";

export const metadata: Metadata = {
  title: "Precios",
  description: "Planes de suscripción de The Adagio Method: acceso completo a los 8 pilares del ecosistema.",
};

export default async function PreciosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkout?: string }>;
}) {
  const { error, checkout } = await searchParams;
  const session = await auth();
  const alreadyHasAccess = session?.user
    ? await hasActiveAccess(session.user.id, session.user.role)
    : false;

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
      <SectionHeading
        eyebrow="Únete al ecosistema"
        title="Un solo plan, ocho pilares completos"
        description="Tu suscripción da acceso a toda la biblioteca de The Adagio Method: Ballet, Fisioterapia, Pilates/PBT, Yoga, Meditación, Anatomía, Biomecánica y Conciencia Corporal."
        align="center"
      />

      {checkout === "cancelled" && (
        <p className="mx-auto mt-8 max-w-md rounded-lg border border-cream/15 bg-navy-900/60 px-4 py-3 text-center text-sm text-cream-dim/70">
          Has cancelado el proceso de pago. Puedes intentarlo de nuevo cuando quieras.
        </p>
      )}
      {error === "paypal-not-configured" && (
        <p className="mx-auto mt-8 max-w-md rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-center text-sm text-cream-dim/80">
          Los pagos todavía no están configurados en este entorno. Añade tus
          claves de PayPal en <code>.env</code> para activarlos.
        </p>
      )}

      {alreadyHasAccess ? (
        <Card className="mx-auto mt-14 max-w-md text-center">
          <h2 className="font-serif text-xl text-cream">Ya tienes acceso completo</h2>
          <p className="mt-2 text-sm text-cream-dim/70">
            Tu cuenta ya puede ver toda la biblioteca — no necesitas suscribirte.
          </p>
          <ButtonLink href="/biblioteca" className="mt-6 w-full">
            Ir a la biblioteca
          </ButtonLink>
        </Card>
      ) : (
        <>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.featured
                    ? "border-gold bg-gold/5"
                    : "border-cream/10 bg-navy-900/50"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-gold px-3 py-1 text-xs font-medium text-navy-950">
                    Más popular
                  </span>
                )}
                <h2 className="font-serif text-xl text-cream">{plan.name}</h2>
                <p className="mt-1 text-sm text-cream-dim/65">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="font-serif text-4xl text-cream">{plan.price}</span>
                  <span className="text-sm text-cream-dim/60">{plan.cadence}</span>
                </p>

                <ul className="mt-6 space-y-3 text-sm text-cream-dim/75">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 space-y-4">
                  {session?.user ? (
                    isPaypalConfigured && plan.planId ? (
                      <>
                        <PaypalSubscribeButton
                          planId={plan.planId}
                          clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
                        />
                        {plan.hostedButtonId && (
                          <>
                            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-cream-dim/40">
                              <span className="h-px flex-1 bg-cream/10" />
                              o paga una vez
                              <span className="h-px flex-1 bg-cream/10" />
                            </div>
                            <PaypalHostedButton
                              hostedButtonId={plan.hostedButtonId}
                              clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
                            />
                            <p className="text-center text-[11px] text-cream-dim/45">
                              Pago único con tarjeta o PayPal, sin renovación automática.
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full cursor-not-allowed rounded-full px-6 py-3 text-sm font-medium opacity-50 border border-gold/50 text-gold"
                      >
                        Elegir {plan.name.toLowerCase()}
                      </button>
                    )
                  ) : (
                    <ButtonLink
                      href="/registro"
                      variant={plan.featured ? "primary" : "secondary"}
                      className="w-full"
                    >
                      Crear cuenta para suscribirme
                    </ButtonLink>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-lg text-center text-xs text-cream-dim/50">
            Los precios incluyen impuestos aplicables. Puedes cancelar tu
            suscripción en cualquier momento desde tu perfil. Al suscribirte
            aceptas nuestros{" "}
            <a href="/terminos" className="text-gold hover:underline">
              Términos de servicio
            </a>{" "}
            y nuestra{" "}
            <a href="/privacidad" className="text-gold hover:underline">
              Política de privacidad
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}
