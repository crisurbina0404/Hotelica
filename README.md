# 🗝️ Hotelica — Tu destino en Nicaragua

> *Donde Nicaragua te recibe 🇳🇮*

**Hotelica** es un sistema de reservación de hoteles enfocado en hoteles pequeños y familiares de Nicaragua. Proyecto académico desarrollado para el curso de **Ingeniería del Software II** (Grupo #08 · Recinto Central Managua "Carlos Fonseca Amador").

![Estado](https://img.shields.io/badge/Estado-Fase%201%20(Maqueta)-177E8C?style=for-the-badge)
![Metodología](https://img.shields.io/badge/Metodología-Scrum%20Ágil-F4502C?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Fase%201-HTML%20|%20CSS%20|%20JS-E08E0B?style=for-the-badge)
![Base de Datos](https://img.shields.io/badge/BD-MySQL%20|%20Supabase-0B3540?style=for-the-badge)

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

## 🧩 Historias de Usuario (Product Backlog)

El backlog completo está priorizado mediante **MoSCoW** y estimado con **Planning Poker** (Secuencia de Fibonacci).

| Módulo / Épica | Historias de Usuario (HU) |
|---|---|
| **Infraestructura** | `HU-000` Crear BD relacional (MySQL/Supabase) |
| **Autenticación** | `HU-001` Login (correo/red social) · `HU-002` Cambiar idioma (ES/EN) · `HU-009` Favoritos |
| **Búsqueda** | `HU-003` Buscar y filtrar por destino · `HU-004` Descubrir destinos y actividades |
| **Reservas** | `HU-005` Reservar con IVA 15% · `HU-006` Cancelar · `HU-007` Historial · `HU-008` Calificar estadía |
| **Gestión Hotel** | `HU-010` Registrar hotel · `HU-011` Habitaciones/Precios · `HU-012` Fotos · `HU-013` Gestionar reservas · `HU-014` Check-in/out · `HU-015` Reporte ocupación |
| **Administración**| `HU-016` Aprobar/Rechazar hoteles · `HU-017` Gestionar usuarios · `HU-018` Estadísticas globales |

*(Ver detalle completo, wireframes y criterios BDD en el documento `HOTELICA- T01 UserStory.pdf` y la carpeta `/historias-usuario/`)*.

---

## 🛠️ Stack Tecnológico

| Capa | Fase 1 (Actual) | Fase 2 (Pendiente) |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript Vanilla (Sin frameworks) | React / TypeScript (Evaluado a futuro) |
| **Backend** | Lógica simulada en JS (Memoria) | Node.js + Express |
| **Base de Datos**| MySQL (`Base de Datos Hotelica.sql`) / Supabase | PostgreSQL Relacional |
| **Gestión Ágil** | Jira (Sprints) · Google Sheets (Backlog/Poker) | - |
| **Diseño/Diagramas**| Draw.io (PERT, Casos de Uso, Clases) | Figma |

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

## 📁 Estructura del Repositorio

```text
hotelica/
├── index.html                  # Maqueta funcional (Fase 1)
├── css/                        # Estilos (Identidad visual Hotelica)
├── js/                         # Lógica vanilla y enrutamiento
├── historias-usuario/          # HU-000 a HU-018 redactadas
├── docs/                       # Diagramas (PERT, Casos de uso exportados)
├── Base de Datos Hotelica.sql  # Esquema MySQL + Seeds
├── Orden de Historias de Usuarios.md # Índice de construcción
├── HOTELICA- T01 UserStory.pdf # Entregable 1 (Documentación oficial)
├── Hotelica.md                 # Guía maestra del proyecto
├── CHANGELOG.md                # Historial de cambios (v0.1.0+)
└── README.md
```

---

## 🚀 Cómo ejecutar el proyecto (Fase 1)

Al ser una maqueta funcional frontend, no requiere servidor complejo para la Fase 1:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/crisurbina0404/Hotelica.git
   cd hotelica
   ```
2. **Ejecutar Frontend:**
   Abrir `index.html` directamente en el navegador, o usar la extensión **Live Server** en VS Code.
3. **Cargar Base de Datos (Opcional para Fase 1):**
   ```bash
   mysql -u root -p < "Base de Datos Hotelica.sql"
   ```

---

## 🗓️ Planificación (Diagrama PERT)

El proyecto se desarrolla en **14 semanas** (del 10 de agosto al 20 de noviembre de 2026), dividido en Sprints de máximo 4 semanas. 
- **Ruta Crítica:** Definición de BD ➔ Diseño UI  Frontend Turista  Integración ➔ Pruebas ➔ Defensa.
- *(El diagrama PERT interactivo y detallado se encuentra en `docs/Diagrama PERT.html` o en el Entregable 1).*

---

## 📈 Changelog

El progreso detallado versión por versión se encuentra en [`CHANGELOG.md`](./CHANGELOG.md).
- **v0.3.0** (2026-07-31): Estructura de carpetas, plantillas HU y BD inicial.
- **v0.2.0** (2026-07-30): Rebrand a Hotelica y pantalla de éxito.
- **v0.1.0** (2026-07-28): Maqueta funcional inicial con flujo de reserva e IVA.

---

## 👨‍ Equipo (Grupo #08)

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
