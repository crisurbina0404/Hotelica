# 🎫 HISTORIA DE USUARIO

| Campo | Detalle |
|---|---|
| ID | HU-013 |
| Título Corto | Cambio de idioma de la interfaz |
| Épica / Módulo | Internacionalización / Navegación |
| Prioridad | Media |
| Estimación | 3 Story Points |
| Estado | ⬜ Escrita / 🟡 En desarrollo / ✅ Terminada |

## 1. REDACCIÓN ESTÁNDAR
**COMO** visitante del sitio
**QUIERO** cambiar el idioma de la interfaz entre español e inglés
**PARA** entender mejor el contenido según mi idioma preferido

## 2. CONTEXTO Y DETALLES
- Dependencias: ninguna nueva (reutiliza el header). Esta HU **no depende de una base de datos**: la traducción se hace en el cliente con un diccionario en memoria; el idioma elegido NO se persiste en `localStorage` ni en BD (queda para Fase 2).
- Reglas de negocio:
  - Idiomas soportados en esta primera versión: **Español (es)** y **English (en)**.
  - El idioma por defecto al cargar la página es **Español**.
  - El idioma elegido se guarda solo en una variable en memoria durante la sesión (se pierde al recargar).
  - Solo se traducen los textos "funcionales" del la UI (header, hero, buscador, filtros, secciones, footer, toasts y mensajes de error). El contenido editorial descriptivo puede quedar en el idioma original por ahora.
  - Se usa el patrón `data-i18n="clave"` en el HTML para marcar los textos a traducir; el JS lee un diccionario `{es:{...}, en:{...}}` y reemplaza los textos.
  - Los textos del DOM que se generan dinámicamente desde JS (toasts, contador de resultados, mensaje "No encontramos hoteles") también deben leerse del diccionario.

- UI propuesta:
  - Un control de idioma en el `.hright` del header: **"ES | EN"** con el idioma activo resaltado en flame. Botones tipo texto o un pequeño `<select>`.
  - En móvil, el control pasa al menú hamburguesa.
  - Al cambiar el idioma, **no se recarga la página**: se actualizan los textos en vivo.

## 3. CRITERIOS DE ACEPTACIÓN (BDD)

**Escenario 1: Flujo exitoso de cambio a inglés**
- DADO QUE la página carga en español
- CUANDO el visitante pulsa "EN"
- ENTONCES todos los textos marcados con `data-i18n` se actualizan al inglés (buscador, filtros, botones, hero, footer), "EN" queda resaltado y NO hay recarga de página.

**Escenario 2: Regresar a español**
- DADO QUE la interfaz está en inglés
- CUANDO el visitante pulsa "ES"
- ENTONCES los mismos textos vuelven al español y "ES" vuelve a quedar resaltado, sin recarga.

**Escenario 3: Render de toasts y mensajes dinámicos**
- DADO QUE la interfaz está en inglés
- CUANDO el usuario dispara una acción que genera un toast o mensaje (ej. "Filtros restablecidos" o "No encontramos hoteles")
- ENTONCES estos textos también se muestran en inglés (leídos desde el diccionario del JS).

**Escenario 4: Renderización al recargar**
- DADO QUE el visitante cambió a inglés
- CUANDO recarga la página
- ENTONCES el sistema vuelve al idioma por defecto (español), sin error. La preferencia no persiste.

## 4. CHECKLIST INVEST
- [x] Independiente
- [x] Negociable
- [x] Valiosa
- [x] Estimable
- [x] Pequeña (cabe en un Sprint)
- [x] Testeable
