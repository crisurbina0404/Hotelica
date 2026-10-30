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
**Cuando** ingresa un correo válido, una contraseña segura (mínimo 8 caracteres, con minúscula, número y símbolo) y presiona "Registrarse"  
**Entonces** se crea la cuenta, se inicia sesión automáticamente y se muestra el header con "Hola, {nombre}"

### Escenario 2: Correo ya registrado
**Dado** que el visitante está en la pantalla de registro  
**Cuando** ingresa un correo que ya existe en el sistema  
**Entonces** se muestra un mensaje de error indicando que el correo ya está registrado

### Escenario 3: Campos vacíos o contraseña débil
**Dado** que el visitante está en la pantalla de registro  
**Cuando** deja campos obligatorios vacíos, escribe un correo sin formato (sin @ o sin dominio) o ingresa una contraseña que no cumple los criterios de contraseña segura  
**Entonces** se muestra un mensaje de error indicando los campos incorrectos

### Escenario 4: Registro con redes sociales
**Dado** que el visitante está en la pantalla de registro  
**Cuando** presiona el botón de Google, Facebook o Apple  
**Entonces** se crea una cuenta vinculada al proveedor y se inicia sesión

### Escenario 5: Cancelar el registro y seguir navegando
**Dado** que el visitante abrió la ventana de registro (desde "Registrarse" o al intentar reservar sin sesión)  
**Cuando** pulsa la X, la tecla Escape o toca fuera de la ventana  
**Entonces** la ventana se cierra sin crear la cuenta y el visitante sigue en la misma pantalla, sin quedar obligado a registrarse

## MoSCoW

- **Must Have:** Formulario con correo y contraseña, validación básica, creación de cuenta.
- **Should Have:** Botones de registro social (Google, Facebook, Apple).
- **Could Have:** Verificación de correo por código.
- **Won't Have:** Integración real con proveedores OAuth (solo simulado).

## Notas de implementación

- Componente de registro: modal o página dedicada en `src/pages/`.
- Estado global en `src/store.tsx`: acción `registrar()`.
- Validación de duplicados en el estado simulado.
- La contraseña del turista usa la misma política que la del hotelero (HU-040): mínimo 8 caracteres con minúscula, número y símbolo. Antes pedía solo 6 caracteres; se unificó para que ninguna cuenta de la plataforma nazca débil. Mientras escribe aparece la misma checklist en vivo (`ChecklistContrasena`).
- Al completar el registro, la ventana se cierra y el visitante sigue en la pantalla donde estaba, ya con sesión iniciada.
- El modal de registro se puede cerrar con la X, Escape o el fondo; no bloquea la navegación (HU-038). El estado `registroAbierto` tiene que formar parte del valor del contexto para que el modal abra y cierre al instante.
