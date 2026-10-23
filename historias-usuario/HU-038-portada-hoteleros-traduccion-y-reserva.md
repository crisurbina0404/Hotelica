# HU-038 — Rediseño de portada: fotos reales, tarjeta de hoteleros, cifras vivas, reserva con registro e idioma automático

**Módulo:** Diseño (oficio visual) / Portada
**Prioridad:** Alta (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 6
**Interfaz:** portada (`src/pages/Home.tsx`), formulario de inscripción (`src/pages/InscribeHotel.tsx`), navbar (`src/layout.tsx`), store (`src/store.tsx`), detalle del hotel (`src/pages/HotelDetail.tsx`) y `index.html`

## Redacción estándar

> Como **turista**, quiero **ver destinos reales de Nicaragua y cifras que correspondan a datos reales** para **confiar en lo que la plataforma muestra**. Y como **hotelero**, quiero **encontrar "Registra tu hotel ahora" en un solo clic desde la portada y saber qué pasa al enviar** para **inscribir mi hotel sin buscar el formulario por la página**.

## Contexto

La portada acumula seis fallos visuales y funcionales detectados en la revisión: las tarjetas de departamento son degradados genéricos con silueta; la tarjeta "Para hoteleros" duplica la invitación con un formulario largo al pie de la página; las cifras del hero parecen decorativas; "Reservar" sin sesión abre la reserva en vez del registro; y el sitio ofrece un selector ES/EN propio cuando hoy la traducción la resuelve el navegador.

Con esta historia la portada **muestra fotografías reales de cada departamento** (de uso libre, con crédito), la **tarjeta de hoteleros se convierte en el acceso único** a la inscripción (botón que abre el formulario en ventana flotante, con aviso claro de revisión-corporreo al finalizar), las **cifras del hero se leen de los datos**, **reservar sin sesión lleva al registro**, y el **idioma lo decide el navegador vía Google Traductor** (se elimina el selector propio).

Reglas de negocio de esta historia:

1. **Fotos de uso libre:** cada tarjeta de departamento usa una fotografía real relacionada con él, descargada a `public/destinos/` con su autoría y licencia registrada en `public/destinos/CREDITOS.md`. Solo imágenes de licencia libre (dominio público o CC) de Wikimedia Commons.
2. **Una sola tarjeta para hoteleros:** la portada conserva el llamado superior ("Registra tu hotel ahora") y elimina el formulario embebido al pie. El botón abre el formulario en una ventana flotante (modal con scroll propio).
3. **Aviso de revisión:** al finalizar el formulario, el aviso dice que la solicitud **está en revisión** y que **el resultado llegará al correo** que dejó el dueño.
4. **Iconografía de la tarjeta:** el adorno de la tarjeta de hoteleros es la **silueta de hotel** (`IconoHotel`); se elimina la palmera (`IconoPalmera`) de esa tarjeta.
5. **Cifras vivas:** los números del hero (hoteles familiares, municipios, reseñas) se calculan desde los datos de la aplicación (`aprobados.length`, `MUNICIPIOS.length`, `resenas.length`); no hay cifras escritas a mano.
6. **Reservar exige cuenta:** si el visitante toca "Reservar" sin sesión, se abre la pantalla de registro; con sesión, se abre la reserva como hasta ahora. El guardia interno de la reserva sigue funcionando como red de seguridad.
7. **Sin selector de idioma:** se eliminan los botones ES/EN del navbar (escritorio y celular) y la persistencia del idioma propio. La página española de origen.
8. **Traducción automática del navegador:** `index.html` carga Google Traductor con `pageLanguage: "es"`; si el navegador anuncia otro idioma (inglés, francés, alemán, portugués o italiano), una cookie `googtrans` hace que la página se traduzca sola al cargar. El widget se mantiene oculto: no queda ningún selector visible, porque el idioma lo decide el navegador.

## Criterios de aceptación (BDD)

### Escenario 1: Cada tarjeta de destino muestra una foto real del departamento
**Dado** que un visitante abre la portada
**Cuando** revisa la sección "Destinos que enamoran"
**Entonces** cada departamento aparece con una fotografía real suya (no un degradado), con un velo oscuro que deja legible el texto y con los créditos de la foto disponibles en el repositorio

### Escenario 2: Una sola tarjeta para hoteleros con botón que abre el formulario
**Dado** que un hotelero entra a la portada
**Cuando** lee la tarjeta "Registra tu hotel ahora" y pulsa su botón
**Entonces** se abre el formulario de inscripción en una ventana flotante, completo (con mapa y consulta de estado), y la tarjeta de inscripción que había al pie de la página ya no existe

### Escenario 3: Al finalizar, el aviso habla de revisión y correo
**Dado** que el hotelero completa el formulario en la ventana flotante
**Cuando** pulsa "Finalizar solicitud"
**Entonces** ve el aviso de que su solicitud **está en revisión** y que **el resultado le aparecerá en su correo electrónico**

### Escenario 4: La tarjeta de hoteleros muestra silueta de hotel
**Dado** que se mira la tarjeta de hoteleros de la portada
**Cuando** se observa su adorno visual
**Entonces** hay una silueta de hotel y ya no aparece la palmera

### Escenario 5: Las cifras del hero salen de los datos
**Dado** que la portada muestra "X hoteles familiares · Y municipios · Z reseñas de viajeros"
**Cuando** los datos cambian (aprueba un hotel, se registra una reseña)
**Entonces** las tres cifras reflejan el cambio: corresponden al número real de hoteles aprobados, del catálogo de municipios y de reseñas existentes

### Escenario 6: Reservar sin sesión abre la pantalla de registro
**Dado** que un visitante sin sesión abre un hotel
**Cuando** pulsa "Reservar" en una habitación disponible
**Entonces** se abre la pantalla de registro (no la de reserva); si ya tiene sesión, "Reservar" abre la reserva normal
**Y** puede cerrarla con la X, Escape o el fondo y seguir viendo la ficha del hotel sin registrarse

### Escenario 7: Ya no hay selector de idioma
**Dado** que un visitante usa el navbar en escritorio o el menú en celular
**Cuando** busca cambiar el idioma
**Entonces** no existen los botones "ES/EN" ni "Ver en inglés"; el sitio se muestra en español

### Escenario 8: El navegador traduce automáticamente
**Dado** que el navegador del visitante está configurado en un idioma distinto del español
**Cuando** abre Hotelica
**Entonces** la página se traduce sola con Google Traductor, y el aviso de Google permite volver al español si el visitante lo prefiere

## MoSCoW

- **Must Have:** fotos reales de licencia libre por departamento con créditos; tarjeta única "Registra tu hotel ahora" con botón que abre el formulario en ventana flotante; eliminación de la tarjeta inferior; aviso de revisión-corporreo al finalizar; silueta de hotel sin palmera; cifras del hero calculadas desde los datos; "Reservar" sin sesión abre el registro; sin selector de idioma; traducción automática con Google Traductor.
- **Should Have:** consulta de estado disponible dentro de la ventana flotante; aviso al abrir el registro ("creá tu cuenta para reservar"); imágenes optimizadas (~1200 px) para que la portada cargue rápido.
- **Could Have:** precarga de la foto del primer departamento; traducción de los avisos flotantes (toasts).
- **Won't Have:** sistema de traducción propio con selector (se retira); diccionarios completos ES/EN mantenidos a mano; traducción sin conexión.

## Notas de implementación

- **Fotos:** descarga desde Wikimedia Commons a `public/destinos/{granada,leon,rivas,managua,masaya,esteli,matagalpa,caribe}.jpg` + `public/destinos/CREDITOS.md` con autor, licencia y fuente de cada imagen (subtarea HOTELICA-243).
- **Tarjetas de destino:** `GRADIENTES` y `SiluetaDepto` dejan de usarse en la portada; la tarjeta pasa a `<img>` con `object-cover` + velo `from-ink/…` y conserva badge de hoteles, nombre, municipios y "Explorar →" (subtarea HOTELICA-244).
- **Tarjeta de hoteleros:** titular "Registra tu hotel ahora", botón "Registrar mi hotel" y `Modal` local en la portada con `<InscribeHotel enVentana />`; se elimina el `<InscribeHotel />` del pie (subtarea HOTELICA-245).
- **InscribeHotel `enVentana`:** cuando está en la ventana flotante ajusta su contenedor (sin `pt-24` de sección, sin ancho de página) y renombra el botón a "Finalizar solicitud"; el aviso de éxito comunica revisión y correo (subtarea HOTELICA-246).
- **Store:** se agrega el estado del modal de registro (`abrirRegistro` / `cerrarRegistro`) accesible desde cualquier pantalla; se retiran `cambiarIdioma` y la persistencia `hotelica-idioma`, forzando español (subtarea HOTELICA-247). `registroAbierto` debe estar en las dependencias del `useMemo` del contexto; si falta, el modal no abre desde "Registrarse" y la X no lo cierra.
- **Navbar y detalle:** la navbar consume el estado del registro del store; el botón "Reservar" abre el registro cuando no hay sesión, con un aviso que explica por qué (subtarea HOTELICA-248).
- **Traducción:** `index.html` carga el elemento de Google Traductor y, si `navigator.language` no es español, escribe la cookie `googtrans=/es/<idioma>` antes de cargarlo; el contenedor del widget va oculto, de modo que no queda ningún selector a la vista (subtarea HOTELICA-249).
- **Modales:** `Modal` en `src/ui.tsx` se renderiza con `createPortal` al `body`. El header tiene `backdrop-blur`, y eso lo convertía en el contenedor de los elementos `fixed`: la ventana flotante quedaba recortada a los 64 px de la barra. Sin portal, el formulario de inscripción y el registro abiertos desde "Reservar" se veían cortados (subtarea HOTELICA-250).
- **Verificación:** `typecheck`, `build` y revisión manual en el navegador (escritorio 1440 px y celular 390 px) sobre `localhost:3000`; el repositorio no tiene pruebas automatizadas (subtarea HOTELICA-251).