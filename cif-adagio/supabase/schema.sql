-- CIF Adagio — esquema de Supabase.
--
-- Corre esto una sola vez en tu proyecto: panel de Supabase → SQL Editor →
-- pega todo este archivo → Run.
--
-- Toda la app guarda sus datos como "documentos" dentro de una única tabla
-- (una fila = un estudiante, un pago, un evento de calendario, etc.),
-- agrupados por `collection`. Es el mismo modelo de documentos/colecciones
-- que tenía la versión original — solo que ahora vive en Postgres real.

create table if not exists documents (
  collection text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

create index if not exists documents_collection_idx on documents (collection);

-- Actualiza updated_at automáticamente en cada cambio.
create or replace function documents_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists documents_updated_at on documents;
create trigger documents_updated_at
  before update on documents
  for each row execute function documents_set_updated_at();

-- Row Level Security -------------------------------------------------------
-- La app no usa Supabase Auth (por diseño: PIN de administración, PIN de
-- maestros y código de acceso por estudiante, igual que en la versión
-- original), así que estas políticas son intencionalmente abiertas —
-- cualquiera con la URL del sitio y la "anon key" pública puede leer/escribir.
-- Es el mismo modelo de seguridad que ya tenía la app (sin cuentas reales).
--
-- Si más adelante quieres reforzar esto, lo más simple es migrar a
-- Supabase Auth de verdad; no es necesario para que la escuela use la app hoy.
alter table documents enable row level security;

drop policy if exists "public read" on documents;
create policy "public read" on documents for select using (true);

drop policy if exists "public insert" on documents;
create policy "public insert" on documents for insert with check (true);

drop policy if exists "public update" on documents;
create policy "public update" on documents for update using (true) with check (true);

drop policy if exists "public delete" on documents;
create policy "public delete" on documents for delete using (true);

-- Tiempo real ----------------------------------------------------------------
-- Permite que la app reciba cambios en vivo (por ejemplo, que administración
-- vea al instante un pago que acaba de reportar un representante).
-- (bloque seguro para volver a correr el script sin que falle si ya estaba agregada)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'documents'
  ) then
    alter publication supabase_realtime add table documents;
  end if;
end $$;
