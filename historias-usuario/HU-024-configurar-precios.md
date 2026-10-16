# HU-024 — Configurar precios

**Módulo:** Gestión Hotel
**Prioridad:** Alta (Must Have)
**Estado:** ✅ Terminada
**Sprint:** 4
**Interfaz:** sección "Precios del hotel" en `src/pages/HotelPanel.tsx`

## Redacción estándar

> Como **administrador de hotel**, quiero **configurar el precio por noche de las habitaciones que ya registré** para **mantener mis tarifas al día y cobrar distinto según la temporada**.

## Contexto

La HU-023 dejó registrar habitaciones con su precio por noche, pero una vez creadas
ese precio quedaba **congelado**: si el hotelero se equivocaba al escribirlo, o si
llegaba la temporada alta, no tenía forma de corregirlo desde el panel. La única
salida era convivir con una tarifa equivocada para siempre.

Con esta historia el hotelero abre la sección **"Precios del hotel"** y ve todas sus
habitaciones con la tarifa vigente, el IVA del 15% y el total por noche que termina
pagando el turista (con la fórmula de `calcularTotales()`). Desde ahí puede
**corregir el precio de una habitación** o **aplicar un ajuste de temporada a todas
a la vez**, en lugar de hacerlo una por una.

Dos reglas de negocio importantes:

1. **El precio por noche siempre es mayor que cero** y no puede pasar de
   C$ 50,000.00, la misma regla que valida el registro de habitaciones.
2. **Las reservas ya hechas no cambian.** Cada reserva guardó su subtotal, su IVA y
   su total cuando el turista reservó (`subtotal`, `iva`, `total` en `Reserva`), así
   que subir o bajar el precio hoy **no** toca lo que ya se cobró ni lo que está
   pendiente de pago. Lo nuevo solo aplica a las reservas siguientes.

**Restricción:** mientras el hotel está **Pendiente** (esperando la aprobación del
admin), los precios no se pueden configurar, igual que la información del hotel
(HU-022) y las habitaciones (HU-023).

## Criterios de aceptación (BDD)

### Escenario 1: Ver las tarifas actuales
**Dado** que el hotelero está en su panel del hotel
**Cuando** abre la sección "Precios del hotel"
**Entonces** ve cada tipo de habitación con su precio por noche, el IVA del 15% y el total por noche que paga el turista

### Escenario 2: Cambiar el precio de una habitación
**Dado** que el hotelero tiene una habitación a C$ 1,500.00 por noche
**Cuando** escribe C$ 1,800.00 en su precio y guarda el cambio
**Entonces** el precio queda actualizado, se muestra una confirmación y el nuevo total con IVA aparece en la misma tarjeta

### Escenario 3: Precio inválido
**Dado** que el hotelero deja el precio vacío, en cero, en negativo o por encima de C$ 50,000.00
**Cuando** guarda el cambio
**Entonces** el sistema no cambia nada y marca ese campo con el motivo del error

### Escenario 4: Aplicar un ajuste de temporada
**Dado** que el hotelero quiere cobrar más en temporada alta
**Cuando** elige la temporada "Alta (+20 %)" y aplica el ajuste a todas las habitaciones
**Entonces** cada precio sube un 20 %, se ve el rango resultante ("de C$ X a C$ Y por noche") y aparece una confirmación con cuántas habitaciones se actualizaron

### Escenario 5: Solo se configura si el hotel está aprobado
**Dado** que el hotel tiene estado **Pendiente**
**Cuando** el hotelero está en su panel
**Entonces** los precios se ven, pero en modo lectura: los campos y el botón de ajuste están deshabilitados con un aviso de que debe esperar la aprobación

### Escenario 6: El turista ve el precio nuevo y las reservas viejas no cambian
**Dado** que el hotel tiene una reserva hecha cuando la noche valía C$ 1,500.00
**Cuando** el hotelero sube el precio a C$ 1,800.00
**Entonces** el turista ve C$ 1,800.00 (más IVA) en los resultados, en el detalle y al reservar, y la reserva anterior conserva los C$ 1,500.00 por noche con los que se creó

## MoSCoW

- **Must Have:** ver las tarifas con IVA y total por noche; cambiar el precio de una habitación; validación del precio antes de guardar; el precio nuevo se ve en las búsquedas, el detalle y el asistente de reserva; las reservas ya hechas conservan su total.
- **Should Have:** ajuste de temporada aplicado a todas las habitaciones a la vez, con las temporadas normales y la opción de escribir un porcentaje propio; vista previa del rango de precios antes de aplicarlo; bloqueo de la configuración mientras el hotel está Pendiente; el registro de habitaciones (HU-023) reutiliza la misma validación de precio en lugar de repetir la regla.
- **Could Have:** historial de cambios de precio con fecha, programar fechas de temporada alta en el calendario, precio distinto por ocupación.
- **Won't Have:** precios por fecha o temporada en el calendario (necesita el calendario tarifario completo), promociones con descuentos por cantidad de noches, configuración de precios por el administrador.

## Notas de implementación

- **Tipos y reglas:** se agrega `errorDePrecio()` en `src/data.ts` (precio mayor que cero y máximo C$ 50,000.00), la lista `TEMPORADAS` con su porcentaje de ajuste, `errorDeAjuste()` (entre −50 % y +100 %) y `ajustarPrecio(precio, porcentaje)`, que redondea el resultado a córdobas enteros (subtarea HOTELICA-218).
- **Una sola regla de precio:** `validarHabitacion()` (HU-023) pasa a usar `errorDePrecio()`, así el registro de habitaciones y la configuración de precios no se pueden desincronizar (subtarea HOTELICA-219).
- **Acciones nuevas en `src/store.tsx`:** `cambiarPrecioHabitacion(habitacionId, precio)` y `ajustarPreciosDelHotel(hotelId, porcentaje)`, las dos con validación previa y devolviendo el error cuando no corresponde (subtarea HOTELICA-220).
- **Interfaz:** sección nueva bajo "Habitaciones del hotel" en `src/pages/HotelPanel.tsx`, con una tarjeta por habitación y el campo de precio editable, siguiendo el patrón de validación de la HU-022 y la HU-023 (subtarea HOTELICA-221).
- **Ajuste por temporada:** selector con las temporadas —y la opción "Ajuste propio" para escribir el porcentaje a mano— con botón "Aplicar a todas", vista previa del rango resultante calculado con `ajustarPrecio()` y error visible si el porcentaje se sale de −50 % a +100 % (subtarea HOTELICA-222).
- **Bloqueo:** con `aprobado === "pendiente"` los campos van deshabilitados y el botón de ajuste no se muestra, con el mismo aviso que usan la edición del hotel y el registro de habitaciones (subtarea HOTELICA-223).
- **Transparencia:** cada tarjeta muestra el total con IVA del 15 % usando `calcularTotales()`, y un aviso recuerda que **las reservas ya hechas conservan su precio** (subtarea HOTELICA-224).
- **Nada visible de "fases":** el aviso de reservas ya hechas y los textos de la sección se redactan para el hotelero, sin lenguaje académico ni referencias internas.
