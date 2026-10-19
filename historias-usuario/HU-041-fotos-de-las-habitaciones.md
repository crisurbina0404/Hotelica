# HU-041 — Fotos de las habitaciones

**Módulo:** Gestión Hotel
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 8
**Interfaz:** tarjeta de cada habitación en `src/pages/HotelPanel.tsx` y sección de habitaciones en `src/pages/HotelDetail.tsx`

## Redacción estándar

> Como **administrador de hotel**, quiero **subir fotos a cada tipo de habitación** para **que el turista vea cómo es la habitación antes de reservar, no solo el hotel entero**.

## Contexto

Hasta ahora las fotos viven solo al nivel del hotel (HU-025): una portada y una galería
que muestran las instalaciones generales. Las habitaciones, en cambio, se ofrecen como
una línea de texto con ícono: el turista ve "Doble · hasta 2 huéspedes · C$ 1,300" pero
no puede imaginarse si es un cuarto amplio o angosto, si tiene vista, si la cama es
grande. Eso genera dudas y reservas a ciegas.

La HU-025 dejó esto afuera a propósito ("una galería por habitación: fuera de alcance"),
así que esta historia es la que completa el circuito. Se apoya en lo ya construido:
la misma validación de archivos, la misma optimización de imágenes y el mismo patrón
de galería con portada, aplicados esta vez **por tipo de habitación**.

Reglas de negocio de esta historia:

1. **Cada tipo de habitación tiene su propia galería** (el campo `galeria` de la
   habitación), separada de la del hotel.
2. **La primera foto de la galería es la portada** de esa habitación: es la que se ve
   en la tarjeta del panel y en la lista que ve el turista (misma convención que HU-025).
3. **Formatos y peso:** JPG, PNG o WEBP de hasta 5 MB, igual que en el hotel.
4. **Hasta 4 fotos por tipo de habitación** (tope menor que el del hotel, porque son
   fotos de un mismo cuarto).
5. **Antes de guardar, cada foto se optimiza** a un máximo de 1280 px de ancho y se
   guarda como JPEG (misma función `optimizarFoto()` de la HU-025).
6. **Las fotos son opcionales:** una habitación sin fotos se muestra como hasta ahora
   (ícono de cama); nadie está obligado a subir ninguna.
7. **Mientras el hotel está Pendiente** no se puede tocar la galería de las habitaciones,
   igual que el resto de la gestión (HU-022 a HU-025).
8. **La galería viaja a la base de datos** junto con la habitación (Fase 2), así que en
   cualquier computadora se ven las mismas fotos.

## Criterios de aceptación (BDD)

### Escenario 1: Subir fotos a una habitación
**DADO** que el hotelero tiene una habitación registrada y aprobado su hotel
**CUANDO** pulsa "Fotos" en la tarjeta de esa habitación y sube una imagen JPG, PNG o WEBP de menos de 5 MB
**ENTONCES** la foto aparece en la galería de la habitación, optimizada, y la primera queda como portada visible en la tarjeta

### Escenario 2: Archivo inválido o galería llena
**DADO** que el hotelero elige un archivo que no es imagen, una imagen de más de 5 MB, o la habitación ya tiene 4 fotos
**CUANDO** intenta subirla
**ENTONCES** el sistema no agrega nada y le dice por qué (formato, peso o que llegó al máximo)

### Escenario 3: Elegir la portada
**DADO** que la habitación tiene varias fotos
**CUANDO** el hotelero pulsa "Usar como portada" en una miniatura
**ENTONCES** esa foto pasa al primer lugar y el turista la ve en la lista de habitaciones del hotel

### Escenario 4: Quitar una foto
**DADO** que la habitación tiene dos o más fotos y el hotelero quiere quitar una
**CUANDO** la quita
**ENTONCES** la foto desaparece de la galería; si quiere quitar la última, el sistema se lo permite porque las fotos de habitación son opcionales

### Escenario 5: El turista ve la habitación con fotos
**DADO** que el hotelero subió fotos a varios tipos de habitación
**CUANDO** un turista abre el detalle del hotel
**ENTONCES** cada habitación muestra su portada junto a la información (tipo, capacidad, precio) y, al abrirla para reservar, puede ver las demás fotos de esa habitación

### Escenario 6: Habitación sin fotos
**DADO** que el hotelero nunca subió fotos a una habitación
**CUANDO** el turista ve la lista de habitaciones
**ENTONCES** esa habitación se muestra con el ícono de cama de siempre, sin casilleros rotos ni imágenes vacías

### Escenario 7: Solo se edita si el hotel está aprobado
**DADO** que el hotel tiene estado **Pendiente**
**CUANDO** el hotelero está en su panel
**ENTONCES** las fotos de las habitaciones se ven, pero el campo de subida y los botones están deshabilitados con el aviso de esperar la aprobación

## MoSCoW

- **Must Have:** galería por tipo de habitación con portada; subir, elegir portada y quitar fotos con la misma validación que el hotel; portada visible en la lista del turista; fotos opcionales.
- **Should Have:** optimización de cada foto; tope de 4 fotos por habitación; bloqueo mientras el hotel está Pendiente; galería navegable al abrir la habitación para reservar; subida a la base de datos.
- **Could Have:** copiar las fotos del hotel a todas las habitaciones de un solo clic; pie de foto; recortar.
- **Won't Have:** videos; galería por unidad física (todas las "Doble" comparten la misma galería); fotos por huésped o por reserva.

## Notas de implementación

- **Tipo y datos:** `Habitacion` y `DatosHabitacion` ganan el campo `galeria: string[]` en `src/data.ts`; el tope se llama `MAXIMO_FOTOS_HABITACION` y el error con `errorDeGaleriaHabitacion()` (subtarea HOTELICA-262).
- **Gestión en el panel:** en la tarjeta de cada habitación (HU-023) se agrega el botón "Fotos" con la misma interfaz de miniaturas que ya usa la galería del hotel: subir, portada y quitar (subtarea HOTELICA-263).
- **Turista:** en `src/pages/HotelDetail.tsx` la tarjeta de cada habitación muestra su portada y, al elegir la habitación, se dejan ver las fotos de esa galería (subtarea HOTELICA-264).
- **Base de datos (Fase 2):** la tabla `habitaciones` necesita la columna `galeria` (jsonb, por defecto `[]`); el usuario corre el script en el Dashboard como en la Fase 2, y `src/sync.ts` mapea la columna nueva (subtarea HOTELICA-265).
- **Reutilización:** se reutilizan `optimizarFoto()`, `validarImagenHotel()` y el patrón de miniaturas de la HU-025 sin copiar lógica nueva (subtarea HOTELICA-266).
