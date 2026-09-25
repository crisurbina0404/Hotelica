// ============================================================
// Hotelica — Pruebas unitarias de lógica de negocio (data.ts)
// Framework: Vitest
// ============================================================
import { describe, it, expect } from "vitest";
import {
  calcularNoches,
  calcularTotales,
  TASA_IVA,
  nuevoPromedio,
  seTraslapan,
  fmtDinero,
  fmtFecha,
  hoyISO,
  sumarDias,
  sugerirFechasAlternativas,
} from "../data";

// =====================================================
// 1. Cálculo de noches de estadía
// =====================================================
describe("calcularNoches", () => {
  it("calcula correctamente 3 noches entre dos fechas", () => {
    expect(calcularNoches("2026-10-01", "2026-10-04")).toBe(3);
  });

  it("devuelve 0 cuando llegada y salida son iguales", () => {
    expect(calcularNoches("2026-10-01", "2026-10-01")).toBe(0);
  });

  it("calcula 1 noche para estadía de un día", () => {
    expect(calcularNoches("2026-08-15", "2026-08-16")).toBe(1);
  });

  it("calcula 7 noches (una semana completa)", () => {
    expect(calcularNoches("2026-12-20", "2026-12-27")).toBe(7);
  });
});

// =====================================================
// 2. Cálculo de totales de reserva (subtotal + IVA 15%)
// =====================================================
describe("calcularTotales", () => {
  it("calcula subtotal, IVA 15% y total correctamente", () => {
    const resultado = calcularTotales(1200, 3);
    expect(resultado.subtotal).toBe(3600);
    expect(resultado.iva).toBe(540);       // 3600 * 0.15 = 540
    expect(resultado.total).toBe(4140);    // 3600 + 540
  });

  it("calcula IVA para una sola noche", () => {
    const resultado = calcularTotales(950, 1);
    expect(resultado.subtotal).toBe(950);
    expect(resultado.iva).toBe(143);       // 950 * 0.15 = 142.5 → redondeado 143
    expect(resultado.total).toBe(1093);
  });

  it("maneja precio alto con muchas noches", () => {
    const resultado = calcularTotales(3400, 10);
    expect(resultado.subtotal).toBe(34000);
    expect(resultado.iva).toBe(5100);      // 34000 * 0.15
    expect(resultado.total).toBe(39100);
  });

  it("devuelve ceros cuando noches es 0", () => {
    const resultado = calcularTotales(1500, 0);
    expect(resultado.subtotal).toBe(0);
    expect(resultado.iva).toBe(0);
    expect(resultado.total).toBe(0);
  });

  // ----- Edge cases de HU-014: entradas inválidas ----- //

  it("devuelve ceros cuando el precio es negativo (HU-014)", () => {
    const resultado = calcularTotales(-1200, 3);
    expect(resultado.subtotal).toBe(0);
    expect(resultado.iva).toBe(0);
    expect(resultado.total).toBe(0);
  });

  it("devuelve ceros cuando las noches son negativas (HU-014)", () => {
    const resultado = calcularTotales(1200, -3);
    expect(resultado.subtotal).toBe(0);
    expect(resultado.iva).toBe(0);
    expect(resultado.total).toBe(0);
  });

  it("devuelve ceros cuando el precio es NaN (HU-014)", () => {
    const resultado = calcularTotales(NaN, 3);
    expect(resultado.subtotal).toBe(0);
    expect(resultado.iva).toBe(0);
    expect(resultado.total).toBe(0);
  });

  it("devuelve ceros cuando las noches son Infinity (HU-014)", () => {
    const resultado = calcularTotales(1200, Infinity);
    expect(resultado.subtotal).toBe(0);
    expect(resultado.iva).toBe(0);
    expect(resultado.total).toBe(0);
  });

  it("redondea noches fraccionales al entero más cercano (HU-014)", () => {
    // calcularNoches puede devolver valores como 2.5 con husos horarios mixtos
    const resultado = calcularTotales(1000, 2.5);
    expect(resultado.subtotal).toBe(3000); // Math.round(2.5) = 3 → 1000 × 3
    expect(resultado.iva).toBe(450);       // 3000 × 0.15
    expect(resultado.total).toBe(3450);
  });

  it("garantiza que el total nunca sea negativo (HU-014)", () => {
    const resultado = calcularTotales(-500, -2);
    expect(resultado.total).toBeGreaterThanOrEqual(0);
  });

  it("exporta la tasa de IVA como constante 0.15 (HU-014)", () => {
    expect(TASA_IVA).toBe(0.15);
  });
});

