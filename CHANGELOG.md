# CHANGELOG — Hotelica 🇳🇮

Bitácora de avances del proyecto (convención: una entrada por versión).

Las versiones v0.1.0 – v0.3.0 (estructura de carpetas, plantilla de historias
de usuario y base de datos `hotelica.sql`) quedaron registradas en la bitácora
del proyecto.

## [v0.78.0] — 2026-10-29 · Las credenciales dejan de viajar por correo (Edge Functions seguras)

### Corregido (seguridad, módulo aprobación de hoteles)
- **La contraseña temporal ya no va en el correo del hotelero (HU-021)** — el correo de aprobación incluía la contraseña en texto plano: quedaba legible para siempre en la bandeja del dueño y en el correo de Brevo. Ahora la función `enviar-cuenta-hotelero` crea el usuario real del hotelero en Supabase Auth (con una contraseña inventada que nadie recibe) y manda un **enlace de un solo uso** para que el dueño defina su propia contraseña en la pantalla "Restablecer contraseña" que ya existía. El email pasa a ser un botón "Definir mi contraseña" con instrucciones.
- **La Edge Function solo responde a administradores con sesión** — antes cualquiera con sesión (o sin ella, según la config) podía pedir invitaciones para cualquier correo. Ahora valida el token contra la tabla `administradores` con el rol de servicio y rechaza con 401/403 a quien no lo sea.
- **Espejo en la app** — `enviarCuentaHotelero` ya no manda `contrasena` en el cuerpo; el modal del panel del admin ya no muestra ninguna contraseña ("No se envían contraseñas por correo"); el login y la recarga de página deciden el rol Hotel con la tabla `usuarios` de la base (`rolDeLaBase`), para que el dueño que definió su contraseña desde otro navegador entre a su panel; y `cambiarContrasenaHotelero` ahora sabe cambiar contraseñas de cuentas reales de Supabase (verifica la actual volviendo a entrar antes de actualizar). Las cuentas locales de demo del admin siguen funcionando igual que antes.
- **Inyección de HTML en los 3 correos** — nombre del dueño, nombre del hotel, folio, huéspedes, montos, referencia, motivo del rechazo y compañía se interpolan ahora con `escaparHtml()`: un hotel "falso" con `<script>` dentro del nombre ya no puede disfrazarse de correo legítimo de Hotelica. En el correo de reservas los montos y números además solo cuentan si son números de verdad.

### Pruebas
- `npx tsc --noEmit` sin errores; HU-021 actualizada (escenarios 7–10 y notas) para describir el flujo con enlace.

### Pendiente de desplegar
- `supabase functions deploy enviar-cuenta-hotelero` (y si se quiere, las otras dos); el `ORIGEN_APP` es opcional: por defecto regresa a `https://hotelica.vercel.app`.

---

## [v0.77.0] — 2026-10-29 · Validaciones más estrictas y sincronización sin huecos

### Corregido (módulo autenticación + reservas + inscripción)
- **La reserva se revalida en el store (HU-013/HU-014)** — `crearReserva` ahora rechaza fechas al pasado, fuerza al menos una noche, limita los huéspedes a la capacidad de la habitación y recalcula noches/subtotal/IVA/total con el precio real de la base. Antes confiaba ciegamente en lo que venía del modal de reserva; así ninguna fila rota llega a la tabla `reservas` de Supabase aunque alguien se salte la interfaz.
- **El turista nace con contraseña segura (HU-001/HU-004)** — el registro pide la misma política que el hotelero (mínimo 8 caracteres con minúscula, número y símbolo) en vez de solo 6; el correo se valida con formato (`esCorreo`) en registro, login y recuperación. Mientras se escribe la contraseña aparece la checklist en vivo (`ChecklistContrasena`) en el registro y en restablecer contraseña, igual que en el panel del hotelero. Criterios BDD de HU-001 y HU-004 actualizados.
- **La imagen de inscripción pública pasa por el canvas (HU-021)** — `elegirImagen` usa `optimizarFoto` como el panel del hotel: sale reescalada a 1280 px de ancho, en JPEG liviano y sin metadatos del archivo original, antes de irse como data URL a la columna `imagen` de `hoteles`.

### Corregido (base de datos)
- **Faltaba la política de UPDATE en `usuarios`** — la tabla de HU-033 solo tenía políticas de lectura y de alta, así que activar o desactivar una cuenta desde la consola (o renovar su nombre al iniciar sesión) fallaba con row-level security: el upsert de `subirUsuario` no podía actualizar una fila existente. Nueva migración `20261029110000_usuarios_actualizacion_rls.sql` (aplicarla desde el SQL Editor del Dashboard); el disparador `control_activo_usuario` sigue mandando: solo un admin puede cambiar quién entra.
- **Las tablas reales de `usuarios` y `reservas` estaban incompletas (verificación en vivo contra la base)** — aplicada la migración anterior, los upserts seguían fallando y la causa era otra: en el Dashboard esas dos tablas ya existían de antes con menos columnas, y como las migraciones usan `create table if not exists`, nunca las completaron con lo que la app escribe. En `usuarios` faltaba `nombre` (la base lo tiene como `nombres`) y `rol`; en `reservas` faltaban `correo`, `telefono`, `comentarios`, `motivo_rechazo`, `checkin_en` y `checkout_en`. Cada `subirReserva` fallaba por eso y la tabla estaba vacía aunque el flujo de reservas funcionara en pantalla. Nueva migración `20261029120000_ajuste_usuarios_reservas_columnas.sql` con los `alter table add column if not exists` y el respaldo de `nombres` → `nombre`. Verificación columna a columna de las 6 tablas contra la base real por PostgREST: `hoteles` (19), `habitaciones` (9), `resenas` (7) y `administradores` (2) completas.

### Verificación
- `npx tsc --noEmit` sin errores; revisión campo a campo de los mapeos de `src/sync.ts` contra las 7 migraciones de `supabase/migrations/` sin diferencias.
- **Verificación en vivo tras aplicar las dos migraciones nuevas:** las 8 columnas antes faltantes (`usuarios.nombre`, `usuarios.rol`, `reservas.correo/telefono/comentarios/motivo_rechazo/checkin_en/checkout_en`) ya existen en la base; las demás tablas siguen completas. Las políticas RLS respondieron como se diseñó al probarlas sin tocar datos: sin sesión el alta de cuentas se rechaza (42501) y la actualización de reservas abre la puerta del upsert (204 sin filas).

---

## [v0.76.0] — 2026-10-28 · Limpieza de archivos que no contribuían al proyecto

### Retirado
- **Vitest por completo** — `vitest.config.ts` se quedó configurado para pruebas unitarias que nunca se escribieron (con `passWithNoTests` el `npm test` "pasaba" sin probar nada) y la dependencia era peso muerto en `node_modules`. Hoy se desinstala `vitest` y se van los scripts `test` y `test:watch`; las pruebas reales se corren con `npm run test:e2e` (Playwright, 18 pruebas). El script `typecheck` queda a la vista explícito.
- **Reporte de critique del agente de diseño** — `.impeccable/critique/2026-10-28T22-29-55Z__src-app-tsx.md` era un artefacto de sesión, no acompaña al producto.
- **Doble formato del backlog** — `docs/Product_Backlog_Hotelica.csv` duplicaba el `Product_Backlog_Hotelica.md`; el md basta.

### Verificación
- `npx tsc --noEmit` sin errores; ninguna referencia residual a vitest en `package.json`.

---

## [v0.75.0] — 2026-10-28 · Las cifras del admin salen de la base: las reservas migran a Supabase

### Corregido (módulo admin + reservas)
- **Nueva tabla `reservas` en la base** — hasta hoy las reservas solo existían en el navegador: las cifras de la consola (reservas totales, ingresos, IVA, ticket promedio, reporte por departamento) contaban datos de demostración locales y no lo que de verdad está guardado. Migración nueva `20261028130000_hu034_reservas_en_base.sql` (aplicar desde el SQL Editor del Dashboard) con todos los campos del folio, RLS igual que hoteles y el comentario de propósito en la tabla.
- **Cada cambio de reserva viaja a la base** — crear reserva, registrar pago, confirmar, cancelar, rechazar del hotel, check-in, check-out y calificar hacen su upsert por folio al momento (`subirReserva`); si la base no acepta el cambio, el aviso lo dice con el folio, porque una reserva que no está en la base no puede contar en los números.
- **Al sincronizar, en reservas la base manda por completo** — aunque venga vacía: el estado local se reemplaza por el registro de la base, así las cifras son exactas y no arrastran las reservas de demostración de este navegador. Las demás tablas siguen mezclando y conservan el contenido demo cuando la base no trae nada.
- **Fuera las turistas inventadas de la semilla** — `USUARIOS_SEED` quedó vacío: la consola lista únicamente las cuentas reales de la tabla `usuarios` más la cuenta del admin que inició sesión. El test CP-033 ahora simula la tabla de la base (como debe ser) para mostrar a las turistas.
- **CP-034 elevado** — el test ahora devuelve dos reservas "de la base" y vela por que los ingresos y el ticket promedio salgan exactos de ese registro (C$ 100.00 / C$ 50.00), sin importar lo que tenga el navegador.

### Pruebas
- Suite E2E **18/18 verdes**; `npx tsc --noEmit` y `npm run build` sin errores.

---

## [v0.74.0] — 2026-10-28 · Consola: recuadros en un solo tono y datos del admin desde la base

### Corregido (módulo admin)
- **Recuadros de cifras en un solo color** — las cuatro cifras de la consola y las cuatro de estadísticas globales volaban entre verde, dorado, azul e índigo: un semáforo que no decía nada. Ahora todos van del índigo del rol (`admin-soft`/`admin`); la variedad de color queda donde sí informa: las pastillas de estado de HU-019/031/032 (§1.4).
- **Fuera el administrador inventado** — la semilla traía la cuenta fantasma `admin@hotelica.ni / "Administración"` que nunca existió en la base: al entrar un admin real veía dos filas de administradores. Ahora la semilla solo trae turistas de ejemplo y las cuentas de admin son únicamente las reales que inician sesión.
- **Datos del admin siempre frescos de la base** — al abrir o recargar, el store pide a Supabase `getUser()` y monta el usuario con los `user_metadata` de la base (nombre, teléfono, dirección), en vez de confiar en lo que quedó guardado en el navegador; `actualizarPerfil` ya subía sus cambios a la base, así que ahora lo que se muestra es exactamente lo que la base tiene. La fila "(tu cuenta)" de la lista de usuarios y el nombre del encabezado de la consola reflejan esos datos. La sesión de hotelero (HU-021) sigue mandando y no la pisa el refresco.

### Pruebas
- Suite E2E **18/18 verdes**; `npx tsc --noEmit` sin errores; `impeccable detect` sin hallazgos en los archivos del módulo.

---

## [v0.73.0] — 2026-10-28 · La guía de diseño entra a la consola de administración

### Corregido (módulo admin: `AdminPanel.tsx` + `EstadisticasGlobales.tsx`)
- **Encabezado sin gradiente** — el banner de la consola iba con gradiente índigo (`from-admin` a `#312E81`), un patrón prohibido por la guía (§1.7: nada de gradientes violeta como decoración) y con un hexadecimal fuera de la paleta. Ahora es índigo sólido con la textura de puntos de fondos oscuros (`dot-texture-light`), y los tonos inventados `text-indigo-200` / `text-indigo-100/85` salieron a favor de tokens (`text-admin-soft`, `text-white/85`).
- **Colores de rol en su lugar (§1.3)** — en la lista de usuarios, la pastilla de Turista iba en azul pastel y la de Hotelero en dorado claro con `text-accent-dark`, que mide ~2.45:1 (muy por debajo del 4.5:1 de §10.4). Turista ahora es teal (`primary-light`/`primary`), Hotelero ámbar (`hotel-soft`/`hotel`) y Admin se queda en índigo; el mismo ajuste en la tarjeta de "Usuarios activos" de las estadísticas.
- **Ingresos al dorado legible** — la tarjeta de "Ingresos totales" bajó de `text-accent-dark` sobre dorado claro (2.45:1) al ámbar oscuro `#92400E` de la familia de estados, que contraste bien.
- **Barra del reporte sin gradiente** — la barra de "Reservas por departamento" iba de índigo a teal en gradiente; ahora índigo sólido.
- **Foco visible en el motivo de rechazo** — el textarea tenía `focus:border-danger` solo; suma `ring-2 ring-danger/25`, igual que todos los campos del sitio (§10.4).
- **Copy sin notación académica (§10.5)** — fuera el "Σ de reservas…" y el "Ingresos = Σ(total…)": la regla ahora se cuenta en palabras. El test CP-034 siguió el cambio.

