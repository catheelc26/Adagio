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
  (`/registro`, `/iniciar-sesion`), perfil editable en `/perfil`.
- **Favoritos**: cualquier clase se puede guardar con el botón de corazón y
  aparece en el perfil del usuario.
- **Suscripciones con Stripe**: `/precios`, checkout, portal de facturación y
  webhook para mantener el estado de la suscripción sincronizado. Las clases
  no marcadas como vista previa quedan bloqueadas hasta tener una
  suscripción activa.

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
| `SEED_SECRET` | Contraseña para sembrar los datos de ejemplo visitando `/api/admin/seed?secret=...` una vez desplegado. Genera una con `openssl rand -hex 16`. |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (modo test mientras desarrollas). |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook de Stripe (`stripe listen` en local). |
| `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_ANNUAL` | IDs de los precios (Price) creados en el Dashboard de Stripe para los dos planes definidos en `src/lib/plans.ts`. |

Sin las claves de Stripe, todo el sitio funciona igual (incluida la vista
previa de la biblioteca); solo el botón de "Elegir plan" queda deshabilitado
hasta configurarlas.

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

## Contenido de vídeo

El seed (`prisma/seed.ts`) crea clases de ejemplo usando vídeos públicos de
muestra (bucket público de Google) solo para poder probar el reproductor y
el flujo de favoritos/suscripción de principio a fin. Para publicar tu
propio contenido:

- Sube tus vídeos a un proveedor (Vimeo, Mux, Bunny Stream, S3 + CDN, etc.)
  y guarda la URL reproducible en el campo `videoUrl` de cada `Video`
  (puedes editarlo directamente en Prisma Studio: `npm run db:studio`).
- Marca con `isPreview: true` las clases que quieras dejar abiertas como
  muestra gratuita; el resto se bloquean para usuarios sin suscripción
  activa.
- Las miniaturas se generan automáticamente a partir del icono del pilar
  (`src/components/video-thumbnail.tsx`); no dependen de imágenes externas.

## Estructura del proyecto

```
prisma/schema.prisma       Modelo de datos (usuarios, suscripciones, pilares, niveles, vídeos, favoritos)
prisma/seed.ts             Script de siembra para CLI (usa src/lib/seed-data.ts)
src/lib/seed-data.ts        Datos de ejemplo (8 pilares × 3 niveles × clases) + lógica de siembra reutilizable
src/app/api/admin/seed      Ruta para sembrar la base de datos ya desplegada, protegida por SEED_SECRET
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
