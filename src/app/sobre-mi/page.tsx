import type { Metadata } from "next";
import Image from "next/image";
import { Card, ButtonLink, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sobre mí",
  description: "La historia detrás de The Adagio Method y su fundadora.",
};

export default function SobreMiPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Card className="relative aspect-4/5 overflow-hidden p-0">
            <Image
              src="/brand/catherine-portrait.jpg"
              alt="Catherine, fundadora de The Adagio Method"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-950 via-navy-950/70 to-transparent px-8 pb-6 pt-16">
              <p className="text-xs uppercase tracking-[0.3em] text-cream-dim/80">
                Fundadora · The Adagio Method
              </p>
            </div>
          </Card>

          <div>
            <Eyebrow>Sobre mí</Eyebrow>
            <h1 className="mt-2 font-serif text-4xl text-cream text-balance sm:text-5xl">
              De bailarina a creadora de un ecosistema
            </h1>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-cream-dim/80">
              <p>
                Empecé a bailar ballet clásico desde muy pequeña, y con los
                años entendí algo que muchas bailarinas descubren tarde: la
                técnica sin cuidado del cuerpo tiene fecha de caducidad. Las
                lesiones, el agotamiento y la desconexión con mi propio
                cuerpo me llevaron a buscar respuestas fuera de la sala de
                ballet.
              </p>
              <p>
                Formándome en fisioterapia, Pilates, PBT, yoga, anatomía y
                trabajo somático, encontré lo que la danza clásica muchas
                veces no enseña: cómo sostener una carrera larga, sana y
                consciente. Cada disciplina me devolvía algo a la técnica, y
                la técnica cobraba más sentido con cada disciplina nueva.
              </p>
              <p>
                The Adagio Method es el resultado de unir todo eso en un
                único lugar: una escuela online pensada como un ecosistema,
                donde cada pilar —Ballet, Fisioterapia, Pilates/PBT, Yoga,
                Meditación, Anatomía, Biomecánica y Conciencia Corporal—
                dialoga con los demás. Mi misión es que ninguna bailarina o
                bailarín tenga que aprender esto por el camino difícil, como
                me pasó a mí.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/metodo">Descubre el método</ButtonLink>
              <ButtonLink href="/precios" variant="secondary">
                Únete al ecosistema
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-cream/10 bg-navy-900/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
          <span className="font-accent italic text-3xl text-gold">
            &ldquo;Bailar es una forma de escuchar al cuerpo, no solo de
            exigirle.&rdquo;
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-cream px-8 py-10 text-center sm:flex-row sm:gap-10 sm:text-left">
          <Image
            src="/brand/ballet-clasico-cif-adagio-logo.png"
            alt="Ballet Clásico CIF Adagio"
            width={1563}
            height={1563}
            className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-navy-700/60">
              El origen
            </p>
            <p className="mt-2 text-navy-950/80 leading-relaxed">
              Antes de The Adagio Method, todo esto se enseñaba en las salas
              de <strong>Ballet Clásico CIF Adagio</strong>, mi escuela de
              danza. Este ecosistema online nace de esa misma experiencia,
              ahora al alcance de cualquier bailarina o bailarín, viva donde
              viva.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
