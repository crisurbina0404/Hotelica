# HU-036 — Composición editorial sin el patrón "N pasos"

**Módulo:** Diseño (oficio visual)
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 5
**Interfaz:** sección "Cómo funciona" del inicio (`src/pages/Home.tsx`) y formulario de inscripción de hoteles (`src/pages/InscribeHotel.tsx`)

## Redacción estándar

> Como **visitante de Hotelica** (turista o dueño de hotel), quiero **ver el recorrido de una reserva explicado en prosa y en contexto, sin esquemas numerados genéricos**, para **entender el proceso de un vistazo y sentir que la página está hecha para Hotelica y no para cualquier producto**.

## Contexto

El estudio de señales de diseño genérico (`Estudio-diseno-generico-IA.md`, §1.2) detectó que el patrón "N pasos numerados" —que la guía de diseño prohíbe explícitamente en su §10.1— estaba implementado en dos pantallas:

1. **Inicio**, sección "De la búsqueda a la hamaca": cuatro columnas idénticas con los números `01`–`04` en Fraunces gigante color dorado, un punto por etapa y una línea que las une. Aunque la guía permite una "línea de tiempo horizontal" como alternativa, en pantalla el resultado se lee exactamente igual que el patrón prohibido.
2. **Inscripción de hoteles** (HU-021), al pie del formulario: tres tarjetas numeradas ("Envías la solicitud / El admin la revisa / Recibís tu cuenta") con icono cuadrado teal. Esta era la versión literalmente prohibida, y además **repetía en prosa** lo que el encabezado de la misma sección ya explica.

Esta historia reemplaza ambos por composición editorial: el bloque del inicio se convierte en una mancheta asimétrica (titular y narración a la izquierda, los cuatro momentos del recorrido como índice separado por filetes a la derecha, con sangrías alternadas), y el formulario de inscripción explica el proceso de revisión en una sola frase junto al botón de envío, que es donde el dueño realmente necesita esa información.

Reglas que guían el cambio:

1. **Sin numeración ni columnas iguales** (§10.1 de la guía): nada de `01`, puntos conectora ni N cajas idénticas en fila.
2. **Sin perder información**: los cuatro momentos del recorrido (buscar, comparar, reservar, disfrutar) y el texto que los acompaña siguen presentes, incluida la copia "verificados por nuestro equipo" (§10.5).
3. **Asimetría real**: columnas de distinto ancho y sangrías alternadas en el índice, para que la sección no se lea como retícula uniforme.
4. **El mismo sistema visual**: paleta oficial, Fraunces en títulos, Outfit en cuerpo, animación finita con `prefers-reduced-motion`.

## Criterios de aceptación (BDD)

### Escenario 1: El bloque del inicio ya no se parece al patrón prohibido
**Dado** que un visitante abre el inicio
**Cuando** la sección "De la búsqueda a la hamaca" entra en pantalla
**Entonces** no hay números `01`–`04`, ni cuatro columnas iguales, ni puntos con línea conectora: el titular y su narración quedan a la izquierda y los cuatro momentos del recorrido a la derecha, cada uno separado por un filete

### Escenario 2: El contenido del recorrido se conserva
**Dado** que el visitante lee el bloque
**Cuando** recorre los cuatro momentos
**Entonces** siguen explicándose buscar (departamento, fechas y huéspedes, hoteles verificados por nuestro equipo), comparar (capacidad, disponibilidad real y reseñas), reservar (noches, subtotal e IVA 15% a la vista, sin cargos sorpresa) y disfrutar (check-in, calificar y favoritos)

### Escenario 3: La composición es asimétrica en pantalla ancha
**Dado** que el sitio se ve en escritorio (1024 px o más)
**Cuando** se observa la sección
**Entonces** las dos columnas tienen anchos distintos, el índice derecho alterna sangría entre filas y la sección no se lee como una retícula uniforme

### Escenario 4: La inscripción explica el proceso sin tarjetas numeradas
**Dado** que un dueño de hotel abre el formulario de inscripción
**Cuando** llega al pie del formulario
**Entonces** no hay tres tarjetas numeradas: el proceso de revisión y la entrega de la cuenta de hotelero quedan explicados en una sola frase junto al botón "Enviar solicitud"

### Escenario 5: La información no se pierde al quitar los pasos
**Dado** que el dueño llena el formulario
**Cuando** lee la frase junto al botón de envío
**Entonces** sabe que un administrador del equipo de Hotelica revisa la solicitud y que, si el hotel cumple los requisitos, la cuenta de hotelero le llega por correo

### Escenario 6: Accesibilidad y movimiento
**Dado** que el bloque nuevo se navega con teclado o con lector de pantalla
**Cuando** se recorre
**Entonces** la lista del recorrido sigue siendo una lista semántica con sus títulos, el botón de acción tiene foco visible y la aparición de la sección respeta `prefers-reduced-motion`

### Escenario 7: Se ve bien en celular y en escritorio
**Dado** que el visitante ve el inicio a 360 px
**Cuando** llega a la sección
**Entonces** las dos columnas se apilan en un solo orden de lectura, sin desbordes; a 1280 px la composición asimétrica se mantiene

## MoSCoW

- **Must Have:** quitar el patrón numerado de las dos pantallas; conservar los cuatro momentos del recorrido con su contenido; conservar la explicación del proceso de revisión junto al botón de envío.
- **Should Have:** composición asimétrica con columnas de distinto ancho y sangrías alternadas; lista semántica (`ol`/`h3`); limpieza de componentes e importaciones que quedan sin uso.
- **Could Have:** mover el bloque editorial a otra posición de la página para variar aún más el ritmo vertical.
- **Won't Have:** nuevas animaciones, iconos o colores; tocar el resto del inicio ni el funcionamiento del formulario de inscripción.

## Notas de implementación

- **Inicio:** la sección "CÓMO FUNCIONA" de `src/pages/Home.tsx` pasa a `lg:grid-cols-[0.85fr_1.15fr]`: mancheta a la izquierda (ceja, titular grande, párrafo de narración y CTA "Empezar por la búsqueda" que lleva a resultados) e índice editorial a la derecha (`ol` con filetes `border-t`, verbos en Fraunces "Buscás / Comparás / Reservás / Disfrutás" y sangría `lg:ml-16` en las filas impares) (subtarea HOTELICA-232).
- **Componente sin uso:** `TituloSeccionCentro()` de `src/pages/Home.tsx` se elimina junto con el bloque viejo, y se borran los import de iconos que quedaban sin uso en `src/pages/InscribeHotel.tsx` (`IconoPin`, `IconoOjo`, `IconoLlave` y `TituloSeccion`) (subtarea HOTELICA-233).
- **Inscripción:** las tres tarjetas numeradas del pie del formulario se reemplazan por una frase de prosa en la misma fila que el botón "Enviar solicitud", con el margen izquierdo para que respire en escritorio y se apile en celular (subtarea HOTELICA-234).
- **Verificación:** `typecheck`, `npm run build` y revisión visual en el navegador a 1280 px y 390 px (subtarea HOTELICA-235).
