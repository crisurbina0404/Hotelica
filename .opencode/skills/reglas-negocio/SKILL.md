---
name: reglas-negocio
description: Reglas de negocio y cálculos de Hotelica (IVA 15%, disponibilidad, ocupación, calificación, formatos de Nicaragua). Usar al programar reservas, pagos, reportes o lógica de BD.
---

# Reglas de negocio — Hotelica

## Cálculos obligatorios (implementar EXACTAMENTE así)
| # | Métrica | Fórmula |
|---|---|---|
| 1 | Noches | fecha_salida − fecha_llegada |
| 2 | Subtotal | precio_por_noche × noches |
| 3 | IVA (15%) | subtotal × 0.15 |
| 4 | Total a pagar | subtotal + IVA |
| 5 | Disponibilidad | total_unidades − unidades_ocupadas |
| 6 | % Ocupación | (ocupadas ÷ total_unidades) × 100 |
| 7 | Calificación promedio | ((calif_actual × reseñas) + nueva_calif) ÷ (reseñas + 1) |
| 8 | Ingresos totales | SUM(total) WHERE estado_reserva != 'Cancelada' |

## Validaciones obligatorias
- Fecha salida > fecha llegada (si no, mostrar error).
- Número de huéspedes ≤ capacidad de la habitación.
- Disponibilidad > 0 antes de permitir reserva.
- Precio por noche > 0.
- Solo hoteles con estado_hotel = 'Aprobado' aparecen en búsquedas del turista.

## Estados controlados (ENUMs de la BD)
- Hotel: Pendiente → Aprobado / Rechazado
- Reserva: Pendiente → Confirmada → Check-in → Completada / Cancelada
- Pago: Pagado / Pendiente / Reembolsado

## Formatos de Nicaragua
- Moneda: córdobas (C$) con dos decimales.
- Departamentos: Granada, León, Rivas, Managua, Masaya, Estelí, Matagalpa, RACCS (8 en total).
- Teléfono: 8 dígitos.

## Ejemplo de implementación (humanizado)
// Calculamos cuántas noches se queda el huésped
const noches = calcularDiasEntre(fechaLlegada, fechaSalida);

// Multiplicamos el precio por las noches para el subtotal
const subtotal = precioPorNoche * noches;

// Aplicamos el IVA del 15% que corresponde en Nicaragua
const iva = subtotal * 0.15;

// Sumamos todo para obtener el total final
const total = subtotal + iva;
