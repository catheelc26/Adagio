import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createVideoAction } from "@/lib/actions/admin-videos";
import { VideoForm } from "@/components/admin/video-form";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Nueva clase",
};

export default async function NewVideoPage() {
  await requireAdmin();

  const pillars = await prisma.pillar.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      levels: { orderBy: { order: "asc" }, select: { id: true, name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <Eyebrow>Panel privado</Eyebrow>
      <h1 className="mt-1 font-serif text-3xl text-cream">Nueva clase</h1>
      <p className="mt-2 text-sm text-cream-dim/70">
        Añade una clase a la biblioteca con el enlace del vídeo ya subido a
        YouTube, Vimeo u otro proveedor.
      </p>

      <div className="mt-8 rounded-2xl border border-cream/10 bg-navy-900/60 p-8">
        <VideoForm pillars={pillars} action={createVideoAction} />
      </div>
    </div>
  );
}
