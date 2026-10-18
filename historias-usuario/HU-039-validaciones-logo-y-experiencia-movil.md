# HU-039 — Teléfonos válidos, un solo logo y la experiencia móvil del turista

**Módulo:** Autenticación / Gestión Hotel / Diseño (oficio visual)
**Prioridad:** Alta (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 6
**Interfaz:** formularios de inscripción (`src/pages/InscribeHotel.tsx`), edición del hotel (`src/pages/HotelPanel.tsx`), perfil (`src/pages/Profile.tsx`), datos y reglas (`src/data.ts`), navbar (`src/layout.tsx`), marca (`src/ui.tsx`) y arranque de la app (`src/App.tsx`)

## Redacción estándar

> Como **administrador de la plataforma**, quiero **que todo teléfono guardado sea un número nicaragüense real** para **poder llamar al hotelero o al huésped sin descubrir después que el número no existe**. Y como **visitante que entra desde el celular**, quiero **una portada que arranque bien, un menú que no mueva la página de atrás y solo las opciones del turista** para **no perderme entre funciones que no me corresponden**.

## Contexto

Cuatro hallazgos de la revisión quedaron abiertos después de la HU-038:

1. Los teléfonos aceptaban cualquier cadena de 8 dígitos: entraban números que en Nicaragua no existen (los móviles y fijos empiezan por 2, 5, 7 u 8) y se colaban letras y símbolos al escribir.
2. La barra superior cambiaba a una versión blanca del logo sobre el hero. Al fusionarse con la fotografía, la marca perdía identidad: ahora hay **un solo logo** (el principal), con un **contorno claro fino** que lo separa del fondo.
3. En el celular la maqueta ofrecía el selector de perfil de demostración y los accesos al panel del hotel y a la consola del admin, funciones que no son del turista.
4. La pantalla de carga (splash) usaba un desplazamiento en píxeles fijos para centrar una marca con márgenes transparentes: en celular el logo se salía de la pantalla. Además, al desplegar el menú móvil el contenido de atrás seguía moviéndose.

Reglas de negocio de esta historia:

1. **Teléfono nicaragüense:** exactamente **8 dígitos** y el primero debe ser **2, 5, 7 u 8**. Se admiten espacios y guiones al escribir (se limpian al validar) y el prefijo país `505` es opcional, siempre que el número nacional cumpla la regla.
2. **Sin letras ni símbolos:** los campos de teléfono solo aceptan dígitos; lo demás se descarta mientras se escribe, y no se pueden escribir más de 8.
3. **Una sola validación, tres formularios:** la inscripción del hotel, la edición de su información y el perfil del usuario usan la misma función (`errorTelefonoNicaragua`), con mensajes que dicen qué corregir.
4. **Un solo logo:** la barra usa siempre el logo principal; sobre el hero se le agrega un contorno claro blando y fino (sin cambiar de archivo ni de color). Se retira `Logo-blanco.svg` de la navbar.
5. **Móvil = turista:** por debajo de 1024 px la app solo muestra las pantallas del turista. No hay selector de perfil ni accesos al panel del hotel o a la consola del admin, y esas rutas redirigen al inicio aunque el demo haya quedado en otro rol.
6. **Splash que entra en pantalla:** el logo se corre en proporción a su propio ancho (no en píxeles fijos) y se achica en celular, de modo que queda centrado y sin desborde ni scroll horizontal.
7. **Menú móvil que no arrastra el fondo:** con el menú abierto el body se fija y el contenido de atrás no se mueve; al cerrarlo el scroll vuelve exactamente al mismo lugar (salvo que se haya navegado a otra pantalla, que arranca arriba).

## Criterios de aceptación (BDD)

### Escenario 1: Un teléfono válido se acepta
**Dado** que un hotelero o un usuario escribe su teléfono
**Cuando** ingresa 8 dígitos que empiezan por 2, 5, 7 u 8 (por ejemplo `8888-1234`)
**Entonces** el formulario lo acepta y guarda el número en formato de 8 dígitos

### Escenario 2: Un teléfono inválido se rechaza con el motivo exacto
**Dado** que el teléfono empieza por 1, 3, 4, 6, 9 o 0, o tiene menos de 8 dígitos
**Cuando** se intenta enviar el formulario
**Entonces** no se guarda y el mensaje dice qué falla: “El teléfono debe empezar por 2, 5, 7 u 8” o “El teléfono debe tener exactamente 8 dígitos”

### Escenario 3: El campo filtra lo que no es número
**Dado** que el usuario escribe letras, guiones o espacios en el teléfono
**Cuando** sigue escribiendo
**Entonces** el campo conserva solo los dígitos y se detiene en 8, sin dejar símbolos ni más longitud

### Escenario 4: La marca se lee sobre la fotografía
**Dado** que un visitante abre el inicio y la barra está transparente sobre el hero
**Cuando** mira la marca
**Entonces** ve el logo principal (no la versión blanca) con un contorno claro blando y fino que lo separa de la foto; al bajar y quedar la barra blanca, el contorno desaparece

### Escenario 5: En el celular solo existe el turista
**Dado** que un visitante entra desde el celular
**Cuando** abre el menú
**Entonces** ve inicio, explorar, reservas, favoritos y su cuenta, pero no el selector de perfil, ni el botón del panel del hotel, ni la consola del admin; si la ruta guardada era alguna de esas, se muestra el inicio

### Escenario 6: La pantalla de carga entra centrada
**Dado** que un visitante abre la app desde el celular
**Cuando** aparece el splash de la marca
**Entonces** el logo se ve completo, centrado y sin desbordes ni scroll horizontal

### Escenario 7: El menú móvil no mueve el fondo
**Dado** que el menú móvil está desplegado
**Cuando** el visitante intenta desplazar la página hacia arriba o hacia abajo por detrás del menú
**Entonces** el contenido no se mueve; al cerrar el menú la página sigue en el mismo punto donde estaba

## MoSCoW

- **Must Have:** regla de 8 dígitos que empiezan por 2, 5, 7 u 8 en inscripción, edición del hotel y perfil; filtrado de caracteres en los campos; un solo logo con contorno claro sobre el hero; móvil limitado al módulo turista; splash móvil centrado; scroll del body bloqueado con el menú abierto.
- **Should Have:** mensajes de error específicos por regla; devolver el scroll al cerrar el menú; botón Escape para cerrar el menú.
- **Could Have:** máscara de escritura `8888-8888`; aviso emergente al intentar escribir una novena cifra.
- **Won't Have:** validación con telefonía real (SMS o registro de operadoras); directorio de prefijos por departamento; selector de perfil en celular.

## Notas de implementación

- **`src/data.ts`**: `errorTelefonoNicaragua()` devuelve el motivo o `""`; `esTelefonoNicaragua()` y `soloDigitosTelefono()` se apoyan en ella (recorta a 8 dígitos y descarta lo que no sea número). `validarRegistroHotel()` da el mensaje exacto según la regla incumplida (subtarea HOTELICA-252).
- **`src/pages/InscribeHotel.tsx` y `src/pages/HotelPanel.tsx`**: el campo de teléfono usa `soloDigitosTelefono`, `inputMode="numeric"`, `maxLength={8}` y una ayuda “8 dígitos, empezando por 2, 5, 7 u 8” (subtarea HOTELICA-253).
- **`src/pages/Profile.tsx`**: `validarCampos()` reemplaza la expresión regular genérica por la misma regla nicaragüense (subtarea HOTELICA-254).
- **`src/ui.tsx`**: `Marca` queda con una sola imagen (`Logo.svg`); con `clara` aplica `drop-shadow` en capas para el contorno claro fino, y se retira `LOGOS.completoClaro`. Se agrega el tamaño `splash` (`h-60 sm:h-72`) (subtarea HOTELICA-255).
- **`src/App.tsx`**: `usePantallaMovil()` escucha `(max-width: 1023px)`; en móvil el rol visible es siempre `turista` y las rutas `panel` y `admin` se resuelven al inicio. El splash corre el logo un 26 % de su propio ancho y usa `max-w-none` para que no se encoja (subtarea HOTELICA-256).
- **`src/layout.tsx`**: mientras el menú móvil está abierto se fija el body (`position: fixed` con el desplazamiento guardado) y se devuelve al cerrar; se quitó del menú el selector de perfil y el acceso al panel/consola; el menú tiene alto máximo con scroll propio y cierra con Escape (subtarea HOTELICA-257).
- **Verificación:** `typecheck` y `build` sin errores; pruebas en el navegador sobre `localhost:3000` en escritorio y celular (subtarea HOTELICA-258).
