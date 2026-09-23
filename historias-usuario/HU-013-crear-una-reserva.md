# HU-013 — Crear una reserva

**Módulo:** Reservas  
**Prioridad:** Alta (Must Have)  
**Estado:** ✅ Terminada  
**Sprint:** 2  
**Interfaz:** BookingModal, HotelDetail

## Redacción estándar

> Como **turista de Hotelica**, quiero **crear una reserva seleccionando habitación, fechas y número de huéspedes** para **asegurar mi alojamiento en el hotel de mi preferencia**.

## Contexto

El turista necesita completar el proceso de reserva después de haber seleccionado una habitación disponible. El sistema debe guiarlo a través de un wizard de 3 pasos que valide la disponibilidad en tiempo real, calcule el total con IVA y registre la reserva con un folio único.

## Criterios de aceptación (BDD)

### Escenario 1: Crear reserva exitosamente
**Dado** que el turista seleccionó una habitación disponible y fechas válidas  
**Cuando** completa el wizard de 3 pasos y confirma la reserva  
**Entonces** el sistema registra la reserva con estado "Pendiente" y muestra un folio HC-XXXX

### Escenario 2: Fechas no disponibles
**Dado** que el turista selecciona fechas sin disponibilidad  
**Cuando** intenta avanzar al siguiente paso  
**Entonces** se muestra un error y se sugieren fechas alternativas

### Escenario 3: Exceder capacidad de habitación
**Dado** que el turista ingresa más huéspedes de los que admite la habitación  
**Cuando** intenta avanzar al siguiente paso  
**Entonces** se muestra un error indicando la capacidad máxima

### Escenario 4: Método de pago
**Dado** que el turista completa el paso de datos  
**Cuando** avanza al paso 2  
**Entonces** puede seleccionar entre tarjeta, efectivo o transferencia

### Escenario 5: Confirmación y resumen
**Dado** que el turista completa los 2 primeros pasos  
**Cuando** llega al paso 3  
**Entonces** ve un resumen completo con hotel, habitación, fechas, huéspedes, método de pago y total

## MoSCoW

- **Must Have:** Wizard de 3 pasos, validación de disponibilidad, registro con folio HC-XXXX, resumen de confirmación.
- **Should Have:** ✅ Cálculo automático de precio total (noches × precio + IVA 15%), sugerencias de fechas alternativas, auto-rellenar datos del usuario logiado, ✅ envío de correo de confirmación.
- **Could Have:** ✅ Campo de comentarios o solicitudes especiales.
- **Won't Have:** Reserva grupal con pagos divididos, integración con agencias de viaje.

## Flujo del wizard

### Paso 1: Datos de la reserva
- Selección de fechas de llegada y salida
- Número de huéspedes
- Datos del usuario logiado (solo lectura: nombre, correo, teléfono)
- Indicador de disponibilidad en tiempo real
- Sugerencias de fechas alternativas si no hay disponibilidad

### Paso 2: Método de pago
- Selección de método: Tarjeta, Efectivo o Transferencia
- **Campo de comentarios o solicitudes especiales (opcional)**
- Resumen de precio parcial

### Paso 3: Confirmación
- Resumen completo de la reserva (incluyendo datos del usuario y comentarios)
- Botón "Confirmar reserva"
- Animación de procesamiento
- Pantalla de éxito con folio HC-XXXX

## Notas de implementación

- Componente: `src/pages/BookingModal.tsx`
- Función de creación: `crearReserva()` en `src/store.tsx:139-151`
- Envío de correo: `enviarCorreoReserva()` en `src/store.tsx:153` + Edge Function `supabase/functions/enviar-correo-reserva/index.ts`
- Cálculos: `calcularNoches()`, `calcularTotales()` en `src/data.ts`
- Sugerencias: `sugerirFechasAlternativas()` en `src/data.ts:387`
- Integración con: `src/pages/HotelDetail.tsx:440-449`
