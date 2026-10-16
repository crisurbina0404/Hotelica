# CHANGELOG — Hotelica 🇳🇮

Bitácora de avances del proyecto (convención: una entrada por versión).

Las versiones v0.1.0 – v0.3.0 (estructura de carpetas, plantilla de historias
de usuario y base de datos `hotelica.sql`) quedaron registradas en la bitácora
del proyecto.

## [v0.48.1] — 2026-10-15 · Arreglado: el selector de perfil vuelve a abrir los paneles

### Arreglado
- **`src/App.tsx`**: elegir el rol **Hotel** o **Admin** en el selector de perfil ya entra a su panel. La protección de rutas revisaba el permiso dentro de `navegar()` con el rol de la pantalla anterior, y como el selector cambia el rol y navega en el mismo clic, esa revisión todavía veía el rol viejo (Turista) y devolvía al inicio. El resultado era que el panel del hotel y la consola de admin quedaban **inalcanzables para la demo** (y para la presentación), porque el único camino que quedaba era una cuenta de hotelero creada por el admin.

### Cambiado
- **`src/App.tsx`**: el permiso ahora se evalúa al renderizar con `puedeVer()`, así que el clic del selector funciona de una y el cambio de rol se aplica sin parpadeo. Los paneles se abren con el rol de demostración que corresponde (rol Hotel → panel del hotel, rol Admin → consola) **sin inventar una sesión**: el turista, las cuentas reales y las pantallas que sí exigen sesión ("Mis reservas" y "Mi perfil") siguen exactamente igual.
- **`src/App.tsx`**: `pantalla()` recibe la ruta que se puede ver, de modo que la pantalla y el enlace activo de la barra siempre coinciden con el permiso vigente.

### Verificado
`typecheck` y `npm run build` sin errores. Prueba manual en el navegador sin sesión: el selector abre el panel del hotel y la consola de admin; al volver al rol Turista se regresa al inicio, y "Mis reservas" sin sesión sigue redirigiendo al inicio.

---

## [v0.48.0] — 2026-10-15 · HU-023: el hotelero registra sus habitaciones

### Agregado
- **`historias-usuario/HU-023-registrar-habitaciones.md`**: historia de usuario del módulo Gestión Hotel, con 6 escenarios BDD y las subtareas HOTELICA-211 a 217 como notas de implementación.
- **`src/data.ts`**: tipos `DatosHabitacion` y `ErroresHabitacion`, la lista `ESTADOS_HABITACION` y la función `validarHabitacion()`: el tipo no puede repetirse dentro del mismo hotel, la capacidad va de 1 a 10 huéspedes, el precio por noche debe ser mayor que cero, las unidades van de 1 a 50 y la descripción de 15 a 200 caracteres.
- **`src/store.tsx`**: `habitaciones` pasa a formar parte de lo que se guarda en el navegador y el panel puede dar de alta tipos de habitación (`agregarHabitacion()`) y sacarlos de venta o ponerlos en mantenimiento (`cambiarEstadoHabitacion()`).
- **`src/pages/HotelPanel.tsx`**: la sección "Habitaciones del hotel" ahora trae el botón "Registrar habitación", un formulario validado que marca en rojo cada campo con error y un selector de estado en cada tarjeta.

### Cambiado
- **`src/pages/HotelDetail.tsx`, `src/pages/Results.tsx`, `src/pages/MyReservations.tsx`, `src/tarjeta.tsx` y `src/pages/HotelPanel.tsx`**: el inventario se lee del estado global en lugar de `HABITACIONES_SEED`, así que lo que registra el hotelero se ve de inmediato en las búsquedas, en el detalle del hotel y en las reservas del turista.
- **`src/pages/HotelPanel.tsx`**: se quitó el cálculo de unidades que vivía fuera del estado (`unidadesDe`) y la disponibilidad se calcula con las unidades que el hotel tiene registradas.

### Nota
Los guardados viejos que no traen habitaciones se completan con `HABITACIONES_SEED`, igual que se hizo con los favoritos por cuenta en la v0.x de la HU-020, así que nadie pierde datos al actualizar.

### Verificado
`typecheck` y `npm run build` sin errores. Prueba manual en el navegador contra los 6 escenarios BDD: alta válida, campos obligatorios, tipo repetido, habitación visible y reservable por el turista (C$ 1,500 × 3 noches + IVA 15% = C$ 5,175) y bloqueo del alta mientras el hotel está Pendiente.

---

## [v0.47.0] — 2026-10-12 · Recuperar contraseña: el enlace vuelve a la app correcta

### Arreglado
- **`src/store.tsx`**: `olvidarContrasena()` ahora pasa `redirectTo: window.location.origin`, así el enlace del correo regresa a la dirección donde el usuario pidió el cambio (localhost, IP local o dominio), en lugar de la Site URL fija del dashboard de Supabase.
- **`src/App.tsx`**: la detección del enlace de recuperación ahora cubre **las dos formas** en que Supabase puede mandar el token: en el hash (`#access_token=...&type=recovery`) y como código PKCE (`?code=...`); además se escucha el evento `PASSWORD_RECOVERY` del cliente como respaldo.
- **`src/pages/ForgotPassword.tsx`**: aclaración de que esta recuperación es solo para la contraseña de turista; la del hotel la regenera el administrador.

### Nota
Supabase solo redirige a URLs que estén en **Authentication → URL Configuration → Redirect URLs** del dashboard. Si el enlace sigue sin volver a la app, agregar ahí `http://localhost:3000/**` y `http://192.168.56.1:3000/**`.

---

## [v0.46.0] — 2026-10-12 · Perfil adaptado al rol Hotelero

### Cambiado
- **`src/pages/Profile.tsx`**: cuando el usuario tiene sesión de hotelero, "Mi perfil" se adapta: ceja "Cuenta de hotelero", colores ámbar del rol, tarjeta con "Dueño de {hotel}" y aviso de que el hotel se administra desde el panel.
- **`src/pages/Profile.tsx`**: nueva sección **"Contraseña de acceso"** visible solo para el hotelero, para cambiar su contraseña desde el perfil (misma validación que el banner del panel); si aún usa la temporal, el texto recuerda que vence en 24 horas.

---

## [v0.45.0] — 2026-10-12 · Seguridad: contraseña temporal de hotelero vence en 24h

### Agregado
- **`src/data.ts`**: `CuentaHotelero` ahora guarda `creadaEn` y `contrasenaTemporal`. Nueva función `contrasenaTemporalVencida()`: la contraseña que regala el administrador **vence a las 24 horas** si el dueño no la cambia.
- **`src/store.tsx`**: al crear la cuenta hotelero se marca como temporal; `login()` **bloquea el ingreso** si la temporal ya venció, con mensaje para pedir una nueva al admin. Nueva función `cambiarContrasenaHotelero()` (mínimo 6 caracteres, con confirmación).
- **`src/pages/HotelPanel.tsx`**: banner obligatorio arriba del panel para que el hotelero **cambie su contraseña temporal**; si ya venció, el aviso pasa a rojo.

### Cambiado
- **`src/pages/InscribeHotel.tsx`**: la consulta pública de estado ya **no muestra la contraseña** (antes cualquiera que supiera el correo podía verla). Ahora solo indica que las credenciales se enviaron por correo.

### Pruebas
- 3 tests nuevos de `contrasenaTemporalVencida` (93 pruebas en total).

---

## [v0.44.0] — 2026-10-12 · Revert: selector de roles restaurado

### Revertido
- **`src/layout.tsx`**: se revierte v0.43.0. El selector de roles vuelve a ofrecer Turista, Hotel y Admin como antes (la demo completa para presentaciones). El cambio de v0.42.0 (rol persistente al recargar y sesión de hotelero que no se pisa) se mantiene.

---

## [v0.43.0] — 2026-10-12 · Selector de roles: el rol Hotel solo se gana con cuenta

### Cambiado
- **`src/layout.tsx`**: el menú de "Cambiar de perfil" ya **no ofrece el rol Hotel**. El panel del hotel se alcanza únicamente iniciando sesión con la cuenta de hotelero creada por el administrador (HU-021), no con un atajo de demostración. En el menú se explica esa regla.
- **`src/layout.tsx`**: el rol Admin aparece etiquetado como **"Vista demo"** (la consola de administración todavía no tiene login propio).
- **`src/layout.tsx`**: cuando hay sesión activa, el botón del header muestra el **nombre real del usuario** (p. ej. "Hotel · Carlos") en lugar del nombre de la demo.

---

## [v0.42.0] — 2026-10-12 · Sesión de hotelero persistente al recargar

### Arreglado
- **`src/store.tsx`**: el **rol ahora se persiste** en `localStorage` (`hotelica-rol`) junto con el usuario. Antes, al recargar la página la sesión de hotelero se perdía y el usuario volvía a verse como turista, aunque hubiera entrado con la contraseña del hotel.
- **`src/store.tsx`**: `onAuthStateChange` de Supabase **ya no pisa la sesión de hotelero** (`rol: "Hotel"`) con la sesión de turista del mismo correo. Si el usuario entró al panel con su cuenta de hotelero creada por el admin, esa sesión manda hasta que cierre sesión.

