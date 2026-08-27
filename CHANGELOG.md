# CHANGELOG — Hotelica 🇳🇮

Bitácora de avances del proyecto (convención: una entrada por versión).

Las versiones v0.1.0 – v0.3.0 (estructura de carpetas, plantilla de historias
de usuario y base de datos `hotelica.sql`) quedaron registradas en la bitácora
académica del curso.

## [v0.6.0] — 2026-08-02 · Unificación de marca

### Agregado
- Fuente **Libre Baskerville** (400, 700) cargada desde Google Fonts
  en el `<head>`.
- Bloque de marca reutilizable `.brand` (componente `Marca` en
  `src/ui.tsx`): nombre **HOTELICA** en Libre Baskerville 700,
  mayúsculas, teal `#0B3540`, + la frase "Tu destino en Nicaragua"
  en teal `#177E8C` con guiones dorados `#E0A83C` a los lados.
- Splash de entrada con la marca unificada (se desvanece al cargar).
- El bloque de marca ahora aparece en: header, footer, selector de
  rol (acceso de demostración) y pantalla de éxito de la reserva.

### Cambiado
- Ninguna instancia del nombre vuelve a renderizarse con Fraunces:
  la tipografía de la marca es exclusiva de Libre Baskerville.
- Sobre fondos oscuros (header transparente encima del hero y footer)
  el bloque usa su variante invertida `.brand.oscura`; la estructura
  y los guiones dorados se mantienen idénticos.
- Sin cambios de colores de fondo ni de layout: solo tipografía
  de marca.

## [v0.5.0] — 2026-08-02 · Pulido de interfaz turista

### Eliminado
- Banda animada de destinos (marquesina) de la portada: se quitó el HTML,
  los keyframes `marquee` y todo el CSS huérfano. Los destinos no se
  perdieron: siguen alimentando las tarjetas de la sección
  "De la colonia al Caribe, un departamento a la vez".
- Animación infinita Ken Burns de la foto del hero (objetivo sostenible:
  menos CPU/GPU/batería).

### Agregado
- Ocho siluetas SVG inline (una por tarjeta de departamento) en
  `src/siluetas.tsx`, todas con `viewBox="0 0 64 64"`, relleno sólido
  `fill="currentColor"`, sin gradientes ni filtros:
  - Granada → iglesia colonial + isletas del lago
  - León → catedral + volcán Cerro Negro
  - Rivas → volcán Ometepe (dos conos) + playa y sol
  - Managua → skyline + laguna y volcán al fondo
  - Masaya → laguna + cruz y mercado artesanal
  - Estelí → montañas + hoja de tabaco
  - Matagalpa → montañas + rama de café
  - RACCS / Caribe → palmera + cayos y mar
- Cada SVG es accesible: `role="img"` + `aria-label="Silueta de …"`.
- Managua entra al catálogo de departamentos (con sus municipios
  Managua, Tipitapa y Ciudad Sandino) y alimenta buscador y tarjetas.

### Cambiado
- Identidad visual de la maqueta: teal `#0B3540`, dorado `#F7A81B`,
  coral `#F4502C` y fondo crema `#F8F6F0`; tipografías Fraunces
  (títulos) y Outfit (cuerpo).
- `prefers-reduced-motion: reduce` respetado en todas las animaciones
  del sitio (ya no quedan animaciones infinitas en la portada).

## [v0.4.0] — 2026-08-01 · Maqueta funcional (Fase 1)

### Agregado
- Implementación de las 10 historias de usuario (HU-001 → HU-010):
  buscador por destino, resultados con filtros y ordenamiento, detalle
  de hotel con habitaciones, reserva con cálculo (noches, subtotal,
  IVA 15%, total), mis reservas, cancelación, calificación de estadía,
  panel del hotel (confirmar, check-in/out), aprobación de hoteles por
  el administrador y favoritos.
- Datos simulados equivalentes a las tablas de `hotelica.sql`
  (departamentos, municipios, hoteles, habitaciones, reservas, reseñas).
- Persistencia de la sesión de demostración en `localStorage`.
