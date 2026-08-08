# 🗝️ Hotelica
> Donde Nicaragua te recibe 🇳🇮

Sistema de reservación de hoteles para turistas en Nicaragua.
Proyecto académico del curso de Ingeniería de Software.

---

## 1. Información general
| Campo | Detalle |
|---|---|
| Nombre | Hotelica |
| Tipo | Plataforma web de reservas hoteleras |
| Enfoque | Hoteles pequeños y familiares de Nicaragua |
| Nivel | Académico — programador junior |
| Estado | Fase 1 (maqueta funcional) |

## 2. Problema
Muchos hoteles pequeños gestionan sus reservas en cuadernos o WhatsApp,
lo que causa reservas duplicadas, pérdida de datos y descontrol de disponibilidad.

## 3. Objetivos
**General:** desarrollar una plataforma donde turistas reservan y hoteles administran.

**Específicos:**
- Permitir buscar hoteles por departamento.
- Mostrar disponibilidad y precios por habitación.
- Calcular automáticamente el total de la reserva.
- Gestionar reservas (confirmar, cancelar, check-in/out).
- Aprobar hoteles y ver estadísticas (admin).

## 4. Roles del sistema
| Rol | Qué hace |
|---|---|
| 👤 Turista | Busca, reserva, paga, cancela, califica |
| 🏨 Hotel | Publica habitaciones, gestiona reservas y ocupación |
| 🛡️ Admin | Aprueba hoteles, gestiona usuarios y reportes |

## 5. Nivel esperado (junior)
Este proyecto NO busca ser perfecto ni sobre-engineereado. Se espera:
- Código **claro y comentado** con notas simples de una línea.
- Estructura de carpetas ordenada.
- Cada interfaz programada **después** de escribir su historia de usuario.
- Documentar los avances en el CHANGELOG.

## 6. Metodología de trabajo (paso a paso)
Para cada interfaz, seguimos este orden académico:
1. **Redactar** su historia de usuario en `/historias-usuario/` (anticipando lo que se hará).
2. **Actualizar** el INDICE-HU.md con el estado.
3. **Programar** la interfaz con comentarios simples.
4. **Probar** contra los criterios de aceptación de la HU.
5. **Modificar** la base de datos si la interfaz lo requiere.
6. **Registrar** el avance en CHANGELOG.md.

> ⚠️ Regla de oro: ninguna interfaz se programa sin tener su historia de usuario escrita primero.

## 7. Fases del proyecto
| Fase | Entregable | Estado |
|---|---|---|
| Fase 1 | Maqueta funcional (HTML+CSS+JS) | 🟢 En progreso |
| Fase 2 | Backend (Node.js + Express) + MySQL real | ⚪ Pendiente |
| Fase 3 | Pruebas, despliegue y documentación final | ⚪ Pendiente |

## 8. Cálculos de negocio
| # | Cálculo | Fórmula |
|---|---|---|
| 1 | Noches | `salida − llegada` |
| 2 | Subtotal | `precio × noches` |
| 3 | IVA (15%) | `subtotal × 0.15` |
| 4 | Total | `subtotal + iva` |
| 5 | Disponibilidad | `total − ocupadas` |
| 6 | % Ocupación | `(ocupadas ÷ total) × 100` |
| 7 | Calificación promedio | `((calif × reseñas) + nueva) ÷ (reseñas + 1)` |
| 8 | Ingresos | `Σ totales no cancelados` |

## 9. Convención de comentarios en el código
Los comentarios deben ser **simples y de una línea**, explicando el "qué", no el "cómo".

✅ Correcto:
```javascript
// Calculamos el IVA agregando un 15% al subtotal
let iva = subtotal * 0.15;

// Sumamos subtotal + IVA para el total
let total = subtotal + iva;

// Verificamos que haya habitaciones disponibles
if (disponibles > 0) { ... }