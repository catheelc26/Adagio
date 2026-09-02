import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/iniciar-sesion", APP_URL));
  }

  if (!isStripeConfigured) {
    return NextResponse.redirect(
      new URL("/precios?error=stripe-not-configured", APP_URL)
    );
  }

  const formData = await request.formData();
  const priceId = formData.get("priceId");

  if (typeof priceId !== "string" || !priceId) {
    return NextResponse.redirect(new URL("/precios?error=invalid-plan", APP_URL));
  }

  const [user, subscription] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  let customerId = subscription?.stripeCustomerId ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { stripeCustomerId: customerId },
      create: { userId: user.id, stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/perfil?checkout=success`,
    cancel_url: `${APP_URL}/precios?checkout=cancelled`,
    client_reference_id: user.id,
    subscription_data: { metadata: { userId: user.id } },
  });

  if (!checkoutSession.url) {
    return NextResponse.redirect(new URL("/precios?error=checkout-failed", APP_URL));
  }

  return NextResponse.redirect(checkoutSession.url, 303);
}
