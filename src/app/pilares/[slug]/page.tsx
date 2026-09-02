import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hasActiveAccess } from "@/lib/subscription";
import { PillarIcon } from "@/components/pillar-icon";
import { VideoCard } from "@/components/video-card";
import { ButtonLink, Eyebrow } from "@/components/ui";

type Params = Promise<{ slug: string }>;

async function getPillar(slug: string) {
  return prisma.pillar.findUnique({
    where: { slug },
    include: {
      levels: {
        orderBy: { order: "asc" },
        include: { videos: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const pillar = await getPillar(slug);
  if (!pillar) return {};
  return { title: pillar.name, description: pillar.description };
}

export async function generateStaticParams() {
  const pillars = await prisma.pillar.findMany({ select: { slug: true } });
  return pillars.map((p) => ({ slug: p.slug }));
}

export default async function PillarDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const pillar = await getPillar(slug);
  if (!pillar) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const [access, favorites] = await Promise.all([
    hasActiveAccess(userId),
    userId
      ? prisma.favorite.findMany({ where: { userId }, select: { videoId: true } })
      : Promise.resolve([]),
  ]);
  const favoriteIds = new Set(favorites.map((f) => f.videoId));

  return (
    <div>
      <section className="border-b border-cream/10 bg-navy-900/40 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
              <PillarIcon icon={pillar.icon} className="h-7 w-7" />
            </div>
            <div>
              <Eyebrow>{pillar.tagline}</Eyebrow>
              <h1 className="font-serif text-3xl text-cream sm:text-4xl">{pillar.name}</h1>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim/75">
            {pillar.description}
          </p>

          {!access && (
            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-gold/25 bg-gold/5 px-5 py-4">
              <p className="text-sm text-cream-dim/80">
                Las clases marcadas con candado requieren una suscripción activa.
              </p>
              <ButtonLink href="/precios" className="ml-auto">
                Ver planes
              </ButtonLink>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <div className="space-y-16">
          {pillar.levels.map((level) => (
            <section key={level.id}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-2xl text-cream">{level.name}</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-cream-dim/50">
                  {level.videos.length} clases
                </span>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm text-cream-dim/65">
                {level.description}
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {level.videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={{
                      id: video.id,
                      title: video.title,
                      duration: video.duration,
                      isPreview: video.isPreview,
                      level: { name: level.name, pillar: { slug: pillar.slug, name: pillar.name, icon: pillar.icon } },
                    }}
                    locked={!video.isPreview && !access}
                    favorited={favoriteIds.has(video.id)}
                    isAuthed={Boolean(userId)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
