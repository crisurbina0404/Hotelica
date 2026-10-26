// ============================================================
// Hotelica — CP-033: activar o desactivar usuarios desde la consola
// Prueba los escenarios de la HU-033 entrando con login de
// administrador (HU-042) y simulando la tabla de usuarios
// ============================================================
import { test, expect, type Page } from "@playwright/test";
import { nuevoControl, sinRedExterna, responderSupabase, iniciarSesion } from "./ayudas";

// Filas que la app subió a la tabla de usuarios (activo = TRUE/FALSE)
type Subida = { correo: string; activo: boolean };

// Preparación común: red cortada, login de administrador y captura
// de lo que la consola sube a la tabla de usuarios
async function abrirConsola(page: Page) {
  const control = nuevoControl();
  const subidas: Subida[] = [];
  sinRedExterna(page);
  responderSupabase(page, control);
  // Se registra después de los cortes, así que atiende antes que ellos:
  // el GET devuelve vacío (manda la semilla local) y guardamos cada subida
  void page.route("**/rest/v1/usuarios*", (ruta) => {
    if (ruta.request().method() === "GET") return void ruta.fulfill({ json: [] });
    subidas.push(ruta.request().postDataJSON() as Subida);
    return void ruta.fulfill({ json: [] });
  });
  await page.goto("/");
  await iniciarSesion(page, "admin@hotelica.ni", "secreta123", control);
  await expect(page.getByText("Hoteles pendientes de aprobación (2)")).toBeVisible();
  return { control, subidas };
}

test("la consola lista los usuarios por rol y cambia su estado al instante", async ({ page }) => {
  const { subidas } = await abrirConsola(page);

  // Escenario 1: la sección de usuarios existe con el total de cuentas
  await expect(page.getByText("Usuarios de la plataforma (3)")).toBeVisible();

  // Escenario 2: cada cuenta con nombre, correo, rol y estado, y filtro por rol
  const jorge = page.locator("li").filter({ hasText: "jorge.pineda@hotelica.ni" });
  await expect(jorge).toContainText("Jorge Pineda");
  await expect(jorge).toContainText("Turista");
  await expect(jorge).toContainText("Activo");
  await page.getByRole("button", { name: "Turista (2)" }).click();
  await expect(jorge).toBeVisible();
  await expect(page.locator("li").filter({ hasText: "admin@hotelica.ni" })).toHaveCount(0);
  await page.getByRole("button", { name: "Todos (3)" }).click();

  // Escenario 7: la propia fila del admin no se puede desactivar
  const mia = page.locator("li").filter({ hasText: "admin@hotelica.ni" });
  await expect(mia).toContainText("tu cuenta");
  await expect(mia).toContainText("Solo lectura");
  await expect(mia.getByRole("button", { name: /Desactivar/ })).toHaveCount(0);

  // Escenarios 3, 5 y 6: desactivar a Jorge cambia la pastilla, el botón
  // y la base de datos (activo = FALSE) sin recargar la página
  await jorge.getByRole("button", { name: /Desactivar/ }).click();
  await expect(page.getByText(/Jorge Pineda desactivado/)).toBeVisible();
  await expect(jorge).toContainText("Desactivado");
  await expect(jorge.getByRole("button", { name: /Activar/ })).toBeVisible();
  await expect.poll(() => subidas.at(-1)).toMatchObject({ correo: "jorge.pineda@hotelica.ni", activo: false });
  const guardado = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
    return datos.usuarios?.find((u: { correo: string }) => u.correo === "jorge.pineda@hotelica.ni")?.activo;
  });
  expect(guardado).toBe(false);

  // Escenario 4: con el usuario ya desactivado no se ofrece desactivar de nuevo
  await expect(jorge.getByRole("button", { name: /Desactivar/ })).toHaveCount(0);

  // Se puede volver a activar, y la base recibe activo = TRUE
  await jorge.getByRole("button", { name: /Activar/ }).click();
  await expect(page.getByText(/Jorge Pineda activado/)).toBeVisible();
  await expect(jorge).toContainText("Activo");
  await expect.poll(() => subidas.at(-1)).toMatchObject({ correo: "jorge.pineda@hotelica.ni", activo: true });
});

test("una cuenta desactivada no puede iniciar sesión como turista", async ({ page }) => {
  await abrirConsola(page);

  // El admin desactiva a Jorge desde la consola
  const jorge = page.locator("li").filter({ hasText: "jorge.pineda@hotelica.ni" });
  await jorge.getByRole("button", { name: /Desactivar/ }).click();
  await expect(jorge).toContainText("Desactivado");

  // Jorge cierra la sesión del admin e intenta entrar con su cuenta
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  const control = nuevoControl();
  await iniciarSesion(page, "jorge.pineda@hotelica.ni", "secreta123", control);

  // Escenario 5 (HU-033): el acceso queda bloqueado con un aviso claro
  await expect(page.getByText(/cuenta está desactivada/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Consola admin" })).toHaveCount(0);
});

test("una cuenta de hotelero desactivada no puede entrar a su panel", async ({ page }) => {
  // Semilla con un hotel aprobado, su cuenta de hotelero y el usuario
  // de la plataforma ya desactivado por el administrador
  await page.addInitScript(() => {
    localStorage.setItem(
      "hotelica-fase1-v2",
      JSON.stringify({
        hoteles: [
          {
            id: "h-prueba",
            nombre: "Hotel Prueba",
            dueno: "Dueno Prueba",
            departamentoId: "leon",
            municipioId: "m-leon",
            direccion: "Calle 1",
            descripcion: "Hotel de prueba para la HU-033",
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
        habitaciones: [],
        usuarios: [
          { correo: "dueno@prueba.com", nombre: "Dueno Prueba", rol: "Hotel", activo: false, creadaEn: "2026-10-01T12:00:00.000Z" },
        ],
      })
    );
  });

  sinRedExterna(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar sesión" }).first().click();
  await page.getByPlaceholder("turista@hotelica.ni").fill("dueno@prueba.com");
  await page.getByPlaceholder("Mínimo 6 caracteres").fill("secreta123");
  await page.getByPlaceholder("Mínimo 6 caracteres").press("Enter");

  // Escenario 5 (HU-033): tampoco un hotelero desactivado puede entrar
  await expect(page.getByText(/cuenta está desactivada/)).toBeVisible();
});
