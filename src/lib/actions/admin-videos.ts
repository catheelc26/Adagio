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
    thumbnailUrl: formData.get("thumbnailUrl") || "",
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

  const { durationMinutes, durationSeconds, tag, thumbnailUrl, ...rest } = parsed.data;

  await prisma.video.create({
    data: {
      pillarId: rest.pillarId,
      title: rest.title,
      description: rest.description,
      videoUrl: rest.videoUrl,
      thumbnailUrl: thumbnailUrl || `gradient:${pillar.icon}`,
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

  const { durationMinutes, durationSeconds, tag, thumbnailUrl, ...rest } = parsed.data;

  await prisma.video.update({
    where: { id: videoId },
    data: {
      pillarId: rest.pillarId,
      title: rest.title,
      description: rest.description,
      videoUrl: rest.videoUrl,
      thumbnailUrl: thumbnailUrl || `gradient:${pillar.icon}`,
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

export async function moveVideoAction(formData: FormData) {
  await requireAdmin();

  const videoId = formData.get("videoId");
  const direction = formData.get("direction");
  if (typeof videoId !== "string" || !videoId) return;
  if (direction !== "up" && direction !== "down") return;

  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return;

  const siblings = await prisma.video.findMany({
    where: { pillarId: video.pillarId },
    orderBy: { order: "asc" },
  });

  const index = siblings.findIndex((v) => v.id === videoId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= siblings.length) return;

  [siblings[index], siblings[swapWith]] = [siblings[swapWith], siblings[index]];

  await prisma.$transaction(
    siblings.map((sibling, i) =>
      prisma.video.update({ where: { id: sibling.id }, data: { order: i } })
    )
  );

  const pillar = await prisma.pillar.findUnique({ where: { id: video.pillarId } });

  revalidatePath("/admin");
  revalidatePath("/biblioteca");
  if (pillar) revalidatePath(`/pilares/${pillar.slug}`);
}
