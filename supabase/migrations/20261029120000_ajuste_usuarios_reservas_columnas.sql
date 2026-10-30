-- ============================================================
-- Hotelica — Corrección: columnas que faltan en usuarios y reservas
-- En el Dashboard estas tablas ya existían con menos columnas que la
-- app necesita. Como las migraciones anteriores usaban
-- "create table if not exists", no tocaron lo existente y el upsert
-- de la app fallaba con "Could not find the 'nombre' / 'correo'} column"
-- antes de llegar a revisar las políticas RLS.
-- Aquí completamos el esquema con las columnas que faltan.
-- Se aplica desde el SQL Editor del Dashboard de Supabase.
-- Guardá este archivo como registro de lo que corrió.
-- ============================================================

-- 1) usuarios (HU-033): la tabla real trae "nombres" con s, pero la app
--    escribe "nombre"; y el rol no existía
alter table public.usuarios add column if not exists nombre text;
alter table public.usuarios add column if not exists rol text check (rol in ('Turista', 'Hotel', 'Admin'));

-- Copiamos lo que ya estaba en "nombres" para no perder datos
update public.usuarios set nombre = nombres where nombre is null and nombres is not null;
update public.usuarios set rol = 'Turista' where rol is null;

-- 2) reservas (HU-034): faltaban las columnas del contacto del turista,
--    el rechazo del hotel y las horas de check-in / check-out
alter table public.reservas add column if not exists correo text;
alter table public.reservas add column if not exists telefono text;
alter table public.reservas add column if not exists comentarios text;
alter table public.reservas add column if not exists motivo_rechazo text; -- HU-027
alter table public.reservas add column if not exists checkin_en timestamptz;  -- HU-028
alter table public.reservas add column if not exists checkout_en timestamptz; -- HU-029

-- Listo: subirUsuario y subirReserva ya encuentran todas las columnas
-- que escribe aFilaUsuario / aFilaReserva y el upsert entra de verdad.
