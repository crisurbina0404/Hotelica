# HU-029 — Registrar check-out

**Módulo:** Gestión Hotel
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 5
**Interfaz:** botón "Check-out", sellos de entrada y salida, y factura de `src/pages/HotelPanel.tsx`

## Redacción estándar

> Como **recepcionista**, quiero **registrar el check-out de un huésped** para **liberar la habitación y cerrar la estadía de manera ordenada**.

## Contexto

El huésped se va del hotel, pero en el sistema sigue adentro: la reserva se queda en *Check-in*, la ocupación cuenta una unidad que ya no está y el turista no puede calificar su estadía. Registrar el check-out es **el último movimiento que cierra el ciclo** de la reserva: `Pendiente → Confirmada → Check-in → Completada`.

La historia hace tres cosas de una vez:

1. **Saca al huésped del sistema** con fecha y hora de salida (igual que la entrada de la HU-028).
2. **Libera la habitación**: al pasar a *Completada*, la unidad deja de contar en la ocupación y vuelve a estar disponible para reservas nuevas (`disponiblesDe` ignora las reservas completadas).
3. **Cierra la plata con una factura**: al hacer check-out se descarga automáticamente el documento HTML con el desglose de la estadía (subtotal, IVA 15 % y total), con la marca de Hotelica. Es la contraparte del comprobante que se descargó al reservar (HU-018).

Con la estadía cerrada se cumplen dos condiciones que venían de otras historias: el turista ya puede calificar (HU-019, que exige estado *Completada*) y la reserva entra en el resumen de ingresos del panel (HU-026, que suma las no canceladas).

**Alcance del celular:** igual que HU-026, HU-027 y HU-028, el panel no abre en pantallas estrechas desde la HU-039; el check-out se registra desde el escritorio.

Reglas de negocio de esta historia:

1. **Solo con huésped en estadía:** el botón de check-out aparece únicamente en reservas con estado *Check-in*. Una pendiente, confirmada, completada o cancelada no se cierra.
2. **Solo las reservas del propio hotel:** la acción valida que la reserva pertenezca al hotel del recepcionista logueado.
3. **Salida anticipada permitida:** no se exige que la fecha de salida ya haya llegado; el huésped puede retirarse antes de hora y la estadía se cierra con la hora real.
4. **Se guarda fecha y hora de la salida:** la reserva gana la marca `checkoutEn` con el momento exacto del check-out, visible en la fila del panel junto a la de entrada.
5. **Estado a Completada:** `Check-in → Completada`, según el ENUM oficial; con eso se libera la unidad, baja "Check-outs de hoy" y se habilita la calificación del turista.
6. **Factura automática:** al registrar la salida se descarga sola la factura en HTML con hotel, huésped, fechas y horas de la estadía, método de pago, subtotal, IVA (15 %) y total. La fila de la reserva completada conserva un botón para volver a descargarla.
7. **Confirmación visual:** el recepcionista ve el aviso de la acción con huésped, folio y hora de salida.

## Criterios de aceptación (BDD)

### Escenario 1: Botón "Check-out" en la reserva en estadía (HOTELICA-248)
**Dado** que el panel tiene una reserva en estado Check-in
**Cuando** el recepcionista mira las acciones de esa fila
**Entonces** ve el botón "Check-out", y en reservas pendientes, confirmadas, completadas o canceladas no aparece

### Escenario 2: La salida queda registrada con fecha y hora (HOTELICA-249)
**Dado** que el recepcionista registra la salida de un huésped
**Cuando** se guarda el movimiento
**Entonces** la reserva guarda la marca de fecha y hora del check-out y esa salida se lee en la fila del panel junto a la hora de entrada

### Escenario 3: Solo se cierra una reserva en estadía de este hotel (HOTELICA-250)
**Dado** que una reserva está pendiente, confirmada, completada, cancelada o pertenece a otro hotel
**Cuando** el recepcionista intenta registrarle el check-out
**Entonces** el sistema valida el estado antes de actuar, no cambia nada y muestra un mensaje explicando por qué no se pudo

### Escenario 4: La habitación queda libre al cerrar la estadía (HOTELICA-251)
**Dado** que el hotel tiene 10 unidades y una reserva en check-out sobre una de ellas
**Cuando** se registra la salida
**Entonces** la ocupación pasa de ocupada a libre, baja "Check-outs de hoy" y esa unidad vuelve a ofrecerse en las búsquedas de los turistas sin recargar la página

### Escenario 5: La reserva pasa a Completada y se habilita la calificación (HOTELICA-252)
**Dado** que el check-out se registró correctamente
**Cuando** el recepcionista mira la fila y el turista abre Mis Reservas
**Entonces** la reserva aparece como Completada y el turista ya puede calificar su estadía (HU-019)

### Escenario 6: La factura se descarga sola con el desglose (HOTELICA-253)
**Dado** que el recepcionista cierra una estadía con subtotal C$ 5,000.00 e IVA C$ 750.00
**Cuando** termina el check-out
**Entonces** se descarga automáticamente la factura en HTML con el total C$ 5,750.00, las fechas y horas de entrada y salida, y el hotel puede volver a descargarla desde la fila

## MoSCoW

- **Must Have:** botón "Check-out" solo en reservas en check-in del propio hotel; marca `checkoutEn` con fecha y hora; cambio de estado a Completada; descarga automática de la factura con subtotal, IVA y total; aviso de la acción.
- **Should Have:** sello de salida junto al de entrada en la fila del panel; botón para volver a descargar la factura; liberación visible de la ocupación y de "Check-outs de hoy" sin recargar.
- **Could Have:** factura visible también para el turista en Mis Reservas; factura en PDF y no en HTML; enviar la factura por correo al huésped.
- **Won't Have:** facturar por adelantado antes del check-out; editar o anular una factura emitida; cobrar o registrar pagos nuevos desde el check-out (los pagos son HU-018); check-out de reservas que no están en estadía.

## Notas de implementación

- **Botón:** la rama `r.estado === "checkin"` de `accionesDe()` en `src/pages/HotelPanel.tsx` ya ofrecía el check-out; ahora pasa por la validación de la historia (subtarea HOTELICA-248).
- **Marca de salida:** `Reserva` gana `checkoutEn?: string` en `src/data.ts`, escrita con `ahoraISO()` y mostrada con `fmtFechaHora()`, igual que `checkinEn` de la HU-028 (subtarea HOTELICA-249).
- **Validación:** `sePuedeCheckOut()` revisa que la reserva sea del `HOTEL_ID` del panel y que esté en estado *Check-in*; si no, toast de error sin tocar nada (subtarea HOTELICA-250).
- **Liberación:** no necesita código nuevo: `disponiblesDe()` en `src/store.tsx` ya no cuenta las reservas *Completadas* y la ocupación de la HU-026 cuenta solo las *Check-in*, así que al cerrar la estadía la unidad se libera sola (subtarea HOTELICA-251).
- **Estado:** `registrarCheckout(folio)` en `src/store.tsx` escribe `estado: "completada"` y `checkoutEn` en el mismo movimiento (subtarea HOTELICA-252).
- **Factura:** `descargarFactura()` en `src/pages/BookingModal.tsx` comparte el HTML y los estilos del comprobante de la HU-018, cambiando el título, agregando las horas de entrada y salida y la nota de emisión al check-out; se descarga sola al cerrar la estadía y el botón "Factura" de la fila completa la vuelve a generar (subtarea HOTELICA-253).
