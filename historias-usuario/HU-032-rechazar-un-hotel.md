# HU-032 — Rechazar un hotel

**Módulo:** Administración
**Prioridad:** Alta (Must Have)
**Estado:** ✅ Terminada
**Sprint:** 7
**Interfaz:** sección "Solicitudes de registro" de `src/pages/AdminPanel.tsx`

## Redacción estándar

> Como **administrador global**, quiero **rechazar un hotel registrado**, para **descartar solicitudes que no cumplen los requisitos y mantener la plataforma limpia**.

## Contexto

Con la HU-021 cualquier persona puede inscribir su hotel y la solicitud queda guardada con `estado_hotel = 'Pendiente'`. La HU-031 enseña el camino de la aprobación; esta historia es **el otro camino de la misma bandeja**: el rechazo.

Rechazar sirve para descartar solicitudes incompletas, con datos falsos o que no cumplen las reglas de la plataforma. A diferencia de aprobar:

1. **No se publica el hotel**: sigue fuera de las búsquedas (solo los hoteles con `estado_hotel = 'Aprobado'` aparecen).
2. **No se crea cuenta de hotelero** ni se envía correo de credenciales.
3. **Sí se le explica la decisión**: el admin escribe un motivo obligatorio, que queda registrado con el hotel, llega como aviso automático al panel del hotel y, si el dueño dejó correo al inscribirse, se le manda **un correo automático** con el motivo.

Como el rechazo es una decisión definitiva para el dueño, el sistema **siempre pide un motivo** y, de paso, le muestra al admin los requisitos que el hotel tiene incumplidos, para que el motivo tenga sustento.

La historia comparte pantalla con la **aprobación** (HU-031): los mismos botones "Ver", "Aprobar" y "Rechazar" viven en la bandeja y en el modal de revisión.

Reglas de negocio de esta historia:

1. **Solo hoteles pendientes:** el botón "Rechazar" aparece únicamente en las solicitudes con `estado_hotel = 'Pendiente'`. Un hotel ya aprobado o rechazado no se vuelve a decidir desde esta bandeja.
2. **Motivo obligatorio:** no se puede rechazar sin escribir el motivo; si está vacío, el sistema muestra un error, no cambia el estado y el hotel sigue pendiente.
3. **Requisitos incumplidos a la vista:** el formulario del rechazo lista los requisitos que le faltan al hotel (los mismos de la HU-031) como apoyo para redactar el motivo.
4. **Cambio inmediato:** al confirmar, el estado pasa de *Pendiente* a *Rechazado* al instante, tanto en la pantalla como en la base de datos, sin recargar la página.
5. **Fuera de las búsquedas:** el hotel rechazado desaparece del Inicio, de los resultados y de la ficha pública (solo se publican los aprobados).
6. **Confirmación visual:** el admin ve un aviso con el nombre del hotel rechazado y el hotel queda en el historial con el estado "Rechazado".
7. **Notificación automática al hotel:** el sistema deja solo un aviso en la sección "Avisos recientes" del panel del hotel, con el motivo escrito (mismo mecanismo de los avisos de la HU-016), y manda un correo automático al dueño con el nombre del hotel y el motivo, si dejó correo al inscribirse (misma vía que el correo de aprobación de la HU-021). Si no dejó correo, queda solo el aviso.
8. **Motivo registrado:** el motivo queda guardado junto al hotel, se muestra en el historial de la consola y también en la consulta pública de solicitud de la página de inscripción (donde el dueño puede ver el rechazo sin tener cuenta).

## Criterios de aceptación (BDD)

### Escenario 1: La bandeja ofrece rechazar cada solicitud (HOTELICA-268)
**Dado** que el administrador tiene solicitudes con `estado_hotel = 'Pendiente'`
**Cuando** revisa la bandeja (tabla en escritorio, tarjetas en celular o el modal de "Ver")
**Entonces** cada solicitud tiene un botón "Rechazar" y ese botón no aparece en los hoteles que ya no están pendientes

### Escenario 2: El rechazo pide un motivo y muestra los requisitos incumplidos (HOTELICA-269)
**Dado** que el administrador pulsa "Rechazar" en una solicitud
**Cuando** se abre el formulario de rechazo
**Entonces** ve los requisitos que el hotel tiene incumplidos y un campo de motivo obligatorio; si confirma con el motivo vacío, el sistema muestra un error y el hotel sigue pendiente

### Escenario 3: El estado queda guardado de inmediato (HOTELICA-270)
**Dado** que el administrador confirma el rechazo con un motivo
**Cuando** se ejecuta el rechazo
**Entonces** el hotel pasa a `estado_hotel = 'Rechazado'` en la pantalla y en la base de datos, sale de la bandeja de pendientes, entra al historial de revisados y no aparece en las búsquedas del turista

### Escenario 4: Confirmación visual de la acción (HOTELICA-271)
**Dado** que el rechazo se completó
**Cuando** vuelve la vista del administrador
**Entonces** ve un aviso con el nombre del hotel rechazado y el hotel aparece en el historial con el estado "Rechazado"

### Escenario 5: El hotel recibe la notificación con el motivo (HOTELICA-272)
**Dado** que un hotel fue rechazado con un motivo y su dueño dejó correo al inscribirse
**Cuando** se registra la decisión
**Entonces** el sistema manda automáticamente un correo a ese dueño con el nombre del hotel y el motivo, y aparece además en "Avisos recientes" del panel del hotel un aviso con el mismo motivo

