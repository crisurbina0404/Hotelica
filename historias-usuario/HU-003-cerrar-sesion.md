# HU-003 — Cerrar sesión

**Módulo:** Autenticación  
**Prioridad:** Alta (Must Have)  
**Estado:** ⬜ Escrita  
**Sprint:** 1  
**Interfaz:** Header

## Redacción estándar

> Como **usuario autenticado en Hotelica**, quiero **cerrar mi sesión** para **proteger mi información y salir de forma segura de la plataforma**.

## Contexto

Una vez que el usuario ha iniciado sesión, necesita poder cerrarla para proteger su privacidad, especialmente en dispositivos compartidos. El cierre de sesión debe limpiar el estado de autenticación y redirigir al visitante a la página pública.

## Criterios de aceptación (BDD)

### Escenario 1: Cierre de sesión exitoso
**Dado** que el usuario está autenticado (header muestra "Hola, {nombre}")  
**Cuando** presiona el botón "Cerrar sesión"  
**Entonces** se elimina la sesión, el header vuelve a mostrar "Iniciar sesión" y se redirige a Home

### Escenario 2: Confirmación antes de cerrar (opcional)
**Dado** que el usuario está autenticado  
**Cuando** presiona "Cerrar sesión"  
**Entonces** se muestra un toast de confirmación "Sesión cerrada" y el usuario vuelve al estado de visitante

### Escenario 3: Estado limpio tras cerrar sesión
**Dado** que el usuario cerró sesión  
**Cuando** intenta acceder a una ruta protegida (Mis Reservas, Panel Hotel, Admin)  
**Entonces** se redirige automáticamente a la página de inicio

## MoSCoW

- **Must Have:** Botón "Cerrar sesión" visible en el header, limpieza de estado.
- **Should Have:** Toast de confirmación "Sesión cerrada".
- **Could Have:** Diálogo de confirmación antes de cerrar.
- **Won't Have:** Cierre de sesión en todos los dispositivos (solo local).

## Notas de implementación

- Acción `logout()` en `src/store.tsx`: establece `usuario` en null.
- Limpieza de `localStorage` (clave `hotelica-usuario`).
- Header se actualiza automáticamente al cambiar `usuario`.
- Protección de rutas en `src/App.tsx`: redirigir a Home si `usuario` es null.
