# 🎫 HISTORIA DE USUARIO

| Campo | Detalle |
|---|---|
| ID | HU-002 |
| Título Corto | Ver habitaciones disponibles de un hotel |
| Épica / Módulo | Detalle de hotel |
| Prioridad | Alta |
| Estimación | 3 Story Points |
| Estado | ⬜ Escrita / 🟡 En desarrollo / ✅ Terminada |

## 1. REDACCIÓN ESTÁNDAR
**COMO** turista que encontró un hotel en los resultados
**QUIERO** ver una página de detalle con la información completa del hotel y la lista de sus habitaciones con disponibilidad
**PARA** decidir qué habitación reservar antes de continuar con la reserva

## 2. CONTEXTO Y DETALLES
- Dependencias: **HU-001** (se accede clickeando una tarjeta de resultado). Es base para **HU-003** (modal de reserva con cálculo de total).
- Esta HU **no depende de una base de datos**: los datos salen del arreglo `HOTELS` en `src/js/busqueda.js`. La disponibilidad se calcula en memoria con la fórmula `total − ocupadas` (sin mantenimiento por ahora). No se persiste nada.
- Reglas de negocio:
  - Solo se accede a hoteles con `estado_hotel = 'Aprobado'` (los mismos que aparecen en los resultados).
  - Disponibilidad por habitación: `total_unidades − ocupadas` (≥ 0). Si todas las unidades están ocupadas, la habitación se muestra como "Sin disponibilidad" y su botón de reserva queda deshabilitado.
  - Precio "desde" del hotel = precio_por_noche más bajo entre sus habitaciones (consistente con la tarjeta de HU-001).
  - Mantenimiento: en esta fase el campo `mant` no descuenta disponibilidad (se simplifica, ya que no hay BD).
  - El número de noches y huéspedes llegan del buscador de HU-001 (fechas `f-in`/`f-out` y `f-guests`); si el turista no completó fechas, se ofrecen valores por defecto (hoy/mañana, 2 huéspedes).

- UI propuesta (página/vista de detalle), conservando la marca (botones sólidos, íconos Lucide, sin emojis):
  - **Encabezado del hotel**: nombre, ubicación (ciudad + dept) con `map-pin`, calificación con `star` + cantidad de reseñas, etiquetas, y botón de favoritos (`heart`) reutilizando el de la tarjeta.
  - **Galería / escena principal**: se reutiliza la ilustración SVG `scene(h.scene)` del hotel a gran tamaño.
  - **Descripción**: párrafo `h.desc`.
  - **Bloque "Tu búsqueda"**: recap de Llegada / Salida / Huéspedes / Noches (editable).
  - **Lista de habitaciones**: una tarjeta por habitación con:
    - Tipo de habitación (`r.tipo`).
    - Capacidad (hasta N huéspedes) con ícono `users`.
    - Precio por noche (`$r.precio`) con ícono de billete/etiqueta.
    - Disponibilidad: "X habitaciones disponibles" en color teal si hay, o "Sin disponibilidad" en rojo si es 0.
    - Botón principal **"Reservar"** (flame) que abre el modal de HU-003 (en esta HU queda como placeholder → toast "Próximamente"лаго). Deshabilitado si no hay disponibilidad.
  - **Botón "Volver a resultados"** (ghost) que regresa a `#hoteles`.
  - El detalle se renderiza al hacer clic en una tarjeta de HU-001.

- Navegación:
  - Como NO hay rutas (Fase 1), el detalle se muestra reemplazando el contenido de la sección de resultados (o en una vista dedicada dentro del mismo `index.html`), con un botón "Volver a resultados" que re-renderiza el grid de HU-001.
  - En móvil, la lista de habitaciones se apila verticalmente.

## 3. CRITERIOS DE ACEPTACIÓN (BDD)

**Escenario 1: Flujo exitoso con disponibilidad**
- DADO QUE el turista hace clic en una tarjeta de hotel aprobado (ej: "Hotel Plaza Colón")
- CUANDO se abre el detalle del hotel
- ENTONCES la vista muestra nombre, ubicación, calificación, etiquetas, descripción y una lista de sus habitaciones, cada una con tipo, capacidad, precio por noche y la cantidad de unidades disponibles (`total − ocupadas`); el botón "Reservar" queda habilitado en las habitaciones con disponibilidad.

**Escenario 2: Habitación sin disponibilidad**
- DADO QUE el detalle muestra una habitación con `total − ocupadas = 0`
- CUANDO el turista la ve
- ENTONCES esa habitación se muestra con el texto "Sin disponibilidad" en color rojo y el botón "Reservar" aparece deshabilitado (no se puede avanzar a HU-003 desde ahí).

**Escenario 3: Recap de la búsqueda**
- DADO QUE el turista llegó al detalle desde el buscador con fechas y huéspedes cargados
- CUANDO mira el bloque "Tu búsqueda"
- ENTONCES se muestran Llegada, Salida, Huéspedes y el número de noches calculado; si no cargó fechas, se usan los valores por defecto sin romper la vista.

**Escenario 4: Volver a resultados**
- DADO QUE el turista está en el detalle
- CUANDO presiona "Volver a resultados"
- ENTONCES el sistema vuelve a mostrar el grid de hoteles de HU-001 con los filtros anteriores activos, sin recargar la página.

**Escenario 5: Botón Reservar (puente a HU-003)**
- DADO QUE el turista presiona "Reservar" en una habitación con disponibilidad
- CUANDO se ejecuta la acción
- ENTONCES se muestra un toast "Próximamente: reserva" (placeholder de HU-003, que abrirá el modal con el cálculo del total). En esta HU no se implementa el modal todavía.

## 4. CHECKLIST INVEST
- [x] Independiente
- [x] Negociable
- [x] Valiosa
- [x] Estimable
- [x] Pequeña (cabe en un Sprint)
- [x] Testeable
