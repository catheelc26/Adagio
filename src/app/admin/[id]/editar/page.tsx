import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { updateVideoAction } from "@/lib/actions/admin-videos";
import { VideoForm } from "@/components/admin/video-form";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Editar clase",
};

type Params = Promise<{ id: string }>;

export default async function EditVideoPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;

  const [pillars, video] = await Promise.all([
    prisma.pillar.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        levels: { orderBy: { order: "asc" }, select: { id: true, name: true } },
      },
    }),
    prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        levelId: true,
        title: true,
        description: true,
        videoUrl: true,
        duration: true,
        isPreview: true,
      },
    }),
  ]);

  if (!video) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <Eyebrow>Panel privado</Eyebrow>
      <h1 className="mt-1 font-serif text-3xl text-cream">Editar clase</h1>

      <div className="mt-8 rounded-2xl border border-cream/10 bg-navy-900/60 p-8">
        <VideoForm pillars={pillars} action={updateVideoAction} video={video} />
      </div>
    </div>
  );
}
