// ============================================================
// Hotelica — Prueba E2E CP-002: inscribir un hotel
// Flujo real: inicio → sección "Inscribe tu hotel" → solicitud
// Criterios BDD: HU-021 (inscripción pública de un hotel)
// ============================================================
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// PNG chiquito de 1x1 píxel para simular la foto del hotel
const FOTO_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

// Baja hasta la sección pública de inscripción (sin necesidad de cuenta)
async function irAInscripcion(page: Page) {
  await page.goto("/");
  const seccion = page.locator('section[aria-label="Inscribir un hotel"]');
  await seccion.scrollIntoViewIfNeeded();
  await expect(seccion).toBeVisible();
}

test("CP-002a: El formulario exige todos los campos obligatorios (HU-021)", async ({ page }) => {
  await irAInscripcion(page);

  const seccion = page.locator('section[aria-label="Inscribir un hotel"]');

  // DADO QUE el formulario está vacío y sin cuenta de usuario
  // CUANDO pulsa "Enviar solicitud"
  await seccion.getByRole("button", { name: "Enviar solicitud" }).click();

  // ENTONCES marca los campos obligatorios y no envía nada
  await expect(seccion.getByText("Tu nombre es obligatorio: sos el dueño del hotel.")).toBeVisible();
  await expect(seccion.getByText("El correo es obligatorio: ahí recibirás tu cuenta de hotelero.")).toBeVisible();
  await expect(seccion.getByText("El nombre del hotel es obligatorio.")).toBeVisible();
  await expect(seccion.getByText("Seleccioná el departamento donde queda el hotel.")).toBeVisible();
  await expect(seccion.getByText("Seleccioná el municipio.")).toBeVisible();
  await expect(seccion.getByText("La dirección es obligatoria.")).toBeVisible();
  await expect(seccion.getByText("La descripción es obligatoria.")).toBeVisible();
  await expect(seccion.getByText("Cargá al menos una imagen representativa del hotel.")).toBeVisible();
  await expect(seccion.getByText("Solicitud enviada")).toHaveCount(0);

  // CUANDO deja un correo con formato inválido
  await seccion.getByLabel("Tu correo").fill("no-es-un-correo");
  await seccion.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(seccion.getByText("Ingresá un correo válido, por ejemplo: dueño@tuhotel.com")).toBeVisible();

  // CUANDO sube un archivo que no es imagen
  await seccion.locator('input[type="file"]').setInputFiles({
    name: "notas.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("esto no es una foto"),
  });
  await expect(seccion.getByText("El archivo tiene que ser una imagen (JPG, PNG o WEBP).")).toBeVisible();

  // ENTONCES nunca aparece el aviso de éxito
  await expect(seccion.getByText("Tu hotel será revisado por un administrador")).toHaveCount(0);
});

test("CP-002b: Inscribe el hotel con foto y queda Pendiente, sin verse en búsquedas (HU-021)", async ({ page }) => {
  await irAInscripcion(page);

  const seccion = page.locator('section[aria-label="Inscribir un hotel"]');

  // DADO QUE el hotelero completa todos los campos sin tener cuenta
  await seccion.getByLabel("Tu nombre (dueño)").fill("María Fernández López");
  await seccion.getByLabel("Tu correo").fill("maria@playaescondida.test");
  await seccion.getByLabel("Nombre del hotel").fill("Hotel Playa Escondida");
  await seccion.getByLabel("Departamento").selectOption("rivas");
  await seccion.getByLabel("Municipio").selectOption("m-sanjuan");
  await seccion.getByLabel("Dirección").fill("Frente al malecón de San Juan del Sur, costado sur");
  await seccion.getByLabel("Teléfono (opcional)").fill("8888-8888");
  await seccion
    .getByLabel("Descripción")
    .fill("Hotel familiar a pasos de la playa con terraza frente al mar, desayuno nicaragüense incluido y tours de surf para todos los niveles.");

  // CUANDO carga la imagen representativa y envía
  await seccion.locator('input[type="file"]').setInputFiles({
    name: "playa.png",
    mimeType: "image/png",
    buffer: FOTO_PNG,
  });
  await expect(seccion.locator('img[alt="Vista previa de la imagen representativa"]')).toBeVisible();

  await seccion.getByRole("button", { name: "Enviar solicitud" }).click();

  // ENTONCES la solicitud queda enviada con estado Pendiente y el aviso de revisión
  await expect(seccion.getByText("Hotel Playa Escondida")).toBeVisible();
  await expect(seccion.getByText("Solicitud enviada")).toBeVisible();
  await expect(seccion.getByText("Pendiente", { exact: true })).toBeVisible();
  await expect(seccion.getByText(/Tu hotel será revisado por un administrador/)).toBeVisible();
  await expect(seccion.getByText(/maria@playaescondida\.test/)).toBeVisible();

  // ENTONCES el hotel aprobado sigue apareciendo y el nuevo no (búsqueda de turista)
  await page.goto("/");
  await page.getByLabel("Departamento").selectOption("rivas");
  await page.getByRole("button", { name: "Buscar hoteles" }).click();
  await expect(page.getByRole("heading", { name: "Brisas del Pacífico" })).toBeVisible();
  await expect(page.getByText("Hotel Playa Escondida")).toHaveCount(0);
});
