# HU-021 — Registrar un hotel

**Módulo:** Gestión Hotel  
**Prioridad:** Alta (Must Have)  
**Estado:** ✅ Terminada  
**Sprint:** 4  
**Interfaz:** formulario público en `src/pages/InscribeHotel.tsx` (sección al final del Inicio)

## Redacción estándar

> Como **hotelero**, quiero **inscribir mi hotel proporcionando su información básica desde el inicio del sitio** para **que un administrador lo revise y, si lo aprueba, pueda ofrecerlo en la plataforma**.

## Contexto

Un hotelero nuevo llega a Hotelica y necesita dar de alta su hotel antes de poder recibir reservas. Lo hace desde una sección pública al final del Inicio, **sin necesidad de cuenta**: solo llena el formulario con los datos del hotel y sus propios datos (nombre y correo). El formulario pide los datos esenciales del establecimiento: nombre, ubicación (departamento y municipio), descripción, teléfono opcional y al menos una fotografía representativa.

La solicitud le llega al **administrador**, que la lee y decide. Si la **aprueba**, el sistema crea automáticamente la **cuenta de hotelero** con el correo y una contraseña temporal que el admin le envía al dueño; con esa cuenta el hotelero inicia sesión y queda dirigido a su **panel del hotel**. Si la **rechaza**, el hotel no se publica.

Al guardar, el hotel **no aparece en las búsquedas todavía**: se registra con `estado_hotel = 'Pendiente'` y solo se vuelve visible cuando el admin lo aprueba. Esta regla evita que entren hoteles sin verificar.

## Criterios de aceptación (BDD)

### Escenario 1: Inscribir un hotel correctamente
**Dado** que el hotelero está en la sección "Inscribe tu hotel" del Inicio  
**Cuando** completa todos los campos obligatorios (incluidos su nombre y correo), sube al menos una imagen representativa y envía  
**Entonces** la solicitud se registra en la base de datos con `estado_hotel = 'Pendiente'`

### Escenario 2: Campos obligatorios vacíos
**Dado** que el formulario tiene campos sin completar  
**Cuando** el hotelero pulsa "Enviar solicitud"  
**Entonces** el sistema no guarda nada y muestra qué campo falta corregir

### Escenario 3: Imagen representativa
**Dado** que el hotelero cargó al menos una fotografía del hotel  
**Cuando** envía el formulario  
**Entonces** la imagen queda guardada como imagen representativa del hotel

### Escenario 4: Sin imagen
**Dado** que el hotelero no cargó ninguna fotografía  
**Cuando** intenta enviar  
**Entonces** el sistema le pide subir al menos una imagen antes de continuar

### Escenario 5: Aviso de revisión
**Dado** que la solicitud se envió con éxito  
**Cuando** vuelve a la sección de inscripción  
**Entonces** ve el mensaje "Tu hotel será revisado por un administrador" con el estado Pendiente y el correo con el que recibirá su cuenta

### Escenario 6: No aparece en búsquedas hasta ser aprobado
**Dado** que el hotel quedó con `estado_hotel = 'Pendiente'`  
**Cuando** un turista busca hoteles  
**Entonces** el hotel recién inscrito no aparece en los resultados hasta que un administrador lo apruebe

### Escenario 7: El admin aprueba y crea la cuenta del hotelero
**Dado** que el administrador revisó la solicitud aprobada  
**Cuando** pulsa "Aprobar"  
**Entonces** el hotel pasa a `Aprobado` y se crea la cuenta de hotelero en la plataforma; al dueño se le envía un correo con un enlace de un solo uso para definir su propia contraseña (la contraseña nunca viaja por correo)

### Escenario 8: El hotelero entra con su cuenta creada
**Dado** que el hotelero definió su contraseña con el enlace del correo  
**Cuando** inicia sesión con su correo y la contraseña que eligió  
**Entonces** queda dirigido a su panel del hotel, donde ve la información de su establecimiento

### Escenario 9: El hotelero recibe el correo de acceso
**Dado** que el administrador aprobó la solicitud y creó la cuenta  
**Cuando** el sistema procesa la aprobación  
**Entonces** envía un correo automático al dueño con su correo, un botón de "Definir mi contraseña" (enlace de un solo uso) e instrucciones para entrar a su panel; si alguien lo presiona a pedir su contraseña, debe negarse

### Escenario 10: Consultar el estado de la solicitud sin cuenta
**Dado** que el hotelero inscribió su hotel y quiere saber el estado  
**Cuando** ingresa su correo en la consulta pública del Inicio  
**Entonces** el sistema le muestra si su solicitud está Pendiente, Aprobada o Rechazada; si está aprobada, le muestra el correo con el que entra (nunca contraseñas)

## MoSCoW

