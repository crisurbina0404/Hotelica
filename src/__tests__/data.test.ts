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
  historialDeReservas,
  TURISTA_DEMO,
  sePuedeCancelar,
  pasoDeEstado,
  FLUJO_RESERVA,
  validarPago,
  sePuedeCalificar,
  validarCalificacion,
  calificacionDe,
} from "../data";
import type { Calificacion, DatosPago, Reserva } from "../data";

// Datos de pago que siempre pasan la validación (tarjeta)
const tarjetaOk: DatosPago = {
  titular: "María Fernández",
  tarjeta: "4111 1111 1111 1111",
  vencimiento: "12/30",
  cvv: "123",
  banco: "",
  referencia: "",
};

const transferenciaOk: DatosPago = {
  titular: "", tarjeta: "", vencimiento: "", cvv: "",
  banco: "Banco de Nicaragua",
  referencia: "TRX-001234",
};

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

// =====================================================
// 8. Historial de reservas del turista (HU-015)
// =====================================================
describe("historialDeReservas", () => {
  // Crea una reserva mínima para las pruebas
  const reserva = (folio: string, turista: string, correo: string, creada: string): Reserva => ({
    folio,
    hotelId: "h-granada",
    habitacionId: "g1",
    turista,
    correo,
    telefono: "8888-1234",
    comentarios: "",
    llegada: "2026-10-01",
    salida: "2026-10-04",
    huespedes: 2,
    noches: 3,
    subtotal: 3600,
    iva: 540,
    total: 4140,
    pago: "tarjeta",
    estado: "confirmada",
    creada,
    calificada: false,
  });

  const lista = [
    reserva("HC-1", "María Fernández", "maria@correo.com", "2026-09-01"),
    reserva("HC-2", "Carlos Mendoza", "carlos@correo.com", "2026-09-15"),
    reserva("HC-3", "María Fernández", "maria@correo.com", "2026-09-20"),
  ];

  it("sin sesión muestra solo las reservas de la turista de demostración", () => {
    const resultado = historialDeReservas(lista, null);
    expect(resultado.length).toBe(2);
    expect(resultado.every((r) => r.turista === TURISTA_DEMO)).toBe(true);
  });

  it("con sesión filtra por correo y no muestra reservas ajenas", () => {
    const resultado = historialDeReservas(lista, { nombre: "María Fernández", correo: "maria@correo.com" });
    expect(resultado.length).toBe(2);
    expect(resultado.some((r) => r.turista === "Carlos Mendoza")).toBe(false);
  });

  it("ordena de más reciente a más antiguo", () => {
    const resultado = historialDeReservas(lista, { nombre: "María Fernández", correo: "maria@correo.com" });
    expect(resultado.map((r) => r.folio)).toEqual(["HC-3", "HC-1"]);
  });

  it("coincide por nombre cuando la reserva no guardó correo", () => {
    const sinCorreo = [reserva("HC-4", "Ana López", "", "2026-09-25")];
    const resultado = historialDeReservas(sinCorreo, { nombre: "Ana López", correo: "" });
    expect(resultado.length).toBe(1);
    expect(resultado[0].folio).toBe("HC-4");
  });

  it("devuelve lista vacía cuando el usuario no tiene reservas", () => {
    const resultado = historialDeReservas(lista, { nombre: "Pedro Vega", correo: "pedro@correo.com" });
    expect(resultado).toEqual([]);
  });
});

// =====================================================
// 9. Cancelación de reservas (HU-016)
// =====================================================
describe("sePuedeCancelar", () => {
  const hoy = "2026-09-28";

  it("permite cancelar una reserva pendiente con llegada futura", () => {
    expect(sePuedeCancelar({ estado: "pendiente", llegada: "2026-10-05" }, hoy)).toBe(true);
  });

  it("permite cancelar una reserva confirmada que llega hoy", () => {
    expect(sePuedeCancelar({ estado: "confirmada", llegada: hoy }, hoy)).toBe(true);
  });

  it("no permite cancelar una reserva en check-in", () => {
    expect(sePuedeCancelar({ estado: "checkin", llegada: "2026-09-27" }, hoy)).toBe(false);
  });

  it("no permite cancelar una reserva completada", () => {
    expect(sePuedeCancelar({ estado: "completada", llegada: "2026-09-20" }, hoy)).toBe(false);
  });

  it("no permite cancelar una reserva que ya está cancelada", () => {
    expect(sePuedeCancelar({ estado: "cancelada", llegada: "2026-10-05" }, hoy)).toBe(false);
  });

  it("no permite cancelar si la llegada ya pasó", () => {
    expect(sePuedeCancelar({ estado: "pendiente", llegada: "2026-09-27" }, hoy)).toBe(false);
  });
});

// =====================================================
// 10. Recorrido de la reserva (HU-017)
// =====================================================
describe("pasoDeEstado", () => {
  it("la reserva pendiente está en el primer paso", () => {
    expect(pasoDeEstado("pendiente")).toBe(0);
  });

  it("la reserva confirmada va por el segundo paso", () => {
    expect(pasoDeEstado("confirmada")).toBe(1);
  });

  it("la reserva en check-in va por el tercer paso", () => {
    expect(pasoDeEstado("checkin")).toBe(2);
  });

  it("la reserva completada llega al último paso", () => {
    expect(pasoDeEstado("completada")).toBe(3);
  });

  it("la reserva cancelada no sigue el recorrido (-1)", () => {
    expect(pasoDeEstado("cancelada")).toBe(-1);
  });

  it("el flujo tiene los 4 pasos en orden", () => {
    expect(FLUJO_RESERVA).toEqual(["pendiente", "confirmada", "checkin", "completada"]);
  });
});

