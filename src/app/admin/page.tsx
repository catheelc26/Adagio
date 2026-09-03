import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/format";
import { DeleteVideoButton } from "@/components/admin/delete-video-button";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Panel de administración",
};

export default async function AdminPage() {
  await requireAdmin();

  const pillars = await prisma.pillar.findMany({
    orderBy: { order: "asc" },
    include: {
      levels: {
        orderBy: { order: "asc" },
        include: { videos: { orderBy: { order: "asc" } } },
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Panel privado</p>
          <h1 className="mt-1 font-serif text-3xl text-cream">Gestionar clases</h1>
        </div>
        <ButtonLink href="/admin/nueva">+ Nueva clase</ButtonLink>
      </div>

      <div className="mt-12 space-y-14">
        {pillars.map((pillar) => (
          <section key={pillar.id}>
            <h2 className="font-serif text-xl text-cream">{pillar.name}</h2>

            <div className="mt-4 space-y-6">
              {pillar.levels.map((level) => (
                <div key={level.id}>
                  <p className="text-xs uppercase tracking-[0.2em] text-cream-dim/50">
                    {level.name}
                  </p>
                  <div className="mt-2 divide-y divide-cream/10 rounded-xl border border-cream/10">
                    {level.videos.length === 0 && (
                      <p className="px-4 py-3 text-sm text-cream-dim/50">
                        Todavía no hay clases en este nivel.
                      </p>
                    )}
                    {level.videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-cream">
                            {video.title}
                            {video.isPreview && (
                              <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold">
                                Vista previa
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-cream-dim/50">
                            {formatDuration(video.duration)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-4">
                          <Link
                            href={`/admin/${video.id}/editar`}
                            className="text-xs text-gold hover:underline"
                          >
                            Editar
                          </Link>
                          <DeleteVideoButton videoId={video.id} title={video.title} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
