# The Adagio Method

Escuela online por suscripción para **The Adagio Method**: un ecosistema de
enseñanza que une **Ballet, Fisioterapia, Pilates/PBT, Yoga, Meditación,
Anatomía, Biomecánica y Conciencia Corporal** en una sola biblioteca de
video-clases organizadas por pilar y nivel.

Construido con Next.js 16 (App Router), Prisma + PostgreSQL, Auth.js v5
(credenciales) y Stripe para las suscripciones.

## Funcionalidades

- **Marketing / storytelling**: home, `/metodo` (filosofía del ecosistema) y
  `/sobre-mi` (biografía de la fundadora).
- **Los 8 pilares**: `/pilares` y `/pilares/[slug]`, cada uno con sus niveles
  (Fundamentos, Intermedio, Avanzado) y sus clases.
- **Biblioteca completa**: `/biblioteca`, filtrable por pilar, con
  reproducción ilimitada de las clases desbloqueadas.
- **Cuentas de usuario**: registro/login por email y contraseña
  (`/registro`, `/iniciar-sesion`), perfil editable en `/perfil`, y
  recuperación de contraseña por email (`/olvide-password`,
  `/restablecer-password`).
- **Favoritos**: cualquier clase se puede guardar con el botón de corazón y
  aparece en el perfil del usuario.
- **Suscripciones con Stripe**: `/precios`, checkout, portal de facturación y
  webhook para mantener el estado de la suscripción sincronizado. Las clases
  no marcadas como vista previa quedan bloqueadas hasta tener una
  suscripción activa.
- **Panel de administración** (`/admin`, solo para usuarios con rol `ADMIN`):
  crear, editar y eliminar clases desde un formulario, sin tocar código ni
  base de datos. Ver "Gestionar las clases (panel de administración)" más
  abajo.

## Requisitos

