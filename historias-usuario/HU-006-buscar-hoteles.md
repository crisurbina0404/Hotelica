# HU-006 — Buscar hoteles por departamento

**Módulo:** Búsqueda  
**Prioridad:** Alta (Must Have)  
**Estado:** ⬜ Escrita  
**Sprint:** 1  
**Interfaz:** Home (buscador principal)

## Redacción estándar

> Como **visitante de Hotelica**, quiero **buscar hoteles por departamento, fechas de llegada/salida y número de huéspedes** para **encontrar opciones de alojamiento que se ajusten a mi viaje**.

## Contexto

El buscador principal es la función más importante de la plataforma. El turista necesita encontrar hoteles en un departamento específico de Nicaragua, indicando cuándo viaja y con cuántas personas. La búsqueda filtra los hoteles aprobados y muestra los resultados en una página dedicada.

## Criterios de aceptación (BDD)

### Escenario 1: Búsqueda exitosa con departamento seleccionado
**Dado** que el visitante está en la página de inicio  
**Cuando** selecciona un departamento, fechas de llegada y salida, y número de huéspedes  
**Entonces** se muestra la página de resultados con los hoteles aprobados de ese departamento

### Escenario 2: Búsqueda sin departamento muestra error
**Dado** que el visitante está en la página de inicio  
**Cuando** presiona "Buscar hoteles" sin seleccionar un departamento  
**Entonces** se muestra un mensaje de error: "Selecciona un departamento para comenzar tu búsqueda"

### Escenario 3: Fechas inválidas muestran error
**Dado** que el visitante está en la página de inicio  
**Cuando** selecciona una fecha de salida igual o anterior a la de llegada  
**Entonces** se muestra un mensaje de error indicando que las fechas son inválidas

### Escenario 4: Búsqueda con filtro de municipio
**Dado** que el visitante selecciona un departamento  
**Cuando** elige un municipio específico del departamento  
**Entonces** los resultados se filtran por ese municipio

### Escenario 5: Hoteles aprobados son visibles
**Dado** que existen hoteles con estado "aprobado", "pendiente" y "rechazado"  
**Cuando** se realiza una búsqueda  
**Entonces** solo se muestran los hoteles con estado "aprobado"

## MoSCoW

- **Must Have:** Selector de departamento, fechas de llegada/salida, huéspedes, botón buscar.
- **Should Have:** Selector de municipio (dependiente del departamento), validación de fechas.
- **Could Have:** Búsqueda por texto libre, autocompletado.
- **Won't Have:** Búsqueda por mapa geográfico, filtros avanzados (precio, capacidad).

## Notas de implementación

- Formulario en `src/pages/Home.tsx` (sección hero).
- Datos de departamentos y municipios en `src/data.ts`.
- Navegación a `src/pages/Results.tsx` con parámetros de búsqueda.
- Filtro de hoteles aprobados: `hoteles.filter(h => h.aprobado === "aprobado")`.
