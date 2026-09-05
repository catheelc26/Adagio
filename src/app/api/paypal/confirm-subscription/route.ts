import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPaypalSubscription } from "@/lib/paypal";

const ACTIVE_PAYPAL_STATUSES = new Set(["APPROVED", "ACTIVE"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { subscriptionId } = (await request.json()) as { subscriptionId?: string };
  if (!subscriptionId) {
    return NextResponse.json({ error: "Falta el ID de suscripción." }, { status: 400 });
  }

  const existing = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId: subscriptionId },
  });
  if (existing && existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Esta suscripción ya está vinculada a otra cuenta." }, { status: 409 });
  }

  const paypalSubscription = await getPaypalSubscription(subscriptionId);

  if (!ACTIVE_PAYPAL_STATUSES.has(paypalSubscription.status)) {
    return NextResponse.json(
      { error: `La suscripción todavía no está activa (estado: ${paypalSubscription.status}).` },
      { status: 400 }
    );
  }

  const currentPeriodEnd = paypalSubscription.billing_info?.next_billing_time
    ? new Date(paypalSubscription.billing_info.next_billing_time)
    : null;

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: {
      paypalSubscriptionId: paypalSubscription.id,
      paypalPlanId: paypalSubscription.plan_id,
      status: "ACTIVE",
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: session.user.id,
      paypalSubscriptionId: paypalSubscription.id,
      paypalPlanId: paypalSubscription.plan_id,
      status: "ACTIVE",
      currentPeriodEnd,
    },
  });

  return NextResponse.json({ ok: true });
}
