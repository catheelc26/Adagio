import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PillarIcon } from "@/components/pillar-icon";
import { ButtonLink, Eyebrow, SectionHeading, Card } from "@/components/ui";

export default async function HomePage() {
  const pillars = await prisma.pillar.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-cream/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,166,107,0.14),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center lg:py-36">
          <span className="animate-fade-up rounded-full border border-gold/30 px-4 py-1 text-xs uppercase tracking-[0.3em] text-gold">
            Escuela online · 8 pilares · 1 ecosistema
          </span>
          <h1 className="animate-fade-up mt-8 font-serif text-4xl leading-tight text-cream text-balance sm:text-5xl lg:text-6xl">
            Danza, ciencia y consciencia
            <span className="block font-accent italic text-gold">
              en un mismo cuerpo
            </span>
          </h1>
          <p className="animate-fade-up mt-6 max-w-2xl text-base leading-relaxed text-cream-dim/80 sm:text-lg">
            The Adagio Method es el ecosistema de enseñanza que une Ballet,
            Fisioterapia, Pilates/PBT, Yoga, Meditación, Anatomía,
            Biomecánica y Conciencia Corporal en una sola formación online,
            a tu ritmo, para toda la vida.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/precios">Unirme al ecosistema</ButtonLink>
            <ButtonLink href="/metodo" variant="secondary">
              Descubre el método
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* EL ECOSISTEMA */}
      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="La idea"
              title="Un cuerpo no aprende por partes"
              description="Durante años, la formación en danza ha separado la técnica del cuidado del cuerpo, y el cuidado del cuerpo de la mente que lo habita. The Adagio Method nace para unir esas piezas en un único ecosistema: cada pilar informa a los demás, y cada clase se apoya en el resto."
            />
            <ul className="mt-8 space-y-4 text-sm text-cream-dim/80">
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Aprende ballet entendiendo tu propia anatomía y biomecánica.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Previene lesiones con fisioterapia y Pilates/PBT aplicados a la técnica.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Sostiene la disciplina con yoga, meditación y conciencia corporal.
              </li>
            </ul>
            <ButtonLink href="/metodo" variant="ghost" className="mt-8 px-0">
              Leer la filosofía completa →
            </ButtonLink>
          </div>

          <Card className="relative aspect-4/5 overflow-hidden p-0">
            <div className="absolute inset-0 bg-linear-to-br from-navy-700 via-navy-800 to-navy-950" />
            <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_70%_20%,rgba(201,166,107,0.35),transparent_55%)]" />
            <div className="relative flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
              <span className="font-accent italic text-5xl text-gold/80">
                Adagio
              </span>
              <p className="max-w-[22ch] text-sm text-cream-dim/70">
                Del italiano, &ldquo;despacio&rdquo;: el tiempo musical del
                movimiento sostenido, controlado y consciente. Así se
                construye este método.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 8 PILARES */}
      <section className="border-y border-cream/10 bg-navy-900/40">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
          <SectionHeading
            eyebrow="El sistema"
            title="Los 8 pilares del método"
            description="Cada pilar tiene su propia biblioteca de clases organizadas por niveles, pero todos comparten un mismo lenguaje: el del cuerpo que baila con inteligencia."
            align="center"
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <Link
                key={pillar.id}
                href={`/pilares/${pillar.slug}`}
                className="group rounded-2xl border border-cream/10 bg-navy-950/50 p-6 transition-colors hover:border-gold/40 hover:bg-navy-900/60"
              >
                <PillarIcon
                  icon={pillar.icon}
                  className="h-8 w-8 text-gold transition-transform group-hover:scale-110"
                />
                <h3 className="mt-4 font-serif text-lg text-cream">
                  {pillar.name}
                </h3>
                <p className="mt-1.5 font-accent italic text-sm text-gold/80">
                  {pillar.tagline}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <ButtonLink href="/pilares" variant="secondary">
              Ver los 8 pilares en detalle
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* SOBRE MÍ */}
      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <Card className="relative aspect-4/5 overflow-hidden p-0 order-2 lg:order-1">
            <div className="absolute inset-0 bg-linear-to-b from-navy-800 via-navy-900 to-navy-950" />
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_10%,rgba(79,179,172,0.35),transparent_55%)]" />
            <div className="relative flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-full border border-gold/40 font-serif text-3xl text-gold">
                A
              </span>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-cream-dim/60">
                Fundadora de The Adagio Method
              </p>
            </div>
          </Card>

          <div className="order-1 lg:order-2">
            <Eyebrow>Quién enseña</Eyebrow>
            <h2 className="mt-2 font-serif text-3xl text-cream text-balance sm:text-4xl">
              Una bailarina que también aprendió a cuidar su cuerpo
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream-dim/75">
              Después de años entrenando y enseñando ballet clásico, entendí
              que la técnica sola no bastaba: hacía falta fisioterapia para
              prevenir, Pilates para sostener, yoga para abrir y meditación
              para no romperse por dentro mientras se exige tanto por fuera.
              The Adagio Method es esa síntesis, pensada para acompañar a
              cada bailarina o bailarín en todas las etapas de su formación.
            </p>
            <ButtonLink href="/sobre-mi" variant="ghost" className="mt-6 px-0">
              Conoce mi historia completa →
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="border-t border-cream/10 bg-navy-900/40">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
          <SectionHeading
            eyebrow="Tu escuela, a tu ritmo"
            title="Todo lo que necesitas en un solo lugar"
            align="center"
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <Card>
              <h3 className="font-serif text-lg text-cream">Biblioteca sin límites</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-dim/70">
                Accede a todas las clases de los 8 pilares, organizadas por
                niveles, y repítelas tantas veces como quieras.
              </p>
            </Card>
            <Card>
              <h3 className="font-serif text-lg text-cream">Tu perfil, tu ritmo</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-dim/70">
                Crea tu perfil, guarda tus clases favoritas y construye tu
                propio itinerario dentro del ecosistema.
              </p>
            </Card>
            <Card>
              <h3 className="font-serif text-lg text-cream">Aprendizaje continuo</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-dim/70">
                Nuevos contenidos se suman a cada pilar. Tu suscripción crece
                contigo, clase a clase.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center lg:px-10">
        <span className="font-accent italic text-4xl text-gold">
          Adagio
        </span>
        <h2 className="mt-4 font-serif text-3xl text-cream text-balance sm:text-4xl">
          Empieza a moverte con intención
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-cream-dim/75">
          Únete al ecosistema Adagio y transforma tu forma de entrenar,
          cuidarte y bailar.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <ButtonLink href="/precios">Ver planes de suscripción</ButtonLink>
          <ButtonLink href="/registro" variant="secondary">
            Crear cuenta gratis
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
