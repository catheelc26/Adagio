"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { videoSchema } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth";

function parseVideoForm(formData: FormData) {
  return videoSchema.safeParse({
    pillarId: formData.get("pillarId"),
    title: formData.get("title"),
    description: formData.get("description"),
    videoUrl: formData.get("videoUrl"),
    durationMinutes: formData.get("durationMinutes") || "0",
    durationSeconds: formData.get("durationSeconds") || "0",
    tag: formData.get("tag") || "",
    isPreview: formData.get("isPreview") === "on",
  });
}

export async function createVideoAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parseVideoForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const pillar = await prisma.pillar.findUnique({
    where: { id: parsed.data.pillarId },
    include: { _count: { select: { videos: true } } },
  });
  if (!pillar) return { error: "Ese pilar ya no existe. Recarga la página." };

  const { durationMinutes, durationSeconds, tag, ...rest } = parsed.data;

  await prisma.video.create({
    data: {
      pillarId: rest.pillarId,
      title: rest.title,
      description: rest.description,
      videoUrl: rest.videoUrl,
      thumbnailUrl: `gradient:${pillar.icon}`,
      duration: durationMinutes * 60 + durationSeconds,
      order: pillar._count.videos,
      tag: tag || null,
      isPreview: rest.isPreview,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/biblioteca");
  revalidatePath(`/pilares/${pillar.slug}`);
  redirect("/admin");
}

export async function updateVideoAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const videoId = formData.get("videoId");
  if (typeof videoId !== "string" || !videoId) {
    return { error: "Falta el identificador de la clase." };
  }

  const parsed = parseVideoForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const pillar = await prisma.pillar.findUnique({
    where: { id: parsed.data.pillarId },
  });
  if (!pillar) return { error: "Ese pilar ya no existe. Recarga la página." };

  const { durationMinutes, durationSeconds, tag, ...rest } = parsed.data;

  await prisma.video.update({
    where: { id: videoId },
    data: {
      pillarId: rest.pillarId,
      title: rest.title,
      description: rest.description,
      videoUrl: rest.videoUrl,
      thumbnailUrl: `gradient:${pillar.icon}`,
      duration: durationMinutes * 60 + durationSeconds,
      tag: tag || null,
      isPreview: rest.isPreview,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/biblioteca");
  revalidatePath(`/video/${videoId}`);
  revalidatePath(`/pilares/${pillar.slug}`);
  redirect("/admin");
}

export async function deleteVideoAction(formData: FormData) {
  await requireAdmin();

  const videoId = formData.get("videoId");
  if (typeof videoId !== "string" || !videoId) return;

  await prisma.video.delete({ where: { id: videoId } });

  revalidatePath("/admin");
  revalidatePath("/biblioteca");
}
