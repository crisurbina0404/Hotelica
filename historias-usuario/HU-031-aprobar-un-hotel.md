# HU-031 — Aprobar un hotel

**Módulo:** Administración
**Prioridad:** Alta (Must Have)
**Estado:** ✅ Terminada
**Sprint:** 7
**Interfaz:** sección "Solicitudes de registro" de `src/pages/AdminPanel.tsx`

## Redacción estándar

> Como **administrador global**, quiero **aprobar un hotel registrado**, para **habilitarlo en la plataforma y permitir que reciba reservas**.

## Contexto

Con la HU-021 cualquier persona puede inscribir su hotel desde el Inicio y la solicitud queda guardada con `estado_hotel = 'Pendiente'`: no aparece en ninguna búsqueda del turista hasta que alguien la revise. Ese alguien es el administrador, y esta historia es **su decisión más importante**: aprobar.

Aprobar no es solo cambiar un estado. En el mismo movimiento el sistema tiene que:

1. **Dejar el hotel publicado**, porque solo los hoteles con `estado_hotel = 'Aprobado'` aparecen en las búsquedas del turista (regla de negocio).
2. **Crear la cuenta de hotelero** con el correo que dejó el dueño y una contraseña temporal, para que él pueda entrar a su panel (HU-021, HU-040).
3. **Avisarle al dueño** con un correo automático que trae esas credenciales e instrucciones para entrar.

Antes de hacer todo eso, el admin revisa la solicitud con el botón "Ver" (foto, descripción, ubicación exacta en el mapa, dueño y contacto). La historia suma además una **validación de requisitos mínimos**: si el hotel llega incompleto —por ejemplo, sin foto, sin descripción o sin correo del dueño—, el sistema no deja aprobarlo y le dice al admin qué le falta, en vez de publicar una ficha a medias que el turista vería rota.

La historia comparte pantalla con el **rechazo** (HU-032), que es el otro camino de la misma bandeja.

Reglas de negocio de esta historia:

1. **Solo hoteles pendientes:** el botón "Aprobar" aparece únicamente en las solicitudes con `estado_hotel = 'Pendiente'`. Un hotel ya aprobado o rechazado no se vuelve a decidir desde esta bandeja.
2. **Requisitos mínimos antes de aprobar:** el hotel debe tener foto representativa, descripción de al menos 30 caracteres, dirección de al menos 8, ubicación exacta marcada en el mapa, municipio y departamento válidos, y el correo del dueño (es el que recibe la cuenta y el aviso). Si falta algo, **no se aprueba** y se lista lo que falta.
3. **Cambio inmediato:** al aprobar, el estado pasa de *Pendiente* a *Aprobado* al instante, tanto en la pantalla como en la base de datos, sin recargar la página.
4. **Cuenta de hotelero:** si el dueño dejó correo y todavía no tiene cuenta, se crea en el mismo acto con una contraseña temporal que debe cambiar en 48 horas (HU-040).
5. **Confirmación visual:** el admin ve un aviso con el nombre del hotel aprobado y, cuando se crea la cuenta, un modal con el correo y la contraseña para dárselos al dueño.
6. **Notificación automática:** el sistema envía solo un correo al dueño con sus credenciales y el enlace a entrar a Hotelica.
7. **Solo aprobados se publican:** recién en este momento el hotel empieza a aparecer en búsquedas, en el Inicio y en la ficha pública.

## Criterios de aceptación (BDD)

### Escenario 1: La bandeja muestra los hoteles esperando aprobación (HOTELICA-261)
**Dado** que hay hoteles inscritos con `estado_hotel = 'Pendiente'`
**Cuando** el administrador abre la consola de administración
**Entonces** ve la lista "Hoteles pendientes de aprobación" con cada solicitud: foto, nombre, dueño, ubicación, fecha de registro y estado

### Escenario 2: Aprobar con un botón (HOTELICA-262)
**Dado** que el administrador revisó una solicitud pendiente
**Cuando** pulsa el botón "Aprobar" de esa fila (o el del modal de revisión)
**Entonces** el sistema procesa la aprobación y no ofrece ese botón en los hoteles que ya no están pendientes

### Escenario 3: Un hotel incompleto no se puede aprobar (HOTELICA-263)
**Dado** que una solicitud no tiene foto, o su descripción o dirección están vacías, o le falta la ubicación en el mapa o el correo del dueño
**Cuando** el administrador intenta aprobarla
**Entonces** el sistema no cambia el estado, muestra un aviso con cada requisito que falta y el hotel sigue pendiente

