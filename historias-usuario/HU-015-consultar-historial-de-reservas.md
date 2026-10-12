# HU-015 — Consultar historial de reservas

**Módulo:** Reservas  
**Prioridad:** Media (Should Have)  
**Estado:** ✅ Terminada  
**Sprint:** 3  
**Interfaz:** MyReservations (ruta protegida `reservas`)

## Redacción estándar

> Como **turista de Hotelica**, quiero **consultar el historial de mis reservas realizadas** para **dar seguimiento a mis viajes pasados y futuros**.

## Contexto

Cuando el turista ya creó varias reservas necesita un solo lugar para verlas todas: en qué hotel, para qué fechas, cuánto pagó y en qué estado está cada una. La pantalla "Mis reservas" (`src/pages/MyReservations.tsx`, ruta `reservas` en `src/rutas.ts`) lista únicamente las reservas de la persona que tiene la sesión abierta, las ordena de más recientes a más antiguas y permite abrir el detalle completo de cada una. La ruta es protegida (`RUTAS_PROTEGIDAS` en `src/App.tsx`): sin sesión no se abre la pantalla.

## Criterios de aceptación (BDD)

### Escenario 1: Listado con hotel, fechas, estado y monto
**Dado** que el turista tiene reservas registradas  
**Cuando** abre la pantalla "Mis reservas"  
**Entonces** cada reserva muestra el nombre del hotel, las fechas de llegada y salida, el estado y el total a pagar

### Escenario 2: Solo las reservas del usuario con sesión abierta
**Dado** que el turista inició sesión con su correo  
**Cuando** carga el historial  
**Entonces** solo aparecen sus reservas; las de otros turistas no se muestran

### Escenario 3: Sin sesión no se puede abrir el historial
**Dado** que nadie inició sesión  
**Cuando** toca el enlace "Mis reservas" en el menú  
**Entonces** la pantalla no se abre y la aplicación vuelve al inicio, sin mostrar reservas de otras personas

### Escenario 4: Orden de más recientes primero
**Dado** que el turista tiene reservas creadas en fechas distintas  
**Cuando** se arma el historial  
**Entonces** la reserva creada más tarde aparece primero en la lista

### Escenario 5: Indicador visual por estado
**Dado** que el turista tiene reservas en estados distintos (pendiente, confirmada, check-in, completada, cancelada)  
**Cuando** observa el listado  
**Entonces** cada reserva lleva una etiqueta con color y texto según su estado

### Escenario 6: Filtro por estado con contador
**Dado** que el turista quiere ver solo un tipo de reserva  
**Cuando** toca el chip de un estado (por ejemplo "Confirmadas")  
**Entonces** la lista muestra solo ese estado y el contador del chip indica cuántas hay

### Escenario 7: Detalle completo de una reserva
**Dado** que el turista elige una reserva del listado  
**Cuando** toca "Ver detalle"  
**Entonces** se abre un modal con folio, hotel, habitación, fechas, noches, desglose (subtotal, IVA, total) y método de pago

### Escenario 8: Caso sin reservas
**Dado** que el turista no tiene ninguna reserva  
**Cuando** entra a "Mis reservas"  
**Entonces** ve un mensaje claro "Aún no tienes reservas" con una acción para explorar hoteles

### Escenario 9: El historial sobrevive a un refresco
**Dado** que el turista creó una reserva nueva  
**Cuando** recarga la página y vuelve a "Mis reservas"  
**Entonces** la reserva sigue apareciendo en el listado con su folio y estado

## MoSCoW

- **Must Have:** ✅ listar reservas propias con hotel, fechas, estado y total; ✅ filtrar por el usuario con sesión; ✅ ruta protegida (sin sesión no se abre); ✅ ordenar de más recientes a más antiguos; ✅ caso "sin reservas" con mensaje claro.
- **Should Have:** ✅ chips de filtro por estado con contador; ✅ badge de color por estado (`BadgeEstado`); ✅ modal de detalle con desglose de subtotal, IVA y total (HU-014).
- **Could Have:** ✅ persistencia del historial en `localStorage` (ya la hace el store de la Fase 1).
- **Won't Have:** exportar el historial a PDF, paginación, búsqueda por texto, sincronización con Supabase (Fase 2).

## Notas de implementación

- Pantalla: `src/pages/MyReservations.tsx` — componente `MisReservas`, ruta `reservas` (`src/rutas.ts`), protegida en `src/App.tsx` (`RUTAS_PROTEGIDAS`).
- Función de negocio: `historialDeReservas(reservas, usuario)` en `src/data.ts` — filtra por el usuario de la sesión (correo o nombre) y ordena por fecha de creación descendente; si `usuario` llegara como `null` devuelve las reservas de la turista demo (`TURISTA_DEMO`), aunque por la ruta protegida ese caso no ocurre en la interfaz.
- Filtros: chips por estado con contador (`filtro`), etiquetas en `ETIQUETA_ESTADO`.
- Detalle: componente `DetalleReserva` con `fmtFecha()`, `fmtDinero()` y el desglose `subtotal` / `IVA (15%)` / `total`.
- Persistencia: `src/store.tsx` guarda las reservas en `localStorage` (clave `hotelica-fase1-v2`).
- Pruebas: `describe("historialDeReservas")` en `src/__tests__/data.test.ts`.
