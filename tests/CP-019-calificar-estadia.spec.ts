// ============================================================
// Hotelica — CP-019: calificar la estadía y que el promedio sobreviva
// Cubre los escenarios 5, 6 y 9 de la HU-019: la calificación se
// registra, el promedio del hotel sube y no se pierde al recargar
// (antes se guardaba solo en el navegador y la base lo pisaba)
// ============================================================
import { test, expect, type Page } from "@playwright/test";
import { sinRedExterna } from "./ayudas";

const CLAVE = "hotelica-fase1-v2";

// Fila del hotel tal como está en la base: en0 hasta que alguien califica
function filaBD() {
  return {
    id: "h-continental",
    nombre: "El Continental",
    dueno: "Prueba Hotelero",
    departamento_id: "managua",
    municipio_id: "m-managua",
    direccion: "Carretera a Masaya 1 cuadra al sur, Managua",
    descripcion: "Hotel de prueba para verificar que la calificación se guarde.",
    imagen: "https://image.qwenlm.ai/generated-images/74748a6d-f13c-4364-a45f-3ba8bf49632e/_result.png",
    galeria: [],
    amenidades: ["wifi", "aire"],
    destacado: false,
    aprobado: "aprobado",
    rating: 0,
    total_resenas: 0,
    fecha_registro: "2026-10-01",
  };
}

// Lo que trae el navegador: una reserva ya terminada, lista para calificar
function datosSemilla() {
  return {
    hoteles: [
      {
        id: "h-continental",
        nombre: "El Continental",
        dueno: "Prueba Hotelero",
        departamentoId: "managua",
        municipioId: "m-managua",
        direccion: "Carretera a Masaya 1 cuadra al sur, Managua",
        descripcion: "Hotel de prueba para verificar que la calificación se guarde.",
        imagen: "https://image.qwenlm.ai/generated-images/74748a6d-f13c-4364-a45f-3ba8bf49632e/_result.png",
        galeria: [],
        amenidades: ["wifi", "aire"],
        destacado: false,
        aprobado: "aprobado",
        rating: 0,
        totalResenas: 0,
        fechaRegistro: "2026-10-01",
      },
    ],
    reservas: [
      {
        folio: "H-1001",
        hotelId: "h-continental",
        habitacionId: "hab-continental",
        turista: "Ana Turista",
        correo: "ana@hotelica.ni",
        telefono: "8888-8888",
        comentarios: "",
        llegada: "2026-10-20",
        salida: "2026-10-23",
        huespedes: 2,
        noches: 3,
        subtotal: 2550,
        iva: 383,
        total: 2933,
        pago: "efectivo",
        estado: "completada",
        creada: "2026-10-15",
        calificada: false,
        checkinEn: "2026-10-20T15:00:00",
        checkoutEn: "2026-10-23T11:00:00",
      },
    ],
    resenas: [],
    favoritos: {},
    notificaciones: [],
    pagos: [],
    calificaciones: [],
    folio: 1062,
    cuentasHotelero: [],
    habitaciones: [
      {
        id: "hab-continental",
        hotelId: "h-continental",
        tipo: "Suite",
        capacidad: 2,
        precio: 850,
        unidades: 3,
        estado: "disponible",
        detalle: "Suite de prueba",
        galeria: [],
      },
    ],
  };
}

// Deja el navegador con la reserva terminada y la turista con sesión
function sembrarNavegador(page: Page) {
  return page.addInitScript(
    ({ clave, datos }) => {
      // Solo la primera vez: en las recargas no pisamos lo que la app ya guardó
      if (localStorage.getItem("hotelica-usuario")) return;
      localStorage.setItem(clave, JSON.stringify(datos));
      localStorage.setItem(
        "hotelica-usuario",
        JSON.stringify({ nombre: "Ana Turista", rol: "Turista", correo: "ana@hotelica.ni", telefono: "", direccion: "" })
      );
    },
    { clave: CLAVE, datos: datosSemilla() }
  );
}

// Simula la base: al calificar, el PATCH actualiza la fila que luego se lee
// y el comentario llega como fila nueva de la tabla resenas (HU-019)
function prepararBase(page: Page) {
  const fila = filaBD();
  let subioPromedio = false;
  let resenaSubida: Record<string, unknown> | null = null;

  sinRedExterna(page);

  void page.route("**/rest/v1/hoteles*", async (ruta) => {
    if (ruta.request().method() === "PATCH") {
      Object.assign(fila, JSON.parse(ruta.request().postData() ?? "{}"));
      subioPromedio = true;
      // La app pide la fila de vuelta si pidió return=representation
      const pideFila = (ruta.request().headers()["prefer"] ?? "").includes("representation");
      await ruta.fulfill(pideFila ? { status: 200, json: [fila] } : { status: 204, body: "" });
      return;
    }
    await ruta.fulfill({ json: [fila] });
  });
  void page.route("**/rest/v1/habitaciones*", (ruta) => ruta.fulfill({ json: [] }));

  void page.route("**/rest/v1/resenas*", async (ruta) => {
    if (ruta.request().method() === "POST") {
      resenaSubida = (await ruta.request().postDataJSON()) as Record<string, unknown>;
    }
    // La fila de vuelta no se usa: solo confirmamos que el insert funcionó
    await ruta.fulfill({ status: 201, json: [] });
  });

  return { subio: () => subioPromedio, resena: () => resenaSubida };
}

test("la calificación sube el promedio del hotel y el comentario no se pierde al recargar", async ({ page }) => {
  const { subio, resena } = prepararBase(page);
  await sembrarNavegador(page);

  await page.goto("/");

  // Escenario 5: la reserva terminada ofrece calificar
  await page.locator("header").getByRole("button", { name: "Mis reservas" }).click();
  await page.getByRole("button", { name: "Calificar estadía" }).click();

  // Escenario 6: marcamos 5 estrellas, escribimos el comentario y enviamos
  await page.getByRole("button", { name: "Calificar con 5 estrellas" }).click();
  await page.getByPlaceholder("Cuéntanos").fill("La suite estaba impecable y el desayuno riquísimo.");
  await page.getByRole("button", { name: "Enviar calificación" }).click();
  await expect(page.getByText(/Tu calificación ya cuenta para el promedio/)).toBeVisible();

  // El promedio del hotel en la tarjeta:0.0 → 5.0 con1 reseña
  await page.locator("header").getByRole("button", { name: "Explorar hoteles" }).click();
  await expect(page.getByText("El Continental")).toBeVisible();
  await expect(page.getByText("1 reseñas")).toBeVisible();
  await expect(page.getByText("5.0", { exact: true })).toBeVisible();

  // El comentario subió a la base como fila de resenas, no solo al navegador
  await expect
    .poll(() => String(resena()?.comentario ?? ""), { timeout: 8000 })
    .toBe("La suite estaba impecable y el desayuno riquísimo.");

  // Escenario 9: al recargar, la base manda y el promedio sigue en5.0
  expect(subio()).toBe(true);
  await page.reload();
  await page.locator("header").getByRole("button", { name: "Explorar hoteles" }).click();
  await expect(page.getByText("1 reseñas")).toBeVisible();
  await expect(page.getByText("5.0", { exact: true })).toBeVisible();
});
