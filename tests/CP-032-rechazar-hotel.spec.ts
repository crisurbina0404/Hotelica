// ============================================================
// Hotelica — CP-032: rechazar un hotel desde la consola de admin
// Prueba los 6 escenarios de la HU-032 entrando con login de
// administrador (HU-042) y con la base simulada
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

test("el admin rechaza una solicitud con motivo y el hotel queda registrado", async ({ page }) => {
  await abrirConsola(page);

  // Capturamos la fila que la app sube a la base, para ver que el motivo viaja
  let filaSubida: Record<string, unknown> | null = null;
  await page.route("**/rest/v1/hoteles*", async (ruta) => {
    const metodo = ruta.request().method();
    if (metodo === "POST" || metodo === "PATCH" || metodo === "PUT") {
      filaSubida = (await ruta.request().postDataJSON()) as Record<string, unknown>;
    }
    await ruta.fulfill({ status: 200, json: [] });
  });

  // Capturamos el correo de rechazo que la app manda a la Edge Function (HU-032)
  let correoEnviado: Record<string, unknown> | null = null;
  await page.route("**/functions/v1/enviar-rechazo-hotelero*", async (ruta) => {
    correoEnviado = (await ruta.request().postDataJSON()) as Record<string, unknown>;
    await ruta.fulfill({ status: 200, json: { message: "ok" } });
  });

  // Escenario 1: cada pendiente trae su botón de rechazo
  await expect(page.getByText("Hoteles pendientes de aprobación (2)")).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Mirador de Catarina/ }).getByRole("button", { name: /Rechazar/ })
  ).toBeVisible();

  // Escenario 2: abrimos el formulario y confirmamos sin motivo
  await page
    .getByRole("row", { name: /Mirador de Catarina/ })
    .getByRole("button", { name: /Rechazar/ })
    .click();
  const modal = page.getByRole("dialog");
  await expect(modal.getByText(/Rechazar "Mirador de Catarina"/)).toBeVisible();
  await modal.getByRole("button", { name: "Confirmar rechazo" }).click();

  // No se rechaza: pide el motivo y el hotel sigue pendiente
  await expect(modal.getByText(/Escribí el motivo del rechazo/)).toBeVisible();
  await expect(page.getByText("Hoteles pendientes de aprobación (2)")).toBeVisible();
  const siguePendiente = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
    return datos.hoteles?.find((h: { id: string }) => h.id === "h-masaya")?.aprobado;
  });
  expect(siguePendiente).toBe("pendiente");

  // Escribimos el motivo y confirmamos
  await modal.getByLabel("Motivo del rechazo").fill("Sin fotos y dirección incompleta");
  await modal.getByRole("button", { name: "Confirmar rechazo" }).click();

  // Escenario 4: aviso de confirmación con el nombre del hotel
  await expect(page.getByText(/"Mirador de Catarina" rechazado/)).toBeVisible();

  // Escenario 5: el correo automático salió al dueño con el hotel y el motivo
  await expect(page.getByText("Correo de rechazo enviado a roberto@miradordecatarina.com.")).toBeVisible();
  expect(correoEnviado?.dueno).toBe("Roberto López");
  expect(correoEnviado?.correo).toBe("roberto@miradordecatarina.com");
  expect(correoEnviado?.hotelNombre).toBe("Mirador de Catarina");
  expect(correoEnviado?.motivo).toBe("Sin fotos y dirección incompleta");

  // Escenario 3: salió de la bandeja, entró al historial como rechazado
  await expect(page.getByText("Hoteles pendientes de aprobación (1)")).toBeVisible();
  await expect(page.getByText("Hoteles ya revisados")).toBeVisible();
  await expect(page.getByRole("row", { name: /Posada Volcán Telica/ })).toBeVisible();

  // Escenario 6: el motivo queda registrado y visible en el historial
  await expect(page.getByText("Motivo: Sin fotos y dirección incompleta")).toBeVisible();
  // Escenario 4: la pastilla "Rechazado" acompaña al hotel en su tarjeta del historial
  const tarjetaHistorial = page
    .getByText("Motivo: Sin fotos y dirección incompleta")
    .locator("..")
    .locator("..")
    .locator("..");
  await expect(tarjetaHistorial.getByText("Rechazado", { exact: true })).toBeVisible();
  const guardado = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
    const hotel = datos.hoteles?.find((h: { id: string }) => h.id === "h-masaya");
    return { estado: hotel?.aprobado, motivo: hotel?.motivoRechazo };
  });
  expect(guardado.estado).toBe("rechazado");
  expect(guardado.motivo).toBe("Sin fotos y dirección incompleta");

  // Escenario 3: lo que subió a la base también trae el estado y el motivo
  expect(filaSubida?.aprobado).toBe("rechazado");
  expect(filaSubida?.motivo_rechazo).toBe("Sin fotos y dirección incompleta");

  // Escenario 5: el panel del hotel recibe el aviso con el motivo
  const aviso = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
    return datos.notificaciones?.[0]?.texto ?? "";
  });
  expect(aviso).toContain("Hotel rechazado por Hotelica: Sin fotos y dirección incompleta");

  // El hotel rechazado ya no ofrece el botón de rechazo (Escenario 1)
  await expect(page.getByRole("button", { name: /^Rechazar$/ })).toHaveCount(1);

  // Escenario 6: el dueño consulta su solicitud sin cuenta y ve el motivo
  await page.goto("/");
  await page.getByRole("button", { name: "Registrar mi hotel" }).click();
  const ventana = page.getByRole("dialog");
  await ventana.getByLabel("Correo para consultar estado").fill("roberto@miradordecatarina.com");
  await ventana.getByRole("button", { name: "Consultar" }).click();
  await expect(ventana.getByText(/fue Rechazada/)).toBeVisible();
  await expect(ventana.getByText("Motivo: Sin fotos y dirección incompleta")).toBeVisible();

  // Fila simulada de la base: primero sin motivo (la migración aún no corrió)
  // y después con motivo, para ver que en los dos casos no se pierde
  const filaDeLaBase = (motivoRechazo: string | null, nombre = "Mirador de Catarina (base)") => ({
    id: "h-masaya",
    nombre,
    dueno: "Roberto López",
    departamento_id: "masaya",
    municipio_id: "m-catarina",
    direccion: "Al lado de la iglesia",
    descripcion: "Vista al lago",
    imagen: "",
    galeria: [],
    amenidades: [],
    destacado: false,
    aprobado: "rechazado",
    rating: 0,
    total_resenas: 0,
    fecha_registro: "2026-10-01",
    correo_dueno: "roberto@miradordecatarina.com",
    contacto: null,
    ubicacion: null,
    motivo_rechazo: motivoRechazo,
  });

  await page.route("**/rest/v1/hoteles*", (ruta) => ruta.fulfill({ json: [filaDeLaBase(null)] }));
  // Habitaciones también debe responder: si queda cortada, la carga conjunta no termina
  await page.route("**/rest/v1/habitaciones*", (ruta) => ruta.fulfill({ json: [] }));
  await page.reload();
  // Esperamos a que el merge con la base termine (cambia el nombre que viene de ahí)
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
        return datos.hoteles?.find((h: { id: string }) => h.id === "h-masaya")?.nombre;
      })
    )
    .toBe("Mirador de Catarina (base)");
  const motivoTrasRecarga = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
    return datos.hoteles?.find((h: { id: string }) => h.id === "h-masaya")?.motivoRechazo;
  });
  expect(motivoTrasRecarga).toBe("Sin fotos y dirección incompleta");

  // Con la migración corrida, el motivo que trae la base manda sobre el local
  await page.route("**/rest/v1/hoteles*", (ruta) =>
    ruta.fulfill({ json: [filaDeLaBase("Falta foto desde la base", "Mirador de Catarina (migrada)")] })
  );
  await page.reload();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
        return datos.hoteles?.find((h: { id: string }) => h.id === "h-masaya")?.nombre;
      })
    )
    .toBe("Mirador de Catarina (migrada)");
  const motivoDeLaBase = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
    return datos.hoteles?.find((h: { id: string }) => h.id === "h-masaya")?.motivoRechazo;
  });
  expect(motivoDeLaBase).toBe("Falta foto desde la base");
});

