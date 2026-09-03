import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/iniciar-sesion", APP_URL));
  }

  if (!isStripeConfigured) {
    return NextResponse.redirect(new URL("/perfil?error=stripe-not-configured", APP_URL));
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.redirect(new URL("/precios", APP_URL));
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${APP_URL}/perfil`,
  });

  return NextResponse.redirect(portalSession.url, 303);
}
