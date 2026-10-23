# HU-030 — Consultar reporte de ocupación

**Módulo:** Gestión Hotel
**Prioridad:** Media (Should Have)
**Estado:** ✅ Terminada
**Sprint:** 6
**Interfaz:** sección "Reporte de ocupación" de `src/pages/HotelPanel.tsx`

## Redacción estándar

> Como **administrador de hotel**, quiero **consultar cuánto se ocuparon mis habitaciones en un mes**, para **saber si las tarifas y la promoción están funcionando sin sacar cuentas a mano**.

## Contexto

El panel ya muestra la **ocupación de hoy** (HU-026), pero ese número cambia con el día y no sirve para responder la pregunta que el hotelero se hace al cerrar el mes: *¿cuántas noches vendí y cuánto entró?* Hasta ahora había que abrir la tabla de reservas y sumar una por una, con el riesgo de contar dos veces las estadías que cruzan de mes.

Esta historia agrega un **reporte por mes** que toma las reservas del hotel, recorta cada estadía a las noches que caen dentro del mes elegido y muestra:

1. El **porcentaje de ocupación** del mes, con la misma idea de la regla de negocio: noches vendidas entre noches disponibles.
2. Las **noches vendidas y disponibles**, para que el porcentaje se pueda comprobar.
3. Los **ingresos** de esas noches, sin contar las reservas canceladas.
4. El **desglose por tipo de habitación**, con su propia ocupación e ingresos.

La historia es **solo de consulta**: no cambia estados, no crea ni borra reservas y no modifica precios (eso es HU-024).

**Alcance del celular:** desde la HU-039 el panel del hotel no se abre en pantallas estrechas, así que el reporte se consulta desde el escritorio.

Reglas de negocio de esta historia:

1. **Solo el hotel propio:** el reporte toma únicamente las reservas del hotel del hotelero logueado, igual que el listado de la HU-026.
2. **Mes elegido:** al abrir la sección se muestra el mes en curso y se puede elegir cualquier mes anterior con el selector; no se ofrecen meses futuros.
3. **Noches del mes:** una reserva cuenta solo por las noches que caen dentro del mes. Una estadía del 28 de octubre al 2 de noviembre suma tres noches a octubre y dos a noviembre.
4. **Qué reservas cuentan:** cuentan todas las no canceladas (pendientes, confirmadas, check-in y completadas), porque todas bloquean o bloquearon unidades. Las canceladas no suman noches ni ingresos.
5. **Ocupación del mes:** `% ocupación = (noches vendidas ÷ noches disponibles) × 100`, donde las noches disponibles son las unidades del hotel multiplicadas por los días del mes. Se redondea al entero.
6. **Ingresos del mes:** el total de cada reserva se reparte por noche (`total × noches del mes ÷ noches de la estadía`), así una estadía que cruza de mes no se cuenta entera dos veces. Se excluyen las canceladas.
7. **Desglose por tipo:** cada tipo de habitación muestra sus unidades, noches vendidas, ocupación, cantidad de reservas e ingresos; la fila de totales cierra la tabla.
8. **Sin noches, mensaje claro:** si el mes no tiene noches vendidas, en lugar de una tabla vacía se explica que no hubo ocupación y se invita a elegir otro mes.
9. **Descarga del reporte:** el hotelero puede bajar el mismo contenido en un archivo CSV para abrirlo en Excel.

## Criterios de aceptación (BDD)

### Escenario 1: El mes en curso aparece al abrir (HOTELICA-267)
**Dado** que el hotelero entra a su panel
**Cuando** llega a la sección "Reporte de ocupación"
**Entonces** ve seleccionado el mes en curso, con su ocupación, noches, ingresos y desglose solo de su hotel

### Escenario 2: Cambiar de mes recalcula el reporte (HOTELICA-268)
**Dado** que el reporte muestra octubre
**Cuando** el hotelero elige septiembre en el selector
**Entonces** las cifras, la tabla y el título cambian al mes elegido sin recargar la página, y no se pueden elegir meses futuros

