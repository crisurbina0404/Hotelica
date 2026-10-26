// ============================================================
// Hotelica — Sincronización con Supabase (Fase 2)
// Hoteles y habitaciones viven en la base de datos y también
// se quedan en el navegador: si la BD no responde, la app
// sigue funcionando igual que antes con el guardado local.
// ============================================================
import { supabase } from "./lib/supabase";
import type { EstadoHabitacion, EstadoHotel, Habitacion, Hotel, Punto } from "./data";

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
  if (error.code === "42501" || (error.message ?? "").includes("row-level security")) {
    return "la base de datos no tiene permisos de escritura (falta aplicar el script SQL)";
  }
  if (error.code === "42P01") return "no existen las tablas (falta aplicar el script SQL)";
  return error.message ?? "no se pudo conectar";
}

// ----- Lectura: trae todo lo guardado en la BD -----

// Devuelve null si la BD no responde: la app sigue con lo local
export async function cargarHoteles(): Promise<Hotel[] | null> {
  try {
    const { data, error } = await supabase.from("hoteles").select("*");
    if (error || !data) return null;
    return (data as HotelFila[]).map(deFilaHotel);
  } catch {
    return null;
  }
}

export async function cargarHabitaciones(): Promise<Habitacion[] | null> {
  try {
    const { data, error } = await supabase.from("habitaciones").select("*");
    if (error || !data) return null;
    return (data as HabitacionFila[]).map(deFilaHabitacion);
  } catch {
    return null;
  }
}

// ----- Escritura: guarda un hotel (inserta o actualiza por el id) -----

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

export function fusionarHabitaciones(local: Habitacion[], base: Habitacion[]): Habitacion[] {
  const porId = new Map(local.map((h) => [h.id, h]));
  base.forEach((b) => {
    const anterior = porId.get(b.id);
    porId.set(b.id, anterior ? completarHabitacionDesdeLocal(b, anterior) : b);
  });
  return [...porId.values()];
}
