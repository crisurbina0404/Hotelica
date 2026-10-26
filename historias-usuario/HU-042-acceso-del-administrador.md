# HU-042 — Acceso de administrador con cuenta real

**Módulo:** Administración
**Prioridad:** Alta (Must Have)
**Estado:** ✅ Terminada
**Sprint:** 7
**Interfaz:** barra de navegación (`src/layout.tsx`), login (`src/store.tsx`) y ruta `admin` (`src/App.tsx`)

## Redacción estándar

> Como **responsable de la plataforma**, quiero **que la consola de administración solo se abra con una cuenta de administrador real**, para **que ningún visitante pueda aprobar hoteles, crear cuentas ni ver los ingresos de Hotelica**.

## Contexto

Hasta ahora la consola de administración se abría con el botón **"Demo admin"** de la barra: cualquier persona que entrara al sitio podía hacer clic y quedarse con el rol administrador. Ese rol se guardaba en el navegador (`localStorage["hotelica-rol"]`), así que además de usarlo desde el botón, cualquiera podía escribirlo a mano desde las herramientas del navegador y entrar igual.

El problema no es cosmético: desde esa consola se **aprueban y rechazan hoteles**, se **crean cuentas de hotelero con contraseña** y se ven los **ingresos de la plataforma**. Con el sitio desplegado en hotelica.vercel.app, hoy un desconocido puede estar tomando esas decisiones sobre la base de datos real.

Esta historia reemplaza el demo por un **acceso de verdad**:

1. **Login real:** el administrador inicia sesión con Supabase Auth (el mismo login de HU-002) usando una cuenta creada en el Dashboard.
2. **La base decide quién es admin:** existe una tabla `administradores` con los correos autorizados. El navegador consulta esa tabla y solo entonces asume el rol.
3. **El servidor también vigila:** un disparador en la tabla `hoteles` rechaza cualquier cambio de `aprobado` que no venga con sesión de administrador. Aunque alguien se salte la interfaz, la base no deja aprobar nada.

Al terminar, el botón "Demo admin" desaparece y la consola queda detrás del login, igual que el panel del hotel (HU-021).

Reglas de negocio de esta historia:

1. **Se elimina el demo:** ya no existe el botón "Demo admin" ni la manera de entrar a la consola sin iniciar sesión.
2. **Rol por consulta, no por memoria:** el rol "admin" solo se asigna cuando, tras iniciar sesión, el correo aparece en la tabla `administradores`. Guardar `admin` en el navegador no alcanza.
3. **Se revalida al recargar:** al abrir o recargar la página con sesión de Supabase, se vuelve a consultar la tabla; si el correo ya no está en la lista, el rol vuelve a turista. Sin sesión de Supabase nunca puede quedar el rol admin.
4. **Ruta protegida:** la consola (`ruta admin`) solo se muestra con sesión iniciada y rol admin; en cualquier otro caso la app vuelve al inicio.
5. **El servidor manda:** los hoteles nuevos se insertan con `estado_hotel = 'Pendiente'` y solo un administrador autenticado puede cambiar ese estado; la base rechaza el cambio con un error si no hay sesión de admin.
6. **La lista se administra en el Dashboard:** agregar o quitar correos de administrador se hace en Supabase (SQL Editor), no desde la interfaz.
7. **Cerrar sesión borra el acceso:** con "Cerrar sesión" desaparece el enlace a la consola y la ruta deja de abrirse.

## Criterios de aceptación (BDD)

### Escenario 1: El botón Demo ya no existe y el rol guardado no alcanza (HOTELICA-274)
**Dado** que un visitante abre Hotelica sin iniciar sesión
**Cuando** mira la barra de navegación (y también si fuerza el rol `admin` en el navegador y recarga)
**Entonces** no aparece ningún botón "Demo admin" ni el enlace a la consola, y la ruta de administración lo devuelve al inicio

### Escenario 2: El administrador entra con su cuenta (HOTELICA-275)
**Dado** que existe un usuario en Supabase Auth cuyo correo está en la tabla `administradores`
**Cuando** inicia sesión con ese correo y contraseña
**Entonces** el sistema lo reconoce como administrador, le muestra el enlace "Consola admin" y, al entrar, ve la bandeja de hoteles pendientes con sus acciones de aprobación