---

## [v0.41.0] — 2026-10-12 · Panel del hotel: portada con foto y estilo rol Hotel

### Cambiado
- **`src/pages/HotelPanel.tsx`**: el encabezado ahora es una **portada con la foto del hotel de fondo** (overlay oscuro teal→ámbar para que el texto se lea), con el nombre, ubicación, dueño y —si el hotel ya tiene reseñas— sus estrellas y calificación.
- **Color del rol Hotel**: la cabecera de la tabla de reservas usa ahora el fondo ámbar del rol (`#FEF3C7` / texto `#92400E`) en lugar del teal genérico, siguiendo la guía de diseño.

---

## [v0.40.0] — 2026-10-12 · HU-022: editar información del hotel

### Agregado
- **Sección "Información del hotel" en `src/pages/HotelPanel.tsx`**: el hotelero ve la descripción, dirección, ubicación y teléfono de su hotel, con un botón **"Editar información"** que abre un formulario con los datos actuales precargados (nombre, departamento, municipio, dirección, descripción y teléfono).
- **`src/store.tsx`**: función `actualizarHotel()` que valida con las mismas reglas de la inscripción (excluyendo el propio hotel para que pueda conservar su nombre y correo) y actualiza el hotel en el estado global.
- **Ícono `IconoLapiz`** en `src/icons.tsx`.

### Cambiado
- **Restricción de edición (HU-022)**: mientras el hotel tiene estado **Pendiente**, el botón de edición aparece deshabilitado con el aviso "Editar información (en revisión)".

### Arreglado
- **`src/App.tsx`** (v0.39.x): al cerrar sesión desde una ruta protegida (reservas, perfil, panel, admin), el usuario ahora queda redirigido al Inicio en lugar de ver la pantalla vacía.

### Pruebas
- Test en `src/__tests__/data.test.ts` que cubre el caso de edición: conservar nombre y correo del propio hotel sin chocar con duplicados (90 pruebas en total).

---

## [v0.39.0] — 2026-10-12 · HU-021: correo de credenciales y consulta de estado

### Agregado
- **Edge Function `enviar-cuenta-hotelero`** (`supabase/functions/enviar-cuenta-hotelero/index.ts`): envía un correo real (Brevo API) al dueño del hotel cuando el admin aprueba su solicitud. El correo incluye su correo, contraseña temporal e instrucciones para iniciar sesión en Hotelica.
- **`src/store.tsx`**: función `enviarCuentaHotelero()` que llama a la Edge Function; `cuentasHotelero` ahora se expone en el contexto para que la consulta pública pueda leer las credenciales.
- **`src/pages/AdminPanel.tsx`**: al aprobar una solicitud, el sistema envía automáticamente el correo de credenciales al dueño y muestra el modal con los datos (y un aviso si el correo falla).
- **`src/pages/InscribeHotel.tsx`**: consulta pública de estado de solicitud. El dueño ingresa su correo y ve si su hotel está Pendiente, Aprobado o Rechazado; si está aprobado, también ve sus credenciales de acceso.

### Nota
La Edge Function necesita `BREVO_API_KEY` y `BREVO_SENDER_EMAIL` configurados en Supabase (igual que la de reservas). Para desplegarla: `supabase functions deploy enviar-cuenta-hotelero`.

---

## [v0.38.0] — 2026-10-12 · HU-021: inscripción pública de hoteles

### Cambiado
- **Flujo de registro de hotel (HU-021)**: el formulario se movió del panel del hotelero a una **sección pública al final del Inicio** (`src/pages/InscribeHotel.tsx`). Ahora cualquiera puede inscribir su hotel **sin cuenta**: llena sus datos (nombre y correo) y los del hotel, y la solicitud le llega al administrador.
- **Nuevo comportamiento al aprobar**: cuando el admin aprueba una solicitud, el sistema **crea automáticamente la cuenta de hotelero** (correo + contraseña temporal) y la muestra en un modal para que el admin se la envíe al dueño. El hotelero inicia sesión con esa cuenta y queda dirigido a su panel.
- **`src/data.ts`**: `DatosRegistroHotel` ahora pide `dueno` y `correo` obligatorios (el correo es con el que se crea la cuenta) y `telefono` opcional; `Hotel` tiene `correoDueno`; nuevo tipo `CuentaHotelero` y `generarContrasenaHotelero()`.
- **`src/store.tsx`**: `decidirHotel()` devuelve la cuenta creada al aprobar; `login()` reconoce primero las cuentas de hotelero creadas por el admin y, si coinciden, inicia sesión con rol Hotel.
- **`src/pages/HotelPanel.tsx`**: se quitó el formulario; el panel ahora muestra el hotel cuyo `correoDueno` coincide con el usuario logueado (o el de demostración si no hay sesión de hotelero).
- **`src/pages/AdminPanel.tsx`**: al aprobar, muestra el modal con la cuenta creada (correo y contraseña) para enviársela al hotelero.

### Nota
La prueba E2E `tests/CP-002-registro-hotel.spec.ts` quedó desactualizada respecto al nuevo flujo público; se revisará cuando se ejecute en un entorno que permita el navegador. Las 89 pruebas unitarias y el typecheck pasan sin errores.

---

## [v0.37.0] — 2026-10-12 · HU-021 terminada: registrar un hotel

### Agregado
- **`src/data.ts`**: tipo `DatosRegistroHotel` y función `validarRegistroHotel()` que revisa nombre (obligatorio, 4–60 caracteres, sin repetir el de otro hotel), departamento y municipio del catálogo (el municipio debe pertenecer al departamento), dirección (8–120 caracteres), descripción (30–600 caracteres), contacto (correo válido o teléfono de 8 dígitos) e imagen representativa. También `validarImagenHotel()` rechaza archivos que no son imagen o pesan más de 5 MB.
- **`src/store.tsx`**: función `registrarHotel()` que guarda el hotel con `aprobado: "pendiente"` (= `estado_hotel = 'Pendiente'`), el dueño según el usuario logueado y la foto como imagen principal.
- **`src/pages/HotelPanel.tsx`**: sección "Registrar un hotel" con formulario, errores campo por campo, vista previa de la foto y aviso de éxito "Tu hotel será revisado por un administrador" con badge Pendiente.
- **`src/pages/AdminPanel.tsx`**: el modal de revisión ahora muestra el contacto que dejó el hotelero.
- **`src/__tests__`** y **`tests/CP-002-registro-hotel.spec.ts`**: pruebas de las validaciones y flujo E2E.

### Nota
El hotel nuevo no aparece en las búsquedas hasta que un administrador lo apruebe (regla ya existente). La prueba E2E CP-002 no pudo ejecutarse en esta máquina porque una política bloquea el navegador de Playwright; las 86 pruebas unitarias y el typecheck pasan sin errores.

---

## [v0.36.0] — 2026-10-12 · Redacción de la HU-021

### Agregado
- **`historias-usuario/HU-021-registrar-un-hotel.md`**: historia de usuario del módulo Gestión Hotel, con 6 escenarios BDD (registro válido, campos obligatorios, imagen representativa, aviso de revisión y ocultamiento hasta aprobación) y los subtaskos HOTELICA-199 a 204 del Jira como notas de implementación.

---

## [v0.35.3] — 2026-10-11 · Plan de pruebas automatizado con Playwright

Se tomaron los casos de prueba del plan **"Planificacion de Pruebas -
Hotelica.xlsx"** y se automatizaron los tres que van con Playwright (CP-001,
CP-002 y CP-005). CP-003, CP-004 y CP-006 quedan fuera de esta versión: el plan
los asigna a JavaScript E2E, Jest y revisión manual respectivamente.

### Añadido
- **`tests/CP-001-reserva-sin-sesion.spec.ts`** — recorre el wizard completo sin
  sesión y comprueba que el sistema bloquea la reserva (HU-013, caja negra).
- **`tests/CP-002-mis-reservas.spec.ts`** — inicia sesión con un correo distinto
  al de la turista demo, crea una reserva y verifica que "Mis reservas" sólo
  lista las suyas. Necesita una cuenta real: se omite si no se definen las
  variables `E2E_CORREO` y `E2E_CLAVE`, para no tocar el proyecto de Supabase.
- **`tests/CP-005-calendario.spec.ts`** — abre el calendario de disponibilidad y
  comprueba dos cosas: que el tooltip de un día parcial compara contra el total
  de unidades, y que un día sin disponibilidad pueda elegirse como fecha de
  salida (esa noche la habitación ya no se necesita).

### Cambiado
- **`tests/CP-001-iva.spec.ts` → `tests/CP-007-iva.spec.ts`** — la prueba del
  IVA pasó al número CP-007: en el plan de pruebas el CP-001 corresponde a "no
  reservar sin sesión", así que el nombre libre más cercano era el siguiente
  número fuera del plan. Sólo cambió el nombre del archivo y el del `test()`.

### Estado de la suite
Verde: **CP-007** (subtotal, IVA 15% y total). Omitida: **CP-002** (faltan
credenciales). En rojo, documentando bugs abiertos:

