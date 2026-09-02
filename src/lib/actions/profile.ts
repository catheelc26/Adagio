"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth";

export async function updateProfileAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Debes iniciar sesión." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, bio: parsed.data.bio || null },
  });

  revalidatePath("/perfil");

  return {};
}
