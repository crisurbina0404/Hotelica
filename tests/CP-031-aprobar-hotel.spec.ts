// ============================================================
// Hotelica — CP-031: aprobar un hotel desde la consola de admin
// Prueba los 6 escenarios de la HU-031 entrando con login de
// administrador (HU-042) y con la base y el correo simulados
// ============================================================
import { test, expect, type Page } from "@playwright/test";
import { nuevoControl, sinRedExterna, responderSupabase, iniciarSesion } from "./ayudas";

// Preparación común: red cortada y login de administrador hasta la consola
async function abrirConsola(page: Page) {
  const control = nuevoControl();
  sinRedExterna(page);
  responderSupabase(page, control);
  await page.goto("/");
  // El login de administrador entra directo a la consola (HU-042)
  await iniciarSesion(page, "admin@hotelica.ni", "secreta123", control);
}

test("el admin aprueba los hoteles pendientes y la bandeja queda al día", async ({ page }) => {
  await abrirConsola(page);

  // Escenario 1: la bandeja lista las solicitudes esperando aprobación
  await expect(page.getByText("Hoteles pendientes de aprobación (2)")).toBeVisible();
  await expect(page.getByRole("row", { name: /Mirador de Catarina/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Posada Volcán Telica/ })).toBeVisible();

  // Escenario 2: aprobamos la primera solicitud con su botón
  await page
    .getByRole("row", { name: /Mirador de Catarina/ })
    .getByRole("button", { name: /Aprobar/ })
    .click();

  // Escenario 5: aviso de la acción y modal con las credenciales nuevas
  await expect(page.getByText(/"Mirador de Catarina" aprobado/)).toBeVisible();
  const modal = page.getByRole("dialog");
  await expect(modal.getByText("Cuenta de hotelero creada")).toBeVisible();
  await expect(modal.getByText("roberto@miradordecatarina.com").first()).toBeVisible();

  // Escenario 6: sin Supabase el correo no se manda y avisa el error,
  // dejando las credenciales a la vista para copiarlas a mano
  await expect(page.getByText(/No se pudo enviar el correo/)).toBeVisible();
  await modal.getByRole("button", { name: "Entendido" }).click();

  // Escenario 4: salió de la bandeja, entró al historial y quedó guardado
  await expect(page.getByText("Hoteles pendientes de aprobación (1)")).toBeVisible();
  await expect(page.getByText("Hoteles ya revisados")).toBeVisible();
  // esperamos que se apaguen los avisos para buscar el hotel solo en el historial
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.locator("p").filter({ hasText: "Mirador de Catarina" })).toBeVisible();
  const guardado = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
    return datos.hoteles?.find((h: { id: string }) => h.id === "h-masaya")?.aprobado;
  });
  expect(guardado).toBe("aprobado");

  // Aprobamos el segundo y la bandeja se queda sin solicitudes
  await page
    .getByRole("row", { name: /Posada Volcán Telica/ })
    .getByRole("button", { name: /Aprobar/ })
    .click();
  await expect(page.getByText(/"Posada Volcán Telica" aprobado/)).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Entendido" }).click();

  // Estado vacío: ya no hay nada por aprobar ni botón de aprobación
  await expect(page.getByText("Bandeja al día")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Aprobar$/ })).toHaveCount(0);
});

test("un hotel incompleto no se aprueba y se lista lo que le falta", async ({ page }) => {
  // Dejamos una solicitud a medias: sin foto, sin descripción,
  // con una dirección mínima, sin pin en el mapa y sin correo del dueño
  await page.addInitScript(() => {
    localStorage.setItem(
      "hotelica-fase1-v2",
      JSON.stringify({
        hoteles: [
          {
            id: "h-incompleto",
            nombre: "Hotel Sin Datos",
            dueno: "Carlos Prueba",
            departamentoId: "leon",
            municipioId: "m-leon",
            direccion: "Calle 1",
            descripcion: "Corto",
            imagen: "",
            galeria: [],
            amenidades: [],
            destacado: false,
            aprobado: "pendiente",
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
        cuentasHotelero: [],
        habitaciones: [],
      })
    );
  });

  await abrirConsola(page);
  await expect(page.getByText("Hoteles pendientes de aprobación (1)")).toBeVisible();

  // Escenario 3: intentamos aprobar igual
  await page
    .getByRole("row", { name: /Hotel Sin Datos/ })
    .getByRole("button", { name: /Aprobar/ })
    .click();

  // No se aprueba: dice qué falta y el hotel sigue pendiente
  await expect(page.getByText(/no se puede aprobar todavía/)).toBeVisible();
  await expect(page.getByText(/Falta: .*la foto representativa/)).toBeVisible();
  await expect(page.getByText(/el correo del dueño del hotel/)).toBeVisible();
  await expect(page.getByText("Hoteles pendientes de aprobación (1)")).toBeVisible();

  const estado = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
    return datos.hoteles?.[0]?.aprobado;
  });
  expect(estado).toBe("pendiente");
});
