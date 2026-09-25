# Informe técnico — Historias de Usuario HU-001 a HU-012 del proyecto Hotelica

## Introducción

En el presente informe se documentan las doce primeras Historias de Usuario desarrolladas en el proyecto **Hotelica**, una plataforma de reserva hotelera para Nicaragua construida como parte de la formación en la carrera de Ingeniería en Sistemas de Información. El objetivo de este documento es recopilar, de manera ordenada y explicativa, tres elementos por cada historia: la **redacción estándar** (formato "Como… quiero… para…"), los **criterios de aceptación en BDD** (Behavior-Driven Development, escritos en lenguaje Gherkin: Dado / Cuando / Entonces) y el **código que se implementó** para satisfacer dichos criterios, indicando los archivos y las funciones principales del proyecto.

Cabe destacar que el proyecto evolucionó en dos fases: primero se construyó una **maqueta funcional** con datos simulados y persistencia en `localStorage`, y posteriormente la autenticación se migró a un servicio real mediante **Supabase Auth** (con OAuth de Google), tal como queda registrado en el `CHANGELOG.md` del repositorio (versiones v0.4.0 a v0.31.0). Esta evolución se refleja en las notas de implementación de cada historia.

---

## HU-001 — Registrarse en la plataforma

### Redacción estándar

> **Como** visitante de Hotelica, **quiero** registrarme en la plataforma con correo electrónico y contraseña, **para** poder iniciar sesión, realizar reservas y gestionar mis estancias.

### Criterios BDD

- **Dado** que el visitante está en la pantalla de registro, **cuando** ingresa un correo válido, una contraseña de mínimo 6 caracteres y presiona "Registrarse", **entonces** se crea la cuenta, se inicia sesión automáticamente y el header saluda con el nombre del usuario.
- **Dado** que el visitante está en la pantalla de registro, **cuando** ingresa un correo que ya existe en el sistema, **entonces** se muestra el mensaje "Este correo ya está registrado".
- **Dado** que el visitante deja campos obligatorios vacíos o ingresa una contraseña menor a 6 caracteres, **cuando** envía el formulario, **entonces** se muestra un mensaje de error indicando los campos incorrectos.
- **Dado** que el visitante presiona el botón de acceso con redes sociales, **cuando** se completa el flujo del proveedor, **entonces** se crea una cuenta vinculada y se inicia sesión.

### Código implementado

La lógica de registro vive en el estado global (`src/store.tsx`) y la interfaz en el modal de registro del layout (`src/layout.tsx`):

```tsx
// src/store.tsx — Registro real con Supabase Auth (HU-001)
const registrar = async (correo: string, contrasena: string, nombre: string) => {
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: { data: { nombre } },
  });

  if (error) {
    // Mensajes amigables según el tipo de error
    if (error.message.includes("already"))
      return { error: "Este correo ya está registrado" };
    if (error.message.includes("password"))
      return { error: "La contraseña debe tener al menos 6 caracteres" };
    return { error: error.message };
  }

  if (data.user) {
    const nombreDisplay = nombre || correo.split("@")[0];
    setUsuario({ nombre: nombreDisplay, rol: "Turista", correo, telefono: "", direccion: "" });
    avisar(`Bienvenido, ${nombreDisplay}`, "ok");
  }
  return {};
};
```

En `src/layout.tsx`, el manejador `manejarRegistro` valida los campos vacíos y la longitud mínima de la contraseña **antes** de llamar al store, muestra los errores en línea dentro del modal y, si el registro es exitoso, limpia los campos y cierra el modal. El header reacciona al estado `usuario` y cambia el botón "Registrarse" por el saludo con el nombre.

**Referencia de versión:** v0.14.0 del CHANGELOG (Registro con Supabase Auth).

---

## HU-002 — Iniciar sesión

### Redacción estándar

> **Como** visitante de Hotelica, **quiero** iniciar sesión con correo y contraseña (o con redes sociales), **para** acceder a funcionalidades personalizadas como reservas, favoritos y el historial de estancias.

### Criterios BDD

