# HU-043 — Cuerpo de letra en Plus Jakarta Sans

**Módulo:** Diseño (identidad tipográfica)
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 8
**Interfaz:** tokens de tipografía (`src/index.css`), carga de familias (`index.html`), comprobante descargable (`src/pages/BookingModal.tsx`) y correos (`supabase/functions/`)

## Redacción estándar

> Como **visitante de Hotelica**, quiero **leer el texto de la interfaz con una letra más clara en pantallas pequeñas y en tablas**, para **revisar precios, fechas y datos de mi reserva sin esfuerzo**.

## Contexto

El cuerpo de la interfaz venía en **Outfit**, una geométrica que funciona muy bien en titulares y botones grandes, pero que a 13–15 px aprieta las mayúsculas y las cifras: en las tablas del panel del hotel y en las etiquetas de formulario las palabras se leen más juntas de lo que deberían.

Después de comparar seis parejas sobre la interfaz real en el dev server, la elegida es **Plus Jakarta Sans**: mantiene el tono cálido y moderno de la marca, pero tiene una altura de x más generosa y cifras más claras a tamaño pequeño, que es justo donde se leen los montos y las fechas.

Lo que **no** cambia:

1. **Fraunces sigue en los títulos** y en los números grandes (hero, precios, folios).
2. **Libre Baskerville sigue siendo exclusiva del nombre HOTELICA.**
3. La paleta, los tamaños y los pesos de la escala tipográfica quedan igual.

Reglas de negocio de esta historia:

1. **Un solo token:** todo el cuerpo de la interfaz sale de `--font-body`; cambiar de familia no debe tocar componentes.
2. **Respaldo siempre:** si Google Fonts no responde, el texto cae en Segoe UI y luego en la sans del sistema, nunca en una serif.
3. **Los títulos no se tocan:** `--font-display` sigue apuntando a Fraunces.
4. **La marca no se toca:** `--font-brand` sigue apuntando a Libre Baskerville.
5. **Pesos disponibles:** la familia se carga de 400 a 800, que cubre desde el texto normal hasta las negritas de los badges.
6. **Documentos aparte:** el comprobante descargable y los correos declaran su propia pila, así que deben nombrar la misma familia.
7. **Correos sin fuentes web:** los clientes de correo no cargan Google Fonts, así que ahí la familia solo aplica si el sistema la tiene; el respaldo hace el trabajo.

## Criterios de aceptación (BDD)

### Escenario 1: Todo el cuerpo usa la familia nueva (HOTELICA-282)
**Dado** que abro cualquier pantalla de Hotelica
**Cuando** reviso el texto de párrafos, botones, etiquetas y tablas
**Entonces** se dibuja en Plus Jakarta Sans, con Segoe UI como respaldo si la fuente no cargó

### Escenario 2: Los títulos y la marca quedan intactos (HOTELICA-283)
**Dado** que recorro la portada, el panel del hotel y la consola de administración
**Cuando** miro los titulares y el nombre HOTELICA
**Entonces** los titulares siguen en Fraunces y el nombre sigue en Libre Baskerville

### Escenario 3: Las cifras siguen alineadas (HOTELICA-284)
**Dado** que abro una tabla con precios, totales o folios
**Cuando** comparo los montos de una columna
**Entonces** los dígitos conservan el ancho fijo de `.num` y las columnas quedan alineadas

### Escenario 4: El comprobante y los correos usan la misma pila (HOTELICA-285)
**Dado** que descargo el comprobante de una reserva o recibo un correo de Hotelica
**Cuando** reviso el documento
**Entonces** el texto nombra Plus Jakarta Sans con su respaldo, y el nombre de la marca sigue en Libre Baskerville

### Escenario 5: Una sola petición de fuentes (HOTELICA-286)
**Dado** que cargo el sitio con la caché vacía
**Cuando** reviso la petición a Google Fonts
**Entonces** trae Fraunces, Libre Baskerville y Plus Jakarta Sans en una sola llamada, sin pedir Outfit

## MoSCoW

- **Must Have:** cambiar `--font-body` al nuevo token; cargar Plus Jakarta Sans en `index.html`; actualizar el comprobante y los tres correos.
- **Should Have:** actualizar la skill de diseño para que el próximo cambio no vuelva a Outfit.
- **Could Have:** cargar las fuentes desde el propio dominio en vez de Google Fonts; elegir una familia variable local para los correos.
- **Won't Have:** cambiar Fraunces ni Libre Baskerville; tocar la escala de tamaños o los pesos; una tipografía distinta por rol (turista, hotel, admin).

## Notas de implementación

- **Token:** `--font-body` en `src/index.css` pasa a `"Plus Jakarta Sans", "Segoe UI", sans-serif`; las utilidades `font-body` de Tailwind leen el token, así que ningún componente se toca (subtarea HOTELICA-282).
- **Carga:** la URL de `index.html` cambia `Outfit` por `Plus+Jakarta+Sans:wght@400..800`; sigue siendo una sola petición con `display=swap` (subtarea HOTELICA-286).
- **Comprobante:** `src/pages/BookingModal.tsx` declara `--font-body` en su propio `:root` porque es un documento aparte; se actualiza igual (subtarea HOTELICA-285).
- **Correos:** `enviar-correo-reserva`, `enviar-cuenta-hotelero` y `enviar-rechazo-hotelero` cambian la pila del `body`; el respaldo `Segoe UI, Arial` queda igual porque los clientes de correo no cargan fuentes web (subtarea HOTELICA-285).
- **Pruebas:** `npx tsc --noEmit` sin errores; revisión en el dev server a 1280 px y 390 px con Playwright, comprobando la familia computada del `body` y de los `h1`.
