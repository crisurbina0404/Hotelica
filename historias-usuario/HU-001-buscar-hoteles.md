# 🎫 HISTORIA DE USUARIO

| Campo | Detalle |
|---|---|
| ID | HU-001 |
| Título Corto | Buscar hoteles por destino |
| Épica / Módulo | Buscador principal |
| Prioridad | Alta |
| Estimación | 3 Story Points |
| Estado | ⬜ Escrita / 🟡 En desarrollo / ✅ Terminada |

## 1. REDACCIÓN ESTÁNDAR
**COMO** turista
**QUIERO** buscar hoteles aprobados por departamento de Nicaragua, indicando fechas y huéspedes
**PARA** encontrar opciones reales y disponibles antes de reservar

## 2. CONTEXTO Y DETALLES
- Dependencias: ninguna (es la primera interfaz, base para HU-002 y siguientes).
- Reglas de negocio:
  - Solo se listan hoteles con `estado_hotel = 'Aprobado'`.
  - Disponibilidad = `total_unidades − ocupadas` (por habitación, en el rango de fechas).
  - Precio "desde" = precio_por_noche más bajo entre las habitaciones del hotel.
  - La fecha de **salida** debe ser **posterior** a la de **llegada**.
  - Fecha de llegada no puede estar en el pasado.
- Diseños: portada con buscador arriba; resultados en tarjetas; filtros en barra lateral izquierda.

- Campos del buscador (parte superior):
  - **Destino** (select de departamentos de Nicaragua).
  - **Llegada** (date).
  - **Salida** (date).
  - **Huéspedes** (number, mínimo 1).
  - Botón **"Buscar hoteles"** (CTA color flame).

- Tarjeta de resultado (cada hotel):
  - Foto principal del hotel.
  - Nombre.
  - Ubicación: ciudad (municipio) + departamento.
  - Calificación promedio con estrella (★).
  - Etiquetas (ej: "Familiar", "Playa", "Colonial").
  - Precio "desde $X/noche".
  - Nº de habitaciones disponibles en el rango elegido.

- Filtros laterales:
  - Precio máximo (rango/slider).
  - Departamento (refine la búsqueda).
  - Servicios (checkboxes).
  - Ordenamiento (ej: menor precio, mejor calificación).
  - Contador de resultados: "Se encontraron N hoteles".

## 3. CRITERIOS DE ACEPTACIÓN (BDD)

**Escenario 1: Flujo exitoso**
- DADO QUE existan hoteles aprobados en Granada
- CUANDO el turista busca destino "Granada" y deja los demás campos con valores válidos
- ENTONCES el sistema muestra SOLO hoteles aprobados en Granada, cada tarjeta con foto, ubicación, calificación, etiquetas, precio "desde $X/noche" y nº de habitaciones disponibles, y un contador con el total de resultados.

**Escenario 2: Flujo alternativo / sin coincidencias**
- DADO QUE ningún hotel aprobado cumple los filtros (precio muy bajo o servicios inexistentes)
- CUANDO el turista aplica esos filtros
- ENTONCES el sistema muestra el mensaje "No encontramos hoteles con esos filtros" y sugiere ampliar el precio máximo o quitar servicios para volver a intentarlo.

**Escenario 3: Validación de fechas**
- DADO QUE el turista llena las fechas
- CUANDO la fecha de salida es igual o anterior a la llegada (o la llegada está en el pasado)
- ENTONCES el sistema no ejecuta la búsqueda y muestra un aviso: "La fecha de salida debe ser posterior a la de llegada".

## 4. CHECKLIST INVEST
- [x] Independiente
- [x] Negociable
- [x] Valiosa
- [x] Estimable
- [x] Pequeña (cabe en un Sprint)
- [x] Testeable