- **Dado** que el visitante está en la página principal, **cuando** ingresa credenciales válidas y presiona "Iniciar sesión", **entonces** el header muestra el nombre del usuario y el botón "Cerrar sesión".
- **Dado** que el visitante deja el correo o la contraseña vacíos, **cuando** envía el formulario, **entonces** se muestra un mensaje de error en rojo y no se realiza el login.
- **Dado** que el visitante ingresa credenciales incorrectas, **cuando** intenta autenticarse, **entonces** se muestra el mensaje "Correo o contraseña incorrectos".
- **Dado** que el visitante presiona "Continuar con Google", **cuando** completa el flujo OAuth del proveedor, **entonces** la sesión se recibe por el listener de Supabase y se muestra la bienvenida.

### Código implementado

```tsx
// src/store.tsx — Login real con Supabase Auth (HU-002)
const login = async (correo: string, contrasena: string) => {
  if (!correo.trim() || !contrasena.trim())
    return { error: "Correo y contraseña son obligatorios" };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    if (error.message.includes("Invalid login"))
      return { error: "Correo o contraseña incorrectos" };
    if (error.message.includes("Email not confirmed"))
      return { error: "El correo no fue confirmado..." };
    return { error: error.message };
  }

  if (data.user) {
    const nombre = data.user.user_metadata?.nombre || correo.split("@")[0];
    setUsuario({ nombre, rol: "Turista", correo, telefono: "", direccion: "" });
    avisar(`Bienvenido, ${nombre}`, "ok");
  }
  return {};
};
```

Dos piezas complementarias completan la historia: el **listener global** `supabase.auth.onAuthStateChange` (en `src/store.tsx`), que captura la sesión cuando el usuario regresa de Google vía OAuth y reconstruye el objeto `Usuario` desde `user_metadata`; y el **modal de login** en `src/layout.tsx`, cuyo manejador asíncrono muestra el estado de carga ("Iniciando...") y los errores en línea. La sesión persiste en `localStorage` bajo la clave `hotelica-usuario`.

**Referencia de versión:** v0.15.0 (login con Supabase Auth) y v0.31.0 (login con Google vía OAuth).

---

## HU-003 — Cerrar sesión

### Redacción estándar

> **Como** usuario autenticado en Hotelica, **quiero** cerrar mi sesión, **para** proteger mi información y salir de forma segura de la plataforma.

### Criterios BDD

- **Dado** que el usuario está autenticado, **cuando** presiona el botón "Cerrar sesión", **entonces** la sesión se destruye, el header vuelve a mostrar "Iniciar sesión" y el usuario regresa al estado de visitante.
- **Dado** que el usuario cerró sesión, **cuando** intenta acceder a una ruta protegida (Mis Reservas, Panel Hotel, Admin), **entonces** es redirigido automáticamente a la página de inicio.

### Código implementado

```tsx
// src/store.tsx — Cerrar sesión con Supabase Auth (HU-003)
const logout = async () => {
  await supabase.auth.signOut();     // destruye la sesión en el servidor
  setUsuario(null);                  // limpia el estado global
  setRol("turista");                 // restablece el rol de demostración
  avisar("Sesión cerrada", "info");  // toast de confirmación
};
```

La protección de rutas se implementó en `src/App.tsx`: las rutas `reservas`, `panel` y `admin` verifican si `usuario` es `null` y, de ser así, redirigen al inicio. El botón "Cerrar sesión" del header (`src/layout.tsx`) se estiliza en rojo para diferenciarlo de las demás acciones.

**Referencia de versión:** v0.16.0 del CHANGELOG.

---

## HU-004 — Recuperar contraseña

### Redacción estándar

> **Como** usuario que olvidó su contraseña, **quiero** solicitar la recuperación mediante mi correo registrado, **para** restablecer el acceso a mi cuenta de forma segura.

### Criterios BDD

- **Dado** que el usuario olvidó su contraseña, **cuando** presiona "¿Olvidaste tu contraseña?" en el formulario de login, **entonces** se muestra un formulario para ingresar su correo electrónico.
- **Dado** que el usuario ingresa su correo, **cuando** presiona "Enviar enlace de recuperación", **entonces** se envía un correo con un enlace de restablecimiento y se muestra la pantalla "Revisá tu correo".
- **Dado** que el usuario ingresa una nueva contraseña de menos de 6 caracteres, **cuando** la confirma, **entonces** aparece el error "La contraseña debe tener al menos 6 caracteres".
- **Dado** que las contraseñas no coinciden, **cuando** envía el formulario, **entonces** aparece el error "Las contraseñas no coinciden".
- **Dado** que el restablecimiento fue exitoso, **cuando** se guarda la nueva contraseña, **entonces** se muestra "¡Contraseña actualizada!" y el usuario puede iniciar sesión con la nueva credencial.

