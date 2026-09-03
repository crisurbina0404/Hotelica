---
name: hotelica-design
description: Identidad visual oficial de HOTELICA (plataforma de reservación hotelera de Nicaragua). Usar SIEMPRE que se cree o modifique cualquier pantalla, componente, estilo, color, tipografía o animación del proyecto. Contiene paleta, tipografías, bloque de marca, componentes, movimiento y accesibilidad.
---

# HOTELICA · Skill de diseño e identidad visual

> **Lema:** "Donde Nicaragua te recibe 🇳🇮"
> **Carácter:** turística, cálida, confiable. Se siente como un atardecer en el lago:
> teal profundo, dorado de sol, coral de volcán y crema de arena.

## 0. Regla de oro antes de tocar estilos

Si una pantalla no tiene su Historia de Usuario (HU) escrita con criterios BDD,
**no se programa**. Primero HU, luego código. Todo cambio visual se registra en
`CHANGELOG.md` con versión y fecha.

---

## 1. Paleta de colores (tokens oficiales)

Los nombres de token son los que usa el código (`--color-*`).
**No inventar hexadecimales nuevos: si un color no está aquí, no existe.**

### 1.1 Marca (obligatoria en toda la interfaz turista)

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#0B3540` | Teal profundo: títulos fuertes, botones secundarios, enlaces, iconos, nombre de marca |
| `--color-primary-dark` | `#092A33` | Hover de superficies teal |
| `--color-primary-deep` | `#07242C` | Secciones oscuras ("Cómo funciona") |
| `--color-primary-ink` | `#051B21` | Fondo del footer |
| `--color-primary-light` | `#D9E9EC` | Fondos teal muy suaves |
| `--color-primary-soft` | `#EFF5F6` | Fondos de acento en formularios |
| `--color-accent` | `#F7A81B` | Dorado: CTA principal "Buscar/Reservar", estrellas, folios |
| `--color-accent-dark` | `#D98A0B` | Hover del CTA dorado |
| `--color-accent-light` | `#FDF0D7` | Fondos dorados suaves |
| `--color-coral` / `--color-danger` | `#F4502C` | Coral volcán: errores, cancelaciones, corazones de favoritos |
| `--color-canvas` | `#F8F6F0` | Crema: fondo general de página |
| `--color-ink` | `#1C2B30` | Texto principal |
| `--color-muted` | `#5D6E73` | Texto secundario |
| `--color-line` | `#E4DFD2` | Bordes y divisores |

### 1.2 Colores exclusivos del bloque de marca `.brand`

| Hex | Elemento |
|---|---|
| `#0B3540` | Nombre **HOTELICA** (Libre Baskerville 700, mayúsculas) |
| `#177E8C` | Frase "Tu destino en Nicaragua" |
| `#E0A83C` | Guiones decorativos a los lados de la frase |

### 1.3 Colores por rol (paneles)

| Rol | Hex | Fondo suave | Dónde |
|---|---|---|---|
| 🧳 Turista | `#0B3540` | `#D9E9EC` | Todo el flujo público |
| 🏨 Hotel | `#B45309` | `#FEF3C7` | Panel del hotel, dashboards ámbar |
| 🛡️ Admin | `#4F46E5` | `#E0E7FF` | Consola de administración |

### 1.4 Estados de reserva (badge = fondo / texto / borde)

| Estado | Fondo | Texto | Borde |
|---|---|---|---|
| Pendiente | `#FEF3C7` | `#92400E` | `#FCD34D` |
| Confirmada | `#DBEAFE` | `#1D4ED8` | `#93C5FD` |
| Check-in | `#D9E9EC` | `#0B3540` | `#5EEAD4` |
| Completada | `#DCFCE7` | `#166534` | `#86EFAC` |
| Cancelada | `#FEE2E2` | `#B91C1C` | `#FCA5A5` |

### 1.5 Estados de hotel y de habitación

