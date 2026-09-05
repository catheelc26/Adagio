import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo se recogen y usan tus datos en The Adagio Method.",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <Eyebrow>Legal</Eyebrow>
      <h1 className="mt-2 font-serif text-4xl text-cream">Política de privacidad</h1>
      <p className="mt-3 text-sm text-cream-dim/60">
        Última actualización: [fecha de publicación].
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream-dim/80">
        <p>
          Esta política explica qué datos recoge The Adagio Method, para
          qué se usan y qué derechos tienes sobre ellos. El responsable de
          estos datos es [nombre legal / razón social de Catherine o de su
          negocio], contactable en [email de contacto].
        </p>

        <section>
          <h2 className="font-serif text-xl text-cream">1. Qué datos recogemos</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Datos de cuenta</strong>: nombre, email y contraseña
              (guardada de forma cifrada, nunca en texto plano).
            </li>
            <li>
              <strong>Datos de perfil</strong>: la biografía y demás
              información que decidas añadir en tu perfil.
            </li>
            <li>
              <strong>Datos de uso</strong>: tus clases favoritas y tu
              progreso dentro de la biblioteca de video-clases.
            </li>
            <li>
              <strong>Datos de suscripción y pago</strong>: el estado de tu
              suscripción (activa, cancelada, etc.) y las fechas de tu
              periodo de facturación. Los datos de tu tarjeta y el pago en
              sí los procesa directamente Stripe, nuestro proveedor de
              pagos — nunca los recibimos ni los almacenamos nosotros.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">2. Para qué usamos tus datos</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Crear y mantener tu cuenta, y darte acceso a la biblioteca según tu suscripción.</li>
            <li>Procesar tus pagos y gestionar renovaciones o cancelaciones a través de Stripe.</li>
            <li>Guardar tus favoritos y tu progreso para que tu experiencia sea consistente entre sesiones.</li>
            <li>Comunicarnos contigo sobre tu cuenta, tu suscripción o cambios importantes en el Sitio.</li>
          </ul>
          <p className="mt-3">
            No vendemos tus datos a terceros ni los usamos con fines
            publicitarios ajenos a The Adagio Method.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">3. Con quién compartimos datos</h2>
          <p className="mt-3">
            Compartimos la información estrictamente necesaria con
            proveedores que nos ayudan a operar el Sitio:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><strong>Stripe</strong>, para procesar pagos y suscripciones.</li>
            <li>
              <strong>[Neon / tu proveedor de base de datos]</strong>, donde
              se aloja la base de datos con tu información de cuenta.
            </li>
            <li>
              <strong>Vercel</strong>, donde se aloja el propio Sitio.
            </li>
          </ul>
          <p className="mt-3">
            Estos proveedores solo acceden a los datos necesarios para
            prestar su servicio y están sujetos a sus propias políticas de
            privacidad.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">4. Cuánto tiempo guardamos tus datos</h2>
          <p className="mt-3">
            Mientras tu cuenta esté activa. Si solicitas la eliminación de
            tu cuenta, borramos o anonimizamos tus datos personales en un
            plazo razonable, salvo la información que debamos conservar
            por obligación legal o fiscal (por ejemplo, registros de
            facturación).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">5. Tus derechos</h2>
          <p className="mt-3">
            Puedes solicitarnos en cualquier momento acceder a tus datos,
            corregirlos, o eliminar tu cuenta, escribiendo a [email de
            contacto]. Ya editas directamente tu nombre y biografía desde
            tu perfil en{" "}
            <a href="/perfil" className="text-gold hover:underline">
              /perfil
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">6. Seguridad</h2>
          <p className="mt-3">
            Tu contraseña se guarda cifrada y nunca es visible, ni siquiera
            para nosotros. Usamos conexiones cifradas (HTTPS) en todo el
            Sitio y no almacenamos datos de pago directamente.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">7. Cambios en esta política</h2>
          <p className="mt-3">
            Si actualizamos esta política de forma significativa, lo
            avisaremos por email o mediante un aviso visible en el Sitio.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-cream">8. Contacto</h2>
          <p className="mt-3">
            Para cualquier pregunta sobre tus datos o esta política,
            escríbenos a [email de contacto].
          </p>
        </section>

        <p className="border-t border-cream/10 pt-6 text-xs text-cream-dim/50">
          Este texto es una plantilla de partida y no constituye asesoría
          legal. Si tienes alumnas en la Unión Europea, revisa además los
          requisitos del RGPD (por ejemplo, base legal del tratamiento y
          derecho a la portabilidad); si estás en Latinoamérica, revisa la
          ley de protección de datos de tu país. Completa los datos entre
          corchetes antes de publicar.
        </p>
      </div>
    </div>
  );
}
