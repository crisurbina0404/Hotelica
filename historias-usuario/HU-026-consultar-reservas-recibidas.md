# HU-026 — Consultar reservas recibidas

**Módulo:** Gestión Hotel
**Prioridad:** Alta (Must Have)
**Estado:** ✅ Terminada
**Sprint:** 5
**Interfaz:** secciones "Gestión de reservas", tarjetas de resumen y barra de ocupación de `src/pages/HotelPanel.tsx`

## Redacción estándar

> Como **administrador de hotel**, quiero **ver todas las reservas que llegaron a mi hotel, con su folio, huésped, fechas e importe**, para **saber qué se está por venir y cuánto ha ingresado el hotel sin llamar a nadie**.

## Contexto

El hotelero llegaba a su panel sin saber si alguien había reservado: la única pista era la
disponibilidad que veía en su propio detalle, y para mirar sus reservas tenía que buscar el
hotel como lo haría un turista. Con esta historia el panel se convierte en la **bandeja de
entrada de las reservas**: todo lo que el turista reserva en este hotel queda listado ahí,
ordenado por fecha de llegada, con el estado de cada una.

La historia cubre **solo la consulta**: leer el listado, los indicadores del tablero y la
ocupación. Las acciones sobre cada reserva (confirmar, cancelar, check-in y check-out) y el
cambio de estado son las historias HU-027, HU-028 y HU-029.

**Alcance respecto al celular:** desde la HU-039 el panel del hotel no se abre en pantallas
estrechas (el celular quedó solo para el módulo turista), así que este listado se consulta
desde el escritorio. El panel conserva igual la vista de tarjetas por debajo del ancho de la
tabla, lista por si el panel vuelve al celular en el futuro.

Reglas de negocio de esta historia:

1. **Solo las reservas del propio hotel:** el listado filtra por el hotel del hotelero logueado; una reserva de otro hotel nunca aparece aquí.
2. **Orden por llegada:** las reservas se listan de la más cercana a la más lejana (orden alfabético del campo ISO `llegada`).
3. **Tablero con cuatro tarjetas:** *Reservas pendientes*, *Confirmadas*, *Check-ins por hacer* (confirmadas cuya llegada ya es hoy o pasó) y *Check-outs de hoy* (en check-in cuya salida ya es hoy o pasó).
4. **Ocupación actual:** `% ocupación = (unidades ocupadas hoy ÷ total de unidades del hotel) × 100`, redondeado al entero. Solo cuentan las reservas en estado *check-in*.
5. **Ingresos:** suma de los totales de las reservas **no canceladas** de este hotel (fórmula de la guía de negocio).
6. **Una fila por reserva, con su estado:** cada registro muestra folio, turista, tipo de habitación, llegada, salida, huéspedes, total y la pastilla de estado (Pendiente / Confirmada / Check-in / Completada / Cancelada).
7. **El formato sigue al dispositivo:** en escritorio es una tabla completa; en celular una tarjeta por reserva con los mismos datos, sin desbordes horizontales.

## Criterios de aceptación (BDD)

### Escenario 1: Ver solo las reservas de mi hotel
**Dado** que el hotelero entra a su panel con su cuenta
**Cuando** revisa la sección de reservas
**Entonces** ve únicamente las reservas de **su** hotel, ordenadas por fecha de llegada, con folio, huésped, habitación, fechas, total y estado

### Escenario 2: El tablero refleja el estado real de las reservas
**Dado** que el hotel tiene reservas en distintos estados
**Cuando** mira las tarjetas del panel
**Entonces** los contadores de pendientes, confirmadas, check-ins por hacer y check-outs de hoy coinciden con las reservas que tiene

### Escenario 3: La ocupación se calcula con la fórmula del negocio
**Dado** que el hotel tiene 10 unidades en total y 2 reservas en estado check-in
**Cuando** se muestra la barra de ocupación
**Entonces** aparece 20 %, con la cuenta visible: "2 de 10 unidades ocupadas hoy"

### Escenario 4: Los ingresos ignoran las canceladas
**Dado** que el hotel tiene reservas por C$ 5,000, C$ 3,000 y C$ 1,200 y la de C$ 3,000 está cancelada
**Cuando** se muestra el indicador de ingresos
**Entonces** marca C$ 6,200: se suman solo las reservas que no están canceladas

### Escenario 5: Una reserva de otro hotel no aparece
**Dado** que existe una reserva hecha en un hotel distinto
**Cuando** el hotelero abre su panel
**Entonces** esa reserva no se lista ni entra en ninguno de sus contadores ni en su ocupación

### Escenario 6: Este listado se consulta en escritorio (restricción HU-039)
**Dado** que la HU-039 dejó el celular solo para el módulo turista
**Cuando** un hotelero intenta abrir su panel desde una pantalla estrecha
**Entonces** el panel no se abre y ve el inicio: las reservas recibidas se consultan desde el escritorio, donde la tabla se lee completa

## MoSCoW

- **Must Have:** listado filtrado por el hotel propio y ordenado por llegada; tabla en escritorio; tablero de cuatro contadores; barra de ocupación con la fórmula oficial; ingresos sin canceladas; pastilla de estado de cada reserva.
- **Should Have:** ingresos visibles en la portada del panel; aviso de check-ins y check-outs del día; formato moneda con `fmtDinero`.
- **Could Have:** filtro por estado o por rango de fechas; exportar el listado; buscar por folio o por nombre del huésped.
- **Won't Have:** confirmar, cancelar o pasar check-in/check-out desde esta historia (HU-027, HU-028 y HU-029); ver reservas de otros hoteles; edición de una reserva ya creada.

## Notas de implementación

- **Filtro y orden:** `delHotel` en `src/pages/HotelPanel.tsx` toma `reservas` y deja solo las del `HOTEL_ID` del panel, ordenadas por `llegada` (subtarea HOTELICA-259).
- **Tablero:** contadores `pendientes`, `confirmadas`, `checkinsHoy` (confirmadas con `llegada <= hoy`) y `checkoutsHoy` (check-in con `salida <= hoy`), más `ingresos` (totales de reservas no canceladas) que se muestra en la portada del panel (subtarea HOTELICA-260).
- **Ocupación:** `ocupadasHoy` cuenta las reservas en estado `checkin`, `totalUnidades` suma `h.unidades` de las habitaciones del hotel y `ocupacion` es el redondeo de la división, dibujado en una barra con los colores del rol hotel (subtarea HOTELICA-261).
- **Tabla y tarjetas:** la tabla de escritorio tiene las nueve columnas (folio en monoespaciada, `BadgeEstado` para el estado) y, por debajo de `lg`, la misma reserva se renderiza como tarjeta con `dl` de datos. Esa rama quedó inalcanzable desde la interfaz con la HU-039 (el panel no abre en pantallas estrechas); se mantiene como adaptación por si el panel vuelve al celular (subtarea HOTELICA-262).
- **Estado global:** las reservas ya formaban parte de lo persistido en `src/store.tsx` (`Persistido.reservas`, arrancando con `RESERVAS_SEED`), así que la consulta lee el estado y no la semilla (subtarea HOTELICA-263).
- **Acciones:** los botones de la fila los comparte `accionesDe()`, pero su comportamiento corresponde a HU-027/028/029; esta historia solo los muestra según el estado (subtarea HOTELICA-264).