### Código implementado

Se crearon dos páginas nuevas y dos funciones de store:

```tsx
// src/store.tsx — Enviar email de recuperación (HU-004)
const olvidarContrasena = async (correo: string) => {
  if (!correo.trim()) return { error: "Ingresa tu correo electrónico" };
  const { error } = await supabase.auth.resetPasswordForEmail(correo);
  if (error) return { error: "No se pudo enviar el correo de recuperación..." };
  return { ok: true };
};

// src/store.tsx — Restablecer con el token del email (HU-004)
const restablecerContrasena = async (nuevaContrasena: string) => {
  if (!nuevaContrasena || nuevaContrasena.length < 6)
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  const { error } = await supabase.auth.updateUser({ password: nuevaContrasena });
  if (error) return { error: "No se pudo restablecer la contraseña..." };
  return {};
};
```

Las páginas `src/pages/ForgotPassword.tsx` (solicitud del correo) y `src/pages/ResetPassword.tsx` (nueva contraseña con confirmación y toggle de visibilidad) se registraron en el sistema de rutas (`src/rutas.ts`) como `recuperar` y `restablecer`, y el modal de login incorporó el enlace "¿Olvidaste tu contraseña?".

**Referencia de versión:** v0.18.0 del CHANGELOG.

---

## HU-005 — Gestionar perfil

### Redacción estándar

> **Como** usuario autenticado, **quiero** editar mis datos personales como nombre, teléfono y dirección, **para** mantener mi información actualizada en la plataforma.

### Criterios BDD

- **Dado** que el usuario está autenticado, **cuando** entra a "Mi perfil", **entonces** ve sus datos precargados (nombre, correo, teléfono, dirección).
- **Dado** que el usuario presiona "Editar perfil", **cuando** se activa el modo edición, **entonces** nombre, teléfono y dirección se vuelven editables y el correo permanece bloqueado.
- **Dado** que el nombre queda vacío o con menos de 3 caracteres, **cuando** guarda, **entonces** aparece un mensaje de error debajo del campo.
- **Dado** que guarda con datos válidos, **cuando** la operación termina, **entonces** aparece el toast "¡Guardado exitosamente!" y los datos se actualizan en la interfaz.
- **Dado** que está guardando, **cuando** se envían los cambios, **entonces** el botón se deshabilita y muestra "Guardando...".
- **Dado** que presiona "Cancelar", **cuando** sale del modo edición, **entonces** los campos vuelven a su estado original.

### Código implementado

```tsx
// src/store.tsx — Actualizar perfil (HU-005)
const actualizarPerfil = async (datos: { nombre: string; telefono: string; direccion: string }) => {
  if (!usuario) return { error: "No hay sesión activa" };

  // Validaciones básicas antes de enviar
  if (!datos.nombre.trim() || datos.nombre.trim().length < 3)
    return { error: "El nombre debe tener al menos 3 caracteres" };
  if (!datos.telefono.trim()) return { error: "El teléfono es obligatorio" };
  if (!datos.direccion.trim() || datos.direccion.trim().length < 5)
    return { error: "La dirección debe tener al menos 5 caracteres" };

  // Actualiza los metadatos del usuario en Supabase Auth
  const { error } = await supabase.auth.updateUser({
    data: { nombre: datos.nombre, telefono: datos.telefono, direccion: datos.direccion },
  });
  if (error) console.warn("Supabase updateUser falló, guardando localmente:", error.message);

  // El estado local siempre se actualiza para reflejar los cambios en la UI
  setUsuario({ ...usuario, ...datos });
  return {};
};
```

La página `src/pages/Profile.tsx` implementa el modo edición con validación por campo (`validarCampos`), clases condicionales para resaltar los inputs con error, el campo de correo con estilo bloqueado, el botón "Cancelar" que restaura los valores originales y los toasts de éxito/error. La ruta `perfil` quedó protegida (solo con sesión activa).

