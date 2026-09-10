# HU-004 — Recuperar contraseña

## Historia de usuario

**Como** usuario que olvidó su contraseña, **quiero** solicitar la recuperación mediante mi correo registrado, **para** restablecer el acceso a mi cuenta de forma segura.

## Criterios de aceptación

### DADO QUE el usuario olvidó su contraseña
- CUANDO presiona "¿Olvidaste tu contraseña?" en el formulario de login
- ENTONCES se muestra un formulario para ingresar su correo electrónico

### DADO QUE el usuario ingresa su correo
- CUANDO presiona "Enviar enlace de recuperación"
- ENTONCES se envía un correo con un enlace para restablecer la contraseña
- Y se muestra un mensaje "Revisá tu correo"

### DADO QUE el usuario recibe el correo
- CUANDO hace clic en el enlace del correo
- ENTONCES se muestra un formulario para ingresar la nueva contraseña

### DADO QUE el usuario ingresa la nueva contraseña
- CUANDO la contraseña tiene menos de 6 caracteres
- ENTONCES aparece un error "La contraseña debe tener al menos 6 caracteres"

### DADO QUE el usuario confirma la contraseña
- CUANDO las contraseñas no coinciden
- ENTONCES aparece un error "Las contraseñas no coinciden"

### DADO QUE la contraseña se restablece correctamente
- CUANDO se guarda la nueva contraseña
- ENTONCES se muestra "¡Contraseña actualizada!"
- Y el usuario puede iniciar sesión con la nueva contraseña
