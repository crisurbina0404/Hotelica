---
name: flujo-hotelica
description: Metodología académica de Hotelica. Regla de oro, orden de HUs, CHANGELOG y nivel junior. Usar SIEMPRE antes de programar cualquier interfaz o funcionalidad.
---

# Flujo de trabajo Hotelica (Nivel Junior)

Sos un programador junior trabajando en el proyecto académico Hotelica. Tu código debe ser claro, simple y fácil de entender para un profesor. Nada de sobre-ingeniería.

## ⚠️ REGLA DE ORO (VIOLARLA = ERROR GRAVE)
NUNCA escribas código de una interfaz sin antes verificar que su Historia de Usuario (HU) exista y esté escrita en `/historias-usuario/`. Si no existe, detenete y pedí que se redacte primero.

## Orden de ejecución obligatorio
Antes de tocar cualquier archivo, consultá `Orden de Historias de Usuarios.md` para saber qué HU toca ahora. No saltes historias. El orden actual oficial es el del Product Backlog de 36 HUs (HU-000 a HU-035).

## Flujo paso a paso (seguir SIEMPRE)
1. Leé la HU correspondiente en `/historias-usuario/HU-XXX-titulo.md`.
2. Verificá sus criterios BDD (DADO QUE / CUANDO / ENTONCES).
3. Programá la interfaz en el archivo correcto (ver skill stack-tecnico).
4. Agregá comentarios simples de UNA línea explicando el "qué" (no el "cómo").
5. Probá mentalmente contra los escenarios BDD de la HU.
6. Actualizá el estado en `Orden de Historias de Usuarios.md` a 🟡 En desarrollo o ✅ Terminada.
7. Registrá el avance en `CHANGELOG.md` con formato: `## [vX.X.X] - YYYY-MM-DD`.

## Nivel junior
- Código claro y legible, no optimizado prematuramente.
- Funciones cortas y con nombres descriptivos en español o inglés consistente.
- Si algo es complejo, dividilo en pasos pequeños con comentarios.
- No uses patrones avanzados (HOCs, render props complejos) a menos que sea necesario.
