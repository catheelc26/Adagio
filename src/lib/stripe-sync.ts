import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const STATUS_MAP: Record<Stripe.Subscription.Status, "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "INACTIVE"> = {
  trialing: "TRIALING",
  active: "ACTIVE",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INACTIVE",
  incomplete_expired: "INACTIVE",
  unpaid: "INACTIVE",
  paused: "INACTIVE",
};

export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const item = subscription.items.data[0];
  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null;

  const existing = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  const userId = existing?.userId ?? subscription.metadata?.userId;
  if (!userId) return;

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: item?.price.id,
      status: STATUS_MAP[subscription.status] ?? "INACTIVE",
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: item?.price.id,
      status: STATUS_MAP[subscription.status] ?? "INACTIVE",
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}
