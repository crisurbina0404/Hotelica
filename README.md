# 🗝️ Hotelica — Tu destino en Nicaragua

> *Donde Nicaragua te recibe 🇳🇮*

**Hotelica** es un sistema de reservación de hoteles enfocado en hoteles pequeños y familiares de Nicaragua. Proyecto académico desarrollado para el curso de **Ingeniería del Software II** (Grupo #08 · Recinto Central Managua "Carlos Fonseca Amador").

![Estado](https://img.shields.io/badge/Estado-Fase%201%20(Demo%20+%20Auth)-177E8C?style=for-the-badge)
![Metodología](https://img.shields.io/badge/Metodología-Scrum%20Ágil-F4502C?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-E08E0B?style=for-the-badge)
![Auth](https://img.shields.io/badge/Auth-Supabase-0B3540?style=for-the-badge)

---

## 🔍 El Problema
Muchos hoteles pequeños en Nicaragua gestionan sus reservas en cuadernos o WhatsApp, lo que causa:
- ❌ Reservas duplicadas.
- ❌ Pérdida de datos.
- ❌ Descontrol total de la disponibilidad.

## 🎯 Objetivos
**General:** Desarrollar una plataforma web donde los turistas puedan reservar y los hoteles administrar sus operaciones de forma centralizada.

**Específicos:**
- Permitir buscar hoteles por departamento de Nicaragua.
- Mostrar disponibilidad y precios por tipo de habitación.
- Calcular automáticamente el total de la reserva aplicando el **IVA del 15%**.
- Gestionar el ciclo de vida de la reserva (confirmar, cancelar, check-in/out).
- Proveer una consola de administración para aprobar hoteles y ver estadísticas.

---

## 👥 Roles del Sistema

| Rol | Responsabilidades en la plataforma |
|---|---|
| 👤 **Turista** | Busca, filtra, descubre destinos, reserva, paga, cancela, califica y guarda favoritos. |
| 🏨 **Hotel** | Registra su propiedad, publica habitaciones/precios, sube fotos, gestiona reservas y genera reportes de ocupación. |
| 🛡️ **Admin** | Aprueba o rechaza nuevos hoteles, gestiona usuarios (activar/desactivar) y visualiza estadísticas globales. |

---

## ⚠️ Regla de Oro del Proyecto

> **"Ninguna interfaz se programa sin tener su Historia de Usuario (HU) escrita primero."**

Para cada funcionalidad seguimos estrictamente este flujo académico:
1. ✍️ Redactar la HU en `/historias-usuario/` (usando formato BDD e INVEST).
2. 📋 Actualizar el estado en `Orden de Historias de Usuarios.md`.
3. 💻 Programar la interfaz (con comentarios simples de una línea explicando el *"qué"*).
4. 🧪 Probar la interfaz contra los Criterios de Aceptación (Escenarios DADO / CUANDO / ENTONCES).
5. 🗄️ Modificar la Base de Datos si la interfaz lo requiere.
6. 📈 Registrar el avance en `CHANGELOG.md`.

---

## 🧩 Product Backlog (36 Historias de Usuario)

El backlog completo está priorizado mediante **MoSCoW** y estimado con **Planning Poker** (Secuencia de Fibonacci).

| Módulo / Épica | Historias de Usuario (HU) |
|---|---|
| **Infraestructura** | `HU-000` Crear BD relacional |
| **Autenticación** | `HU-001` Registro · `HU-002` Login · `HU-003` Logout · `HU-004` Recuperar contraseña · `HU-005` Perfil |
| **Búsqueda** | `HU-006` Buscar por depto · `HU-007` Filtro precio · `HU-008` Filtro capacidad · `HU-009` Detalles · `HU-010` Habitaciones · `HU-011` Disponibilidad · `HU-012` Destinos |
| **Reservas** | `HU-013` Crear reserva · `HU-014` Calcular IVA/Total · `HU-015` Historial · `HU-016` Cancelar · `HU-017` Estado · `HU-018` Pago · `HU-019` Calificar · `HU-020` Favoritos |
| **Gestión Hotel** | `HU-021` Registrar hotel · `HU-022` Editar info · `HU-023` Habitaciones · `HU-024` Precios · `HU-025` Fotos · `HU-026` Ver reservas · `HU-027` Confirmar/Rechazar · `HU-028` Check-in · `HU-029` Check-out · `HU-030` Ocupación |
| **Administración**| `HU-031` Aprobar hotel · `HU-032` Rechazar hotel · `HU-033` Gestionar usuarios · `HU-034` Estadísticas · `HU-035` Notificaciones |

**Progreso actual:** ✅ `HU-000` – `HU-006` terminadas (BD, autenticación completa con Supabase y búsqueda por departamento). El estado historia por historia está en [`historias-usuario/Orden de Historias de Usuarios.md`](./historias-usuario/Orden%20de%20Historias%20de%20Usuarios.md) y el detalle de cada avance en [`CHANGELOG.md`](./CHANGELOG.md).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS v4 |
| **Autenticación** | Supabase Auth (registro, login, logout, recuperar/restablecer contraseña, perfil) |
| **Datos (Fase 1)** | Catálogo simulado en `src/data.ts` · cliente de Supabase en `src/lib/supabase.ts` |
| **Base de Datos (Fase 2)** | PostgreSQL vía Supabase (modelo relacional documentado en `HU-000`) |
| **Backend (Fase 2)** | API REST de Supabase |
| **Gestión Ágil** | Jira (Sprints) · Google Sheets (Backlog/Poker) |
| **Despliegue** | Vercel (SPA con rewrites a `index.html`) |

---

## 📁 Estructura del Repositorio

```text
Hotelica/
├── index.html                  # Entrada principal de Vite
├── package.json                # Dependencias y scripts
├── vite.config.js              # Vite + Tailwind (puerto 3000)
├── vercel.json                 # Rewrites para SPA en Vercel
├── CHANGELOG.md                # Bitácora de versiones (v0.1.0+)
│
├── historias-usuario/          # Product Backlog con criterios BDD
│   ├── Orden de Historias de Usuarios.md   # Índice oficial (36 HUs)
│   ├── HU-000-base-datos.md
│   ├── HU-001-registrarse.md
│   ├── HU-002-iniciar-sesion.md
│   ├── HU-003-cerrar-sesion.md
│   ├── HU-004-recuperar-contrasena.md
│   ├── HU-005-gestionar-perfil.md
│   └── HU-006-buscar-hoteles.md
│
├── public/                     # Marca e imágenes
│   ├── Logo.svg                # Logo completo (teal + dorado)
│   ├── Logo-blanco.svg         # Variante clara (hero / fondos oscuros)
│   ├── text-subtext.svg        # Texto + guiones (footer claro)
│   ├── text-subtext-white.svg  # Texto + guiones claro
│   └── favicon.svg             # Sello del volcán
│
└── src/
    ├── App.tsx                 # Componente raíz y enrutamiento
    ├── main.tsx                # Punto de entrada de React
    ├── layout.tsx              # Navbar adaptativa, Footer, Toasts, modales de sesión
    ├── rutas.ts                # Definición de rutas (turista, hotel, admin, auth)
    ├── store.tsx               # Estado global (Context API) + funciones de Supabase
    ├── data.ts                 # Datos simulados (hoteles, municipios, reseñas)
    ├── i18n.ts                 # Internacionalización ES/EN
    ├── ui.tsx                  # Componentes base (Marca, Modales, Estrellas, LOGOS)
    ├── tarjeta.tsx             # Tarjeta de hotel
    ├── icons.tsx               # Iconos SVG inline
    ├── siluetas.tsx            # Siluetas SVG de departamentos
    ├── index.css               # Tokens de la guía de estilo + Tailwind
    ├── lib/
    │   └── supabase.ts         # Cliente de Supabase (variables VITE_)
    └── pages/                  # 10 pantallas
        ├── Home.tsx            # Portada turística (buscador, HU-006)
        ├── Results.tsx         # Resultados de búsqueda
        ├── HotelDetail.tsx     # Detalle del hotel y habitaciones
        ├── BookingModal.tsx    # Modal de reserva (3 pasos)
        ├── MyReservations.tsx  # Historial del turista
        ├── ForgotPassword.tsx  # Recuperar contraseña (HU-004)
        ├── ResetPassword.tsx   # Restablecer contraseña (HU-004)
        ├── Profile.tsx         # Gestionar perfil (HU-005)
        ├── HotelPanel.tsx      # Dashboard del hotelero
        └── AdminPanel.tsx      # Consola del administrador
```

---

## 🚀 Cómo ejecutar el proyecto

### Requisitos
- Node.js 18+ y npm.

### Frontend (Demo React)

```bash
# 1. Clonar el repositorio
git clone https://github.com/crisurbina0404/Hotelica.git
cd Hotelica

# 2. Instalar dependencias
npm install

# 3. Configurar las variables de entorno (ver sección siguiente)
cp .env.example .env   # y completar con tus credenciales de Supabase

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en el navegador
# http://localhost:3000
```

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Typecheck + build de producción (carpeta `dist/`) |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run typecheck` | Verificación de tipos sin emitir archivos |

### Variables de entorno

La autenticación usa Supabase. Crear un archivo `.env` en la raíz (ver `.env.example`):

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_ANONIMA
```

> El archivo `.env` está en `.gitignore` y **nunca** se sube al repositorio. La clave *anon* es pública por diseño, pero cada proyecto de Supabase tiene la suya.

---

## ☁️ Despliegue (Vercel)

El proyecto se despliega en Vercel como SPA:

- `vite.config.js` compila con base relativa (`base: './'`) para evitar rutas absolutas.
- `vercel.json` reescribe todas las rutas (excepto `assets/`) hacia `index.html`, para que la navegación por estado funcione al recargar.

---

## 🗄️ Datos y Base de Datos

- **Fase 1 (actual):** el catálogo de hoteles, habitaciones, reservas y reseñas es **simulado** en `src/data.ts`, diseñado para reflejar el esquema relacional. La autenticación (usuarios y perfiles) es **real** con Supabase Auth.
- **Modelo relacional (HU-000):** entidades `usuarios`, `hoteles`, `habitaciones`, `reservas`, `pagos`, `calificaciones`, más catálogos de `departamentos` (8 de Nicaragua) y `municipios`, con estados controlados por `ENUM`:
  - Hotel: *Pendiente → Aprobado / Rechazado*
  - Reserva: *Pendiente → Confirmada → Check-in → Completada / Cancelada*
  - Pago: *Pagado / Pendiente / Reembolsado*
- **Fase 2 (planeada):** migrar el catálogo a PostgreSQL vía Supabase.

---

## 🧮 Cálculos de Negocio Implementados

| # | Métrica | Fórmula / Regla |
|---|---|---|
| 1 | Noches | `fecha_salida − fecha_llegada` |
| 2 | Subtotal | `precio_por_noche × noches` |
| 3 | IVA (15%) | `subtotal × 0.15` |
| 4 | Total a pagar | `subtotal + IVA` |
| 5 | Disponibilidad | `total_unidades − unidades_ocupadas` |
| 6 | % Ocupación | `(ocupadas ÷ total_unidades) × 100` |
| 7 | Calificación Promedio | `((calif_actual × reseñas) + nueva_calif) ÷ (reseñas + 1)` |
| 8 | Ingresos Totales | `SUM(total) WHERE estado_reserva != 'Cancelada'` |

**Validaciones activas:** fecha de salida posterior a la llegada, huéspedes ≤ capacidad de la habitación, disponibilidad > 0 antes de reservar, precio por noche > 0 y solo hoteles *Aprobado* visibles en la búsqueda.

---

## 📈 Changelog

El progreso detallado versión por versión está en [`CHANGELOG.md`](./CHANGELOG.md). Hitos recientes:

- **v0.21.0** (2026-09-09): Logos centralizados (`LOGOS`), `MarcaFooter` y tamaños de marca ajustados.
- **v0.20.0** (2026-09-09): Logo adaptativo con cross-fade en la barra sobre el hero.
- **v0.19.0** (2026-09-09): HU-006 verificada contra sus 5 escenarios BDD.
- **v0.18.0** (2026-09-07): HU-004 Recuperar/restablecer contraseña con Supabase.
- **v0.17.0** (2026-09-07): HU-005 Gestionar perfil con modo edición.
- **v0.16.0** (2026-09-02): HU-003 Cierre de sesión con Supabase.
- **v0.15.0** (2026-09-01): HU-002 Inicio de sesión con Supabase Auth.
- **v0.14.0** (2026-09-01): HU-001 Registro con Supabase Auth.

---

## 👨‍💻 Equipo (Grupo #08)

| Nombre | Rol Scrum |
|---|---|
| **Cristhian David Urbina Cano** | Developer |
| **Tatiana Solimar Jaime Martinez** | Scrum Master |
| **Edwin Ally Mercado Padilla** | Product Owner |

**Docente Guía:** MBA. Ing. Tania G. Sequeira Altamirano  
**Institución:** Dirección de Ciencias Básicas y Tecnologías · Ingeniería en Sistemas de Información · Modalidad Regular.

---
<p align="center">
  <sub>Proyecto Académico · Ingeniería del Software II · Agosto 2026</sub>
</p>
