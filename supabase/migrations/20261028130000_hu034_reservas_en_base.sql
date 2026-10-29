-- ============================================================
-- Hotelica — HU-034: las reservas también viven en la base de datos
-- Hasta hoy las reservas solo existían en el navegador, así que las
-- cifras de la consola del admin (reservas totales, ingresos, IVA)
-- contaban el navegador y no lo que de verdad está guardado.
-- Con esta tabla las cifras salen exactas del registro.
-- Se aplica desde el SQL Editor del Dashboard de Supabase.
-- Guardá este archivo como registro de lo que corrió.
-- ============================================================

create table if not exists public.reservas (
  folio text primary key,          -- HC-XXXX, la llave que ve el turista
  hotel_id text not null,
  habitacion_id text,
  turista text not null,
  correo text not null,
  telefono text,
  comentarios text,
  llegada date,
  salida date,
  huespedes int,
  noches int,
  subtotal numeric,
  iva numeric,
  total numeric,
  pago text,                       -- tarjeta / efectivo / transferencia
  estado text not null default 'pendiente',
  creada timestamptz not null default now(),
  calificada boolean not null default false,
  motivo_rechazo text,             -- por qué el hotel rechazó (HU-027)
  checkin_en timestamptz,          -- hora registrada de la entrada (HU-028)
  checkout_en timestamptz          -- hora registrada de la salida (HU-029)
);

alter table public.reservas enable row level security;

-- Con sesión cualquiera puede leer las reservas: el panel del hotel
-- y la consola del admin las necesitan (HU-023 y HU-034), igual
-- de abierta como ya lo están las tablas de hoteles y habitaciones
drop policy if exists reservas_lectura on public.reservas;
create policy reservas_lectura on public.reservas
  for select to authenticated using (true);

-- Las reservas se escriben desde la app: crear reserva, registrar el pago,
-- confirmar, cancelar, rechazar del hotel, check-in, check-out y calificar
-- guardan su resultado acá con un upsert por folio desde el navegador
drop policy if exists reservas_escritura on public.reservas;
create policy reservas_escritura on public.reservas
  for insert to anon, authenticated with check (true);

drop policy if exists reservas_actualizacion on public.reservas;
create policy reservas_actualizacion on public.reservas
  for update to anon, authenticated using (true) with check (true);

comment on table public.reservas is
  'Reservas de la plataforma (folio la llave). La app hace upsert por folio en cada cambio de estado para que las cifras del admin sean las reales (HU-034).';
