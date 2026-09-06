"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// Sin caracteres ambiguos (0/O, 1/I/L) para que sea fácil de escribir a mano.
const CODE_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

function generateCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARSET[randomInt(CODE_CHARSET.length)];
  }
  return code;
}

export async function createGiftCodeAction() {
  const session = await requireAdmin();

  let code = generateCode();
  while (await prisma.giftCode.findUnique({ where: { code } })) {
    code = generateCode();
  }

  await prisma.giftCode.create({
    data: { code, createdById: session.user.id },
  });

  revalidatePath("/admin/regalos");
}

export async function deleteGiftCodeAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.giftCode.deleteMany({ where: { id, redeemedAt: null } });
  revalidatePath("/admin/regalos");
}

export type RedeemState = { error?: string; success?: boolean };

export async function redeemGiftCodeAction(
  _prevState: RedeemState,
  formData: FormData
): Promise<RedeemState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Debes iniciar sesión primero." };
  }

  const rawCode = formData.get("code");
  if (typeof rawCode !== "string" || !rawCode.trim()) {
    return { error: "Escribe un código." };
  }
  const code = rawCode.trim().toUpperCase();

  const giftCode = await prisma.giftCode.findUnique({ where: { code } });
  if (!giftCode) {
    return { error: "Ese código no existe. Revisa que esté bien escrito." };
  }
  if (giftCode.redeemedAt) {
    return { error: "Ese código ya fue usado." };
  }

  const existing = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  const now = new Date();
  const base =
    existing?.status === "ACTIVE" && existing.currentPeriodEnd && existing.currentPeriodEnd > now
      ? existing.currentPeriodEnd
      : now;
  const currentPeriodEnd = new Date(base.getTime() + giftCode.durationDays * DAY_MS);

  const result = await prisma.giftCode.updateMany({
    where: { id: giftCode.id, redeemedAt: null },
    data: { redeemedAt: now, redeemedById: session.user.id },
  });

  if (result.count === 0) {
    return { error: "Ese código ya fue usado." };
  }

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: { status: "ACTIVE", currentPeriodEnd },
    create: { userId: session.user.id, status: "ACTIVE", currentPeriodEnd },
  });

  revalidatePath("/perfil");
  return { success: true };
}
