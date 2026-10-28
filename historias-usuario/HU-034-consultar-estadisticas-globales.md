# HU-034 — Consultar estadísticas globales

**Módulo:** Administración
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 8
**Interfaz:** sección "Estadísticas globales" de `src/pages/AdminPanel.tsx` (componente `src/pages/EstadisticasGlobales.tsx`)

## Redacción estándar

> Como **administrador global**, quiero **consultar estadísticas globales**, para **conocer la actividad de toda la plataforma (usuarios, hoteles, reservas e ingresos) sin revisar cada hotel uno por uno**.

## Contexto

La consola de administración ya lista hoteles, revisa solicitudes (HU-031/032) y administra cuentas (HU-033), pero no se ve la foto completa: cuántos usuarios están activos, cuántas reservas hay en total y cuánto ingresó a la plataforma. Los únicos datos globales existentes eran los indicadores pequeños del encabezado de la consola (aprobados, por aprobar, reservas, ingresos), que no dicen de dónde salen ni validan los datos que suman.

Esta historia agrega una **sección de estadísticas globales** en la consola, con cuatro métricas, la validación en vivo de los registros que se descartan, el estado de la sincronización con la base de datos y la exportación del reporte a **PDF y Excel** en archivos con la identidad de la marca.

Reglas de negocio de esta historia:

1. **Solo en la consola:** la sección vive en la consola de administración, que ya exige sesión y rol de administrador (HU-042).
2. **Cuatro métricas:** usuarios activos (con desglose de turistas y hoteleros), hoteles registrados (con desglose de aprobados y por aprobar), total de reservas (con desglose de no canceladas y canceladas) e ingresos totales (con IVA incluido a la vista).
3. **Regla de ingresos:** los ingresos son la suma del total de las reservas **no canceladas**; las canceladas se cuentan como reservas pero **nunca** suman ingresos. El IVA (15 %, HU-014) queda desglosado.
4. **Datos inválidos no distorsionan:** reservas sin folio, con estado desconocido, sin total válido o que apuntan a un hotel inexistente se excluyen de los totales y **se avisa en pantalla** cuántas y por qué (la validación vive en `src/estadisticas.ts`, pura y sin React).
5. **Cálculo en vivo:** las métricas se recalculan automáticamente cuando cambian los hoteles, reservas o cuentas; sin botón de "recalcular".
6. **Estado de la consulta:** la sección muestra si está actualizando datos, si la base respondió o si quedó trabajándose con los datos locales; si falla, hay botón **Reintentar** y los datos locales siguen en pantalla.
7. **Exportación:** el reporte se baja en PDF y en Excel con fecha de generación, alcance de los datos, las cuatro métricas y el detalle del cálculo (regla de ingresos, IVA, ticket promedio y registros excluidos), para poder auditar las cifras fuera de la app.
8. **Sin datos:** si no hay hoteles ni reservas válidas, se muestra un estado vacío que lo explica en vez de tarjetas con ceros.

## Criterios de aceptación (BDD)

### Escenario 1: La consola tiene la sección de estadísticas
**Dado** que un administrador está dentro de la consola de administración
**Cuando** recorre la pantalla
**Entonces** ve la sección "Estadísticas globales" con las cuatro métricas de la plataforma

### Escenario 2: Las métricas muestran su desglose
**Dado** que hay usuarios, hoteles y reservas en la plataforma
**Cuando** el administrador mira las tarjetas de métricas
**Entonces** cada una muestra su desglose: usuarios (turistas y hoteleros), hoteles (aprobados y por aprobar) y reservas (no canceladas y canceladas)

### Escenario 3: Las canceladas no inflan los ingresos
**Dado** que hay reservas canceladas y reservas no canceladas
**Cuando** se muestran los ingresos totales
**Entonces** solo suman el total de las reservas no canceladas, el IVA incluido queda desglosado y la regla queda explicada en pantalla

### Escenario 4: Los registros inválidos se avisan y se excluyen
**Dado** que entre las reservas hay registros sin folio, con estado desconocido o con un hotel inexistente
**Cuando** se calculan las métricas
**Entonces** esos registros no entran en ningún total y aparece un aviso con la cantidad y el motivo de la exclusión

### Escenario 5: El cálculo es en vivo
**Dado** que el administrador tiene la sección a la vista
**Cuando** alguien crea, cancela o cambia una reserva (o se aprueba un hotel)
**Entonces** las métricas se actualizan solas, sin recargar la página ni pulsar un botón

### Escenario 6: Si la base no responde se puede reintentar
**Dado** que la base de datos no responde al abrir la sección
**Cuando** la app queda trabajando con los datos locales
**Entonces** la sección lo indica con su estado, ofrece el botón "Reintentar" y las métricas se calculan con lo disponible en el navegador

### Escenario 7: El reporte se exporta a PDF y Excel
**Dado** que hay datos para mostrar
**Cuando** el administrador pulsa "Exportar PDF" o "Exportar Excel"
**Entonces** se baja un archivo con la marca Hotelica, la fecha de generación, el alcance de los datos, las cuatro métricas y el detalle del cálculo, y se recibe un aviso de que salió bien

### Escenario 8: Exportar falla con mensaje claro
**Dado** que la generación del archivo falla
**Cuando** se intenta exportar
**Entonces** se muestra el aviso del error y las métricas en pantalla no se pierden

### Escenario 9: Sin datos hay estado vacío
**Dado** que no hay hoteles ni reservas válidas en la plataforma
**Cuando** el administrador abre la sección
**Entonces** ve un estado vacío que lo explica, en vez de tarjetas con ceros que confundan

## MoSCoW

- **Must Have:** sección en la consola; cuatro métricas con desglose; regla de ingresos (solo no canceladas), IVA desglosado; exclusión de registros inválidos con aviso; cálculo en vivo; exportar PDF y Excel con fecha, alcance y detalle del cálculo; estado vacío.
- **Should Have:** estado de la consulta (actualizando / sincronizado / datos locales) con botón Reintentar; desglose de IVA y ticket promedio en un resumen aparte; aviso de exportación exitosa y de exportación fallida.
- **Could Have:** gráficas de crecimiento semanal; comparación entre periodos; exportar CSV de la bitácora de reservas.
- **Won't Have:** administrar o editar datos desde esta sección (es de consulta); estadísticas por hotel individuales (eso vive en el panel del hotelero, HU-030); correos automáticos con el reporte.

## Notas de implementación

- **Motor de cálculo:** `src/estadisticas.ts` — funciones puras que reciben hoteles, reservas y cuentas del contexto, validan cada registro y devuelven `EstadisticasGlobales` con las métricas y la lista de `problemas`. No consulta la base ni usa React, así que se vuelve a usar cuando la sección se abra desde otro lugar.
- **Estado de sincronización:** `sincronizando`, `errorSync`, `ultimaSync` y `reintentarSync()` entran al contexto de `src/store.tsx`; las cargas de `src/sync.ts` dejan de tragarse los errores y devuelven el mensaje, para que el estado sea real y no decorativo.
- **Exportación:** `src/exportarEstadisticas.ts` genera PDF (jsPDF + autotable, cabecera con la marca y tabla de métricas) y Excel (xlsx) cargando las librerías solo al exportar; los archivos salen como `hotelica-estadisticas-YYYY-MM-DD.pdf/xlsx`.
- **Interfaz:** `src/pages/EstadisticasGlobales.tsx` monta la sección (tarjetas con `TarjetaMetrica` de `src/ui.tsx`, aviso de validación, estados de carga/vacío/error) y `src/pages/AdminPanel.tsx` la incluye después de la sección de usuarios, con el título de ceja "Panel global".
