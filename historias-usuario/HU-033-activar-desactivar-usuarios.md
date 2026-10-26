# HU-033 — Activar o desactivar usuarios

**Módulo:** Administración
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 7
**Interfaz:** sección "Usuarios" de `src/pages/AdminPanel.tsx`

## Redacción estándar

> Como **administrador global**, quiero **activar o desactivar usuarios**, para **controlar accesos y mantener la seguridad de la plataforma**.

## Contexto

Hotelica tiene tres tipos de cuentas: turistas (HU-001), hoteleros creados al aprobar un hotel (HU-021) y administradores (HU-042). Hasta ahora, una vez creada una cuenta no había manera de cortarle el acceso desde la plataforma: si una cuenta se usaba de forma indebida, o un hotelero ya no trabajaba con su hotel, o un correo quedó comprometido, la única salida era borrar filas a mano en el Dashboard de Supabase.

Esta historia agrega el control de acceso del administrador: una **sección "Usuarios"** en la consola que lista las cuentas de la plataforma **por rol**, con su estado, y permite **activar o desactivar** cada una. Un usuario desactivado **no puede iniciar sesión**; su cuenta no se borra, solo se apaga, y un administrador puede volver a activarla.

La historia apoya el trabajo de las HU-031 y HU-032: cada vez que el admin aprueba un hotel se crea una cuenta de hotelero (HU-021), y esa cuenta ahora aparece en esta lista, donde puede administrarse.

Reglas de negocio de esta historia:

1. **Solo en la consola:** la sección vive en la consola de administración, que ya exige sesión y rol de administrador (HU-042).
2. **Listado por rol:** cada usuario se muestra con su nombre, correo, rol (Turista, Hotelero o Admin) y estado (Activo o Desactivado); el admin puede ver la lista completa o filtrarla por cada rol.
3. **Acción según el estado actual:** el botón de cada fila ofrece siempre lo contrario del estado actual: "Desactivar" a los activos y "Activar" a los desactivados. Un usuario ya desactivado no ofrece "Desactivar" (y la validación del sistema lo rechaza igual, por si se llegara a pedir el mismo estado).
4. **Cambio inmediato:** al activar o desactivar, el estado cambia al instante en la pantalla y en la base de datos (`activo = TRUE/FALSE`), sin recargar la página.
5. **Sin acceso desactivado:** una cuenta desactivada no puede iniciar sesión (ni como turista ni como hotelero) y el sistema le explica por qué; la cuenta no se borra y conserva sus datos.
6. **No auto-desactivarse:** el administrador no puede desactivar su propia cuenta: su fila no ofrece ese botón y la validación lo rechaza. Así nunca se puede quedar sin acceso a la consola.
7. **Confirmación visual:** el admin ve un aviso con el nombre del usuario y el nuevo estado, y la pastilla de la fila se actualiza.
8. **Alta automática:** las cuentas quedan registradas en la lista al crearlas: el turista al registrarse o iniciar sesión, el hotelero al aprobarse su hotel y el administrador al iniciar sesión como admin.

## Criterios de aceptación (BDD)

### Escenario 1: La consola tiene la sección de usuarios (HOTELICA-275)
**Dado** que un administrador está dentro de la consola de administración
**Cuando** recorre la pantalla
**Entonces** ve la sección "Usuarios de la plataforma" con el total de cuentas registradas

### Escenario 2: El listado muestra los usuarios con su rol (HOTELICA-276)
**Dado** que en la plataforma hay cuentas de turistas, hoteleros y administradores
**Cuando** el administrador mira la sección de usuarios
**Entonces** ve cada cuenta con nombre, correo, pastilla de rol y estado, y puede filtrar la lista por rol o verla completa

### Escenario 3: Desactivar un usuario activo (HOTELICA-277)
**Dado** que el administrador ve un usuario con estado "Activo"
**Cuando** pulsa el botón "Desactivar" de esa fila
**Entonces** el usuario pasa a "Desactivado", su botón cambia a "Activar" y ya no puede iniciar sesión con su cuenta

### Escenario 4: El estado actual valida la acción (HOTELICA-278)
**Dado** que un usuario ya está desactivado
**Cuando** el administrador mira su fila
**Entonces** no aparece el botón "Desactivar" (solo "Activar") y el sistema rechaza cualquier pedido de dejarlo desactivado de nuevo sin cambiar nada

