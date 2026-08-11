# 🎫 HISTORIA DE USUARIO

| Campo | Detalle |
|---|---|
| ID | HU-014 |
| Título Corto | Menú de categorías (mega menú) |
| Épica / Módulo | Navegación / Categorías |
| Prioridad | Media |
| Estimación | 3 Story Points |
| Estado | ⬜ Escrita / 🟡 En desarrollo / ✅ Terminada |

## 1. REDACCIÓN ESTÁNDAR
**COMO** visitante del sitio
**QUIERO** navegar por categorías de destinos (Playa, Montaña, Colonial, Ciudad, Naturaleza) accediendo a cada una desde el header
**PARA** descubrir rápidamente hoteles agrupados por el tipo de experiencia que busco

## 2. CONTEXTO Y DETALLES
- Dependencias: convive con la navegación actual del header (`Hoteles`, `Mis reservas`). Esta HU **no depende de una base de datos**: las categorías y sus filtros son **simulados en memoria**; al hacer clic se llama a `renderHotels` con un filtro `categoria`; no se persiste nada.
- Reglas de negocio:
  - Categorías iniciales (hardcodeadas en el cliente): **Playa**, **Montaña**, **Colonial**, **Ciudad**, **Naturaleza**.
  - Cada categoría corresponde a un subconjunto de hoteles del `HOTELS` actual (se asigna por `tags`/`dept` durante el demo) o a un mensaje "Próximamente hoteles de esta categoría" si no hay coincidencias.
  - En esta HU no se accede a URLs: el filtrado es en cliente sobre la lista en memoria.
  - Al elegir una categoría, se hace scroll a la sección de `#hoteles` y se actualiza el contador de resultados.

- UI propuesta:
  - En el header, se reemplaza o extiende el enlace **"Hoteles"** por un **mega menú** o un `<details>`/dropdown desplegable con:
    - Un encabezado **"Explorar por categoría"**.
    - Cinco items: Playa, Montaña, Colonial, Ciudad, Naturaleza (cada uno con un ícono Lucide: `umbrella-beach`, `mountain`, `landmark`, `building-2`, `trees`).
  - En **desktop**: el menú se despliega al hover o al clic, se cierra al elegir o al clic fuera.
  - En **móvil**: el mega menú se convierte en una sección plegable (accordion) dentro del menú hamburguesa, con las cinco categorías listadas abajo.

## 3. CRITERIOS DE ACEPTACIÓN (BDD)

**Escenario 1: Flujo exitoso con resultados**
- DADO QUE el visitante abre el menú de categorías
- CUANDO selecciona "Playa"
- ENTONCES el menú se cierra, la página hace scroll a `#hoteles` y se listan solo los hoteles cuya categoría coincide con "Playa", el contador de resultados muestra el total y se muestra el nombre de la categoría activa.

**Escenario 2: Flujo sin coincidencias en el demo**
- DADO QUE el visitante selecciona una categoría que ningún hotel en memoria cumple (demo)
- CUANDO el sistema procesa el filtro
- ENTONCES se muestra un placeholder: "Próximamente hoteles de esta categoría", sin romper el grid y sin mostrar tarjetas vacías.

**Escenario 3: Cerrar el menú sin elegir**
- DADO QUE el visitante abrió el mega menú
- CUANDO hace clic fuera del menú o pulsa Escape
- ENTONCES el menú se cierra sin cambiar la lista de hoteles actual.

**Escenario 4: Accesibilidad móvil**
- DADO QUE el visitante está en móvil y abre el menú hamburguesa
- CUANDO pulsa la categoría "Colonial"
- ENTONCES el menú hamburguesa se cierra, se hace scroll a `#hoteles` y se filtran los resultados por "Colonial", igual que en escritorio.

## 4. CHECKLIST INVEST
- [x] Independiente
- [x] Negociable
- [x] Valiosa
- [x] Estimable
- [x] Pequeña (cabe en un Sprint)
- [x] Testeable