### Pruebas
- Suite E2E **18/18 verdes**; `npx tsc --noEmit` y `npm run build` sin errores.
- `impeccable detect` sobre los dos archivos del módulo: **0 hallazgos**.

---

## [v0.72.0] — 2026-10-28 · Ronda de diseño: contraste del oro, portada en móvil y pulido del comprobante

### Corregido
- **Botones dorados sobre blanco** — los botones con fondo `bg-accent` y texto blanco quedaban en 1,9:1 de contraste. Ahora el texto sobre la familia dorada es `text-primary-ink` (teal profundo): los 9 elementos dorados medidos en vivo en la portada pasan, 0 fallos. El `file:text-white` que queda sobre `bg-hotel` (#B45309) mide 5,05:1 y pasa también; la regla quedó escrita en el §6 del brief `.opencode/skills/hotelica-design/SKILL.md`.
- **Huérfanas del hero y del pie** — `text-pretty` en el subtítulo del hero y en el párrafo del footer: el hero dejó de terminar en "Caribe." suelto (la última línea pasó del 12 % al 77 % de ancho) y el pie del 14 % al 23 %.
- **Portada en móvil (360 px)** — las cifras del hero van en `grid-cols-3` en una sola fila (ninguna cifra queda huérfana, `text-pretty` en cada celda); el buscador pasa de 6 campos apilados a 3 filas en parejas (departamento|municipio · llegada|salida · huéspedes|botón); el hero se compacta solo en móvil (`min-h` 560, `pt-20` y márgenes un paso más cortos, todo restaurado desde `sm:`); y el botón "Buscar hoteles" queda en una sola línea con objetivo táctil de 44 px (el ícono se oculta bajo `sm:`). El CTA termina en 769 px sobre un pliegue de 780: la búsqueda completa se ve sin scrollear (antes el botón quedaba unos 90 px bajo el pliegue).
- **Testimonios** — la primera reseña manda como cita destacada y las otras dos acompañan debajo apiladas, en vez de tres tarjetas iguales de alto desigual.
- **Comprobante descargable (`src/pages/BookingModal.tsx`)** — el HTML del comprobante declaraba las caras de la marca literales (`font-family: 'Fraunces', Georgia…`); ahora define `--font-display`, `--font-body` y `--font-brand` en su propio `:root` (es un documento aparte y no hereda `index.css`) y los usa con `var()`. También se borró el `border-left: 3px solid #177E8C` de la nota: es el patrón `side-tab` de impeccable, el borde grueso lateral que delata UI generada.
- **CSS muerto** — fuera `@keyframes floaty` y `.anim-floaty`: nadie los usaba y la animación infinita contradice la regla de movimiento finito (§5 del brief).
- **Pie de página responsive (`src/layout.tsx`)** — la retícula del pie era de una sola columna hasta `lg`, así que en celular y tablet medía ~940 px (más de una pantalla de footer). Ahora va en dos columnas desde el celular —con la marca y la columna "Hotelica" a todo el ancho para que los enlaces no se estrechen a 143 px—, en 2×2 en tablet y en las cuatro columnas de escritorio sin cambios. Medido: 360 → 785 px (antes 943), 768 → 559 px (antes una columna de ~940), 1440 → 397 px intacto; ningún bloque desborda y no hay `overflow-x` en ninguno de los tres anchos.
- **Tira de destinos sin barra visible (`src/pages/Home.tsx` + `src/index.css`)** — la tira horizontal de los 8 departamentos seguía deslizándose pero con la barra de desplazamiento pegada a las tarjetas. La tira conserva el deslizamiento con dedo o rueda (sigue siendo `overflow-x-auto` con snap) y la clase nueva `.tira-desliza` (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`) oculta la barra. Verificado a 1440: desliza (`scrollWidth` 1904 > `clientWidth` 1232), `scrollbarWidth` computado `none`, 8 tarjetas de 224×208 y sin `overflow-x` en la página.

### Pruebas
- `npx tsc --noEmit` y `npm run build` sin errores; suite E2E **18/18 verdes** (26 s).
- `impeccable detect` sobre `src/`: **0 hallazgos** (antes marcaba 4 en `BookingModal.tsx`).
- Medición en vivo en 360×780 y 1440×900: sin `overflow-x`, buscador en 3 filas con el CTA dentro del pliegue, cifras en una fila y retícula de 6 columnas en desktop.

---

## [v0.71.0] — 2026-10-28 · Segunda ronda de imperfecciones: topes de texto, motivo unificado y consulta de estado

### Corregido
- **Tope de los comentarios** — el comentario de la reserva (modal de reserva) y el de la calificación (Mis Reservas) eran los dos únicos campos de texto sin límite del sitio: se podía pegar un texto enorme y quedaba guardado tal cual. Ahora los dos textareas tienen `maxLength={500}` con su contador visible (`x/500`), y `crearReserva()` guarda el comentario limpio y recortado (`trim().slice(0, 500)`).
- **Motivo del rechazo: una sola regla** — el admin pedía 1 carácter y el hotelero 3 para el mismo tipo de motivo. Los dos lados ahora piden los mismos 3 caracteres con el mensaje de siempre (HU-027 y HU-032 dicen "obligatorio" en ambos).
- **Consulta de estado con correo a medias** — `esCorreo()` se exportó desde `src/data.ts` y la consulta pública de estado (`InscribeHotel.tsx`) revisa el formato antes de buscar: un correo sin dominio avisa "Revisá el correo: falta el @ o el dominio" en vez de caer en "no encontrado" sin explicar nada.

### Pruebas
- **`tests/CP-021-consulta-estado.spec.ts`** — abre la inscripción pública, consulta con un correo sin dominio y vela por el aviso de formato; luego con un correo bien formado y vela por el "no encontrado".
- Suite completa: **18/18 verdes** (las 17 de antes más la nueva). `npx tsc --noEmit` y `npm run build` sin errores.

### Nota (decisión, no defecto)
- El registro de turista (HU-001) sigue pidiendo 6 caracteres: la política de 8 + número + símbolo es de HU-040 y aplica al cambio de contraseña del hotelero. Las dos puertas son distintas a propósito.

---

## [v0.70.0] — 2026-10-28 · Arreglos a imperfecciones del módulo Administración, perfil y reseñas

### Corregido
- **`cambiarContrasenaHotelero` en `src/store.tsx`** — la validación de la contraseña actual corría dentro del guardado de `setDatos`, así que la respuesta de "Contraseña actualizada" salía aunque la contraseña actual estuviera mal (falso éxito). Ahora se valida contra el estado **antes** de escribir y el formulario muestra el aviso de siempre. Regresión cubierta en `tests/CP-005-cambiar-contrasena-hotelero.spec.ts` (contraseña actual errada no cambia nada; la correcta sí entra y sirve para volver a iniciar sesión).
- **`actualizarPerfil` en `src/store.tsx`** — los cambios del perfil se guardaban local aunque Supabase fallara, pero el error pasaba a la consola del navegador y el turista veía "¡Guardado exitosamente!" sin enterarse de la mitad faltante. Ahora se avisa que quedó solo en este navegador (mismo patrón que la calificación).
- **El comentario de la reseña sube a la base (HU-019)** — el texto del comentario vivía solo en el `localStorage` del que lo escribió. Se creó la tabla `resenas` (`supabase/migrations/20261028120000_hu019_resenas.sql`), se agregó `subirResena()`/`cargarResenas()` a `src/sync.ts` y la sincronización del arranque ahora trae 4 tablas, cada una con su nombre para el merge (reseñas y habitaciones también traen `hotelId` entre los campos y adivinarlos se cruzaba). Si la base no responde, el comentario queda local y se avisa.
- **Tope de los campos de texto** — nombre del perfil con tope de 60 caracteres y dirección de 120 (validación además del `maxLength`); titular de la tarjeta con tope de 60 y referencia de transferencia con tope de 30 en el modal de reserva.

### Pruebas
- `tests/CP-019-calificar-estadia.spec.ts` — el caso del promedio ahora también llena el comentario y vela por que suba completo a la base (tabla `resenas` simulada), no solo el promedio del hotel.
- `tests/ayudas.ts` — `responderSupabase()` responde también `resenas` con lista vacía para que la cuarta tabla no frene los specs de la consola.
- Suite completa: **17/17 verdes**.

## [v0.69.0] — 2026-10-28 · HU-035: centro de notificaciones de reservas para el admin

### Agregado
- **`historias-usuario/HU-035-gestionar-notificaciones-de-reservas.md`** — historia del módulo Administración (8 reglas y 8 escenarios BDD): el admin no tenía un lugar para ver los movimientos de reservas de todos los hoteles a la vez; solo el hotelero recibía avisos en su panel.
- **Sección "Notificaciones de reservas" en `src/pages/AdminPanel.tsx`** — bitácora con folio, texto, hotel y fecha con hora por evento, pastillas de tipo con los pasteles de estado del sitio, filtro por tipo (Nueva / Pago / Confirmada / Rechazada / Cancelada / Entrada / Salida), botones "Marcar vista", "Marcar leídas", "Borrar las leídas" y borrado individual; el título cuenta cuántas quedan sin ver.
- **`TipoEvento` y `EventoReserva` en `src/store.tsx`** — el modelo de la bitácora (`eventosAdmin` dentro de `Persistido`, con `?? []` para guardados viejos del navegador).
- **Registro automático en las 5 acciones de reservas de `src/store.tsx`** — crear reserva (HU-013), registrar pago (HU-018), confirmar o rechazar con motivo (HU-027), cancelar (HU-016) y check-in (HU-028) y check-out (HU-029) escriben su evento con `agregarEventoEn()` dentro del mismo `setDatos`, junto al cambio; el rechazo y la cancelación son eventos distintos.

### Corregido
- El `value` del contexto de `src/store.tsx` se memoizaba con una lista de dependencias que no traía `sincronizando`, `errorSync` y `ultimaSync`: la sección de estadísticas se quedaba en "Actualizando datos…" para siempre. Los tres entran a la lista.

### Pruebas
- **`tests/CP-035-notificaciones-admin.spec.ts`** — 2 casos que prueban la bitácora sembrada en el navegador: listar, filtrar por tipo, distinguir rechazo de cancelación, marcar vistas (una y todas), borrar en bloque y sobrevivir la recarga.

## [v0.68.0] — 2026-10-28 · HU-034: consultar estadísticas globales y estado de la consulta

### Agregado
- **`historias-usuario/HU-034-consultar-estadisticas-globales.md`** — historia del módulo Administración (8 reglas y 9 escenarios BDD): la consola listaba hoteles y cuentas pero no mostraba la foto completa de usuarios, hoteles, reservas e ingresos.
- **Sección "Estadísticas globales" en la consola (`src/pages/AdminPanel.tsx`)** — cuatro métricas con desglose (usuarios activos con turistas y hoteleros, hoteles registrados con aprobados y por aprobar, total de reservas con no canceladas y canceladas, ingresos totales con IVA), resumen del cálculo (ticket promedio e IVA incluido), aviso de registros inválidos excluidos y estado vacío.
- **Sincronización con estado en `src/store.tsx` y `src/sync.ts`** — las cargas dejan de tragarse los errores con `catch {}` vacío: devuelven `{ datos, error }` y el contexto expone `sincronizando`, `errorSync`, `ultimaSync` y `reintentarSync()`; cada tabla se mezcla en cuanto responde, así que la carga lenta de una no frena a las demás.
- **`TarjetaMetrica` en `src/ui.tsx`** — tarjeta de indicador con ícono, esqueleto que pulsa mientras llega el dato y desglose.
- **Exportación del reporte en `src/exportarEstadisticas.ts`** — PDF con la marca y Excel desde la pantalla, con fecha de generación, alcance de los datos y detalle del cálculo (`hotelica-estadisticas-YYYY-MM-DD.pdf/xlsx`); las librerías `jspdf`, `jspdf-autotable` y `xlsx` cargan solo al exportar.

### Pruebas
- **`tests/CP-034-estadisticas-globales.spec.ts`** — 2 casos: las cuatro métricas con su desglose, la regla de ingresos explicada y el PDF que baja con su nombre con fecha; y el aviso de base caída con botón Reintentar y los datos locales en pantalla.

## [v0.67.0] — 2026-10-26 · HU-033: activar o desactivar usuarios desde la consola

### Agregado
- **`historias-usuario/HU-033-activar-desactivar-usuarios.md`** — historia del módulo Administración con 8 reglas y los escenarios de las subtareas HOTELICA-275 a 281: el admin podía crear cuentas (HU-021) pero no había manera de cortarle el acceso a una cuenta desde la plataforma.
- **Sección "Usuarios de la plataforma" en `src/pages/AdminPanel.tsx`** — lista cada cuenta con avatar, nombre, correo, pastilla de rol (Turista / Hotelero / Admin) y estado (Activo / Desactivado), con chips de filtro por rol; el botón de cada fila ofrece siempre lo contrario del estado actual ("Desactivar" a los activos y "Activar" a los desactivados).
- **`UsuarioPlataforma` y `USUARIOS_SEED` en `src/data.ts`** — el registro de cuentas de la plataforma (correo como llave, nombre, rol, activo y fecha de creación), con tres cuentas de ejemplo para ver la consola completa desde la primera visita.
- **`usuarios` en el estado global (`src/store.tsx`)** — `cambiarEstadoUsuario()` valida que el usuario exista, que no se pida el mismo estado y que nadie se desactive a sí mismo (la propia fila del admin es de solo lectura); luego cambia el estado al instante y sube la fila con `subirUsuario()`. Las cuentas se registran solas: el turista al registrarse o entrar, el hotelero al aprobarse su hotel y el admin al confirmarse su rol.
- **Bloqueo de acceso** — `login()` revisa el estado antes de abrir sesión: una cuenta de hotelero desactivada no entra y, en el camino de Supabase, la sesión recién abierta se cierra con `signOut()` y se explica el motivo.
- **`supabase/migrations/20261026150000_hu033_usuarios_activo.sql`** — tabla `usuarios` (lectura con sesión iniciada) y disparador `controlar_activo_usuario`, que solo deja cambiar `activo` a un administrador autenticado (misma vía que `controlar_estado_hotel` de HU-042). Se corre desde el SQL Editor del Dashboard.
- **`tests/CP-033-activar-desactivar.spec.ts`** — 3 pruebas: la lista con filtro por rol y la propia fila sin botón; la desactivación con aviso, pastilla y `activo = FALSE` subido a la base (y la reactivación con `activo = TRUE`); y el intento de iniciar sesión bloqueado para un turista y un hotelero desactivados.

### Cambiado
- **`src/sync.ts`** — `UsuarioFila`, `aFilaUsuario()`, `deFilaUsuario()`, `cargarUsuarios()`, `subirUsuario()` y `fusionarUsuarios()` (la base manda por correo). Los usuarios se cargan en un `useEffect` propio: si la tabla no responde, la carga de hoteles y habitaciones no se frena.
- **`decidirHotel()` en `src/store.tsx`** — al crear la cuenta del hotelero (HU-021) también la registra en la tabla de usuarios de la plataforma.
- **`historias-usuario/Orden de Historias de Usuarios.md`** — HU-033 pasa a ✅ Terminada.

### Verificado
`npm run typecheck` y `npm run build` sin errores. `npx playwright test` → **12 pruebas pasan**: las 3 nuevas de la HU-033 más las 2 de la HU-031, la 1 de la HU-019, las 2 de la HU-032 y las 4 de la HU-042.

### Limitación
Hay que **correr la migración `20261026150000_hu033_usuarios_activo.sql` desde el SQL Editor** (una sola vez); hasta que se corra, los cambios de estado quedan guardados en el navegador y la app avisa que no se pudo subir a la base. La desactivación corta el próximo inicio de sesión; cerrar la sesión ya abierta de ese usuario depende de Supabase Auth y queda fuera de esta historia.

---

## [v0.66.0] — 2026-10-26 · HU-032: el hotelero recibe el rechazo por correo con el motivo

### Agregado
- **`supabase/functions/enviar-rechazo-hotelero/index.ts`** — Edge Function con Brevo (misma estructura y secrets que `enviar-cuenta-hotelero`): recibe dueño, correo, hotel y motivo, y manda un correo con asunto "Tu hotel X no fue aprobado — Hotelica". El HTML trae el motivo resaltado en un bloque rojo y los pasos para corregir los datos y volver a inscribir el hotel.
- **`enviarRechazoHotelero()` en `src/store.tsx`** — patrón idéntico a `enviarCuentaHotelero()`: llama a la function con el token de la sesión y devuelve `{ ok }` o `{ error }`.
- **HU-032 ampliada** — regla 3, regla 7, Escenario 5 (HOTELICA-272) y MoSCoW: el correo automático con el motivo pasó de "podría tener" a ser parte de la notificación obligatoria (junto al aviso del panel); notas de implementación actualizadas.

### Cambiado
- **`src/pages/AdminPanel.tsx`** — `confirmarRechazo()` ahora es async: después de rechazar (estado, aviso del panel y toast) cierra el formulario y, si el hotel tiene `correoDueno`, manda el correo; si el envío falla, avisa con toast de error pero el rechazo y el aviso del panel ya quedaron hechos.

### Verificado
`npm run typecheck` y `npm run build` sin errores. `npx playwright test` → **9 pruebas pasan**: la CP-032 ahora intercepta la llamada a `functions/v1/enviar-rechazo-hotelero` y exige que el cuerpo traiga el dueño, el correo, el hotel y el motivo, más el toast "Correo de rechazo enviado a ..."; el caso sin correo del dueño comprueba que no aparece ningún toast de correo.

### Despliegue
La function quedó desplegada en el proyecto el mismo día con `npx supabase functions deploy enviar-rechazo-hotelero` (la CLI ya estaba logueada); usa los secrets de Brevo `BREVO_API_KEY` y `BREVO_SENDER_EMAIL` que ya existían en el proyecto. Si se cambia el HTML, se repite ese comando.

---

## [v0.65.1] — 2026-10-26 · HU-032: el motivo del rechazo ahora sí llega a la base

### Corregido
- **`src/store.tsx`** — al rechazar, la fila que se sube a Supabase se armaba con la foto del hotel capturada *antes* de guardar el motivo, así que `motivo_rechazo` llegaba `null` a la tabla `hoteles` aunque en el navegador el motivo sí quedara guardado (se veía en la consulta y en el historial, pero no en la base). Ahora `decidirHotel()` manda el motivo en la misma subida.

### Verificado
`npm run typecheck` y `npm run build` sin errores. `npx playwright test` → **9 pruebas pasan**: la CP-032 ahora intercepta la fila que la app sube y exige `aprobado = 'rechazado'` y `motivo_rechazo` con el texto que escribió el admin; se comprobó que sin el fix esa prueba falla con `null`.

---


## [v0.65.0] — 2026-10-26 · HU-032: rechazar un hotel con motivo obligatorio

### Agregado
- **`historias-usuario/HU-032-rechazar-un-hotel.md`** — historia del módulo Administración con 8 reglas, 6 escenarios BDD y las subtareas HOTELICA-268 a 273: el admin ya tenía el botón "Rechazar", pero ejecutaba el rechazo de golpe, sin confirmación y sin dejar constancia de por qué.
- **Modal de rechazo en `src/pages/AdminPanel.tsx`** — al pulsar "Rechazar" (bandeja o modal de revisión) se abre un formulario con los requisitos incumplidos del hotel y un motivo obligatorio; si el motivo está vacío muestra el error y el hotel sigue pendiente.
- **`motivoRechazo` en el tipo `Hotel` (`src/data.ts`)** — el motivo queda registrado con el hotel y se muestra en el historial de la consola y en la consulta pública de solicitud de `InscribeHotel` (el único lugar donde el dueño de un hotel rechazado puede enterarse, porque nunca tuvo cuenta).
- **Notificación al hotel** — `avisarHotel()` deja el aviso "Hotel rechazado por Hotelica: ..." en "Avisos recientes" del panel del hotel.
- **`supabase/migrations/20261026120000_hu032_motivo_rechazo.sql`** — columna `motivo_rechazo` en la tabla `hoteles`, para que el motivo viaje a la base en vez de quedarse solo en el navegador (se corre desde el SQL Editor del Dashboard, igual que la de HU-042).
- **`tests/CP-032-rechazar-hotel.spec.ts`** — 2 pruebas que cubren los 6 escenarios: rechazo con motivo desde la bandeja (validación, cambio de estado, historial con pastilla y motivo, aviso al hotel, consulta pública y el motivo que sobrevive a la recarga) y un hotel incompleto que muestra sus requisitos al rechazarlo.

### Cambiado
- **`src/store.tsx`** — `decidirHotel()` acepta el motivo opcional y lo guarda en el hotel junto con `aprobado: "rechazado"`.
- **`src/pages/AdminPanel.tsx`** — `rechazar()` ya no decide al vuelo: abre el formulario de rechazo (antes cambiaba el estado sin confirmación ni motivo).
- **`src/sync.ts`** — `HotelFila`, `aFilaHotel()` y `deFilaHotel()` traducen la nueva columna `motivo_rechazo`; `completarHotelDesdeLocal()` respeta el motivo que venga de la base y, si no trae ninguno, conserva el local: antes el merge lo borraba al recargar.

### Verificado
`npm run typecheck` y `npm run build` sin errores. `npx playwright test` → **9 pruebas pasan**: las 2 nuevas de la HU-032 (una de ellas recarga dos veces y comprueba que el motivo no se pierde ni sin la columna ni con ella) más las 2 de la HU-031, la 1 de la HU-019 y las 4 de la HU-042.

### Limitación
Hay que **correr la migración `20261026120000_hu032_motivo_rechazo.sql` desde el SQL Editor** (una sola vez); hasta que se corra, los guardados de hoteles en la base fallan y la app avisa que el hotel quedó solo en el navegador. La notificación al hotel sigue siendo un aviso del panel y no un correo (no hay Edge Function genérica de correos).

---


## [v0.64.1] — 2026-10-26 · HU-019: la calificación ya no se pierde al recargar (el promedio sube de verdad)

### Corregido
- **`src/store.tsx` + `src/sync.ts`** — al calificar, el promedio nuevo solo se guardaba en el navegador. Como al recargar los hoteles se vuelven a traer de Supabase y la base manda sobre lo local (`fusionarHoteles`), la tarjeta volvía a mostrar `0.0` y `0 reseñas` aunque la reserva siguiera marcada como calificada. Ahora `calificar()` calcula el promedio una vez, lo guarda en el navegador **y** lo sube a la tabla `hoteles` con `subirCalificacion()` (columnas `rating` y `total_resenas`); si la base no responde, avisa que la calificación quedó solo en el navegador.

### Verificado
`npm run typecheck` y `npm run build` sin errores. `npx playwright test` → **7 pruebas pasan**: la nueva `tests/CP-019-calificar-estadia.spec.ts` deja una reserva terminada, califica con 5 estrellas, ve `5.0` y `1 reseñas` en la tarjeta y, tras recargar, sigue viéndolos (además confirma que el `PATCH` con el promedio llegó a la base); se comprobó que sin el fix esa prueba falla. Las 2 de HU-031 y las 4 de HU-042 siguen en verde.

### Limitación
El comentario de la calificación y el registro de `calificaciones` siguen guardándose solo en el navegador: no existe tabla para ellos en la base todavía, así que otro dispositivo no vería el texto de la reseña (el promedio sí, porque viaja en `hoteles`).

---

## [v0.64.0] — 2026-10-26 · HU-042: la consola de admin ya no se abre con el demo, solo con una cuenta real

### Agregado
- **`historias-usuario/HU-042-acceso-del-administrador.md`** — historia del módulo Administración, con 7 reglas, 6 escenarios BDD y las subtareas HOTELICA-274 a 279: cualquiera podía entrar a la consola (aprobar hoteles, crear cuentas, ver ingresos) con el botón "Demo admin" o con el rol `admin` escrito a mano en el navegador.
- **`supabase/migrations/20261026090000_hu042_acceso_administrador.sql`** — tabla `administradores` (solo lectura con sesión iniciada), función `es_admin()` (security definer) y disparador `controlar_estado_hotel` que rechaza cambios de `aprobado` hechos sin sesión de administrador con el mensaje "Solo un administrador puede aprobar o rechazar un hotel".
- **`tests/ayudas.ts`** — ayudas compartidas de las pruebas E2E: cortan la red externa y simulan el login de Supabase y la lista de administradores, para probar la consola sin tocar la base real ni mandar correos.
- **`tests/CP-042-acceso-admin.spec.ts`** — 4 pruebas: el botón demo ya no existe y el rol `admin` escrito a mano no abre la consola; solo un correo de la lista entra y "Cerrar sesión" lo saca; un turista nunca ve la consola; si el correo sale de la lista, al recargar vuelve a turista.

### Cambiado
- **`src/store.tsx`** — `login()` puede devolver `"Admin"` y, tras consultar `administradores` con `esAdministrador()`, asume el rol solo si el correo está en la lista; un `useEffect` vuelve a verificar la sesión al recargar y baja el rol a turista si ya no califica; el rol `admin` ya no se guarda en `localStorage` (se confirma en cada carga); sin sesión al arrancar, la app queda en turista.
- **`src/layout.tsx`** — desaparecen el botón "Demo admin", `entrarAlAdmin()` y `salirDelAdmin()`; `manejarLogin` lleva al administrador directo a la consola, igual que el hotelero va a su panel.
- **`src/App.tsx`** — `puedeVer("admin")` exige `rol === "admin"` **y** un usuario con sesión.
- **`tests/CP-031-aprobar-hotel.spec.ts`** — dejó de usar el botón demo: ahora entra con login de administrador (ayudas de `tests/ayudas.ts`).

### Verificado
`npm run typecheck` y `npm run build` sin errores. `npx playwright test` → **6 pruebas pasan**: las 2 de la HU-031 (aprobar los pendientes con sus avisos y modal, y bloquear un hotel incompleto) más las 4 de la HU-042. Sin errores en la consola del navegador.

### Limitación
Los escenarios 1, 4 y 6 de la regla del servidor (disparador de `aprobado`) se verifican en el SQL Editor del Dashboard de Supabase, no en Playwright; además hay que correr la migración y agregar el correo del admin real a `administradores` antes de usar la consola en la base real. RLS de la Fase 2 sigue abierto: solo se blindó el cambio de `aprobado`.

---

## [v0.63.0] — 2026-10-26 · HU-031: el admin aprueba un hotel y revisa los faltantes antes de publicarlo

### Agregado
- **`historias-usuario/HU-031-aprobar-un-hotel.md`** — historia del módulo Administración, con 6 escenarios BDD y las subtareas HOTELICA-261 a 266. El backlog la marcaba como escrita, pero el archivo no existía: se redactó primero, como en la HU-030.
- **`src/data.ts`** — `requisitosIncompletos()` devuelve la lista de lo que un hotel necesita para que el admin lo pueda aprobar: foto representativa, descripción de 30 caracteres, dirección de 8, departamento y municipio válidos, pin en el mapa y el correo del dueño.
- **`tests/CP-031-aprobar-hotel.spec.ts`** — primera prueba E2E del proyecto (`npm run test:e2e`): aprueba los dos hoteles pendientes de la semilla y verifica que un hotel incompleto no pase. Corre con Supabase y el traductor de Google bloqueados para no tocar la base ni mandar correos reales.

### Cambiado
- **`src/pages/AdminPanel.tsx`** — `aprobar()` ahora revisa los requisitos mínimos antes de decidir: si falta algo, muestra un aviso con lo que falta y el hotel sigue pendiente (subtarea HOTELICA-263, que era la única de la HU que faltaba). El encabezado del archivo y el comentario de la sección pasan de HU-009 a HU-031.
- **`src/data.ts`** — los dos hoteles pendientes de la semilla (Mirador de Catarina y Posada Volcán Telica) ahora traen `correoDueno`: sin correo del dueño no hay cuenta que crear ni notificación que enviar, así que la nueva validación los habría dejado sin salida en la demo.

### Verificado
`npm run typecheck` y `npm run build` sin errores. `npx playwright test` → **2 pruebas pasan**: (1) la bandeja lista las 2 solicitudes, al aprobar aparece el aviso, el modal con las credenciales del dueño y el error del correo sin Supabase, el hotel sale de la bandeja, queda en el historial y guardado como `aprobado` en el navegador; al aprobar el segundo aparece "Bandeja al día" y ya no queda botón "Aprobar"; (2) un hotel sin foto, descripción, dirección completa, pin ni correo no se aprueba: se lista cada faltante y sigue en `pendiente`. Sin errores en la consola del navegador.

### Limitación
La subida a la base de datos y el correo real se ejercitan en su camino de error (la red está cortada en la prueba), así que el envío efectivo del correo de credenciales sigue sin evidencia automatizada.

## [v0.62.7] — 2026-10-25 · Video para hoteleros: plantilla, storyboard y guion ElevenLabs

### Agregado
- **`video-estudio/VIDEO-HOTELEROS.md`** — storyboard por segundos del video orientado a dueños de hotel: problema (cuaderno/chats/tarifas), publicar el hotel (HU-021/023/024/025), gestionar reservas con badges de estado oficiales (HU-026/027), llegadas y salidas del día (HU-028/029), ocupación y sello verificado (HU-030), y cierre de marca. ~18 s de voz sobre 20 s de video.
- **`video-estudio/video-hoteleros-animado.html`** — plantilla animada con el mismo motor y reglas del video turista (20 s exactos, animaciones finitas, sprite de iconos de `src/icons.tsx`, reduced-motion cubierto, versión compacta para pantallas bajas).
- **`video-estudio/GUION-HOTELEROS-ELEVENLABS.md`** — guion de locución hoteleros (46 palabras con voseo) con tiempos por segmento, tags de emoción para Eleven v3, bloques hot01–hot07 y tabla de montaje.
- **`video-estudio/voz-hoteleros-elevenlabs.txt`** — texto listo para pegar en ElevenLabs.

### Retirado (v0.62.8 — 2026-10-25)
A pedido de la autora se retiraron los guiones de locución/TTS y el video hoteleros (los archivos de las versiones v0.62.6 y v0.62.7). El material se reutilizó como base de una plantilla de prompt para producir los mismos tipos de video en otro proyecto. Quedan en `video-estudio/` los archivos originales de la entrega: `VIDEO-ESTUDIO.md` y `video-animado.html`.

---

## [v0.62.6] — 2026-10-25 · Guion de la voz listo para ElevenLabs (pausas y emociones)

### Agregado
- **`video-estudio/GUION-ELEVENLABS.md`** — guía de producción de la voz en ElevenLabs: sección de modelo (Eleven v3 con audio tags vs Multilingual v2 estable), tabla de tags de emoción usados por segmento, guion completo en una pieza y guion por segmentos (hc01–hc07) para montar cada frase sobre su escena, más reglas de ortografía pronunciada (i-ve-a, chek-in) y tabla de montaje sobre el video.
- **`video-estudio/voz-elevenlabs.txt`** — el mismo guion en texto plano, listo para pegar directo en la casilla de ElevenLabs.

### Cambiado
- **`video-estudio/GUION-VOZ-NARRACION.md`** — la sección de ElevenLabs ahora remite al documento nuevo y conserva solo los ajustes generales de la plataforma.

---

## [v0.62.5] — 2026-10-25 · La entrega del video vive en `video-estudio/` y usa el set de iconos del proyecto

### Cambiado
- **`video-estudio/`** (nueva carpeta) — `VIDEO-ESTUDIO.md` y `video-animado.html` se movieron desde la raíz del proyecto para que la entrega del video quede separada del resto del código.
- **`video-estudio/video-animado.html`** — se reemplazaron los emojis (📓📁📅🧳🏨🛡️🇳🇮) por el set de iconos SVG propio del proyecto (`src/icons.tsx`), dibujados inline en un sprite `<symbol>` + `<use>` con el mismo estilo del sitio (viewBox 24, trazo `currentColor` de 1.9 px). La plantilla ya no depende de emojis ni de librerías externas de iconos.

### Agregado
- **`video-estudio/GUION-VOZ-NARRACION.md`** — guion de locución alineado al storyboard: 7 segmentos con tiempo de entrada/duración/calzada de palabras para 20 s, dirección para locutor humano, versión SSML (voz `es-NI-FeminaNeural`, con pausas y pronunciaciadores seguros como IVA y check-in), versión para ElevenLabs y tabla de ensamblaje. El texto largo original quedó documentado como versión extendida de ~30 s.

---

## [v0.62.4] — 2026-10-25 · Reparado el video animado de la entrega de estudio

### Corregido
- **`video-animado.html`** — la plantilla fallaba al reproducirse: las fuentes oficiales (Fraunces, Outfit, Libre Baskerville) nunca se cargaban y todo caía a Georgia/Segoe UI; el modal de reserva tenía las etiquetas de los 3 pasos mal cerradas (`<span>…</div>`), lo que desencajaba el indicador; los `animation-delay` en línea no tenían animación asignada, así que las apariciones escalonadas no funcionaban; la barra de progreso se llenaba en la primera escena y ya no se reiniciaba; y la regla `prefers-reduced-motion` con `opacity: 1 !important` sobre todas las escenas las superponía una sobre otra. Se restauró el timeline a los 20 s exactos del storyboard (buscar y reservar ahora duran 4 s cada una) y se añadió una versión compacta para pantallas bajas.

---

## [v0.62.3] — 2026-10-21 · Registro: el botón abre la ventana y la X deja seguir navegando

### Corregido
- **`src/store.tsx`** — el `useMemo` que arma el contexto no incluía `registroAbierto`. El estado cambiaba por dentro, pero la barra seguía recibiendo el valor viejo: el botón "Registrarse" no abría nada y, cuando la ventana se abría desde "Reservar", la X no la cerraba (el turista quedaba obligado a registrarse). Se agregó `registroAbierto` a las dependencias.

### Verificado
`npm run typecheck` y `npm run build` sin errores. Prueba en el navegador (Playwright, sin Supabase): "Registrarse" abre la ventana; la X la cierra y se puede volver a abrir; Escape también la cierra; al pulsar "Reservar" sin sesión aparece el registro, la X lo cierra y el visitante sigue en la ficha del hotel con el botón "Reservar" disponible; el enlace "Iniciar sesión" dentro del registro cambia al formulario de login. Sin errores en la consola del navegador.

---

## [v0.62.2] — 2026-10-21 · El panel del hotel se abre solo con la cuenta; queda el demo de admin

### Cambiado
- **`src/layout.tsx`** — se quitó el selector "Cambiar de perfil" con las demos de Turista y Hotel. En la barra queda solo **"Demo admin"**, que abre la consola de administración (el único módulo que todavía no se usa con una cuenta real) y permite volver al sitio. El enlace "Panel del hotel" aparece únicamente con una cuenta de hotelero.
- **`src/App.tsx`** — el panel exige una sesión con rol Hotel (la cuenta que se crea al aprobar la inscripción); la consola de admin sigue disponible en modo demostración. Un turista con sesión ya no puede abrir el panel.
- **`src/pages/HotelPanel.tsx`** — se eliminó el hotel de respaldo `h-sanjuan`: el panel busca el hotel por el correo del hotelero logueado y, si no lo encuentra, muestra un aviso en vez de abrir otro hotel.
- **`src/store.tsx`** — el login de hotelero devuelve su rol para que la app lo lleve directo al panel (HU-021); los logins y registros de turista fuerzan el rol Turista para no arrastrar el rol anterior.

### Verificado
`npm run typecheck` y `npm run build` sin errores. Prueba en el navegador (Playwright, 1440 px, sin Supabase): sin sesión no aparece el selector de perfiles ni el enlace al panel, solo "Demo admin"; desde la consola demo se aprobó un hotel de prueba y se creó su cuenta; al iniciar sesión con esas credenciales la app abrió directo el panel de ese hotel (no el de Brisas del Pacífico); al entrar y salir de la consola demo volvió a su panel, y al cerrar sesión desapareció el acceso. Sin errores en la consola del navegador.

---

## [v0.62.1] — 2026-10-21 · Editar hotel: el guardado ya no depende del correo del dueño (HU-022)

### Corregido
- **`src/data.ts`** — nueva `validarEdicionHotel()`: aplica las reglas de la inscripción solo a los campos que se editan en el panel (nombre, departamento, municipio, dirección, ubicación, descripción y teléfono). El dueño, el correo y la imagen quedan fuera porque el formulario de edición no los muestra.
- **`src/store.tsx`** — `actualizarHotel()` usa esa validación y conserva el dueño, el correo y la imagen que ya tenía el hotel. Antes reutilizaba `validarRegistroHotel()`, que exigía un correo que el hotel de demostración no tiene: el formulario mostraba "Revisá los campos marcados" sin ningún campo visible en rojo y no guardaba nada.
- **`src/pages/HotelDetail.tsx`** — la ficha del turista muestra el teléfono que cargó el hotelero. Antes aparecía siempre "+505 2222-3333" para todos los hoteles; ahora, si el hotel no tiene teléfono, simplemente no se muestra.

### Verificado
`npm run typecheck` sin errores. Prueba en el navegador (Playwright, 1440 px, sin Supabase): el hotel demo (sin correo de dueño) guarda la descripción, cierra el formulario y muestra el toast "Cambios guardados"; el detalle del turista en Rivas (12–14 de noviembre) ya muestra la descripción nueva y el teléfono editado, y deja de mostrar el número fijo. También se revisaron nombre vacío (error visible), cambio de departamento (limpia el municipio y lista solo los de León) y hotel pendiente (edición bloqueada). Con Supabase conectado, el cambio llegó a la fila `h-sanjuan` sin tocar el dueño ni el correo; la fila se dejó como estaba. Sin errores en la consola del navegador.

---

## [v0.62.0] — 2026-10-21 · HU-030: el hotelero consulta el reporte de ocupación del mes

### Agregado
- **`historias-usuario/HU-030-reporte-de-ocupacion.md`** — historia del módulo Gestión Hotel, con 7 escenarios BDD y las subtareas HOTELICA-267 a 273. La tabla del backlog la daba por escrita, pero el archivo no existía: se redactó completa antes de tocar el código, como se hizo con HU-024, HU-025 y HU-026.
- **`src/data.ts`** — `nochesDentroDe()` recorta una estadía al rango consultado (así una reserva del 30 de octubre al 2 de noviembre suma dos noches a octubre y una a noviembre), `diasDelMes()` cuenta los días con febrero bisiesto, `rangoDelMes()` devuelve los límites del mes para filtrar y `fmtMes()` arma "octubre de 2026" para los títulos.
- **`src/pages/HotelPanel.tsx`** — función `armarReporte()` y sección **"Reporte de ocupación"** después de la gestión de reservas: selector de mes (con el mes en curso por defecto y sin meses futuros), tarjeta principal con el porcentaje y la cuenta "50 de 372 noches vendidas", tres indicadores de apoyo (noches vendidas, ingresos y estadía promedio), tabla por tipo de habitación con barra de ocupación y fila de totales, y botón "Descargar CSV".

### Cambiado
- **`src/pages/HotelPanel.tsx`** — el reporte usa la misma fórmula de ocupación de la guía de negocio, pero sobre el mes: noches vendidas entre noches disponibles (unidades × días). Las reservas canceladas no suman noches ni ingresos; las pendientes, confirmadas, check-in y completadas sí cuentan porque bloquean o bloquearon unidades.
- **`src/pages/HotelPanel.tsx`** — los ingresos se reparten por noche (`total × noches del mes ÷ noches de la estadía`), de modo que una estadía que cruza de mes no se cuenta entera dos veces, ni en el reporte ni en el CSV.

### Verificado
`typecheck` y `npm run build` sin errores. Prueba en el navegador (Playwright, 1440 px): octubre de 2026 muestra **50 de 372 noches (13 %)**, 17 reservas y **C$ 104,075.00**, con el desglose Estándar Mar 23/186 (12 %, C$ 37,030.00), Superior Bahía 17/124 (14 %, C$ 37,145.00) y Suite Surfista 10/62 (16 %, C$ 29,900.00); las filas suman exactamente el total. Septiembre y enero caen en el estado vacío ("No hubo noches vendidas…") con 0 % y el botón de descarga deshabilitado. El CSV descargado trae el nombre del hotel, el mes, los totales y el desglose, con BOM y tildes correctas (verificado byte por byte: `EF BB BF` y `í` como `U+00ED`). Sin errores en la consola del navegador.

### Limitación
Sigue sin haber pruebas automatizadas en el proyecto, así que la evidencia es la prueba manual en el navegador más `typecheck` y `build`. El panel se consulta desde el escritorio, según la restricción de la HU-039.

---

## [v0.61.2] — 2026-10-19 · Correo de aprobación: enlace real y vista en celular (HU-021)

### Cambiado
- **`supabase/functions/enviar-cuenta-hotelero/index.ts`** — el paso "Ingresa a" del correo ahora es un enlace real a `https://hotelica.vercel.app` (antes decía "hotelica.com" sin enlace). Se agregó un `@media` para pantallas de hasta 480px: las filas de las tablas de credenciales e instrucciones se apilan (etiqueta arriba, valor abajo) y se reducen paddings y títulos, para que el correo se vea prolijo en el celular.

---

## [v0.61.1] — 2026-10-19 · Selector de tipo de habitación (HU-023)

### Cambiado
- **`src/data.ts`** — nueva lista `TIPOS_HABITACION` con los ocho tipos sugeridos (Estándar Individual, Estándar Doble, Twin, Triple, Familiar, Suite, Cabaña, Bungalow) y la constante `TIPO_LIBRE` que marca la opción "Otro" del selector.
- **`src/pages/HotelPanel.tsx`** — el campo "Tipo de habitación" del formulario de registro pasó de texto libre a un selector con los tipos sugeridos y la opción "Otro (escribir el nombre)", que muestra un campo de texto para tipos a medida como "Suite del Mombacho". La validación no cambia: tipo vacío o repetido dentro del hotel sigue sin registrarse.

---

## [v0.61.0] — 2026-10-19 · Fotos de las habitaciones (HU-041)

### Agregado
- **`src/data.ts`** — `Habitacion` y `DatosHabitacion` ganan el campo `galeria: string[]` (la primera foto es la portada). Nuevo tope `MAXIMO_FOTOS_HABITACION = 4` con `cupoDeFotosHabitacion()` y `errorDeGaleriaHabitacion()`. Los 18 tipos de las semillas arrancan con galería vacía.
- **`src/store.tsx`** — acciones `agregarFotosHabitacion()`, `ponerPortadaHabitacion()` y `quitarFotoHabitacion()`: validan el tope, guardan en el estado y suben la habitación a Supabase. A diferencia del hotel, en la habitación **sí se puede quitar la última foto** (las fotos son opcionales).
- **`supabase/migrations/20261019140000_hu041_galeria_habitaciones.sql`** — script para el SQL Editor: agrega la columna `galeria` (jsonb, por defecto `[]`) a la tabla `habitaciones`. El timestamp lleva hora para no chocar con la otra migración del mismo día en el conector Supabase Preview de GitHub.

### Cambiado
- **`src/sync.ts`** — `HabitacionFila` mapea la columna nueva; `fusionarHabitaciones()` completa la galería vacía de la BD con la local (mismo criterio que `fusionarHoteles()`), para no borrar fotos si el script todavía no se corrió.
- **`src/pages/HotelPanel.tsx`** — cada tarjeta de habitación muestra su portada (o el ícono de cama si no tiene fotos) y el botón "Fotos (n/4)" que abre un modal para subir, elegir portada y quitar fotos, con la misma validación y optimización que la galería del hotel.
- **`src/pages/HotelDetail.tsx`** — la tarjeta que ve el turista muestra la foto de la habitación y, si hay varias, una tira de miniaturas para cambiar de foto; sin fotos se mantiene el ícono de siempre.

---

## [v0.60.0] — 2026-10-19 · Contraseña segura del hotelero (HU-040)

### Cambiado
- **`src/data.ts`** — la contraseña temporal del hotelero ahora dura **48 horas** (`VIDA_TEMPORAL_MS`, antes 24). Nuevas funciones `criteriosDeContrasena()`, `esContrasenaSegura()` y `errorCriteriosContrasena()`: la contraseña propia del hotelero debe tener al menos 8 caracteres, una minúscula, un número y un símbolo.
- **`src/store.tsx`** — `cambiarContrasenaHotelero(nueva, confirmar, actual?)` valida los cuatro criterios y, cuando el formulario envía la contraseña actual (cambio desde el perfil), verifica que coincida con la guardada. El mensaje de login por temporal vencida dice 48 horas.
- **`src/pages/HotelPanel.tsx`** — el banner "Cambiá tu contraseña temporal" habla de 48 horas, pide mínimo 8 caracteres y muestra las palomitas de criterios en vivo.
- **`src/pages/Profile.tsx`** — la sección "Contraseña de acceso" ahora tiene tres campos: contraseña actual, nueva y confirmar; el texto de temporal vencida dice 48 horas.
- **`src/pages/InscribeHotel.tsx`** — el aviso de aprobación recuerda cambiar la temporal en las primeras 48 horas.

### Agregado
- **`src/ui.tsx`** — componente `ChecklistContrasena`: lista reutilizable con ✓ o ✗ para los cuatro criterios, con un tono ámbar para el fondo del banner del panel.
- **`historias-usuario/HU-040-contrasena-segura-del-hotelero.md`** — historia nueva que cubre la temporal de 48 horas, los criterios con palomitas y el pedido de la contraseña actual en el perfil (lo anterior se había construido en v0.45.0/v0.46.0 sin HU).

### Nota
El registro de turista y la recuperación de contraseña (HU-001 y HU-004) **no cambian**: siguen con su mínimo de 6 caracteres, como se acordó con el usuario.

---

## [v0.59.0] — 2026-10-19 · Fase 2: hoteles y habitaciones guardados en la base de datos

### Agregado
- **`supabase/migrations/20261019120000_fase2_hoteles_habitaciones.sql`** — script para el SQL Editor del Dashboard: agrega a `hoteles` las columnas que faltaban (`correo_dueno`, `contacto`, `ubicacion` jsonb) y crea políticas de escritura sobre `hoteles` y `habitaciones` para `anon` y `authenticated`, dejando RLS activada. Sin esto la app solo podía leer (error `42501` en el INSERT). El timestamp lleva los 14 dígitos completos para no chocar con la otra migración del mismo día en el conector Supabase Preview de GitHub.
- **`src/sync.ts`** — módulo de sincronización: mapea las columnas snake_case ↔ tipos camelCase (`aFilaHotel`/`deFilaHotel`, `aFilaHabitacion`/`deFilaHabitacion`), trae todo con `cargarHoteles()` y `cargarHabitaciones()`, sube con `subirHotel()` y `subirHabitaciones()` (upsert por id) y traduce los errores de Supabase a mensajes legibles.
- **Fusión de datos** — `fusionarHoteles()` une lo local con lo de la BD: lo de la BD manda por id, lo local que no existe en la BD se conserva y los campos que vienen vacíos de la BD (fotos, ubicación, correo del dueño) se completan con los locales para no borrar nada.

### Cambiado
- **`src/store.tsx`** — al abrir la app se traen hoteles y habitaciones de Supabase y se fusionan con el estado local. Toda alta o cambio se sube a la BD además de guardarse en el navegador: `registrarHotel`, `actualizarHotel`, `decidirHotel` (aprobación del admin), `guardarGaleria` (HU-025), `agregarHabitacion` (HU-023), `cambiarEstadoHabitacion`, `cambiarPrecioHabitacion` y `ajustarPreciosDelHotel` (HU-024).
- **Respaldos** — si la BD no responde o falta aplicar el script, la app no se rompe: los cambios quedan en `localStorage` como antes y aparece un aviso explicando qué falló ("falta aplicar el script SQL").
- **`historias-usuario/HU-000-base-datos.md`, `HU-022` y `HU-023`** — las notas que decían "en Fase 2 será un INSERT/UPDATE en Supabase" quedan marcadas como cumplidas.

### Verificado
`npm run typecheck` y `npm run build` en verde. Se comprobó contra la BD real (solo lectura): existen las tablas `hoteles` (9 filas con los mismos 9 ids de las semillas), `habitaciones` (18), `resenas`, `usuarios`, `calificaciones` y `favoritos`, mientras que `reservas` y `pagos` están en 0; el INSERT de prueba fue rechazado por RLS, que es lo que resuelve el script SQL.

---

## [v0.58.0] — 2026-10-19 · HU-029: registrar check-out y factura de la estadía

### Agregado
- **`historias-usuario/HU-029-registrar-check-out.md`**: historia de usuario del módulo Gestión Hotel, con 7 reglas de negocio, 6 escenarios BDD y las subtareas HOTELICA-248 a 253.
- **`src/data.ts`** — `Reserva.checkoutEn?: string` con la fecha y hora de la salida, escrita con `ahoraISO()` y mostrada con `fmtFechaHora()` (misma mecánica que `checkinEn` de la HU-028).
- **`src/store.tsx`** — `registrarCheckout(folio)` pasa la reserva a *Completada* y guarda `checkoutEn` en el mismo movimiento, devolviendo la marca de hora.
- **Factura de la estadía** (`src/pages/BookingModal.tsx`) — el HTML del comprobante de la HU-018 se unificó en `descargarDocumento()` con un tipo "comprobante" o "factura": la factura cambia título, agrega las horas de entrada y salida, resume la estadía y aclara que el IVA del 15 % ya está incluido. Quedan exportadas `descargarComprobante()` y `descargarFactura()`.

### Cambiado
- **Botón "Check-out"** (`src/pages/HotelPanel.tsx`) — ahora pasa por `sePuedeCheckOut()`: reserva del hotel propio y estado *Check-in*; si algo falla, toast con el motivo y sin cambios (HOTELICA-250). La salida anticipada está permitida: no se exige que haya llegado la fecha de salida.
- **Aviso con hora de salida** (HOTELICA-249) — "Check-out registrado para María López (H-0012) · salida 20 oct 2026, 11:05 a.m. Se descargó la factura".
- **Sello de salida** (HOTELICA-249) — la hora aparece debajo de la de entrada en la fila de la tabla, en la tarjeta del celular y junto al estado.
- **Factura automática** (HOTELICA-253) — se descarga sola al cerrar la estadía, armada con la reserva ya en estado *Completada*; las filas completadas conservan un botón "Factura" para volver a descargarla. Las canceladas no tienen factura.
- **Liberación de la habitación** (HOTELICA-251) — sin código nuevo: `disponiblesDe()` ya no cuenta las reservas *Completadas*, así que al check-out baja la ocupación, baja "Check-outs de hoy" y la unidad vuelve a las búsquedas en el acto.

### Verificado
`npm run typecheck` y `npm run build` en verde. Los 6 escenarios BDD se repasaron contra el código: botón solo en reservas en estadía, marca `checkoutEn` visible, validación con toast, liberación inmediata de la unidad y de los contadores, estado Completada con calificación habilitada (HU-019) y factura con subtotal, IVA y total correctos.

---

## [v0.57.0] — 2026-10-19 · HU-028: registrar check-in

### Agregado
- **`historias-usuario/HU-028-registrar-check-in.md`**: historia de usuario del módulo Gestión Hotel, con 7 reglas de negocio, 6 escenarios BDD y las subtareas HOTELICA-242 a 247. Otra vez el backlog la daba por escrita y el archivo no existía.
- **`src/data.ts`** — `ahoraISO()` devuelve la marca de fecha y hora de ahora (yyyy-mm-ddTHH:MM) y `fmtFechaHora()` la muestra en español ("19 oct 2026, 2:35 p.m."); `Reserva` gana el campo opcional `checkinEn` con esa marca de entrada.
- **`src/store.tsx`** — `registrarCheckin(folio)` cambia el estado a Check-in y escribe `checkinEn` en el mismo movimiento, devolviendo la marca para que el panel avise con la hora exacta.

### Cambiado
- **Botón "Check-in"** (`src/pages/HotelPanel.tsx`) — ahora pasa por `sePuedeCheckin()`: reserva del hotel propio, estado *Confirmada* y llegada hoy o pasada; si algo falla muestra un toast con el motivo y no cambia nada (HOTELICA-244).
- **Aviso de la acción** (HOTELICA-246) — el toast incluye huésped, folio y hora de la entrada: "Check-in registrado para María López (H-0012) · entrada 19 oct 2026, 2:35 p.m.".
- **Constancia de la entrada** (HOTELICA-247) — la hora aparece en la fila de la reserva del panel (bajo la pastilla de estado), en la tarjeta de celular y en el detalle de Mis Reservas del turista con el ícono de llave.
- **Tablero y ocupación** — al registrar la entrada, la unidad empieza a contar en la ocupación de la HU-026, baja "Check-ins por hacer" y se habilita el botón de check-out (HU-029), todo sin recargar.

### Verificado
`npm run typecheck` y `npm run build` en verde. Los 6 escenarios BDD se repasaron contra el código: botón solo en confirmadas con llegada cumplida, marca de fecha y hora guardada, validación de reserva activa y de hotel propio con toast de error, tablero actualizado en el acto, aviso con folio y hora, y constancia visible en panel y en Mis Reservas.

---

## [v0.56.0] — 2026-10-19 · HU-027: confirmar o rechazar reservas

### Agregado
- **`historias-usuario/HU-027-confirmar-o-rechazar-reservas.md`**: historia de usuario del módulo Gestión Hotel, con 8 reglas de negocio, 6 escenarios BDD y las subtareas HOTELICA-236 a 241. Como pasó con la HU-026, el backlog la daba por escrita y el archivo no existía.
- **`src/data.ts`**: campo opcional `motivoRechazo` en `Reserva` para guardar por qué el hotel rechazó una solicitud. No se agrega un estado "Rechazada": el ENUM oficial de la guía de negocio es `Pendiente → Confirmada → Check-in → Completada / Cancelada`, así que el rechazo entra como Cancelada con su motivo.
- **Modal de motivo en el panel del hotel** (`src/pages/HotelPanel.tsx`): al pulsar "Rechazar" se abre un modal con una textarea obligatoria (mínimo 3 caracteres); sin motivo no se envía el rechazo.

### Cambiado
- **Botones de la tabla de reservas** — en las reservas pendientes, el "Cancelar" pasó a llamarse **"Rechazar"** y abre el modal de motivo; "Confirmar" sigue como estaba (HOTELICA-236).
- **Validación antes de actuar** (HOTELICA-237) — `confirmar`, `abrirRechazo` y el envío del rechazo revisan con `sePuedeActuar()` que la reserva siga pendiente y sea del hotel del panel; si no, muestran un toast con el estado real y no tocan nada.
- **`src/store.tsx`** — `cambiarEstadoReserva()` acepta un tercer parámetro opcional con el motivo y solo lo escribe cuando viene uno, así un confirmar no borra nada. El cambio se persiste en el acto en localStorage (HOTELICA-238).
- **Mensajes de la acción** (HOTELICA-239) — el hotelero ve "Reserva H-0012 confirmada" (tono ok) o "Reserva H-0012 rechazada…" (tono error) con el folio.
- **`src/pages/MyReservations.tsx`** — el turista se entera del cambio (HOTELICA-240): si la reserva tiene `motivoRechazo`, el aviso dice "fue rechazada por el hotel" en vez de nombrar el estado, y el motivo aparece en la tarjeta y en el detalle de la reserva.

### Verificado
`npm run typecheck` y `npm run build` en verde. Los 6 escenarios BDD de la historia se repasaron contra el código: botones solo en pendientes, validación de estado con toast de error, cambio inmediato en tablero/ocupación/ingresos, mensaje con folio, aviso al turista con motivo y motivo obligatorio. No hay tests unitarios en el repo (se eliminaron en la actualización de `main` del 19/10).

---

## [v0.55.0] — 2026-10-18 · HU-026: consultar reservas recibidas (documentación)

### Agregado
- **`historias-usuario/HU-026-consultar-reservas-recibidas.md`**: historia de usuario del módulo Gestión Hotel, con 7 reglas de negocio, 6 escenarios BDD y las subtareas HOTELICA-259 a 264. Como pasó con la HU-025, la tabla del backlog la daba por escrita y el archivo no existía: se redacta siguiendo el comportamiento ya implementado en `src/pages/HotelPanel.tsx` (listado filtrado por el hotel propio y ordenado por llegada, tablero de cuatro contadores, ingresos sin canceladas, barra de ocupación con la fórmula oficial, tabla de escritorio y vista de tarjetas de respaldo; la historia deja constancia de que, por la HU-039, el panel solo se consulta en escritorio).

### Cambiado
- **`historias-usuario/Orden de Historias de Usuarios.md`**: HU-026 pasa de "⬜ Escrita" a "✅ Terminada".

### Verificado
La historia se redactó contra el código que ya corre en el proyecto y su comportamiento está comprobado en el navegador desde entregas anteriores (panel del hotel con sus reservas, contadores y ocupación); esta versión solo toca documentación, sin cambios de código, por lo que no se repiten `typecheck` y `build`.

---

## [v0.54.0] — 2026-10-18 · HU-039: teléfonos válidos, un solo logo y móvil solo turista

### Agregado
- **`historias-usuario/HU-039-validaciones-logo-y-experiencia-movil.md`**: historia de usuario con las cuatro correcciones de la revisión, 7 escenarios BDD y las subtareas HOTELICA-252 a 258.
- **`src/data.ts`**: `errorTelefonoNicaragua()` devuelve el motivo exacto del rechazo y `soloDigitosTelefono()` deja el campo en dígitos, con tope de 8. La regla es la de Nicaragua: **8 dígitos que empiezan por 2, 5, 7 u 8** (se admiten espacios, guiones y un `505` opcional delante).

### Cambiado
- **Validación de teléfono en los tres formularios** — inscripción del hotel (`src/pages/InscribeHotel.tsx`), edición de la información del hotel (`src/pages/HotelPanel.tsx`) y perfil del usuario (`src/pages/Profile.tsx`) usan la misma regla. Los campos filtran letras y símbolos al escribir, usan teclado numérico, se detienen en 8 dígitos y muestran una ayuda con la regla; los mensajes dicen qué corregir (“debe empezar por 2, 5, 7 u 8” o “debe tener exactamente 8 dígitos”). Se retira la expresión regular genérica del perfil.
- **`src/ui.tsx` — un solo logo:** `Marca` deja de apilar la versión blanca y muestra siempre el logo principal (`Logo.svg`). Sobre el hero se le suma un **contorno claro blando y fino** con `drop-shadow` en capas, que desaparece al quedar la barra blanca. Se elimina `LOGOS.completoClaro` (la navbar ya no usa `Logo-blanco.svg`).
- **`src/App.tsx` — móvil solo turista:** nuevo `usePantallaMovil()` sobre `(max-width: 1023px)`; por debajo de ese ancho el rol visible es siempre `turista` y las rutas `panel` y `admin` se resuelven al inicio, aunque el demo haya quedado en otro perfil.
- **`src/layout.tsx` — menú móvil:** se quitan del menú el selector de perfil y los accesos al panel del hotel y a la consola del admin. Con el menú abierto el body se fija (`position: fixed` con el desplazamiento guardado) y **el contenido de atrás deja de moverse**; al cerrarlo el scroll vuelve al mismo punto (salvo que se navegue, que arranca arriba). El menú tiene alto máximo con scroll propio y cierra con Escape.
- **`src/App.tsx` — splash móvil reparado:** el logo se corre un 26 % de su propio ancho (antes 144 px fijos) y usa el tamaño `splash` (`h-60` en celular, `h-72` en escritorio) con `max-w-none`, así queda centrado y completo en pantallas angostas, sin desborde ni scroll horizontal.

### Verificado
`npm run typecheck` y `npm run build` sin errores. En el navegador (servidor de desarrollo): el teléfono probado en el formulario de inscripción se comporta así: escribir `88a88-12x34` deja `88881234`; con `12345678` el envío se bloquea con “El teléfono debe empezar por 2, 5, 7 u 8”; con `888812` se bloquea con “El teléfono debe tener exactamente 8 dígitos”; con `88881234` la solicitud se envía y aparece el aviso de revisión (la prueba usó un estado temporal que se restauró después). En el celular (390 px) el splash muestra la marca completa y centrada, el menú desplegado no mueve la página (body fijado en `-2201px`, `scrollY` en 0) y al cerrarlo vuelve al mismo punto (`scrollY` 2201), sin selector de perfil ni accesos de admin u hotelero. Con el demo en rol admin en escritorio, al angostar a 390 px la consola administrativa deja de mostrarse y aparece el inicio.

### Limitación
La restricción del celular es total: un hotelero con cuenta real que entre desde su teléfono no puede abrir su panel en esta maqueta, porque en móvil solo se ofrece el módulo turista. El repositorio sigue sin pruebas automatizadas (`npm test` responde “No test files found”), así que la evidencia es la revisión manual más `typecheck` y `build`.

---

## [v0.53.0] — 2026-10-18 · HU-038: la portada le habla a los hoteleros

### Agregado
- **`historias-usuario/HU-038-portada-hoteleros-traduccion-y-reserva.md`**: historia de usuario con los seis hallazgos de la revisión visual-funcional de la portada, escenarios BDD y subtareas. Recoge el rediseño de la franja de destinos, la tarjeta de hoteleros, las cifras del hero, la reserva con cuenta y la traducción por navegador.
- **`public/destinos/` (nuevo)**: **ocho fotografías reales de Wikimedia Commons**, una por departamento del catálogo (`granada.jpg`, `leon.jpg`, `rivas.jpg`, `managua.jpg`, `masaya.jpg`, `esteli.jpg`, `matagalpa.jpg`, `caribe.jpg`), redimensionadas a 1280 px. Catedral de Granada, Catedral de León, volcán Concepción en Ometepe, Antigua Catedral de Managua, Parque Central de Masaya, skyline de Estelí desde Tisey, vista de Matagalpa y Otto Beach en Little Corn Island.
- **`public/destinos/CREDITOS.md`**: tabla con la foto original, autoría, licencia (CC BY 2.0, CC BY-SA 2.0 y CC BY-SA 4.0) y enlace a Wikimedia Commons de cada imagen, para cumplir la atribución que exigen esas licencias.
- **`index.html`**: **Google Traductor automático** — el elemento `translate` con `pageLanguage: "es"` detecta el idioma del navegador, y si no es español (en, fr, de, pt, it) se escribe la cookie `googtrans=/es/<idioma>` antes de cargar el script, de modo que la página se traduce sola al abrir. Reemplaza al selector propio de idioma; el contenedor del widget va oculto para no ensuciar el layout.

### Cambiado
- **`src/pages/Home.tsx`** — las tarjetas de "Destinos que enamoran" dejan de ser un degradado con silueta y pasan a mostrar **la fotografía real del departamento** (con velo oscuro para que el nombre y el conteo de hoteles se lean sobre cualquier imagen). La franja de hoteleros se reduce a **una sola tarjeta, arriba**, titulada "Registra tu hotel ahora", con **silueta de hotel** (`IconoHotel`) anclada en la esquina inferior derecha en lugar de la palmera, y un botón **"Registrar mi hotel"** que abre el formulario en una **ventana flotante**; la tarjeta duplicada del pie de la portada se elimina. Las cifras del hero ya no están escritas a mano: salen de los datos (`6` hoteles aprobados, `23` municipios del catálogo, `10` reseñas).
- **`src/pages/InscribeHotel.tsx`** — acepta `enVentana` para renderizarse dentro de la modal sin su propio marco de página, y el aviso de éxito explica el resultado al dueño: "Tu solicitud está en revisión. El resultado te aparecerá en tu correo electrónico (correo)", con la cuenta de hotelero incluida cuando lo aprueben.
- **`src/pages/HotelDetail.tsx`** — **"Reservar" sin sesión abre la pantalla de registro** en vez del formulario de reserva: avisa "Crea tu cuenta o inicia sesión para reservar tu habitación" y abre la modal de registro. Con sesión, el flujo sigue igual.
- **`src/store.tsx`** — se elimina `cambiarIdioma` y la persistencia de idioma en `localStorage` (el español es el idioma de origen; la traducción la hace el navegador). El estado de la modal de registro pasa al store (`registroAbierto`, `abrirRegistro`, `cerrarRegistro`) para que cualquier pantalla pueda abrirla.
- **`src/layout.tsx`** — se quita el selector ES/EN del escritorio y la opción "Ver en inglés" del menú móvil; los botones "Registrarse" y el flujo de la modal usan el estado compartido del store.
- **`src/ui.tsx`** — el `Modal` se renderiza en un **portal al `body`**. El header tiene `backdrop-blur`, y eso lo convertía en el contenedor de los elementos `fixed`: la ventana flotante quedaba recortada a la altura de la barra (64 px) y se veía cortada por arriba. Afectaba a las modales de login y registro.

### Verificado
`npm run typecheck` y `npm run build` sin errores (se mantiene el aviso de tamaño de chunk, ya conocido). Revisión en el navegador con el servidor de desarrollo: en escritorio (1440 px) y en celular (390 px) las ocho tarjetas de destinos muestran su fotografía real y la barra lateral de filtros no se rompe; el hero muestra 6 / 23 / 10 tomados de los datos; la tarjeta de hoteleros aparece una sola vez, "Registrar mi hotel" abre el formulario completo en ventana flotante y la silueta de hotel queda detrás del CTA; en la navbar ya no hay selector de idioma, ni en escritorio ni en el menú móvil (el widget de Google va con `display: none`, así que tampoco aparece "Seleccionar idioma" para lectores de pantalla); con la cookie `googtrans=/es/en` la portada se tradujo al inglés ("Find your next destination…") y volvió al español al limpiarla; en la ficha de un hotel, **con la sesión cerrada, "Reservar" muestra el aviso y abre "Crear cuenta"** centrada y completa. El formulario de la modal se completó de punta a punta: al pulsar "Finalizar solicitud" aparece **"Tu solicitud está en revisión. El resultado te aparecerá en tu correo electrónico (…)"** con la pastilla "Pendiente" (la prueba se hizo con un estado temporal, restaurado después).

### Limitación
El repositorio no tiene pruebas automatizadas (`npm test` termina con "No test files found"; no existen `src/__tests__/` ni `tests/`), así que la evidencia es la revisión manual en el navegador más `typecheck` y `build`. Google Traductor necesita internet y su banner se dibuja sobre la página: si el visitante ya navega en español, el banner no aparece.

---

## [v0.52.0] — 2026-10-17 · HU-037: mapa de ubicación exacta del hotel

### Agregado
- **`historias-usuario/HU-037-mapa-de-ubicacion-exacta.md`**: historia de usuario de los módulos Búsqueda / Gestión Hotel, con 7 escenarios BDD y las subtareas HOTELICA-236 a 242. Hasta ahora la "ubicación" era texto y un SVG decorativo (la HU-009 contemplaba "mapa estático"); con esto el hotel tiene coordenadas reales y un mapa de verdad.
- **Dependencias:** `leaflet` + `react-leaflet` v4 (React 18) y `@types/leaflet`. **Mapa de código abierto: Leaflet con tiles de OpenStreetMap, sin API keys ni servicios de pago.** La atribución de OpenStreetMap queda visible (obligatoria por su licencia).
- **`src/mapa.tsx` (nuevo):** componente `MapaHotel` con dos variantes: **"vista"** (solo lectura, con popup y enlace) y **"selector"** (clic en el mapa o arrastre del pin marcan la ubicación exacta). El marcador es un `divIcon` con el **SVG propio del proyecto** en los colores de marca (pin dorado con contorno teal), no las imágenes por defecto de Leaflet. `scrollWheelZoom` desactivado para no atrapar el scroll de la página y animaciones de encuadre apagadas con `prefers-reduced-motion`.
- **`src/data.ts`**: `Municipio` gana `centro` (el centro de cada uno de los 23 municipios del catálogo) y `Hotel` gana `ubicacion?: Punto`; los 9 hoteles de la semilla reciben coordenadas reales (La Calzada en Granada, el malecón de San Juan del Sur, el camino a la cascada San Ramón, etc.). Nuevos: tipo `Punto`, `LIMITES_NICARAGUA`, `RADIO_MUNICIPIO_KM` (30 km), `distanciaKm()` (haversine) y `validarUbicacionExacta()`, que se suma a `validarRegistroHotel()`: la ubicación es obligatoria, tiene que caer dentro de Nicaragua y a menos de 30 km del municipio declarado.
- **`src/index.css`**: estilos del mapa con los tokens de la marca (contenedor, popup crema redondeado, atribución legible y controles de zoom en los colores del sitio).

### Cambiado
- **`src/pages/HotelDetail.tsx`** — la sección "Cómo llegar" reemplaza el SVG decorativo (malla dibujada y pin flotante) por el **mapa real de OpenStreetMap** con el pin del hotel y un nuevo enlace **"Abrir en OpenStreetMap"** que lleva a la misma coordenada. Un hotel sin coordenadas (datos guardados antes de esta versión) abre el mapa centrado en su municipio: nada se rompe.
- **`src/pages/InscribeHotel.tsx`** — el formulario suma el campo **"Ubicación exacta"**: al elegir municipio el mapa reencuadra sobre él con el pin en el centro, y el dueño lo mueve con un clic o arrastrándolo; las coordenadas se muestran con `tabular-nums`. Cambiar de departamento o municipio recoloca el pin donde corresponde.
- **`src/pages/HotelPanel.tsx`** — "Editar información" incluye el mismo selector de ubicación, con el punto actual ya cargado.
- **`src/pages/AdminPanel.tsx`** — la modal "Ver" de una solicitud muestra el mapa con la ubicación exacta que marcó el dueño, para que el admin decida viendo dónde queda el hotel.
- **`src/store.tsx`**: `registrarHotel()` y `actualizarHotel()` guardan la `ubicacion` del formulario en el hotel.

### Verificado
`typecheck` y `npm run build` sin errores. Prueba automatizada temporal con Playwright (16 chequeos, todos en verde) sobre el servidor de desarrollo: en el detalle el contenedor Leaflet se ve, cargan los tiles de OpenStreetMap, el pin SVG se dibuja, está la atribución y el enlace, y **la rueda del mouse scrollea la página sin quedar atrapada en el mapa**; en la inscripción el mapa reencuadra al municipio (tile `/13/`, no el país entero), muestra las coordenadas y **el clic en el mapa las cambia**; en la consola del admin la modal de revisión muestra el mapa con su pin; y en celular (390 px) el mapa se ve sin desborde horizontal. Escenario 3 de punta a punta: un formulario completo con el pin a ~42 km de Granada **no se envía** y aparece "El punto está a 42 km de Granada: mové el pin dentro de tu municipio"; al recolocar el pin en el municipio, la solicitud se envía. Escenario 4 con el flujo real de una cuenta (11 chequeos): se inscribe un hotel con ubicación, el admin lo aprueba y crea la cuenta, el dueño **entra con esas credenciales**, abre "Editar información", el editor carga la ubicación que marcó al inscribirse, un clic mueve el pin, "Guardar cambios" confirma y **la ubicación corregida persiste tras recargar**.

### Limitación
Los tiles de OpenStreetMap se cargan desde internet: sin conexión el mapa queda vacío (la dirección escrita de al lado sigue visible). La guía de uso de OSM pide no hacer peticiones masivas desde client-side intensivo; para producción con mucho tráfico conviene un proxy de tiles propio o un proveedor con plan gratuito (en la maqueta esto no aplica).

---

## [v0.51.0] — 2026-10-16 · HU-036: composición editorial sin el patrón "N pasos"

### Agregado
- **`historias-usuario/HU-036-composicion-editorial-sin-pasos.md`**: historia de usuario del módulo Diseño (oficio visual), con 7 escenarios BDD y las subtareas HOTELICA-232 a 235. Surge del estudio `Estudio-diseno-generico-IA.md` (§1.2): el patrón "N pasos" que la guía de diseño prohíbe (§10.1) estaba implementado en dos pantallas.

### Cambiado
- **`src/pages/Home.tsx`** — la sección "De la búsqueda a la hamaca" deja de ser cuatro columnas iguales con los números `01`–`04`, puntos y línea conectora. Pasa a **bloque editorial asimétrico**: mancheta a la izquierda (ceja, titular grande, narración y CTA "Empezar por la búsqueda" que lleva a los resultados) e índice a la derecha, con los cuatro momentos del recorrido (Buscás / Comparás / Reservás / Disfrutás) como lista separada por filetes y sangrías alternadas, no como cajitas idénticas. Se eliminó `TituloSeccionCentro()`, que quedó sin uso.
- **`src/pages/InscribeHotel.tsx`** — las tres tarjetas numeradas del pie del formulario ("Envías la solicitud / El admin la revisa / Recibís tu cuenta") se reemplazan por una frase de prosa junto al botón "Enviar solicitud", que es donde el dueño necesita saber qué pasa después. Se limpiaron los import sin uso (`IconoPin`, `IconoOjo`, `IconoLlave`, `TituloSeccion`).

### Verificado
`typecheck` y `npm run build` sin errores. Revisión en el navegador: en escritorio (1440 px) el bloque nuevo muestra las columnas de distinto ancho con las sangrías alternadas del índice y el CTA lleva a "Hoteles en toda Nicaragua"; los textos viejos ("Busca tu destino", "El admin la revisa", etc.) ya no existen en el DOM; el pie del formulario muestra la frase al lado del botón sin tarjetas numeradas; y en celular (390 px) las columnas se apilan en un solo orden de lectura sin desbordes.

### Limitación
Sigue sin haber pruebas automatizadas en el proyecto; la evidencia es la prueba manual en el navegador más `typecheck` y `build`.

---

## [v0.50.0] — 2026-10-16 · HU-025: el hotelero sube las fotografías de su hotel

### Agregado
- **`historias-usuario/HU-025-subir-fotografias.md`**: historia de usuario del módulo Gestión Hotel, con 7 escenarios BDD y las subtareas HOTELICA-225 a 231. Otra vez había que redactarla: la tabla del backlog la daba por escrita y el archivo no existía.
- **`src/imagen.ts` (nuevo)**: `optimizarFoto()` lee el archivo elegido, lo reescala en un `canvas` a un máximo de 1280 px de ancho y lo devuelve como JPEG, así las fotos no se comen el almacenamiento del navegador; `pesoDeFoto()` dice cuánto pesa una foto ya optimizada.
- **`src/icons.tsx`**: icono propio `IconoFoto` (marco con sol y cerro) para la sección de la galería.
- **`src/data.ts`**: `MAXIMO_FOTOS` (6 por hotel), `cupoDeFotos()` y `errorDeGaleria()` para el tope, y `conPortada()` para mover al primer lugar la foto que el hotelero elige como portada.
- **`src/store.tsx`**: `agregarFotosHotel()`, `ponerPortadaHotel()` y `quitarFotoHotel()`. La galería y `imagen` (la portada que leen las tarjetas de los resultados y la cabecera del panel) se guardan siempre juntas, y la última foto no se puede quitar.
- **`src/pages/HotelPanel.tsx`**: sección **"Fotografías del hotel"** bajo los precios, con el contador de fotos ("3 de 6"), la portada en grande, el campo de subida múltiple, las miniaturas con su peso y los botones "Usar como portada" y "Quitar".
- **`src/pages/HotelDetail.tsx`**: la galería del turista ahora **se navega**: la foto grande cambia al tocar las laterales y una tira de miniaturas deja ver todas las fotos, también desde el celular (antes, en pantalla chica solo se veía la primera).

### Cambiado
- **`src/store.tsx`**: el guardado en el navegador ahora atrapa el error de espacio. Con las fotos dentro de los datos, llenar el almacenamiento dejaba de guardar en silencio; ahora la app sigue funcionando y avisa que hay que quitar una foto.

### Verificado
`typecheck` y `npm run build` sin errores. Prueba manual en el navegador con archivos reales inyectados en el campo de subida: una imagen de 2000×1200 y 64 KB se guarda como JPEG de **1280×768 y 9 KB**; un `.txt` se rechaza con "El archivo tiene que ser una imagen (JPG, PNG o WEBP)" y una imagen de 6 MB con "La imagen pesa más de 5 MB", sin agregar nada a la galería; "Usar como portada" mueve la foto elegida al primer lugar y la tarjeta de resultados pasa a mostrar esa foto; quitar baja el contador 4→3→2→1 y la última se rechaza con "El hotel necesita al menos una foto"; con la galería en 6, un lote de 3 sube 2 y avisa "Solo entran 2 fotos más", y una más se rechaza; simulando que el navegador se queda sin espacio, la app no se rompe y aparece el aviso correspondiente. En el detalle del turista, la foto principal cambia al tocar las miniaturas (se probaron las 6) y en 390 px la sección del panel no desborda, con las miniaturas en dos columnas y la tira del detalle desplazándose en horizontal.

### Limitación
Sigue sin haber pruebas automatizadas en el proyecto, así que la evidencia es la prueba manual en el navegador más `typecheck` y `build`. Las fotos viven dentro de los datos del navegador: si más adelante se suben fotos de verdad en producción, van a un servicio de archivos y no al `localStorage`.

---

## [v0.49.0] — 2026-10-16 · HU-024: el hotelero configura sus precios

### Agregado
- **`historias-usuario/HU-024-configurar-precios.md`**: historia de usuario del módulo Gestión Hotel, con 6 escenarios BDD y las subtareas HOTELICA-218 a 224 como notas de implementación. El archivo no existía aunque la tabla del backlog ya la daba por escrita, así que la HU se redactó completa antes de tocar el código.
- **`src/data.ts`**: reglas de precio en un solo lugar. `errorDePrecio()` (mayor que cero y máximo C$ 50,000.00), la lista `TEMPORADAS` (normal 0 %, alta +20 %, baja −15 %), `errorDeAjuste()` (entre −50 % y +100 %) y `ajustarPrecio()`, que aplica el porcentaje y deja el precio en córdobas enteros.
- **`src/store.tsx`**: acciones `cambiarPrecioHabitacion()` y `ajustarPreciosDelHotel()`, las dos validando antes de guardar y devolviendo el motivo cuando no corresponde.
- **`src/pages/HotelPanel.tsx`**: sección nueva **"Precios del hotel"** bajo las habitaciones, con una tarjeta por tipo de habitación donde se corrige el precio por noche, el botón "Guardar precio" (que se habilita solo si hay un cambio) y "Deshacer"; arriba, el control de **ajuste por temporada** con vista previa del rango resultante y la opción de escribir un porcentaje propio.

### Cambiado
- **`src/data.ts`**: `validarHabitacion()` (HU-023) ahora usa `errorDePrecio()`, así el alta de habitaciones y la configuración de precios comparten la misma regla y no se pueden desincronizar.

### Nota
Cada tarjeta muestra el total por noche que paga el turista con el IVA del 15 % calculado por `calcularTotales()`, y un aviso recuerda que **las reservas ya hechas conservan el precio con el que se crearon**: subir o bajar una tarifa hoy no toca lo ya cobrado, solo las reservas siguientes.

### Verificado
`typecheck` y `npm run build` sin errores. Prueba manual en el navegador contra los escenarios BDD: las tarifas se ven con IVA y total (Estándar Mar C$ 1,400.00 + C$ 210.00); cambiar un precio a C$ 1,800.00 deja el total en C$ 2,070.00 con su aviso; un precio en cero se rechaza con el campo marcado y sin guardar nada; la temporada alta muestra la vista previa (de C$ 1,800.00 a C$ 2,600.00) y al aplicarla confirma "Ajuste aplicado a 3 habitaciones"; un ajuste propio de −50 % y de +100 % recalcula las tres tarifas y uno de 200 % se rechaza con su motivo; con el hotel en **Pendiente** la sección queda en modo lectura con el campo y el botón deshabilitados; y el turista ve el precio nuevo en los destacados, en el detalle y en el asistente de reserva (C$ 2,200.00 × 2 noches + IVA = C$ 5,060.00), mientras las reservas viejas siguen en su total original (HC-1038 en C$ 11,960.00). En celular (390 px) la sección no desborda y los controles quedan a lo ancho.

### Limitación
El proyecto no tiene pruebas automatizadas en este momento (se retiraron antes por pedido), así que la evidencia de esta historia es la prueba manual en el navegador más `typecheck` y `build`.

---

## [v0.48.2] — 2026-10-16 · Interfaz móvil: cabecera, paneles y tablas adaptadas al celular

### Arreglado
- **`src/layout.tsx`** y **`src/ui.tsx`**: en el celular la marca **por fin se ve** y el botón de menú ya no se sale de la barra. La barra superior no cabía en 390 px, así que el logo (el único elemento flexible) se comprimía a 0 px y el menú quedaba recortado 3 px; ahora en pantallas chicas se usa el sello compacto de la marca y "Registrarse", "Iniciar sesión", el idioma y el perfil pasan al menú desplegable.
- **`src/pages/HotelPanel.tsx`** y **`src/pages/AdminPanel.tsx`**: las tablas de reservas (9 columnas) se reemplazan por **tarjetas** en el celular, cada una con sus acciones a la vista. Antes había que descubrir un scroll lateral para llegar a Confirmar, Check-in, Check-out o Aprobar, y la última acción quedaba en x = 761 dentro de una pantalla de 390 px.
- **`src/pages/HotelPanel.tsx`**: el botón "Cancelar" salía como un recuadro vacío porque el `text-white` de la clase base ganaba sobre el `text-danger` del uso; ahora cada botón declara su color y el texto y el ícono se ven (coral para cancelar, blanco para confirmar).

### Verificado
`typecheck` y `npm run build` sin errores. Revisión en el navegador a 390 px: inicio, resultados, detalle del hotel, asistente de reserva, panel del hotel y consola de admin sin desbordes de página, con la marca visible y todas las acciones alcanzables. En escritorio (1219 px) la tabla y los controles de sesión siguen igual.

---

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
