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

- **Landing** con selector de rol (Administración / Representante / Maestro),
  reserva pública de clase de prueba (`/prueba`) y venta de entradas para
  presentaciones (`/entradas`, debajo de las fotos de "Vida en el estudio").
- **Administración** (`/admin`, protegida por PIN — se crea la primera vez
  que alguien entra): Inicio (estudiantes activos, con beca, y pendientes
  del mes — ordenados por grupo y luego alfabéticamente, mostrando todos
  los meses que debe cada quien si son varios y, si abonó solo una parte
  de algún mes, cuánto le falta todavía — un abono parcial nunca se marca
  como mes pagado), estudiantes (alta/edición/
  baja — incluye cambiar de grupo, becas, exportación a Excel, también
  ordenados por grupo), pagos (mensualidad, clases sueltas, inscripción,
  extras, **exoneración de un mes puntual** — para ayudas económicas, sin
  registrar cobro — con foto y grupo del estudiante visibles en cada fila;
  confirmación de pagos reportados por representantes; recibos imprimibles;
  **corregir un pago ya registrado** — mes, monto, fecha o referencia, por
  si un representante se equivocó al reportarlo (ej. pagó octubre pero
  quedó registrado como septiembre) — sin tener que borrarlo y crear uno
  nuevo;
  **recargo por mora del reglamento** — $5 automáticos sobre la mensualidad
  de cualquier mes que quede vencido (ya pasó por completo, sin pagarse) —
  el mes en curso nunca lo carga, aunque ya hayan pasado los primeros 5 días
  que pide el reglamento; y si se pagó por completo con fecha dentro del
  mismo mes, ese mes nunca carga el recargo, sin importar cuándo se
  confirme después. Se refleja en pendientes, recordatorios, estado de
  cuenta y en el monto que se pre-llena al registrar el pago —),
  **clases de prueba** (ordenadas por fecha y agrupadas visualmente por día;
  se puede filtrar por una fecha puntual para ver solo esas solicitudes y
  contactarlas más fácil; el día pasa a "Realizada" solo al llegar la fecha,
  sin marcarlo a mano; se puede indicar si la persona vino o no vino,
  reprogramar fecha y horario, y contactar por WhatsApp),
  calendario, avisos, recordatorios de pago por
  WhatsApp/correo (ya no avisan de meses exonerados), **presentaciones**
  (crear funciones, mapa de butacas del teatro con precio por asiento — $12
  los asientos centrales 8 a 14 de cada fila, $10 el resto —, ver y confirmar las entradas
  vendidas de cada función con su comprador y asiento, y **escanear el QR
  de cada entrada** desde la cámara del celular o buscarla manualmente para
  verificarla en la puerta el día de la función), estadísticas
  (incluye lo cobrado en el mes) y ajustes (tasa de
  cambio, cuota de inscripción, PIN de maestros, **corregir de una vez todos
  los teléfonos guardados al formato +58 de Venezuela** (sin duplicar el
  código ni dejar el 0 inicial — los números nuevos ya se guardan
  corregidos), **cuentas de Pago Móvil**
  — pueden ser varias, cada una asignada a los grupos que le correspondan,
  ej. una cuenta para los grupos de sábado y otra para el resto — datos
  bancarios de los demás métodos de pago, **equipo multidisciplinario** —
  agregar especialistas externos (fisioterapia, psicología, nutrición,
  etc.) con su tarifa preferencial y WhatsApp, visibles luego en el portal
  de representantes —, **grupos y precios** — agregar/editar/eliminar
  grupos, y **horario semanal** — agregar/quitar las clases de cada grupo).
- **Portal de representantes** (`/representante`, acceso con un código que
  genera la app o autorregistro): estado de cuenta (con aviso unos días
  antes de que venza la mensualidad, y el detalle de cuánto se debe por
  mes — incluyendo el recargo de $5 si ya venció, para que nunca sea
  sorpresa), registro de pagos (con
  los datos de pago — incluyendo Pago Móvil según el grupo — visibles y
  copiables al reportar), calendario del grupo, avisos, reglamento, pueden
  actualizar la planilla de registro de su estudiante si hay algún error o
  cambio (queda marcada para revisión de administración), registrar a otro
  hijo/familiar directamente desde ahí (queda vinculado automáticamente) y
  cambiar entre ellos sin cerrar sesión — botón discreto junto a la
  campanita de notificaciones, pensado para no confundir a quien no lo
  necesite —,
  registrar en un solo paso el pago de todos los familiares vinculados
  (cada quien queda guardado como una transacción independiente para
  administración; si pagan a cuentas de Pago Móvil distintas, se piden
  comprobantes por separado, uno por cuenta), y cambiar su
  código de acceso por uno propio (administración siempre puede ver el
  código actual desde la ficha del estudiante), **comprar entradas para
  presentaciones** eligiendo su asiento en el mapa del teatro, con sus
  datos pre-llenados y viendo ahí mismo las entradas ya compradas ("Mis
  entradas"), y ver el **equipo multidisciplinario** (fisioterapia,
  psicología, nutrición, etc.) con tarifa preferencial para familias de la
  escuela, con botón de WhatsApp para contactar a cada especialista
  directamente — visible solo dentro del portal, de forma privada.
