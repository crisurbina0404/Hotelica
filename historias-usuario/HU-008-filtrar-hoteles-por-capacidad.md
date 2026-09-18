# HU-008 — Filtrar hoteles por capacidad

**Módulo:** Búsqueda y consulta  
**Prioridad:** Media  
**Estado:** ✅ Terminada  
**Sprint:** 2  
**Estimación:** 4 Story Points  
**Interfaz:** Results (barra de búsqueda y barra lateral de filtros)

## Redacción estándar

> Como **turista**, quiero **filtrar hoteles según la cantidad de huéspedes que necesito alojar** para **encontrar habitaciones adecuadas para mi grupo de viaje**.

## MoSCoW (detallado)

### Must Have (Debe tener)
- Selector de número de huéspedes (1-10+)
- Filtrado basado en capacidad máxima de habitaciones disponibles
- Actualización en tiempo real de resultados

### Should Have (Debería tener)
- Distinción entre adultos y niños
- Visualización de habitaciones adecuadas para el grupo seleccionado
- Filtro combinable con precio y departamento

### Could Have (Podría tener)
- Recomendación de tipo de habitación según capacidad
- Indicador visual de capacidad
- Filtro por tipo de cama (individual/doble)

### Won't Have (No tendrá por ahora)
- Cálculo automático de camas extra necesarias
- Integración con políticas de ocupación por hotel
- Filtro por accesibilidad para movilidad reducida

## Criterios de aceptación (BDD)

### Escenario 1: Selector de huéspedes en la barra de búsqueda
**DADO QUE** la turista se encuentra en la pantalla de búsqueda  
**CUANDO** selecciona un número de huéspedes  
**ENTONCES** el sistema debe filtrar los hoteles que tengan habitaciones con capacidad para esa cantidad de personas

### Escenario 2: Filtrado por capacidad de habitación
**DADO QUE** existen hoteles con habitaciones de capacidad 2, 4 y 6  
**CUANDO** la turista selecciona 4 huéspedes y aplica el filtro de capacidad  
**ENTONCES** el sistema debe mostrar solo los hoteles con habitaciones que cubran esa cantidad de personas

### Escenario 3: Actualización en tiempo real
**DADO QUE** la turista cambia la cantidad de huéspedes en el selector  
**CUANDO** modifica el valor  
**ENTONCES** los resultados se actualizan inmediatamente

### Escenario 4: Combinación con otros filtros
**DADO QUE** la turista ha aplicado filtros de precio y departamento  
**CUANDO** ajusta la cantidad de huéspedes  
**ENTONCES** se aplican todos los filtros simultáneamente (precio + departamento + capacidad)

### Escenario 5: Sin resultados para la capacidad seleccionada (Edge Case)
**DADO QUE** no existen hoteles con capacidad suficiente para el número de huéspedes seleccionado  
**CUANDO** la turista aplica el filtro  
**ENTONCES** el sistema debe informar que no hay disponibilidad para esa capacidad y sugerir reducir el número de huéspedes

### Escenario 6: Limpiar filtros restablece huéspedes
**DADO QUE** la turista ha ajustado el filtro de huéspedes  
**CUANDO** presiona el botón "Limpiar filtros"  
**ENTONCES** la cantidad de huéspedes vuelve al valor por defecto (2)

## Notas de implementación

- Selector en barra de búsqueda: `src/pages/Results.tsx` (línea 122, `input type="number"`)
- Estado: `const [huespedes, setHuespedes] = useState(ruta.huespedes ?? 2)`
- Lógica de filtrado: verificar `hab.capacidad >= huespedes` en habitaciones disponibles
- El filtro ya existe parcialmente en Results.tsx (líneas 66-72), falta agregar en barra lateral
- Combinar con filtros existentes: precio, departamento, calificación, destacados
- Actualización en tiempo real: los resultados se filtran al cambiar el valor del selector
