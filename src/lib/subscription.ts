import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = new Set(["ACTIVE", "TRIALING"]);

export async function getSubscription(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function hasActiveAccess(userId: string | undefined) {
  if (!userId) return false;
  const subscription = await getSubscription(userId);
  return Boolean(subscription && ACTIVE_STATUSES.has(subscription.status));
}