**Referencia de versión:** v0.17.0 del CHANGELOG.

---

## HU-006 — Buscar hoteles por departamento

### Redacción estándar

> **Como** visitante de Hotelica, **quiero** buscar hoteles por departamento, fechas de llegada/salida y número de huéspedes, **para** encontrar opciones de alojamiento que se ajusten a mi viaje.

### Criterios BDD

- **Dado** que el visitante está en la página de inicio, **cuando** selecciona departamento, fechas y huéspedes y presiona "Buscar hoteles", **entonces** se muestra la página de resultados con los hoteles aprobados de ese departamento.
- **Dado** que presiona "Buscar hoteles" sin seleccionar departamento, **cuando** se envía el formulario, **entonces** se muestra el error "Selecciona un departamento para comenzar tu búsqueda".
- **Dado** que la fecha de salida es igual o anterior a la de llegada, **cuando** se busca, **entonces** se muestra un mensaje de fechas inválidas.
- **Dado** que el visitante elige un municipio del departamento, **cuando** aplica la búsqueda, **entonces** los resultados se filtran por ese municipio.
- **Dado** que existen hoteles con estado "aprobado", "pendiente" y "rechazado", **cuando** se realiza una búsqueda, **entonces** solo se muestran los hoteles con estado "aprobado".

### Código implementado

El formulario vive en la sección hero de `src/pages/Home.tsx` (selector de departamento y municipio dependiente, fechas, huéspedes) y navega a `src/pages/Results.tsx` con los parámetros de búsqueda. El filtrado de resultados se calcula con `useMemo`:

```tsx
// src/pages/Results.tsx — Filtrado base de la búsqueda (HU-006)
const resultados = useMemo(() => {
  const base = hoteles.filter((h) => h.aprobado === "aprobado"); // solo aprobados
  const filtrados = base.filter((h) => {
    if (depto && h.departamentoId !== depto) return false;
    if (muni && h.municipioId !== muni) return false;
    // ... más filtros (precio, calificación, capacidad y disponibilidad)
    return true;
  });
  return [...filtrados].sort(/* orden: destacados, precio, rating */);
}, [hoteles, depto, muni, /* ... */]);
```

Los catálogos de departamentos y municipios de Nicaragua están en `src/data.ts` (`DEPARTAMENTOS`, `MUNICIPIOS`), y el selector de municipio se llena en cascada según el departamento elegido.

**Referencia de versión:** v0.19.0 del CHANGELOG (verificación de los 5 escenarios BDD).

---

## HU-007 — Filtrar hoteles por precio

### Redacción estándar

> **Como** turista de Hotelica, **quiero** filtrar los resultados de búsqueda por rango de precios, **para** encontrar hoteles que se ajusten a mi presupuesto.

### Criterios BDD

- **Dado** que el turista está en la página de resultados, **cuando** observa la barra lateral, **entonces** ve un control deslizante de "Precio máximo" con rango de C$ 800 a C$ 3,500.
- **Dado** que el turista mueve el control, **cuando** se ajusta el slider, **entonces** se muestra el valor seleccionado en formato "C$ {monto}" sobre el control.
- **Dado** que existen hoteles con precios desde C$ 950 hasta C$ 3,400, **cuando** el turista establece el precio máximo en C$ 1,500, **entonces** solo se muestran hoteles cuya habitación más económica sea igual o menor a C$ 1,500.
- **Dado** que no hay hoteles en el rango elegido, **cuando** se aplica el filtro, **entonces** se muestra el estado vacío "Sin resultados por ahora" con opción de limpiar filtros.
- **Dado** que el turista presiona "Limpiar filtros", **cuando** se restablecen los valores, **entonces** el slider vuelve al valor por defecto (C$ 3,500).

### Código implementado

```tsx
// src/pages/Results.tsx — Filtro de precio máximo (HU-007)
const [precioMax, setPrecioMax] = useState(3500);

// Precio mínimo de cada hotel: el menor precio entre sus habitaciones disponibles
const precioMin = (hotelId: string) => {
  const ps = HABITACIONES_SEED
    .filter((h) => h.hotelId === hotelId && h.estado === "disponible")
    .map((h) => h.precio);
  return ps.length ? Math.min(...ps) : Infinity;
};

// Dentro del filtro: descarta hoteles cuyo precio mínimo excede el máximo elegido
if (min > precioMax) return false;
```

