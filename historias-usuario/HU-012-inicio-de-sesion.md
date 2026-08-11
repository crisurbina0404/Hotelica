# 🎫 HISTORIA DE USUARIO

| Campo | Detalle |
|---|---|
| ID | HU-012 |
| Título Corto | Inicio de sesión de usuario |
| Épica / Módulo | Autenticación / Cuenta |
| Prioridad | Alta |
| Estimación | 3 Story Points |
| Estado | ⬜ Escrita / 🟡 En desarrollo / ✅ Terminada |

## 1. REDACCIÓN ESTÁNDAR
**COMO** visitante del sitio
**QUIERO** iniciar sesión con un correo y una contraseña
**PARA** acceder a funcionalidades reservadas para usuarios identificados (mis reservas, favoritos persistentes en sesión)

## 2. CONTEXTO Y DETALLES
- Dependencias: ninguna nueva (convive con el header actual). Esta HU **no depende de una base de datos**: la autenticación es **simulada en memoria**; no se persiste en `localStorage` ni en ninguna BD (queda para la Fase 2 con backend).
- Reglas de negocio:
  - Se simulan credenciales válidas hardcodeadas en el cliente (ej: `demo@hotelica.test` / `hotelica`). Cualquier otro par se considera inválido.
  - El "inicio de sesión" solo mantiene el estado en memoria (variable en JS); al recargar la página se pierde la sesión.
  - No se guarda la contraseña en texto plano en ningún lado: la comparación es solo para el demo.
  - No se implementa "registrarse" ni "recuperar contraseña" en esta HU.
  - La sesión simulada habilita el ícono/contador de favoritos, el enlace "Mis reservas" y muestra el nombre del usuario en el header.

- UI propuesta:
  - Botón **"Iniciar sesión"** en el `.hright` del header (junto al de favoritos y al menú móvil).
  - Modal o pequeño formulario flotante con campos: **Correo**, **Contraseña**, botón **"Entrar"** y un link **"¿Olvidaste tu contraseña?"** (no funcional en esta HU, muestra un toast "Próximamente").
  - Tras iniciar sesión: el botón "Iniciar sesión" cambia a mostrar el nombre del usuario con un menú desplegable que tendrá **"Cerrar sesión"**.
  - En móvil, el botón se mueve al menú hamburguesa.

## 3. CRITERIOS DE ACEPTACIÓN (BDD)

**Escenario 1: Flujo exitoso**
- DADO QUE el visitante abre el formulario de inicio de sesión
- CUANDO ingresa `demo@hotelica.test` y `hotelica` y presiona "Entrar"
- ENTONCES el sistema cierra el formulario, el botón del header cambia a mostrar "Demo" (o el nombre del usuario) con un menú que incluye "Cerrar sesión", y aparece un toast de bienvenida.

**Escenario 2: Credenciales inválidas**
- DADO QUE el visitante introduce un correo o contraseña que no coincen con el demo
- CUANDO presiona "Entrar"
- ENTONCES el sistema NO inicia sesión, muestra un mensaje de error bajo el formulario: "Correo o contraseña incorrectos" y mantiene los campos con el correo escrito para reintentar.

**Escenario 3: Cerrar sesión**
- DADO QUE el usuario está con sesión iniciada (en memoria)
- CUANDO abre el menú del usuario y pulsa "Cerrar sesión"
- ENTONCES el sistema vuelve al estado de invitado (el botón vuelve a decir "Iniciar sesión", se reinicia el contador de favoritos y "Mis reservas" queda igualmente accesible como invitado) sin requerir recarga.

**Escenario 4: Renderización al recargar**
- DADO QUE el usuario tiene sesión iniciada en memoria
- CUANDO recarga la página
- ENTONCES el sistema vuelve al estado de invitado (la sesión NO persiste). No hay error: simplemente no aparece "sesión iniciada".

## 4. CHECKLIST INVEST
- [x] Independiente
- [x] Negociable
- [x] Valiosa
- [x] Estimable
- [x] Pequeña (cabe en un Sprint)
- [x] Testeable
