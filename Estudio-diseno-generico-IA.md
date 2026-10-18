# Estudio — señales de "diseño genérico hecho con IA" en Hotelica

Fecha: 16 de octubre de 2026
Alcance: sitio completo en ejecución (Vite + React + Tailwind) y su código fuente.
Método: lectura del sistema de diseño (`src/index.css`, `.opencode/skills/hotelica-design/SKILL.md`), lectura de los componentes (`Home`, `Results`, `HotelDetail`, `HotelPanel`, `AdminPanel`, `MyReservations`, `InscribeHotel`, `layout`, `ui`, `tarjeta`), conteo de patrones en el código y **10 capturas reales** de las pantallas en desktop (1440×900) y celular (390×844).

---

## 0. Veredicto general

La base **no** es una plantilla genérica: la paleta propia (teal/dorado/coral/crema), las tres tipografías con rol definido, los SVG inline y el logo dibujado son decisiones de oficio que ya superan el 90 % de las landings hechas con IA. El problema no está en los colores ni en las fuentes.

Las señales de "esto lo generó una IA" están en la **composición y en las fórmulas repetidas**: el hero de landing con chip de vidrio y fila de estadísticas, las tarjetas KPI con icono pastel, la sección "01 02 03 04", el `Reveal` escalonado aplicado a absolutamente todo, y una fórmula idéntica de "ceja en mayúsculas + título" en cada sección de cada pantalla. Son patrones que la IA produce de forma automática y que un programador humano afinado repetiría mucho menos. A eso se suman detalles de acabado sin pulir (navbar que parte en dos líneas, columna vacía del footer, hueco en la galería) que delatan que nadie revisó el resultado renderizado a mano.

---

## 1. Señales de mayor peso (las que más "IA" gritan)

### 1.1 El `Reveal` escalonado está en TODAS partes — 80 usos

Cada bloque de contenido, y en varias pantallas cada tarjeta individual, entra con el mismo "fade-up + translate 26px + delay calculado". Es **la** firma visual de las landings generadas por IA (el "staggered reveal").