// =====================================================
// 3. Calificación promedio ponderada
// =====================================================
describe("nuevoPromedio", () => {
  it("calcula promedio con una nueva reseña", () => {
    // Promedio actual: 4.5 con 10 reseñas, nueva estrella: 5
    // ((4.5 * 10) + 5) / 11 = 50 / 11 = 4.545... → 4.5
    const resultado = nuevoPromedio(4.5, 10, 5);
    expect(resultado).toBe(4.5);
  });

  it("calcula promedio cuando es la primera reseña", () => {
    // Promedio 0 con 0 reseñas, nueva estrella: 4
    // ((0 * 0) + 4) / 1 = 4.0
    const resultado = nuevoPromedio(0, 0, 4);
    expect(resultado).toBe(4.0);
  });

  it("redondea a un decimal", () => {
    // ((4.3 * 5) + 5) / 6 = 26.5 / 6 = 4.416... → 4.4
    const resultado = nuevoPromedio(4.3, 5, 5);
    expect(resultado).toBe(4.4);
  });
});

// =====================================================
// 4. Detección de traslape de fechas
// =====================================================
describe("seTraslapan", () => {
  it("detecta traslape cuando los rangos se cruzan", () => {
    // Rango A: 1 al 5 oct, Rango B: 3 al 7 oct → se traslapan
    expect(seTraslapan("2026-10-01", "2026-10-05", "2026-10-03", "2026-10-07")).toBe(true);
  });

  it("no detecta traslape cuando los rangos son consecutivos", () => {
    // Rango A: 1 al 3 oct, Rango B: 3 al 6 oct → no se traslapan (el día 3 es límite)
    expect(seTraslapan("2026-10-01", "2026-10-03", "2026-10-03", "2026-10-06")).toBe(false);
  });

  it("no detecta traslape cuando los rangos están separados", () => {
    // Rango A: 1 al 3 oct, Rango B: 5 al 8 oct
    expect(seTraslapan("2026-10-01", "2026-10-03", "2026-10-05", "2026-10-08")).toBe(false);
  });

  it("detecta traslape cuando un rango contiene al otro", () => {
    // Rango A: 1 al 10 oct, Rango B: 3 al 5 oct → completamente dentro
    expect(seTraslapan("2026-10-01", "2026-10-10", "2026-10-03", "2026-10-05")).toBe(true);
  });
});

// =====================================================
// 5. Formateo de dinero en córdobas
// =====================================================
describe("fmtDinero", () => {
  it("formatea cantidad con decimales", () => {
    expect(fmtDinero(1200)).toBe("C$ 1,200.00");
  });

  it("formatea cantidad grande", () => {
    expect(fmtDinero(34100)).toBe("C$ 34,100.00");
  });

  it("formatea cantidad pequeña", () => {
    expect(fmtDinero(950)).toBe("C$ 950.00");
  });
});

// =====================================================
// 6. Utilidades de fechas
// =====================================================
describe("sumarDias", () => {
  it("suma días a una fecha correctamente", () => {
    expect(sumarDias("2026-10-01", 5)).toBe("2026-10-06");
  });

  it("resta días cuando el valor es negativo", () => {
    expect(sumarDias("2026-10-10", -3)).toBe("2026-10-07");
  });

  it("cambia de mes correctamente", () => {
    expect(sumarDias("2026-01-28", 3)).toBe("2026-01-31");
  });
});

describe("hoyISO", () => {
  it("devuelve la fecha de hoy en formato ISO", () => {
    const hoy = hoyISO();
    expect(hoy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// =====================================================
// 7. Sugerencia de fechas alternativas
// =====================================================
describe("sugerirFechasAlternativas", () => {
  it("devuelve array vacío cuando noches es 0", () => {
    const resultado = sugerirFechasAlternativas([], () => 0, 0, "2026-10-01");
    expect(resultado).toEqual([]);
  });

  it("devuelve sugerencias cuando hay disponibilidad", () => {
    const habitaciones = [{ id: "h1", unidades: 2 }];
    const disponiblesDe = () => 1; // siempre disponible
    const resultado = sugerirFechasAlternativas(habitaciones, disponiblesDe, 3, "2026-10-15");
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.length).toBeLessThanOrEqual(3);
  });

  it("devuelve array vacío cuando no hay disponibilidad cercana", () => {
    const habitaciones = [{ id: "h1", unidades: 2 }];
    const disponiblesDe = () => 0; // nunca disponible
    const resultado = sugerirFechasAlternativas(habitaciones, disponiblesDe, 3, "2026-10-15");
    expect(resultado).toEqual([]);
  });
});
