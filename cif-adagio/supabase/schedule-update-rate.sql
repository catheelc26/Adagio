-- Programa que la función de Edge "update-rate" se llame SOLA todos los
-- días, lunes a viernes por la mañana (el BCV publica su tasa del día a
-- media mañana, hora de Venezuela).
--
-- Requisitos antes de correr esto:
--   1. Ya haber desplegado la función "update-rate" (ver
--      supabase/functions/update-rate/index.ts).
--   2. Tener a mano la URL del proyecto y la "anon public key" — están en
--      el panel de Supabase, en Project Settings → API.
--
-- Reemplaza <TU-PROJECT-REF> y <TU-ANON-KEY> por tus datos reales antes de
-- correr este script en el SQL Editor.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'update-rate-diario',
  '0 14 * * 1-5', -- 14:00 UTC = 10:00 am en Venezuela (UTC-4), lunes a viernes
  $$
  select net.http_post(
    url := 'https://<TU-PROJECT-REF>.supabase.co/functions/v1/update-rate',
    headers := jsonb_build_object('Authorization', 'Bearer <TU-ANON-KEY>', 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);

-- Para revisar que quedó programado:
-- select * from cron.job;

-- Para desactivarlo más adelante si hiciera falta:
-- select cron.unschedule('update-rate-diario');