test("un hotel incompleto muestra sus requisitos al rechazarlo", async ({ page }) => {
  // Dejamos una solicitud a medias: sin foto, con descripción corta,
  // sin pin en el mapa y sin correo del dueño
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

  // Escenario 2: el formulario lista lo que le falta al hotel
  await page
    .getByRole("row", { name: /Hotel Sin Datos/ })
    .getByRole("button", { name: /Rechazar/ })
    .click();
  const modal = page.getByRole("dialog");
  await expect(modal.getByText("Requisitos incumplidos")).toBeVisible();
  await expect(modal.getByText("la foto representativa")).toBeVisible();
  await expect(modal.getByText("el correo del dueño del hotel")).toBeVisible();

  // Escenario 2: sin motivo no se puede rechazar
  await modal.getByRole("button", { name: "Confirmar rechazo" }).click();
  await expect(modal.getByText(/Escribí el motivo del rechazo/)).toBeVisible();
  await expect(page.getByText("Hoteles pendientes de aprobación (1)")).toBeVisible();

  // Con motivo sí: el hotel queda rechazado en la app (Escenario 3)
  await modal.getByLabel("Motivo del rechazo").fill("Solicitud incompleta");
  await modal.getByRole("button", { name: "Confirmar rechazo" }).click();
  await expect(page.getByText(/"Hotel Sin Datos" rechazado/)).toBeVisible();
  // Escenario 5: sin correo del dueño no hay correo de rechazo que enviar
  await expect(page.getByText(/correo de rechazo/i)).toHaveCount(0);
  const estado = await page.evaluate(() => {
    const datos = JSON.parse(localStorage.getItem("hotelica-fase1-v2") ?? "{}");
    return datos.hoteles?.[0]?.aprobado;
  });
  expect(estado).toBe("rechazado");
});