- Hotel **aprobado**: fondo `#DCFCE7`, texto `#166534`.
- Hotel **pendiente**: fondo `#FEF3C7`, texto `#92400E`.
- Hotel **rechazado**: fondo `#FEE2E2`, texto `#B91C1C`.
- Habitación: disponible = verde (`#DCFCE7`/`#166534`), mantenimiento = ámbar
  (`#FEF3C7`/`#92400E`), no disponible = rojo (`#FEE2E2`/`#B91C1C`).

### 1.6 Semánticos

`success #16A34A` · `warning #D97706` · `danger #F4502C` · `info #2563EB`

### 1.7 Prohibiciones de color

- ❌ Gradientes índigo/violeta/rosa, ni titulares pintados con gradiente.
- ❌ Beige + terracota + serif genérica (el crema del proyecto va con **teal/dorado/coral**).
- ❌ Fondos casi negros con un solo acento neón.
- ❌ Azul `#0F766E` o teal antiguo: fue reemplazado por `#0B3540` en v0.5.0.

---

## 2. Tipografía

Tres familias, cada una con **un solo trabajo**. Nunca mezclarlas en el mismo rol.

| Familia | Carga | Rol | Dónde |
|---|---|---|---|
| **Fraunces** (display) | variable, opsz 9–144, wght 500–900 | Títulos y números grandes | `h1–h3`, precios, folios, porcentajes |
| **Outfit** (cuerpo) | 400–800 | Todo el texto de interfaz | Párrafos, botones, labels, tablas |
| **Libre Baskerville** (marca) | 400, 700 | **Exclusivo del nombre HOTELICA** | Bloque `.brand` (header, footer, login, splash, éxito) |

### 2.1 Escala tipográfica

| Elemento | Fuente | Tamaño | Peso |
|---|---|---|---|
| Hero | Fraunces | `3.6rem` (móvil `2.25rem`) | 800 |
| Título de sección | Fraunces | `1.9rem` | 700 |
| Título de tarjeta | Fraunces | `1.05rem` | 700 |
| Ceja de sección | Outfit | `12px`, `uppercase`, `tracking 0.18em` | 700 |
| Cuerpo | Outfit | `15–16px` | 400/500 |
| Etiquetas de campo | Outfit | `11px`, `uppercase`, `tracking wider` | 700 |
| Badges / folios tabla | Outfit / mono | `11–12px` | 700 |

### 2.2 El bloque de marca `.brand` (no negociable)

Estructura exacta: nombre arriba, frase debajo con guiones dorados. - Variantes de tamaño: `.chica` (1.02rem), base (1.25rem), `.grande` (2rem), `.enorme` (2.9rem, solo splash).
- Sobre fondos oscuros (navbar transparente en el hero, footer): variante
  `.brand.oscura` → nombre `#F8F6F0`, frase `#8FD3DE`, **guiones dorados iguales**.
- El nombre **jamás** se renderiza con Fraunces ni Outfit: solo Libre Baskerville.

---

## 3. Fondo, capas y superficies

- **Fondo ambiental** (`ambient-bg`): tres `radial-gradient` muy tenues
  (teal arriba-derecha, dorado a la izquierda, teal abajo) sobre crema.
  Siempre presente; no reemplazar por fondos planos.
- **Textura de puntos** (`dot-texture` / `dot-texture-light`):
  `radial-gradient` de 1.2px cada 18px, sobre secciones destacadas y oscuras.
- **Tarjetas:** `rounded-xl` (no `rounded-2xl` en todo el sitio), borde
  `--color-line`, sombra `--shadow-card`; al hover: `-translate-y-1.5` + `--shadow-lift`.
- **Modales:** fondo `primary-ink/70` + `backdrop-blur(3px)`; tarjeta blanca
  `rounded-2xl` con `anim-pop`.

## 4. Iconografía y siluetas

- **Iconos:** SVG inline propios (`src/icons.tsx`), `viewBox 24`, trazo
  `currentColor` de 1.9px. **Cero librerías de iconos, cero emojis en UI.**
- **Siluetas de departamentos** (`src/siluetas.tsx`): `viewBox 64×64`,
  relleno sólido `fill="currentColor"`, sin gradientes ni filtros,
  **siempre** con `role="img"` + `aria-label="Silueta de {departamento}"`.