### Escenario 4: El estado queda guardado de inmediato (HOTELICA-264)
**Dado** que el administrador aprueba un hotel que sí tiene todos los requisitos
**Cuando** se ejecuta la aprobación
**Entonces** el hotel pasa a `estado_hotel = 'Aprobado'` en la pantalla y en la base de datos, sale de la bandeja de pendientes, entra al historial de revisados y ya aparece en las búsquedas del turista

### Escenario 5: Confirmación visual de la acción (HOTELICA-265)
**Dado** que la aprobación se completó
**Cuando** vuelve la vista del administrador
**Entonces** ve un aviso con el nombre del hotel aprobado y, si se creó la cuenta, un modal con el correo y la contraseña temporales para enviarle al dueño

### Escenario 6: El dueño recibe la notificación (HOTELICA-266)
**Dado** que el hotel tenía el correo del dueño y se creó su cuenta
**Cuando** el sistema termina de aprobar
**Entonces** envía automáticamente un correo a ese dueño con su correo, su contraseña y el enlace para entrar a su panel

## MoSCoW

- **Must Have:** lista de hoteles pendientes; botón de aprobación solo en pendientes; validación de requisitos mínimos con aviso de lo que falta; cambio de estado inmediato en la app y en la BD; confirmación visual con el modal de credenciales; correo automático al dueño.
- **Should Have:** reutilizar el modal de revisión (foto, mapa y datos del dueño) para aprobar sin salir de ahí; el hotel aprobado entra de inmediato al historial de revisados.
- **Could Have:** checklist de requisitos visible en la ficha de revisión antes de aprobar; aprobación múltiple de varias solicitudes de una vez; reenvío del correo de credenciales si falló el primero.
- **Won't Have:** aprobar hoteles que ya fueron decididos; editar los datos del hotel desde la bandeja (eso es HU-022); crear cuentas de administradores; aprobar sin revisar (el requisito mínimo es obligatorio).

## Notas de implementación

- **Componente:** `src/pages/AdminPanel.tsx` ya existía con la bandeja de pendientes, la tabla de escritorio, las tarjetas del celular y el historial de decisiones (subtarea HOTELICA-261).
- **Botón de aprobación:** `accionesHotel()` arma "Ver", "Aprobar" y "Rechazar" para cada pendiente, y el modal de revisión repite los botones cuando el hotel está pendiente (subtarea HOTELICA-262).
- **Requisitos mínimos (la parte nueva):** `requisitosIncompletos()` en `src/data.ts` revisa foto, descripción, dirección, ubicación exacta, municipio/departamento y correo del dueño, y devuelve la lista de lo que falta. `aprobar()` en `AdminPanel.tsx` la consulta antes de decidir: si hay faltantes, muestra el aviso con `avisar()` y no toca el estado (subtarea HOTELICA-263).
- **Estado en la BD:** `decidirHotel()` en `src/store.tsx` cambia `aprobado` en el estado global y llama a `subirHotelConAviso()`, que hace el *upsert* de la fila en la tabla `hoteles` (subtarea HOTELICA-264).
- **Confirmación:** el toast `"X" aprobado: ...` y el modal "Cuenta de hotelero creada" con correo y contraseña, que se cierra con "Entendido" (subtarea HOTELICA-265).
- **Notificación:** `enviarCuentaHotelero()` llama a la Edge Function `enviar-cuenta-hotelero` (Brevo), que manda el correo real al dueño; si falla, el modal conserva las credenciales para copiarlas a mano (subtarea HOTELICA-266).
- **Visibilidad del turista:** `Home.tsx`, `Results.tsx`, `HotelDetail.tsx` y `MyReservations.tsx` filtran por `aprobado === "aprobado"`, así que el hotel se publica solo al cambiar el estado.
- **Pruebas:** `tests/CP-031-aprobar-hotel.spec.ts` cubre los seis escenarios con Playwright (BD y correo simulados para no tocar Supabase); se corren con `npm run test:e2e`.
- **Datos de demostración:** los dos hoteles pendientes de la semilla ahora traen `correoDueno`, porque un hotel sin correo del dueño no puede aprobarse (no habría cuenta ni notificación).
