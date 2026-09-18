# HU-009 — Consultar detalles del hotel

**Módulo:** Búsqueda y consulta  
**Prioridad:** Alta  
**Estado:** ✅ Terminada  
**Sprint:** 2  
**Estimación:** 5 Story Points  
**Interfaz:** HotelDetail

## Redacción estándar

> Como **turista**, quiero **ver la información detallada de un hotel específico** para **evaluar si cumple con mis expectativas antes de reservar**.

## MoSCoW (detallado)

### Must Have (Debe tener)
- Nombre, descripción, ubicación y calificación promedio
- Galería de imágenes principales
- Lista de amenidades/servicios disponibles

### Should Have (Debería tener)
- Mapa estático de ubicación
- Políticas del hotel (check-in/out, mascotas, etc.)
- Información de contacto directa

### Could Have (Podría tener)
- Tour virtual 360°
- Reseñas destacadas de usuarios
- Video promocional del hotel

### Won't Have (No tendrá por ahora)
- Chat en vivo con el hotel
- Integración con clima local en tiempo real
- Realidad aumentada para visualizar habitaciones

## Criterios de aceptación (BDD)

### Escenario 1: Ver detalles del hotel seleccionado
**DADO QUE** el turista seleccionó un hotel de la lista de resultados  
**CUANDO** accede a la página de detalles  
**ENTONCES** el sistema debe mostrar nombre, descripción, ubicación, servicios, fotos y calificación promedio

### Escenario 2: Hotel desactivado o eliminado (Edge Case)
**DADO QUE** el hotel fue desactivado o eliminado después de aparecer en la búsqueda  
**CUANDO** el turista intenta acceder a sus detalles  
**ENTONCES** el sistema debe mostrar un mensaje indicando que el hotel ya no está disponible

### Escenario 3: Galería de imágenes
**DADO QUE** el turista está en la página de detalles del hotel  
**CUANDO** observa la galería de imágenes  
**ENTONCES** ve al menos 3 fotos del hotel con efecto hover de zoom

### Escenario 4: Lista de amenidades
**DADO QUE** el turista está en la página de detalles del hotel  
**CUANDO** observa la sección de servicios  
**ENTONCES** ve todas las amenidades disponibles con iconos descriptivos

### Escenario 5: Calificación y reseñas
**DADO QUE** el turista está en la página de detalles del hotel  
**CUANDO** observa la calificación  
**ENTONCES** ve el promedio de estrellas, cantidad de reseñas y distribución por estrellas


## Notas de implementación

- Componente: `src/pages/HotelDetail.tsx`
- Ruta: `{ nombre: "hotel"; id: string }` en `src/rutas.ts`
- Galería: usa `hotel.galeria` (array de URLs de imágenes)
- Amenidades: usa `hotel.amenidades` con iconos en `IconoAmenidad()`
- Reseñas: se filtran por `hotel.id` desde `resenas` del store
- Mapa: SVG estilizado con patrón de malla y pin de ubicación
- Edge case: verifica `!hotel` y muestra mensaje de error
