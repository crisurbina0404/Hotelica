-- HU-032: el motivo del rechazo queda guardado en la base junto al hotel
-- Antes vivía solo en el navegador; con esta columna viaja con el upsert de hoteles.
-- Se corre desde el SQL Editor del Dashboard de Supabase.

alter table public.hoteles add column if not exists motivo_rechazo text;

comment on column public.hoteles.motivo_rechazo is
  'Por qué el administrador rechazó la solicitud (HU-032); vacío si no hubo rechazo';
