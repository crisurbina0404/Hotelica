// ============================================================
// Hotelica — CP-050: validación de datos en la interfaz
// Auditoría automatizada de los formularios públicos: qué datos
// inválidos se rechazan con un mensaje claro y cuáles pasan de largo.
//
// Las seis últimas son regresiones de defectos que ya se corrigieron:
// fechas vacías o invertidas, cupos fuera de rango, correos sin dominio,
// discrepancias de nombre y de disponibilidad sin fechas. Si alguna
// vuelve a fallar, es una regresión real de la app.
// ============================================================
import { test, expect } from "@playwright/test";
import { sinRedExterna } from "./ayudas";

// Abre el buscador de la portada listo para escribir
async function abrirPortada(page: import("@playwright/test").Page) {
  sinRedExterna(page);
  await page.goto("/");
  return page.locator("main form").first();
}

// Adjunta la captura del momento exacto al informe HTML de Playwright:
// es la evidencia visual de lo que la app aceptó como válido
async function captura(page: import("@playwright/test").Page, nombre: string) {
  await test.info().attach(nombre, {
    body: await page.screenshot(),
    contentType: "image/png",
  });
}

// ---------- Lo que la interfaz ya valida bien ----------

test("el buscador exige un departamento antes de buscar", async ({ page }) => {
  const buscador = await abrirPortada(page);
  await buscador.getByRole("button", { name: "Buscar hoteles" }).click();

  await expect(page.getByRole("alert")).toContainText(
    "Selecciona un departamento para comenzar tu búsqueda."
  );
  await expect(page.getByRole("heading", { name: /Hoteles en/ })).toHaveCount(0);
});