En la barra lateral, el control se define con `<input type="range" min={800} max={3500} step={100}>` y la etiqueta con el valor actual usa `precioMax.toLocaleString()` para mostrar el monto con separador de miles. La función `limpiar()` restablece el slider a 3500 junto con el resto de filtros. El filtrado es en tiempo real: el `useMemo` de `resultados` recalcula la lista en cada cambio del estado.

**Referencia de versión:** implementado desde la maqueta funcional v0.4.0 y verificado en las fases posteriores.

---

## HU-008 — Filtrar hoteles por capacidad

### Redacción estándar

> **Como** turista, **quiero** filtrar hoteles según la cantidad de huéspedes que necesito alojar, **para** encontrar habitaciones adecuadas para mi grupo de viaje.

### Criterios BDD

- **Dado** que la turista se encuentra en la pantalla de búsqueda, **cuando** selecciona un número de huéspedes, **entonces** el sistema filtra los hoteles con habitaciones para esa cantidad de personas.
- **Dado** que existen hoteles con habitaciones de capacidad 2, 4 y 6, **cuando** la turista selecciona 4 huéspedes, **entonces** solo se muestran hoteles con habitaciones que cubran esa cantidad.
- **Dado** que la turista cambia la cantidad de huéspedes, **cuando** modifica el valor, **entonces** los resultados se actualizan inmediatamente.
- **Dado** que ya aplicó filtros de precio y departamento, **cuando** ajusta los huéspedes, **entonces** se aplican todos los filtros simultáneamente.
- **Dado** que no existen hoteles con capacidad suficiente, **cuando** aplica el filtro, **entonces** el sistema informa que no hay disponibilidad y sugiere reducir el número de huéspedes.
- **Dado** que presiona "Limpiar filtros", **cuando** se restablecen los valores, **entonces** la cantidad de huéspedes vuelve al valor por defecto (2).

### Código implementado

```tsx
// src/pages/Results.tsx — Filtro por capacidad (HU-008)
// Debe existir al menos una habitación que admita a los huéspedes con cupo real
const aptas = HABITACIONES_SEED.filter(
  (hab) =>
    hab.hotelId === h.id &&
    hab.estado === "disponible" &&
    hab.capacidad >= huespedes &&
    disponiblesDe(hab.id, llegada, salida) > 0
);
return aptas.length > 0;
```

En la versión v0.24.0 se agregó el filtro de huéspedes en la barra lateral con botones +/- (rango 1-10), la distinción entre adultos (1-10) y niños (0-8) en la barra de búsqueda, y el componente de tarjeta (`src/tarjeta.tsx`) recibió la prop `huespedes` para mostrar con un icono de cama cuántas habitaciones son aptas. El estado vacío del edge case muestra un mensaje detallado sugiriendo reducir el número de personas.

**Referencia de versión:** v0.24.0 del CHANGELOG.

---

## HU-009 — Consultar detalles del hotel

### Redacción estándar

> **Como** turista, **quiero** ver la información detallada de un hotel específico, **para** evaluar si cumple con mis expectativas antes de reservar.

### Criterios BDD

- **Dado** que el turista seleccionó un hotel de la lista, **cuando** accede a la página de detalles, **entonces** el sistema muestra nombre, descripción, ubicación, servicios, fotos y calificación promedio.
- **Dado** que el hotel fue desactivado o eliminado, **cuando** el turista intenta acceder a sus detalles, **entonces** se muestra un mensaje indicando que el hotel ya no está disponible.
- **Dado** que el turista observa la galería, **cuando** navega por las imágenes, **entonces** ve al menos 3 fotos del hotel con efecto hover de zoom.
- **Dado** que el turista observa la sección de servicios, **cuando** revisa las amenidades, **entonces** ve todas las disponibles con iconos descriptivos.
- **Dado** que el turista observa la calificación, **cuando** revisa las reseñas, **entonces** ve el promedio de estrellas, la cantidad de reseñas y su distribución.

