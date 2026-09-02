import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hasActiveAccess } from "@/lib/subscription";
import { VideoCard } from "@/components/video-card";
import { ButtonLink, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Biblioteca",
  description: "Toda la biblioteca de clases de The Adagio Method, organizada por pilar y nivel.",
};

type SearchParams = Promise<{ pilar?: string }>;

export default async function BibliotecaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { pilar } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  const [pillars, videos, access, favorites] = await Promise.all([
    prisma.pillar.findMany({ orderBy: { order: "asc" } }),
    prisma.video.findMany({
      where: pilar ? { level: { pillar: { slug: pilar } } } : undefined,
      orderBy: [{ level: { pillar: { order: "asc" } } }, { level: { order: "asc" } }, { order: "asc" }],
      include: { level: { include: { pillar: true } } },
    }),
    hasActiveAccess(userId),
    userId
      ? prisma.favorite.findMany({ where: { userId }, select: { videoId: true } })
      : Promise.resolve([]),
  ]);

  const favoriteIds = new Set(favorites.map((f) => f.videoId));
  const activePillar = pillars.find((p) => p.slug === pilar);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <SectionHeading
        eyebrow="Tu biblioteca"
        title="Todas las clases, cuando quieras"
        description="Filtra por pilar y repite tus clases favoritas tantas veces como necesites. Las clases con candado se desbloquean con tu suscripción."
      />

      {!access && (
        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-gold/25 bg-gold/5 px-5 py-4">
          <p className="text-sm text-cream-dim/80">
            Estás viendo la biblioteca en modo vista previa. Suscríbete para
            desbloquear todas las clases de los 8 pilares.
          </p>
          <ButtonLink href="/precios" className="ml-auto">
            Ver planes
          </ButtonLink>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-2">
        <Link
          href="/biblioteca"
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            !activePillar
              ? "border-gold bg-gold/15 text-gold"
              : "border-cream/15 text-cream-dim/70 hover:border-gold/40"
          }`}
        >
          Todos los pilares
        </Link>
        {pillars.map((p) => (
          <Link
            key={p.id}
            href={`/biblioteca?pilar=${p.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              activePillar?.slug === p.slug
                ? "border-gold bg-gold/15 text-gold"
                : "border-cream/15 text-cream-dim/70 hover:border-gold/40"
            }`}
          >
            {p.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={{
              id: video.id,
              title: video.title,
              duration: video.duration,
              isPreview: video.isPreview,
              level: {
                name: video.level.name,
                pillar: {
                  slug: video.level.pillar.slug,
                  name: video.level.pillar.name,
                  icon: video.level.pillar.icon,
                },
              },
            }}
            locked={!video.isPreview && !access}
            favorited={favoriteIds.has(video.id)}
            isAuthed={Boolean(userId)}
          />
        ))}
      </div>

      {videos.length === 0 && (
        <p className="mt-10 text-sm text-cream-dim/60">
          Todavía no hay clases en este pilar. Vuelve pronto.
        </p>
      )}
    </div>
  );
}
