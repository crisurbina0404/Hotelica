# HU-025 — Subir fotografías

**Módulo:** Gestión Hotel
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 4
**Interfaz:** sección "Fotografías del hotel" en `src/pages/HotelPanel.tsx`

## Redacción estándar

> Como **administrador de hotel**, quiero **subir y ordenar las fotografías de mi hotel** para **mostrarle al turista cómo son las habitaciones, el patio y las instalaciones antes de reservar**.

## Contexto

El catálogo ya guarda las fotos de cada hotel en dos lugares que hasta ahora solo llenaba
la semilla de demostración: `imagen` (la **portada**, la que se ve en las tarjetas de los
resultados y en la portada del panel) y `galeria` (el arreglo completo, donde la primera
posición es siempre esa misma portada). El turista las ve en el detalle del hotel, pero un
hotelero nuevo no tenía forma de subir ni de cambiar ninguna: la HU-022 lo dejó
explícitamente afuera ("edición de la imagen representativa: es la HU-025").

Con esta historia el hotelero abre la sección **"Fotografías del hotel"** y trabaja con su
galería: sube fotos nuevas, elige cuál manda como portada y quita las que ya no quiere.
La portada sigue siendo la **primera foto de la galería**, así que elegir portada es mover
esa foto al primer lugar y el turista ve el cambio en las búsquedas sin ningún paso extra.

Reglas de negocio de esta historia:

1. **Formatos y peso:** JPG, PNG o WEBP de hasta 5 MB por archivo (la misma regla del
   registro de hoteles).
2. **Hasta 6 fotos por hotel.** Es un tope de la maqueta, que guarda todo en el navegador.
3. **Antes de guardar, cada foto se optimiza:** se reescala a un máximo de 1280 px de ancho
   y se guarda como JPEG. Sin esto, unas pocas fotos de celular llenarían el almacenamiento
   del navegador y la plataforma dejaría de poder guardar.
4. **El hotel nunca se queda sin fotos:** la última no se puede quitar.
5. **Mientras el hotel está Pendiente** no se puede tocar la galería, igual que el resto de
   su información (HU-022, HU-023 y HU-024).

## Criterios de aceptación (BDD)

### Escenario 1: Ver las fotos que ya tiene el hotel
**Dado** que el hotelero está en su panel del hotel
**Cuando** abre la sección "Fotografías del hotel"
**Entonces** ve su portada destacada, el resto de las fotos en miniatura y cuántas lleva del máximo permitido

### Escenario 2: Subir una foto válida
**Dado** que el hotelero elige una imagen JPG, PNG o WEBP de menos de 5 MB
**Cuando** la sube
**Entonces** la foto aparece en su galería, se ve que quedó optimizada y recibe una confirmación

### Escenario 3: Archivo inválido o galería llena
**Dado** que el hotelero elige un archivo que no es imagen, una imagen de más de 5 MB, o ya tiene 6 fotos
**Cuando** intenta subirla
**Entonces** el sistema no agrega nada y le dice por qué (formato, peso o que llegó al máximo)

### Escenario 4: Elegir la portada
**Dado** que el hotelero tiene varias fotos y quiere destacar otra
**Cuando** pulsa "Usar como portada" en una de las miniaturas
**Entonces** esa foto pasa al primer lugar, la anterior vuelve a la galería y el turista ve la nueva portada en las tarjetas de los resultados

### Escenario 5: Quitar una foto
**Dado** que el hotelero ya no quiere una de sus fotos
**Cuando** la quita
**Entonces** la foto desaparece de la galería; si intenta quitar la última, el sistema no la borra y le avisa que el hotel necesita al menos una foto

### Escenario 6: El turista ve las fotos, también en el celular
**Dado** que el hotelero subió varias fotos
**Cuando** un turista abre el detalle del hotel
**Entonces** ve la portada en grande, puede cambiar la foto principal desde las miniaturas y, en el celular, la tira de miniaturas le deja ver todas las fotos, no solo la primera

### Escenario 7: Solo se edita si el hotel está aprobado
**Dado** que el hotel tiene estado **Pendiente**
**Cuando** el hotelero está en su panel
**Entonces** las fotos se ven, pero el campo de subida y los botones de portada y quitar están deshabilitados, con el aviso de que debe esperar la aprobación

## MoSCoW

- **Must Have:** subir fotos con validación de formato y peso; ver la galería con su portada; elegir portada; quitar fotos; la portada nueva se ve en las tarjetas de búsqueda y la galería completa en el detalle del turista.
- **Should Have:** optimizar cada foto antes de guardarla; tope de 6 fotos por hotel; aviso claro cuando el almacenamiento del navegador se llena; galería navegable desde el celular; bloqueo de la edición mientras el hotel está Pendiente.
- **Could Have:** reordenar las fotos arrastrando, pie de foto por imagen, recortar la portada.
- **Won't Have:** subir videos, fotografías por tipo de habitación (una galería por habitación), almacenamiento en un servicio externo (en la maqueta las fotos viajan dentro de los datos del navegador).

## Notas de implementación

- **Límite y nombre del tope:** `MAXIMO_FOTOS` y `errorDeGaleria()` en `src/data.ts`, junto a la regla que ya existe para validar un archivo de imagen (`validarImagenHotel()`) (subtarea HOTELICA-225).
- **Portada y orden:** `conPortada()` en `src/data.ts` devuelve la galería con la foto elegida en el primer lugar; el estado guarda la portada en `galeria[0]` y la copia en `imagen`, que es lo que leen las tarjetas y la cabecera del panel (subtarea HOTELICA-226).
- **Optimización:** `src/imagen.ts` reescala la foto en un `canvas` (máximo 1280 px de ancho) y la devuelve como JPEG, con aviso si el navegador no la puede leer (subtarea HOTELICA-227).
- **Acciones:** `agregarFotoHotel()`, `ponerPortadaHotel()` y `quitarFotoHotel()` en `src/store.tsx`, las tres validando antes de tocar el estado y devolviendo el motivo cuando no corresponde (subtarea HOTELICA-228).
- **Espacio del navegador:** el guardado en `localStorage` pasa a tener manejo de error: si el almacenamiento se llena, la app no se rompe y se avisa al usuario (subtarea HOTELICA-229).
- **Interfaz del panel:** sección nueva bajo "Precios del hotel" con el campo de subida múltiple, la portada destacada y las miniaturas con sus botones (subtarea HOTELICA-230).
- **Galería del turista:** en `src/pages/HotelDetail.tsx` la foto principal se puede cambiar desde las miniaturas, con una tira de miniaturas visible en el celular (subtarea HOTELICA-231).