- **CP-001** — se creó la reserva **HC-1062 sin sesión**. `crearReserva()`
  (`src/store.tsx`) no tiene ninguna validación de `usuario`, y
  `RUTAS_PROTEGIDAS` (`src/App.tsx`) no incluye `"hotel"`, así que el wizard es
  alcanzable sin iniciar sesión.
- **CP-005** — ocho días parciales muestran `"10 de 10"` y `"11 de 11"` en vez
  de comparar contra el total: en `src/pages/CalendarioDisponibilidad.tsx` el
  tooltip usa `` `${d.disponibles} de ${d.disponibles}` ``. Además los 6 días
  marcados "Sin disponibilidad" están deshabilitados, cuando deberían poder
  elegirse como fecha de salida.

---

## [v0.35.2] — 2026-10-11 · Rediseño de interfaz (precios, retícula y oficio)

Pase de diseño para quitar el aspecto de plantilla. **La identidad oficial se
conserva** (teal `#0B3540` / dorado `#F7A81B` / coral / crema, Fraunces +
Outfit + Libre Baskerville): no se tocaron los tokens de color ni las familias.

### Cambiado
- **`src/tarjeta.tsx`** — precio: desaparece `DESDE` en mayúsculas (competía con
  el nombre del hotel) y ahora se muestra **el total con IVA 15% a la vista**
  debajo del precio por noche. El cálculo sale de `calcularTotales()`, no de una
  fórmula escrita a mano.
- **`src/pages/Home.tsx`** — retícula de destacados: eran 4 tarjetas idénticas
  en fila; ahora **una manda** (variante `grande`, horizontal, a todo el ancho)
  y las otras 3 van en su propia fila.
- **`src/pages/Home.tsx`** — "De la búsqueda a la hamaca en cuatro pasos" deja
  de ser el patrón icono-título-texto en 4 columnas. Pasa a **línea de tiempo
  horizontal**: número en Fraunces como marca gráfica, nodo y trazo que une las
  etapas. Título nuevo: "De la búsqueda a la hamaca".
- **`src/pages/Home.tsx`** — buscador con jerarquía de campos: departamento
  ancho, municipio y fechas medianos, huéspedes compacto (antes los 6 campos
  casi del mismo ancho).
- **`src/pages/Home.tsx`** — la franja **"Para hoteleros"** salió del final de
  la página y quedó justo después de los destinos, para romper el orden
  predecible destacados → cómo funciona → testimonios → hoteleros. La página
  cierra con testimonios.
- **`src/index.css`** — nuevo motivo `.arco`: borde superior de las tarjetas de
  columna en forma de arco de medio punto tendido (portales coloniales), en vez
  de dos esquinas redondeadas iguales. La tarjeta grande conserva `rounded-xl`.

### Añadido
- **`src/index.css`** — `font-optical-sizing: auto` y `text-wrap: balance` en
  `h1–h4`, para que Fraunces dé más contraste al H1 que al H3. Clase `.num` con
  `font-variant-numeric: tabular-nums` y utilidad `tabular-nums` usada en los
  precios, que ahora alinean al escanear la columna.
- **`src/tarjeta.tsx`** — separador dibujado como **trazo de hamaca** en SVG
  inline sobre el bloque de precio, en vez de línea recta de 1px.

### Accesibilidad (WCAG 2.2 AA)
- **`src/pages/Home.tsx`** — el buscador marca **cuál campo falló** al enviar
  (`campoError`): borde coral, `aria-invalid` y `aria-describedby` enlazando con
  el mensaje. El `<select>` de departamento declara `aria-required`. El botón de
  búsqueda gana `focus-visible`. La validación sigue siendo **al enviar**, no
  mientras se escribe.

### Corregido (copy)
- **`src/data.ts`** y **`src/siluetas.tsx`** — "RACCS (Caribe Sur)" →
  **"Costa Caribe Sur"**, para el visitante internacional.
- **`src/pages/Home.tsx`** — "hoteles familiares aprobados" → "verificados por
  nuestro equipo" (decía el sello pero no quién lo daba).

### Documentación
- **`.opencode/skills/hotelica-design/SKILL.md`** — nueva sección **§10
  Criterios de oficio**: composición anti-genérica, formato de precio con IVA,
  detalles tipográficos, accesibilidad AA, convenciones de copy, fotografía y
  motivos gráficos. Se ampliaron el Do/Don't (§7) y el checklist (§8). La
  referencia de tokens (§9) apuntaba a un `tokens.css` que no existe: ahora
  apunta a `src/index.css`, que es la fuente real.
- **`.opencode/skills/flujo-hotelica/SKILL.md`** — quitadas las menciones a
  "proyecto académico" y a "fácil de entender para un profesor", coherente con
  lo ya retirado del código en v0.35.0.

### Verificado
`typecheck` sin errores · 75 pruebas en verde · E2E Playwright en verde ·
`npm run build` correcto · 0 caracteres U+FFFD en `src/`.

---

## [v0.35.1] — 2026-10-11 · Limpieza de archivos que no aportaban

### Borrado
- **`vite-dev.log`**: log suelto de una corrida de `npm run dev`.
- **`.freebuff/`**: carpeta de una herramienta externa; sólo contenía un `project-id`.
- **`dist/`** y **`test-results/`**: artefactos de build y de Playwright regenerables (ya estaban en `.gitignore`).

### Corregido
- **`package.json`** y **`package-lock.json`**: el nombre del paquete era `"sandbox-workspace"`, un resto de la plantilla. Pasó a `"hotelica"` (en las dos posiciones del lock).

### Nota
Se revisaron y **conservaron** todos los archivos que sí aportan: `public/` (los 5 SVG están referenciados), `supabase/` (la edge function se invoca desde `src/store.tsx`), `vercel.json`, `historias-usuario/` y los skills de `.opencode/`.

Quedan pendientes en una futura versión, por requerir verificación más amplia: las 10 dependencias de runtime sin importar (36,4 MB de `node_modules`) y la duplicidad entre `vite.config.js` y `vite.config.ts`.

---

## [v0.35.0] — 2026-10-11 · Quitado lo de proyecto académico y acentos rotos

### Quitado
- **`src/layout.tsx`** (footer): la columna "Proyecto académico" (Ingeniería de Software Fase 1, maqueta funcional, 10 historias de usuario) pasó a ser "Hotelica" con datos de producto: reservas en línea 24/7, atención en español, sin cargos ocultos. Se conserva "Hecho en Nicaragua".
- **`src/pages/Home.tsx`**: botón "Registrar mi hotel gratis" que no hacía nada (sólo mostraba un aviso "demostración"). Queda sólo la nota de aprobación del equipo.
- **`src/layout.tsx`** (footer y menú de rol): botón "Restaurar datos de demostración", que estaba duplicado. Al quitarlo se eliminaron también `reiniciarDemo` de `src/store.tsx` y el icono `IconoReiniciar` de `src/icons.tsx`, que quedaron sin uso.
- **`README.md`**: referencias al curso, grupo #08, docente guía, institución y badges de "Fase 1/Fase 2". El pie dice "Hotelica · Reservación hotelera de Nicaragua".
- **`src/pages/MyReservations.tsx`** y **`src/pages/AdminPanel.tsx`**: textos visibles que mencionaban "Fase 1/Fase 2".

### Cambiado
- **`src/layout.tsx`**: "Modo de demostración" → "Cambiar de perfil" (el selector de rol sigue funcionando igual). "Sesión demo iniciada como…" → "Sesión iniciada como…".
- **`src/pages/BookingModal.tsx`**: "Demostración: no se realiza ningún cargo real." → "No se realiza ningún cargo real."

### Corregido
- **`src/layout.tsx`**: 41 caracteres acentuados rotos (U+FFFD) que se veían en pantalla — "Proyecto acad+<?>mico", "Reservaci+<?>n hotelera", "men+<?>", "peque+<?>os", "C+<?>lculos", "Sesi+<?>n demo", etc. El fallo entró en el commit `826563a8`; se reconstruyeron los textos contra la última versión limpia (`be79ca30`).

---

## [v0.34.1] — 2026-10-11 · Splash centrado

### Corregido
- **`src/App.tsx`**: el bloque del splash aparecía ~148 px a la izquierda del centro. Los SVG del logo traen un lienzo 2000×2000 con márgenes transparentes y se anclan a la izquierda (`objectPosition: "left center"` en `src/ui.tsx:86`), así que la caja se centraba pero los píxeles visibles no. Se compensa sólo en el splash con un `translate-x-36`; `Marca` (navbar, footer) queda intacta.

---

## [v0.34.0] — 2026-10-11 · Siluetas geográficas de departamentos

### Cambiado
- **`src/siluetas.tsx`**: las 8 siluetas icónicas (iglesia, volcán, palmera) se reemplazaron por los **contornos geográficos reales** de cada departamento. La API `SiluetaDepto({ id, className })` no cambió, ni `NOMBRES`, ni el `viewBox 64×64` con `fill="currentColor"`. Se agregó `fillRule="evenodd"` por si un contorno trae huecos.

