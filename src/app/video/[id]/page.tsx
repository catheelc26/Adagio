import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hasActiveAccess } from "@/lib/subscription";
import { formatDuration } from "@/lib/format";
import { resolveVideoEmbed } from "@/lib/video-embed";
import { PillarIcon } from "@/components/pillar-icon";
import { FavoriteButton } from "@/components/favorite-button";
import { VideoCard } from "@/components/video-card";
import { ButtonLink } from "@/components/ui";

type Params = Promise<{ id: string }>;

async function getVideo(id: string) {
  return prisma.video.findUnique({
    where: { id },
    include: { pillar: true },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return {};
  return { title: video.title, description: video.description };
}

export default async function VideoPage({ params }: { params: Params }) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const access = await hasActiveAccess(userId, session?.user?.role);
  const canWatch = video.isPreview || access;

  const [favorite, related] = await Promise.all([
    userId
      ? prisma.favorite.findUnique({
          where: { userId_videoId: { userId, videoId: video.id } },
        })
      : Promise.resolve(null),
    prisma.video.findMany({
      where: { pillarId: video.pillarId, id: { not: video.id } },
      orderBy: { order: "asc" },
      include: { pillar: true },
      take: 3,
    }),
  ]);

  const favoriteIds = userId
    ? new Set(
        (
          await prisma.favorite.findMany({
            where: { userId, videoId: { in: related.map((v) => v.id) } },
            select: { videoId: true },
          })
        ).map((f) => f.videoId)
      )
    : new Set<string>();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-cream-dim/60">
        <Link href="/pilares" className="hover:text-gold">Pilares</Link>
        <span>/</span>
        <Link href={`/pilares/${video.pillar.slug}`} className="hover:text-gold">
          {video.pillar.name}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-cream/10 bg-navy-900">
            {canWatch ? (
              (() => {
                const embed = resolveVideoEmbed(video.videoUrl);
                if (embed.type === "file") {
                  const poster = video.thumbnailUrl.startsWith("gradient:")
                    ? undefined
                    : video.thumbnailUrl;
                  return (
                    <video
                      key={video.id}
                      controls
                      preload="metadata"
                      poster={poster}
                      className="aspect-video w-full bg-black"
                    >
                      <source src={embed.url} type="video/mp4" />
                    </video>
                  );
                }
                return (
                  <iframe
                    key={video.id}
                    src={embed.embedUrl}
                    className="aspect-video w-full bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                );
              })()
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-linear-to-br from-navy-800 to-navy-950 p-10 text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-10 w-10 text-gold">
                  <rect x="5" y="10.5" width="14" height="9" rx="2" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </svg>
                <p className="max-w-sm text-sm text-cream-dim/75">
                  Esta clase forma parte de la biblioteca completa. Suscríbete
                  para desbloquear todos los pilares.
                </p>
                <ButtonLink href="/precios">Ver planes de suscripción</ButtonLink>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold/70">
                <PillarIcon icon={video.pillar.icon} className="h-4 w-4" />
                {video.pillar.name} · {formatDuration(video.duration)}
                {video.tag && (video.tag === "INICIAR" ? " · Para iniciar" : " · Para avanzado")}
              </p>
              <h1 className="mt-2 font-serif text-2xl text-cream sm:text-3xl">{video.title}</h1>
            </div>
            <FavoriteButton
              videoId={video.id}
              initialFavorited={Boolean(favorite)}
              isAuthed={Boolean(userId)}
            />
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream-dim/75">
            {video.description}
          </p>
        </div>

        <aside>
          <h2 className="font-serif text-lg text-cream">Más clases de {video.pillar.name}</h2>
          <div className="mt-4 space-y-4">
            {related.map((relatedVideo) => (
              <VideoCard
                key={relatedVideo.id}
                video={{
                  id: relatedVideo.id,
                  title: relatedVideo.title,
                  duration: relatedVideo.duration,
                  isPreview: relatedVideo.isPreview,
                  tag: relatedVideo.tag,
                  thumbnailUrl: relatedVideo.thumbnailUrl,
                  pillar: {
                    slug: relatedVideo.pillar.slug,
                    name: relatedVideo.pillar.name,
                    icon: relatedVideo.pillar.icon,
                  },
                }}
                locked={!relatedVideo.isPreview && !access}
                favorited={favoriteIds.has(relatedVideo.id)}
                isAuthed={Boolean(userId)}
              />
            ))}
            {related.length === 0 && (
              <p className="text-sm text-cream-dim/60">
                Esta es la única clase de este pilar, por ahora.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