- [ui.tsx:11-43](src/ui.tsx#L11-L43) define `Reveal`; se usa **80 veces** (`grep -o "<Reveal" src` = 80).
- En `Results` cada tarjeta lleva su propio delay: `delay={(i % 3) * 90}` ([Results.tsx:271](src/pages/Results.tsx#L271)).
- En el home, hasta el chip del hero y el buscador están dentro de `Reveal` con delays de 120/240/360 ms ([Home.tsx:92-135](src/pages/Home.tsx#L92-L135)).

Cuando todo se anima, nada se anima: la página tarda en estar usable y se percibe como efecto de plantilla. Un humano lo reserva para 3 o 4 momentos clave.

### 1.2 Sección "01 02 03 04" — el patrón más saturado, y el propio skill lo prohíbe

`.opencode/skills/hotelica-design/SKILL.md` §10.1 dice textualmente: *"Prohibido el patrón 'N pasos' numerado con icono + título + texto en N columnas: es el más saturado."* Está implementado igual, dos veces:

- **Home** ([Home.tsx:322-360](src/pages/Home.tsx#L322-L360)): "De la búsqueda a la hamaca", 4 columnas con números `01`–`04` en Fraunces gigante color dorado, puntos y línea conectora sobre fondo oscuro con textura de puntos. Capturado en pantalla: es visualmente idéntico al patrón prohibido, solo que el skill lo autoriza si es "línea de tiempo" —el resultado se lee igual que la versión prohibida.
- **InscribeHotel** ([InscribeHotel.tsx:355-365](src/pages/InscribeHotel.tsx#L355-L365)): tres tarjetas numeradas "Envías la solicitud / El admin la revisa / Recibís tu cuenta" con icono cuadrado teal. Esta sí es la versión literalmente prohibida.

### 1.3 Bandeja de KPIs con icono pastel (patrón de dashboard generado)

Cuatro tarjetas idénticas: cuadrado redondeado con fondo pastel + icono, número en Fraunces, etiqueta en gris. Se repite en los dos paneles:

- [HotelPanel.tsx:385-389](src/pages/HotelPanel.tsx#L385-L389) — "1 Reservas pendientes / 62 Confirmadas / 1 Check-ins por hacer / 0 Check-outs de hoy" (captura del panel).
- [AdminPanel.tsx:78-83](src/pages/AdminPanel.tsx#L78-L83) — mismas 4 tarjetas con paletas pastel distintas (verde/ámbar/azul/índigo).

Es el layout por defecto que produce cualquier IA al pedirle "un dashboard con métricas". Los números además no cuadran: 62 confirmadas y 1 pendiente en un hotel con 12 unidades (captura).

### 1.4 Hero de landing genérica: la receta completa

[Home.tsx:86-224](src/pages/Home.tsx#L86-L224) acumula, en orden, cinco marcas de plantilla AI:

1. Foto a sangre con overlay de gradiente oscuro.
2. Píldora tipo "glassmorphism" con bandera: `<BanderaNI/> Plataforma turística de Nicaragua` con `bg-white/10 backdrop-blur-sm` ([Home.tsx:97](src/pages/Home.tsx#L97)).
3. Titular con **una palabra en color de acento subrayada con SVG ondulado** ("Nicaragua" + `.wave-underline`).
4. Fila de 3 estadísticas con icono: "6 hoteles familiares · 23 municipios · 10 reseñas".
5. Tarjeta de buscador que **se monta sobre el hero** con `-mt-28` y `shadow-lift` ([Home.tsx:131](src/pages/Home.tsx#L131)).

Cada uno por separado es defendible; los cinco juntos en la primera pantalla es el sello del generador.

### 1.5 Testimonios de manual — con nombre de celebridad

[Tarjetas de testimonio, Home.tsx:361-393](src/pages/Home.tsx#L361-L393): icono de comillas, cita, estrellas, avatar circular con iniciales, nombre + origen. Cuatro estrellas en una de las tres para dar "verosimilitud" (truco clásico de datos sintéticos).

Peor: los datos. [data.ts:905](src/data.ts#L905) — **"Sophie Turner, Canadá"** es el nombre de una actriz famosa. Cualquiera que lo note deja de confiar en todo el contenido de la página.

### 1.6 Dos banners CTA casi idénticos en la misma página

El bloque "Para hoteleros" del home ([Home.tsx:269-295](src/pages/Home.tsx#L269-L295)) y el encabezado del formulario de inscripción ([InscribeHotel.tsx:148-165](src/pages/InscribeHotel.tsx#L148-L165)) usan la misma fórmula: `rounded-2xl bg-gradient-to-br from-primary to-primary-deep`, textura de puntos, ceja "Para hoteleros" en dorado y una palmera SVG gigante decorativa en la esquina. Están uno debajo del otro en la misma página (captura de la parte inferior del home).

### 1.7 Loading simulado

[Results.tsx:47-50](src/pages/Results.tsx#L47-L50): `setTimeout(650)` que muestra el spinner "Buscando hoteles..." aunque los datos ya estén en memoria. Los datos son locales (localStorage) y la espera es inventada: es decoración de demo generada por IA, y en una máquina lenta el usuario la sufre. (Capturado: el estado de carga aparece cada vez que cambia cualquier filtro, incluso mover el slider de precio.)

---

## 2. Señales de peso medio

### 2.1 Una sola fórmula de encabezado en todo el sitio

`TituloSeccion` = ceja en mayúsculas con `tracking-[0.18em]` + guioncito dorado + título en Fraunces ([ui.tsx:318-336](src/ui.tsx#L318-L336)). Aparece en **cada sección de cada pantalla** (Home ×4, Results, HotelDetail ×3, MisReservas, Favoritos, Admin ×2, HotelPanel ×N). El conteo lo confirma: **110 usos de `uppercase`** y **95 de `tracking-wider`** en el código.

En las capturas se nota: la página tiene un ritmo visual predecible —siempre el mismo tipo de encabezado, siempre la misma distancia— y esa previsibilidad es exactamente lo que el skill §10.1 pide romper ("el orden no se puede adivinar").

### 2.2 Muro de tarjetas con la misma receta

`shadow-card` 41 veces, `shadow-lift` 15, `rounded-xl`/`rounded-2xl` por decenas (solo `HotelPanel.tsx` tiene 26 `rounded-xl`), `hover:-translate-y` 9, `active:scale` 30. Cada tarjeta tiene borde `border-line`, fondo blanco, radio y sombra idénticos. Resultado en capturas: resultados, favoritos, testimonios, historial del admin y secciones del panel son el mismo bloque repetido; la jerarquía entre tarjetas no existe porque **todas levantan lo mismo al pasar el mouse**.

### 2.3 Micro-interacción de manual

Toda la interactividad sigue la misma receta: `transition-all` + `hover:-translate-y-*` + `hover:shadow-lift` + `active:scale-95` (30 apariciones) + `focus:ring-2 focus:ring-primary/25` (36). El CTA dorado, los filtros, las tarjetas, los chips y los botones de panel reaccionan de forma indistinguible. Un humano suele dar más peso al CTA principal que a un filtro.

### 2.4 Paleta oficial conviviendo con 30+ hex sueltos de Tailwind

La guía prohíbe hexadecimales fuera de tokens, pero el código los tiene pegados por todas partes: `bg-[#DBEAFE] text-[#1D4ED8]`, `border-[#93C5FD]`, `bg-[#DCFCE7] text-[#166534]`, `bg-[#FEE2E2] text-[#B91C1C]`, `hover:bg-[#15803D]`, `hover:bg-[#B91C1C]`… (todo `ui.tsx`, `AdminPanel`, `MyReservations`, `HotelDetail`). Es el "badge soup" típico de generar componente por componente sin sistema; cada generación pega sus propios hex en lugar de reusar tokens.

### 2.5 Cejas poéticas en cadena

Cada sección tiene su ceja literaria: "Destinos que enamoran", "Los favoritos de los viajeros", "Así de fácil", "Voces viajeras", "Guardados con cariño", "Tu historial de viajes". Es un recurso de copy de landing generada: bonito una vez, predecible a la sexta.

### 2.6 Claims sin respaldo (contra la propia guía)

- "en menos de 48 horas apareces en las búsquedas de **miles de viajeros**" ([Home.tsx:285](src/pages/Home.tsx#L285)) — cifra inventada, y el skill §10.5 exige que toda afirmación diga quién la respalda.
- El hero presume "6 hoteles familiares" como si fueran cifras de una plataforma real (son la semilla de demo).

### 2.7 Fotografía de aire sintético y repetida

- Dos de las tres tarjetas destacadas son **playa con palmeras prácticamente iguales** (Brisas del Pacifico y Coco Loco Bungalows, captura de "Hoteles destacados"), contra la prohibición §10.6 de "stock genérico de playa caribeña".
- Todas las fotos tienen la misma luz perfecta, sin personas y encuadre apaisado idéntico; varias parecen generadas. §10.6 pide encuadres variados (3:4, 5:4, 16:9) — en el sitio no hay ni una vertical.

---

## 3. Detalles de acabado que delatan falta de revisión humana

Estos no son patrones de IA sino huecos de pulido; aun así pesan en la percepción de "web hecha con cuidado".

| # | Qué se ve | Dónde |
|---|---|---|
| 1 | La navbar a 1440 px parte los enlaces en dos líneas ("Explorar hoteles", "Mis reservas", "Panel del hotel") | captura del panel; [layout.tsx:126-141](src/layout.tsx#L126-L141) |
| 2 | El footer tiene la primera columna casi vacía y las 3 de links corridas a la derecha, porque el logo SVG trae ~80 % de lienzo transparente y el hack de alturas (`h-36`, `h-60`) no compensa | captura del footer; [ui.tsx:73-81](src/ui.tsx#L73-L81), `MarcaFooter` |
| 3 | En la galería del detalle queda un hueco enorme debajo de la foto grande, con las miniaturas sueltas mucho más abajo | captura del detalle; [HotelDetail.tsx:120-157](src/pages/HotelDetail.tsx#L120-L157) |
| 4 | En celular el chip del hero parte el texto en dos líneas dentro de la píldora | captura 390 px |
| 5 | Los datos de demo no cuadran entre sí: "6 hoteles", "62 confirmadas", hoteles con "126 reseñas" contra "10 reseñas de viajeros" en el hero | [data.ts](src/data.ts), capturas |
| 6 | Las tarjetas de resultados quedan de alturas distintas y la cuadrícula termina en fila alborotada | captura de resultados |
| 7 | El selector de rol de demostración ("M Turista") está siempre visible en la barra: rompe la ilusión de producto real | [layout.tsx:208-238](src/layout.tsx#L208-L238) |
| 8 | Emoji en el `<title>` (🇳🇮) — la guía prohíbe emojis en UI | [index.html:11](index.html#L11) |

---

## 4. Lo que NO es señal de IA (y conviene conservar)

- Paleta propia y consistente (`@theme` de [index.css](src/index.css)); nada de índigo/violeta con gradiente.
- Tres tipografías con roles separados y `font-optical-sizing`/`tabular-nums` usados bien.
- Iconos y siluetas SVG propios con `currentColor`, sin librerías.
- Estados vacíos, de carga y de error pensados en cada pantalla.
- Accesibilidad real: `label`, `aria-invalid`, `role="alert"`, `prefers-reduced-motion`, foco visible.
- Precios con total IVA a la vista y `fmtDinero` centralizado.

---

## 5. Plan priorizado (qué cambiaría, en orden de impacto)

1. **Sacar el patrón "N pasos"**: reemplazar los tres pasos numerados de `InscribeHotel` por prosa contextual dentro del formulario, y reescribir "De la búsqueda a la hamaca" como bloque editorial asimétrico (no 4 columnas con 01–04).
2. **Dosificar el `Reveal`**: dejarlo para secciones grandes (≈12-15 usos), no por tarjeta ni por encabezado. Ganancia inmediata de sensación de "esto lo afinó alguien".
3. **Romper la bandeja de KPIs**: en el panel del hotel, un dato principal grande + tres datos en línea de texto sin cajitas pastel; en admin, métricas con distinto peso visual.
4. **Simplificar el hero**: quitar la fila de 3 estadísticas con iconos y el chip de vidrio con bandera (o reducirlo a texto plano); dejar foto, titular, subtítulo y buscador.
5. **Datos de testimonios creíbles**: nombres locales plausibles (quitar "Sophie Turner"), fechas coherentes, sin el truco de "una de 4 estrellas" mecánico.
6. **Fotografía**: variar encuadres (agregar verticales 3:4), no repetir playa con palmeras dos veces en destacados, y sustituir las imágenes de aire sintético por fotos reales cuando existan.
7. **Un solo banner "Para hoteleros"**: dejar el del formulario y convertir el del home en una fila simple con enlace.
8. **Elevación con jerarquía**: reservar `shadow-lift` para hover y CTA; las tarjetas en reposo con borde y sombra mínima.
9. **Matar el loading simulado** de 650 ms en resultados (los datos son locales).
10. **Tokens en vez de hex sueltos**: crear tokens semánticos para los badges de estado (`--color-badge-ok-bg`, etc.) y reemplazar los ~30 hex dispersos.
11. **Acabados**: arreglar el partido de la navbar, la columna vacía del footer (recortar el lienzo del logo), el hueco de la galería y el chip del hero en celular.
12. **Claims honestos**: quitar "48 horas" y "miles de viajeros" o atribuirlos a un proceso concreto del equipo.

---

## 6. Anexo — conteos en `src/`

| Patrón | Usos |
|---|---|
| `uppercase` | 110 |
| `tracking-wider` | 95 |
| `<Reveal` | 80 |
| `font-display` | 74 |
| `rounded-full` | 63 |
| `shadow-card` | 41 |
| `focus:ring-2` | 36 |
| `active:scale` | 30 |
| `bg-gradient-to` | 12 |
| `shadow-lift` | 15 |
| `backdrop-blur` | 13 |
| `hover:-translate-y` | 9 |
| `tracking-[0.18em]` (cejas) | 8 |

*(Conteo hecho con `grep -o` sobre `src/**/*.ts(x)`; sirve como línea base para comparar después de cada corrección.)*