- **Must Have:** ✅ formulario público con nombre del hotel, ubicación, descripción, teléfono y departamento; ✅ validación de campos obligatorios antes de enviar; ✅ registro en BD con `estado_hotel = 'Pendiente'`; ✅ aviso de que será revisado por un administrador; ✅ el admin crea la cuenta de hotelero al aprobar.
- **Should Have:** ✅ carga de al menos una imagen representativa; ✅ mensajes de error claros campo por campo; ✅ prellenado de nombre y correo si el usuario ya tiene sesión; ✅ correo automático con el enlace de acceso al aprobar (sin contraseñas); ✅ consulta pública de estado por correo.
- **Could Have:** vista previa de la foto antes de enviar, autocompletar el departamento con la silueta de Nicaragua, guardar un borrador si recarga la página.
- **Won't Have:** edición de los datos (es la HU-022), rechazo del hotel (HU-032), subida de galería completa (es la HU-025), alta masiva de varios hoteles.

## Notas de implementación

- **Componente público:** `src/pages/InscribeHotel.tsx` se monta al final del Inicio (`src/pages/Home.tsx`), reemplazando el banner informativo de hoteleros.
- **Campos:** nombre del dueño, correo del dueño (con él se crea la cuenta), nombre del hotel, ubicación (departamento + municipio + dirección), descripción y teléfono opcional (subtareao HOTELICA-200). Los catálogos de departamentos/municipios salen de `src/data.ts` (`DEPARTAMENTOS`, `MUNICIPIOS`).
- **Validación:** `validarRegistroHotel()` en `src/data.ts` revisa los 7 campos obligatorios antes de enviar y devuelve errores campo por campo; el teléfono solo se valida si se llena (subtareao HOTELICA-201).
- **Guardado:** `registrarHotel()` en `src/store.tsx` guarda el hotel con `aprobado: "pendiente"` y `correoDueno` (subtareao HOTELICA-202).
- **Aviso:** mensaje "Tu hotel será revisado por un administrador" con badge Pendiente apenas se envía (subtareao HOTELICA-203).
- **Imagen:** `validarImagenHotel()` acepta JPG/PNG/WEBP de hasta 5 MB y el formulario exige al menos una (subtareao HOTELICA-204).
- **Aprobación y cuenta:** `decidirHotel()` en `src/store.tsx`, al aprobar, registra la cuenta del hotelero en la tabla `usuarios` de la base (rol Hotel) y devuelve los datos de contacto; `PanelAdmin` muestra un modal confirmando que el correo de acceso se envió (sin contraseñas a la vista).
- **Correo automático:** `enviarCuentaHotelero()` en `src/store.tsx` llama a la Edge Function `supabase/functions/enviar-cuenta-hotelero/index.ts` (Brevo API). La función crea el usuario en Supabase Auth con una contraseña inventada que nadie recibe y manda un **enlace de un solo uso** con el que el dueño define su propia contraseña en la pantalla "Restablecer contraseña" del sitio. Se ejecuta automáticamente cuando el admin aprueba. Ajuste del 2026-10-19: el paso 1 "Ingresa a" ahora es un enlace real a `https://hotelica.vercel.app` (antes decía "hotelica.com" sin enlace) y el HTML suma un `@media` para celular donde las filas de las tablas se apilan y no se aplastan. Ajuste del 2026-10-29: la contraseña ya no viaja en el correo (antes quedaba legible en la bandeja del dueño) y la función solo responde a administradores con sesión.
- **Consulta pública:** en `src/pages/InscribeHotel.tsx` hay un formulario "¿Ya inscribiste tu hotel? Consulta el estado" donde el dueño ingresa su correo y ve el estado (Pendiente/Aprobada/Rechazada); si está aprobada muestra el correo de acceso, nunca contraseñas.
- **Login del hotelero:** `login()` en `src/store.tsx` primero revisa `cuentasHotelero` (cuentas locales de demo, creadas por el admin); si no coincide, entra por Supabase Auth y el rol Hotel lo confirma la tabla `usuarios` de la base (`rolDeLaBase()`), así el dueño que definió su contraseña con el enlace entra a su panel igual de cualquier navegador.
- **Panel del hotel:** `HotelPanel.tsx` muestra el hotel cuyo `correoDueno` coincide con el usuario logueado. Ya no hay hotel de demostración: sin una cuenta de hotelero, el panel no se abre (`App.tsx` exige sesión con rol Hotel).
- **Pruebas:** 13 unitarias nuevas en `src/__tests__/data.test.ts` (89 en total pasan) y prueba E2E `tests/CP-002-registro-hotel.spec.ts` (esta última no corrió en la máquina por una política de seguridad sobre el navegador).
- **Regla de negocio cumplida:** solo los hoteles con `estado_hotel = 'Aprobado'` aparecen en las búsquedas del turista.
