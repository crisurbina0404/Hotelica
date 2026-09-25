# HU-014 — Calcular subtotal, IVA y total

**Módulo:** Reservas  
**Prioridad:** Alta (Must Have)  
**Estado:** ✅ Terminada  
**Sprint:** 3  
**Interfaz:** BookingModal (wizard de 3 pasos), MyReservations

## Redacción estándar

> Como **turista de Hotelica**, quiero **ver el desglose del costo de mi reserva (subtotal, IVA y total a pagar) antes de confirmarla** para **conocer con transparencia cuánto pagaré y qué parte corresponde a impuestos**.

## Contexto

Después de seleccionar habitación y fechas, el turista necesita entender cómo se forma el monto final de su reserva. La regla de negocio del proyecto establece un **IVA del 15%** aplicado sobre el subtotal (precio por noche × número de noches), montos expresados en córdobas nicaragüenses (C$). El cálculo debe ser consistente en todos los puntos donde se muestra dinero: el panel lateral del wizard, la pantalla de éxito con folio, y el detalle de cada reserva en "Mis reservas".

## Criterios de aceptación (BDD)

### Escenario 1: Cálculo correcto del desglose
**Dado** que el turista seleccionó una habitación con precio por noche y fechas válidas  
**Cuando** el sistema calcula los montos de la reserva  
**Entonces** el subtotal es igual a precio por noche × noches, el IVA es el 15% del subtotal (redondeado al córdoba) y el total es la suma de ambos

### Escenario 2: Desglose visible en el wizard de reserva
**Dado** que el turista avanza por el wizard de 3 pasos  
**Cuando** observa el panel "Resumen de precio"  
**Entonces** ve precio por noche, noches, subtotal, IVA (15%) y total a pagar, todos en formato de córdobas

### Escenario 3: Desglose en la pantalla de éxito
**Dado** que el turista confirmó su reserva  
**Cuando** se muestra la pantalla de éxito con el folio HC-XXXX  
**Entonces** el resumen incluye el desglose completo: precio por noche, noches, subtotal, IVA y total

### Escenario 4: Desglose en "Mis reservas"
**Dado** que el turista tiene reservas registradas  
**Cuando** abre el detalle de una reserva  
**Entonces** ve el desglose subtotal, IVA (15%) y total guardados en la reserva

### Escenario 5: Fechas inválidas producen montos en cero
**Dado** que el turista ingresa una fecha de salida igual o anterior a la de llegada (0 noches)  
**Cuando** el sistema calcula los totales  
**Entonces** subtotal, IVA y total se muestran en C$ 0.00 sin errores

### Escenario 6: Entradas inválidas no generan montos negativos
**Dado** que por un defecto el sistema recibe un precio o número de noches negativo, NaN o infinito  
**Cuando** el sistema calcula los totales  
**Entonces** subtotal, IVA y total resultan en 0, garantizando que el total nunca sea negativo

### Escenario 7: Persistencia del desglose en la reserva
**Dado** que el turista confirma una reserva  
**Cuando** el sistema la registra  
**Entonces** los campos `subtotal`, `iva` y `total` quedan guardados con la reserva y se muestran igual después de recargar la página

## MoSCoW

- **Must Have:** ✅ Fórmula subtotal = precio × noches; ✅ IVA 15% redondeado al córdoba; ✅ total = subtotal + IVA; ✅ desglose visible en wizard, pantalla de éxito y "Mis reservas".
- **Should Have:** ✅ Formato monetario consistente `fmtDinero()` (C$ con 2 decimales); ✅ persistencia del desglose en el objeto `Reserva`.
- **Could Have:** ✅ Constante exportada `TASA_IVA` para cambiar el impuesto en un solo lugar; ✅ protección contra entradas inválidas (negativas, NaN, infinitas).
- **Won't Have:** Descuentos o cupones, impuestos adicionales distintos del IVA, conversión a otras monedas, precios dinámicos por demanda.

## Notas de implementación

- Función central: `calcularTotales(precioNoche, noches)` en `src/data.ts:369-377`, con validación de entradas (HU-014).
- Constante de impuesto: `TASA_IVA = 0.15` en `src/data.ts` (exportada para UI y pruebas).
- Cálculo de noches: `calcularNoches(llegada, salida)` en `src/data.ts:345-351`.
- Uso en el wizard: `src/pages/BookingModal.tsx:52` — `const { subtotal, iva, total } = calcularTotales(habitacion.precio, Math.max(0, noches))`.
- Desglose agregado en la pantalla de éxito: `src/pages/BookingModal.tsx:178-186`.
- Desglose en "Mis reservas": `src/pages/MyReservations.tsx:217-219`.
- Persistencia: el tipo `Reserva` (`src/data.ts:47-69`) guarda `subtotal`, `iva` y `total` por reserva.
- Pruebas: 8 casos nuevos en `src/__tests__/data.test.ts` (describe `calcularTotales`), incluyendo edge cases de HU-014.

### Fórmula implementada

```tsx
// src/data.ts — Reglas de negocio del cálculo (HU-014)
export const TASA_IVA = 0.15;

export function calcularTotales(precioNoche: number, noches: number) {
  // Entradas inválidas (negativas, NaN o infinitas) se tratan como 0
  const precio = Number.isFinite(precioNoche) && precioNoche > 0 ? precioNoche : 0;
  const n = Number.isFinite(noches) && noches > 0 ? Math.round(noches) : 0;
  const subtotal = precio * n;
  const iva = Math.round(subtotal * TASA_IVA);
  return { subtotal, iva, total: subtotal + iva };
}
```
