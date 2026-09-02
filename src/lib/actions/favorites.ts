"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavoriteAction(videoId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Debes iniciar sesión para guardar clases favoritas.");
  }

  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId, videoId } });
  }

  revalidatePath("/perfil");
  revalidatePath("/biblioteca");
  revalidatePath(`/video/${videoId}`);

  return { favorited: !existing };
}
