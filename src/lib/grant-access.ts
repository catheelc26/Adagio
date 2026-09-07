import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

// Si ya tiene acceso vigente (por otro regalo, compra o suscripción activa),
// el nuevo periodo se suma al que le queda en vez de reemplazarlo.
export async function computeExtendedPeriodEnd(userId: string, durationDays: number) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  const now = new Date();
  const base =
    existing?.status === "ACTIVE" && existing.currentPeriodEnd && existing.currentPeriodEnd > now
      ? existing.currentPeriodEnd
      : now;
  return new Date(base.getTime() + durationDays * DAY_MS);
}
