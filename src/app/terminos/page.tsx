import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Términos de servicio",
  description: "Términos y condiciones de uso de The Adagio Method.",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <Eyebrow>Legal</Eyebrow>
      <h1 className="mt-2 font-serif text-4xl text-cream">Términos de servicio</h1>
      <p className="mt-3 text-sm text-cream-dim/60">
        Última actualización: [fecha de publicación].
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream-dim/80">
        <p>
          Estos términos regulan el uso de The Adagio Method (el
          &ldquo;Sitio&rdquo;), operado por [nombre legal / razón social de
          Catherine o de su negocio], con domicilio en [país / ciudad] y
          contacto en [email de contacto]. Al crear una cuenta o usar el
          Sitio, aceptas estos términos.
        </p>

        <section>
          <h2 className="font-serif text-xl text-cream">1. Qué ofrece el Sitio</h2>
          <p className="mt-3">
            The Adagio Method es una biblioteca de video-clases de danza y
            disciplinas relacionadas (Ballet, Fisioterapia, Pilates/PBT,
            Yoga, Meditación, Anatomía, Biomecánica y Conciencia Corporal),
            organizadas por pilar y nivel, accesible mediante una
            suscripción de pago.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">2. Cuentas de usuario</h2>
          <p className="mt-3">
            Para acceder a la biblioteca completa necesitas crear una
            cuenta con un email y una contraseña. Eres responsable de
            mantener la confidencialidad de tus credenciales y de toda
            actividad que ocurra en tu cuenta. Debes proporcionar
            información veraz al registrarte.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">3. Suscripciones y pagos</h2>
          <p className="mt-3">
            El acceso a las clases no marcadas como vista previa requiere
            una suscripción activa, mensual o anual, según los planes
            publicados en{" "}
            <a href="/precios" className="text-gold hover:underline">
              /precios
            </a>
            . Los pagos se procesan a través de PayPal; The Adagio Method
            no almacena los datos de tu tarjeta.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {PLANS.map((plan) => (
              <li key={plan.id}>
                Plan {plan.name}: {plan.price} {plan.cadence}.
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Las suscripciones se renuevan automáticamente al final de cada
            periodo (mensual o anual) hasta que se cancelen. Puedes
            cancelar en cualquier momento desde tu perfil
            (&ldquo;Gestionar suscripción&rdquo;); el acceso se mantiene
            hasta el final del periodo ya pagado. [Indica aquí tu política
            real de reembolsos: por ejemplo, si ofreces reembolso dentro de
            los primeros X días, o si las suscripciones no son
            reembolsables una vez iniciado el periodo — y confirma que esa
            política cumple con las leyes de protección al consumidor de
            tu país.]
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">4. Uso permitido del contenido</h2>
          <p className="mt-3">
            Las clases, videos, textos e imágenes del Sitio son propiedad
            de [nombre legal] o se usan con la debida autorización, y están
            protegidos por derechos de autor. Tu suscripción te da una
            licencia personal, intransferible y no exclusiva para verlas
            con fines de uso propio. No está permitido descargar,
            redistribuir, revender, retransmitir ni compartir el acceso a
            tu cuenta ni el contenido con terceros.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">5. Uso responsable de las clases</h2>
          <p className="mt-3">
            El contenido de The Adagio Method tiene fines educativos y de
            entrenamiento en danza y disciplinas relacionadas. No sustituye
            el diagnóstico, tratamiento o seguimiento de un profesional de
            la salud. Si tienes una lesión, dolor persistente o una
            condición médica, consulta con un médico o fisioterapeuta antes
            de practicar los ejercicios. Practicas bajo tu propia
            responsabilidad y a tu propio ritmo.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">6. Cancelación y terminación</h2>
          <p className="mt-3">
            Puedes cancelar tu suscripción cuando quieras. Nos reservamos
            el derecho de suspender o cerrar cuentas que incumplan estos
            términos, incluido el uso indebido o la redistribución no
            autorizada del contenido.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">7. Cambios en el Sitio o en estos términos</h2>
          <p className="mt-3">
            Podemos actualizar el contenido, los precios o estos términos.
            Si el cambio es significativo, lo comunicaremos por email o
            mediante un aviso en el Sitio antes de que entre en vigor.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">8. Contacto</h2>
          <p className="mt-3">
            Para preguntas sobre estos términos, escríbenos a [email de
            contacto].
          </p>
        </section>

        <p className="border-t border-cream/10 pt-6 text-xs text-cream-dim/50">
          Este texto es una plantilla de partida y no constituye asesoría
          legal. Antes de publicarlo, revísalo con un abogado o gestor
          familiarizado con las leyes de protección al consumidor,
          comercio electrónico y fiscalidad del país donde operas y donde
          viven tus alumnas, y completa los datos entre corchetes.
        </p>
      </div>
    </div>
  );
}
