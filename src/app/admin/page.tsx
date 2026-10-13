import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/format";
import { moveVideoAction } from "@/lib/actions/admin-videos";
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
      videos: { orderBy: { order: "asc" } },
    },
  });

  const tagLabel: Record<string, string> = {
    INICIAR: "Para iniciar",
    AVANZADO: "Para avanzado",
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Panel privado</p>
          <h1 className="mt-1 font-serif text-3xl text-cream">Gestionar clases</h1>
          <p className="mt-2 max-w-xl text-sm text-cream-dim/70">
            Usa las flechas para ordenar las clases de cada pilar en la
            secuencia en la que quieres que se vean. La clase marcada como
            &quot;Vista previa&quot; siempre aparece primero para las
            visitantes sin suscripción, sin importar este orden.
          </p>
        </div>
        <div className="flex gap-3">
          <ButtonLink href="/admin/regalos" variant="secondary">
            Códigos de regalo
          </ButtonLink>
          <ButtonLink href="/admin/blog" variant="secondary">
            Blog
          </ButtonLink>
          <ButtonLink href="/admin/nueva">+ Nueva clase</ButtonLink>
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {pillars.map((pillar) => (
          <section key={pillar.id}>
            <h2 className="font-serif text-xl text-cream">{pillar.name}</h2>

            <div className="mt-4 divide-y divide-cream/10 rounded-xl border border-cream/10">
              {pillar.videos.length === 0 && (
                <p className="px-4 py-3 text-sm text-cream-dim/50">
                  Todavía no hay clases en este pilar.
                </p>
              )}
              {pillar.videos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex shrink-0 flex-col items-center">
                      <form action={moveVideoAction}>
                        <input type="hidden" name="videoId" value={video.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={index === 0}
                          aria-label="Subir"
                          className="flex h-5 w-5 items-center justify-center text-cream-dim/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-20"
                        >
                          ▲
                        </button>
                      </form>
                      <span className="text-[11px] text-cream-dim/40">{index + 1}</span>
                      <form action={moveVideoAction}>
                        <input type="hidden" name="videoId" value={video.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={index === pillar.videos.length - 1}
                          aria-label="Bajar"
                          className="flex h-5 w-5 items-center justify-center text-cream-dim/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-20"
                        >
                          ▼
                        </button>
                      </form>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-cream">
                        {video.title}
                        {video.tag && (
                          <span className="ml-2 rounded-full bg-cream/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cream-dim/70">
                            {tagLabel[video.tag]}
                          </span>
                        )}
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
          </section>
        ))}
      </div>
    </div>
  );
}