### Escenario 6: El motivo queda registrado (HOTELICA-273)
**Dado** que un hotel fue rechazado con un motivo
**Cuando** el administrador mira el historial de la consola
**Entonces** ve el motivo escrito junto al hotel rechazado

## MoSCoW

- **Must Have:** botón "Rechazar" solo en pendientes; formulario con motivo obligatorio; lista de requisitos incumplidos; cambio de estado inmediato en la app y en la BD; confirmación visual con aviso; notificación automática al hotel (correo al dueño con el motivo si dejó correo, más el aviso del panel); motivo guardado y visible en el historial.
- **Should Have:** rechazar también desde el modal de revisión ("Ver"); el motivo visible en el historial sin abrir nada más; el motivo visible en la consulta pública de solicitud (InscribeHotel), que es el único lugar donde el dueño de un hotel rechazado puede enterarse.
- **Could Have:** filtro por estado en el historial; rechazar varias solicitudes de una vez; reenvío del correo de rechazo si falló el primero.
- **Won't Have:** rechazar hoteles que ya fueron decididos; rechazar sin motivo; crear cuentas de hotelero al rechazar; editar los datos del hotel desde la bandeja (eso es HU-022).

## Notas de implementación

- **Botón de rechazo (HOTELICA-268):** `accionesHotel()` en `src/pages/AdminPanel.tsx` ya armaba "Ver", "Aprobar" y "Rechazar" para cada solicitud pendiente (lo comparten la tabla del escritorio, las tarjetas del celular y el modal de revisión); el botón solo existe mientras `aprobado === "pendiente"`.
- **Formulario con motivo (HOTELICA-269):** `rechazar()` ya no decide al vuelo: abre un modal con el nombre del hotel, la lista de `requisitosIncompletos()` cuando hay faltantes, un textarea de motivo obligatorio y los botones "Cancelar" / "Confirmar rechazo". `confirmarRechazo()` valida el motivo vacío, muestra el error en rojo y no toca el estado.
- **Estado inmediato (HOTELICA-270):** `decidirHotel()` en `src/store.tsx` ahora acepta el motivo opcional, lo guarda en el hotel y sube la fila a la tabla `hoteles` con `subirHotelConAviso()` (en la app la columna se llama `aprobado`; `estado_hotel` es el nombre del modelo de datos). Como la fila se arma con la foto del hotel tomada antes del cambio, el motivo se agrega aparte en la misma subida — si no, a la base llegaba `null` (v0.65.1). El hotel sale de la bandeja y de las búsquedas porque los filtros del turista exigen `aprobado === "aprobado"`.
- **Confirmación visual (HOTELICA-271):** toast `"X" rechazado: no será visible para turistas.` y pastilla "Rechazado" de `BadgeHotel` en el historial.
- **Notificación al hotel (HOTELICA-272):** dos vías. (1) `avisarHotel()` deja el aviso "Hotel rechazado por Hotelica: ..." en "Avisos recientes" del panel del hotel (mismo mecanismo de los avisos de la HU-016). (2) Si el dueño dejó correo al inscribirse, `confirmarRechazo()` en `src/pages/AdminPanel.tsx` llama a `enviarRechazoHotelero()` (`src/store.tsx`), que invoca la Edge Function `supabase/functions/enviar-rechazo-hotelero/index.ts` (Brevo, misma vía que el correo de aprobación de HU-021) con dueño, correo, hotel y motivo; el correo trae el motivo resaltado y pasos para corregir y volver a inscribir. Si no dejó correo o el envío falla, el rechazo igual queda registrado y el aviso del panel también (se avisa con un toast de error). Limitación: un hotel rechazado nunca tuvo cuenta, así que el dueño no puede entrar al panel; además de este correo, el lugar donde ve la decisión y el motivo es la consulta pública de `InscribeHotel`. Para que el correo salga en producción hay que desplegar la function con `npx supabase functions deploy enviar-rechazo-hotelero` (usa los secrets `BREVO_API_KEY` y `BREVO_SENDER_EMAIL` que ya están en el proyecto); quedó desplegada el 2026-10-26.
- **Motivo registrado (HOTELICA-273):** campo opcional `motivoRechazo` en el tipo `Hotel` (`src/data.ts`), visible en el historial de la consola y en la consulta de solicitud. La migración `supabase/migrations/20261026120000_hu032_motivo_rechazo.sql` agrega la columna `motivo_rechazo` a la tabla `hoteles` (se corre desde el SQL Editor del Dashboard); `aFilaHotel()` y `deFilaHotel()` en `src/sync.ts` la traducen y `completarHotelDesdeLocal()` la respeta al mezclar, así el motivo no se pierde al recargar venga o no de la base.
- **Pruebas:** `tests/CP-032-rechazar-hotel.spec.ts` — 2 pruebas que cubren los 6 escenarios: rechazo con motivo desde la bandeja (validación del campo vacío, salida de la bandeja, historial con pastilla y motivo, aviso al hotel, correo al dueño capturado con el hotel y el motivo adentro, consulta pública y el motivo que sobrevive a la recarga con la base simulada) y un hotel incompleto sin correo del dueño, que muestra sus requisitos al rechazarlo y no intenta enviar ningún correo.