### Código implementado

La página `src/pages/HotelDetail.tsx` concentra la historia. El edge case se resuelve al inicio del componente verificando `!hotel` y renderizando el mensaje de no disponibilidad. Las amenidades se pintan con el componente `IconoAmenidad` y el diccionario `AMENIDADES`:

```tsx
// src/pages/HotelDetail.tsx — Amenidades con iconos (HU-009)
<p className="text-xs font-bold uppercase tracking-wider text-muted">Lo que ofrece</p>
<div className="mt-2.5 flex flex-wrap gap-2">
  {hotel.amenidades.map((a) => (
    <span key={a} className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
      <IconoAmenidad a={a} /> {AMENIDADES[a] ?? a}
    </span>
  ))}
</div>
```

La galería usa el array `hotel.galeria` con zoom en hover; las reseñas se filtran por `hotel.id` desde el store; la ubicación se representa con un mapa SVG estilizado con pin; y en v0.25.0 se agregó la información de contacto directa (teléfono y correo) con los iconos `IconoTelefono` e `IconoCorreo` en la tarjeta lateral.

**Referencia de versión:** v0.25.0 del CHANGELOG.

---

## HU-010 — Consultar habitaciones y precios

### Redacción estándar

> **Como** turista, **quiero** ver las habitaciones disponibles de un hotel con sus precios, **para** comparar opciones y elegir la que mejor se adapte a mi necesidad.

### Criterios BDD

- **Dado** que el turista está en la página de detalles del hotel, **cuando** consulta la sección de habitaciones, **entonces** el sistema lista cada tipo de habitación con su capacidad, amenities y precio por noche en córdobas.
- **Dado** que el turista observa cada habitación, **cuando** revisa su estado, **entonces** ve un indicador visual (badge) que muestra si está disponible, agotada o en mantenimiento.
- **Dado** que el hotel no tiene habitaciones registradas, **cuando** el turista consulta la sección, **entonces** se muestra el mensaje "Este hotel aún no tiene habitaciones disponibles".

### Código implementado

La sección de habitaciones de `src/pages/HotelDetail.tsx` incluye los selectores de fechas y huéspedes que recalculan la disponibilidad en tiempo real, y un estado `vistaComparativa` que alterna entre lista vertical y cuadrícula de 2-3 columnas para comparar:

```tsx
// src/pages/HotelDetail.tsx — Edge case de habitaciones (HU-010)
{rooms.every((r) =>
  r.estado !== "disponible" ||
  disponiblesDe(r.id, llegada, salida) === 0 ||
  r.capacidad < huespedes
) && (
  <p className="rounded-xl border border-[#FCD34D] bg-accent-light px-5 py-4 text-sm font-semibold text-[#92400E]">
    Por ahora este hotel no tiene habitaciones disponibles para las fechas seleccionadas.
    Prueba con otras fechas.
  </p>
)}
```

Cada tarjeta de habitación muestra tipo, detalle, capacidad, unidades y precio; el badge de estado (`BadgeHabitacion`) cambia de color según disponibilidad, agotamiento o mantenimiento; y el precio se presenta por noche en córdobas (C$).

**Referencia de versión:** v0.26.0 del CHANGELOG.

---

## HU-011 — Consultar disponibilidad por fechas

### Redacción estándar

> **Como** turista de Hotelica, **quiero** verificar la disponibilidad de una habitación para fechas específicas, **para** asegurar que puedo reservar en el período deseado.

### Criterios BDD

- **Dado** que el turista está en el detalle de un hotel, **cuando** selecciona fechas de llegada y salida, **entonces** se muestra la cantidad de unidades disponibles de cada habitación (ej. "3 disponibles").
- **Dado** que todas las unidades de un tipo están ocupadas para las fechas, **cuando** el turista visualiza las habitaciones, **entonces** se muestra "Agotado para tus fechas" en rojo.
- **Dado** que la fecha de salida es igual o anterior a la de llegada, **cuando** busca disponibilidad, **entonces** no se muestran resultados y se indican las fechas inválidas.
- **Dado** que el turista realiza una búsqueda, **cuando** se muestran los resultados, **entonces** solo aparecen hoteles con al menos una habitación disponible y cada tarjeta indica las unidades libres.
- **Dado** que el turista selecciona una habitación para reservar, **cuando** se abre el modal de reserva, **entonces** se muestra la cantidad disponible y el botón se bloquea si hay 0.

