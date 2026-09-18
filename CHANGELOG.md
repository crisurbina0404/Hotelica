# CHANGELOG — Hotelica 🇳🇮

Bitácora de avances del proyecto (convención: una entrada por versión).

Las versiones v0.1.0 – v0.3.0 (estructura de carpetas, plantilla de historias
de usuario y base de datos `hotelica.sql`) quedaron registradas en la bitácora
académica del curso.

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
