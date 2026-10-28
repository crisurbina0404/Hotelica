// ============================================================
// Hotelica — CP-035: gestionar notificaciones de reservas
// Prueba los escenarios de la HU-035 con una bitácora ya
// cargada en el navegador: filtrar, marcar vistas, borrar
// ============================================================
import { test, expect, type Page } from "@playwright/test";
import { nuevoControl, sinRedExterna, responderSupabase, iniciarSesion } from "./ayudas";
// La app valida que el guardado traiga hoteles y reservas como listas:
// si el documento sembrado no es completo la carga cae a las semillas y
// los eventos se pierden. Sembramos el documento entero con las mismas
// semillas del catálogo para que la carga lo acepte como válido.
import {
  HOTELES_SEED, RESERVAS_SEED, RESENAS_SEED, HABITACIONES_SEED, USUARIOS_SEED,
} from "../src/data";

type Evento = {
  id: string; folio: string; hotelId: string; tipo: string; texto: string; fecha: string; leida: boolean;
};

// Bitácora de prueba: tres eventos de hoteles distintos,
// dos sin ver y uno ya visto
const EVENTOS: Evento[] = [
  {
    id: "ev-prueba-1", folio: "HC-1001", hotelId: "h-granada", tipo: "nueva",
    texto: "Ana López reservó del 2026-11-02 al 2026-11-04",
    fecha: "2026-10-28T09:15:00", leida: false,
  },
  {
    id: "ev-prueba-2", folio: "HC-1002", hotelId: "h-ometepe", tipo: "rechazada",
    texto: "Reserva de Carlos Méndez rechazada por el hotel: sin disponibilidad",
    fecha: "2026-10-28T10:40:00", leida: false,
  },
  {
    id: "ev-prueba-3", folio: "HC-1003", hotelId: "h-granada", tipo: "pago",
    texto: "Pago con tarjeta registrado para el folio HC-1003",
    fecha: "2026-10-27T18:05:00", leida: true,
  },
];

// El guardado completo con la bitácora incluida (HU-035)
const GUARDADO = JSON.stringify({
  hoteles: HOTELES_SEED,
  habitaciones: HABITACIONES_SEED,
  reservas: RESERVAS_SEED,
  resenas: RESENAS_SEED,
  favoritos: { invitado: [] },
  notificaciones: [],
  pagos: [],
  calificaciones: [],
  folio: 1061,
  cuentasHotelero: [],
  usuarios: USUARIOS_SEED,
  eventosAdmin: EVENTOS,
});

// Preparación común: red cortada, login de administrador y
// la bitácora de eventos ya guardada en el navegador
async function abrirConsolaConEventos(page: Page) {
  const control = nuevoControl();
  sinRedExterna(page);
  responderSupabase(page, control);
  void page.route("**/rest/v1/hoteles*", (ruta) => ruta.fulfill({ json: [] }));
  void page.route("**/rest/v1/habitaciones*", (ruta) => ruta.fulfill({ json: [] }));
  void page.route("**/rest/v1/usuarios*", (ruta) => ruta.fulfill({ json: [] }));

  await page.addInitScript(`{
    // Solo siembra si no hay un guardado anterior (en la recarga ya es el de la app)
    if (!localStorage.getItem("hotelica-fase1-v2"))
      localStorage.setItem("hotelica-fase1-v2", '${GUARDADO.replace(/'/g, "\\'")}');
  }`);

  await page.goto("/");
  await iniciarSesion(page, "admin@hotelica.ni", "secreta123", control);
  await expect(page.getByText("Hoteles pendientes de aprobación (2)")).toBeVisible();
}

const filaDe = (page: Page, id: string) => page.locator("li[data-evento]").filter({ hasText: id });

test("la bitácora lista los eventos, los filtra y distingue rechazo de cancelación (HU-035)", async ({ page }) => {
  await abrirConsolaConEventos(page);

  // Escenario 1: la sección con el conteo de sin ver
  await expect(page.getByText(/Notificaciones de reservas \(2 sin ver\)/)).toBeVisible();

  // Escenario 2: los eventos muestran folio, texto, hotel y hora
  const nueva = filaDe(page, "HC-1001");
  await expect(nueva).toContainText("Ana López reservó");
  await expect(nueva).toContainText("Casa Colonial Los Patios");
  await expect(page.locator("li[data-evento='nueva']")).toHaveCount(1);

  // Escenario 3: el rechazo trae su motivo y su pastilla propia
  const rechazo = filaDe(page, "HC-1002");
  await expect(rechazo).toContainText("sin disponibilidad");
  await expect(rechazo).toContainText("Rechazada");

  // Escenario 4: el filtro por tipo deja solo los de ese tipo
  await page.getByRole("button", { name: "Pago (1)" }).click();
  await expect(filaDe(page, "HC-1003")).toBeVisible();
  await expect(page.locator("li[data-evento='nueva']")).toHaveCount(0);

  // El filtro no pierde la bitácora: al volver a "Todas" está todo
  await page.getByRole("button", { name: /Todas \(3\)/ }).click();
  await expect(page.locator("li[data-evento]")).toHaveCount(3);
});

test("se pueden marcar, contar y borrar las notificaciones (HU-035)", async ({ page }) => {
  await abrirConsolaConEventos(page);

  // Escenario 5: marcar una vista actualiza la fila y el conteo
  await filaDe(page, "HC-1001").getByRole("button", { name: "Marcar vista" }).click();
  await expect(filaDe(page, "HC-1001")).toContainText("Visto");
  await expect(page.getByText(/Notificaciones de reservas \(1 sin ver\)/)).toBeVisible();

  // Marcar todas en bloque deja el conteo en cero
  await page.getByRole("button", { name: "Marcar leídas" }).click();
  await expect(page.getByText(/Notificaciones de reservas \(3\)/)).toBeVisible();

  // Escenario 7: lo marcado sobrevive la recarga
  await page.reload();
  // La recarga vuelve al inicio: abrimos la consola otra vez con la sesión viva
  await page.getByRole("button", { name: "Consola admin" }).click();
  await expect(page.getByText(/Notificaciones de reservas \((3)\)/).first()).toBeVisible();
  await expect(filaDe(page, "HC-1002")).toContainText("Visto");

  // Escenario 6: borrar en bloque quita solo las vistas
  await page.getByRole("button", { name: "Borrar las leídas" }).click();
  await expect(page.locator("li[data-evento]")).toHaveCount(0);
  await expect(page.getByText("Sin actividad por ahora")).toBeVisible();
});
