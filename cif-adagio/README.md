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

Y agrega las mismas 2 variables de entorno de `.env` en la configuración del
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

## Estructura del proyecto

```
src/lib/constants.js       Catálogo del negocio: grupos, niveles, métodos de pago, reglamento
src/lib/business.js        Precios, prorrateo, reglas de beca/facturación
src/lib/format.js          Formateo de moneda/fecha, generación de códigos, enlaces de recordatorio
src/lib/supabase.js        Configuración de Supabase (lee variables de entorno)
src/lib/db.js              Hooks de datos en tiempo real (colecciones + settings + fotos)
src/lib/AppDataContext.jsx Contexto React que expone todos los datos a la app
src/lib/session.js         Sesiones ligeras (sessionStorage) para los 3 tipos de acceso
src/components/            Piezas reutilizables: formularios, modales, calendario, avatar
src/screens/                Landing, flujo de clase de prueba, y las 3 puertas de acceso
src/screens/admin/          Panel de administración (9 pestañas)
src/screens/rep/            Portal de representantes
src/screens/teacher/        Portal de maestros
supabase/schema.sql          Tabla + políticas de seguridad + tiempo real (léelo antes de correrlo)
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