### Escenario 3: Un turista nunca ve la consola (HOTELICA-276)
**Dado** que un usuario sin correo en `administradores` inicia sesión
**Cuando** navega por el sitio
**Entonces** no se muestra ningún enlace a la consola de administración y su rol sigue siendo turista

### Escenario 4: Al recargar el rol se verifica de nuevo (HOTELICA-277)
**Dado** que había quedado el rol `admin` guardado en el navegador
**Cuando** se recarga la página sin sesión de Supabase, o con una sesión cuyo correo no está en la lista de administradores
**Entonces** el rol vuelve a turista y la consola no se abre

### Escenario 5: Cerrar sesión quita la consola (HOTELICA-278)
**Dado** que un administrador está dentro de la consola
**Cuando** pulsa "Cerrar sesión"
**Entonces** el enlace a la consola desaparece, la ruta deja de abrirse y no queda ningún rastro del rol admin en el navegador

### Escenario 6: La base rechaza un cambio de estado sin administrador (HOTELICA-279)
**Dado** que un visitante (sin sesión de administrador) intenta cambiar `aprobado` de un hotel directamente contra la base de datos
**Cuando** se ejecuta la escritura
**Entonces** la base la rechaza con el mensaje "Solo un administrador puede aprobar o rechazar un hotel" y el hotel conserva su estado

## MoSCoW

- **Must Have:** eliminar el botón "Demo admin"; login de Supabase que consulta la tabla `administradores`; revalidación del rol al recargar; ruta `admin` protegida por sesión y rol; disparador en `hoteles` que solo deja cambiar `aprobado` con sesión de admin.
- **Should Have:** entrar directo a la consola al iniciar sesión como administrador; mensaje de bienvenida distinto para el admin; la migración SQL queda registrada en `supabase/migrations/` para repetirla en otro entorno.
- **Could Have:** pantalla de login propia para administradores; registro de quién aprobó cada hotel (auditoría); agregar y quitar administradores desde la consola.
- **Won't Have:** protección completa de todas las políticas RLS (siguen como en la Fase 2); administradores con Google OAuth; doble factor (2FA); roles intermedios (editor, revisor).

## Notas de implementación

- **Tabla `administradores`:** migración `supabase/migrations/20261026090000_hu042_acceso_administrador.sql`, con la tabla, la función `es_admin()` y el disparador `controlar_estado_hotel`. Se corre desde el SQL Editor del Dashboard y ahí se inserta el correo del admin real (subtarea HOTELICA-274).
- **Consulta del rol:** `esAdministrador()` en `src/store.tsx` busca el correo en `administradores` con la sesión de Supabase; si la base no responde, devuelve `false` (nadie queda como admin por una falla) (subtarea HOTELICA-275).
- **Login:** `login()` en `src/store.tsx` suma el resultado `"Admin"` y, cuando la lista confirma el correo, asume `rol = "admin"`; `manejarLogin` en `src/layout.tsx` lo lleva directo a la consola, igual que el hotelero va a su panel (subtarea HOTELICA-275).
- **Recarga:** un `useEffect` del store vuelve a consultar `administradores` con la sesión existente y baja el rol a turista si el correo ya no califica; por eso escribir `hotelica-rol = admin` a mano ya no sirve (subtarea HOTELICA-277).
- **Botón demo eliminado:** desaparecen `entrarAlAdmin()` y `salirDelAdmin()` de `src/layout.tsx`, junto con el botón de la barra; queda el enlace "Consola admin" que ya solo se muestra con `rol === "admin"` (subtarea HOTELICA-274).
- **Ruta:** `puedeVer()` en `src/App.tsx` exige `rol === "admin"` **y** un `usuario` con sesión, además del chequeo que ya existía (subtarea HOTELICA-274).
- **Servidor:** `es_admin()` (security definer, lee `administradores`) y el disparador `controlar_estado_hotel` que en INSERT exige `pendiente` y en UPDATE solo deja mover `aprobado` a un admin autenticado (subtarea HOTELICA-279).
- **Pruebas:** `tests/CP-042-acceso-admin.spec.ts` cubre los escenarios 1 a 5 con Playwright simulando las respuestas de Supabase (rol admin y turista); `tests/CP-031-aprobar-hotel.spec.ts` pasó de usar el botón demo a entrar con login de administrador. El escenario 6 se verifica en el Dashboard de Supabase con el disparador.
