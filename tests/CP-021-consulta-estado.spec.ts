// ============================================================
// Hotelica — CP-021: consulta pública de estado de la solicitud
// Un correo a medias terminaba en "no encontrado" sin decir qué
// faltaba: ahora el formato se revisa antes de buscar (HU-021)
// ============================================================
import { test, expect } from "@playwright/test";
import { sinRedExterna } from "./ayudas";

test("la consulta de estado revisa el formato del correo antes de buscar", async ({ page }) => {
  sinRedExterna(page);
  await page.goto("/");

  // Abrimos la inscripción pública, que trae la consulta de estado
  await page.getByRole("button", { name: "Registrar mi hotel" }).click();
  const consulta = page.getByLabel("Correo para consultar estado");

  // Un correo sin dominio no busca: avisa qué le falta
  await consulta.fill("a@b.c");
  await page.getByRole("button", { name: "Consultar" }).click();
  await expect(page.getByText(/Revisá el correo: falta el @ o el dominio/)).toBeVisible();

  // Con el formato correcto sí busca y responde con su resultado
  await consulta.fill("noexiste@hotelica.ni");
  await page.getByRole("button", { name: "Consultar" }).click();
  await expect(page.getByText(/No encontramos ninguna solicitud con ese correo/)).toBeVisible();
});
