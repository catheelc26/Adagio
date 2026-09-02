import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PillarIcon } from "@/components/pillar-icon";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Los 8 Pilares",
  description:
    "Ballet, Fisioterapia, Pilates/PBT, Yoga, Meditación, Anatomía, Biomecánica y Conciencia Corporal: los 8 pilares de The Adagio Method.",
};

export default async function PilaresPage() {
  const pillars = await prisma.pillar.findMany({
    orderBy: { order: "asc" },
    include: { levels: { include: { _count: { select: { videos: true } } } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
      <SectionHeading
        eyebrow="El ecosistema"
        title="Los 8 pilares del método"
        description="Cada pilar es una biblioteca propia, organizada por niveles. Explóralos por separado o síguelos todos a la vez: juntos forman el ecosistema completo."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {pillars.map((pillar, index) => {
          const videoCount = pillar.levels.reduce(
            (sum, level) => sum + level._count.videos,
            0
          );

          return (
            <Link
              key={pillar.id}
              href={`/pilares/${pillar.slug}`}
              className="group flex flex-col rounded-2xl border border-cream/10 bg-navy-900/50 p-7 transition-colors hover:border-gold/40"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                  <PillarIcon icon={pillar.icon} className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-gold/60">
                    Pilar 0{index + 1}
                  </span>
                  <h2 className="font-serif text-xl text-cream">{pillar.name}</h2>
                </div>
              </div>
              <p className="mt-4 font-accent italic text-lg text-gold/80">
                {pillar.tagline}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-cream-dim/70">
                {pillar.description}
              </p>
              <div className="mt-5 flex items-center justify-between text-xs text-cream-dim/60">
                <span>
                  {pillar.levels.length} niveles · {videoCount} clases
                </span>
                <span className="text-gold opacity-0 transition-opacity group-hover:opacity-100">
                  Explorar →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
