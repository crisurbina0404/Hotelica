-- ============================================================
-- Hotelica — HU-041: fotos de las habitaciones
-- Se aplica desde el SQL Editor del Dashboard de Supabase.
-- Guardá este archivo como registro de lo que corrió.
-- ============================================================

-- Cada tipo de habitación tiene su propia galería de fotos.
-- La primera posición es la portada que ve el turista.
alter table public.habitaciones add column if not exists galeria jsonb default '[]'::jsonb;

-- Listo: las habitaciones ya pueden guardar sus fotos.
