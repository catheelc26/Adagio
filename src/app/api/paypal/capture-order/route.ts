import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { capturePaypalOrder } from "@/lib/paypal";
import { computeExtendedPeriodEnd } from "@/lib/grant-access";

const DURATION_DAYS: Record<string, number> = {
  monthly: 30,
  annual: 365,
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { orderId, planId } = (await request.json()) as { orderId?: string; planId?: string };
  const durationDays = planId ? DURATION_DAYS[planId] : undefined;
  if (!orderId || !durationDays) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const existingOrder = await prisma.subscription.findUnique({ where: { paypalOrderId: orderId } });
  if (existingOrder && existingOrder.userId !== session.user.id) {
    return NextResponse.json({ error: "Esta orden ya está vinculada a otra cuenta." }, { status: 409 });
  }

  const order = await capturePaypalOrder(orderId);
  if (order.status !== "COMPLETED") {
    return NextResponse.json(
      { error: `El pago todavía no está completo (estado: ${order.status}).` },
      { status: 400 }
    );
  }

  const currentPeriodEnd = await computeExtendedPeriodEnd(session.user.id, durationDays);

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: {
      status: "ACTIVE",
      currentPeriodEnd,
      paypalOrderId: order.id,
      paypalSubscriptionId: null,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: session.user.id,
      status: "ACTIVE",
      currentPeriodEnd,
      paypalOrderId: order.id,
    },
  });

  return NextResponse.json({ ok: true });
}