- Node.js 20.9+ (recomendado 22, usado en desarrollo)
- npm
- Una base de datos PostgreSQL (local, o gratis en [Neon](https://neon.tech),
  [Vercel Postgres](https://vercel.com/storage/postgres) o [Supabase](https://supabase.com))

## Puesta en marcha

```bash
npm install
cp .env.example .env      # y rellena los valores (ver abajo)
npm run db:push           # crea las tablas en tu base de datos Postgres
npm run db:seed           # siembra los 8 pilares, niveles, clases y una cuenta demo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

**Cuenta de demostración** (creada por el seed, con suscripción activa
simulada): `invitada@adagiomethod.com` / `adagio2026`.

## Variables de entorno

Ver `.env.example`. Resumen:

| Variable | Para qué sirve |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL. Usa la misma en local y en Vercel, o una distinta por entorno. |
| `AUTH_SECRET` | Clave de Auth.js. Genera una con `openssl rand -base64 32`. |
| `NEXT_PUBLIC_APP_URL` | URL pública del sitio (usada en los redirects de Stripe). |
| `SEED_SECRET` | Contraseña compartida para `/api/admin/seed` (sembrar datos de ejemplo) y `/api/admin/promote` (convertir una cuenta en administradora). Genera una con `openssl rand -hex 16`. |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (modo test mientras desarrollas). |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook de Stripe (`stripe listen` en local). |
| `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_ANNUAL` | IDs de los precios (Price) creados en el Dashboard de Stripe para los dos planes definidos en `src/lib/plans.ts`. |
| `RESEND_API_KEY` | Clave de [Resend](https://resend.com) para enviar el email de "olvidé mi contraseña". Tiene capa gratuita. |
| `EMAIL_FROM` | Remitente de esos correos, por ejemplo `The Adagio Method <hola@tudominio.com>`. Sin un dominio propio verificado en Resend, deja el valor por defecto de `.env.example` (`onboarding@resend.dev`), que funciona igual pero identifica el correo como enviado desde Resend. |

Sin las claves de Stripe, todo el sitio funciona igual (incluida la vista
previa de la biblioteca); solo el botón de "Elegir plan" queda deshabilitado
hasta configurarlas. Sin `RESEND_API_KEY`, "olvidé mi contraseña" sigue
funcionando en local (el enlace de recuperación se imprime en la consola del
servidor en vez de enviarse por email), pero en producción nadie recibirá el
correo hasta que la configures.

## Desplegar en Vercel

1. En [vercel.com](https://vercel.com), **Add New → Project** e importa el
   repositorio de GitHub (rama `claude/adagio-method-platform-w22qum`, que
   es la rama por defecto del repo).
2. En el propio flujo de importación, o después en **Storage → Create
   Database → Postgres**, crea una base de datos. Vercel la conecta al
   proyecto y añade sus propias variables (`POSTGRES_URL`, etc.).
3. En **Settings → Environment Variables** del proyecto, añade (para los tres
   entornos: Production, Preview y Development):
   - `DATABASE_URL` → pega el valor de `POSTGRES_URL` (o `POSTGRES_PRISMA_URL`
     si tu proveedor lo ofrece) que Vercel generó en el paso anterior.
   - `AUTH_SECRET` → genera uno nuevo con `openssl rand -base64 32`.
   - `AUTH_TRUST_HOST` → `true`.
   - `NEXT_PUBLIC_APP_URL` → la URL que Vercel te asigna (algo como
     `https://adagio-xxxx.vercel.app`); puedes ponerla después del primer
     despliegue y volver a desplegar.
   - `SEED_SECRET` → genera uno con `openssl rand -hex 16`.
   - Las variables de Stripe, si ya las tienes (opcional para ver el diseño).
4. Despliega. El propio build ejecuta `prisma generate && prisma db push`,
   así que las tablas se crean solas en tu Postgres de Vercel.
5. Visita una sola vez `https://tu-dominio.vercel.app/api/admin/seed?secret=TU_SEED_SECRET`
   para sembrar los 8 pilares, sus clases y la cuenta de demostración. Verás
   un JSON de confirmación.
6. Abre la URL de tu proyecto — ya está lista para navegar.

## Configurar Stripe (modo test)

1. Crea una cuenta/proyecto en [Stripe](https://dashboard.stripe.com/) y
   activa el modo test.
2. Crea un producto con dos precios recurrentes (mensual y anual) y copia
   sus `price_id` en `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_ANNUAL`.
3. Copia tu clave secreta de test en `STRIPE_SECRET_KEY`.
4. En local, usa la [Stripe CLI](https://docs.stripe.com/stripe-cli) para
   reenviar eventos al webhook:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   Copia el `whsec_...` que imprime en `STRIPE_WEBHOOK_SECRET`.
5. En producción, crea un endpoint de webhook en el Dashboard de Stripe
   apuntando a `https://tu-dominio.com/api/stripe/webhook`, escuchando
   `checkout.session.completed`, `customer.subscription.updated` y
   `customer.subscription.deleted`.

## Pasar Stripe a modo real (cobrar de verdad)

El código no cambia entre modo test y modo real — Stripe usa tus claves
para decidir si un pago es de prueba o real. Los pasos son todos dentro de
los Dashboards de Stripe y de Vercel:

1. En el Dashboard de Stripe, activa tu cuenta para pagos reales
   (**Activar tu cuenta** / **Activate your account**): te pedirá datos del
   negocio, cuenta bancaria de destino y, según tu país, información fiscal.
2. Con el interruptor "Modo test" apagado (arriba a la derecha en el
   Dashboard), vuelve a crear el mismo producto con sus dos precios
   (mensual y anual) que ya tenías en modo test — los productos y precios
   de test no existen en modo real, hay que recrearlos una vez.
3. Copia los nuevos `price_id` (modo real) y reemplaza en Vercel
   (**Settings → Environment Variables**) los valores de
   `STRIPE_PRICE_ID_MONTHLY` y `STRIPE_PRICE_ID_ANNUAL`.
4. En el Dashboard de Stripe, copia tu clave secreta de modo real
   (empieza con `sk_live_...`, en **Developers → API keys**) y reemplaza
   `STRIPE_SECRET_KEY` en Vercel.
5. Crea un nuevo endpoint de webhook en modo real (**Developers →
   Webhooks**) apuntando a `https://tu-dominio.com/api/stripe/webhook`,
   con los mismos tres eventos del paso anterior. Copia su firma
   (`whsec_...`) y reemplaza `STRIPE_WEBHOOK_SECRET` en Vercel.
6. Vuelve a desplegar el proyecto en Vercel para que recoja las nuevas
   variables (un simple "Redeploy" desde el propio Dashboard de Vercel
   basta, no hace falta ningún cambio de código).
7. Haz una suscripción real de prueba con tu propia tarjeta para
   confirmar que todo el flujo funciona antes de anunciar el lanzamiento.

Antes de este paso, revisa también `/terminos` y `/privacidad`: completa
los datos entre corchetes (razón social, país, contacto, política de
reembolsos) — idealmente con ayuda de un abogado o gestor familiarizado con
las leyes de tu país, ya que vas a empezar a cobrar de verdad.

## Contenido de vídeo

El seed (`prisma/seed.ts` / `src/lib/seed-data.ts`) crea clases de ejemplo
que apuntan todas a un único vídeo de muestra generado localmente
(`public/sample/clase-de-muestra.mp4`, unos 90 KB) solo para poder probar el
reproductor y el flujo de favoritos/suscripción de principio a fin — no es
contenido real. Al servirse desde el propio dominio (no un host externo),
funciona igual en cualquier red sin depender de terceros.

Para publicar vídeo real:

1. Súbelo a un proveedor que lo aloje (YouTube como no listado, Vimeo, Bunny
   Stream, Mux, etc.) — esta web solo guarda el enlace, no el archivo.
2. Copia ese enlace y añade la clase desde `/admin` (ver siguiente sección).

Las miniaturas se generan automáticamente a partir del icono del pilar
(`src/components/video-thumbnail.tsx`); no dependen de imágenes externas ni
de nada que tengas que subir.

## Gestionar las clases (panel de administración)

`/admin` es un panel privado, solo visible y accesible para usuarios con rol
`ADMIN`, para crear, editar y eliminar clases sin tocar código:

- **Crear cuenta de administradora**: regístrate normalmente en `/registro`
  con tu email real, y luego visita una sola vez (sustituyendo tu email y tu
  `SEED_SECRET`):

  ```
  https://tu-dominio.vercel.app/api/admin/promote?secret=TU_SEED_SECRET&email=tu@email.com
  ```

  A partir de ahí verás un enlace "Admin" en el menú de navegación.
- **Añadir una clase**: `/admin` → "+ Nueva clase" → eliges pilar y nivel,
  pegas el enlace del vídeo, título, descripción, duración y si es vista
  previa gratuita.
- **Editar o eliminar**: desde `/admin`, cada clase tiene sus propios enlaces
  de "Editar" / "Eliminar".

El rol de administradora es un campo (`role`) en la tabla `User`; también se
puede cambiar directamente con Prisma Studio (`npm run db:studio`) si lo
prefieres.

## Estructura del proyecto

```
prisma/schema.prisma       Modelo de datos (usuarios, suscripciones, pilares, niveles, vídeos, favoritos)
prisma/seed.ts             Script de siembra para CLI (usa src/lib/seed-data.ts)
src/lib/seed-data.ts        Datos de ejemplo (8 pilares × 3 niveles × clases) + lógica de siembra reutilizable
src/app/api/admin/seed      Ruta para sembrar la base de datos ya desplegada, protegida por SEED_SECRET
src/app/api/admin/promote   Ruta para convertir una cuenta en administradora, protegida por SEED_SECRET
src/app/admin/              Panel de administración (crear/editar/eliminar clases), solo rol ADMIN
src/auth.ts                Configuración de Auth.js (credenciales + JWT)
src/lib/                   Prisma client, validaciones, acciones de servidor, Stripe
src/components/            Navbar, footer, tarjetas de vídeo, formularios, iconos de pilares
src/app/                   Rutas de la app (marketing, pilares, biblioteca, perfil, precios, API de Stripe/Auth)
```

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | `prisma generate && prisma db push && next build` — build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run db:push` | Sincroniza el esquema de Prisma con la base de datos |
| `npm run db:seed` | Vuelve a sembrar los datos de ejemplo (contra `DATABASE_URL`) |
| `npm run db:studio` | Abre Prisma Studio para editar los datos |

## Notas de despliegue

- El `build` ejecuta `prisma db push` automáticamente, así que cualquier
  cambio de esquema se aplica en cada despliegue. Es la forma más simple de
  iterar mientras el proyecto es nuevo; cuando haya usuarios y datos reales,
  merece la pena pasar a migraciones (`prisma migrate deploy`) para
  cambios de esquema más controlados.
- Configura todas las variables de `.env.example` en tu plataforma de
  hosting, incluido `AUTH_TRUST_HOST=true` si el despliegue queda detrás de
  un proxy.
- Recuerda apuntar el webhook de Stripe a la URL de producción.
