# HU-010 — Consultar habitaciones y precios

**Módulo:** Búsqueda y consulta  
**Prioridad:** Alta  
**Estado:** ✅ Terminada  
**Sprint:** 2  
**Estimación:** 5 Story Points  
**Interfaz:** HotelDetail (sección de habitaciones)

## Redacción estándar

> Como **turista**, quiero **ver las habitaciones disponibles de un hotel con sus precios** para **comparar opciones y elegir la que mejor se adapte a mi necesidad**.

## MoSCoW (detallado)

### Must Have (Debe tener)
- Listado de tipos de habitación disponibles
- Precio por noche claro y desglosado
- Capacidad y amenities por habitación

### Should Have (Debería tener)
- Indicador visual de disponibilidad (colores/etiquetas)
- Comparativa lado a lado de habitaciones
- Fotos específicas por tipo de habitación

### Could Have (Podría tener)
- Calculadora de costos total integrada en la vista
- Vista previa de la habitación en plano
- Descuentos por estancia larga visibles

### Won't Have (No tendrá por ahora)
- Reserva instantánea sin salir de esta vista
- Configurador de habitación personalizado
- Precios dinámicos basados en demanda en tiempo real

## Criterios de aceptación (BDD)

### Escenario 1: Listar habitaciones del hotel
**DADO QUE** el turista está en la página de detalles del hotel  
**CUANDO** consulta la sección de habitaciones  
**ENTONCES** el sistema debe listar cada tipo de habitación con su capacidad, amenities y precio por noche en córdobas

### Escenario 2: Indicador de disponibilidad
**DADO QUE** el turista está en la sección de habitaciones  
**CUANDO** observa cada habitación  
**ENTONCES** ve un indicador visual (badge) que muestra si está disponible, agotada o en mantenimiento

### Escenario 3: Hotel sin habitaciones (Edge Case)
**DADO QUE** el hotel no tiene habitaciones registradas aún  
**CUANDO** el turista consulta la sección de habitaciones  
**ENTONCES** el sistema debe mostrar un mensaje "Este hotel aún no tiene habitaciones disponibles"

## Notas de implementación

- Sección en: `src/pages/HotelDetail.tsx` (líneas 199-276)
- Cada habitación muestra: tipo, detalle, capacidad, unidades, precio
- Badge de disponibilidad: `BadgeHabitacion` con colores por estado
- Filtro por fechas y huéspedes para verificar disponibilidad en tiempo real
- Edge case: mensaje amarillo cuando no hay habitaciones disponibles