- **Compra pública de entradas** (`/entradas`, sin necesidad de iniciar
  sesión): elegir función, elegir asiento en un mapa del teatro con butacas
  con forma de asiento (no cuadros) — azul vibrante para Lateral, rojo
  navideño para Centro, gris para ocupado —, pasillos bien marcados entre
  los tres bloques, leyenda con precio por tipo y un escenario curvo arriba;
  se ve completo sin tener que deslizar a los lados (se ajusta solo al
  ancho de la pantalla) y mantiene nuestra numeración y distribución de
  filas/asientos; reportar el pago con foto de comprobante
  (igual que cualquier otro pago de la app) y recibir al instante un
  **código QR por cada asiento** con la fila y el número — administración lo
  confirma después. Si se compra más de un asiento en la misma compra, antes
  de las entradas sale un **recibo con todos los asientos juntos** (comprador,
  método, referencia y total); cada entrada individual lleva el diseño de
  "El Cascanueces" con su código QR. El correo es obligatorio al comprar sin
  haber iniciado sesión (ahí se envían las entradas); si se compra desde el
  portal de representantes, se envían solas al correo con el que la persona
  está inscrita, sin tener que volver a escribirlo. El botón **"Descargar
  PDF"** genera el archivo directo en el dispositivo (ya no depende del
  diálogo de impresión del navegador, que en varios celulares no dejaba
  descargar nada y en computadora a veces sacaba páginas en blanco), y hay
  un botón **"Por correo"** para reenviarlas cuando se quiera — tanto justo
  después de comprar como después, desde "Mis entradas" o el portal de
  representantes. El envío de correos necesita configurarse una vez — ver
  "Correo con las entradas" más abajo.
- **Portal de maestros** (`/maestro`, nombre + PIN compartido): clases de
  prueba próximas y recientes (con quién vino o no vino y su WhatsApp),
  asistencia, notas del día y tareas por grupo.
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

## Correo con las entradas

Para que la app pueda enviar las entradas por correo (al comprar y con el
botón "Por correo") hace falta un proveedor de correo — se usa
[Resend](https://resend.com) porque tiene un plan gratis y es sencillo de
configurar. Sin este paso, los botones de PDF y las entradas en sí funcionan
igual — lo único que no funciona es el envío por correo (el botón muestra
"No se pudo enviar el correo").

1. Crea una cuenta gratis en [resend.com](https://resend.com) → **API Keys**
   → **Create API Key** → copia la clave (empieza con `re_`).

2. (Opcional pero recomendado) En Resend, ve a **Domains** → agrega y
   verifica tu propio dominio (ej. `cifadagio.com`) siguiendo sus
   instrucciones (son registros DNS que agregas donde compraste el
   dominio). Mientras no verifiques un dominio propio, los correos solo se
   pueden enviar a la cuenta con la que te registraste en Resend — útil
   para probar, pero no sirve para enviarle a tus compradores reales.

3. En el panel de Supabase, ve a **Edge Functions** → **Deploy a new
   function** → nómbrala exactamente **`send-ticket-email`** → borra el
   contenido de ejemplo y pega todo el archivo
   [`supabase/functions/send-ticket-email/index.ts`](./supabase/functions/send-ticket-email/index.ts)
   de este proyecto → **Deploy**.

4. Dentro de esa misma función, busca **Secrets** y agrega:
   - `RESEND_API_KEY` → la clave de arriba.
   - `RESEND_FROM` (opcional) → el remitente que verán tus compradores, por
     ejemplo `CIF Adagio <entradas@cifadagio.com>` (necesita el dominio
     verificado del paso 2). Si no lo configuras, se usa la dirección de
     prueba de Resend.

5. Para probar: compra una entrada desde `/entradas` sin iniciar sesión,
   usando tu propio correo (o el de tu cuenta de Resend si todavía no
   verificaste un dominio) — debería llegarte con el código QR a los
   pocos segundos.

## Estructura del proyecto

```
src/lib/constants.js       Catálogo del negocio: grupos, niveles, métodos de pago, reglamento
src/lib/business.js        Precios, prorrateo, reglas de beca/facturación
src/lib/tickets.js         Mapa de butacas del teatro, precio por fila, helpers de entradas
src/lib/ticketsPdf.js      Genera el PDF descargable de las entradas (jsPDF, corre en el navegador)
src/lib/email.js           Pide al backend que envíe las entradas por correo (opcional, ver abajo)
src/lib/format.js          Formateo de moneda/fecha, generación de códigos, enlaces de recordatorio
src/lib/supabase.js        Configuración de Supabase (lee variables de entorno)
src/lib/db.js              Hooks de datos en tiempo real (colecciones + settings + fotos)
src/lib/AppDataContext.jsx Contexto React que expone todos los datos a la app
src/lib/session.js         Sesiones ligeras (sessionStorage) para los 3 tipos de acceso
src/lib/push.js            Suscripción y envío de notificaciones push (opcional)
public/sw.js                Service worker que muestra las notificaciones push
src/components/            Piezas reutilizables: formularios, modales, calendario, avatar
src/screens/                Landing, flujo de clase de prueba, compra de entradas, y las 3 puertas de acceso
src/screens/admin/          Panel de administración (10 pestañas)
src/screens/rep/            Portal de representantes
src/screens/teacher/        Portal de maestros
supabase/schema.sql          Tabla + políticas de seguridad + tiempo real (léelo antes de correrlo)
supabase/functions/send-push         Función que envía las notificaciones push (despliegue manual, ver arriba)
supabase/functions/send-ticket-email Función que envía las entradas por correo (despliegue manual, ver arriba)
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
