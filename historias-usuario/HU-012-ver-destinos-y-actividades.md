# HU-012 — Ver destinos y actividades turísticas

**Módulo:** Búsqueda  
**Prioridad:** Baja (Could Have)  
**Estado:** ✅ Terminada  
**Sprint:** 2  
**Interfaz:** Destinos, Home

## Redacción estándar

> Como **turista de Hotelica**, quiero **explorar destinos turísticos y actividades disponibles en cada departamento** para **planificar mi viaje conociendo qué puedo hacer en cada lugar**.

## Contexto

El turista necesita descubrir qué destinos turísticos existen en cada departamento de Nicaragua y qué actividades puede realizar en cada uno. Esta información complementa la búsqueda de hoteles al ofrecer una experiencia de planificación más completa, mostrando attractions, playas, volcanes, ruinas y otras actividades turísticas.

## Criterios de aceptación (BDD)

### Escenario 1: Ver lista de destinos turísticos
**Dado** que el turista está en la página de destinos  
**Cuando** carga la página  
**Entonces** se muestran todos los destinos turísticos agrupados por departamento con su nombre, descripción e imagen

### Escenario 2: Filtrar destinos por departamento
**Dado** que el turista está en la página de destinos  
**Cuando** selecciona un departamento específico  
**Entonces** se muestran solo los destinos de ese departamento

### Escenario 3: Ver actividades de un destino
**Dado** que el turista selecciona un destino  
**Cuando** hace clic en él  
**Entonces** se muestra el detalle del destino con sus actividades turísticas disponibles

### Escenario 4: Ver actividades disponibles
**Dado** que el turista está en el detalle de un destino  
**Cuando** visualiza la información  
**Entonces** se muestran las actividades categorizadas (aventura, cultura, naturaleza, playa) con descripción y nivel de dificultad

### Escenario 5: Navegar desde home hacia destinos
**Dado** que el turista está en la página de inicio  
**Cuando** hace clic en "Explorar destinos" o en un departamento  
**Entonces** se redirige a la página de destinos con el departamento preseleccionado

## MoSCoW

- **Must Have:** Lista de destinos turísticos, filtrado por departamento, información básica de cada destino.
- **Should Have:** Actividades turísticas categorizadas, nivel de dificultad, imágenes representativas.
- **Could Have:** Mapa conceptual de destinos, ruta sugerida entre destinos.
- **Won't Have:** Reservas de actividades, guías turísticos en tiempo real.

## Notas de implementación

- Datos de destinos turísticos en `src/data.ts` (nuevo array `DESTINOS_TURISTICOS`)
- Nueva página `src/pages/Destinos.tsx` con grid de destinos y filtrado
- Integración con Home.tsx para navegación
- Categorías de actividades: aventura, cultura, naturaleza, playa
- DiseñoResponsive con tarjetas de destinos
