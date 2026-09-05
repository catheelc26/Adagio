"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cancelPaypalSubscription } from "@/lib/paypal";

export async function cancelSubscriptionAction(): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Debes iniciar sesión." };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.paypalSubscriptionId) {
    return { error: "No encontramos una suscripción activa de PayPal en tu cuenta." };
  }

  try {
    await cancelPaypalSubscription(subscription.paypalSubscriptionId, "Cancelada por la alumna desde su perfil");
  } catch {
    return { error: "No pudimos cancelar la suscripción en PayPal. Intenta de nuevo o contáctanos." };
  }

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { status: "CANCELED", cancelAtPeriodEnd: true },
  });

  revalidatePath("/perfil");

  return {};
}