### Código implementado

El núcleo de la historia son dos funciones puras: el traslape de rangos de fechas en `src/data.ts` y el cálculo de unidades libres en `src/store.tsx`:

```tsx
// src/data.ts — Traslape de rangos de fechas (HU-011)
export function seTraslapan(aIni: string, aFin: string, bIni: string, bFin: string): boolean {
  return aIni < bFin && bIni < aFin;
}

// src/store.tsx — Disponibilidad = total de unidades - ocupadas en esas fechas (HU-011)
const disponiblesDe = (habitacionId: string, llegada: string, salida: string) => {
  const ocupadas = datos.reservas.filter(
    (r) =>
      r.habitacionId === habitacionId &&
      r.estado !== "cancelada" &&
      r.estado !== "completada" &&
      seTraslapan(llegada, salida, r.llegada, r.salida)
  ).length;
  return Math.max(0, unidadesDe(habitacionId) - ocupadas);
};
```

Como mejoras complementarias (v0.23.0) se implementaron: el **calendario visual** `src/pages/CalendarioDisponibilidad.tsx` con vista mensual y colores por estado (verde = libre, amarillo = parcial, rojo = bloqueado, gris = pasado, azul = seleccionado); la función `sugerirFechasAlternativas()` en `src/data.ts`, que busca hasta 3 rangos cercanos (±30 días) con disponibilidad; y su integración en `HotelDetail.tsx` y `BookingModal.tsx`, donde un panel azul propone fechas alternativas con un clic cuando no hay cupo. Además, las tarjetas de resultados (`src/tarjeta.tsx`) muestran el badge de disponibilidad (verde ">5 unidades", amarillo "¡Solo X disponibles!", rojo "Sin disponibilidad").

**Referencia de versión:** v0.22.0 y v0.23.0 del CHANGELOG.

---

## HU-012 — Ver destinos y actividades turísticas

### Redacción estándar

> **Como** turista de Hotelica, **quiero** explorar destinos turísticos y actividades disponibles en cada departamento, **para** planificar mi viaje conociendo qué puedo hacer en cada lugar.

### Criterios BDD

- **Dado** que el turista está en la página de destinos, **cuando** carga la página, **entonces** se muestran los destinos turísticos agrupados por departamento con nombre, descripción e imagen.
- **Dado** que el turista selecciona un departamento, **cuando** aplica el filtro, **entonces** se muestran solo los destinos de ese departamento.
- **Dado** que el turista hace clic en un destino, **cuando** abre el detalle, **entonces** se muestra el destino con sus actividades turísticas disponibles.
- **Dado** que el turista visualiza las actividades, **cuando** revisa la información, **entonces** las ve categorizadas (aventura, cultura, naturaleza, playa) con descripción y nivel de dificultad.
- **Dado** que el turista está en la página de inicio, **cuando** hace clic en "Explorar destinos" o en un departamento, **entonces** es redirigido a la página de destinos con el departamento preseleccionado.

### Código implementado

Se creó el catálogo de datos `DESTINOS_TURISTICOS` en `src/data.ts`, donde cada destino contiene un array de actividades con `categoria`, `dificultad`, `duracion` y `precio`:

```tsx
// src/data.ts — Catálogo de destinos turísticos (HU-012)
export const DESTINOS_TURISTICOS: DestinoTuristico[] = [
  {
    id: "dt-granada-centro",
    nombre: "Centro Colonial de Granada",
    departamentoId: "granada",
    descripcion: "La ciudad colonial más antigua de América continental...",
    imagen: IMG.granada,
    actividades: [
      { id: "a-granada-1", nombre: "Recorrido por Calle La Calzada",
        descripcion: "Paseo peatonal junto al lago...", categoria: "cultura",
        dificultad: "baja", duracion: "1-2 horas", precio: 0 },
      { id: "a-granada-3", nombre: "Paseo en lancha por Las Isletas",
        descripcion: "365 isletas volcánicas en el lago...", categoria: "naturaleza",
        dificultad: "baja", duracion: "2-3 horas", precio: 500 },
    ],
  },
  // ... destinos de León, Rivas/Ometepe, Managua, Masaya, etc.
];
```

