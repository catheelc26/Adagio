import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile-form";
import { VideoCard } from "@/components/video-card";
import { ButtonLink, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Mi perfil",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activa",
  TRIALING: "En periodo de prueba",
  PAST_DUE: "Pago pendiente",
  CANCELED: "Cancelada",
  INACTIVE: "Sin suscripción",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  const userId = session.user.id;

  const [user, favorites] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    }),
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { video: { include: { level: { include: { pillar: true } } } } },
    }),
  ]);

  if (!user) redirect("/iniciar-sesion");

  const status = user.subscription?.status ?? "INACTIVE";
  const hasAccess = status === "ACTIVE" || status === "TRIALING" || user.role === "ADMIN";
  const favoriteIds = new Set(favorites.map((f) => f.videoId));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <div className="flex items-center gap-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-navy-900 font-serif text-2xl text-gold">
          {user.name?.[0]?.toUpperCase() ?? "A"}
        </span>
        <div>
          <Eyebrow>Mi perfil</Eyebrow>
          <h1 className="font-serif text-2xl text-cream sm:text-3xl">{user.name}</h1>
          <p className="text-sm text-cream-dim/60">{user.email}</p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="font-serif text-lg text-cream">Información personal</h2>
          <div className="mt-5">
            <ProfileForm name={user.name ?? ""} bio={user.bio ?? ""} />
          </div>
        </Card>

        <Card>
          <h2 className="font-serif text-lg text-cream">Suscripción</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-cream-dim/70">Estado</span>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  hasAccess
                    ? "bg-teal/15 text-teal"
                    : "bg-cream/10 text-cream-dim/70"
                }`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
            {user.subscription?.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="text-cream-dim/70">
                  {user.subscription.cancelAtPeriodEnd ? "Finaliza el" : "Se renueva el"}
                </span>
                <span className="text-cream-dim/90">
                  {new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(
                    user.subscription.currentPeriodEnd
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6">
            {hasAccess && user.subscription?.stripeCustomerId ? (
              <form action="/api/stripe/portal" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-full border border-gold/50 px-5 py-2.5 text-sm text-gold transition-colors hover:bg-gold hover:text-navy-950"
                >
                  Gestionar suscripción
                </button>
              </form>
            ) : (
              <ButtonLink href="/precios" className="w-full">
                Ver planes de suscripción
              </ButtonLink>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-16">
        <h2 className="font-serif text-2xl text-cream">Mis clases favoritas</h2>
        {favorites.length === 0 ? (
          <p className="mt-4 text-sm text-cream-dim/60">
            Todavía no has guardado ninguna clase. Explora la{" "}
            <a href="/biblioteca" className="text-gold hover:underline">
              biblioteca
            </a>{" "}
            y pulsa el corazón para guardar tus favoritas.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map(({ video }) => (
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
                locked={!video.isPreview && !hasAccess}
                favorited={favoriteIds.has(video.id)}
                isAuthed
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
