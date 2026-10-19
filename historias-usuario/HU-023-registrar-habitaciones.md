# HU-023 — Registrar habitaciones

**Módulo:** Gestión Hotel
**Prioridad:** Alta (Must Have)
**Estado:** ✅ Terminada
**Sprint:** 4
**Interfaz:** sección "Registrar habitación" en `src/pages/HotelPanel.tsx`

## Redacción estándar

> Como **administrador de hotel**, quiero **registrar las habitaciones de mi hotel con su tipo, capacidad, precio por noche y número de unidades** para **que los turistas puedan verlas y reservarlas**.

## Contexto

Un hotel recién aprobado llega a su panel sin habitaciones propias: hasta ahora el
inventario salía solo de los datos de demostración (`HABITACIONES_SEED`), así que un
hotelero nuevo no tenía cómo ofrecer nada. Con esta historia el dueño da de alta sus
tipos de habitación desde su panel y esos tipos pasan a ser parte del sistema: se
suman al inventario del hotel, aparecen en el detalle que ve el turista y se pueden
reservar como cualquier otra.

Cada registro crea un **tipo de habitación** (no una unidad suelta): "Estándar Doble",
"Suite del Mombacho", etc. El campo `unidades` indica cuántas habitaciones iguales
existen, y es el número contra el que se calcula la disponibilidad.

**Restricción:** mientras el hotel está **Pendiente** (esperando la aprobación del
admin), no se pueden registrar habitaciones, porque el hotel todavía no aparece en
las búsquedas.

## Criterios de aceptación (BDD)

### Escenario 1: Ver las habitaciones del propio hotel
**Dado** que el hotelero está en su panel del hotel
**Cuando** mira la sección de habitaciones
**Entonces** ve únicamente los tipos de habitación de **su** hotel, con su capacidad, número de unidades, ocupación de hoy y precio

### Escenario 2: Registrar una habitación válida
**Dado** que el hotelero completa tipo, capacidad, precio, unidades, estado y detalle con valores válidos
**Cuando** pulsa "Registrar habitación"
**Entonces** el tipo se agrega al inventario del hotel y aparece una confirmación de que quedó registrado

### Escenario 3: Campos obligatorios vacíos o inválidos
**Dado** que el hotelero deja el tipo vacío, o la capacidad, el precio o las unidades en cero
**Cuando** pulsa "Registrar habitación"
**Entonces** el sistema no registra nada y marca cada campo que hay que corregir

### Escenario 4: Dos tipos con el mismo nombre en el mismo hotel
**Dado** que el hotel ya tiene un tipo llamado "Estándar Doble"
**Cuando** el hotelero intenta registrar otro con ese mismo nombre
**Entonces** el sistema no lo registra y avisa que ese tipo ya existe en el hotel

### Escenario 5: La habitación nueva se puede reservar
**Dado** que el hotelero registró una habitación con capacidad 4 y 2 unidades
**Cuando** un turista consulta el detalle del hotel y busca para 4 huéspedes
**Entonces** ve ese tipo de habitación con su precio y puede reservarlo, y la disponibilidad baja según las reservas existentes

### Escenario 6: Solo se registra si el hotel está aprobado
**Dado** que el hotel tiene estado **Pendiente**
**Cuando** el hotelero está en su panel
**Entonces** el botón "Registrar habitación" no está disponible (o está deshabilitado) con un aviso de que debe esperar la aprobación

## MoSCoW

- **Must Have:** formulario de alta con tipo, capacidad, precio, unidades y detalle; validación de todos los campos antes de guardar; la habitación queda en el inventario del hotel; el tipo nuevo aparece en el detalle del turista y se puede reservar.
- **Should Have:** cambiar el estado de una habitación (Disponible / En mantenimiento / No disponible); el inventario del panel se lee del estado global y no de la semilla.
- **Could Have:** editar los datos de una habitación ya registrada, eliminar una habitación sin reservas, contador de tipos registrados.
- **Won't Have:** cambiar precios de habitaciones ya creadas (es la HU-024), subir fotografías de cada habitación (es la HU-025), registro de habitaciones por parte del administrador.

## Notas de implementación

- **Tipos de datos:** se agregan `DatosHabitacion` y `ErroresHabitacion` en `src/data.ts`, junto al tipo `Habitacion` que ya existía (subtarea HOTELICA-211).
- **Validación:** nueva función `validarHabitacion()` en `src/data.ts`, con la misma forma que `validarRegistroHotel()` (reglas de negocio: precio por noche > 0, capacidad y unidades enteras y mayores que cero, tipo no repetido dentro del hotel) (subtarea HOTELICA-212).
- **Estado global:** `habitaciones` pasa a formar parte de lo que se guarda en el navegador (`Persistido` en `src/store.tsx`). Los guardados viejos que no traen la lista se completan con `HABITACIONES_SEED`, igual que se hizo con los favoritos por cuenta en la HU-020 (subtarea HOTELICA-213).
- **Acciones nuevas:** `agregarHabitacion(hotelId, datos)` y `cambiarEstadoHabitacion(habitacionId, estado)` en `src/store.tsx`. La habitación se crea siempre para el hotel del hotelero logueado. En Fase 2 se cumplió (subtarea HOTELICA-214): las habitaciones se suben con `subirHabitacion()` / `subirHabitaciones()` a la tabla `habitaciones` de Supabase (`src/sync.ts`).
- **Lectura del inventario:** el panel del hotel, el detalle del hotel, los resultados de búsqueda, las tarjetas, "Mis reservas" y el cálculo de disponibilidad pasan a leer las habitaciones del estado global en lugar de la semilla (subtarea HOTELICA-215).
- **Interfaz:** sección nueva bajo "Habitaciones del hotel" en `src/pages/HotelPanel.tsx`, con botón "Registrar habitación" y formulario expandible, siguiendo el mismo patrón de la edición del hotel (HU-022) (subtarea HOTELICA-216).
- **Selector de tipo (2026-10-19):** el campo "tipo" pasó de texto libre a un selector con los tipos sugeridos de `TIPOS_HABITACION` en `src/data.ts` (Estándar Individual, Estándar Doble, Twin, Triple, Familiar, Suite, Cabaña, Bungalow) más la opción "Otro (escribir el nombre)", que muestra un campo de texto para tipos a medida como "Suite del Mombacho". La validación y los criterios BDD no cambian: el tipo vacío sigue marcando error y el nombre repetido dentro del hotel sigue sin registrarse.
- **Confirmación:** toast de éxito "Habitación registrada" al guardar (subtarea HOTELICA-217).
