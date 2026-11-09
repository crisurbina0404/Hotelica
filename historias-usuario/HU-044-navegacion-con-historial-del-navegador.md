# HU-044 — Navegación con el historial del navegador

**Módulo:** Navegación / Experiencia
**Prioridad:** Alta (Must Have)
**Estado:** ✅ Terminada
**Sprint:** 8
**Interfaz:** enrutamiento (`src/App.tsx`), mapa de direcciones (`src/rutas.ts`) y despliegue (`vercel.json`)

## Redacción estándar

> Como **visitante de Hotelica**, quiero **moverme con las flechas de atrás y adelante del navegador y con el botón de retroceder del celular**, para **volver a la pantalla donde estaba sin empezar la búsqueda otra vez**.

## Contexto

Hasta ahora la pantalla actual vivía solo en el estado de React: al cambiar de sección la barra de direcciones seguía en `/`. Eso traía tres problemas:

1. **Las flechas del navegador no hacían nada** o sacaban del sitio, porque no había historial que recorrer.
2. **No se podía compartir ni recargar una pantalla**: al recargar en el detalle de un hotel se volvía a la portada, y mandar el enlace a alguien lo dejaba en el inicio.
3. **El botón de retroceder del celular** cerraba la pestaña en vez de volver a los resultados.

Ahora cada pantalla tiene su propia dirección y el historial del navegador la refleja. Al retroceder se reconstruye la pantalla anterior, con sus filtros, y el scroll vuelve al punto donde estaba.

Reglas de negocio de esta historia:

1. **Una dirección por pantalla:** inicio `/`, resultados `/hoteles`, detalle `/hoteles/:id`, destinos `/destinos`, reservas `/mis-reservas`, favoritos `/favoritos`, perfil `/perfil`, recuperar `/recuperar`, restablecer `/restablecer`, panel `/panel`, consola `/admin`.
2. **Los filtros viajan en la dirección:** departamento, municipio, llegada, salida y huéspedes quedan como parámetros de `/hoteles`, así el enlace reproduce la misma búsqueda.
3. **Atrás y adelante reconstruyen:** cada entrada guarda la pantalla y la posición del scroll; al volver se recupera el mismo punto.
4. **Los permisos mandan:** si la dirección pide una pantalla que el rol actual no puede ver, la app vuelve al inicio y **reescribe** la dirección, sin dejar una entrada rota en el historial.
5. **No se apilan entradas repetidas:** pulsar dos veces el mismo enlace no suma pasos al historial.
6. **El enlace de recuperación sigue funcionando:** el token del correo (`#access_token…` o `?code=`) abre "restablecer" y la dirección se limpia enseguida.
7. **Recargar no rompe nada:** al abrir una dirección directa, la app lee la ruta de la URL; `vercel.json` ya manda todas las rutas a `index.html`.
8. **Las fotos locales se guardan con barra inicial:** en `/hoteles/:id` una ruta relativa como `hoteles/x.jpg` se resolvería bajo `/hoteles/hoteles/`, así que `urlFoto()` la vuelve absoluta.

## Criterios de aceptación (BDD)

### Escenario 1: Cada pantalla deja su dirección (HOTELICA-287)
**Dado** que estoy en la portada
**Cuando** entro a "Explorar hoteles" y abro la ficha de un hotel
**Entonces** la barra de direcciones pasa por `/hoteles` y termina en `/hoteles/:id`

### Escenario 2: Las flechas del navegador funcionan (HOTELICA-288)
**Dado** que navegué de la portada a resultados y al detalle de un hotel
**Cuando** pulso atrás dos veces y luego adelante
**Entonces** vuelvo a resultados, después a la portada, y adelante me devuelve a resultados, con el scroll en el punto donde lo dejé

### Escenario 3: El enlace directo abre la misma pantalla (HOTELICA-289)
**Dado** que abro `/hoteles?departamento=granada&huespedes=3` en una pestaña nueva
**Cuando** carga el sitio
**Entonces** veo los resultados de Granada para 3 adultos, con el filtro aplicado

