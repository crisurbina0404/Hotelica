// ============================================================
// Hotelica — CP-005: cambiar la contraseña del hotelero (HU-005)
// El cambio pide la contraseña actual y no avisaba cuando se
// equivocaba: decía "actualizada" sin haber cambiado nada,
// porque la validación corría dentro del guardado y llegaba tarde
// ============================================================
import { test, expect } from "@playwright/test";
import { sinRedExterna, responderSupabase, nuevoControl } from "./ayudas";

const CLAVE = "hotelica-fase1-v2";

// Semilla completa con la cuenta del hotelero ya creada
function datosSemilla() {
  return {
    hoteles: [
      {
        id: "h-prueba",
        nombre: "Hotel Prueba",
        dueno: "Dueno Prueba",
        departamentoId: "leon",
        municipioId: "m-leon",
        direccion: "Calle 1",
        descripcion: "Hotel de prueba para el cambio de contraseña",
        imagen: "",
        galeria: [],
        amenidades: [],
        destacado: false,
        aprobado: "aprobado",
        rating: 0,
        totalResenas: 0,
        fechaRegistro: "2026-10-01",
      },
    ],
    habitaciones: [],
    reservas: [],
    resenas: [],
    favoritos: {},
    notificaciones: [],
    pagos: [],
    calificaciones: [],
    folio: 1,
    cuentasHotelero: [
      {
        correo: "dueno@prueba.com",
        contrasena: "secreta123",
        nombre: "Dueno Prueba",
        hotelId: "h-prueba",
        creadaEn: "2026-10-01T12:00:00.000Z",
        contrasenaTemporal: false,
      },
    ],
    usuarios: [],
  };
}

test("la contraseña del hotelero no cambia si la actual está mal (HU-005)", async ({ page }) => {
  const control = nuevoControl();
  sinRedExterna(page);
  responderSupabase(page, control);

  // El seed va incrustado en el texto del init script: pasar argumentos
  // fallaba en silencio con este documento (el título del hotel tiene acentos)
  await page.addInitScript(
    `(localStorage.setItem("hotelica-fase1-v2", '${JSON.stringify(datosSemilla()).replace(/'/g, "\\'")}'))`
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar sesión" }).first().click();
  await page.getByPlaceholder("turista@hotelica.ni").fill("dueno@prueba.com");
  await page.getByPlaceholder("Mínimo 6 caracteres").fill("secreta123");
  await page.getByPlaceholder("Mínimo 6 caracteres").press("Enter");

  // Entramos al perfil por el botón con el nombre del hotelero
  await page.locator("header").getByTitle("Mi perfil").click();
  await expect(page.getByText("Hotel Prueba")).toBeVisible();

  // Escenario: la contraseña actual está mal → aviso, sin cambio ni toast de éxito
  await page.getByLabel("Contraseña actual").fill("otra-cosa");
  await page.getByLabel("Nueva contraseña").fill("NuevaClave1!");
  await page.getByLabel("Confirmar contraseña").fill("NuevaClave1!");
  await page.getByRole("button", { name: "Cambiar contraseña" }).click();

  await expect(page.getByRole("alert")).toContainText("La contraseña actual no es correcta.");
  await expect(page.getByText("Contraseña actualizada correctamente.", { exact: true })).toHaveCount(0);

  const guardada = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}").cuentasHotelero?.[0]?.contrasena
  );
  expect(guardada).toBe("secreta123");

  // Escenario: con la contraseña actual correcta el cambio sí entra
  await page.getByLabel("Contraseña actual").fill("secreta123");
  await page.getByLabel("Nueva contraseña").fill("NuevaClave1!");
  await page.getByLabel("Confirmar contraseña").fill("NuevaClave1!");
  await page.getByRole("button", { name: "Cambiar contraseña" }).click();

  await expect(page.getByText("Contraseña actualizada correctamente.", { exact: true })).toBeVisible();
  await expect
    .poll(
      () =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}").cuentasHotelero?.[0]?.contrasena
        )
    )
    .toBe("NuevaClave1!");

  // Escenario final: la nueva contraseña sirve para volver a entrar
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.getByRole("button", { name: "Iniciar sesión" }).first().click();
  await page.getByPlaceholder("turista@hotelica.ni").fill("dueno@prueba.com");
  await page.getByPlaceholder("Mínimo 6 caracteres").fill("NuevaClave1!");
  await page.getByPlaceholder("Mínimo 6 caracteres").press("Enter");
  await expect(page.locator("header").getByTitle("Mi perfil")).toBeVisible();
});
