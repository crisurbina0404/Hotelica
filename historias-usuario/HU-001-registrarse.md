# HU-001 — Registrarse en la plataforma

**Módulo:** Autenticación  
**Prioridad:** Alta (Must Have)  
**Estado:** ⬜ Escrita  
**Sprint:** 1  
**Interfaz:** Modal / Página de registro

## Redacción estándar

> Como **visitante de Hotelica**, quiero **registrarme en la plataforma con correo electrónico y contraseña** para **poder iniciar sesión, realizar reservas y gestionar mis estancias**.

## Contexto

Hotelica es una plataforma de reserva hotelera para Nicaragua. El visitante necesita crear una cuenta para acceder a funcionalidades como reservar habitaciones, ver historial y calificar estancias. El registro es el primer paso del embudo de conversión.

## Criterios de aceptación (BDD)

### Escenario 1: Registro exitoso con datos válidos
**Dado** que el visitante está en la pantalla de registro  
**Cuando** ingresa un correo válido, una contraseña (mínimo 6 caracteres) y presiona "Registrarse"  
**Entonces** se crea la cuenta, se inicia sesión automáticamente y se muestra el header con "Hola, {nombre}"

### Escenario 2: Correo ya registrado
**Dado** que el visitante está en la pantalla de registro  
**Cuando** ingresa un correo que ya existe en el sistema  
**Entonces** se muestra un mensaje de error indicando que el correo ya está registrado

### Escenario 3: Campos vacíos o contraseña débil
**Dado** que el visitante está en la pantalla de registro  
**Cuando** deja campos obligatorios vacíos o ingresa una contraseña menor a 6 caracteres  
**Entonces** se muestra un mensaje de error indicando los campos incorrectos

### Escenario 4: Registro con redes sociales
**Dado** que el visitante está en la pantalla de registro  
**Cuando** presiona el botón de Google, Facebook o Apple  
**Entonces** se crea una cuenta vinculada al proveedor y se inicia sesión

## MoSCoW

- **Must Have:** Formulario con correo y contraseña, validación básica, creación de cuenta.
- **Should Have:** Botones de registro social (Google, Facebook, Apple).
- **Could Have:** Verificación de correo por código.
- **Won't Have:** Integración real con proveedores OAuth (solo simulado).

## Notas de implementación

- Componente de registro: modal o página dedicada en `src/pages/`.
- Estado global en `src/store.tsx`: acción `registrar()`.
- Validación de duplicados en el estado simulado.
- Redirección automática a Home tras registro exitoso.
