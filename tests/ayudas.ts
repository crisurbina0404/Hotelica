// ============================================================
// Hotelica — Ayudas compartidas de las pruebas E2E
// Simulan el login de Supabase y la lista de administradores
// para probar la consola sin tocar la base real ni mandar correos
// ============================================================
import type { Page } from "@playwright/test";

// Las pruebas pueden ir cambiando estos valores a mitad de camino
export type Control = {
  correosAdmin: string[]; // quiénes aparecen como administradores
  correoActivo: string; // con quién se está iniciando sesión ahora
};

export function nuevoControl(correoAdmin = "admin@hotelica.ni"): Control {
  return { correosAdmin: [correoAdmin], correoActivo: correoAdmin };
}

// Cortamos la red externa: la app tiene que seguir con lo local y el
// traductor de Google, si carga, tapa los botones con su ventana
export function sinRedExterna(page: Page) {
  void page.route("**/rest/v1/**", (ruta) => ruta.abort());
  void page.route("**/auth/v1/**", (ruta) => ruta.abort());
  void page.route("**/functions/v1/**", (ruta) => ruta.abort());
  void page.route("**/translate.google.com/**", (ruta) => ruta.abort());
}

// Respuestas falsas de Supabase. Se registran DESPUÉS de los cortes
// porque Playwright atiende primero lo último registrado
export function responderSupabase(page: Page, control: Control) {
  void page.route("**/rest/v1/administradores*", (ruta) =>
    ruta.fulfill({ json: control.correosAdmin.map((correo) => ({ correo })) })
  );
  void page.route("**/rest/v1/resenas*", (ruta) => ruta.fulfill({ json: [] }));
  void page.route("**/auth/v1/token*", (ruta) => ruta.fulfill({ json: sesionDe(control.correoActivo) }));
  void page.route("**/auth/v1/user*", (ruta) => ruta.fulfill({ json: usuarioDe(control.correoActivo) }));
}

// Abre el modal de login y entra con los datos recibidos
export async function iniciarSesion(page: Page, correo: string, contrasena: string, control: Control) {
  control.correoActivo = correo;
  await page.getByRole("button", { name: "Iniciar sesión" }).first().click();
  await page.getByPlaceholder("turista@hotelica.ni").fill(correo);
  await page.getByPlaceholder("Mínimo 6 caracteres").fill(contrasena);
  await page.getByPlaceholder("Mínimo 6 caracteres").press("Enter");
}

// Sesion falsa con la forma que espera supabase-js (token y vencimiento)
function sesionDe(correo: string) {
  const ahora = Math.floor(Date.now() / 1000);
  const token = [
    parte({ alg: "HS256", typ: "JWT" }),
    parte({ sub: "falso-id", email: correo, role: "authenticated", aud: "authenticated", exp: ahora + 3600 }),
    "firma-falsa",
  ].join(".");
  return {
    access_token: token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: ahora + 3600,
    refresh_token: "falso-refresh",
    user: usuarioDe(correo),
  };
}

// Usuario falso: el nombre sale del correo, igual que en el login real
function usuarioDe(correo: string) {
  return {
    id: "falso-id",
    aud: "authenticated",
    role: "authenticated",
    email: correo,
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_metadata: { nombre: correo.split("@")[0] },
    app_metadata: { provider: "password", providers: ["password"] },
    identities: [],
  };
}

// El JWT pide base64url: sin caracteres que rompan el token
function parte(objeto: object): string {
  return Buffer.from(JSON.stringify(objeto)).toString("base64url");
}
