# HU-028 — Registrar check-in

**Módulo:** Gestión Hotel
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 5
**Interfaz:** botón "Check-in" de la tabla de reservas y sello de hora de entrada en `src/pages/HotelPanel.tsx`

## Redacción estándar

> Como **recepcionista**, quiero **registrar el check-in de un huésped** para **controlar la ocupación del hotel**.

## Contexto

El huésped llega al mostrador con su reserva confirmada, pero en el sistema todavía no está: la reserva sigue en *Confirmada* y las unidades de esa habitación no se cuentan como ocupadas, así que el tablero del panel miente sobre lo que está pasando hoy. Registrar el check-in es el momento en que **la reserva se vuelve realidad física**: alguien entró, con hora y todo.

La historia toma la reserva en el punto exacto en que la dejó la HU-027 (confirmada) y la mueve al siguiente paso del flujo oficial `Pendiente → Confirmada → Check-in → Completada`. A partir de acá:

- la ocupación de la HU-026 empieza a contar esa unidad,
- se habilita el botón de check-out (HU-029),
- el turista ve su estadía "en curso" en Mis Reservas.

Además del cambio de estado, esta historia **deja constancia del momento exacto de la entrada** (fecha y hora), que antes no se guardaba en ninguna parte. Esa marca es la que después permite comparar con el check-out y saber cuánto se demoró la estadía.

**Alcance del celular:** igual que las HU-026 y HU-027, el panel del hotel no abre en pantallas estrechas desde la HU-039; el registro se hace desde el escritorio.

Reglas de negocio de esta historia:

1. **Solo con reserva confirmada:** el botón de check-in aparece únicamente en reservas con estado *Confirmada*. Las pendientes se resuelven con HU-027, las ya en check-in no se registran dos veces y las canceladas o completadas no se tocan.
2. **Solo desde el día de llegada:** como en la HU-026, la llegada futura no permite check-in; el botón ofrece la fecha y se habilita cuando `llegada <= hoy`.
3. **Solo las reservas del propio hotel:** la acción valida que la reserva pertenezca al hotel del recepcionista logueado.
4. **Se guarda fecha y hora de la entrada:** al registrar, la reserva gana la marca `checkinEn` con el momento exacto (fecha y hora) en que se hizo el check-in.
5. **Estado a Check-in:** `Confirmada → Check-in`, siguiendo el ENUM oficial de la guía de negocio. Con eso la unidad pasa a contar en la ocupación de la HU-026 y baja el contador de "Check-ins por hacer".
6. **Confirmación visual doble:** el recepcionista ve el aviso de la acción con el folio y la hora, y en la fila de la reserva aparece sello de "Entrada" con esa fecha y hora.
7. **El turista también lo ve:** en Mis Reservas, el detalle de la reserva muestra la fecha y hora del check-in registrada por el hotel.

## Criterios de aceptación (BDD)

### Escenario 1: Botón "Check-in" en la reserva confirmada (HOTELICA-242)
**Dado** que el panel tiene una reserva en estado Confirmada cuya llegada es hoy o ya pasó
**Cuando** el recepcionista mira las acciones de esa fila
**Entonces** ve el botón "Check-in", y en una llegada futura en su lugar aparece la fecha hasta que se cumpla

### Escenario 2: La entrada queda registrada con fecha y hora (HOTELICA-243)
**Dado** que el recepcionista registra el check-in de una reserva
**Cuando** se guarda el movimiento
**Entonces** la reserva guarda la marca de fecha y hora exacta en que se hizo la entrada, y esa hora se puede leer en la fila de la reserva y en el detalle del turista

### Escenario 3: Solo se registra una reserva activa y de este hotel (HOTELICA-244)
**Dado** que una reserva está cancelada, completada, ya en check-in, es de otro hotel o sigue pendiente
**Cuando** el recepcionista intenta registrarle la entrada
**Entonces** el sistema valida el estado antes de actuar, no cambia nada y muestra un mensaje explicando por qué no se pudo

### Escenario 4: El estado pasa a Check-in y el tablero lo refleja (HOTELICA-245)
**Dado** que el recepcionista registra una entrada válida
**Cuando** vuelve a mirar el panel
**Entonces** la reserva aparece como Check-in, sube la ocupación según la fórmula oficial, baja "Check-ins por hacer" y ya se ofrece el check-out (HU-029)

### Escenario 5: Aviso visual del registro exitoso (HOTELICA-246)
**Dado** que el check-in se registró correctamente
**Cuando** termina la acción
**Entonces** el recepcionista ve un aviso en pantalla con el nombre del huésped, el folio y la hora de entrada

### Escenario 6: Constancia visible de la entrada (HOTELICA-247)
**Dado** que una reserva ya tiene el check-in registrado
**Cuando** se mira la fila en el panel y el detalle en Mis Reservas
**Entonces** en ambos lugares aparece la fecha y hora de la entrada, no solo el estado

## MoSCoW

- **Must Have:** botón "Check-in" solo en confirmadas con llegada hoy o pasada; validación de reserva activa y del hotel propio; cambio de estado a Check-in con marca `checkinEn`; aviso de la acción al recepcionista.
- **Should Have:** sello de hora de entrada visible en la fila del panel; fecha y hora visibles en el detalle de Mis Reservas para el turista; el tablero de HU-026 actualizándose sin recargar.
- **Could Have:** registrar quién hizo el check-in (usuario de recepción); check-in anticipado con permiso del hotel; imprimir la tarjeta de entrada.
- **Won't Have:** check-in de reservas pendientes o canceladas (se resuelve en HU-027); check-out (HU-029); cambio manual de la fecha y hora de la entrada desde la interfaz.

## Notas de implementación

- **Botón:** la rama `r.estado === "confirmada"` de `accionesDe()` en `src/pages/HotelPanel.tsx` ya ofrecía el check-in con la condición de llegada; se conserva y se refuerza con la validación de la historia (subtarea HOTELICA-242).
- **Marca de entrada:** `Reserva` gana el campo opcional `checkinEn?: string` en `src/data.ts`, con `ahoraISO()` para escribirlo y `fmtFechaHora()` para mostrarlo en español (subtarea HOTELICA-243).
- **Validación:** una función propia de esta acción revisa que la reserva sea del `HOTEL_ID` del panel, que esté *Confirmada* y que la llegada sea hoy o pasada; si no, toast de error sin tocar nada (subtarea HOTELICA-244).
- **Cambio de estado:** `registrarCheckin(folio)` en `src/store.tsx` escribe `estado: "checkin"` y `checkinEn` en el mismo movimiento, y se persiste en el acto en localStorage (subtarea HOTELICA-245).
- **Confirmación:** `avisar()` en el panel con huésped, folio y hora (tono "ok"), más el sello de entrada en la fila y en el detalle del turista (subtareas HOTELICA-246 y 247; en Jira aparecen con el mismo texto).
