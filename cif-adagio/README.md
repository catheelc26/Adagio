# CIF Adagio

Sistema de gestión para la escuela de ballet **CIF Adagio**: estudiantes,
pagos y becas, calendario de clases, portal de representantes, portal de
maestros y clases de prueba.

Este proyecto es **completamente independiente** del resto del repositorio
(no comparte código, diseño ni base de datos con ningún otro sitio que viva
aquí) — vive en su propia carpeta (`cif-adagio/`) para poder desplegarse por
separado, con su propio dominio.

Construido con **Vite + React + Tailwind CSS v4 + Supabase**.

## Qué incluye

- **Landing** con selector de rol (Administración / Representante / Maestro)
  y reserva pública de clase de prueba (`/prueba`).
- **Administración** (`/admin`, protegida por PIN — se crea la primera vez
  que alguien entra): resumen, estudiantes (alta/edición/baja, becas,
  exportación a Excel), pagos (mensualidad, clases sueltas, inscripción,
  extras; confirmación de pagos reportados por representantes; recibos
  imprimibles), clases de prueba, calendario, avisos, recordatorios de pago
  por WhatsApp/correo, estadísticas y ajustes (tasa de cambio, cuota de
  inscripción, horario semanal, PIN de maestros, datos bancarios por método
  de pago).
- **Portal de representantes** (`/representante`, acceso con el código de 6
  caracteres de cada estudiante, o autorregistro): estado de cuenta, registro
  de pagos, calendario del grupo, avisos y reglamento.
- **Portal de maestros** (`/maestro`, nombre + PIN compartido): clases de
  prueba próximas, asistencia, notas del día y tareas por grupo.
- Instalable en el celular como app (PWA) — "Agregar a pantalla de inicio".
- **Notificaciones push** (opcional, ver más abajo): administración recibe
  un aviso al llegar una clase de prueba o un pago por confirmar;
  representantes reciben un aviso cuando se publica un anuncio nuevo.

## Puesta en marcha

```bash
cd cif-adagio
npm install
cp .env.example .env      # y rellena los valores (ver abajo)
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

Sin las credenciales de Supabase configuradas, la app carga igual (para ver
el diseño) pero no puede guardar ni leer nada — verás un aviso rojo en la
parte superior recordándotelo.

## Configurar Supabase (checklist)

Supabase es una base de datos Postgres en la nube con un plan gratuito que,
a diferencia de algunos otros servicios, normalmente **no pide tarjeta de
crédito** para crear cuenta ni proyecto.

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) (puedes
   entrar directo con tu cuenta de GitHub o de Google).
2. **New project** → elige un nombre (ej. `cif-adagio`), una contraseña para
   la base de datos (guárdala, no la necesitas para la app pero sí si algún
   día entras directo a Postgres) y la región más cercana → **Create new
   project**. Tarda 1-2 minutos en aprovisionarse.
3. Una vez adentro, ve a **SQL Editor** (ícono en el menú lateral) → **New
   query** → pega todo el contenido de [`supabase/schema.sql`](./supabase/schema.sql)
   de este proyecto → **Run**. Esto crea la tabla donde vive todo (estudiantes,
   pagos, etc.) y las políticas de acceso — léelas, el archivo explica por
   qué son abiertas (la app no usa cuentas reales, solo PIN/código, igual
   que la versión original).
4. Ve a **Project Settings** (ícono de engranaje) → **API**. Copia dos
   valores:
   - **Project URL** → pégalo en `.env` como `VITE_SUPABASE_URL`
   - **anon public** (dentro de "Project API keys") → pégalo como
     `VITE_SUPABASE_ANON_KEY`
5. Vuelve a `npm run dev` — ya debería desaparecer el aviso rojo y poder
   guardar datos.

## Desplegar en Netlify o Vercel

Como este proyecto vive en una subcarpeta del repositorio (`cif-adagio/`),
al conectar el repo en Netlify/Vercel indica ese **directorio raíz /
"Root Directory"**:

- **Root Directory**: `cif-adagio`
- **Build command**: `npm run build`
- **Publish/Output directory**: `dist`

Y agrega las mismas variables de entorno de `.env` en la configuración del
proyecto (Netlify: *Site settings → Environment variables*; Vercel:
*Settings → Environment Variables*).

Cuando quede desplegado, corre el script de `supabase/schema.sql` (paso 3
arriba) si no lo has hecho — sin eso, la app en producción no podrá leer ni
guardar nada aunque las variables estén bien puestas.

## Instalar como app en el celular

Con el sitio ya desplegado (HTTPS), desde el navegador del celular:
**Safari (iOS)** → compartir → "Agregar a pantalla de inicio". **Chrome
(Android)** → menú → "Instalar app" / "Agregar a pantalla de inicio". Usa el
ícono y nombre configurados en `public/manifest.webmanifest`.

## Notificaciones push (opcional)

Esto hace que el celular (o la computadora) de administración/representantes/
maestros reciba una notificación real, incluso con el navegador cerrado —
como cualquier app instalada. No es obligatorio para que el resto de la app
funcione; sin configurarlo, simplemente no aparece la campanita 🔔 en el
encabezado.

**En iPhone (Safari/iOS) solo funciona si la persona instaló el sitio como
app** (compartir → "Agregar a pantalla de inicio") — es una limitación de
Apple, no de esta app. En Android/Chrome funciona directo desde el navegador.

1. Las claves VAPID (necesarias para cualquier notificación push web) **no**
   son las de Supabase — son propias de este proyecto. Ya se generó un par;
   la clave pública queda documentada aquí porque es segura de compartir,
   pero la **clave privada nunca se sube a git** — te la pasé directo en la
   conversación donde se configuró esto (búscala ahí, o pídele a Claude que
   te la recuerde en esa misma conversación).

   - **Clave pública** (va en `.env` / Netlify como `VITE_VAPID_PUBLIC_KEY`):
     `BPafR-v3xMW0ODH8L5ascsGlVC69ueq423IpNhEhFVZi7pyPF4BoY1XK7ofXU7Kvp4iB1HMqrMgkZ_BAN0mD6es`
   - **Clave privada**: solo va como secreto de la función de Supabase (paso
     4) — nunca en el frontend ni en este repositorio.

   Si pierdes la clave privada, no pasa nada: genera un par nuevo (cualquier
   generador de claves VAPID sirve, o pide que se genere uno nuevo) y
   actualiza los dos lugares (`VITE_VAPID_PUBLIC_KEY` y el secreto de la
   función).

2. Agrega `VITE_VAPID_PUBLIC_KEY` con el valor de arriba en tu `.env` local y
   en las variables de entorno de Netlify (igual que hiciste con las de
   Supabase) → vuelve a desplegar.

3. En el panel de Supabase, ve a **Edge Functions** → **Deploy a new
   function** (o "Create a function") → nómbrala exactamente **`send-push`**
   → borra el contenido de ejemplo y pega todo el archivo
   [`supabase/functions/send-push/index.ts`](./supabase/functions/send-push/index.ts)
   de este proyecto → **Deploy**.

4. Dentro de esa misma función, busca **Secrets** (o **Manage secrets**) y
   agrega dos:
   - `VAPID_PUBLIC_KEY` → la clave pública de arriba
   - `VAPID_PRIVATE_KEY` → la clave privada de arriba

   (`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya existen solos en toda
   función de Supabase, no hay que agregarlos.)

