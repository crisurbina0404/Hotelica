# HU-005 — Gestionar perfil

## Historia de usuario

**Como** usuario autenticado, **quiero** editar mis datos personales como nombre, teléfono y dirección, **para** mantener mi información actualizada en la plataforma.

## Criterios de aceptación

### DADO QUE el usuario está autenticado
- CUANDO entra a "Mi perfil"
- ENTONCES ve sus datos personales precargados (nombre, correo, teléfono, dirección)

### DADO QUE el usuario está en su perfil
- CUANDO presiona "Editar perfil"
- ENTONCES los campos nombre, teléfono y dirección se vuelven editables
- Y el correo electrónico permanece bloqueado (no editable)

### DADO QUE el usuario edita su perfil
- CUANDO deja el nombre vacío o con menos de 3 caracteres
- ENTONCES aparece un mensaje de error debajo del campo

### DADO QUE el usuario edita su teléfono
- CUANDO ingresa un formato inválido
- ENTONCES aparece un mensaje de error "Ingresa un número de teléfono válido"

### DADO QUE el usuario edita su dirección
- CUANDO deja el campo vacío o con menos de 5 caracteres
- ENTONCES aparece un mensaje de error

### DADO QUE el usuario guarda cambios exitosamente
- CUANDO presiona "Guardar cambios" con datos válidos
- ENTONCES aparece un toast "¡Guardado exitosamente!"
- Y los datos se actualizan en la interfaz

### DADO QUE el usuario cancela la edición
- CUANDO presiona "Cancelar"
- ENTONCES los campos vuelven a su estado original

### DADO QUE hay un error al guardar
- CUANDO ocurre un error del servidor
- ENTONCES aparece un toast de error "No se pudieron guardar los cambios. Inténtalo nuevamente."

### DADO QUE se está guardando
- CUANDO se están enviando los cambios
- ENTONCES el botón se deshabilita y muestra "Guardando..."