### Escenario 5: El estado queda guardado de inmediato en la BD (HOTELICA-279)
**Dado** que el administrador activa o desactiva un usuario
**Cuando** se ejecuta el cambio
**Entonces** la fila de la base de datos se actualiza con `activo = FALSE` o `activo = TRUE` en el mismo momento, sin recargar la página

### Escenario 6: Confirmación visual de la acción (HOTELICA-280)
**Dado** que se completó la activación o desactivación
**Cuando** vuelve la vista del administrador
**Entonces** ve un aviso con el nombre del usuario y el nuevo estado, y la pastilla de la fila refleja ese estado

### Escenario 7: No se puede desactivar la propia cuenta (HOTELICA-281)
**Dado** que el administrador está viendo la lista de usuarios
**Cuando** busca su propia fila
**Entonces** no tiene botón de desactivación (se indica que es solo lectura) y el sistema rechaza el intento de desactivarse a sí mismo

## MoSCoW

- **Must Have:** sección "Usuarios" en la consola; listado con nombre, correo, rol y estado; filtro por rol; botón que ofrece la acción contraria al estado actual; validación del estado actual; desactivar bloquea el inicio de sesión; cambio inmediato en la app y en la BD (`activo` TRUE/FALSE); no permitir desactivarse a uno mismo; confirmación visual con aviso y pastilla.
- **Should Have:** las cuentas se registran solas en la lista (turista al registrarse, hotelero al aprobarse su hotel, admin al entrar); un usuario desactivado conserva su cuenta y sus datos; la lista persiste en la base de datos.
- **Could Have:** filtro de búsqueda por nombre o correo; desactivación con motivo obligatorio; reactivación masiva; aviso por correo al usuario desactivado.
- **Won't Have:** borrar usuarios (la desactivación no borra nada); expulsar a sesiones ya abiertas (el bloqueo corta el próximo inicio de sesión); administrar la lista de administradores desde la consola (sigue en el Dashboard, HU-042); desactivar desde el panel del hotelero; doble factor.

## Notas de implementación

- **Tipo y semilla:** `UsuarioPlataforma` y `USUARIOS_SEED` en `src/data.ts` (correo como clave, nombre, rol, activo y fecha de creación) (subtarea HOTELICA-276).
- **Estado global:** `usuarios` entra a `Persistido` en `src/store.tsx`; se fusiona con la tabla `usuarios` de la base al abrir la app (`fusionarUsuarios()` en `src/sync.ts`), con la base manda por correo (subtarea HOTELICA-279).
- **Alta automática (subtarea HOTELICA-276):** `asegurarUsuario()` agrega la fila cuando hace falta — `registrar()` para el turista, `login()` para turista y admin, y `decidirHotel()` cuando crea la cuenta del hotelero.
- **Activar/desactivar:** `cambiarEstadoUsuario(correo, activo)` en `src/store.tsx` valida que el usuario exista, que no se pida el mismo estado (subtarea HOTELICA-278) y que nadie se desactive a sí mismo (subtarea HOTELICA-281); luego actualiza el estado local y sube la fila con `subirUsuario()` (subtarea HOTELICA-279).
- **Bloqueo de acceso:** `login()` en `src/store.tsx` revisa el estado antes de abrir sesión: la cuenta de hotelero desactivada no entra y, en el camino de Supabase, la sesión recién abierta se cierra con `signOut()` y se explica el motivo (subtarea HOTELICA-277).
- **Interfaz:** sección "Usuarios de la plataforma" en `src/pages/AdminPanel.tsx` (subtarea HOTELICA-275) con chips de filtro por rol, filas con avatar, pastillas de rol y estado, y botón "Desactivar"/"Activar"; la propia fila del admin es de solo lectura (subtarea HOTELICA-281). El cambio se confirma con toast y la pastilla se actualiza al momento (subtarea HOTELICA-280).
- **Base de datos:** migración `supabase/migrations/20261026150000_hu033_usuarios_activo.sql` crea la tabla `usuarios` (RLS con lectura para sesiones iniciadas) y el disparador `controlar_activo_usuario`, que solo deja cambiar `activo` a un administrador autenticado (misma vía que `controlar_estado_hotel` de HU-042). Se corre desde el SQL Editor del Dashboard.
- **Pruebas:** `tests/CP-033-activar-desactivar.spec.ts` cubre los escenarios con Playwright (tabla de usuarios simulada): desactivación con aviso, cambio de `activo` en el guardado del navegador y en lo que se sube a la base, filtro por rol, la propia fila sin botón, y el intento de iniciar sesión con una cuenta desactivada.
