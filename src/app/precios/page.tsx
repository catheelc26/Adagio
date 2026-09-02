import type { Metadata } from "next";
import { auth } from "@/auth";
import { PLANS } from "@/lib/plans";
import { isStripeConfigured } from "@/lib/stripe";
import { SectionHeading, ButtonLink } from "@/components/ui";

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
      {error === "stripe-not-configured" && (
        <p className="mx-auto mt-8 max-w-md rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-center text-sm text-cream-dim/80">
          Los pagos todavía no están configurados en este entorno. Añade tus
          claves de Stripe en <code>.env</code> para activarlos.
        </p>
      )}

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

            <div className="mt-8">
              {session?.user ? (
                <form action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="priceId" value={plan.priceId ?? ""} />
                  <button
                    type="submit"
                    disabled={!isStripeConfigured || !plan.priceId}
                    className={`w-full rounded-full px-6 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      plan.featured
                        ? "bg-gold text-navy-950 hover:bg-gold-light"
                        : "border border-gold/50 text-gold hover:bg-gold hover:text-navy-950"
                    }`}
                  >
                    Elegir {plan.name.toLowerCase()}
                  </button>
                </form>
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
        suscripción en cualquier momento desde tu perfil.
      </p>
    </div>
  );
}
