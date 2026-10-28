// ============================================================
// Hotelica — Sincronización con Supabase (Fase 2)
// Hoteles y habitaciones viven en la base de datos y también
// se quedan en el navegador: si la BD no responde, la app
// sigue funcionando igual que antes con el guardado local.
// ============================================================
import { supabase } from "./lib/supabase";
import type { EstadoHabitacion, EstadoHotel, Habitacion, Hotel, Punto, UsuarioPlataforma } from "./data";

// Así se llaman las columnas en la base (en la app usamos camelCase)
type HotelFila = {
  id: string;
  nombre: string;
  dueno: string;
  departamento_id: string;
  municipio_id: string;
  direccion: string;
  descripcion: string;
  imagen: string;
  galeria: string[];
  amenidades: string[];
  destacado: boolean;
  aprobado: EstadoHotel;
  rating: number;
  total_resenas: number;
  fecha_registro: string;
  correo_dueno: string | null;
  contacto: string | null;
  ubicacion: Punto | null;
  motivo_rechazo: string | null; // por qué el admin rechazó el hotel (HU-032)
};

type UsuarioFila = {
  correo: string;
  nombre: string;
  rol: "Turista" | "Hotel" | "Admin";
  activo: boolean; // TRUE = puede iniciar sesión (HU-033)
  creado_en: string | null;
};

type HabitacionFila = {
  id: string;
  hotel_id: string;
  tipo: string;
  capacidad: number;
  precio: number;
  unidades: number;
  estado: EstadoHabitacion;
  detalle: string;
  galeria: string[] | null; // fotos del tipo de habitación (HU-041)
};

// ----- De la app hacia la base -----

function aFilaHotel(h: Hotel): HotelFila {
  return {
    id: h.id,
    nombre: h.nombre,
    dueno: h.dueno,
    departamento_id: h.departamentoId,
    municipio_id: h.municipioId,
    direccion: h.direccion,
    descripcion: h.descripcion,
    imagen: h.imagen,
    galeria: h.galeria ?? [],
    amenidades: h.amenidades ?? [],
    destacado: h.destacado ?? false,
    aprobado: h.aprobado,
    rating: h.rating ?? 0,
    total_resenas: h.totalResenas ?? 0,
    fecha_registro: h.fechaRegistro,
    correo_dueno: h.correoDueno ?? null,
    contacto: h.contacto ?? null,
    ubicacion: h.ubicacion ?? null,
    motivo_rechazo: h.motivoRechazo ?? null,
  };
}

function aFilaUsuario(u: UsuarioPlataforma): UsuarioFila {
  return {
    correo: u.correo,
    nombre: u.nombre,
    rol: u.rol,
    activo: u.activo,
    creado_en: u.creadaEn,
  };
}

function aFilaHabitacion(h: Habitacion): HabitacionFila {
  return {
    id: h.id,
    hotel_id: h.hotelId,
    tipo: h.tipo,
    capacidad: h.capacidad,
    precio: h.precio,
    unidades: h.unidades,
    estado: h.estado,
    detalle: h.detalle,
    galeria: h.galeria ?? [],
  };
}

// ----- De la base hacia la app -----

function deFilaHotel(f: HotelFila): Hotel {
  return {
    id: f.id,
    nombre: f.nombre,
    dueno: f.dueno,
    departamentoId: f.departamento_id,
    municipioId: f.municipio_id,
    direccion: f.direccion,
    ubicacion: f.ubicacion ?? undefined,
    descripcion: f.descripcion,
    imagen: f.imagen,
    galeria: f.galeria ?? [],
    amenidades: f.amenidades ?? [],
    destacado: f.destacado ?? false,
    aprobado: f.aprobado,
    rating: f.rating ?? 0,
    totalResenas: f.total_resenas ?? 0,
    fechaRegistro: f.fecha_registro,
    contacto: f.contacto ?? undefined,
    correoDueno: f.correo_dueno ?? undefined,
    motivoRechazo: f.motivo_rechazo ?? undefined,
  };
}

function deFilaUsuario(f: UsuarioFila): UsuarioPlataforma {
  return {
    correo: f.correo,
    nombre: f.nombre,
    rol: f.rol,
    activo: f.activo ?? true,
    creadaEn: f.creado_en ?? new Date().toISOString(),
  };
}

function deFilaHabitacion(f: HabitacionFila): Habitacion {
  return {
    id: f.id,
    hotelId: f.hotel_id,
    tipo: f.tipo,
    capacidad: f.capacidad,
    precio: f.precio,
    unidades: f.unidades,
    estado: f.estado,
    detalle: f.detalle,
    galeria: f.galeria ?? [],
  };
}

// Traducir el error de Supabase a un mensaje que se pueda leer
function mensajeDeError(error: { code?: string; message?: string } | null): string {
  if (!error) return "error desconocido";
  // La red caída llega como "TypeError: Failed to fetch" dentro del objeto de error
  if ((error.message ?? "").includes("Failed to fetch")) {
    return "no hay conexión con la base de datos";
  }
  if (error.code === "42501" || (error.message ?? "").includes("row-level security")) {
    return "la base de datos no tiene permisos de escritura (falta aplicar el script SQL)";
  }
  if (error.code === "42P01") return "no existen las tablas (falta aplicar el script SQL)";
  return error.message ?? "no se pudo conectar";
}

// ----- Lectura: trae todo lo guardado en la BD -----

// Lo que devuelven las cargas: la lista traída o el motivo del fallo
// (en la Fase 1 los fallos se tragaban con un catch vacío y nadie
// se enteraba de que la base no respondió, HU-034)
type Carga<T> = { datos: T[]; error: string | null };

