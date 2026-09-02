import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PillarIcon } from "@/components/pillar-icon";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "El Método",
  description:
    "La filosofía detrás de The Adagio Method: un ecosistema que une danza, ciencia del movimiento y consciencia corporal.",
};

export default async function MetodoPage() {
  const pillars = await prisma.pillar.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <section className="border-b border-cream/10 bg-[radial-gradient(ellipse_at_top,rgba(201,166,107,0.12),transparent_60%)] px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>La filosofía</Eyebrow>
          <h1 className="mt-2 font-serif text-4xl text-cream text-balance sm:text-5xl">
            Un ecosistema, no un método aislado
          </h1>
          <p className="mt-6 text-base leading-relaxed text-cream-dim/80 sm:text-lg">
            &ldquo;Adagio&rdquo; nombra el tiempo musical del movimiento lento,
            sostenido y controlado. Ese es el espíritu del método: aprender a
            moverse —y a cuidarse— con la misma intención con la que se baila
            un adagio.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
        <div className="space-y-8 text-cream-dim/80 leading-relaxed">
          <p>
            The Adagio Method nace de una pregunta simple: ¿por qué la
            formación en danza sigue enseñando técnica, anatomía, fuerza y
            bienestar mental como si fueran materias separadas, cuando en el
            cuerpo de quien baila ocurren todas a la vez?
          </p>
          <p>
            La respuesta fue construir un ecosistema: ocho pilares que se
            entrenan por separado, en su propia biblioteca de clases y
            niveles, pero que están pensados para dialogar entre sí. El
            ballet se apoya en la anatomía y la biomecánica para entender el
            movimiento; la fisioterapia y el Pilates/PBT sostienen y previenen;
            el yoga, la meditación y la conciencia corporal cuidan el cuerpo
            y la mente que hacen posible todo lo anterior.
          </p>
          <p>
            No es un curso más. Es una escuela online viva, que crece con
            cada suscriptora y suscriptor, y que se puede recorrer a un
            ritmo propio: sin presión, sin prisa —al ritmo de un adagio.
          </p>
        </div>
      </section>

      <section className="border-t border-cream/10 bg-navy-900/40">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
          <SectionHeading
            eyebrow="El sistema"
            title="Cómo se organizan los 8 pilares"
            description="Cada pilar tiene sus propios niveles —desde fundamentos hasta contenido avanzado— y su propia biblioteca de video-clases disponible para siempre dentro de tu suscripción."
            align="center"
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.id}
                className="flex gap-5 rounded-2xl border border-cream/10 bg-navy-950/50 p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                  <PillarIcon icon={pillar.icon} className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-gold/70">
                    Pilar 0{index + 1}
                  </span>
                  <h3 className="mt-1 font-serif text-xl text-cream">
                    {pillar.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream-dim/70">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center lg:px-10">
        <h2 className="font-serif text-3xl text-cream sm:text-4xl">
          ¿Lista para recorrer el ecosistema completo?
        </h2>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <ButtonLink href="/pilares">Explorar los 8 pilares</ButtonLink>
          <ButtonLink href="/precios" variant="secondary">
            Ver planes
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
