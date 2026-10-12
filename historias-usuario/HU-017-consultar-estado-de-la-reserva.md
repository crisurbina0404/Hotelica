# HU-017 — Consultar el estado de la reserva

**Módulo:** Reservas  
**Prioridad:** Alta (Must Have)  
**Estado:** ✅ Terminada  
**Sprint:** 3  
**Interfaz:** MyReservations (ruta protegida `reservas`)

## Redacción estándar

> Como **turista de Hotelica**, quiero **consultar el estado actual de mi reserva** para **saber si está confirmada, pendiente o cancelada**.

## Contexto

Después de reservar, el turista necesita saber en qué punto va su reserva: si el hotel ya la confirmó, si ya hizo check-in, si la estadía terminó o si alguien la canceló. La pantalla "Mis reservas" muestra el estado en dos lugares: la **etiqueta de color** en cada tarjeta del listado y, dentro del detalle, una **línea de tiempo** con los 4 pasos del flujo de la reserva (**Pendiente → Confirmada → Check-in → Completada**) donde se marcan los pasos ya recorridos y se resalta el actual. Si la reserva está **Cancelada**, el flujo se detiene y se explica con un aviso aparte.

Además, cuando el estado cambia desde la última vez que el turista miró su historial (por ejemplo, el hotel la confirmó), el sistema lo avisa, y si el detalle se pide con un folio que ya no existe, se muestra un mensaje claro en lugar de romper la pantalla.

## Criterios de aceptación (BDD)

### Escenario 1: Estado visible en el listado
**Dado** que el turista tiene reservas en distintos estados  
**Cuando** abre "Mis reservas"  
**Entonces** cada tarjeta muestra una etiqueta con color y texto: Pendiente, Confirmada, Check-in, Completada o Cancelada

### Escenario 2: Estado actual dentro del detalle
**Dado** que el turista toca "Ver detalle" en una reserva  
**Cuando** se abre el modal  
**Entonces** ve el estado actual con su etiqueta y un texto que explica qué significa ("El hotel aún no confirma tu reserva", "Todo listo para tu llegada", etc.)

### Escenario 3: Línea de tiempo del flujo de la reserva
**Dado** que el turista abre el detalle de una reserva que no está cancelada  
**Cuando** observa la línea de tiempo  
**Entonces** se muestran los 4 pasos (Pendiente, Confirmada, Check-in, Completada): los ya recorridos aparecen marcados con un check, el paso actual está resaltado y los futuros quedan en gris

### Escenario 4: Reserva cancelada explica que el flujo se detuvo
**Dado** que la reserva tiene estado **Cancelada**  
**Cuando** el turista abre su detalle  
**Entonces** no se muestra el flujo como si siguiera: aparece un aviso en coral indicando que la reserva fue cancelada y en qué estado quedó

### Escenario 5: Aviso cuando el estado cambió desde la última visita
**Dado** que el turista no abrió "Mis reservas" y el hotel cambió el estado de una de sus reservas  
**Cuando** vuelve a entrar a la pantalla  
**Entonces** se muestra un aviso ("Tu reserva HC-XXXX pasó a …") y esa tarjeta queda marcada como recién actualizada

### Escenario 6: Reserva inexistente en el detalle
**Dado** que el detalle se abre con un folio que ya no existe (por ejemplo, se restauraron los datos de demostración)  
**Cuando** se intenta mostrar la reserva  
**Entonces** el modal muestra "No encontramos la reserva" con la opción de cerrar, sin errores en pantalla

### Escenario 7: El estado refleja el dato guardado
**Dado** que una reserva cambió de estado en el panel del hotel  
**Cuando** el turista recarga la página y vuelve a su historial  
**Entonces** el listado y el detalle muestran el estado recién guardado

### Escenario 8: Sin sesión no se consulta el historial
**Dado** que nadie inició sesión  
**Cuando** se intenta abrir "Mis reservas"  
**Entonces** la pantalla no se abre y la aplicación vuelve al inicio

## MoSCoW

- **Must Have:** ✅ badge de estado en cada tarjeta; ✅ estado con explicación en el detalle; ✅ línea de tiempo de los 4 pasos con actual resaltado; ✅ caso de reserva inexistente manejado.
- **Should Have:** ✅ aviso cuando el estado cambió desde la última visita (toast + marca en la tarjeta); ✅ bloque especial para reservas canceladas.
- **Could Have:** ✅ animación finita (`anim-pop`) en el paso actual de la línea de tiempo.
- **Won't Have:** fechas por cada paso del flujo, notificaciones push o correo al turista, línea de tiempo en tiempo real (websockets), reordenar pasos según el rol.

## Notas de implementación

- Pantalla: `src/pages/MyReservations.tsx` — tarjetas con `BadgeEstado`, modal `DetalleReserva` (ahora abierto por **folio**, no por objeto).
- Línea de tiempo: componente `LineaTiempo` en `src/pages/MyReservations.tsx`, con los pasos definidos por `FLUJO_RESERVA` y el índice actual en `pasoDeEstado()`.
- Regla de negocio: `pasoDeEstado(estado)` en `src/data.ts` — devuelve 0..3 dentro del flujo y `-1` cuando la reserva está cancelada.
- Reserva inexistente: si el folio buscado no está en `reservas`, el modal muestra el mensaje de "No encontramos la reserva".
- Aviso de cambio de estado: `src/pages/MyReservations.tsx` guarda el último estado visto por folio en `localStorage` (`hotelica-estados-vistos`) y compara al entrar.
- Estados y etiquetas: `ETIQUETA_ESTADO` y `CLASES_ESTADO` en `src/data.ts` / `src/ui.tsx` (colores oficiales de la guía de diseño).
- Pruebas: `describe("pasoDeEstado")` en `src/__tests__/data.test.ts`.

### Regla implementada

```ts
// src/data.ts — Flujo de estados de una reserva (HU-017)
export const FLUJO_RESERVA: EstadoReserva[] = ["pendiente", "confirmada", "checkin", "completada"];

// Índice del paso actual en el flujo; -1 cuando la reserva está cancelada
export function pasoDeEstado(estado: EstadoReserva): number {
  return estado === "cancelada" ? -1 : FLUJO_RESERVA.indexOf(estado);
}
```
