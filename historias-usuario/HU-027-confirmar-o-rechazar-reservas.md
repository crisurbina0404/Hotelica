# HU-027 — Confirmar o rechazar reservas

**Módulo:** Gestión Hotel
**Prioridad:** Alta (Must Have)
**Estado:** ✅ Terminada
**Sprint:** 5
**Interfaz:** botones "Confirmar" / "Rechazar" de la tabla de reservas y modal de motivo de `src/pages/HotelPanel.tsx`

## Redacción estándar

> Como **administrador del hotel**, quiero **confirmar o rechazar reservas** para **mantener control sobre la ocupación**.

## Contexto

Con la HU-026 el hotelero ya ve todas las reservas que llegaron a su hotel, pero no puede hacer nada con ellas: las solicitudes se quedan en *Pendiente* para siempre y la habitación sigue bloqueada aunque el hotel no quiera esas fechas. Esta historia es la **primera acción** sobre una reserva: el hotelero mira la solicitud y decide.

La decisión tiene dos caminos y ninguno es reversible desde el panel:

- **Confirmar:** el hotel acepta al huésped y la reserva pasa a *Confirmada*, lista para el check-in (HU-028).
- **Rechazar:** el hotel no puede alojar a esa persona. La reserva queda *Cancelada* —el estado oficial del ENUM de la guía de negocio no tiene un estado "Rechazada"— y guarda el **motivo** que el hotelero escribió, para que el turista sepa por qué.

El motivo es la parte nueva: un rechazo sin explicación se siente como un error del sistema. Además, la HU ya cubre la consulta (HU-026) y después vendrán el check-in (HU-028) y el check-out (HU-029), que solo se ofrecen sobre reservas ya confirmadas.

**Alcance del celular:** igual que la HU-026, el panel del hotel no abre en pantallas estrechas desde la HU-039, así que estas acciones se usan desde el escritorio.

Reglas de negocio de esta historia:

1. **Solo reservas pendientes:** confirmar y rechazar se ofrecen únicamente cuando la reserva está en estado *Pendiente*. Una reserva confirmada ya no se puede rechazar desde aquí (se cancela por otra vía) y una completada no se toca.
2. **Solo las reservas del propio hotel:** las acciones validan que la reserva pertenezca al hotel del hotelero logueado, igual que el listado de la HU-026.
3. **Confirmar cambia el estado a Confirmada:** `Pendiente → Confirmada`, siguiendo el ENUM oficial `Pendiente → Confirmada → Check-in → Completada / Cancelada`.
4. **Rechazar cancela y guarda el motivo:** `Pendiente → Cancelada` más el campo nuevo `motivoRechazo` de la reserva.
5. **El motivo es obligatorio:** no se puede rechazar sin escribir un motivo; se pide en un modal antes de aplicar el cambio.
6. **Cambio inmediato:** al confirmar o rechazar, la reserva, el tablero, la ocupación y los ingresos del panel se actualizan en el acto (el estado se persiste en el guardado del navegador).
7. **Aviso en los dos lados:** el hotelero ve el mensaje de la acción en su panel y el turista se entera al abrir Mis Reservas, donde además ve el motivo del rechazo.
8. **Los ingresos no cambian:** una reserva rechazada entra en *Cancelada*, y la fórmula de ingresos ya excluye las canceladas (HU-026).

## Criterios de aceptación (BDD)

### Escenario 1: Botones "Confirmar" y "Rechazar" en la reserva pendiente (HOTELICA-236)
**Dado** que el hotelero tiene una reserva en estado Pendiente en su panel
**Cuando** mira las acciones de esa fila
**Entonces** ve dos botones: "Confirmar" y "Rechazar", y en ninguna otra reserva pendiente le faltan

