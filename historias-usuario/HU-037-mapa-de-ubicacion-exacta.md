# HU-037 — Mapa de ubicación exacta del hotel

**Módulo:** Búsqueda / Gestión Hotel
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 5
**Interfaz:** sección "Ubicación" del detalle (`src/pages/HotelDetail.tsx`), formulario de inscripción (`src/pages/InscribeHotel.tsx`), edición del hotel en el panel (`src/pages/HotelPanel.tsx`) y modal de revisión del admin (`src/pages/AdminPanel.tsx`)

## Redacción estándar

> Como **turista**, quiero **ver en un mapa real dónde queda exactamente el hotel** para **saber a qué distancia está de la playa, del parque o de la carretera antes de reservar**. Y como **dueño de hotel**, quiero **marcar la ubicación exacta de mi hotel en un mapa** para **que el huésped llegue sin llamarte preguntando cómo llegar**.

## Contexto

Hasta ahora la "ubicación" del hotel era solo texto: una dirección escrita y un dibujo decorativo. La HU-009 contempló "mapa estático de ubicación" y lo resolvió con un SVG ilustrativo con malla y un pin flotante: bonito, pero no dice dónde está nada. El turista no puede medir distancias reales (¿está frente a la playa o a 20 minutos?), y el hotelero no tiene forma de registrar las coordenadas de su puerta.

