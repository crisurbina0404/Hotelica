-- ============================================================
-- Hotelica — Fase 2: hoteles y habitaciones en la base de datos
-- Se aplica desde el SQL Editor del Dashboard de Supabase.
-- Guardá este archivo como registro de lo que corrió.
-- ============================================================

-- 1) Columnas que nuestro hotelero necesita y la tabla no tenía
--    (correo del dueño para entrar al panel, teléfono y el pin del mapa)
alter table public.hoteles add column if not exists correo_dueno text;
alter table public.hoteles add column if not exists contacto text;
alter table public.hoteles add column if not exists ubicacion jsonb;

-- 2) Escritura desde la aplicación: el anon key que corre en el navegador
--    solo tenía permiso de leer, por eso todo lo nuevo se quedaba local.
--    Se mantiene RLS activada, solo se abren las políticas de estas tablas.
drop policy if exists hoteles_escritura on public.hoteles;
create policy hoteles_escritura on public.hoteles
  for all to anon, authenticated
  using (true) with check (true);

drop policy if exists habitaciones_escritura on public.habitaciones;
create policy habitaciones_escritura on public.habitaciones
  for all to anon, authenticated
  using (true) with check (true);

-- Listo: hoteles y habitaciones ya se pueden leer y escribir desde la app.