### Escenario 2: No se puede actuar sobre una reserva que ya no está pendiente (HOTELICA-237)
**Dado** que una reserva ya fue confirmada (o cancelada) por otro movimiento
**Cuando** el hotelero intenta confirmarla o rechazarla
**Entonces** el sistema valida el estado actual antes de aplicar nada, no cambia la reserva y muestra un mensaje explicando que esa acción solo se hace con reservas pendientes

### Escenario 3: El cambio queda guardado de inmediato (HOTELICA-238)
**Dado** que el hotelero confirma o rechaza una reserva
**Cuando** vuelve a mirar su tablero y su listado
**Entonces** la reserva aparece con el nuevo estado en ese mismo momento: baja de "Reservas pendientes", sube el contador que corresponda y la ocupación y los ingresos se recalculan sin recargar la página

### Escenario 4: Mensaje de confirmación de la acción (HOTELICA-239)
**Dado** que el hotelero completa una confirmación o un rechazo
**Cuando** la acción se ejecuta
**Entonces** ve un aviso en pantalla con el folio de la reserva y lo que se hizo ("Reserva H-0012 confirmada" o "Reserva H-0012 rechazada")

### Escenario 5: El turista se entera del cambio y del motivo (HOTELICA-240)
**Dado** que el hotel confirmó o rechazó la reserva de un turista
**Cuando** el turista abre su pantalla Mis Reservas
**Entonces** ve un aviso de que su reserva cambió de estado y, si fue rechazada, en el detalle le aparece el motivo que escribió el hotel

### Escenario 6: El rechazo guarda el motivo escrito (HOTELICA-241)
**Dado** que el hotelero pulsa "Rechazar" en una reserva pendiente
**Cuando** se abre el modal de motivo y lo deja vacío
**Entonces** no se puede enviar el rechazo; al escribir un motivo y confirmar, la reserva queda Cancelada con ese motivo guardado

## MoSCoW

- **Must Have:** botones Confirmar/Rechazar solo en pendientes; validación del estado actual antes de actuar; cambio inmediato en el estado global persistido; mensaje de la acción para el hotelero; motivo obligatorio guardado en la reserva.
- **Should Have:** aviso del cambio para el turista en Mis Reservas con el motivo visible en el detalle; los contadores y la ocupación del tablero reflejando la acción en el acto.
- **Could Have:** motivos rápidos para elegir con un clic (además de escribir el propio); envío de correo al turista con la decisión.
- **Won't Have:** nuevo estado "Rechazada" (el ENUM oficial no lo tiene); rechazar reservas ya confirmadas; editar o reprogramar una reserva; notificación push o SMS.

## Notas de implementación

- **Botones:** `accionesDe()` en `src/pages/HotelPanel.tsx` es quien decide qué botones muestra cada reserva; para las pendientes cambia el "Cancelar" por "Rechazar" y mantiene "Confirmar" (subtarea HOTELICA-236).
- **Validación:** el handler revisa que la reserva siga `pendiente` y que sea del `HOTEL_ID` del panel antes de llamar al store; si no, muestra un toast de error y no toca nada (subtarea HOTELICA-237).
- **Persistencia:** `cambiarEstadoReserva()` en `src/store.tsx` ya escribe en `setDatos` y eso se guarda en localStorage, así que el cambio es inmediato y sobrevive al refresco (subtarea HOTELICA-238).
- **Mensaje:** el aviso sale con `avisar()` en el panel, con el folio y la acción hecha, en tono "ok" al confirmar y "error" al rechazar (subtarea HOTELICA-239).
- **Aviso al turista:** Mis Reservas ya detecta cambios de estado con `hotelica-estados-vistos` y avisa con un toast (HU-017); con esta historia se suma el motivo visible en el detalle de la reserva (subtarea HOTELICA-240).
- **Motivo:** `Reserva` gana el campo opcional `motivoRechazo?: string` en `src/data.ts` y `cambiarEstadoReserva` acepta un tercer parámetro opcional para guardarlo (subtarea HOTELICA-241).
