# HU-011 — Consultar disponibilidad por fechas

**Módulo:** Búsqueda  
**Prioridad:** Alta (Must Have)  
**Estado:** ✅ Terminada  
**Sprint:** 1  
**Interfaz:** HotelDetail, BookingModal, Results, CalendarioDisponibilidad

## Redacción estándar

> Como **turista de Hotelica**, quiero **verificar la disponibilidad de una habitación para fechas específicas** para **asegurar que puedo reservar en el período deseado**.

## Contexto

El turista necesita saber cuántas habitaciones de un tipo están libres para las fechas que quiere. La disponibilidad se calcula restando las unidades ocupadas (reservas no canceladas ni completadas que se traslapan con el rango seleccionado) del total de unidades del hotel.

## Criterios de aceptación (BDD)

### Escenario 1: Habitación disponible para las fechas seleccionadas
**Dado** que el turista está en el detalle de un hotel  
**Cuando** selecciona fechas de llegada y salida  
**Entonces** se muestra la cantidad de unidades disponibles de cada habitación (ej: "3 disponibles")

### Escenario 2: Habitación sin disponibilidad
**Dado** que todas las unidades de un tipo están ocupadas para las fechas seleccionadas  
**Cuando** el turista visualiza las habitaciones  
**Entonces** se muestra el mensaje "Agotado para tus fechas" en rojo

### Escenario 3: Fechas inválidas
**Dado** que el turista ingresa una fecha de salida igual o anterior a la de llegada  
**Cuando** intenta buscar disponibilidad  
**Entonces** no se muestran resultados y se indica que las fechas son inválidas

### Escenario 4: Disponibilidad en la página de resultados
**Dado** que el turista realiza una búsqueda de hoteles  
**Cuando** se muestran los resultados  
**Entonces** solo aparecen hoteles que tengan al menos una habitación disponible para las fechas y huéspedes ingresados, y se muestra la cantidad de unidades disponibles en cada tarjeta

### Escenario 5: Disponibilidad en el modal de reserva
**Dado** que el turista selecciona una habitación para reservar  
**Cuando** se abre el modal de reserva  
**Entonces** se muestra la cantidad de unidades disponibles y se bloquea el botón si hay 0 disponibles

## MoSCoW

- **Must Have:** Cálculo de unidades disponibles por habitación, indicador visual de disponibilidad, filtrado por fechas.
- **Should Have:** Mensaje "Agotado para tus fechas" cuando no hay disponibilidad.
- **Could Have:** ✅ Calendario visual de disponibilidad, historial de ocupación.
- **Won't Have:** Reserva en tiempo real, sincronización con sistemas externos.

## Notas de implementación

- Función `disponiblesDe()` en `src/store.tsx:199-211` calcula unidades disponibles.
- Función `seTraslapan()` en `src/data.ts:378-380` verifica traslape de fechas.
- Filtrado en `src/pages/Results.tsx:69-71`: `disponiblesDe(hab.id, llegada, salida) > 0`.
- Visualización en `src/pages/HotelDetail.tsx:185-202`: muestra cantidad disponible o "Agotado".
- Validación en `src/pages/BookingModal.tsx:56-57`: bloquea reserva si disponibles <= 0.

### Could Have implementados (v0.23.0)

- **Calendario visual** (`src/pages/CalendarioDisponibilidad.tsx`): componente con vista mensual, colores por estado (libre/parcial/bloqueado/pasado/seleccionado), navegación entre meses y selección por clic.
- **Sugerencias de fechas alternativas** (`src/data.ts:sugerirFechasAlternativas()`): busca hasta 3 rangos cercanos (±30 días) con disponibilidad.
- **Integración en HotelDetail.tsx**: sección expandible con calendario + panel de sugerencias azul cuando no hay disponibilidad.
- **Integración en BookingModal.tsx**: sugerencias de fechas dentro del modal de reserva.
