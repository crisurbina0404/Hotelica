# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Turista (usuario primario):** viajero que descubre hoteles por departamento de Nicaragua, compara precios y disponibilidad, reserva, paga, cancela y califica su estadía. Llega desde celular o computadora (uso 50/50).
- **Hotelero:** dueño de hotel pequeño o familiar; registra su propiedad, publica habitaciones y precios, confirma o rechaza reservas y consulta su reporte de ocupación.
- **Administrador:** equipo de Hotelica; aprueba o rechaza hoteles nuevos, activa o desactiva cuentas y consulta estadísticas globales.

## Product Purpose

Hotelica es una plataforma web de reservación de hoteles enfocada en hoteles pequeños y familiares de Nicaragua, que hoy gestionan reservas en cuadernos o WhatsApp (duplicadas, perdidas, descontrol de disponibilidad). Centraliza búsqueda por departamento, disponibilidad por fechas, cálculo del total con IVA del 15 %, el ciclo de vida de la reserva (confirmar, cancelar, check-in/out) y una consola de administración. Tiene éxito cuando un turista reserva en minutos con el precio exacto y un hotelero deja de llevar sus reservas a mano.

## Positioning

Especialización nacional: no un motor de reservas genérico, sino una plataforma para el mercado nicaragüense — departamentos y municipios oficiales del país, IVA y formatos nicaragüenses (C$ córdobas, teléfonos de 8 dígitos), y hoteles pequeños que en las grandes plataformas no caben ni se ven.

## Operating Context

- Proyecto académico presentado como demo funcional: se expone en clase y en el repositorio público (https://github.com/crisurbina0404/Hotelica), con deploy en Vercel. No hay clientes ni pagos reales todavía.
- Metodología de trabajo con regla de oro: ninguna interfaz se programa sin su Historia de Usuario escrita primero (`historias-usuario/`, formato BDD/INVEST, 36 HUs, orden en `Orden de Historias de Usuarios.md`).
- QA: suite unitaria (Vitest) y E2E con Playwright (`tests/CP-XXX-*.spec.ts`) que cubre los criterios BDD de las HUs.
- Backend: Supabase (PostgreSQL, Auth, Edge Functions); cada migración vive en `supabase/migrations/` y se aplica a mano desde el SQL Editor del Dashboard.

## Capabilities and Constraints

- Español nicaragüense con **voseo** en toda la copia de UI y comentarios de código; traducción al idioma del navegador vía Google Traductor (no existe selector propio de idioma).
- La app nunca deja de funcionar aunque la base caiga: los catálogos llegan de `src/data.ts`, el estado persiste en `localStorage` (clave `hotelica-fase1-v2`) y la sincronización con Supabase fusiona espacio y avisa cuando no pudo (estado de consulta, HU-034).
- Reglas de negocio fijas: IVA 15 % sobre el subtotal, disponibilidad por unidades ocupa no traslapan, calificaciones de 1 a 5 estrellas solo tras check-out.
- Las escrituras clave están al día con su sincronización a la base (hoteles, habitaciones, usuarios, promedios de hoteles, reseñas); pagos, notificaciones, favoritos y bitácora de eventos del admin siguen siendo locales (Fase 1 — decisión aceptada, no olvidada).
- El rol admin no se otorga por estado local: lo valida la tabla `administradores` de la base contra el correo (HU-042).

## Brand Commitments

- Nombre y marca: **Hotelica — "Donde Nicaragua te recibe"**, con logo/propuesta visual registrada en el README.
- Identidad visual oficial viviendo en el skill `hotelica-design` (paleta, tipografías, componentes, movimiento, accesibilidad) y convenciones técnicas en el skill `stack-tecnico`: cualquier trabajo de UI debe respetarlos.
- Iconografía SVG propia en `src/icons.tsx` (prohibido el uso de emojis en la interfaz).

## Evidence on Hand

- README.md con problema, objetivos, roles y backlog del proyecto.
- 36 historias de usuario documentadas en `historias-usuario/` con escenarios BDD y notas de implementación por HU.
- bitácora completa en `CHANGELOG.md` (v0.4.0 – v0.70.0) con una entrada por versión.
- Suite E2E verde (17 casos Playwright en `tests/`) como evidencia de comportamiento real.
- HOTELES_SEED, RESERVAS_SEED, RESENAS_SEED y demás semillas en `src/data.ts` que funcionan como contenido demo real de Nicaragua.
- No existen: testimonios reales, clientes, métricas de uso ni fotografías propias más allá de las imágenes demo — ningún trabajo futuro debe inventar que sí.

## Product Principles

1. **La reserva es el producto:** nada llega antes que la experiencia del turista reservando (búsqueda → detalle → fecha → pago → confirmación).
2. **Datos que se pueden creer:** disponibilidad, precios e IVA siempre correctos; mejor avisar un límite que fingir un éxito.
3. **Nicaragua en el detalle:** departamentos, municipios, córdobas, voseo — genérico es una falla.
4. **La app no se rompe:** si la base cae, el usuario sigue trabajando con lo local y sabe qué paso.
5. **Demo íntegra:** sólida para exponer, sin prometer lo que no ejecuta.

## Accessibility & Inclusion

*(sin requisitos específicos confirmados todavía — pendiente de decidir si se fija un estándar WCAG objetivo)*
