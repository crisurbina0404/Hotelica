# 🗝️ Hotelica — Tu destino en Nicaragua

> *Donde Nicaragua te recibe 🇳🇮*

**Hotelica** es un sistema de reservación de hoteles para turistas en Nicaragua, enfocado en hoteles pequeños y familiares. Proyecto académico del curso **Ingeniería del Software II** (Grupo #08 · Recinto Central Managua "Carlos Fonseca Amador").

![Estado](https://img.shields.io/badge/Estado-Fase%201%20%7C%20Maqueta%20funcional-177E8C?style=for-the-badge)
![Metodología](https://img.shields.io/badge/Metodología-Scrum-F4502C?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-E08E0B?style=for-the-badge)
![BD](https://img.shields.io/badge/BD-MySQL%20%7C%20Supabase-0B3540?style=for-the-badge)

---

## 📖 Tabla de contenidos

- [El problema](#-el-problema)
- [Objetivos](#-objetivos)
- [Roles del sistema](#-roles-del-sistema)
- [Funcionalidades por módulo](#-funcionalidades-por-módulo)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Cómo ejecutar el proyecto](#-cómo-ejecutar-el-proyecto)
- [Metodología de trabajo](#-metodología-de-trabajo)
- [Cálculos de negocio](#-cálculos-de-negocio)
- [Base de datos](#-base-de-datos)
- [Roadmap de Sprints](#-roadmap-de-sprints)
- [Equipo](#-equipo)

---

## 🔍 El problema

Muchos hoteles pequeños en Nicaragua gestionan sus reservas en **cuadernos o WhatsApp**, lo que causa:

- ❌ Reservas duplicadas
- ❌ Pérdida de datos
- ❌ Descontrol de disponibilidad

## 🎯 Objetivos

**General:** desarrollar una plataforma donde los turistas reservan y los hoteles administran.

**Específicos:**
- Permitir buscar hoteles por departamento.
- Mostrar disponibilidad y precios por habitación.
- Calcular automáticamente el total de la reserva (IVA 15%).
- Gestionar reservas (confirmar, cancelar, check-in/out).
- Aprobar hoteles y ver estadísticas (admin).

## 👥 Roles del sistema

| Rol | Qué hace |
|---|---|
| 👤 **Turista** | Busca, reserva, paga, cancela, califica y marca favoritos |
| 🏨 **Hotel** | Publica habitaciones, gestiona reservas, check-in/out y ocupación |
| 🛡️ **Admin** | Aprueba hoteles, gestiona usuarios y reportes globales |

## 🧩 Funcionalidades por módulo

| Módulo | Historias de Usuario |
|---|---|
| **Infraestructura** | HU-000 Base de datos relacional |
| **Autenticación y preferencias** | HU-001 Login (correo/red social) · HU-002 Idioma ES/EN · HU-009 Favoritos |
| **Búsqueda y descubrimiento** | HU-003 Buscar y filtrar · HU-004 Descubrir destinos |
| **Reservas y estadía** | HU-005 Reservar (IVA 15%) · HU-006 Cancelar · HU-007 Historial · HU-008 Calificar |
| **Gestión del hotel** | HU-010 Registrar hotel · HU-011 Habitaciones · HU-012 Fotos · HU-013 Reservas · HU-014 Check-in/out · HU-015 Ocupación |
| **Administración** | HU-016 Aprobar hoteles · HU-017 Usuarios · HU-018 Estadísticas |

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend (Fase 1) | HTML5 · CSS3 · JavaScript vanilla |
| Base de datos | MySQL (`hotelica.sql`) · Supabase (`supabase-hotelica.sql`) |
| Backend (Fase 2) | Node.js + Express |
| Gestión | Jira (Scrum) · Google Sheets (Backlog/Planning Poker) |
| Diseño | Prototipo HTML · Draw.io (PERT, clases, casos de uso) |

## 📁 Estructura del repositorio

```
hotelica/
├── index.html                  # Maqueta funcional (3 roles)
├── css/  ·  js/                # Estilos y lógica de la maqueta
├── historias-usuario/          # HU-000 … HU-018 + INDICE-HU.md
├── docs/                       # PERT, casos de uso, diagramas
├── Base de Datos Hotelica.sql  # Esquema MySQL + seeds
├── Hotelica.md                 # Documento guía del proyecto
├── CHANGELOG.md                # Seguimiento de avances
└── README.md
```

## 🚀 Cómo ejecutar el proyecto

```bash
# 1. Cloná el repositorio
git clone https://github.com/tu-usuario/hotelica.git

# 2. Abrí la maqueta (Fase 1, sin servidor)
#    Opción A: doble clic en index.html
#    Opción B: con Live Server en VS Code

# 3. Cargá la base de datos
mysql -u root -p < "Base de Datos Hotelica.sql"
```

## 📋 Metodología de trabajo

Seguimos un flujo académico estricto para cada interfaz:

1. ✍️ Redactar su **historia de usuario** en `/historias-usuario/`.
2. 📑 Actualizar el estado en `INDICE-HU.md`.
3. 💻 Programar la interfaz con comentarios simples de una línea.
4. 🧪 Probar contra los **criterios de aceptación BDD**.
5. 🗄️ Modificar la base de datos si la interfaz lo requiere.
6. 📈 Registrar el avance en `CHANGELOG.md`.

> ⚠️ **Regla de oro:** ninguna interfaz se programa sin tener su historia de usuario escrita primero.

**Prácticas ágiles:** Planning Poker (Fibonacci) · Priorización MoSCoW · Criterios BDD (DADO/ CUANDO/ ENTONCES) · Filtro INVEST · PERT de 14 semanas.

## 🧮 Cálculos de negocio

| # | Cálculo | Fórmula |
|---|---|---|
| 1 | Noches | salida − llegada |
| 2 | Subtotal | precio × noches |
| 3 | IVA (15%) | subtotal × 0.15 |
| 4 | Total | subtotal + IVA |
| 5 | Disponibilidad | total − ocupadas |
| 6 | % Ocupación | (ocupadas ÷ total) × 100 |
| 7 | Calificación promedio | ((calif × reseñas) + nueva) ÷ (reseñas + 1) |
| 8 | Ingresos | Σ totales no cancelados |

## 🗄️ Base de datos

11 tablas principales: `roles`, `departamentos`, `municipios`, `usuarios`, `hoteles`, `tipos_habitacion`, `habitaciones`, `fotografias`, `reservas`, `pagos` y `calificaciones`, con estados controlados (`Pendiente / Confirmada / Check-in / Completada / Cancelada`) y seeds de Nicaragua (8 departamentos, 5 tipos de habitación).

📐 Diagrama ER y de clases disponibles en `/docs` (Draw.io).

## 🗓️ Roadmap de Sprints

| Sprint | Semanas | Foco |
|---|---|---|
| Sprint 0 | 1–2 | HU-000 Base de datos + Backlog |
| Sprint 1 | 3–4 | HU-001 Login · HU-002 Idioma + Diseño/Backend base |
| Sprint 2 | 5–6 | HU-003…HU-005 (búsqueda y reserva) |
| Sprint 3 | 7–8 | HU-006…HU-009 (reservas y preferencias) |
| Sprint 4 | 9–10 | HU-010…HU-015 (portal del hotel) |
| Sprint 5 | 11–12 | HU-016…HU-018 (consola admin) + deploy |
| Sprint 6 | 13–14 | Documentación y defensa |

*Inicio: 10 ago 2026 · Defensa: nov 2026.*

## 👥 Equipo

| Integrante | Rol Scrum |
|---|---|
| Cristhian David Urbina Cano | Developer |
| Tatiana Solimar Jaime Martinez | Scrum Master |
| Edwin Ally Mercado Padilla | Product Owner |

**Docente:** MBA. ING. Tania G. Sequeira Altamirano

## 📈 Changelog

Ver [CHANGELOG.md](./CHANGELOG.md) — último: `v0.3.0` (estructura, HU y BD inicial).

---

<p align="center">
  <strong>HOTELICA</strong> · Tu destino en Nicaragua 🇳<br>
  <sub>Proyecto académico — Ingeniería del Software II · 2026</sub>
</p>