5. Entra al sitio ya desplegado → toca la campanita 🔔 en Administración,
   Representantes o Maestros → acepta el permiso de notificaciones del
   navegador. Para probar: publica un aviso nuevo desde Administración
   (debería notificar a representantes) o agenda una clase de prueba desde
   `/prueba` (debería notificar a administración).

## Estructura del proyecto

```
src/lib/constants.js       Catálogo del negocio: grupos, niveles, métodos de pago, reglamento
src/lib/business.js        Precios, prorrateo, reglas de beca/facturación
src/lib/format.js          Formateo de moneda/fecha, generación de códigos, enlaces de recordatorio
src/lib/supabase.js        Configuración de Supabase (lee variables de entorno)
src/lib/db.js              Hooks de datos en tiempo real (colecciones + settings + fotos)
src/lib/AppDataContext.jsx Contexto React que expone todos los datos a la app
src/lib/session.js         Sesiones ligeras (sessionStorage) para los 3 tipos de acceso
src/lib/push.js            Suscripción y envío de notificaciones push (opcional)
public/sw.js                Service worker que muestra las notificaciones push
src/components/            Piezas reutilizables: formularios, modales, calendario, avatar
src/screens/                Landing, flujo de clase de prueba, y las 3 puertas de acceso
src/screens/admin/          Panel de administración (9 pestañas)
src/screens/rep/            Portal de representantes
src/screens/teacher/        Portal de maestros
supabase/schema.sql          Tabla + políticas de seguridad + tiempo real (léelo antes de correrlo)
supabase/functions/send-push  Función que envía las notificaciones push (despliegue manual, ver arriba)
```

## Notas

- Las fotos de estudiantes y los comprobantes de pago se guardan como
  imágenes comprimidas directamente en la base de datos (igual que en la
  versión original), no en un servicio de archivos aparte — sencillo y
  suficiente para el volumen de esta escuela. Si en el futuro se vuelve
  pesado, migrar a Supabase Storage es un cambio localizado en `src/lib/db.js`.
- El PIN de administración, el PIN de maestros y los códigos de acceso de
  representantes se guardan tal cual (sin cifrar), igual que en la versión
  original — es un modelo de seguridad intencionalmente simple para una
  escuela pequeña, no una cuenta de usuario real.
