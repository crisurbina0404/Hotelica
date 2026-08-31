# HU-000 — Crear la base de datos relacional

**Módulo:** Infraestructura  
**Prioridad:** Alta (Must Have)  
**Estado:** ✅ Terminada  
**Sprint:** Pre-Sprint  
**Interfaz:** —

## Redacción estándar

> Como **equipo de desarrollo de Hotelica**, quiero **diseñar y crear la base de datos relacional** para **almacenar la información de hoteles, habitaciones, reservas, usuarios y reseñas de forma estructurada y consistente**.

## Contexto

Antes de construir la interfaz de usuario, el proyecto necesita un modelo de datos que represente todas las entidades del negocio hotelero: departamentos, municipios, hoteles, habitaciones, reservas, reseñas y usuarios. La base de datos relacional sirve como referencia para los datos simulados de la maqueta.

## Criterios de aceptación (BDD)

### Escenario 1: Tablas principales creadas
**Dado** que el proyecto inicia su desarrollo  
**Cuando** se ejecuta el script `hotelica.sql`  
**Entonces** existen las tablas: `departamentos`, `municipios`, `hoteles`, `habitaciones`, `reservas`, `resenas` y `usuarios`

### Escenario 2: Relaciones entre tablas
**Dado** que existen las tablas principales  
**Cuando** se inspeccionan las claves foráneas  
**Entonces** `hoteles` referencia a `departamentos` y `municipios`, `habitaciones` referencia a `hoteles`, `reservas` referencia a `hoteles` y `habitaciones`, `resenas` referencia a `hoteles`

### Escenario 3: Datos semilla incluidos
**Dado** que la base de datos está creada  
**Cuando** se ejecuta el script completo  
**Entonces** se insertan datos de prueba (hoteles de demostración, departamentos de Nicaragua, habitaciones de ejemplo)

### Escenario 4: Restricciones de integridad
**Dado** que existen las tablas con claves foráneas  
**Cuando** se intenta insertar un registro con una referencia inexistente  
**Entonces** la base de datos rechaza la operación (error de integridad referencial)

## MoSCoW

- **Must Have:** Creación de tablas, claves primarias, claves foráneas, tipos de datos correctos.
- **Should Have:** Datos semilla para demostración (hoteles, departamentos, municipios).
- **Could Have:** Índices para optimización de búsquedas frecuentes.
- **Won't Have:** Procedimientos almacenados, triggers complejos, usuarios con permisos.

## Notas de implementación

- Script SQL: `hotelica.sql` en la raíz del proyecto.
- Motor: PostgreSQL (planeado para fase futura).
- La maqueta actual usa datos simulados en `src/data.ts` que reflejan este esquema.
- Migraciones futuras se gestionarán con herramientas como Flyway o Alembic.
