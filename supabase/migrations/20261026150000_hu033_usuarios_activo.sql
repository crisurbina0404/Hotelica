-- ============================================================
-- Hotelica — HU-033: activar o desactivar usuarios
-- Se aplica desde el SQL Editor del Dashboard de Supabase.
-- Guardá este archivo como registro de lo que corrió.
-- ============================================================

-- 1) Registro de cuentas de la plataforma con su estado de acceso.
--    El correo es la misma llave que usan Supabase Auth (turistas y
--    admin) y las cuentas de hotelero creadas al aprobar un hotel.
create table if not exists public.usuarios (
  correo text primary key,
  nombre text not null,
  rol text not null check (rol in ('Turista', 'Hotel', 'Admin')),
  activo boolean not null default true, -- FALSE = no puede iniciar sesión
  creado_en timestamptz not null default now()
);

alter table public.usuarios enable row level security;

-- Con sesión iniciada cualquiera puede leer la lista (la consola ya
-- está protegida por rol en el navegador y por el disparador de abajo)
drop policy if exists usuarios_lectura on public.usuarios;
create policy usuarios_lectura on public.usuarios
  for select to authenticated using (true);

-- El alta de cuentas la hace la propia app al registrar, entrar o
-- aprobar un hotel; el rol solo lo usa la consola del administrador
drop policy if exists usuarios_escritura on public.usuarios;
create policy usuarios_escritura on public.usuarios
  for insert to authenticated with check (true);

-- 2) Solo un administrador autenticado puede cambiar el estado activo.
--    Mismo criterio que controlar_estado_hotel (HU-042): aunque alguien
--    se salte la interfaz, la base no apaga ni enciende cuentas sola.
create or replace function public.controlar_activo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.activo is distinct from true and not es_admin() then
      raise exception 'Las cuentas nuevas entran activas';
    end if;
  elsif new.activo is distinct from old.activo and not es_admin() then
    raise exception 'Solo un administrador puede activar o desactivar una cuenta';
  end if;
  return new;
end;
$$;

drop trigger if exists control_activo_usuario on public.usuarios;
create trigger control_activo_usuario
  before insert or update on public.usuarios
  for each row execute function public.controlar_activo_usuario();

-- Nota: la desactivación corta el próximo inicio de sesión desde la app.
-- Cerrar la sesión abierta de ese usuario depende de Supabase Auth y queda
-- fuera de esta historia (se puede hacer desde el Dashboard).
