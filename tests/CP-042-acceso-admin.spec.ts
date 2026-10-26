// ============================================================
// Hotelica — CP-042: acceso de administrador con cuenta real
// Prueba que la consola ya no se abre con el demo ni con un rol
// escrito a mano en el navegador (HU-042)
// ============================================================
import { test, expect } from "@playwright/test";
import { nuevoControl, sinRedExterna, responderSupabase, iniciarSesion } from "./ayudas";

test("el botón Demo desapareció y el rol escrito a mano no abre la consola", async ({ page }) => {
  sinRedExterna(page);
  await page.goto("/");

  // Escenario 1: ya no existe el botón de demostración
  await expect(page.getByRole("button", { name: /Demo admin/ })).toHaveCount(0);

  // Alguien fuerza el rol de admin en el navegador y recarga
  await page.evaluate(() => {
    localStorage.setItem("hotelica-rol", "admin");
    localStorage.setItem(
      "hotelica-usuario",
      JSON.stringify({ nombre: "Curioso", rol: "Admin", correo: "curioso@hotelica.ni", telefono: "", direccion: "" })
    );
  });
  await page.reload();

  // Seguro sin sesión: no aparece la consola ni su enlace
  await expect(page.getByRole("button", { name: /Demo admin/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Consola admin" })).toHaveCount(0);
});

test("solo un correo de administrador entra a la consola y al cerrar sesión se sale", async ({ page }) => {
  const control = nuevoControl();
  sinRedExterna(page);
  responderSupabase(page, control);

  await page.goto("/");
  await iniciarSesion(page, "admin@hotelica.ni", "secreta123", control);

  // Escenario 2: el login lo reconoce como admin y lo deja en la consola
  await expect(page.getByText("Hoteles pendientes de aprobación (2)")).toBeVisible();
  await expect(page.getByRole("button", { name: "Consola admin" })).toBeVisible();
  await expect(page.getByText(/Bienvenido, admin/)).toBeVisible();

  // Escenario 5: cerrar sesión borra el acceso a la consola
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("button", { name: "Consola admin" })).toHaveCount(0);
  await expect(page.getByText("Hoteles pendientes de aprobación")).toHaveCount(0);
});

test("un turista que inicia sesión nunca ve la consola", async ({ page }) => {
  const control = nuevoControl();
  control.correosAdmin = []; // nadie de la lista es administrador
  sinRedExterna(page);
  responderSupabase(page, control);

  await page.goto("/");
  await iniciarSesion(page, "ana@hotelica.ni", "secreta123", control);

  // Escenario 3: entra como turista y no aparece la consola
  await expect(page.getByText(/Bienvenido, ana/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Consola admin" })).toHaveCount(0);
  await expect(page.getByText("Hoteles pendientes de aprobación")).toHaveCount(0);
});

test("si el correo sale de la lista, al recargar vuelve a turista", async ({ page }) => {
  const control = nuevoControl();
  sinRedExterna(page);
  responderSupabase(page, control);

  await page.goto("/");
  await iniciarSesion(page, "admin@hotelica.ni", "secreta123", control);
  await expect(page.getByRole("button", { name: "Consola admin" })).toBeVisible();

  // Escenario 4: alguien lo saca de administradores y él recarga
  control.correosAdmin = [];
  await page.reload();

  await expect(page.getByRole("button", { name: "Consola admin" })).toHaveCount(0);
  await expect(page.getByText("Hoteles pendientes de aprobación")).toHaveCount(0);
});
