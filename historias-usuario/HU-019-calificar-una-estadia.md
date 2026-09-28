# HU-019 — Calificar una estadía

**Módulo:** Reservas  
**Prioridad:** Baja (Could Have)  
**Estado:** ✅ Terminada  
**Sprint:** 3  
**Interfaz:** MyReservations (tarjeta de la reserva y modal de calificación)

## Redacción estándar

> Como **turista de Hotelica**, quiero **calificar mi estadía después de completar el check-out** para **compartir mi experiencia y ayudar a otros turistas a decidir**.

## Contexto

Cuando el hotel registra el check-out, la reserva pasa a **Completada** y en "Mis reservas" aparece el botón **Calificar estadía**. El turista elige de 1 a 5 estrellas y, si quiere, escribe un comentario. La calificación se guarda como un registro propio (tabla `calificaciones` en Fase 2), la reserva queda marcada como calificada y el **promedio del hotel se recalcula** con la fórmula oficial del proyecto:

`promedio nuevo = ((promedio actual × reseñas) + nueva calificación) ÷ (reseñas + 1)`

Solo se puede calificar **después del check-out** y **una sola vez por reserva**.

## Criterios de aceptación (BDD)

### Escenario 1: La opción aparece recién tras el check-out
**Dado** que el turista terminó su estadía y el hotel registró el check-out (reserva **Completada**)  
**Cuando** vuelve a "Mis reservas"  
**Entonces** la reserva muestra el botón **Calificar estadía**

### Escenario 2: No se puede calificar antes del check-out
**Dado** que la reserva está Pendiente, Confirmada o en Check-in  
**Cuando** el turista revisa la tarjeta  
**Entonces** no aparece la opción de calificar y el sistema rechaza cualquier intento de guardar

### Escenario 3: Formulario con estrellas y comentario opcional
**Dado** que el turista abrió el modal de calificación  
**Cuando** interactúa con el formulario  
**Entonces** puede marcar de 1 a 5 estrellas y escribir un comentario que queda como opcional

### Escenario 4: Hay que marcar al menos una estrella
**Dado** que el turista no marcó estrellas (o marcó un valor fuera de 1 a 5)  
**Cuando** intenta enviar la calificación  
**Entonces** no se guarda y ve el mensaje "La calificación debe estar entre 1 y 5 estrellas."

### Escenario 5: La calificación queda registrada
**Dado** que el turista marcó sus estrellas y envió  
**Cuando** el sistema procesa el envío  
**Entonces** se crea un registro con folio de la reserva, hotel, autor, estrellas, comentario y fecha, y esa reserva pasa a marcarse como **calificada**

### Escenario 6: El promedio del hotel se recalcula
**Dado** que el hotel tenía un promedio y una cantidad de reseñas  
**Cuando** entra una calificación nueva  
**Entonces** el promedio del hotel se actualiza con la fórmula `((promedio × reseñas) + nueva) ÷ (reseñas + 1)` y el contador de reseñas sube de 1

### Escenario 7: Una sola calificación por reserva
**Dado** que la reserva ya fue calificada  
**Cuando** el turista vuelve a "Mis reservas"  
**Entonces** en lugar del botón ve el sello **Ya calificaste** y el sistema no admite una segunda calificación para ese folio

### Escenario 8: El comentario se publica como reseña del hotel
**Dado** que el turista escribió un comentario  
**Cuando** envía la calificación  
**Entonces** el comentario aparece en las reseñas del hotel con su nombre y la fecha; si lo dejó vacío, solo se guarda la estrella

### Escenario 9: La calificación se conserva
**Dado** que el turista calificó su estadía  
**Cuando** cierra y vuelve a entrar  
**Entonces** la reserva sigue apareciendo como calificada con su estrella, sin poder repetir el proceso

## MoSCoW

- **Must Have:** ✅ botón "Calificar" solo para reservas tras check-out; ✅ formulario de estrellas (1-5) con comentario opcional; ✅ validación de estrellas entre 1 y 5; ✅ registro en la tabla `calificaciones`; ✅ una sola calificación por reserva.
- **Should Have:** ✅ recálculo del `calificacion_promedio` del hotel con la fórmula oficial; ✅ comentario publicado como reseña del hotel; ✅ sello "Ya calificaste" en la tarjeta; ✅ estrella del turista visible en el detalle de la reserva.
- **Could Have:** ✅ función `sePuedeCalificar()`, `validarCalificacion()` y `calificacionDe()` con pruebas unitarias; ✅ persistencia en `localStorage`.
- **Won't Have:** editar o eliminar una calificación ya enviada, calificar habitaciones por separado, dislikes, respuestas del hotel a las reseñas, moderación de comentarios.

## Notas de implementación

- Tipo `Calificacion` y funciones en `src/data.ts`:
  - `sePuedeCalificar(reserva)` — `estado === "completada"` y `calificada === false`.
  - `validarCalificacion(estrellas)` — `""` si es un entero entre 1 y 5, si no el mensaje de error.
  - `calificacionDe(calificaciones, folio)` — devuelve la calificación de una reserva.
- Persistencia: `calificaciones` se agrega a `Persistido` en `src/store.tsx` con `?? []` (igual que `pagos` y `notificaciones`).
- `calificar()` en `src/store.tsx` valida antes de escribir: si la reserva no está completada, ya fue calificada o las estrellas no son válidas, no cambia nada; si no, guarda el registro, marca `calificada`, recalcula el promedio con `nuevoPromedio()` y agrega la reseña cuando hay comentario.
- Botón y sello en `src/pages/MyReservations.tsx` con `sePuedeCalificar(r)`; el detalle muestra la estrella del turista.

### Regla implementada

```ts
// src/data.ts — Reglas de calificación (HU-019)

// Solo después del check-out y una sola vez por reserva
export function sePuedeCalificar(reserva: Pick<Reserva, "estado" | "calificada">): boolean {
  return reserva.estado === "completada" && !reserva.calificada;
}

// Las estrellas tienen que ser un entero entre 1 y 5
export function validarCalificacion(estrellas: number): string {
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
    return "La calificación debe estar entre 1 y 5 estrellas.";
  }
  return "";
}

// Promedio del hotel con la calificación que acaba de llegar
export function nuevoPromedio(promedio: number, totalResenas: number, estrellas: number): number {
  return Math.round(((promedio * totalResenas + estrellas) / (totalResenas + 1)) * 10) / 10;
}
```
