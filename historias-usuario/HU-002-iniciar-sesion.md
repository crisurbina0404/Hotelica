# HU-002 — Iniciar sesión

**Módulo:** Autenticación  
**Prioridad:** Alta (Must Have)  
**Estado:** ⬜ Escrita  
**Sprint:** 1  
**Interfaz:** Modal / Header

## Redacción estándar

> Como **visitante de Hotelica**, quiero **iniciar sesión con correo y contraseña** (o con redes sociales simuladas) para **acceder a funcionalidades personalizadas como reservas, favoritos y el historial de estancias**.

## Contexto

Hotelica es una maqueta funcional (datos simulados). No hay backend real: el login valida que los campos no estén vacíos y asigna un usuario demo al estado global. Los botones sociales (Google, Facebook, Apple) hacen login directo como "Turista" por ahora.

## Criterios de aceptación (BDD)

### Escenario 1: Login exitoso con credenciales
**Dado** que el visitante está en la página principal  
**Cuando** ingresa un correo no vacío y una contraseña no vacía y presiona "Iniciar sesión"  
**Entonces** el header muestra "Hola, {nombre}" y el botón "Cerrar sesión"

### Escenario 2: Campos vacíos muestran error
**Dado** que el visitante está en la página principal  
**Cuando** deja el correo o la contraseña vacíos y presiona "Iniciar sesión"  
**Entonces** se muestra un mensaje de error en rojo y no se realiza login

### Escenario 3: Login con redes sociales
**Dado** que el visitante está en la página principal  
**Cuando** presiona el botón de Google, Facebook o Apple  
**Entonces** se realiza login directo como "Turista Demo"

### Escenario 4: Credenciales incorrectas
**Dado** que el visitante está en la página principal  
**Cuando** ingresa un correo que no existe o una contraseña incorrecta  
**Entonces** se muestra un mensaje de error indicando credenciales inválidas

## MoSCoW

- **Must Have:** Formulario con correo y contraseña, validación de campos vacíos.
- **Should Have:** Botones de login social (Google, Facebook, Apple).
- **Could Have:** Recordar sesión en `localStorage`.
- **Won't Have:** Integración real con proveedores OAuth (solo simulado).

## Notas de implementación

- Estado global en `src/store.tsx`: campo `usuario` + acciones `login()` / `logout()`.
- Componente de login: modal en `src/layout.tsx` o componente dedicado.
- Header reactiva según `usuario`: muestra nombre o botón de login.
- Persistencia de sesión en `localStorage`.
