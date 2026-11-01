// ============================================================
// Hotelica — CP-026 a CP-030: panel del hotel
// Reservas recibidas, confirmar/rechazar, check-in, check-out,
// habitaciones y precios. Todo corre contra el estado local
// sembrado en localStorage: no toca Supabase ni manda correos.
// ============================================================
import { test, expect, type Page } from "@playwright/test";
import { sinRedExterna, responderSupabase, nuevoControl, type Control } from "./ayudas";

const CLAVE = "hotelica-fase1-v2";
const CORREO = "dueno@prueba.com";

// Fechas relativas: el check-in solo se habilita el día de llegada
const iso = (d: Date) => d.toISOString().slice(0, 10);
const hoy = iso(new Date());
const enDias = (n: number) => iso(new Date(Date.now() + n * 86_400_000));

const HABITACION = {
  id: "hab-1",
  hotelId: "h-prueba",
  tipo: "Estándar Doble",
  capacidad: 2,
  precio: 1000,
  unidades: 2,
  estado: "disponible",
  detalle: "Cama doble, baño privado y agua caliente todo el día.",
  galeria: [],
};

function reserva(extra: Record<string, unknown>) {
  return {
    folio: "HTL-1001",
    hotelId: "h-prueba",
    habitacionId: "hab-1",
    turista: "Ana Pérez",
    correo: "ana@correo.com",
    telefono: "88881234",
    comentarios: "",
    llegada: hoy,
    salida: enDias(2),
    huespedes: 2,
    noches: 2,
    subtotal: 2000,
    iva: 300,
    total: 2300,
    pago: "tarjeta",
    estado: "pendiente",
    creada: hoy,
    calificada: false,
    ...extra,
  };
}

function datosSemilla(reservas: Record<string, unknown>[], habitaciones = [HABITACION]) {
  return {
    hoteles: [
      {
        id: "h-prueba",
        nombre: "Hotel Prueba",
        dueno: "Dueño Prueba",
        correoDueno: CORREO,
        departamentoId: "leon",
        municipioId: "m-leon",
        direccion: "Calle 1 frente al parque central",
        descripcion: "Hotel de prueba con patio, desayuno incluido y vista al volcán.",
        imagen: "",
        galeria: [],
        amenidades: ["wifi"],
        destacado: false,
        aprobado: "aprobado",
        rating: 0,
        totalResenas: 0,
        fechaRegistro: "2026-10-01",
        contacto: "88881234",
      },
    ],
    habitaciones,
    reservas,
    resenas: [],
    favoritos: {},
    notificaciones: [],
    pagos: [],
    calificaciones: [],
    folio: 1002,
    cuentasHotelero: [
      {
        correo: CORREO,
        contrasena: "secreta123",
        nombre: "Dueño Prueba",
        hotelId: "h-prueba",
        creadaEn: "2026-10-01T12:00:00.000Z",
        contrasenaTemporal: false,
      },
    ],
    usuarios: [],
  };
}

// Siembra el estado y entra al panel con la cuenta del hotelero
async function abrirPanel(page: Page, reservas: Record<string, unknown>[], habitaciones = [HABITACION]) {
  const control: Control = nuevoControl();
  sinRedExterna(page);
  responderSupabase(page, control);

  await page.addInitScript(
    `(localStorage.setItem("${CLAVE}", '${JSON.stringify(datosSemilla(reservas, habitaciones)).replace(/'/g, "\\'")}'))`
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar sesión" }).first().click();
  await page.getByPlaceholder("turista@hotelica.ni").fill(CORREO);
  await page.getByPlaceholder("Mínimo 6 caracteres").fill("secreta123");
  await page.getByPlaceholder("Mínimo 6 caracteres").press("Enter");

  await page.locator("header").getByText("Panel del hotel").click();
  await expect(page.getByRole("heading", { name: "Gestión de reservas" })).toBeVisible();
}

// Estado guardado en localStorage, para comprobar que el cambio persistió
function guardado(page: Page) {
  return page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) ?? "{}"), CLAVE);
}

test("HU-026/029: el hotelero confirma, hace check-in y check-out de una reserva", async ({ page }) => {
  await abrirPanel(page, [reserva({})]);

  const fila = page.getByRole("row").filter({ hasText: "HTL-1001" });
  await expect(fila).toContainText("Ana Pérez");
  await expect(fila).toContainText("Pendiente");

  // Pendiente → Confirmada
  await fila.getByRole("button", { name: "Confirmar" }).click();
  await expect(fila.getByText("Confirmada")).toBeVisible();
  await expect.poll(async () => (await guardado(page)).reservas[0].estado).toBe("confirmada");

  // Confirmada con llegada hoy → Check-in habilitado
  await fila.getByRole("button", { name: "Check-in" }).click();
  await expect(fila.getByText("Entrada")).toBeVisible();
  await expect.poll(async () => (await guardado(page)).reservas[0].estado).toBe("checkin");

  // En estadía → Check-out y factura
  const descarga = page.waitForEvent("download");
  await fila.getByRole("button", { name: "Check-out" }).click();
  await descarga;
  await expect(fila.getByText("Completada")).toBeVisible();
  await expect(fila.getByText("Salida")).toBeVisible();
  await expect.poll(async () => (await guardado(page)).reservas[0].estado).toBe("completada");
});