### Escenario 4: Una pantalla protegida no deja la dirección colgada (HOTELICA-290)
**Dado** que abro `/perfil` o `/admin` sin sesión
**Cuando** carga el sitio
**Entonces** veo el inicio y la barra de direcciones vuelve a `/`, sin pasos rotos en el historial

### Escenario 5: El retroceder del celular vuelve a la pantalla anterior (HOTELICA-291)
**Dado** que estoy en el detalle de un hotel abierto desde resultados
**Cuando** uso el gesto o el botón de retroceder del teléfono
**Entonces** regreso a los resultados con los mismos filtros, en lugar de salir del sitio

### Escenario 6: El enlace de recuperación abre su pantalla (HOTELICA-292)
**Dado** que llego desde el correo con un token de recuperación
**Cuando** carga el sitio
**Entonces** se abre "Restablecer contraseña" y la dirección queda limpia, sin el token a la vista

### Escenario 7: La galería de la ficha carga completa (HOTELICA-293)
**Dado** que abro `/hoteles/h-granada` directamente
**Cuando** termina de cargar la ficha
**Entonces** la portada, las fotos de la galería y las de cada habitación se ven, sin íconos de imagen rota

## MoSCoW

- **Must Have:** direcciones por pantalla; `pushState` al navegar y `popstate` para atrás/adelante; lectura de la ruta al abrir el sitio; redirección con reescritura de la URL en rutas protegidas.
- **Should Have:** filtros de búsqueda en la dirección; restaurar el scroll de cada entrada; no apilar entradas repetidas.
- **Could Have:** título de la pestaña distinto por pantalla; enlaces `<a href>` reales para abrir en pestaña nueva; migas de pan.
- **Won't Have:** router externo (React Router); direcciones por idioma; historial propio dentro de la app.

## Notas de implementación

- **Mapa de direcciones:** `rutaAUrl()` y `urlARuta()` en `src/rutas.ts` traducen entre la ruta interna y la URL; el detalle de hotel usa `/hoteles/:id` y la lista los parámetros de búsqueda (subtarea HOTELICA-287).
- **Estado inicial:** `useState` arranca con `rutaDeEntrada()`, que lee la URL y detecta el token de recuperación antes que nada (subtareas HOTELICA-289 y HOTELICA-292).
- **Navegar:** `navegar()` guarda el scroll de la pantalla que se deja, hace `pushState` con la ruta nueva y sube al inicio; si la dirección no cambia, no suma una entrada (subtareas HOTELICA-288 y HOTELICA-291).
- **Volver:** un `useEffect` escucha `popstate`, lee `evento.state.ruta` (o la URL si no hay estado) y devuelve el scroll guardado en el siguiente cuadro (subtarea HOTELICA-288).
- **Permisos:** el efecto que ya vigilaba las rutas protegidas ahora también reescribe la dirección con `replaceState`, para que no quede `/panel` visible sin sesión (subtarea HOTELICA-290).
- **Recuperación:** el token se limpia con `replaceState` al abrir; `PASSWORD_RECOVERY` de Supabase también reescribe a `/restablecer` (subtarea HOTELICA-292).
- **Fotos:** `src/fotos.ts` devuelve las rutas con barra inicial y `urlFoto()` normaliza lo guardado; el `cargar()` del store lo aplica a hoteles y habitaciones al hidratar, así los guardados viejos también quedan bien (subtarea HOTELICA-293).
- **Pruebas:** `npx tsc --noEmit` sin errores; recorrido con Playwright de portada → resultados → detalle, atrás dos veces, adelante, enlace directo con filtros, `/perfil` sin sesión y `/destinos`. La suite completa quedó en 30 pruebas aprobadas y una falla previa de `CP-026-030`, ajena a esta historia: el test arma las fechas con `toISOString()` (UTC) y la app usa la fecha local, así que después de medianoche la llegada sembrada cae un día después.
