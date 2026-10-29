// ============================================================
// Hotelica — CP-034: consultar estadísticas globales
// Prueba los escenarios de la HU-034 entrando con login de
// administrador (HU-042) y simulando las tablas de la base
// ============================================================
import { test, expect, type Page } from "@playwright/test";
import { nuevoControl, sinRedExterna, responderSupabase, iniciarSesion } from "./ayudas";

// Dos reservas que "existen en la base": el test las devuelve simulando la
// tabla para probar que las cifras del admin salen exactas del registro (HU-034).
// Pertenecen a un hotel que existe en los datos, porque la validación
// descarta las reservas de hoteles desconocidos
const RESERVAS_DE_LA_BASE = [
  { folio: "HC-7001", hotel_id: "h-sanjuan", habitacion_id: "hab-1", turista: "Clara Ríos",
    correo: "clara@correo.ni", telefono: "5555-1001", comentarios: "", llegada: "2026-11-02",
    salida: "2026-11-04", huespedes: 2, noches: 2, subtotal: 52.17, iva: 7.83,
    total: 60, pago: "tarjeta", estado: "confirmada", creada: "2026-10-20T15:00:00.000Z",
    calificada: false, motivo_rechazo: null, checkin_en: null, checkout_en: null },
  { folio: "HC-7002", hotel_id: "h-sanjuan", habitacion_id: "hab-1", turista: "Leo Mairena",
    correo: "leo@correo.ni", telefono: "5555-1002", comentarios: "", llegada: "2026-11-10",
    salida: "2026-11-11", huespedes: 1, noches: 1, subtotal: 34.78, iva: 5.22,
    total: 40, pago: "efectivo", estado: "pendiente", creada: "2026-10-22T09:30:00.000Z",
    calificada: false, motivo_rechazo: null, checkin_en: null, checkout_en: null },
];

// Preparación común con la red cortada y las tablas vacías:
// la consola queda trabajando con las semillas del navegador,
// salvo las reservas, que responden con las dos de la base
async function abrirConsola(page: Page) {
  const control = nuevoControl();
  sinRedExterna(page);
  responderSupabase(page, control);

  // Las tablas responden vacías para que sigan las semillas locales
  void page.route("**/rest/v1/hoteles*", (ruta) => ruta.fulfill({ json: [] }));
  void page.route("**/rest/v1/habitaciones*", (ruta) => ruta.fulfill({ json: [] }));
  void page.route("**/rest/v1/usuarios*", (ruta) => ruta.fulfill({ json: [] }));
  // Las reservas sí llevan datos: acá es donde las cifras tienen que dibujar la base
  void page.route("**/rest/v1/reservas*", (ruta) => ruta.fulfill({ json: RESERVAS_DE_LA_BASE }));

  await page.goto("/");
  await iniciarSesion(page, "admin@hotelica.ni", "secreta123", control);
  await expect(page.getByText("Hoteles pendientes de aprobación (2)")).toBeVisible();
  return { control };
}

test("la consola muestra las estadísticas globales con su desglose (HU-034)", async ({ page }) => {
  await abrirConsola(page);

  // La sección entera para no chocar con textos parecidos del resto de la consola
  const seccion = page.getByRole("region", { name: "Estadísticas globales" });

  // Escenario 1: la sección existe en la consola
  await expect(seccion).toBeVisible();

  // Escenario 2: las cuatro métricas con sus desgloses
  await expect(seccion.getByText("Usuarios activos")).toBeVisible();
  await expect(seccion.getByText("Hoteles registrados")).toBeVisible();
  await expect(seccion.getByText("Total de reservas", { exact: true })).toBeVisible();
  await expect(seccion.getByText("Ingresos totales")).toBeVisible();
  // El desglose del encabezado de la consola ya distingue aprobados y por aprobar
  await expect(page.getByText(/aprobado/).first()).toBeVisible();

  // Escenario 3: la regla de ingresos queda explicada en palabras (sin notación
  // de fórmula, esa era la pulida del diseño) y el IVA a la vista
  await expect(seccion.getByText(/Los ingresos suman los totales de las reservas no canceladas/)).toBeVisible();
  await expect(seccion.getByText("IVA incluido")).toBeVisible();
  await expect(seccion.getByText("Ticket promedio")).toBeVisible();

  // Escenario 3.1: las cifras salen exactas de la base, no del navegador.
  // Las dos reservas del mock suman C$ 100.00 (C$ 50.00 de promedio por
  // estancia), sin importar cuántas reservas de demostración tenga este navegador
  await expect(seccion.getByText("C$ 100.00")).toBeVisible();
  await expect(seccion.getByText("C$ 50.00")).toBeVisible();

  // Escenario 5: la sección se calcula sola con los datos en vivo,
  // y mientras hay datos el botón de exportar queda activo
  const exportarPDF = seccion.getByRole("button", { name: /Exportar PDF/ });
  const exportarExcel = seccion.getByRole("button", { name: /Exportar Excel/ });
  await expect(exportarPDF).toBeEnabled();
  await expect(exportarExcel).toBeEnabled();

  // Escenario 7: exportar baja un PDF con el nombre con fecha de la HU
  const descargaPromise = page.waitForEvent("download");
  await exportarPDF.click();
  const descarga = await descargaPromise;
  expect(descarga.suggestedFilename()).toMatch(/^hotelica-estadisticas-\d{4}-\d{2}-\d{2}\.pdf$/);
});

test("si la base no responde se muestra el aviso y se puede reintentar (HU-034)", async ({ page }) => {
  // Todas las tablas responden con error de servidor: la app queda con lo local
  const control = nuevoControl();
  sinRedExterna(page);
  responderSupabase(page, control);
  void page.route("**/rest/v1/hoteles*", (ruta) => ruta.fulfill({ status: 500, json: { message: "la base de datos no respondió" } }));
  void page.route("**/rest/v1/habitaciones*", (ruta) => ruta.fulfill({ status: 500, json: { message: "la base de datos no respondió" } }));
  void page.route("**/rest/v1/usuarios*", (ruta) => ruta.fulfill({ status: 500, json: { message: "la base de datos no respondió" } }));
  void page.route("**/rest/v1/reservas*", (ruta) => ruta.fulfill({ status: 500, json: { message: "la base de datos no respondió" } }));

  await page.goto("/");
  await iniciarSesion(page, "admin@hotelica.ni", "secreta123", control);
  await expect(page.getByText("Hoteles pendientes de aprobación (2)")).toBeVisible();

  // Escenario 6: el aviso aparece y los datos locales siguen en pantalla
  await expect(page.getByText("No se pudieron consultar los datos remotos")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
  await expect(page.getByText("Estadísticas globales")).toBeVisible();

  // Reintentar vuelve a preguntar sin romper la sección
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByText("No se pudieron consultar los datos remotos")).toBeVisible();
});
