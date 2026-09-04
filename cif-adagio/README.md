# CIF Adagio

Sistema de gestión para la escuela de ballet **CIF Adagio**: estudiantes,
pagos y becas, calendario de clases, portal de representantes, portal de
maestros y clases de prueba.

Este proyecto es **completamente independiente** del resto del repositorio
(no comparte código, diseño ni base de datos con ningún otro sitio que viva
aquí) — vive en su propia carpeta (`cif-adagio/`) para poder desplegarse por
separado, con su propio dominio.

Construido con **Vite + React + Tailwind CSS v4 + Firebase Firestore**.

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

## Puesta en marcha

```bash
cd cif-adagio
npm install
cp .env.example .env      # y rellena los valores (ver abajo)
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

Sin las credenciales de Firebase configuradas, la app carga igual (para ver
el diseño) pero no puede guardar ni leer nada — verás un aviso rojo en la
parte superior recordándotelo.

## Configurar Firebase (checklist)

1. Crea una cuenta gratuita en [firebase.google.com](https://firebase.google.com).
2. Crea un proyecto nuevo → en el menú lateral, **Build → Firestore
   Database → Create database** (modo producción, elige la región más
   cercana).
3. En **Project settings → General → Your apps**, agrega una app **Web**
   (ícono `</>`) y copia el objeto `firebaseConfig` que te muestra.
4. Copia `.env.example` a `.env` y pega cada valor:

   | Variable | Campo en `firebaseConfig` |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `VITE_FIREBASE_APP_ID` | `appId` |

5. Publica las reglas de seguridad: en **Firestore Database → Rules**, pega
   el contenido de [`firestore.rules`](./firestore.rules) (o instala la
   [Firebase CLI](https://firebase.google.com/docs/cli) y corre
   `firebase deploy --only firestore:rules` desde esta carpeta). Ese archivo
   explica por qué las reglas son abiertas (la app no usa Firebase Auth,
   igual que la versión original solo usaba PIN/código sin cuentas reales).
6. Vuelve a `npm run dev` — ya debería desaparecer el aviso rojo y poder
   guardar datos.

## Desplegar en Netlify o Vercel

Como este proyecto vive en una subcarpeta del repositorio (`cif-adagio/`),
al conectar el repo en Netlify/Vercel indica ese **directorio raíz /
"Root Directory"**:

- **Root Directory**: `cif-adagio`
- **Build command**: `npm run build`
- **Publish/Output directory**: `dist`

Y agrega las mismas 6 variables de entorno de `.env` en la configuración del
proyecto (Netlify: *Site settings → Environment variables*; Vercel:
*Settings → Environment Variables*).

Cuando quede desplegado, súbete las reglas de Firestore (paso 5 arriba) si
no lo has hecho — sin eso, la app en producción no podrá leer ni guardar
nada aunque las variables estén bien puestas.

## Instalar como app en el celular

Con el sitio ya desplegado (HTTPS), desde el navegador del celular:
**Safari (iOS)** → compartir → "Agregar a pantalla de inicio". **Chrome
(Android)** → menú → "Instalar app" / "Agregar a pantalla de inicio". Usa el
ícono y nombre configurados en `public/manifest.webmanifest`.

## Estructura del proyecto

```
src/lib/constants.js       Catálogo del negocio: grupos, niveles, métodos de pago, reglamento
src/lib/business.js        Precios, prorrateo, reglas de beca/facturación
src/lib/format.js          Formateo de moneda/fecha, generación de códigos, enlaces de recordatorio
src/lib/firebase.js        Configuración de Firebase (lee variables de entorno)
src/lib/db.js              Hooks de Firestore en tiempo real (colecciones + settings + fotos)
src/lib/AppDataContext.jsx Contexto React que expone todos los datos a la app
src/lib/session.js         Sesiones ligeras (sessionStorage) para los 3 tipos de acceso
src/components/            Piezas reutilizables: formularios, modales, calendario, avatar
src/screens/                Landing, flujo de clase de prueba, y las 3 puertas de acceso
src/screens/admin/          Panel de administración (9 pestañas)
src/screens/rep/            Portal de representantes
src/screens/teacher/        Portal de maestros
firestore.rules             Reglas de seguridad de Firestore (léelas antes de publicarlas)
```

## Notas

- Las fotos de estudiantes y los comprobantes de pago se guardan como
  imágenes comprimidas directamente en Firestore (igual que en la versión
  original), no en Firebase Storage — sencillo y suficiente para el volumen
  de esta escuela. Si en el futuro se vuelve pesado, migrar a Firebase
  Storage es un cambio localizado en `src/lib/db.js`.
- El PIN de administración, el PIN de maestros y los códigos de acceso de
  representantes se guardan tal cual (sin cifrar), igual que en la versión
  original — es un modelo de seguridad intencionalmente simple para una
  escuela pequeña, no una cuenta de usuario real.
