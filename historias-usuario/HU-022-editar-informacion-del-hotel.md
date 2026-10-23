# HU-022 — Editar información del hotel

**Módulo:** Gestión Hotel  
**Prioridad:** Alta (Must Have)  
**Estado:** ✅ Terminada  
**Sprint:** 4  
**Interfaz:** sección "Editar hotel" en `src/pages/HotelPanel.tsx`

## Redacción estándar

> Como **administrador de hotel**, quiero **editar la información de mi hotel ya registrado** para **mantener los datos actualizados y precisos para los turistas**.

## Contexto

Una vez que el hotel está registrado y aprobado, su información puede cambiar: la dirección se corrige, la descripción se mejora, el teléfono se actualiza, o el hotel se muda de municipio dentro del mismo departamento. El hotelero necesita poder actualizar esos datos desde su panel sin tener que inscribir el hotel de nuevo.

El formulario de edición se carga con los datos actuales del hotel (precargados) y valida lo mismo que el formulario de inscripción: nombre, departamento, municipio, dirección, descripción y teléfono. El cambio se guarda al instante y los turistas ven la información actualizada en la próxima búsqueda o detalle.

**Restricción:** mientras el hotel está **Pendiente** (esperando aprobación del admin), no se puede editar, porque el admin aún no ha visto la información original.

## Criterios de aceptación (BDD)

### Escenario 1: Abrir la edición con datos precargados
**Dado** que el hotelero está en su panel del hotel  
**Cuando** pulsa "Editar información"  
**Entonces** el formulario se abre con los datos actuales del hotel ya cargados (nombre, departamento, municipio, dirección, descripción y teléfono)

### Escenario 2: Guardar cambios válidos
**Dado** que el hotelero abrió el formulario de edición  
**Cuando** modifica al menos un campo, corrige todo lo que haya quedado inválido y pulsa "Guardar cambios"  
**Entonces** el sistema actualiza la información del hotel y muestra una confirmación de que los cambios se guardaron

### Escenario 3: Campos obligatorios vacíos
**Dado** que el hotelero vació un campo obligatorio (nombre, dirección o descripción)  
**Cuando** pulsa "Guardar cambios"  
**Entonces** el sistema no guarda nada y muestra qué campo falta corregir

### Escenario 4: Cambiar departamento y municipio
**Dado** que el hotelero cambia el departamento a otro  
**Cuando** guarda  
**Entonces** el municipio se resetea y debe elegir uno que pertenezca al nuevo departamento; si el municipio no pertenece, el sistema muestra error

### Escenario 5: No editar mientras está en revisión
**Dado** que el hotel tiene estado **Pendiente**  
**Cuando** el hotelero está en su panel  
**Entonces** el botón "Editar información" no está disponible (o está deshabilitado) con un aviso de que debe esperar a que el admin lo apruebe

### Escenario 6: Los cambios se ven en el sitio
**Dado** que el hotelero guardó un cambio en la descripción  
**Cuando** un turista busca o consulta el detalle del hotel  
**Entonces** ve la descripción actualizada, no la anterior

## MoSCoW

- **Must Have:** ✅ formulario con datos actuales precargados; ✅ validación de campos obligatorios; ✅ actualización de la información del hotel; ✅ confirmación visual de cambios guardados.
- **Should Have:** ✅ restricción de edición mientras el hotel está Pendiente; ✅ filtrado de municipios según el departamento elegido.
- **Could Have:** contador de caracteres visible, vista previa de la foto, historial de cambios.
- **Won't Have:** edición de la imagen representativa (es la HU-025), edición de habitaciones y precios (HU-023 / HU-024), edición por parte del admin.

## Notas de implementación

- **Sección en el panel:** `src/pages/HotelPanel.tsx` — se agrega un botón "Editar información" y un formulario expandible con los datos del hotel (subtarea HOTELICA-205).
- **Datos precargados:** al abrir el formulario, los campos se llenan con los valores actuales del hotel logueado (subtarea HOTELICA-206).
- **Validación:** `validarEdicionHotel()` de `src/data.ts` aplica las mismas reglas de la inscripción pero solo a los campos editables (nombre, departamento, municipio, dirección, ubicación, descripción y teléfono). El dueño, el correo y la imagen no se editan acá, así que no bloquean el guardado (subtarea HOTELICA-207).
- **Guardado:** nueva función `actualizarHotel()` en `src/store.tsx` que actualiza el hotel en el estado global (subtarea HOTELICA-208). En Fase 2 se cumplió: el hotel actualizado también se sube con `subirHotel()` a la tabla `hoteles` de Supabase (`src/sync.ts`).
- **Confirmación:** toast de éxito "Cambios guardados" al actualizar (subtarea HOTELICA-209).
- **Teléfono en la ficha:** `src/pages/HotelDetail.tsx` muestra el `contacto` guardado y lo omite si el hotel no dejó teléfono (antes había un número fijo para todos).
- **Restricción:** el botón de edición se muestra deshabilitado con aviso si `aprobado === "pendiente"` (subtarea HOTELICA-210).