test("el registro rechaza una contraseña sin número ni símbolo", async ({ page }) => {
  sinRedExterna(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Registrarse" }).first().click();

  const ventana = page.getByRole("dialog");
  await ventana.getByPlaceholder("Tu nombre").fill("Ana Pérez");
  await ventana.getByPlaceholder("turista@hotelica.ni").fill("ana@correo.com");
  // Ocho caracteres, minúsculas y números: solo le falta el símbolo
  await ventana.getByPlaceholder("Mínimo 8, con número y símbolo").fill("clave1234");
  await ventana.getByRole("button", { name: "Registrarse" }).click();

  await expect(ventana.getByRole("alert")).toContainText(
    "La contraseña debe incluir al menos un símbolo"
  );
});

test("la inscripción de hotel rechaza un teléfono de 3 dígitos", async ({ page }) => {
  sinRedExterna(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Registrar mi hotel" }).click();

  const ventana = page.getByRole("dialog");
  await ventana.getByLabel(/Teléfono/).fill("123");
  await ventana.getByRole("button", { name: "Finalizar solicitud" }).click();

  await expect(
    ventana.getByText("El teléfono debe tener exactamente 8 dígitos.")
  ).toBeVisible();
});

// ---------- Regresiones: fechas, cupos y correos inválidos ----------

test("CP-050.1 la búsqueda no avanza con la llegada vacía", async ({ page }) => {
  const buscador = await abrirPortada(page);

  await buscador.getByLabel(/Departamento/).selectOption("leon");
  await buscador.getByLabel("Llegada").fill("");
  await buscador.getByRole("button", { name: "Buscar hoteles" }).click();
  await captura(page, "050-1 resultado con la llegada vacía");

  // Debe quedarse en la portada con un aviso, no abrir resultados
  await expect(page.getByRole("alert")).toContainText(/fecha/i);
  await expect(page.getByText("Invalid Date")).toHaveCount(0);
});

test("CP-050.2 Explorar hoteles no acepta un rango de fechas invertido", async ({ page }) => {
  sinRedExterna(page);
  await page.goto("/");
  // El nombre también existe en el pie: el acceso de la barra es el de navegación
  await page.getByRole("navigation").getByRole("button", { name: "Explorar hoteles" }).click();

  const rapida = page.locator("main form").first();
  // La salida por defecto es hoy + 10 días: la llegada queda después
  await rapida.getByLabel("Fecha de llegada").fill("2026-12-01");
  await rapida.getByRole("button", { name: /Buscar/ }).click();
  await page.waitForTimeout(800); // deja correr el filtro, que va en vivo
  await captura(page, "050-2 rango de fechas invertido");

  await expect(page.getByRole("alert")).toContainText(/salida/i);
  // Y la lista no puede seguir afirmando disponibilidad con esas fechas
  await expect(page.getByText("Elegí tus fechas").first()).toBeVisible();
});

test("CP-050.3 Explorar hoteles no acepta más de 10 adultos", async ({ page }) => {
  sinRedExterna(page);
  await page.goto("/");
  await page.getByRole("navigation").getByRole("button", { name: "Explorar hoteles" }).click();

  const campo = page.getByRole("spinbutton", { name: "Adultos" });
  await campo.fill("99");
  await page.waitForTimeout(800);
  await captura(page, "050-3 adultos fuera del máximo");

  // El campo declara max=10: se acota al escribir y no queda con 99
  await expect(campo).toHaveValue("10");
  await expect(page.getByText(/99 huéspedes/)).toHaveCount(0);
});

test("CP-050.4 la ficha del hotel no afirma disponibilidad sin fechas", async ({ page }) => {
  sinRedExterna(page);
  await page.goto("/");
  await page.getByRole("navigation").getByRole("button", { name: "Explorar hoteles" }).click();
  await page.locator("main article").first().click();

  await page.locator('main input[type="date"]').first().fill("");
  await page.waitForTimeout(500);
  await captura(page, "050-4 ficha del hotel sin fechas");

  await expect(page.getByText(/\d+ disponibles/)).toHaveCount(0);
  await expect(page.getByText("Elegí tus fechas").first()).toBeVisible();
});

test("CP-050.5 recuperar contraseña revisa el formato del correo", async ({ page }) => {
  sinRedExterna(page);

  // Supabase responde como en la app real: acepta el pedido. Así el defecto
  // queda aislado del estado de la red (si fuese un error, taparía el problema)
  let pedidos = 0;
  await page.route("**/auth/v1/recover*", async (ruta) => {
    pedidos += 1;
    await ruta.fulfill({ status: 200, json: {} });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar sesión" }).first().click();
  await page.getByRole("button", { name: /Olvidaste tu contraseña/ }).click();
  // La ventana de acceso tarda en cerrarse y mientras tanto deja inerte el fondo
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const campo = page.getByPlaceholder("tu@email.com");
  await expect(campo).toBeVisible();
  await campo.fill("ana@correo");
  await expect(campo).toHaveValue("ana@correo");
  await page.getByRole("button", { name: "Enviar enlace de recuperación" }).click();
  await captura(page, "050-5 recuperación con correo sin dominio");

  // El formato se revisa acá, antes de pedir el correo
  await expect(
    page.getByText("Revisá tu correo: le falta el @ o el dominio.")
  ).toBeVisible();
  expect(pedidos).toBe(0);
});

test("CP-050.6 el registro no acepta un nombre sin letras", async ({ page }) => {
  sinRedExterna(page);

  // Contamos los envíos a Supabase: un nombre inválido no debería llegar allá
  let pedidos = 0;
  await page.route("**/auth/v1/signup*", async (ruta) => {
    pedidos += 1;
    await ruta.fulfill({ status: 422, json: { code: 422, msg: "invalid" } });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Registrarse" }).first().click();

  const ventana = page.getByRole("dialog");
  await ventana.getByPlaceholder("Tu nombre").fill("123");
  await ventana.getByPlaceholder("turista@hotelica.ni").fill("ana@correo.com");
  await ventana.getByPlaceholder("Mínimo 8, con número y símbolo").fill("Clave123!");
  await ventana.getByRole("button", { name: "Registrarse" }).click();
  await captura(page, "050-6 registro con nombre 123");

  await expect(ventana.getByRole("alert")).toContainText(/nombre real/i);
  expect(pedidos).toBe(0);
});
