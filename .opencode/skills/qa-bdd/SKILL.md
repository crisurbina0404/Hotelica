---
name: qa-bdd
description: Pruebas QA basadas en criterios BDD de las HUs de Hotelica. Usar al terminar una interfaz, antes de marcar la HU como terminada.
---

# QA con BDD — Hotelica

Antes de dar por terminada cualquier HU, debés verificar que cumple sus criterios de aceptación (formato DADO QUE / CUANDO / ENTONCES).

## Proceso de verificación
1. Abrí el archivo de la HU en /historias-usuario/HU-XXX-titulo.md.
2. Leé el Escenario 1 (flujo exitoso) y el Escenario 2 (caso de borde).
3. Simulá mentalmente (o en el navegador) cada escenario.
4. Si algún escenario falla, NO marques la HU como terminada. Corregí el código primero.

## Checklist mínimo por HU
- [ ] Camino feliz: el flujo principal funciona como se describe.
- [ ] Caso de borde: los errores se manejan con mensajes claros (no crashes).
- [ ] Estado vacío: si no hay datos, se muestra un mensaje amigable (no una pantalla en blanco).
- [ ] Validaciones: los campos obligatorios se validan antes de guardar.
- [ ] Estados visuales: loading, error y éxito tienen feedback visual.

## Ejemplo de verificación (HU-014 · Calcular subtotal, IVA y total)
- Escenario 1: DADO QUE tengo una reserva con habitación ($85/noche) y fechas (3 noches) CUANDO el sistema calcula ENTONCES muestra subtotal $255, IVA $38.25, total $293.25. ✅
- Escenario 2: DADO QUE el precio de la habitación es inválido CUANDO intento calcular ENTONCES muestra error y no permite continuar. ✅

Si ambos pasan → HU lista para marcar como ✅ Terminada en Orden de Historias de Usuarios.md.
