import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaypalSubscription, getPaypalOrder, verifyPaypalWebhookSignature } from "@/lib/paypal";
import { computeExtendedPeriodEnd } from "@/lib/grant-access";
import { PLANS } from "@/lib/plans";

const STATUS_MAP: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "INACTIVE"> = {
  ACTIVE: "ACTIVE",
  APPROVED: "ACTIVE",
  SUSPENDED: "PAST_DUE",
  CANCELLED: "CANCELED",
  EXPIRED: "CANCELED",
};

async function syncFromPaypalSubscriptionId(subscriptionId: string) {
  const subscription = await getPaypalSubscription(subscriptionId);
  const existing = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId: subscriptionId },
  });
  if (!existing) return;

  const currentPeriodEnd = subscription.billing_info?.next_billing_time
    ? new Date(subscription.billing_info.next_billing_time)
    : existing.currentPeriodEnd;

  await prisma.subscription.update({
    where: { paypalSubscriptionId: subscriptionId },
    data: {
      status: STATUS_MAP[subscription.status] ?? "INACTIVE",
      currentPeriodEnd,
    },
  });
}

// Pago de un "Hosted Button" (pago único de /precios). No sabemos quién pagó
// hasta consultar la orden completa en PayPal, que sí trae el email del
// comprador — con eso lo emparejamos con una cuenta registrada en el sitio.
async function grantAccessFromCapturedOrder(orderId: string) {
  const alreadyProcessed = await prisma.subscription.findUnique({ where: { paypalOrderId: orderId } });
  if (alreadyProcessed) return;

  const order = await getPaypalOrder(orderId);
  const email = order.payer?.email_address?.trim().toLowerCase();
  const amount = order.purchase_units?.[0]?.amount?.value;
  if (!email || !amount) return;

  const plan = PLANS.find((p) => Math.round(parseFloat(amount)) === Math.round(parseFloat(p.price.replace(/[^0-9.]/g, ""))));
  if (!plan) return;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const currentPeriodEnd = await computeExtendedPeriodEnd(user.id, plan.durationDays);

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      status: "ACTIVE",
      currentPeriodEnd,
      paypalOrderId: orderId,
      paypalSubscriptionId: null,
      cancelAtPeriodEnd: false,
    },
    create: { userId: user.id, status: "ACTIVE", currentPeriodEnd, paypalOrderId: orderId },
  });
}

export async function POST(request: Request) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const body = await request.text();
  const event = JSON.parse(body) as {
    event_type?: string;
    resource?: {
      id?: string;
      billing_agreement_id?: string;
      supplementary_data?: { related_ids?: { order_id?: string } };
    };
  };

  if (webhookId) {
    const isValid = await verifyPaypalWebhookSignature({
      transmissionId: request.headers.get("paypal-transmission-id") ?? "",
      transmissionTime: request.headers.get("paypal-transmission-time") ?? "",
      certUrl: request.headers.get("paypal-cert-url") ?? "",
      authAlgo: request.headers.get("paypal-auth-algo") ?? "",
      transmissionSig: request.headers.get("paypal-transmission-sig") ?? "",
      webhookId,
      webhookEvent: event,
    }).catch(() => false);

    if (!isValid) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }
  }

  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
    case "BILLING.SUBSCRIPTION.UPDATED":
    case "BILLING.SUBSCRIPTION.SUSPENDED":
    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.EXPIRED": {
      if (event.resource?.id) {
        await syncFromPaypalSubscriptionId(event.resource.id);
      }
      break;
    }
    case "PAYMENT.SALE.COMPLETED": {
      // Para pagos de renovación, el ID de la suscripción viaja en billing_agreement_id
      // (resource.id aquí es el ID de la venta/transacción, no de la suscripción).
      if (event.resource?.billing_agreement_id) {
        await syncFromPaypalSubscriptionId(event.resource.billing_agreement_id);
      }
      break;
    }
    case "PAYMENT.CAPTURE.COMPLETED": {
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        await grantAccessFromCapturedOrder(orderId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