La página nueva `src/pages/Destinos.tsx` presenta un grid de tarjetas con filtrado por departamento, y la ruta `destinos` se registró en `src/rutas.ts` con integración de navegación desde `Home.tsx`. Las categorías de actividades se distinguen visualmente y cada una indica su nivel de dificultad (baja/media/alta).

**Referencia de versión:** v0.27.0 del CHANGELOG.

---

## Resumen general de la implementación

| HU | Historia | Archivos principales | Estado |
|----|----------|----------------------|--------|
| HU-001 | Registrarse | `src/store.tsx`, `src/layout.tsx` | ✅ Terminada |
| HU-002 | Iniciar sesión | `src/store.tsx`, `src/layout.tsx` | ✅ Terminada |
| HU-003 | Cerrar sesión | `src/store.tsx`, `src/layout.tsx`, `src/App.tsx` | ✅ Terminada |
| HU-004 | Recuperar contraseña | `src/pages/ForgotPassword.tsx`, `src/pages/ResetPassword.tsx` | ✅ Terminada |
| HU-005 | Gestionar perfil | `src/pages/Profile.tsx`, `src/store.tsx` | ✅ Terminada |
| HU-006 | Buscar hoteles | `src/pages/Home.tsx`, `src/pages/Results.tsx` | ✅ Terminada |
| HU-007 | Filtrar por precio | `src/pages/Results.tsx` | ✅ Terminada |
| HU-008 | Filtrar por capacidad | `src/pages/Results.tsx`, `src/tarjeta.tsx` | ✅ Terminada |
| HU-009 | Detalles del hotel | `src/pages/HotelDetail.tsx`, `src/icons.tsx` | ✅ Terminada |
| HU-010 | Habitaciones y precios | `src/pages/HotelDetail.tsx` | ✅ Terminada |
| HU-011 | Disponibilidad por fechas | `src/store.tsx`, `src/data.ts`, `src/pages/CalendarioDisponibilidad.tsx` | ✅ Terminada |
| HU-012 | Destinos y actividades | `src/data.ts`, `src/pages/Destinos.tsx` | ✅ Terminada |

Como conclusión del desarrollo, las doce historias de usuario cubren el ciclo completo del turista dentro de Hotelica: desde la autenticación (registro, login, logout, recuperación de contraseña y perfil), pasando por la búsqueda con filtros combinables (departamento, municipio, precio, capacidad y disponibilidad real por fechas), hasta la exploración de contenido turístico. La arquitectura se apoyó en un estado global con React Context (`src/store.tsx`), datos de dominio centralizados en `src/data.ts` y verificación continua de tipos con `npm run typecheck`.

---

## Evidencia visual

*[Insertar en este punto la captura de pantalla de la aplicación en ejecución donde se aprecie la funcionalidad correspondiente: por ejemplo, el modal de registro con el saludo del usuario autenticado en el header, la página de resultados con los filtros de precio y capacidad aplicados, el detalle del hotel con sus habitaciones y badges de disponibilidad, o el calendario visual de disponibilidad. Se recomienda capturar la vista completa del navegador para que se observe la URL y el estado de la interfaz.]*

**Figura 1.** Evidencia de la ejecución de las funcionalidades de Hotelica (HU-001 a HU-012) en el navegador.
*Fuente: Elaboración propia (2026).*

---

## Sobre el código fuente del proyecto

El desarrollo aquí documentado no se limita a este informe: todo el código de las historias de usuario implementadas se encuentra disponible en el repositorio del proyecto, donde se puede revisar el historial de versiones registrado en el `CHANGELOG.md` (desde la maqueta funcional v0.4.0 hasta la integración de Supabase Auth v0.31.0), así como desplegar la aplicación en entorno local para reproducir cada uno de los escenarios BDD presentados. El repositorio constituye, por tanto, la evidencia técnica complementaria de este documento y permite auditar que cada criterio de aceptación corresponde a un cambio concreto y trazable en el código.

**Repositorio del proyecto:** [https://github.com/crisurbina0404/Hotelica](https://github.com/crisurbina0404/Hotelica)
