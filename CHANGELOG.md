# CHANGELOG — Hotelica 🇳🇮

Bitácora de avances del proyecto (convención: una entrada por versión).

Las versiones v0.1.0 – v0.3.0 (estructura de carpetas, plantilla de historias
de usuario y base de datos `hotelica.sql`) quedaron registradas en la bitácora
académica del curso.

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