Con esta historia Hotelica suma un **mapa real de código abierto**: Leaflet con los tiles de OpenStreetMap, sin API keys ni cuentas de terceros (la HU-006 dejó la *búsqueda* filtrada por mapa como Won't Have; esto es otra cosa: ver la ubicación del hotel ya elegido). El mismo mapa sirve de selector: el dueño ubica el pin donde está la entrada de su hotel, y esa ubicación exacta se guarda con la solicitud y se muestra al turista.

Reglas de negocio de esta historia:

1. **Mapa de código abierto:** Leaflet + OpenStreetMap, con la atribución visible (obligatoria por la licencia de OSM). Sin servicios de pago ni claves de API.
2. **El pin es SVG propio:** el marcador dibuja el `IconoPin` del proyecto con los colores de marca, no las imágenes por defecto de Leaflet.
3. **Ubicación obligatoria desde la inscripción:** el formulario coloca el pin en el centro del municipio elegido apenas se selecciona, y el dueño lo mueve al punto exacto con un clic.
4. **La ubicación tiene que ser de Nicaragua:** latitud entre 10.7° y 15.0° N, longitud entre -87.7° y -83.1° O.
5. **La ubicación tiene que estar en el municipio elegido:** el pin debe quedar a no más de 30 km del centro del municipio declarado; si no, el formulario no se envía. Esto evita hoteles "de Granada" con el pin en Managua.
6. **Hoteles sin coordenadas (datos viejos):** el mapa del detalle abre centrado en el centro del municipio y el sitio no se rompe.
7. **El admin ve el mapa antes de decidir:** la modal de revisión muestra la ubicación exacta que marcó el dueño.
8. **El mapa no atrapa el scroll de la página:** la rueda del mouse hace scroll de la página; el zoom es con los botones del mapa o pellizco, para no dejar al visitante encerrado.

## Criterios de aceptación (BDD)

### Escenario 1: El turista ve el mapa real en el detalle del hotel
**Dado** que un turista abre la ficha de un hotel aprobado
**Cuando** baja hasta la sección "Cómo llegar"
**Entonces** ve un mapa real de OpenStreetMap con el pin del hotel, su dirección al lado y un enlace para abrir esa ubicación en OpenStreetMap

### Escenario 2: El dueño marca la ubicación exacta al inscribir el hotel
**Dado** que un hotelero elige departamento y municipio en el formulario de inscripción
**Cuando** aparece el mapa y hace clic en el punto exacto de la entrada de su hotel
**Entonces** el pin se coloca donde clickeó, se ven las coordenadas y esa ubicación viaja con la solicitud

### Escenario 3: El mapa no se envía sin ubicación ni con ubicación imposible
**Dado** que el hotelero intenta enviar la solicitud
**Cuando** el pin quedó fuera de los límites de Nicaragua o a más de 30 km del municipio que declaró
**Entonces** el formulario no se envía y le explica que debe mover el pin dentro de su municipio

### Escenario 4: El dueño corrige la ubicación desde su panel
**Dado** que el hotelero quiere ajustar el punto exacto de su hotel
**Cuando** abre "Editar información" en su panel y clickea otra posición en el mapa
**Entonces** el pin se mueve, las coordenadas se actualizan y el cambio queda guardado

### Escenario 5: El admin revisa la ubicación antes de aprobar
**Dado** que el administrador revisa una solicitud pendiente
**Cuando** abre la modal "Ver" del hotel
**Entonces** ve el mapa con la ubicación exacta marcada por el dueño, junto con la dirección declarada

### Escenario 6: Un hotel de datos viejos (sin coordenadas) no rompe el mapa
**Dado** que un hotel guardado antes de esta historia no tiene coordenadas
**Cuando** un turista abre su detalle
**Entonces** el mapa se ve igual, centrado en el centro de su municipio, sin errores en consola

### Escenario 7: El mapa respeta la accesibilidad y el rendimiento
**Dado** que un visitante navega con teclado, con poca memoria o con movimiento reducido
**Cuando** el mapa carga en cualquier pantalla
**Entonces** el contenedor tiene etiqueta accesible, los controles del mapa son alcanzables y, con "reducir movimiento" activado, el mapa no anima el encuadre al abrir

## MoSCoW

- **Must Have:** mapa real (Leaflet + OpenStreetMap) en el detalle del hotel con el pin y la atribución visible; selector de ubicación en la inscripción; validación de límites de Nicaragua y de distancia al municipio; edición de la ubicación en el panel del hotel; mapa en la revisión del admin.
- **Should Have:** enlace "Abrir en OpenStreetMap"; caída elegante a centro de municipio cuando el hotel no tiene coordenadas; sin animación de encuadre con movimiento reducido.
- **Could Have:** capa de satélite, medidor de distancias a puntos de interés, geolocalización del visitante para "estás a X km".
- **Won't Have:** búsqueda filtrada por mapa (HU-006 lo dejó fuera); rutas de navegación paso a paso dentro de Hotelica; mapas de Google/Mapbox (servicios de pago).

## Notas de implementación

- **Datos:** `Municipio` gana `centro: { lat, lng }` (el centro de cada municipio del catálogo) y `Hotel` gana `ubicacion?: { lat: number; lng: number }` en `src/data.ts`; los 9 hoteles de la semilla reciben coordenadas reales (subtarea HOTELICA-236).
- **Validación:** `distanciaKm()` (haversine) y `validarUbicacionExacta(ubicacion, municipioId)` en `src/data.ts`, que se suma a `validarRegistroHotel()` (subtarea HOTELICA-237).
- **Componente:** `src/mapa.tsx` con `MapaHotel` (variante "vista" y "selector"): react-leaflet v4 sobre React 18, tiles de OpenStreetMap con atribución, marcador `divIcon` con el SVG del proyecto, `scrollWheelZoom` desactivado para no atrapar el scroll y animaciones apagadas con `prefers-reduced-motion` (subtarea HOTELICA-238).
- **Store:** `registrarHotel()` y `actualizarHotel()` guardan `ubicacion` en el hotel (subtarea HOTELICA-239).
- **Detalle del turista:** la sección "Cómo llegar" reemplaza el SVG decorativo por el mapa real, más el enlace a OpenStreetMap (subtarea HOTELICA-240).
- **Inscripción y panel:** el formulario suma el campo "Ubicación exacta" con el mapa selector, que se auto-coloca en el centro del municipio y muestra las coordenadas con `tabular-nums` (subtarea HOTELICA-241).
- **Admin:** la modal de revisión muestra el mapa con la ubicación del solicitante (subtarea HOTELICA-242).
