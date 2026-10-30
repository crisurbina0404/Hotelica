-- ============================================================
-- Hotelica — HU-033: política de actualización que faltaba en usuarios
-- La tabla solo tenía políticas de lectura (select) y de alta (insert),
-- así que el upsert de subirUsuario no podía ACTUALIZAR una fila que ya
-- existía: activar o desactivar una cuenta, o renovar su nombre, tocaba
-- al navegador con el aviso "no se pudo subir a la base de datos" aunque
-- el administrador tuviera sesión. Faltaba la S en el CRUD.
-- Se aplica desde el SQL Editor del Dashboard de Supabase.
-- Guardá este archivo como registro de lo que corrió.
-- ============================================================

-- La actualización queda abierta con sesión (mismo criterio que hoteles),
-- pero el disparador control_activo_usuario sigue mandando: solo un
-- administrador puede cambiar el estado activo de una cuenta (HU-033)
drop policy if exists usuarios_actualizacion on public.usuarios;
create policy usuarios_actualizacion on public.usuarios
  for update to authenticated using (true) with check (true);

-- Listo: activar, desactivar y actualizar cuentas ya suben a la base.
