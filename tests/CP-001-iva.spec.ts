// ============================================================
// Hotelica — Prueba E2E CP-001: subtotal, IVA 15% y total
// Flujo real: inicio → detalle del hotel → wizard de reserva
// Criterios BDD: HU-013 (crear reserva) y HU-014 (calcular IVA)
// ============================================================
import { test, expect } from "@playwright/test";

// Formatea una fecha local como yyyy-mm-dd (lo que esperan los inputs type="date")
function iso(d: Date): string {
  const mes = `${d.getMonth() + 1}`.padStart(2, "0");
  const dia = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

test("CP-001: Calcular total de reserva con IVA 15% (Caja Negra)", async ({ page }) => {
  // Fechas futuras libres: las reservas de demostración llegan hasta HOY+22
  const llegada = new Date();
  llegada.setDate(llegada.getDate() + 30);
  const salida = new Date();
  salida.setDate(salida.getDate() + 33); // 3 noches

  // 1. DADO QUE el turista entra al detalle de un hotel (Brisas del Pacífico)
  await page.goto("/");
  await page.locator('article:has(h3:text-is("Brisas del Pacífico"))').click();
  await expect(page.getByRole("heading", { level: 1, name: "Brisas del Pacífico" })).toBeVisible();

  // 2. CUANDO ingresa fechas válidas en el buscador del hotel
  await page.getByLabel("Llegada").fill(iso(llegada));
  await page.getByLabel("Salida").fill(iso(salida));

  // ... y elige la habitación "Estándar Mar" (C$ 1,400 por noche, hasta 2 huéspedes)
  const tarjetaHabitacion = page
    .locator("div.rounded-xl.border.bg-white.p-5")
    .filter({ has: page.getByRole("heading", { name: "Estándar Mar", exact: true }) });
  await tarjetaHabitacion.getByRole("button", { name: "Reservar" }).click();

  // 3. ENTONCES el resumen del wizard muestra el cálculo correcto en el DOM
  await expect(page.getByText("Estándar Mar · hasta 2 huéspedes")).toBeVisible();
  await expect(page.locator("p").filter({ hasText: /^Noches/ })).toContainText("3");
  await expect(page.locator("p").filter({ hasText: /^Subtotal/ })).toContainText("C$ 4,200.00");
  await expect(page.locator("p").filter({ hasText: /^IVA \(/ })).toContainText("C$ 630.00");
  await expect(page.locator("div.rounded-xl.bg-primary-deep")).toContainText("C$ 4,830.00");

  console.log("✅ Prueba de cálculo de IVA ejecutada exitosamente");
});
