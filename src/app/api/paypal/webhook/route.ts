import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaypalSubscription, verifyPaypalWebhookSignature } from "@/lib/paypal";

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

export async function POST(request: Request) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const body = await request.text();
  const event = JSON.parse(body) as {
    event_type?: string;
    resource?: { id?: string; billing_agreement_id?: string };
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
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
