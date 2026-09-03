# 🗝️ Hotelica — Tu destino en Nicaragua

> *Donde Nicaragua te recibe 🇳*

**Hotelica** es un sistema de reservación de hoteles enfocado en hoteles pequeños y familiares de Nicaragua. Proyecto académico desarrollado para el curso de **Ingeniería del Software II** (Grupo #08 · Recinto Central Managua "Carlos Fonseca Amador").

![Estado](https://img.shields.io/badge/Estado-Fase%201%20(Demo)-177E8C?style=for-the-badge)
![Metodología](https://img.shields.io/badge/Metodología-Scrum%20Ágil-F4502C?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-E08E0B?style=for-the-badge)
![Base de Datos](https://img.shields.io/badge/BD-|%20Supabase-0B3540?style=for-the-badge)

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

*(Ver detalle completo, wireframes y criterios BDD en el documento `HOTELICA- T01 UserStory.pdf` y la carpeta `/historias-usuario/`)*.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend (Demo)** | React 18 · TypeScript · Vite · Tailwind CSS v4 |
| **Base de Datos** | MySQL (`Base de Datos Hotelica.sql`) / Supabase (PostgreSQL) |
| **Backend (Fase 2)** | Node.js + Express (o API REST de Supabase) |
| **Gestión Ágil** | Jira (Sprints) · Google Sheets (Backlog/Poker) |
| **Diseño/Diagramas**| Draw.io (PERT, Casos de Uso, Clases) |

---

## 📁 Estructura del Repositorio

```text
Hotelica - Demo/
├── index.html                  # Entrada principal de Vite
├── package.json                # Dependencias del proyecto
├── vite.config.js              # Configuración de Vite
├── tsconfig.json               # Configuración de TypeScript
├── CHANGELOG.md                # Historial de cambios (v0.1.0+)
├── Orden de Historias de Usuarios.md # Índice de construcción (36 HUs)
├── Hotelica.md                 # Guía maestra del proyecto
├── Base de Datos Hotelica.sql  # Esquema MySQL + Seeds
│
├── dist/                       # Build de producción (Vite)
│
└── src/                        # Código fuente (11 archivos base)
    ├── App.tsx                 # Componente raíz y enrutamiento
    ├── main.tsx                # Punto de entrada de React
    ├── layout.tsx              # Layout global (Header, Footer, Marca)
    ├── rutas.ts                # Definición de rutas
    ├── store.tsx               # Estado global (Context API)
    ├── data.ts                 # Datos simulados (hoteles, destinos)
    ├── ui.tsx                  # Componentes base reutilizables
    ├── tarjeta.tsx             # Componente de tarjeta de hotel
    ├── icons.tsx               # Iconos SVG inline
    ├── siluetas.tsx            # Siluetas SVG de departamentos
    ├── index.css               # Estilos globales y Tailwind
    │
    └── pages/                  # 7 páginas principales
        ├── Home.tsx            # Portada turística (buscador)
        ├── Results.tsx         # Resultados de búsqueda
        ├── HotelDetail.tsx     # Detalle del hotel y habitaciones
        ├── BookingModal.tsx    # Modal de reserva (3 pasos)
        ├── MyReservations.tsx  # Historial del turista
        ├── HotelPanel.tsx      # Dashboard del hotelero
        └── AdminPanel.tsx      # Consola del administrador
```

---

## 🚀 Cómo ejecutar el proyecto

### Frontend (Demo React)
```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/hotelica.git
cd "Hotelica - Demo"

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en el navegador (generalmente http://localhost:5173)
```

### Base de Datos (MySQL)
```bash
# Cargar el esquema y datos de prueba
mysql -u root -p < "Base de Datos Hotelica.sql"
```

---

## 🗄️ Base de Datos (MySQL)

El esquema relacional (`Base de Datos Hotelica.sql`) cuenta con **11 tablas principales** normalizadas, restricciones `ENUM` para controlar los estados y datos de prueba (seeds) de Nicaragua:

- **Catálogos:** `roles`, `departamentos` (8 deptos de Nicaragua), `municipios`, `tipos_habitacion`.
- **Entidades:** `usuarios`, `hoteles` (con estado *Pendiente/Aprobado/Rechazado*), `habitaciones`, `fotografias`.
- **Transacciones:** `reservas` (con cálculo de noches, subtotal, IVA y total), `pagos` (*Pagado/Pendiente/Reembolsado*), `calificaciones` (1 a 5 estrellas).

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

---

## 📈 Changelog

El progreso detallado versión por versión se encuentra en [`CHANGELOG.md`](./CHANGELOG.md).
- **v0.3.0** (2026-07-31): Estructura de carpetas, plantillas HU y BD inicial.
- **v0.2.0** (2026-07-30): Rebrand a Hotelica y pantalla de éxito.
- **v0.1.0** (2026-07-28): Maqueta funcional inicial con flujo de reserva e IVA.

---

## 👨💻 Equipo (Grupo #08)

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