// Devuelve la lista; si la BD no responde, datos va vacío con el mensaje del error
async function cargarTabla<T>(
  tabla: string,
  convertir: (fila: any) => T
): Promise<Carga<T>> {
  try {
    const { data, error } = await supabase.from(tabla).select("*");
    if (error) return { datos: [], error: mensajeDeError(error) };
    if (!data) return { datos: [], error: "la base de datos no devolvió filas" };
    return { datos: (data as any[]).map(convertir), error: null };
  } catch {
    return { datos: [], error: "no hay conexión con la base de datos" };
  }
}

export async function cargarHoteles(): Promise<Carga<Hotel>> {
  return cargarTabla("hoteles", deFilaHotel);
}

export async function cargarHabitaciones(): Promise<Carga<Habitacion>> {
  return cargarTabla("habitaciones", deFilaHabitacion);
}

// Trae el registro de cuentas de la plataforma (HU-033)
export async function cargarUsuarios(): Promise<Carga<UsuarioPlataforma>> {
  return cargarTabla("usuarios", deFilaUsuario);
}

// Guarda una cuenta (inserta o actualiza por el correo): activo = TRUE/FALSE (HU-033)
export async function subirUsuario(usuario: UsuarioPlataforma): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.from("usuarios").upsert(aFilaUsuario(usuario), { onConflict: "correo" });
    return error ? { error: mensajeDeError(error) } : {};
  } catch {
    return { error: "no hay conexión con la base de datos" };
  }
}

export async function subirHotel(hotel: Hotel): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.from("hoteles").upsert(aFilaHotel(hotel), { onConflict: "id" });
    return error ? { error: mensajeDeError(error) } : {};
  } catch {
    return { error: "no hay conexión con la base de datos" };
  }
}

// Actualiza solo el promedio y el contador de reseñas del hotel (HU-019):
// sin esto, al recargar la base traía el promedio viejo y la calificación se perdía
export async function subirCalificacion(
  hotelId: string,
  rating: number,
  totalResenas: number
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase
      .from("hoteles")
      .update({ rating, total_resenas: totalResenas })
      .eq("id", hotelId);
    return error ? { error: mensajeDeError(error) } : {};
  } catch {
    return { error: "no hay conexión con la base de datos" };
  }
}

export async function subirHabitacion(habitacion: Habitacion): Promise<{ error?: string }> {
  return subirHabitaciones([habitacion]);
}

// Sube varias habitaciones de una vez (ajuste de precios de todo el hotel)
export async function subirHabitaciones(habitaciones: Habitacion[]): Promise<{ error?: string }> {
  if (habitaciones.length === 0) return {};
  try {
    const { error } = await supabase
      .from("habitaciones")
      .upsert(habitaciones.map(aFilaHabitacion), { onConflict: "id" });
    return error ? { error: mensajeDeError(error) } : {};
  } catch {
    return { error: "no hay conexión con la base de datos" };
  }
}

// Une lo local con lo de la BD: lo de la BD manda por id y lo local que no está se queda
export function fusionarPorId<T extends { id: string }>(local: T[], base: T[]): T[] {
  const porId = new Map(local.map((x) => [x.id, x]));
  base.forEach((x) => porId.set(x.id, x));
  return [...porId.values()];
}

// Lo mismo para hoteles, pero completando lo que venga vacío de la BD:
// las filas semilla no traen fotos, ubicación ni correo del dueño y
// borrarlas en el navegador sería peor que no sincronizar
function completarHotelDesdeLocal(bd: Hotel, local: Hotel): Hotel {
  return {
    ...bd,
    imagen: bd.imagen || local.imagen,
    galeria: bd.galeria?.length ? bd.galeria : local.galeria,
    amenidades: bd.amenidades?.length ? bd.amenidades : local.amenidades,
    descripcion: bd.descripcion || local.descripcion,
    ubicacion: bd.ubicacion ?? local.ubicacion,
    correoDueno: bd.correoDueno ?? local.correoDueno,
    contacto: bd.contacto ?? local.contacto,
    // El motivo viaja en su columna (HU-032); si la base aún no lo trae, conservamos el local
    motivoRechazo: bd.motivoRechazo ?? local.motivoRechazo,
  };
}

export function fusionarHoteles(local: Hotel[], base: Hotel[]): Hotel[] {
  const porId = new Map(local.map((h) => [h.id, h]));
  base.forEach((b) => {
    const anterior = porId.get(b.id);
    porId.set(b.id, anterior ? completarHotelDesdeLocal(b, anterior) : b);
  });
  return [...porId.values()];
}

// Lo mismo para habitaciones: si la BD aún no tiene la columna galeria
// (o viene vacía), no borramos las fotos que estaban en el navegador (HU-041)
function completarHabitacionDesdeLocal(bd: Habitacion, local: Habitacion): Habitacion {
  return {
    ...bd,
    galeria: bd.galeria?.length ? bd.galeria : local.galeria ?? [],
  };
}

// Cuentas de la plataforma: la BD manda por correo y lo local que no está se queda
export function fusionarUsuarios(local: UsuarioPlataforma[], base: UsuarioPlataforma[]): UsuarioPlataforma[] {
  const porCorreo = new Map(local.map((u) => [u.correo, u]));
  base.forEach((u) => porCorreo.set(u.correo, u));
  return [...porCorreo.values()];
}

export function fusionarHabitaciones(local: Habitacion[], base: Habitacion[]): Habitacion[] {
  const porId = new Map(local.map((h) => [h.id, h]));
  base.forEach((b) => {
    const anterior = porId.get(b.id);
    porId.set(b.id, anterior ? completarHabitacionDesdeLocal(b, anterior) : b);
  });
  return [...porId.values()];
}
