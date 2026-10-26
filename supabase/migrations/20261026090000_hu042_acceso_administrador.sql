-- ============================================================
-- Hotelica — HU-042: acceso de administrador con cuenta real
-- Se aplica desde el SQL Editor del Dashboard de Supabase.
-- Guardá este archivo como registro de lo que corrió.
-- ============================================================

-- 1) Correos autorizados a entrar a la consola de administración.
--    Se carga y se modifica desde el Dashboard, nunca desde la app.
create table if not exists public.administradores (
  correo text primary key,
  creado_en timestamptz not null default now()
);

alter table public.administradores enable row level security;

-- Con sesión iniciada cualquiera puede preguntar si su correo es de admin:
-- el listado no se escribe ni se lee desde la interfaz (solo Dashboard)
drop policy if exists administradores_lectura on public.administradores;
create policy administradores_lectura on public.administradores
  for select to authenticated using (true);

-- Acá va el correo real del administrador del proyecto (ejemplo):
-- insert into public.administradores (correo) values ('admin@hotelica.ni')
--   on conflict (correo) do nothing;

-- 2) ¿Quién es administrador? Lo responde la base, no el navegador.
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from administradores
    where lower(correo) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 3) Solo un administrador autenticado puede cambiar el estado del hotel.
--    Cualquiera puede inscribir uno nuevo (entra como pendiente) y los
--    datos del hotel siguen libres como en la Fase 2: lo blindado es el
--    estado Pendiente -> Aprobado / Rechazado (HU-031 y HU-032).
create or replace function public.controlar_estado_hotel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.aprobado is distinct from 'pendiente' and not es_admin() then
      raise exception 'Los hoteles nuevos entran como pendientes';
    end if;
  elsif new.aprobado is distinct from old.aprobado and not es_admin() then
    raise exception 'Solo un administrador puede aprobar o rechazar un hotel';
  end if;
  return new;
end;
$$;

drop trigger if exists control_estado_hotel on public.hoteles;
create trigger control_estado_hotel
  before insert or update on public.hoteles
  for each row execute function public.controlar_estado_hotel();

-- Listo: la consola se abre con cuenta de administrador y la base
-- deja de aceptar cambios de estado que no vengan de un admin.
