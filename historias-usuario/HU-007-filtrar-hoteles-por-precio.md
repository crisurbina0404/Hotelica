# HU-007 — Filtrar hoteles por precio

**Módulo:** Búsqueda  
**Prioridad:** Media (Should Have)  
**Estado:** ✅ Terminada  
**Sprint:** 1  
**Interfaz:** Results (barra lateral de filtros)

## Redacción estándar

> Como **turista de Hotelica**, quiero **filtrar los resultados de búsqueda por rango de precios** para **encontrar hoteles que se ajusten a mi presupuesto**.

## Contexto

Al buscar hoteles en un departamento, el turista necesita refinar los resultados según su presupuesto. El filtro de precio máximo permite descartar hoteles cuya habitación más económica supera el monto que el turista está dispuesto a pagar por noche.

## Criterios de aceptación (BDD)

### Escenario 1: Filtro de precio está disponible en la barra lateral
**Dado** que el turista está en la página de resultados de búsqueda  
**Cuando** observa la barra lateral de filtros  
**Entonces** ve un control deslizante (slider) de "Precio máximo" con rango de C$ 800 a C$ 3,500

### Escenario 2: Valor del filtro se muestra en tiempo real
**Dado** que el turista ajusta el slider de precio máximo  
**Cuando** mueve el control a una posición  
**Entonces** se muestra el valor seleccionado en formato "C$ {monto}" sobre el slider

### Escenario 3: Filtrado por precio máximo
**Dado** que existen hoteles con precios desde C$ 950 hasta C$ 3,400  
**Cuando** el turista establece el precio máximo en C$ 1,500  
**Entonces** solo se muestran hoteles cuya habitación más económica sea igual o menor a C$ 1,500

### Escenario 4: Sin resultados para el rango seleccionado
**Dado** que el turista establece un precio máximo muy bajo (ej: C$ 800)  
**Cuando** no existen hoteles con precios en ese rango  
**Entonces** se muestra el estado vacío: "Sin resultados por ahora" con opción de limpiar filtros

### Escenario 5: Limpiar filtros restablece el precio
**Dado** que el turista ha ajustado el filtro de precio  
**Cuando** presiona el botón "Limpiar filtros"  
**Entonces** el slider de precio máximo vuelve al valor por defecto (C$ 3,500)

## MoSCoW

- **Must Have:** Slider de precio máximo, valor visible, filtrado en tiempo real.
- **Should Have:** Rango predefinido C$ 800 - C$ 3,500, incrementos de C$ 100.
- **Could Have:** Filtro de precio mínimo, rangos personalizados por el usuario.
- **Won't Have:** Filtrar por rango de fechas de precio, precios dinámicos en tiempo real.

## Notas de implementación

- Slider en `src/pages/Results.tsx` (barra lateral, líneas 147-159).
- Estado: `const [precioMax, setPrecioMax] = useState(3500)`.
- Lógica de filtrado: compara `precioMin(hotelId)` con `precioMax`.
- Función auxiliar `precioMin` calcula el menor precio de habitaciones disponibles del hotel.
- El slider usa `type="range"` con min=800, max=3500, step=100.
