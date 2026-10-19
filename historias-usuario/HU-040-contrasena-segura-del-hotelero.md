# HU-040 — Contraseña segura del hotelero (48 horas y criterios con palomitas)

**Módulo:** Autenticación / Gestión Hotel
**Prioridad:** Alta (Must Have)
**Estado:** ✅ Terminada
**Sprint:** 7
**Interfaz:** banner "Cambiá tu contraseña temporal" en `src/pages/HotelPanel.tsx` y sección "Contraseña de acceso" en `src/pages/Profile.tsx`

## Redacción estándar

> Como **hotelero**, quiero **que mi contraseña cumpla criterios de seguridad y que la temporal dure 48 horas** para **proteger el acceso a mi panel y a las reservas de mi hotel**.

## Contexto

La contraseña que regala el administrador al aprobar el hotel es débil (`hotel` + 4 números)
y por eso vence sola para obligar al dueño a crear una propia (se creó en la versión v0.45.0,
sin HU). Esa primera versión tenía dos debilidades que el usuario detectó al probar:

1. La temporal solo duraba **24 horas**, poco para un dueño que recién se entera de que su
   hotel fue aprobado.
2. La contraseña propia solo pedía "mínimo 6 caracteres": podía quedar algo como `123456`.

Además, en el perfil la sección "Contraseña de acceso" dejaba cambiar la contraseña sin
pedir la actual: cualquiera que se dejara la sesión abierta en una compu ajena podía
cambiarla sin más.

Con esta historia la temporal pasa a durar **48 horas** y la contraseña propia debe cumplir
cuatro criterios que se ven en vivo con **palomita ✓ o equis ✗** mientras se escribe.
Desde el perfil, además, hay que escribir la **contraseña actual** antes de poner la nueva.

Reglas de negocio de esta historia:

1. **La contraseña temporal dura 48 horas** (`VIDA_TEMPORAL_MS` en `src/data.ts`). Si vence
   sin cambiarse, el login del hotelero queda bloqueado y le pide una nueva al administrador.
2. **Criterios de la contraseña nueva:** al menos **8 caracteres**, al menos **una letra
   minúscula**, al menos **un número** y al menos **un símbolo** (por ejemplo `@ # ! ?`).
3. **Las palomitas se actualizan mientras se escribe:** cada criterio muestra ✓ verde o ✗
   gris; el botón de guardar solo tiene efecto si los cuatro están en verde.
4. **Se pide confirmar** la contraseña nueva (escribir la misma en los dos campos), igual
   que hasta ahora.
5. **Desde el perfil se pide también la contraseña actual:** si no coincide con la que tiene
   guardada la cuenta, no se cambia nada y se avisa.
6. El **banner del panel no pide la actual** (el hotelero acaba de entrar con esa misma
   contraseña): allí basta nueva + confirmar.
7. El registro de turista y la recuperación de contraseña **no cambian** (siguen con su
   mínimo de 6 caracteres): esta historia es solo del lado del hotelero.

## Criterios de aceptación (BDD)

### Escenario 1: La temporal ahora dura 48 horas
**Dado** que el administrador aprobó un hotel y creó la cuenta del hotelero
**Cuando** el hotelero intenta entrar antes de las 48 horas de creada la cuenta
**Entonces** el login lo deja pasar y el banner le recuerda cambiar la contraseña

### Escenario 2: La temporal vencida bloquea el ingreso
**Dado** que la cuenta del hotelero se creó hace más de 48 horas y nadie cambió la contraseña
**Cuando** el hotelero intenta entrar con la contraseña temporal
**Entonces** el sistema no lo deja entrar y le pide pedirle una nueva al administrador

### Escenario 3: Las palomitas se actualizan al escribir
**DADO** que el hotelero está en el banner del panel o en la sección de contraseña del perfil
**CUANDO** escribe en el campo de la contraseña nueva
**ENTonces** ve las cuatro palomitas (8 caracteres, minúscula, número, símbolo) cambiando a ✓ o ✗ según lo que lleva escrito

### Escenario 4: Guardar con una contraseña débil
**DADO** que el hotelero escribió una contraseña que no cumple algún criterio (por ejemplo, sin número)
**CUANDO** pulsa "Guardar mi contraseña" o "Cambiar contraseña"
**ENTONCES** el sistema no guarda nada y le dice cuál criterio falta

### Escenario 5: Las contraseñas no coinciden
**DADO** que el hotelero escribió dos contraseñas distintas en nueva y confirmar
**CUANDO** envía el formulario
**ENTONCES** el sistema no guarda nada y le avisa que las contraseñas no coinciden

### Escenario 6: Cambiar desde el perfil con la contraseña actual
**DADO** que el hotelero está en su perfil y quiere cambiar la contraseña
**CUANDO** llena los tres campos: actual, nueva y repetir
**ENTONCES** si la actual es correcta y las nuevas cumplen los criterios, la contraseña cambia y el aviso de temporal desaparece

### Escenario 7: Contraseña actual incorrecta
**DADO** que el hotelero escribió mal la contraseña actual en el perfil
**CUANDO** envía el formulario
**ENTONCES** el sistema no cambia nada y le avisa que la contraseña actual no es correcta

## MoSCoW

- **Must Have:** temporal de 48 horas; criterios de 8 caracteres, minúscula, número y símbolo; palomitas en vivo; confirmación; contraseña actual en el perfil.
- **Should Have:** mensajes que nombran el criterio que falta; el mismo checklist reutilizado en el banner y en el perfil.
- **Could Have:** medidor de fuerza (débil/media/fuerte), temporizador visible con las horas restantes.
- **Won't Have:** criterios en el registro de turista ni en la recuperación de contraseña; doble factor; bloqueo de IP.

## Notas de implementación

- **Vida de la temporal:** `VIDA_TEMPORAL_MS` en `src/data.ts` pasa de 24 a 48 horas (subtarea HOTELICA-256).
- **Criterios:** `criteriosDeContrasena()`, `esContrasenaSegura()` y `errorCriteriosContrasena()` en `src/data.ts`, para que la validación viva en un solo lugar (subtarea HOTELICA-257).
- **Guardado:** `cambiarContrasenaHotelero(nueva, confirmar, actual?)` en `src/store.tsx` valida criterios, coincidencia y, cuando se pasa `actual`, que coincida con la contraseña guardada (subtarea HOTELICA-258).
- **Palomitas en vivo:** componente `ChecklistContrasena` en `src/ui.tsx`, usado en el banner del panel y en el perfil (subtarea HOTELICA-259).
- **Perfil con tres campos:** en `src/pages/Profile.tsx` se agrega el campo "Contraseña actual" al formulario existente (subtarea HOTELICA-260).
- **Textos:** los mensajes de 24 horas del panel, el perfil, la inscripción y el login se actualizan a 48 (subtarea HOTELICA-261).
