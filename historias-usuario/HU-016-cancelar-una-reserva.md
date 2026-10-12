# HU-016 — Cancelar una reserva

**Módulo:** Reservas  
**Prioridad:** Alta (Must Have)  
**Estado:** ✅ Terminada  
**Sprint:** 3  
**Interfaz:** MyReservations (ruta protegida `reservas`) y PanelHotel

## Redacción estándar

> Como **turista de Hotelica**, quiero **cancelar una reserva que ya no necesito** para **evitar cargos innecesarios y liberar la habitación reservada**.

## Contexto

El turista puede cambiar de planes: se equivocó de fechas, ya no puede viajar o consiguió otra opción. Cancelar debe ser simple, pero también controlado: solo se puede cancelar antes del check-in y mientras la reserva esté **Pendiente** o **Confirmada** (nunca una estadía ya en curso, completada o ya cancelada). Al cancelar, el estado pasa a **Cancelada**, la habitación se libera para esas fechas y el hotel recibe un aviso en su panel.

## Criterios de aceptación (BDD)

### Escenario 1: Botón de cancelar solo aparece cuando corresponde
**Dado** que el turista tiene reservas en distintos estados  
**Cuando** abre "Mis reservas"  
**Entonces** el botón "Cancelar reserva" solo se muestra en las reservas **Pendiente** o **Confirmada** cuya fecha de llegada aún no pasó

### Escenario 2: Modal de confirmación con política de cancelación
**Dado** que el turista toca "Cancelar reserva" en una reserva elegible  
**Cuando** se abre el modal de confirmación  
**Entonces** ve el folio de la reserva, el aviso de que la acción no se puede deshacer, la política de cancelación (sin cargos y libera la habitación) y las opciones "Conservar reserva" y "Sí, cancelar"

### Escenario 3: Confirmar la cancelación cambia el estado
**Dado** que el turista confirma la cancelación en el modal  
**Cuando** el sistema procesa la acción  
**Entonces** la reserva pasa al estado **Cancelada**, se muestra un aviso de éxito y la reserva aparece con el badge de "Cancelada" en el listado

### Escenario 4: Cancelar reserva en curso, completada o ya cancelada no está permitido
**Dado** que una reserva está en **Check-in**, **Completada** o ya está **Cancelada**  
**Cuando** el turista mira su historial  
**Entonces** esa reserva no ofrece el botón de cancelación y su estado no cambia

### Escenario 5: Reserva con llegada pasada no se puede cancelar
**Dado** que la fecha de llegada de una reserva Pendiente o Confirmada ya pasó  
**Cuando** el turista revisa esa reserva  
**Entonces** no puede cancelarla (el botón no se muestra) porque el check-in ya ocurrió

### Escenario 6: La habitación queda libre después de cancelar
**Dado** que una reserva ocupaba una habitación en cierto rango de fechas  
**Cuando** el turista la cancela  
**Entonces** la disponibilidad de esa habitación en esas fechas aumenta y otro turista puede reservarla

### Escenario 7: El hotel recibe el aviso de la cancelación
**Dado** que el turista cancela una reserva de un hotel  
**Cuando** el hotelero abre su panel  
**Entonces** ve un aviso "Reserva HC-XXXX cancelada por el turista" en la tarjeta de avisos, con la posibilidad de marcarlo como leído

### Escenario 8: La cancelación sobrevive a un refresco
**Dado** que el turista canceló una reserva  
**Cuando** recarga la página y vuelve a "Mis reservas"  
**Entonces** la reserva sigue apareciendo como **Cancelada** y el aviso para el hotel también persiste

## MoSCoW

- **Must Have:** ✅ botón "Cancelar reserva" con validación de estado y fecha; ✅ modal de confirmación con texto oficial y política; ✅ cambio de estado a **Cancelada** con persistencia; ✅ liberar la disponibilidad de la habitación.
- **Should Have:** ✅ aviso (toast) de éxito para el turista; ✅ notificación para el hotel en su panel con marca de leído.
- **Could Have:** ✅ función de negocio `sePuedeCancelar()` reutilizable y con pruebas unitarias.
- **Won't Have:** penalizaciones o cobro por cancelación, reembolsos automáticos (HU-018), cancelación parcial de noches, avisos por correo al hotel.

## Notas de implementación

- Regla de negocio: `sePuedeCancelar(reserva, hoy)` en `src/data.ts` — estado **Pendiente** o **Confirmada** y `llegada >= hoy`.
- Botón y modal: `src/pages/MyReservations.tsx` (componente `MisReservas`), validación con `sePuedeCancelar()`.
- Cambio de estado: `cambiarEstadoReserva(folio, "cancelada")` en `src/store.tsx` (Fase 1 guarda en `localStorage`, clave `hotelica-fase1-v2`; en Fase 2 se escribirá en la BD).
- Liberar disponibilidad: `disponiblesDe()` en `src/store.tsx` ignora las reservas con estado `cancelada`, así la habitación vuelve a estar disponible sin cálculos extra.
- Notificación al hotel: `avisarHotel()` en `src/store.tsx` agrega un registro a `notificaciones` (persistidas), y `PanelHotel.tsx` los lista en la tarjeta "Avisos recientes".
- Pruebas: `describe("sePuedeCancelar")` en `src/__tests__/data.test.ts`.

### Regla implementada

```ts
// src/data.ts — Regla de negocio de cancelación (HU-016)
export function sePuedeCancelar(reserva: Pick<Reserva, "estado" | "llegada">, hoy: string): boolean {
  // Solo antes del check-in y si la reserva sigue abierta
  return (reserva.estado === "pendiente" || reserva.estado === "confirmada") && reserva.llegada >= hoy;
}
```
