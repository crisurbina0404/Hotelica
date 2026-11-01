// ============================================================
// Hotelica — Alta de las cuentas de los hoteles de demostración
// ============================================================
// Crea en Supabase Auth la cuenta de cada hotelero y la registra en la tabla
// usuarios con rol Hotel. Se corre UNA vez, desde tu máquina, con la clave de
// servicio (nunca se guarda en el proyecto ni se sube al navegador):
//
//   SUPABASE_URL=https://tu-proyecto.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=... node scripts/crear-cuentas-hoteleros.mjs
//
// La clave de servicio sale de Supabase → Project Settings → API → service_role.
// Al terminar imprime el correo y la contraseña de cada cuenta: guardalos y
// borrá esta salida de la terminal. Volver a correrlo no duplica nada.
// ============================================================

const URL_BASE = process.env.SUPABASE_URL;
const CLAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !CLAVE) {
  console.error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

// Una cuenta por hotel aprobado. Los correos son los mismos que quedaron en la
// ficha del hotel (correoDueno), así el panel del hotelero se enlaza solo.
const CUENTAS = [
  {
    correo: "casonaxalteva.granada@gmail.com",
    contrasena: "casona2026*",
    nombre: "Martha Rojas",
    telefono: "8512-6734",
    hotel: "Hostal La Casona de Xalteva",
  },
  {
    correo: "elfaro.sjs@hotmail.com",
    contrasena: "elfaro.2026",
    nombre: "Ernesto Chavarría",
    telefono: "7845 1290",
    hotel: "Cabañas El Faro",
  },
  {
    correo: "fincaelzapote.ometepe@gmail.com",
    contrasena: "zapote2026!",
    nombre: "Lucía Mendoza",
    telefono: "5768-4412",
    hotel: "Finca El Zapote",
  },
  {
    correo: "posadachepita@yahoo.com",
    contrasena: "chepita26*",
    nombre: "Josefa Úbeda",
    telefono: "2311 4587",
    hotel: "Posada Doña Chepita",
  },
  {
    correo: "laneblina.matagalpa@gmail.com",
    contrasena: "neblina2026",
    nombre: "Ramón Zeledón",
    telefono: "8642-9071",
    hotel: "Cabañas La Neblina",
  },
  {
    correo: "misslula.corn@hotmail.com",
    contrasena: "lula2026.",
    nombre: "Lula Hodgson",
    telefono: "8253 6640",
    hotel: "Cabañas Miss Lula",
  },
];

const cabeceras = {
  apikey: CLAVE,
  Authorization: `Bearer ${CLAVE}`,
  "Content-Type": "application/json",
};

async function crearUsuario(cuenta) {
  const r = await fetch(`${URL_BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: cabeceras,
    body: JSON.stringify({
      email: cuenta.correo,
      password: cuenta.contrasena,
      email_confirm: true, // sin confirmación por correo: son cuentas de demostración
      user_metadata: { nombre: cuenta.nombre, telefono: cuenta.telefono },
    }),
  });
  const cuerpo = await r.text();
  // 422 = el correo ya existe: la cuenta ya estaba creada, seguimos
  if (!r.ok && r.status !== 422) throw new Error(`${cuenta.correo} → ${r.status}: ${cuerpo.slice(0, 200)}`);
  return r.status === 422 ? "ya existía" : "creada";
}

async function registrarEnPlataforma(cuenta) {
  const r = await fetch(`${URL_BASE}/rest/v1/usuarios?on_conflict=correo`, {
    method: "POST",
    headers: { ...cabeceras, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ correo: cuenta.correo, nombre: cuenta.nombre, rol: "Hotel", activo: true }),
  });
  if (!r.ok) throw new Error(`usuarios ${cuenta.correo} → ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

for (const cuenta of CUENTAS) {
  const estado = await crearUsuario(cuenta);
  await registrarEnPlataforma(cuenta);
  console.log(`${cuenta.hotel}: ${cuenta.correo} (${estado})`);
}

console.log("\nCredenciales para entrar al panel del hotel:");
console.log(CUENTAS.map((c) => `- ${c.hotel}: ${c.correo} / ${c.contrasena}`).join("\n"));
console.log("\nCambiá estas contraseñas desde Mi perfil antes de mostrar el proyecto.");