test("HU-027: el check-in espera al día de llegada y el rechazo exige motivo", async ({ page }) => {
  await abrirPanel(page, [
    reserva({ folio: "HTL-2001", llegada: enDias(5), salida: enDias(7), estado: "confirmada" }),
    reserva({ folio: "HTL-2002", turista: "Luis Mora" }),
  ]);

  // Una llegada futura no ofrece el botón, solo el aviso de la fecha
  const futura = page.getByRole("row").filter({ hasText: "HTL-2001" });
  await expect(futura.getByRole("button", { name: "Check-in" })).toHaveCount(0);
  await expect(futura).toContainText("Check-in el");

  // Rechazar sin motivo no cambia nada
  const pendiente = page.getByRole("row").filter({ hasText: "HTL-2002" });
  await pendiente.getByRole("button", { name: "Rechazar" }).click();
  await expect(page.getByRole("heading", { name: "Rechazar la reserva HTL-2002" })).toBeVisible();
  await page.getByRole("button", { name: "Sí, rechazar" }).click();
  await expect(page.getByRole("alert")).toContainText("Escribí el motivo del rechazo");
  await expect.poll(async () => (await guardado(page)).reservas[1].estado).toBe("pendiente");

  // Con motivo, la reserva queda cancelada y el motivo guardado
  await page.getByPlaceholder("Ej.: No quedan habitaciones libres para esas fechas.").fill("No queda esa habitación libre.");
  await page.getByRole("button", { name: "Sí, rechazar" }).click();
  await expect(pendiente.getByText("Cancelada")).toBeVisible();
  await expect.poll(async () => (await guardado(page)).reservas[1].motivoRechazo).toBe("No queda esa habitación libre.");
});

test("HU-023: registrar una habitación valida los campos y la deja disponible", async ({ page }) => {
  await abrirPanel(page, []);

  await page.getByRole("button", { name: "Registrar habitación" }).click();
  const formulario = page.locator("form").filter({ hasText: "Tipo de habitación" });

  // Sin datos no se registra y se marca el formulario
  await formulario.getByRole("button", { name: "Registrar habitación" }).click();
  await expect(page.getByRole("alert").first()).toContainText("Revisá los campos marcados: la habitación no se registró.");
  await expect.poll(async () => (await guardado(page)).habitaciones.length).toBe(1);

  // Con datos válidos aparece la tarjeta y queda guardada
  await formulario.getByLabel("Tipo de habitación").selectOption("Suite");
  await formulario.getByLabel("Capacidad (huéspedes)").fill("3");
  await formulario.getByLabel("Unidades de este tipo").fill("2");
  await formulario.getByLabel("Precio por noche (C$)").fill("1500");
  await formulario
    .getByLabel("Descripción para el turista")
    .fill("Suite con sala, balcón al patio y desayuno típico incluido.");
  await formulario.getByRole("button", { name: "Registrar habitación" }).click();

  await expect.poll(async () => (await guardado(page)).habitaciones.length).toBe(2);
  await expect.poll(async () => (await guardado(page)).habitaciones[1].precio).toBe(1500);

  // Cambiar la disponibilidad se refleja en la tarjeta y en el estado
  const tarjeta = page
    .getByRole("heading", { name: "Suite" })
    .first()
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
  await expect(tarjeta).toBeVisible();
  await tarjeta.getByLabel("Cambiar estado").selectOption("mantenimiento");
  // El badge de la tarjeta (el <option> del selector también dice lo mismo)
  await expect(tarjeta.getByText("En mantenimiento", { exact: true }).first()).toBeVisible();
  await expect.poll(async () => (await guardado(page)).habitaciones[1].estado).toBe("mantenimiento");
});

test("HU-024: el precio por noche se guarda y el ajuste de temporada lo cambia", async ({ page }) => {
  await abrirPanel(page, []);
  await expect(page.getByRole("heading", { name: "Precios del hotel" })).toBeVisible();

  // Edición directa del precio
  await page.getByLabel("Precio por noche (C$)").first().fill("1200");
  await page.getByRole("button", { name: "Guardar precio" }).first().click();
  await expect.poll(async () => (await guardado(page)).habitaciones[0].precio).toBe(1200);

  // Ajuste por temporada: aplica a todas las tarifas
  await page.getByLabel("Temporada").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Aplicar a todas" }).click();
  await expect.poll(async () => (await guardado(page)).habitaciones[0].precio).not.toBe(1200);
});