- Cada departamento tiene su silueta fija (Granada = iglesia + isletas,
  León = catedral + Cerro Negro, Rivas = dos conos de Ometepe + sol,
  Managua = skyline + laguna, Masaya = laguna + cruz/mercado,
  Estelí = montañas + hoja de tabaco, Matagalpa = montañas + rama de café,
  Caribe = palmera + cayos). No sustituir por otra imagen.

## 5. Movimiento (regla sostenible: finito y barato)

**Solo animaciones finitas.** Prohibidas las infinitas (marquesinas, Ken Burns,
bucles decorativos): consumen CPU/GPU/batería y ya fueron retiradas en v0.5.0.

| Clase | Duración | Uso |
|---|---|---|
| `.reveal` | 700ms | Aparición al hacer scroll (IntersectionObserver) |
| `.anim-pop` | 320ms | Modales y menús |
| `.anim-toast` | 300ms | Avisos |
| `.anim-heart` | 400ms | Latido al marcar favorito |
| `.anim-grow` | 1s | Barras de estadísticas |
| `.anim-spin` | 800ms loop | **Solo** el spinner mientras hay carga real |
| `.wave-underline` | 1.4s, 1 vez | Ola dibujada bajo "Nicaragua" |

- **Hover:** toda superficie clicable responde (translate + sombra, color,
  subrayado `.nav-link`, icono que rota ligeramente). Nada estático y muerto.
- **Obligatorio:** `@media (prefers-reduced-motion: reduce)` anula duración,
  repeticiones y transiciones, y fuerza `.reveal` visible.

## 6. Componentes base (referencia rápida)

- **Botón primario (CTA):** `bg-accent` → hover `bg-accent-dark`, texto blanco,
  `rounded-lg`, `active:scale-[0.97]`. Es el botón de "Buscar hoteles", "Confirmar reserva".
- **Botón secundario:** borde 2px `primary`, texto `primary`, hover `bg-primary-soft`.
- **Botón peligro:** `bg-danger` → hover más oscuro. Solo cancelar/rechazar.
- **Badge de estado:** pastilla `rounded-full` con punto de color + texto en
  negrita 12px (colores de §1.4).
- **Tabla de panel:** cabecera en fondo suave del rol (teal/ámbar/índigo),
  filas alternadas, hover de fila, scroll horizontal en móvil.
- **Toast:** esquina inferior derecha, borde + fondo pastel según tono
  (ok/error/info), ícono propio, se retira solo a los 3.5s.

## 7. Do / Don't

| ✅ Sí | ❌ No |
|---|---|
| Teal `#0B3540` + dorado `#F7A81B` + coral + crema | Otros teales/azules heredados (`#0F766E`) |
| Fraunces en títulos, Outfit en cuerpo | Una sola familia para todo |
| Nombre HOTELICA solo en Libre Baskerville | Nombre en Fraunces/Outfit u otra serif |
| SVG inline con `currentColor` | Librerías de iconos, imágenes raster para UI |
| Animaciones finitas + reduced-motion | Marquesinas, loops infinitos, parallax pesado |
| Estados visibles en cada pantalla | Pantallas sin vacío/error/carga pensados |

## 8. Checklist antes de dar por terminado un cambio visual

- [ ] Solo usé tokens de la paleta oficial (§1).
- [ ] Títulos en Fraunces, cuerpo en Outfit, marca en Libre Baskerville.
- [ ] Si toqué el nombre HOTELICA, es el bloque `.brand` completo.
- [ ] Iconos/siluetas son SVG inline accesibles.
- [ ] No quedó ninguna animación infinita; `prefers-reduced-motion` cubierto.
- [ ] Móvil (360px), tablet (768px) y desktop (1280px) verificados.
- [ ] Cambio registrado en `CHANGELOG.md` con versión y fecha.

## 9. Referencia de tokens

Ver `tokens.css` en esta misma carpeta: variables listas para copiar.
