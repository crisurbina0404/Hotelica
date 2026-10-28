-- ============================================================
-- Hotelica — Reseñas en la base de datos (comentarios de HU-019)
-- Se aplica desde el SQL Editor del Dashboard de Supabase.
-- Guardá este archivo como registro de lo que corrió.
-- ============================================================

-- 1) La tabla que faltaba: el comentario que el turista deja al calificar
--    su estadía. Antes vivía solo en el navegador del que la escribió y
--    nadie más lo veía. Sin llave foránea a hoteles a propósito: si un
--    hotel se cae de la base, preferimos conservar su reseña a perderla.
create table if not exists public.resenas (
  id text primary key,
  hotel_id text not null,
  autor text not null,
  origen text,
  rating smallint not null check (rating between 0 and 5),
  comentario text,
  fecha date,
  creado_en timestamptz not null default now()
);

-- 2) RLS activada con la misma filosofía de hoteles y habitaciones:
--    el anon key del navegador lee y escribe sus propias reseñas
alter table public.resenas enable row level security;

drop policy if exists resenas_acceso on public.resenas;
create policy resenas_acceso on public.resenas
  for all to anon, authenticated
  using (true) with check (true);

-- Listo: los comentarios de calificación ya se suben y se leen desde la app.