### Escenario 3: La ocupación sale de las noches del mes (HOTELICA-269)
**Dado** que el hotel tiene 12 unidades y en octubre (31 días) se vendieron 93 noches
**Cuando** se muestra el porcentaje del mes
**Entonces** aparece 25 %, con la cuenta visible: "93 de 372 noches vendidas"

### Escenario 4: Una estadía que cruza de mes se reparte (HOTELICA-270)
**Dado** que una reserva del 30 de octubre al 2 de noviembre tiene 3 noches
**Cuando** se consulta octubre y luego noviembre
**Entonces** octubre suma 2 noches y noviembre 1, y los ingresos se reparten en la misma proporción

### Escenario 5: Las canceladas no ensucian el reporte (HOTELICA-271)
**Dado** que el mes tiene una reserva cancelada y una completada
**Cuando** se calcula la ocupación y los ingresos
**Entonces** la cancelada no suma noches ni dinero, mientras que la completada sí cuenta porque ocupó la habitación

### Escenario 6: El desglose y la descarga coinciden con el total (HOTELICA-272)
**Dado** que el hotelero revisa el desglose por tipo de habitación
**Cuando** suma las noches y los ingresos de cada fila
**Entonces** obtiene el mismo total del encabezado, y el archivo CSV descargado trae esas mismas cifras con el nombre del hotel y el mes

### Escenario 7: Un mes sin ocupación se explica (HOTELICA-273)
**Dado** que el hotelero elige un mes en el que no hubo reservas
**Cuando** se muestra el reporte
**Entonces** aparece el mensaje de que no hubo noches vendidas en ese mes, con la ocupación en 0 % y sin filas inventadas

## MoSCoW

- **Must Have:** selector de mes con el mes en curso por defecto; ocupación del mes con la fórmula oficial; noches vendidas y disponibles; ingresos sin canceladas; desglose por tipo de habitación; filtro por el hotel propio.
- **Should Have:** fila de totales; reparto proporcional de las estadías que cruzan de mes; descarga en CSV; mensaje para meses sin ocupación.
- **Could Have:** comparación contra el mes anterior; filtro por tipo de habitación; gráfica de ocupación día por día; exportar en PDF.
- **Won't Have:** modificar reservas, precios o estados desde el reporte; ver reservas de otros hoteles; proyecciones de meses futuros; reportes contables o de impuestos.

## Notas de implementación

- **Cálculos en `src/data.ts`:** `nochesDentroDe()` recorta una estadía al rango del mes, `diasDelMes()` cuenta los días (con febrero bisiesto), `rangoDelMes()` devuelve el primer día del mes y el primero del siguiente, y `fmtMes()` arma "octubre de 2026" para los títulos (subtarea HOTELICA-267).
- **Armado del reporte:** `armarReporte()` en `src/pages/HotelPanel.tsx` recibe las reservas del hotel, sus habitaciones y el mes elegido, y devuelve totales y desglose. Las canceladas se descartan antes de sumar (subtarea HOTELICA-268).
- **Ocupación:** `nochesVendidas` sale de `nochesDentroDe()` por cada reserva, `nochesDisponibles` es la suma de unidades por los días del mes y el porcentaje es el redondeo de la división (subtarea HOTELICA-269).
- **Ingresos proporcionales:** cada reserva aporta `total × noches del mes ÷ noches de la estadía`, redondeado a córdobas enteros, para no contar dos veces las estadías que cruzan de mes (subtarea HOTELICA-270).
- **Estados:** se incluyen pendientes, confirmadas, check-in y completadas; solo se excluyen las canceladas, que nunca ocuparon una unidad (subtarea HOTELICA-271).
- **Interfaz:** la sección se ubica después de "Gestión de reservas", con una tarjeta principal para el porcentaje, tres indicadores de apoyo (`tabular-nums`) y una tabla por tipo de habitación con barra de ocupación, más la fila de totales. Usa los colores del rol hotel y `Reveal` para la entrada (subtarea HOTELICA-272).
- **CSV y estado vacío:** la descarga arma el archivo con `Blob` y `URL.createObjectURL`, con BOM para que Excel lea las tildes; si el mes no tiene noches, la tabla se reemplaza por un aviso y la descarga queda deshabilitada (subtarea HOTELICA-273).
