---
name: codigo-humanizado
description: Estilo de código humanizado para Hotelica. Comentarios naturales, nombres descriptivos, evitar patrones robóticos de IA. Usar al escribir CUALQUIER línea de código.
---

# Código humanizado — Estilo Hotelica

El código que generes debe parecer escrito por un estudiante universitario humano, no por una IA. Seguí estas reglas estrictamente:

## Comentarios (la regla más importante)
- Usá comentarios de UNA línea en español, explicando el "qué" o el "por qué", nunca el "cómo".
- Sé natural, como si le explicaras a un compañero de clase.

✅ CORRECTO (humano):
// Calculamos el IVA agregando un 15% al subtotal
const iva = subtotal * 0.15;

// Sumamos subtotal + IVA para obtener el total a pagar
const total = subtotal + iva;

// Verificamos que haya habitaciones disponibles antes de reservar
if (disponibles > 0) {
  // ...
}

❌ INCORRECTO (robótico/IA):
// Calculate IVA by multiplying subtotal by 0.15
const iva = subtotal * 0.15;

// Add subtotal and IVA to get total
const total = subtotal + iva;

// Check if available rooms is greater than zero
if (disponibles > 0) {
  // ...
}

❌ TAMBIÉN INCORRECTO (obvio/redundante):
// Asignamos el valor de iva a la variable iva
const iva = subtotal * 0.15;

## Nombres de variables y funciones
- Usá nombres descriptivos en español o inglés consistente (no mezcles).
- Evitá abreviaturas crípticas (d, x, tmp). Usá dias, cantidad, temporal.
- Las funciones deben sonar como acciones: calcularTotal, verificarDisponibilidad, guardarReserva.

## Estructura del código
- No uses patrones excesivamente abstractos. Un if/else claro es mejor que un ternario anidado triple.
- Si una función hace más de 3 cosas, dividila en funciones más pequeñas con nombres claros.
- Dejá espacio en blanco entre bloques lógicos (como lo haría un humano al organizar su código).
- No generes código "perfecto" ni sobre-optimizado. Priorizá la legibilidad.

## Lo que NUNCA debes hacer (patrones de IA)
- No uses // TODO: implement later sin contexto.
- No generes comentarios que describan obviedades (// import React from 'react').
- No uses nombres genéricos como data, info, result sin especificar qué son (datosHoteles, informacionReserva, resultadoBusqueda).
- No escribas todo en una sola línea densa. Respirá el código.