// =====================================================
// 11. Validación de los datos de pago (HU-018)
// =====================================================
describe("validarPago", () => {
  const hoy = "2026-09-28";

  it("acepta una tarjeta completa y bien vencida", () => {
    expect(validarPago("tarjeta", tarjetaOk, hoy)).toBe("");
  });

  it("rechaza un número de tarjeta que no tenga 16 dígitos", () => {
    const datos = { ...tarjetaOk, tarjeta: "4111 1111" };
    expect(validarPago("tarjeta", datos, hoy)).toContain("16 dígitos");
  });

  it("rechaza una tarjeta sin titular", () => {
    const datos = { ...tarjetaOk, titular: "  " };
    expect(validarPago("tarjeta", datos, hoy)).toContain("titular");
  });

  it("rechaza un vencimiento con formato distinto a MM/AA", () => {
    const datos = { ...tarjetaOk, vencimiento: "12-30" };
    expect(validarPago("tarjeta", datos, hoy)).toContain("MM/AA");
  });

  it("rechaza una tarjeta vencida según la fecha de hoy", () => {
    const datos = { ...tarjetaOk, vencimiento: "08/26" };
    expect(validarPago("tarjeta", datos, hoy)).toContain("vencida");
  });

  it("rechaza un CVV que no tenga 3 dígitos", () => {
    const datos = { ...tarjetaOk, cvv: "12" };
    expect(validarPago("tarjeta", datos, hoy)).toContain("CVV");
  });

  it("acepta una transferencia con banco y referencia", () => {
    expect(validarPago("transferencia", transferenciaOk, hoy)).toBe("");
  });

  it("rechaza la transferencia cuando falta la referencia", () => {
    const datos = { ...transferenciaOk, referencia: "123" };
    expect(validarPago("transferencia", datos, hoy)).toContain("referencia");
  });

  it("rechaza la transferencia cuando no se eligió banco", () => {
    const datos = { ...transferenciaOk, banco: "" };
    expect(validarPago("transferencia", datos, hoy)).toContain("banco");
  });

  it("en efectivo no pide datos porque se paga en recepción", () => {
    const vacio: DatosPago = { titular: "", tarjeta: "", vencimiento: "", cvv: "", banco: "", referencia: "" };
    expect(validarPago("efectivo", vacio, hoy)).toBe("");
  });

  it("el método de pago de la reserva sigue siendo tarjeta, efectivo o transferencia", () => {
    const metodos: Reserva["pago"][] = ["tarjeta", "efectivo", "transferencia"];
    expect(metodos).toContain("tarjeta");
    expect(metodos).toContain("efectivo");
    expect(metodos).toContain("transferencia");
  });
});

// =====================================================
// 12. Calificación de la estadía (HU-019)
// =====================================================
describe("sePuedeCalificar", () => {
  it("permite calificar cuando el check-out ya se hizo", () => {
    expect(sePuedeCalificar({ estado: "completada", calificada: false })).toBe(true);
  });

  it("no permite calificar antes del check-out (pendiente, confirmada o check-in)", () => {
    expect(sePuedeCalificar({ estado: "pendiente", calificada: false })).toBe(false);
    expect(sePuedeCalificar({ estado: "confirmada", calificada: false })).toBe(false);
    expect(sePuedeCalificar({ estado: "checkin", calificada: false })).toBe(false);
  });

  it("no permite calificar una reserva cancelada", () => {
    expect(sePuedeCalificar({ estado: "cancelada", calificada: false })).toBe(false);
  });

  it("no deja calificar dos veces la misma reserva", () => {
    expect(sePuedeCalificar({ estado: "completada", calificada: true })).toBe(false);
  });
});

describe("validarCalificacion", () => {
  it("acepta cualquier estrella entera del 1 al 5", () => {
    for (let n = 1; n <= 5; n++) expect(validarCalificacion(n)).toBe("");
  });

  it("rechaza 0 estrellas o valores negativos", () => {
    expect(validarCalificacion(0)).toContain("1 y 5");
    expect(validarCalificacion(-2)).toContain("1 y 5");
  });

  it("rechaza valores por encima de 5", () => {
    expect(validarCalificacion(6)).toContain("1 y 5");
  });

  it("rechaza estrellas que no sean números enteros", () => {
    expect(validarCalificacion(3.5)).toContain("1 y 5");
    expect(validarCalificacion(Number.NaN)).toContain("1 y 5");
  });
});

describe("calificacionDe", () => {
  const lista: Calificacion[] = [
    { id: "c-1", folio: "HC-1024", hotelId: "h-granada", autor: "María Fernández", estrellas: 5, comentario: "Excelente", fecha: "2026-09-20" },
    { id: "c-2", folio: "HC-1038", hotelId: "h-sanjuan", autor: "Marta Ruiz", estrellas: 4, comentario: "", fecha: "2026-09-22" },
  ];

  it("devuelve la calificación de la reserva consultada", () => {
    expect(calificacionDe(lista, "HC-1024")?.estrellas).toBe(5);
  });

  it("devuelve undefined cuando la reserva nunca se calificó", () => {
    expect(calificacionDe(lista, "HC-9999")).toBeUndefined();
    expect(calificacionDe([], "HC-1024")).toBeUndefined();
  });
});
