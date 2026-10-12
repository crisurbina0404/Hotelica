# HU-018 — Registrar o realizar un pago

**Módulo:** Reservas  
**Prioridad:** Media (Should Have)  
**Estado:** ✅ Terminada  
**Sprint:** 3  
**Interfaz:** BookingModal (paso 2 del wizard) y MyReservations

## Redacción estándar

> Como **turista de Hotelica**, quiero **registrar o realizar el pago de mi reserva** para **confirmar mi estadía en el hotel seleccionado**.

## Contexto

El wizard de reserva (HU-013) tiene 3 pasos y el segundo es el **método de pago**. Aquí el turista elige cómo pagar (tarjeta, transferencia o efectivo en recepción), llena los datos del medio elegido y el sistema los valida antes de procesar. Al confirmar, se **registra el pago asociado al folio de la reserva**: si el pago se completó (tarjeta o transferencia) la reserva pasa a **Confirmada**; si eligió efectivo, el pago queda **Pendiente** y la reserva también, hasta que pague en el hotel. En la pantalla de éxito puede **descargar el comprobante** y además recibe el correo de confirmación.

En Fase 1 los pagos se guardan en el `localStorage` con la misma lista de datos del proyecto; en Fase 2 se escribirán en la tabla `pagos` de la base de datos.

## Criterios de aceptación (BDD)

### Escenario 1: Selección del método de pago
**Dado** que el turista está en el paso 2 del wizard  
**Cuando** observa las opciones de pago  
**Entonces** puede elegir entre Tarjeta, Efectivo y Transferencia, y la opción elegida queda resaltada

### Escenario 2: Formulario según el método elegido
**Dado** que el turista eligió un método  
**Cuando** se muestra el formulario  
**Entonces** tarjeta pide titular, número, vencimiento y CVV; transferencia pide banco y número de referencia; efectivo explica que se paga en recepción al llegar

### Escenario 3: Validación antes de procesar
**Dado** que el turista dejó un dato inválido (tarjeta de menos de 16 dígitos, vencimiento inválido o sin referencia de transferencia)  
**Cuando** intenta avanzar al paso 3  
**Entonces** no avanza y ve un mensaje claro con el dato a corregir

### Escenario 4: Datos válidos permiten avanzar
**Dado** que el turista completó correctamente los datos del método elegido  
**Cuando** pulsa "Siguiente"  
**Entonces** avanza al paso 3 con el resumen de la reserva

### Escenario 5: El pago queda registrado con la reserva
**Dado** que el turista confirmó la reserva con un pago completo (tarjeta o transferencia)  
**Cuando** el sistema procesa la operación  
**Entonces** se crea un registro de pago con folio, monto, método, fecha y estado **Pagado**, y ese registro se puede ver en el detalle de la reserva

### Escenario 6: Reserva confirmada tras un pago exitoso
**Dado** que el pago se completó  
**Cuando** termina el proceso  
**Entonces** la reserva queda en estado **Confirmada** y así aparece en "Mis reservas"

### Escenario 7: Pago en efectivo deja todo pendiente
**Dado** que el turista eligió Efectivo  
**Cuando** confirma la reserva  
**Entonces** el pago se registra como **Pendiente** y la reserva también, hasta que pague en recepción

### Escenario 8: Comprobante descargable
**Dado** que la reserva y el pago quedaron registrados  
**Cuando** está en la pantalla de éxito  
**Entonces** puede descargar el comprobante con folio, hotel, fechas, desglose y método de pago, y también recibe el correo de confirmación

### Escenario 9: El comprobante refleja el pago guardado
**Dado** que el turista descarga el comprobante  
**Cuando** lo abre  
**Entonces** los montos coinciden con los de la reserva: subtotal, IVA 15% y total

## MoSCoW

- **Must Have:** ✅ selección de método (tarjeta, efectivo, transferencia); ✅ formulario con los datos de cada método; ✅ validación antes de procesar; ✅ registro del pago asociado al folio; ✅ reserva pasa a **Confirmada** cuando el pago se completa.
- **Should Have:** ✅ estado del pago visible en el detalle de la reserva; ✅ comprobante descargable en la pantalla de éxito; ✅ correo de confirmación (HU-013).
- **Could Have:** ✅ función `validarPago()` con pruebas unitarias; ✅ referencia guardada (últimos 4 dígitos de la tarjeta o n.º de transferencia) en el registro de pago.
- **Won't Have:** pasarela de pago real (Stripe/NICAPAGOS), cobros en USD, cuotas, reembolsos automáticos, tarjetas guardadas entre reservas.

## Notas de implementación

- Tipos: `EstadoPago`, `Pago` y `DatosPago` en `src/data.ts`.
- Validación: `validarPago(metodo, datos, hoy)` en `src/data.ts` — devuelve `""` si está bien o el mensaje de error.
- Registro: `registrarPago(folio, monto, metodo, referencia)` en `src/store.tsx` — agrega el pago a `pagos` (persistido en `localStorage`) y, si está pagado, cambia la reserva a `confirmada`.
- Formulario: paso 2 de `src/pages/BookingModal.tsx`, validado con `validarPaso()` antes de avanzar.
- Comprobante: `descargarComprobante()` en `src/pages/BookingModal.tsx`, genera un archivo HTML con el detalle y lo descarga desde el navegador.
- Estado del pago en el detalle: `src/pages/MyReservations.tsx` busca el pago por folio y lo muestra junto al método.
- Pruebas: `describe("validarPago")` en `src/__tests__/data.test.ts`.

### Regla implementada

```ts
// src/data.ts — Validación de los datos de pago (HU-018)
export function validarPago(
  metodo: Reserva["pago"],
  datos: DatosPago,
  hoy: string
): string {
  if (metodo === "efectivo") return ""; // se paga en recepción
  if (metodo === "transferencia") {
    if (!datos.banco.trim()) return "Selecciona el banco desde donde haces la transferencia.";
    if (datos.referencia.trim().length < 6) return "Ingresa el número de referencia de la transferencia.";
    return "";
  }
  const digitos = datos.tarjeta.replace(/\s+/g, "");
  if (!/^\d{16}$/.test(digitos)) return "El número de tarjeta debe tener 16 dígitos.";
  if (!datos.titular.trim()) return "Ingresa el nombre del titular de la tarjeta.";
  if (!/^\d{2}\/\d{2}$/.test(datos.vencimiento)) return "El vencimiento debe tener el formato MM/AA.";
  const [mes, anio] = datos.vencimiento.split("/").map(Number);
  const anioHoy = Number(hoy.slice(2, 4));
  const mesHoy = Number(hoy.slice(5, 7));
  if (anio < anioHoy || (anio === anioHoy && mes < mesHoy)) return "La tarjeta está vencida.";
  if (!/^\d{3}$/.test(datos.cvv)) return "El código de seguridad (CVV) tiene 3 dígitos.";
  return "";
}
```
