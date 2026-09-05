import { NextResponse } from "next/server";
import { paypalFetch, isPaypalConfigured } from "@/lib/paypal";
import { PLANS } from "@/lib/plans";

type PaypalProduct = { id: string };
type PaypalPlan = { id: string; name: string };

export async function GET(request: Request) {
  const secret = process.env.SEED_SECRET;
  const provided = new URL(request.url).searchParams.get("secret");

  if (!secret) {
    return NextResponse.json(
      { error: "SEED_SECRET no está configurado en este entorno." },
      { status: 404 }
    );
  }

  if (provided !== secret) {
    return NextResponse.json({ error: "Secreto incorrecto." }, { status: 403 });
  }

  if (!isPaypalConfigured) {
    return NextResponse.json(
      { error: "Configura PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET antes de ejecutar esto." },
      { status: 400 }
    );
  }

  const product = await paypalFetch<PaypalProduct>("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name: "The Adagio Method — Suscripción",
      description: "Acceso a la biblioteca completa de The Adagio Method.",
      type: "SERVICE",
      category: "EDUCATIONAL_AND_TEXTBOOKS",
    }),
  });

  const planIds: Record<string, string> = {};

  for (const plan of PLANS) {
    const intervalUnit = plan.id === "monthly" ? "MONTH" : "YEAR";
    const priceValue = plan.price.replace(/[^0-9.]/g, "");

    const created = await paypalFetch<PaypalPlan>("/v1/billing/plans", {
      method: "POST",
      body: JSON.stringify({
        product_id: product.id,
        name: `The Adagio Method — ${plan.name}`,
        description: plan.description,
        billing_cycles: [
          {
            frequency: { interval_unit: intervalUnit, interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: { value: priceValue, currency_code: "USD" },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          payment_failure_threshold: 2,
        },
      }),
    });

    planIds[plan.id] = created.id;
  }

  return NextResponse.json({
    ok: true,
    message: "Producto y planes creados en PayPal. Copia estos IDs en tus variables de entorno.",
    productId: product.id,
    envVars: {
      PAYPAL_PLAN_ID_MONTHLY: planIds.monthly,
      PAYPAL_PLAN_ID_ANNUAL: planIds.annual,
    },
  });
}
