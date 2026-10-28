# HU-035 — Gestionar notificaciones de reservas

**Módulo:** Administración
**Prioridad:** Baja (Could Have)
**Estado:** ✅ Terminada
**Sprint:** 8
**Interfaz:** sección "Notificaciones de reservas" de `src/pages/AdminPanel.tsx`

## Redacción estándar

> Como **administrador global**, quiero **gestionar las notificaciones de reservas**, para **supervisar la actividad de reservas de toda la plataforma sin abrir el panel de cada hotel**.

## Contexto

Hotelica ya avisaba al hotelero de los movimientos de sus reservas (aviso de cancelación, check-in, carga del huésped), pero el administrador no tenía ningún lugar donde ver lo que pasa con las reservas de **todos** los hoteles a la vez. Para enterarse de una cancelación o de un pago tenía que revisar hoteles o reservas uno por uno, o leer los totales de la consola (HU-034), que muestran cifras pero no movimientos.

Esta historia agrega un **centro de notificaciones de reservas** en la consola de administración: una bitácora donde queda cada movimiento de reserva de la plataforma (nueva reserva, pago registrado, confirmación, rechazo por el hotel, cancelación, check-in y check-out), organizado para que se pueda supervisar, revisar y limpiar.

Reglas de negocio de esta historia:

1. **Solo en la consola:** la sección vive en la consola de administración, que ya exige sesión y rol de administrador (HU-042).
2. **Bitácora automática:** cada movimiento de reserva queda registrado solo, sin que nadie lo escriba: al crear una reserva (HU-013), al registrar un pago (HU-018), al confirmarla o rechazarla el hotel (HU-027), al cancelarla el turista (HU-016), y al registrar el check-in (HU-028) o el check-out (HU-029).
3. **El rechazo se distingue de la cancelación:** una reserva rechazada por el hotel y una cancelada por el turista son eventos diferentes en la bitácora, con su etiqueta y color propios.
4. **La bitácora no interfiere con los avisos del hotelero:** son dos canales distintos; el hotelero sigue recibiendo sus avisos en su panel (HU-016) y el admin marca lo suyo sin afectar lo del hotel.
5. **Gestionar = filtrar, revisar y limpiar:** el admin puede filtrar la bitácora por tipo de evento o verla completa, marcar eventos como vistos (uno por uno o todos de golpe) y borrarlos (uno por uno o los ya vistos en bloque).
6. **Conteo de pendientes:** el título de la sección muestra cuántas notificaciones quedan sin ver, y ese conteo baja cuando se marcan.
7. **Referencia clara:** cada evento muestra su folio (HC-XXXX), el texto del movimiento, el hotel al que pertenece y la fecha con hora.
8. **Persistencia local:** la bitácora queda guardada en el navegador junto con el resto del estado persistido; al recargar la página sigue ahí (misma decisión de alcance que reservas y pagos en la Fase 1).

## Criterios de aceptación (BDD)

### Escenario 1: La consola tiene el centro de notificaciones
**Dado** que un administrador está dentro de la consola de administración
**Cuando** recorre la pantalla
**Entonces** ve la sección "Notificaciones de reservas" con su conteo de sin ver

### Escenario 2: Los movimientos quedan registrados solos
**Dado** que un turista crea una reserva, registra un pago, cancela una reserva, o un hotel confirma, rechaza, o registra el check-in y el check-out
**Cuando** el administrador abre la sección de notificaciones
**Entonces** ve cada uno de esos movimientos como un evento con su tipo, folio, hotel, texto y fecha con hora

### Escenario 3: Rechazo y cancelación son eventos distintos
**Dado** que un hotel rechazó una reserva con motivo y un turista canceló otra reserva
**Cuando** el administrador mira la bitácora
**Entonces** el rechazo aparece como evento "Rechazada" con el motivo y la cancelación como "Cancelada"

### Escenario 4: Filtrar la bitácora
**Dado** que la bitácora tiene eventos de varios tipos
**Cuando** el administrador elige un tipo (Nueva, Pago, Confirmada, Rechazada, Cancelada, Entrada o Salida)
**Entonces** la lista queda solo con los eventos de ese tipo y el resto de la bitácora no se pierde

### Escenario 5: Marcar eventos como vistos
**Dado** que hay eventos sin ver (destacados y contados en el título)
**Cuando** el administrador pulsa "Marcar vista" en una fila, o "Marcar leídas" en bloque
**Entonces** los eventos pasan a "Visto", se dejan de destacar y el conteo del título baja

### Escenario 6: Borrar eventos
**Dado** que la bitácora tiene notificaciones ya vistas
**Cuando** el administrador borra una con su botón, o pulsa "Borrar las leídas"
**Entonces** los eventos vistos desaparecen de la bitácora y los sin ver se conservan

### Escenario 7: La bitácora sobrevive la recarga
**Dado** que el administrador tiene eventos en la bitácora
**Cuando** recarga la página
**Entonces** la bitácora sigue igual (distinguiendo lo visto de lo que no)

### Escenario 8: Sin actividad hay estado vacío
**Dado** que no ha pasado ningún movimiento de reservas
**Cuando** el administrador abre la sección
**Entonces** ve un estado vacío que explica qué entrará ahí, y la acción de "Marcar leídas" queda apagada

## MoSCoW

- **Must Have:** sección en la consola; bitácora automática de los 7 tipos de evento; folio, hotel, texto y fecha con hora por evento; distintivo entre rechazo y cancelación; conta de sin ver; filtrar por tipo; marcar visto (individual y en bloque); borrar (individual y en bloque).
- **Should Have:** eventos más nuevos primero; palabras "Visto"/"Sin ver"; estado vacío explicativo; los avisos del hotelero siguen intactos.
- **Could Have:** búsqueda por folio o turista; exportar la bitácora; aviso visual inmediato en el encabezado de la consola cuando entra un evento nuevo.
- **Won't Have:** responder o actuar sobre la reserva desde la notificación (las decisiones viven en su módulo); borrar eventos sin ver de golpe; notificar por correo al admin; cron para purgar la bitácora.

## Notas de implementación

- **Modelo:** `EventoReserva` (id, folio, hotelId, tipo, texto, fecha con hora, leida) y `TipoEvento` ("nueva", "pago", "confirmada", "rechazada", "cancelada", "entrada", "salida") en `src/store.tsx`. La bitácora es `eventosAdmin` dentro de `Persistido`, con `?? []` para los guardados viejos del navegador.
- **Registro:** `agregarEventoEn()` es puro y se llama dentro del mismo `setDatos` de cada acción (crearReserva, registrarPago, cambiarEstadoReserva, registrarCheckin, registrarCheckout): así el evento se escribe junto al cambio, no después, y una reserva sin cupo no deja evento.
- **Gestión:** `marcarEvento(id)`, `marcarEventosLeidos()`, `borrarEvento(id)` y `borrarEventosLeidos()` en el contexto; la bitácora es para leer y limpiar, nunca cambia reservas.
- **Interfaz:** sección "Notificaciones de reservas" en `src/pages/AdminPanel.tsx`, entre el reporte por departamento y la sección de usuarios: título con conteo, chips de filtro por tipo con pasteles de estado del sitio, filas con badge de tipo, folio en tabular y botones de marcar/borrar, estado vacío con campana.