### Procedencia y licencia
- Contornos derivados de [pacisauctor/geojson-nicaragua](https://github.com/pacisauctor/geojson-nicaragua), cuyos datos son de **OpenStreetMap bajo licencia ODbL** (© OpenStreetMap contributors). La atribución queda en el encabezado de `src/siluetas.tsx`.
- `caribe` mapea a `raas.geo.json` (RACCS), que es el rótulo que ya usaba el catálogo.
- Pipeline: `mapshaper -simplify 5%` (matagalpa y raas al 3%) + re-escala a 64×64 con proyección equirectangular. De 1.36 MB de GeoJSON crudo a **19.1 KB** de paths (73–809 puntos por departamento).

### Verificado
- `npm run typecheck` sin errores · `npm run test`: 32 pruebas · `npx playwright test`: 1 prueba (CP-001).
- Revisión visual del Home: los contornos se ven correctos en las tarjetas de destino.

---

## [v0.33.0] — 2026-10-10 · Pruebas E2E con Playwright (CP-001)

### Agregado
- **Playwright configurado** (`playwright.config.ts`): carpeta `tests/`, navegador Chromium, `baseURL http://localhost:3000` y `webServer` que levanta `npm run dev` si no está corriendo.
- **Prueba E2E `tests/CP-001-iva.spec.ts`**: caja negra del flujo HU-013 + HU-014 — inicio → detalle de Brisas del Pacífico → fechas de 3 noches → habitación Estándar Mar → verifica subtotal `C$ 4,200.00`, IVA `C$ 630.00` y total `C$ 4,830.00`.
- **Script `npm run test:e2e`** en `package.json`.

### Verificado
- `npx playwright test`: 1 prueba pasando.
- `npm run test`: 32 pruebas unitarias pasando. `npm run typecheck` sin errores.

---

## [v0.39.1] — 2026-10-12 · Corrección de bugs #2 y #3 (Reserva sin sesión y sobreventa entre pestañas)

### Corregido
- **Bug #2 — Reserva sin sesión**: `src/pages/BookingModal.tsx` ahora valida `usuario` en `validarPaso()` y al inicio de `confirmar()`. Sin sesión aparece "Debes iniciar sesión para reservar." y se vuelve al paso 1; ya no se crean reservas con nombre "Turista" y correo vacío, ni el toast "enviado a undefined".
- **Bug #3 — Sobreventa y pérdida de datos entre pestañas**:
  - `src/store.tsx`: nuevo `useEffect` con `window.addEventListener("storage", ...)`, así cuando una pestaña guarda cambios la otra sincroniza su estado en lugar de pisarlo.
  - `crearReserva()` lee lo último guardado en el navegador para el folio (evita folios duplicados) y re-valida la disponibilidad con los datos más frescos antes de escribir; si ya no hay cupo no escribe la reserva.
  - `BookingModal.tsx`: `confirmar()` re-valida fechas, pago y disponibilidad justo antes de crear la reserva (si otra pestaña ya reservó, muestra el error y regresa al paso 1).

### Verificado
- `npx tsc --noEmit` y `npm run build` sin errores.

---

## [v0.39.0] — 2026-09-28 · Comprobantes con la marca Hotelica

### Agregado
- **Logo de Hotelica en el correo**: la cabecera muestra `public/logo-email.png` (PNG generado desde `Logo-blanco.svg` y recortado al tamaño real del logo) apuntando al archivo publicado en el repositorio, ya que los clientes de correo no renderizan imágenes en `data URI` — por eso salía la imagen rota. Si la imagen está bloqueada se muestra "HOTELICA" como texto alternativo con la tipografía de la marca.
- **Datos completos del comprobante en el correo**: el frontend envía habitación, subtotal, IVA, método de pago, estado de la reserva, estado del pago y referencia; la plantilla suma bloques de **Detalle de la reserva**, **Pago**, **Resumen del pago** y chips de estado con la paleta oficial.
- **Copia interna del logo** (`src/assets/Logo-blanco.svg`) para incrustarlo en el comprobante descargable.

### Modificado
- **Plantilla del correo** (`supabase/fn enviar-correo-reserva`): rediseño con tablas (el espaciado de las filas ahora se respeta en cualquier cliente), cabecera teal con logo y filete dorado, folio en bloque dorado, resumen con subtotal/IVA, total en bloque oscuro con monto dorado, nota de check-in y pie de marca.
- **Comprobante descargable** (`src/pages/BookingModal.tsx` → `descargarComprobante`): mismo diseño que el correo, con el SVG del logo incrustado, bloques de reserva/pago/resumen, chips de estado, referencia y fecha de pago, y pie HOTELICA.
- `src/store.tsx`: `enviarCorreoReserva()` arma el cuerpo con los datos extra de la reserva y del pago.

### Verificado
- `npm run typecheck` y `npm run build` sin errores; `npm run test`: 75 pruebas pasando.
- Para que el correo nuevo se vea hay que subir el PNG al repositorio (`main`) y luego redesplegar la función: `supabase functions deploy enviar-correo-reserva`.

---

## [v0.38.0] — 2026-09-28 · HU-020: Gestionar hoteles favoritos

### Agregado
- **`historias-usuario/HU-020-gestionar-hoteles-favoritos.md`**: historia con 9 escenarios BDD (marcar y quitar desde la tarjeta, desde la ficha, contador en el header, página de favoritos, estado vacío, lista por cuenta, persistencia y sin duplicados).
- **Favoritos por cuenta (subtaskos 182 y 186)**: `favoritos` en `src/store.tsx` pasó de una lista plana a `Record<string, string[]>` guardada **por clave de cuenta** (correo en minúsculas o `"invitado"` sin sesión); `cargar()` migra los guardados viejos a la lista del invitado. En Fase 2 esa clave se reemplaza por `id_usuario` de la tabla `favoritos`.
- **Funciones `claveDeFavoritos()`, `favoritosDe()` y `alternarFavoritoDe()`** (`src/data.ts`): clave de la lista, lectura por cuenta y toggle sin duplicados.
- **5 pruebas nuevas** (`src/__tests__/data.test.ts` → `describe("favoritos por cuenta")`).

### Modificado
- `src/store.tsx`: `alternarFavorito()` escribe solo en la lista de la cuenta actual; el contexto expone `favoritosDe(datos.favoritos, usuario)`; `reiniciarDemo()` siembra la lista de la cuenta activa.
- `src/pages/MyReservations.tsx`: textos de la página Favoritos actualizados (lista propia por cuenta y tabla `favoritos` de Fase 2).

### Verificado
- Corazón en tarjeta (`src/tarjeta.tsx`) y ficha (`src/pages/HotelDetail.tsx`) con toggle, animación y aviso (subtaskos 181/183); contador en header y menú móvil (`src/layout.tsx`, subtasko 184); página `/favoritos` (subtasko 185).
- `npm run test`: 75 pruebas pasando (5 nuevas de HU-020).
- `npm run typecheck` sin errores.

---

## [v0.37.0] — 2026-09-28 · HU-019: Calificar una estadía

### Agregado
- **`historias-usuario/HU-019-calificar-una-estadia.md`**: historia con 9 escenarios BDD (aparición tras check-out, no se califica antes, formulario con estrellas y comentario opcional, validación de estrellas, registro de la calificación, recálculo del promedio, una sola calificación por reserva, comentario como reseña y persistencia).
- **Tipo `Calificacion`** (`src/data.ts`): registro con folio, hotel, autor, estrellas (1-5), comentario y fecha — el equivalente de Fase 1 a la tabla `calificaciones`.
- **Funciones `sePuedeCalificar()`, `validarCalificacion()` y `calificacionDe()`** (`src/data.ts`): la regla central (solo tras el check-out y una sola vez), la validación de 1 a 5 estrellas y la búsqueda de la calificación de una reserva.
- **Lista `calificaciones` persistida** (`src/store.tsx`) con `?? []`; `calificar()` ahora **valida antes de escribir** (si la reserva no está completada, ya fue calificada o las estrellas no son válidas no cambia nada) y devuelve `true`/`false`; además guarda el registro, marca `calificada`, recalcula el promedio con `nuevoPromedio()` y publica el comentario como reseña del hotel.
- **10 pruebas nuevas** (`src/__tests__/data.test.ts` → `describe("sePuedeCalificar")`, `describe("validarCalificacion")` y `describe("calificacionDe")`).

### Modificado
- `src/pages/MyReservations.tsx`: el botón "Calificar estadía" ahora depende de `sePuedeCalificar(r)`; el sello "Ya calificaste" aparece para toda reserva calificada; el envío revalida y avisa si la reserva ya fue calificada; el detalle de la reserva muestra la estrella del turista con su fecha y comentario; el modal indica folio y fecha del check-out.

### Verificado
- `npm run test`: 70 pruebas pasando (10 nuevas de HU-019).
- `npm run typecheck` sin errores.

---

## [v0.36.0] — 2026-09-28 · HU-018: Registrar o realizar un pago

### Agregado
- **`historias-usuario/HU-018-registrar-o-realizar-un-pago.md`**: historia con 9 escenarios BDD (selección del método, formulario según el método, validación antes de procesar, datos válidos, pago registrado con la reserva, reserva confirmada, pago en efectivo pendiente, comprobante descargable y montos del comprobante).
- **Tipos `Pago`, `EstadoPago` y `DatosPago`** y constante **`ETIQUETA_PAGO`** (`src/data.ts`): registro de pago con folio, monto, método, estado (Pagado / Pendiente / Reembolsado), fecha y referencia.
- **Función `validarPago(metodo, datos, hoy)`** (`src/data.ts`): valida los datos antes de procesar — tarjeta de 16 dígitos con titular, vencimiento MM/AA no vencido y CVV de 3 dígitos; transferencia con banco y referencia; en efectivo no pide nada.
- **Lista `pagos` persistida** (`src/store.tsx`) y método **`registrarPago()`**: crea el pago contra el folio de la reserva y, si quedó Pagado, deja la reserva en estado **Confirmada** (en efectivo todo queda Pendiente). `pagos` se carga con `?? []` para no romper los guardados viejos.
- **Formulario de pago en el paso 2** (`src/pages/BookingModal.tsx`): campos de tarjeta (titular, número, vencimiento, CVV), transferencia (banco, referencia) y aviso de pago en recepción para efectivo; no se avanza al paso 3 si `validarPago()` devuelve un error.
- **Comprobante descagable**: `descargarComprobante()` genera un archivo HTML con folio, hotel, huésped, fechas, desglose con IVA 15% y método de pago, y lo descarga desde la pantalla de éxito (junto al correo de confirmación).
- **Estado del pago en el detalle de la reserva** (`src/pages/MyReservations.tsx`): muestra estado, referencia y fecha del pago registrado.
- **Icono `IconoDescargar`** (`src/icons.tsx`).
- **11 pruebas nuevas** (`src/__tests__/data.test.ts` → `describe("validarPago")`).

### Modificado
- `src/pages/BookingModal.tsx`: al confirmar se registra el pago y la reserva sale Confirmada (o Pendiente en efectivo); pantalla de éxito con la línea "Pago registrado / pendiente" y botón "Descargar comprobante".
- `historias-usuario/Orden de Historias de Usuarios.md`: HU-018 ✅ Terminada.

### Verificado
- `npm run test`: 60 pruebas pasando (11 nuevas de HU-018).
- `npm run typecheck` sin errores.

---

## [v0.35.0] — 2026-09-28 · HU-017: Consultar el estado de la reserva

### Agregado
- **`historias-usuario/HU-017-consultar-estado-de-la-reserva.md`**: historia con 8 escenarios BDD (badge, explicación del estado, línea de tiempo, reserva cancelada, aviso de cambio, reserva inexistente, persistencia y ruta protegida).
- **Línea de tiempo de la reserva** (`src/pages/MyReservations.tsx` → componente `LineaTiempo`): los 4 pasos del flujo (Pendiente → Confirmada → Check-in → Completada) con check en los hechos, paso actual resaltado en dorado y los futuros en gris; si está cancelada se reemplaza por un aviso en coral.
- **Explicación del estado en el detalle**: bloque "Estado actual" con una frase sencilla por cada estado (`SIGNIFICADO`).
- **Aviso de cambio de estado**: al volver a "Mis reservas" se comparan los estados guardados en `localStorage` (`hotelica-estados-vistos`) con los actuales; si alguno cambió se lanza un toast y la tarjeta queda marcada con "Estado actualizado" hasta que se abre el detalle.
- **Reserva inexistente**: el detalle ahora se abre **por folio**; si el folio ya no existe se muestra el mensaje "No encontramos la reserva" con botón de cierre (`ReservaNoEncontrada`).
- **Función `pasoDeEstado(estado)`** y constante **`FLUJO_RESERVA`** (`src/data.ts`): devuelven el paso 0..3 del recorrido y `-1` para reservas canceladas.
- **6 pruebas nuevas** (`src/__tests__/data.test.ts` → `describe("pasoDeEstado")`).

### Modificado
- `src/pages/MyReservations.tsx`: estado del modal cambiado de objeto a folio; la cancelación marca el estado como visto para no avisarse a sí misma; se arregló el formato del bloque de IVA en el detalle.
- `historias-usuario/Orden de Historias de Usuarios.md`: HU-017 ✅ Terminada.

### Verificado
- `npm run test`: 49 pruebas pasando (6 nuevas de HU-017).
- `npm run typecheck` sin errores.

---

## [v0.34.0] — 2026-09-28 · HU-016: Cancelar una reserva

### Agregado
- **`historias-usuario/HU-016-cancelar-una-reserva.md`**: historia con 8 escenarios BDD (botón, modal con política, cambio de estado, estados no cancelables, llegada pasada, disponibilidad liberada, aviso al hotel y persistencia).
- **Función `sePuedeCancelar(reserva, hoy)`** (`src/data.ts`): regla central de la cancelación — solo estados **Pendiente** o **Confirmada** y con la llegada aún no pasada.
- **Avisos para el hotel**: tipo `Notificacion` y lista `notificaciones` persistida en `src/store.tsx` con `avisarHotel()` y `marcarNotificacionesLeidas()`; al cancelar, el turista deja el aviso "Reserva HC-XXXX cancelada por el turista".
- **Tarjeta "Avisos recientes"** (`src/pages/HotelPanel.tsx`): lista los avisos del hotel con contador de no leídos y botón "Marcar como leídos".
- **Icono `IconoCampana`** (`src/icons.tsx`): SVG inline propio.
- **6 pruebas nuevas** (`src/__tests__/data.test.ts` → `describe("sePuedeCancelar")`): pendiente/confirmada futura, llegada de hoy, check-in, completada, cancelada y llegada pasada.

### Modificado
- `src/pages/MyReservations.tsx`: el botón y la validación usan `sePuedeCancelar()`; el modal de confirmación ahora incluye la política de cancelación (sin cargos, libera la habitación y avisa al hotel); `cancelar()` llama a `avisarHotel()` y el toast informa que se avisó al hotel.
- `src/store.tsx`: `notificaciones` se carga con `?? []` para no romper los guardados viejos del `localStorage`.
- Comentarios de `src/pages/HotelPanel.tsx` actualizados al backlog oficial (HU-026 a HU-029).
- Estado de HU-016 actualizado a ✅ Terminada en `Orden de Historias de Usuarios.md`.

### Verificado
- `npm run test`: 43 pruebas pasando (6 nuevas de HU-016).
- `npm run typecheck` sin errores.

---

## [v0.33.0] — 2026-09-28 · HU-015: Consultar historial de reservas

### Agregado
- **`historias-usuario/HU-015-consultar-historial-de-reservas.md`**: historia con
  9 escenarios BDD (listado, filtro por usuario, orden, estados, detalle,
  caso vacío y persistencia).
- **Función `historialDeReservas(reservas, usuario)`** (`src/data.ts`): devuelve
  solo las reservas del usuario logueado y las ordena de más recientes a más
  antiguas; sin sesión muestra las de la turista de demostración.
- **Constante `TURISTA_DEMO`** (`src/data.ts`): nombre de la turista demo
  (María Fernández) en un solo lugar.
- **5 pruebas nuevas** (`src/__tests__/data.test.ts` → `describe("historialDeReservas")`):
  filtro por sesión, demo sin sesión, orden descendente, coincidencia por nombre
  cuando no hay correo y lista vacía.

### Modificado
- **`src/pages/MyReservations.tsx`**: el listado ya no filtra por el nombre fijo
  "María Fernández", ahora usa `historialDeReservas()` con el usuario de la sesión
  (y la turista demo cuando nadie inició sesión); el encabezado muestra
  "Sesión activa" o "Sesión demo" según corresponda.
- Números de HU de los comentarios de la pantalla actualizados al backlog oficial
  (historial HU-015, cancelar HU-016, calificar HU-019, favoritos HU-020).
- **Escenario 3 de la HU ajustado**: "Mis reservas" es ruta protegida, así que sin
  sesión la pantalla no se abre y se vuelve al inicio (antes decía que se mostraban
  las reservas de la turista demo, caso no alcanzable en la interfaz).
- Estado de HU-015 actualizado a ✅ Terminada en `Orden de Historias de Usuarios.md`.

### Verificado
- `npm run test`: 37 pruebas pasando (5 nuevas de HU-015).
- `npm run typecheck` sin errores.

---

## [v0.32.0] — 2026-09-24 · HU-014: Calcular subtotal, IVA y total

### Agregado
- **Constante `TASA_IVA = 0.15`** (`src/data.ts`): tasa de impuesto centralizada y exportada para UI y pruebas.
- **Desglose completo en la pantalla de éxito** (`src/pages/BookingModal.tsx`): ahora muestra precio por noche, noches, subtotal, IVA y total junto al folio HC-XXXX.
- **8 pruebas nuevas** (`src/__tests__/data.test.ts`): edge cases de HU-014 (precio/negativas/NaN/Infinity → 0, noches fraccionales redondeadas, total nunca negativo, constante TASA_IVA).

### Modificado
- **`calcularTotales()`** (`src/data.ts`): valida entradas — negativos, `NaN` e `Infinity` se tratan como 0 — garantizando que subtotal, IVA y total nunca sean negativos o indeterminados. Las noches fraccionales se redondean al entero más cercano.
- **Etiquetas de IVA dinámicas**: `BookingModal.tsx` y `MyReservations.tsx` ahora muestran `IVA ({TASA_IVA * 100}%)` en lugar del texto fijo "IVA (15%)", así un cambio de tasa se refleja en toda la interfaz.
- `historias-usuario/HU-014-calcular-subtotal-iva-total.md`: creado con criterios BDD.
- Estado de HU-014 actualizado a ✅ Terminada en `Orden de Historias de Usuarios.md`.

### Verificado
- `npm run test`: 32 pruebas pasando (incluye los 8 casos nuevos de HU-014).
- `npm run typecheck` sin errores.

---

## [v0.31.0] — 2026-09-22 · Login con Google vía Supabase Auth

### Cambiado
- **`src/store.tsx` — `loginSocial`**: ya no es simulado. Ahora usa
  `supabase.auth.signInWithOAuth({ provider: "google" })` con la suscripción
  real de Supabase y `redirectTo: window.location.origin`.
- **`src/store.tsx` — nuevo listener `onAuthStateChange`**: al volver de
  Google recibe la sesión, arma el `Usuario` desde `user_metadata`
  (nombre, teléfono, dirección) y muestra la bienvenida con toast.
- **`src/layout.tsx` — modal de login**: los 3 botones sociales se
  reemplazaron por un único botón "Continuar con Google" con el logo oficial
  de la marca; los errores se muestran inline en el modal.
- **`src/i18n.ts`**: `loginGoogle` ahora dice "Continuar con Google" /
  "Continue with Google"; se quitaron las claves sin uso de Facebook/Apple.

### Agregado
- **`src/icons.tsx`**: icono de marca `LogoGoogle` (colores oficiales,
  dibujado en SVG sin librerías).

### Requisitos en el dashboard de Supabase
- Authentication → Providers → habilitar **Google** con el Client ID y
  Client Secret de Google Cloud Console (credencial OAuth tipo Web).
- Authentication → URL Configuration → agregar el dominio del sitio
  (p. ej. `http://localhost:3000` y el dominio de producción en Vercel)
  a **Site URL** y **Redirect URLs**.

---

## [v0.30.0] — 2026-09-22 · HU-013: Correo de confirmación, datos del usuario y comentarios

### Agregado
- **Edge Function `enviar-correo-reserva`** (`supabase/functions/enviar-correo-reserva/index.ts`):
  envía el correo de confirmación con Resend (folio, hotel, fechas, noches,
  huéspedes y total) con plantilla de marca Hotelica.
- **`enviarCorreoReserva()`** en `src/store.tsx`: llama a la Edge Function
  con el token de la sesión de Supabase.
- **Datos del usuario en el paso 1** (`src/pages/BookingModal.tsx`):
  recuadro "Reservando como" con nombre, correo y teléfono (solo lectura).
- **Campo de comentarios o solicitudes especiales** (paso 2): opcional,
  se muestra en el resumen del paso 3 y se guarda en la reserva.
- **Feedback del correo** en la pantalla de éxito: aviso verde si se envió,
  aviso ámbar con el folio si falló (la reserva queda registrada igual).

### Modificado
- `src/data.ts`: tipo `Reserva` con los campos `correo`, `telefono` y `comentarios`.
- `src/pages/BookingModal.tsx`: `confirmar()` ahora es async, usa el usuario
  logueado en lugar del nombre fijo "María Fernández".
- `historias-usuario/HU-013-crear-una-reserva.md`: MoSCoW y flujo del wizard
  actualizados con las mejoras.

### Verificado
- Los 5 escenarios BDD de HU-013 (ver detalle en v0.29.0) siguen cumpliéndose.
- `npm run typecheck` sin errores.

---

## [v0.29.0] — 2026-09-21 · HU-013: Wizard de 3 pasos para crear reserva

### Agregado
- **Wizard de 3 pasos** (`src/pages/BookingModal.tsx`): paso 1 datos de la
  reserva, paso 2 método de pago, paso 3 confirmación con resumen completo.
- **Validaciones en el paso 1**: fechas inválidas, huéspedes < 1, huéspedes
  sobre la capacidad de la habitación y sin disponibilidad.
- **Pantalla de éxito** con folio HC-XXXX y animación de procesamiento.
- **Archivo `HU-013-crear-una-reserva.md`** con los 5 criterios BDD.

### Verificado
- Escenario 1: reserva registrada con estado "Pendiente" y folio HC-XXXX
  (`src/store.tsx:139-151`).
- Escenario 2: error al avanzar + panel de fechas alternativas sugeridas.
- Escenario 3: error "no admite esa cantidad de huéspedes".
- Escenario 4: tarjeta, efectivo o transferencia en el paso 2.
- Escenario 5: resumen completo en el paso 3.

### Cambiado
- Estado de HU-013 actualizado a ✅ Terminada en `Orden de Historias de Usuarios.md`.

---

## [v0.28.0] — 2026-09-21 · Reservas de demostración para el calendario

### Agregado
- **Reservas demo bloqueadas y confirmadas** (`src/data.ts`): fechas ocupadas
  en Hotel San Juan para que el calendario de HU-011 muestre días rojos/amarillos
  y las sugerencias de fechas alternativas tengan con qué trabajar.

---

## [v0.27.0] — 2026-09-19 · HU-012: Ver destinos y actividades turísticas

### Agregado
- **Página de destinos** (`src/pages/Destinos.tsx`): departamentos de
  Nicaragua con actividades turísticas destacadas.
- **Datos de destinos** en `src/data.ts` y ruta `destinos` en `src/rutas.ts`.
- **Archivo `HU-012-ver-destinos-y-actividades.md`** con criterios BDD.

### Cambiado
- Estado de HU-012 actualizado a ✅ Terminada en `Orden de Historias de Usuarios.md`.---

## [v0.26.0] — 2026-09-18 · HU-010: Consultar habitaciones y precios

### Verificado
- **HU-010 — Consultar habitaciones y precios**: los 3 escenarios BDD ya
  estaban implementados y se verificaron:
  - Escenario 1: listado de habitaciones con capacidad, amenities y precio.
  - Escenario 2: indicador visual de disponibilidad con badges.
  - Escenario 3: hotel sin habitaciones muestra mensaje informativo.

### Agregado
- **Vista comparativa lado a lado** (`src/pages/HotelDetail.tsx`):
  Botón "Comparar" que alterna entre vista de lista (vertical) y
  vista comparativa (cuadrícula 2-3 columnas) para comparar
  habitaciones fácilmente.

### Modificado
- `src/pages/HotelDetail.tsx`: actualizado comentario a HU-010,
  agregado estado `vistaComparativa` y botón de alternar vista.
- `historias-usuario/HU-010-consultar-habitaciones-y-precios.md`: creado.

### Cambiado
- Estado de HU-010 actualizado a ✅ Terminada en `Orden de Historias de Usuarios.md`.

---

## [v0.25.0] — 2026-09-18 · HU-009: Consultar detalles del hotel

### Verificado
- **HU-009 — Consultar detalles del hotel**: los 5 escenarios BDD ya
  estaban implementados desde la maqueta inicial y se verificaron:
  - Escenario 1: nombre, descripción, ubicación, servicios, fotos y
    calificación promedio en `HotelDetail.tsx:111-153`.
  - Escenario 2: hotel desactivado/eliminado muestra mensaje claro.
  - Escenario 3: galería de imágenes con efecto hover zoom.
  - Escenario 4: lista de amenidades con iconos descriptivos.
  - Escenario 5: calificación, reseñas y distribución por estrellas.

### Agregado
- **Información de contacto directa** (`src/pages/HotelDetail.tsx`):
  Teléfono y correo electrónico del hotel en la tarjeta lateral.
- **Iconos `IconoTelefono` y `IconoCorreo`** (`src/icons.tsx`):
  Iconos SVG inline para información de contacto.

### Modificado
- `src/pages/HotelDetail.tsx`: actualizado comentario a HU-009,
  mejorado manejo de hotel desactivado/eliminado (edge case BDD),
  agregada información de contacto directa.
- `src/icons.tsx`: agregados iconos de teléfono y correo.
- `historias-usuario/HU-009-consultar-detalles-del-hotel.md`: creado
  con criterios BDD del Product Backlog.

### Cambiado
- Estado de HU-009 actualizado a ✅ Terminada en `Orden de Historias de Usuarios.md`.

---

## [v0.24.0] — 2026-09-18 · HU-008: Filtrar hoteles por capacidad

### Agregado
- **Filtro de huéspedes en barra lateral** (`src/pages/Results.tsx`):
  Botones +/- para ajustar la cantidad de huéspedes (1-10) con
  indicador visual del valor seleccionado.
- **Distinción entre adultos y niños**: selectores separados en barra
  de búsqueda y barra lateral para adultos (1-10) y niños (0-8).
- **Indicador de habitaciones aptas** (`src/tarjeta.tsx`): cada tarjeta
  muestra cuántas habitaciones son aptas para la cantidad de huéspedes.
- **Icono de capacidad**: SVG inline de cama junto al indicador de
  habitaciones encontradas.
- **Mensaje específico para edge case**: cuando no hay resultados por
  capacidad (más de 4 huéspedes), se muestra un mensaje detallado
  sugiriendo reducir el número de personas.

### Verificado
- **Selector de huéspedes en barra de búsqueda**: ya existía (línea 122).
- **Filtrado por capacidad**: ya existía (líneas 66-72).
- **Actualización en tiempo real**: el estado `huespedes` ya estaba en
  las dependencias del useEffect.

### Modificado
- `src/pages/Results.tsx`: agregado filtro de huéspedes en barra lateral
  con botones +/-, distinción adultos/niños, mejorado mensaje de estado
  vacío para edge case.
- `src/tarjeta.tsx`: agregada prop `huespedes`, función `habitacionesAptas()`,
  indicador visual con icono de cama.
- `historias-usuario/HU-008-filtrar-hoteles-por-capacidad.md`: creado
  con criterios BDD del Product Backlog.

---

## [v0.23.0] — 2026-09-18 · HU-011: Calendario visual y sugerencias de fechas

### Agregado
- **Calendario visual de disponibilidad** (`src/pages/CalendarioDisponibilidad.tsx`):
  Componente que muestra un calendario mensual con días codificados por color:
  - Verde: libre (todas las habitaciones disponibles)
  - Amarillo: parcial (algunas habitaciones disponibles)
  - Rojo: bloqueado (sin disponibilidad)
  - Gris: pasado (fechas anteriores a hoy)
  - Azul: seleccionado (rango de fechas activo)
  Navegación entre meses y selección de fecha por clic.
- **Función `sugerirFechasAlternativas()`** (`src/data.ts`):
  Busca hasta 3 rangos de fechas cercanas (±30 días) con disponibilidad
  para las mismas habitaciones, priorizando fechas más cercanas.
- **Sugerencias en HotelDetail.tsx**: cuando no hay disponibilidad para las
  fechas seleccionadas, se muestra un panel azul con botones de fechas
  alternativas que el turista puede seleccionar con un clic.
- **Sugerencias en BookingModal.tsx**: mismo comportamiento dentro del
  modal de reserva cuando la habitación seleccionada no está disponible.

### Modificado
- `src/pages/HotelDetail.tsx`: import de `CalendarioDisponibilidad`,
  `sugerirFechasAlternativas` y `calcularNoches`. Agregado estado
  `mostrarCalendario` y sección de calendario + sugerencias.
- `src/pages/BookingModal.tsx`: import de `sugerirFechasAlternativas`,
  agregado `useMemo` para cálculo de sugerencias y UI de alternativas.

## [v0.22.0] — 2026-09-18 · HU-011: Consultar disponibilidad por fechas

### Verificado
- **HU-011 — Consultar disponibilidad por fechas**: los 5 escenarios BDD ya
  estaban implementados desde la maqueta inicial (v0.4.0) y se verificaron
  contra el código actual:
  - Escenario 1: cantidad de unidades disponibles se muestra en `HotelDetail.tsx:185-202`.
  - Escenario 2: "Agotado para tus fechas" cuando disponibles = 0.
  - Escenario 3: fechas inválidas bloquean la búsqueda.
  - Escenario 4: solo hoteles con disponibilidad aparecen en `Results.tsx:69-71`.
  - Escenario 5: botón bloqueado en `BookingModal.tsx:56-57` si disponibles <= 0.

### Agregado
- **Archivo `HU-011-consultar-disponibilidad-por-fechas.md`** con criterios BDD.
- **Badge de disponibilidad en tarjetas** (`src/tarjeta.tsx`): ahora cada tarjeta
  muestra la cantidad de unidades disponibles para las fechas seleccionadas:
  - Verde: ">5 unidades disponibles"
  - Amarillo: "¡Solo X disponibles!" (1-5)
  - Rojo: "Sin disponibilidad" (0)

### Modificado
- `src/tarjeta.tsx`: agregadas props `llegada` y `salida`, función `totalDisponibles()`.
- `src/pages/Results.tsx`: pasa fechas a `TarjetaHotel`.
- Escenario 4 de HU-011 actualizado con nueva funcionalidad.

### Cambiado
- Estado de HU-011 actualizado a ✅ Terminada en `Orden de Historias de Usuarios.md`.

---

## [v0.21.0] — 2026-09-09 · Logos centralizados y con mejor presencia

### Agregado
- **`LOGOS` en `src/ui.tsx`**: objeto exportado con las rutas de los 5
  recursos de marca (logo completo, claro, texto, texto claro y sello).
  Un solo lugar para cambiar o agregar logos.
- **`MarcaFooter` en `src/ui.tsx`**: componente propio para el pie de
  página, usando la variante clara del texto (antes usaba la versión
  teal sobre fondo oscuro `#051B21`, casi invisible).

### Corregido
- **`public/text-subtext-white.svg`** estaba rota: conservaba el texto
  teal `#044454` en lugar de claro. Regenerada con texto crema `#F8F6F0`
  y acentos dorados `#e4c46e`.
- Escala de tamaños de `Marca`: `grande` era igual que `md` y más
  pequeña de lo previsto. Ahora: `md h-60`, `grande h-60`, `enorme h-72`
  (los lienzos SVG de 2000x2000 tienen márgenes transparentes enormes,
  por eso las alturas son grandes: la banda visible es solo ~20%).

---

## [v0.20.0] — 2026-09-09 · Logo adaptativo en la barra sobre el hero

### Agregado
- **Logo claro** `public/Logo-blanco.svg`: variante del logo oficial con el
  texto en crema `#F8F6F0` (mismo token que usa `.brand.oscura`) y los
  acentos dorados intactos.

### Cambiado
- **`Marca` en `src/ui.tsx`**: ahora sí usa la prop `clara` (antes la
  ignoraba y el logo teal quedaba invisible sobre la imagen del hero).
  Las dos variantes se apilan y se cruzan con una transición de opacidad
  de 300ms sincronizada con el cambio de fondo de la barra.
- El logo claro lleva una sombra suave (`drop-shadow`) para despegarse
  del atardecer del hero.
- `npm run typecheck` sin errores.

---

## [v0.19.0] — 2026-09-09 · HU-006 verificada en local; HU-004 y HU-005 integradas desde remoto

### Verificado
- **HU-006 — Buscar hoteles por departamento**: los 5 escenarios BDD ya
  estaban implementados desde la maqueta inicial (v0.4.0) y se verificaron
  contra el código actual:
  - Escenario 1: búsqueda con departamento, fechas y huéspedes navega a
    `Resultados` con los parámetros (`src/pages/Home.tsx`).
  - Escenario 2: error "Selecciona un departamento para comenzar tu
    búsqueda." si falta el departamento.
  - Escenario 3: error si la fecha de salida es igual o anterior a la
    llegada.
  - Escenario 4: selector de municipio dependiente del departamento y
    filtro aplicado en `src/pages/Results.tsx`.
  - Escenario 5: solo hoteles con estado "aprobado" son visibles.
- `npm run typecheck` sin errores.

### Cambiado
- Comentarios de `src/pages/Home.tsx` y `src/pages/Results.tsx` ahora
  referencian HU-006 (antes citaban HU-001 por numeración antigua).
- Estado de HU-006 actualizado a ✅ Terminada en su documento y en
  `Orden de Historias de Usuarios.md`.

### Integrado (v0.17.0 y v0.18.0 del remoto, renumeradas en esta fusión)
- HU-004 Recuperar contraseña y HU-005 Gestionar perfil: páginas
  `ForgotPassword`, `ResetPassword` y `Profile`, rutas nuevas y
  funciones de Supabase (`olvidarContrasena`, `restablecerContrasena`,
  `actualizarPerfil`).

---

## [v0.18.0] — 2026-09-07 · HU-004: Recuperar contraseña

### Agregado
- **Página "Recuperar contraseña"** (`src/pages/ForgotPassword.tsx`): formulario
  para ingresar correo y enviar enlace de restablecimiento via Supabase.
- **Página "Restablecer contraseña"** (`src/pages/ResetPassword.tsx`): formulario
  para ingresar nueva contraseña con confirmación, validación de 6 caracteres
  mínimo y toggle de visibilidad.
- **Función `olvidarContrasena()`** en `src/store.tsx`: llama a
  `supabase.auth.resetPasswordForEmail()` con redirect a la app.
- **Función `restablecerContrasena()`** en `src/store.tsx`: llama a
  `supabase.auth.updateUser({ password })` para guardar la nueva contraseña.
- **Enlace "¿Olvidaste tu contraseña?"** en el modal de login (`src/layout.tsx`).
- **Rutas `recuperar` y `restablecer`** agregadas al sistema de rutas.
- **Archivo `HU-004-recuperar-contrasena.md`** con criterios BDD.

### Modificado
- `src/store.tsx`: agregadas funciones `olvidarContrasena()` y
  `restablecerContrasena()` al contexto y tipo `AppCtx`.
- `src/App.tsx`: import y cases para las nuevas páginas.
- `src/rutas.ts`: tipos `recuperar` y `restablecer` agregados.

---

## [v0.17.0] — 2026-09-07 · HU-005: Gestionar perfil

### Agregado
- **Página de perfil** (`src/pages/Profile.tsx`): muestra datos del usuario
  autenticado (nombre, correo, teléfono, dirección) con diseño Hotelica.
- **Modo edición**: botón "Editar perfil" habilita inputs para nombre,
  teléfono y dirección. Correo electrónico bloqueado con candado.
- **Validaciones frontend**: nombre (mín. 3 chars), teléfono (formato válido),
  dirección (mín. 5 chars). Mensajes de error debajo de cada campo.
- **Feedback visual**: toast "¡Guardado exitosamente!" al guardar, toast de
  error si falla. Botón "Guardando..." deshabilitado durante la carga.
- **Botón Cancelar**: restaura valores originales y sale del modo edición.
- **Icono `IconoUsuario`** en `src/icons.tsx` para el perfil.
- **Ruta `perfil`** agregada al sistema de rutas (`src/rutas.ts`).
- **Función `actualizarPerfil()`** en `src/store.tsx`: actualiza datos
  via `supabase.auth.updateUser()` y estado local.
- **Tipo `Usuario`** extendido con campos `correo`, `telefono` y `direccion`.
- **Enlace "Mi perfil"** en el navbar (desktop y móvil) cuando hay sesión.
- **Archivo `HU-005-gestionar-perfil.md`** con criterios BDD.

### Modificado
- `src/store.tsx`: tipo `Usuario` con nuevos campos, funciones `login()`,
  `registrar()`, `loginSocial()` actualizadas para incluir correo/teléfono/dirección.
- `src/App.tsx`: ruta `perfil` agregada como ruta protegida y case en el switch.
- `src/layout.tsx`: botón de usuario autenticado ahora es un enlace al perfil
  con icono, y se agregó "Mi perfil" al menú móvil.

---

## [v0.16.0] — 2026-09-02 · HU-003: Cierre de sesión con Supabase

### Modificado
- **`logout()`** en `src/store.tsx`: ahora llama a `supabase.auth.signOut()`
  antes de limpiar el estado local.

---

## [v0.15.0] — 2026-09-01 · HU-002: Inicio de sesión con Supabase Auth

### Modificado
- **`login()`** en `src/store.tsx`: ahora usa `supabase.auth.signInWithPassword()`
  en lugar de login simulado. Retorna errores amigables.
- **`manejarLogin()`** en `src/layout.tsx`: handler async con loading state
  y manejo de errores de Supabase.
- **Botón de login**: muestra "Iniciando..." mientras carga.
- **Modal de login**: botón deshabilitado durante la carga.

### Corregido
- **Modal**: posición del scroll se guarda y restaura al cerrar (no salta al inicio).

---

## [v0.14.0] — 2026-09-01 · HU-001: Registro con Supabase Auth

### Agregado
- **Función `registrar()`** en `src/store.tsx`: registro real con Supabase Auth,
  creación automática de perfil via trigger, mensajes de error amigables.
- **Modal de registro** en `src/layout.tsx`: formulario con nombre, correo y
  contraseña, validación de campos vacíos y contraseña mínima (6 caracteres).
- **Botón "Registrarse"** en el header junto al botón de login.
- **Cliente Supabase** en `src/lib/supabase.ts` con anon key.
- **Tipos de entorno** en `src/vite-env.d.ts` para `import.meta.env`.

### Modificado
- `src/store.tsx`: agregada función `registrar()` al contexto y tipo `AppCtx`.
- `src/layout.tsx`: estados del modal de registro, handler `manejarRegistro`,
  botón de registro en header.

---

## [v0.13.0] — 2026-08-31 · Espacios verticales del logo en footer reducidos

### Modificado
- **Footer** (`src/layout.tsx`): padding vertical reducido a `pt-2`/`pb-2`,
  gap entre columnas `gap-6`, margen superior del footer `mt-10`, gap del
  contenedor del logo `gap-1.5`, margen del botón `mt-1`.

---

## [v0.12.0] — 2026-08-31 · Ajuste de logo en footer

### Modificado
- **Logo en footer** (`src/layout.tsx`): tamaño aumentado a `tam="enorme"` (h-70) y
  espacios verticales reducidos (`pt-4`/`pb-4`, márgenes `mt-1`/`mt-2`).

---

## [v0.11.0] — 2026-08-31 · Corrección de logotipo: asset oficial

### Agregado
- **Asset oficial del logo** en `src/assets/logo-hotelica.png` (volcán
  con sol y humo, diseño del Product Owner).
- **Componente `Marca` reestructurado** (`src/ui.tsx`):
  - Layout flex-row: icono del volcán a la izquierda + texto a la derecha.
  - Icono: `<img>` con el asset oficial, alturas proporcionales (h-8 a h-16).
  - Título "HOTELICA": Libre Baskerville 700, `#0B3540`, tracking-wide.
  - Subtítulo: "Tu destino en Nicaragua" con líneas doradas `#D4AF37` a los lados.
  - 4 variantes de tamaño: chica, md, grande, enorme.
  - Nueva prop `conIcono` (default true) para controlar la muestra del icono.
- **Splash y footer** ahora usan `Marca` directamente (sin `LogoMark` separado).

### Eliminado
- SVG inline del volcán en `LogoMark` (reemplazado por asset PNG).
- Prop `oscura` del componente `Marca` (ya no se usa; colores unificados).

### Cambiado
- Header, footer, splash y modal de reserva muestran la marca con
  el icono del volcán oficial + texto teal + guiones dorados.

## [v0.10.0] — 2026-08-31 · Ajuste de colores de marca

### Cambiado
- **Marca unificada ajustada a propuesta oficial** (fondo claro):
  - Nombre "HOTELICA": teal `#0B3540` (antes era el mismo, confirmado).
  - Subtítulo "Tu destino en Nicaragua": teal `#115E59` (antes `#177E8C`).
  - Líneas decorativas doradas: `#D4AF37` (antes `#E0A83C`).
- Variante `.oscura` (footer, header sobre hero): texto blanco `#F8F6F0`,
  tag celeste `#8FD3DE`, guiones dorados `#D4AF37`.
- Los 5 puntos de uso de `Marca` (header, selector de rol, splash,
  footer, modal de reserva) aplican los colores correctos según
  el fondo subyacente.

## [v0.9.0] — 2026-08-31 · Product Backlog oficial (36 HUs)

### Agregado
- **Product Backlog oficial refinado** con 36 Historias de Usuario
  (HU-000 a HU-035) organizadas en 6 módulos: Infraestructura,
  Autenticación, Búsqueda, Reservas, Gestión Hotel y Administración.
- **Documentación detallada** con criterios MoSCoW y escenarios BDD
  para cada HU del Sprint 1.
- **Archivos individuales creados** en `historias-usuario/`:
  - `HU-001-registrarse.md` — Registro en la plataforma (Alta)
  - `HU-002-iniciar-sesion.md` — Iniciar sesión (Alta)
  - `HU-003-cerrar-sesion.md` — Cerrar sesión (Alta)
  - `HU-006-buscar-hoteles.md` — Buscar hoteles por departamento (Alta)

### Cambiado
- Se reemplazó la numeración antigua (4 HUs) por la nueva estructura
  oficial (36 HUs) en `Orden de Historias de Usuarios.md`.
- Se eliminó el archivo antiguo `HU-001-login.md` (reemplazado por
  `HU-002-iniciar-sesion.md` según la nueva numeración).

## [v0.7.0] — 2026-08-31 · Sprint 1: Login e Idioma

### Agregado
- **HU-001 — Login simulado**: campo de correo, contraseña, botón "Iniciar sesión"
  y botones sociales simulados (Google, Facebook, Apple) que登录 directo como
  "Turista Demo". Validación de campos vacíos con mensaje de error en rojo.
- **Estado global de usuario** (`src/store.tsx`): campo `usuario` con tipo
  `{ nombre, rol } | null`, acciones `login()`, `loginSocial()`, `logout()`.
  Persistencia en `localStorage` (clave `hotelica-usuario`).
- **Modal de login** en el header (`src/layout.tsx`): se abre con el botón
  "Iniciar sesión" y se cierra con Escape o botón X.
- **Botón de sesión en header**: si `usuario` es null muestra "Iniciar sesión";
  si existe, muestra "Hola, {nombre}" + "Cerrar sesión".
- **HU-002 — Selector de idioma ES/EN**: toggle `ES | EN` en el header.
  Diccionario de traducciones en `src/i18n.ts` con 26 claves (header, home,
  login). Persistencia en `localStorage` (clave `hotelica-idioma`).
- **Textos traducidos** en el header, menú móvil, footer y sección hero
  de Home.tsx.
- **Protección de rutas** (`src/App.tsx`): rutas `reservas`, `panel` y
  `admin` redirigen a inicio si `usuario` es null.
- **Archivos de documentación**: `Orden de Historias de Usuarios.md`
  (Product Backlog actualizado) y `historias-usuario/HU-001-login.md`
  (plantilla INVEST con BDD).

### Cambiado
- `App.tsx` separado en `AppInner` (usa `useApp`) y `App` (envuelve con
  `AppProvider`) para respetar las reglas de hooks.
- `layout.tsx`: variable `usuario` renombrada a `usuarioDemo` para evitar
  conflicto con el nuevo campo `usuario` del store.

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
