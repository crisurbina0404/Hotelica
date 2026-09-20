// ============================================================
// Hotelica — Datos simulados de la base de datos `hotelica`
// Fase 1: maqueta funcional (sin backend todavía)
// ============================================================

// ----- Tipos que reflejan las tablas de hotelica.sql -----

export type Departamento = { id: string; nombre: string };

export type Municipio = { id: string; nombre: string; departamentoId: string };

export type EstadoHotel = "pendiente" | "aprobado" | "rechazado";

export type Hotel = {
  id: string;
  nombre: string;
  dueno: string;
  departamentoId: string;
  municipioId: string;
  direccion: string;
  descripcion: string;
  imagen: string;
  galeria: string[];
  amenidades: string[];
  destacado: boolean;
  aprobado: EstadoHotel;
  rating: number; // calificación promedio
  totalResenas: number;
  fechaRegistro: string;
};

export type EstadoHabitacion = "disponible" | "mantenimiento" | "no_disponible";

export type Habitacion = {
  id: string;
  hotelId: string;
  tipo: string;
  capacidad: number;
  precio: number; // precio por noche en córdobas
  unidades: number;
  estado: EstadoHabitacion;
  detalle: string;
};

export type EstadoReserva = "pendiente" | "confirmada" | "checkin" | "completada" | "cancelada";

export type Reserva = {
  folio: string;
  hotelId: string;
  habitacionId: string;
  turista: string;
  llegada: string; // formato ISO (yyyy-mm-dd)
  salida: string;
  huespedes: number;
  noches: number;
  subtotal: number;
  iva: number;
  total: number;
  pago: "tarjeta" | "efectivo" | "transferencia";
  estado: EstadoReserva;
  creada: string;
  calificada: boolean;
};

export type Resena = {
  id: string;
  hotelId: string;
  autor: string;
  origen: string;
  rating: number;
  comentario: string;
  fecha: string;
};

// ----- Fotografías generadas para la maqueta -----

const IMG = {
  hero: "https://image.qwenlm.ai/generated-images/74748a6d-f13c-4364-a45f-3ba8bf49632e/_result.png",
  granada: "https://image.qwenlm.ai/generated-images/7dfada36-dc3c-43ce-a137-fce82dd31ec5/_result.png",
  sanjuan: "https://image.qwenlm.ai/generated-images/f0099c8f-13cc-45c7-8e4d-a101bf94c232/_result.png",
  leon: "https://image.qwenlm.ai/generated-images/6ac8363e-a7fc-44b1-9eac-bcc76acf9bab/_result.png",
  ometepe: "https://image.qwenlm.ai/generated-images/6726efbe-146e-4d2f-b00e-b74365d2afef/_result.png",
  matagalpa: "https://image.qwenlm.ai/generated-images/28eb2a0f-a844-419e-a505-ad3616fad29d/_result.png",
  corn: "https://image.qwenlm.ai/generated-images/b1077e43-5dc2-42fb-a396-ec1d79764a70/_result.png",
};

export const IMAGEN_HERO = IMG.hero;

// ----- Catálogo de departamentos y municipios de Nicaragua -----

// Orden narrativo de la portada: de la colonia al Caribe
export const DEPARTAMENTOS: Departamento[] = [
  { id: "granada", nombre: "Granada" },
  { id: "leon", nombre: "León" },
  { id: "rivas", nombre: "Rivas" },
  { id: "managua", nombre: "Managua" },
  { id: "masaya", nombre: "Masaya" },
  { id: "esteli", nombre: "Estelí" },
  { id: "matagalpa", nombre: "Matagalpa" },
  { id: "caribe", nombre: "RACCS (Caribe Sur)" },
];

export const MUNICIPIOS: Municipio[] = [
  { id: "m-granada", nombre: "Granada", departamentoId: "granada" },
  { id: "m-diria", nombre: "Diriá", departamentoId: "granada" },
  { id: "m-nandaime", nombre: "Nandaime", departamentoId: "granada" },
  { id: "m-rivas", nombre: "Rivas", departamentoId: "rivas" },
  { id: "m-sanjuan", nombre: "San Juan del Sur", departamentoId: "rivas" },
  { id: "m-tola", nombre: "Tola", departamentoId: "rivas" },
  { id: "m-altagracia", nombre: "Altagracia (Ometepe)", departamentoId: "rivas" },
  { id: "m-leon", nombre: "León", departamentoId: "leon" },
  { id: "m-telica", nombre: "Telica", departamentoId: "leon" },
  { id: "m-nagarote", nombre: "Nagarote", departamentoId: "leon" },
  { id: "m-masaya", nombre: "Masaya", departamentoId: "masaya" },
  { id: "m-catarina", nombre: "Catarina", departamentoId: "masaya" },
  { id: "m-nindirí", nombre: "Nindirí", departamentoId: "masaya" },
  { id: "m-matagalpa", nombre: "Matagalpa", departamentoId: "matagalpa" },
  { id: "m-sanramon", nombre: "San Ramón", departamentoId: "matagalpa" },
  { id: "m-sebaco", nombre: "Sébaco", departamentoId: "matagalpa" },
  { id: "m-esteli", nombre: "Estelí", departamentoId: "esteli" },
  { id: "m-condega", nombre: "Condega", departamentoId: "esteli" },
  { id: "m-managua", nombre: "Managua", departamentoId: "managua" },
  { id: "m-tipitapa", nombre: "Tipitapa", departamentoId: "managua" },
  { id: "m-sandino", nombre: "Ciudad Sandino", departamentoId: "managua" },
  { id: "m-bluefields", nombre: "Bluefields", departamentoId: "caribe" },
  { id: "m-corn", nombre: "Corn Island", departamentoId: "caribe" },
];

// ----- Hoteles registrados en la plataforma -----

export const HOTELES_SEED: Hotel[] = [
  {
    id: "h-granada",
    nombre: "Casa Colonial Los Patios",
    dueno: "Familia Bermúdez",
    departamentoId: "granada",
    municipioId: "m-granada",
    direccion: "Calle La Calzada, a media cuadra del Parque Central, Granada",
    descripcion:
      "Casona colonial de 1890 restaurada por la familia Bermúdez, con tres patios interiores llenos de flores, fuente de piedra y hamacas bajo los corredores. Desayuno nicaragüense incluido y terraza con vista a los techos de teja y al volcán Mombacho.",
    imagen: IMG.granada,
    galeria: [IMG.granada, IMG.ometepe, IMG.leon],
    amenidades: ["wifi", "desayuno", "fuente", "terraza", "tours"],
    destacado: true,
    aprobado: "aprobado",
    rating: 4.8,
    totalResenas: 126,
    fechaRegistro: "2025-11-02",
  },
  {
    id: "h-sanjuan",
    nombre: "Brisas del Pacífico",
    dueno: "Rodolfo Quintana",
    departamentoId: "rivas",
    municipioId: "m-sanjuan",
    direccion: "Frente al malecón, costado sur de la bahía, San Juan del Sur",
    descripcion:
      "Hotel familiar a 40 pasos de la arena. Terraza de madera frente al mar, tablas de surf de cortesía y los mejores atardeceres de la bahía. Ideal para parejas, surfistas y familias pequeñas que buscan el Pacífico sin multitudes.",
    imagen: IMG.sanjuan,
    galeria: [IMG.sanjuan, IMG.corn, IMG.granada],
    amenidades: ["wifi", "playa", "surf", "bar", "aire"],
    destacado: true,
    aprobado: "aprobado",
    rating: 4.6,
    totalResenas: 98,
    fechaRegistro: "2025-10-18",
  },
  {
    id: "h-ometepe",
    nombre: "Eco Lodge Ometepe Verde",
    dueno: "Cooperativa Ometepe",
    departamentoId: "rivas",
    municipioId: "m-altagracia",
    direccion: "Camino a la cascada San Ramón, Altagracia, Isla de Ometepe",
    descripcion:
      "Cabañas de madera construidas por la cooperativa local entre plataneras y bosque, con el volcán Concepción de fondo. Senderismo guiado, kayak en el lago y cocina de leña. Energía solar y cero plásticos de un solo uso.",
    imagen: IMG.ometepe,
    galeria: [IMG.ometepe, IMG.matagalpa, IMG.granada],
    amenidades: ["senderismo", "kayak", "organico", "mirador"],
    destacado: true,
    aprobado: "aprobado",
    rating: 4.9,
    totalResenas: 142,
    fechaRegistro: "2025-09-30",
  },
  {
    id: "h-leon",
    nombre: "La Casona del Sol",
    dueno: "María Elena Duarte",
    departamentoId: "leon",
    municipioId: "m-leon",
    direccion: "Del Parque Central 1 cuadra al este, León",
    descripcion:
      "Hotel patrimonial en el corazón de León, a pasos de la catedral Patrimonio de la Humanidad. Azotea con vista a los domos naranjas y a la cadena de volcanes, biblioteca de poesía y café de la tarde incluido.",
    imagen: IMG.leon,
    galeria: [IMG.leon, IMG.granada, IMG.sanjuan],
    amenidades: ["wifi", "terraza", "desayuno", "biblioteca"],
    destacado: false,
    aprobado: "aprobado",
    rating: 4.4,
    totalResenas: 61,
    fechaRegistro: "2025-12-05",
  },
  {
    id: "h-matagalpa",
    nombre: "Finca Café & Montaña",
    dueno: "Familia Rodríguez",
    departamentoId: "matagalpa",
    municipioId: "m-sanramon",
    direccion: "Km 4 carretera a San Ramón, Matagalpa",
    descripcion:
      "Finca cafetalera con cabañas de pino entre neblina y montañas. Recorrido del café de la semilla a la taza, cabalgatas y fogata nocturna. Abrigo incluido: aquí el clima es de suéter y chocolate caliente.",
    imagen: IMG.matagalpa,
    galeria: [IMG.matagalpa, IMG.ometepe, IMG.corn],
    amenidades: ["tour_cafe", "fogata", "senderismo", "organico"],
    destacado: false,
    aprobado: "aprobado",
    rating: 4.5,
    totalResenas: 74,
    fechaRegistro: "2026-01-12",
  },
  {
    id: "h-corn",
    nombre: "Coco Loco Bungalows",
    dueno: "Denzel Hodgson",
    departamentoId: "caribe",
    municipioId: "m-corn",
    direccion: "Playa South West Bay, Little Corn Island",
    descripcion:
      "Bungalows de madera y palma frente al mar Caribe, con arena blanca y agua turquesa a tres metros de tu puerta. Snorkel diario, rondón de los domingos y hamacas bajo los cocos. Se llega en lancha, se llega feliz.",
    imagen: IMG.corn,
    galeria: [IMG.corn, IMG.sanjuan, IMG.ometepe],
    amenidades: ["playa", "snorkel", "bar", "kayak"],
    destacado: true,
    aprobado: "aprobado",
    rating: 4.7,
    totalResenas: 110,
    fechaRegistro: "2025-11-20",
  },
  {
    id: "h-masaya",
    nombre: "Mirador de Catarina",
    dueno: "Roberto López",
    departamentoId: "masaya",
    municipioId: "m-catarina",
    direccion: "Cuesta de Catarina, junto al mirador de la laguna de Apoyo",
    descripcion:
      "Posada con vista panorámica a la laguna de Apoyo, viveros de flores y cocina campesina. A 25 minutos de Granada y Masaya.",
    imagen: IMG.matagalpa,
    galeria: [IMG.matagalpa],
    amenidades: ["mirador", "jardin", "desayuno"],
    destacado: false,
    aprobado: "pendiente",
    rating: 0,
    totalResenas: 0,
    fechaRegistro: "2026-07-21",
  },
  {
    id: "h-telica",
    nombre: "Posada Volcán Telica",
    dueno: "Ana Robleto",
    departamentoId: "leon",
    municipioId: "m-telica",
    direccion: "Comunidad Los Portillos, falda del volcán Telica",
    descripcion:
      "Alojamiento rural para quienes quieren ver el volcán Telica rugir de noche. Caminatas guiadas y cocina de leña.",
    imagen: IMG.ometepe,
    galeria: [IMG.ometepe],
    amenidades: ["senderismo", "fogata"],
    destacado: false,
    aprobado: "pendiente",
    rating: 0,
    totalResenas: 0,
    fechaRegistro: "2026-07-28",
  },
  {
    id: "h-ruta",
    nombre: "Motel Ruta Norte",
    dueno: "Sociedad HG S.A.",
    departamentoId: "managua",
    municipioId: "m-managua",
    direccion: "Km 11 Carretera Norte, Managua",
    descripcion: "Motel de carretera con habitaciones por hora.",
    imagen: IMG.leon,
    galeria: [IMG.leon],
    amenidades: ["parqueo"],
    destacado: false,
    aprobado: "rechazado",
    rating: 0,
    totalResenas: 0,
    fechaRegistro: "2026-06-15",
  },
];

// ----- Habitaciones por hotel -----

export const HABITACIONES_SEED: Habitacion[] = [
  // Casa Colonial Los Patios
  { id: "g1", hotelId: "h-granada", tipo: "Estándar Doble", capacidad: 2, precio: 1200, unidades: 5, estado: "disponible", detalle: "Cama doble, baño privado y vista al patio de las buganvilias." },
  { id: "g2", hotelId: "h-granada", tipo: "Superior Colonial", capacidad: 3, precio: 1500, unidades: 4, estado: "disponible", detalle: "Cama queen + sofá cama, pisos originales de barro cocido." },
  { id: "g3", hotelId: "h-granada", tipo: "Suite del Mombacho", capacidad: 4, precio: 2400, unidades: 2, estado: "disponible", detalle: "Suite con terraza privada y vista al volcán Mombacho." },
  { id: "g4", hotelId: "h-granada", tipo: "Familiar Los Patios", capacidad: 6, precio: 2900, unidades: 2, estado: "mantenimiento", detalle: "Dos ambientes conectados, ideal para familias grandes." },
  // Brisas del Pacífico
  { id: "s1", hotelId: "h-sanjuan", tipo: "Estándar Mar", capacidad: 2, precio: 1400, unidades: 6, estado: "disponible", detalle: "Cama queen y balcón con brisa directa del Pacífico." },
  { id: "s2", hotelId: "h-sanjuan", tipo: "Superior Bahía", capacidad: 3, precio: 1900, unidades: 4, estado: "disponible", detalle: "Vista frontal a la bahía, hamaca privada en el balcón." },
  { id: "s3", hotelId: "h-sanjuan", tipo: "Suite Surfista", capacidad: 4, precio: 2600, unidades: 2, estado: "disponible", detalle: "Ducha exterior, rack para tablas y mini refrigerador." },
  // Eco Lodge Ometepe Verde
  { id: "o1", hotelId: "h-ometepe", tipo: "Cabaña Bosque", capacidad: 2, precio: 1100, unidades: 6, estado: "disponible", detalle: "Cabaña de madera entre plataneras, baño con agua caliente solar." },
  { id: "o2", hotelId: "h-ometepe", tipo: "Cabaña Volcán", capacidad: 3, precio: 1600, unidades: 4, estado: "disponible", detalle: "Vista directa al Concepción desde la cama." },
  { id: "o3", hotelId: "h-ometepe", tipo: "Cabaña Familiar Ceiba", capacidad: 5, precio: 2200, unidades: 2, estado: "disponible", detalle: "Altillo para niños y corredor con mecedoras." },
  // La Casona del Sol
  { id: "l1", hotelId: "h-leon", tipo: "Estándar Colonial", capacidad: 2, precio: 950, unidades: 6, estado: "disponible", detalle: "Cama doble alrededor del patio de la casona." },
  { id: "l2", hotelId: "h-leon", tipo: "Superior Catedral", capacidad: 3, precio: 1350, unidades: 3, estado: "disponible", detalle: "Balcón con vista a los domos de la catedral." },
  { id: "l3", hotelId: "h-leon", tipo: "Suite Darío", capacidad: 2, precio: 1900, unidades: 2, estado: "no_disponible", detalle: "Suite homenaje con biblioteca de poesía incluida." },
  // Finca Café & Montaña
  { id: "c1", hotelId: "h-matagalpa", tipo: "Cabaña Pino", capacidad: 2, precio: 1050, unidades: 5, estado: "disponible", detalle: "Cabaña de pino con chimenea y olor a café recién tostado." },
  { id: "c2", hotelId: "h-matagalpa", tipo: "Cabaña Niebla", capacidad: 4, precio: 1650, unidades: 3, estado: "disponible", detalle: "Dos cuartos, perfecta para familias de montaña." },
  // Coco Loco Bungalows
  { id: "k1", hotelId: "h-corn", tipo: "Bungalow Playa", capacidad: 2, precio: 1800, unidades: 5, estado: "disponible", detalle: "A tres metros del mar, techo de palma y ducha caribeña." },
  { id: "k2", hotelId: "h-corn", tipo: "Bungalow Coco", capacidad: 3, precio: 2300, unidades: 3, estado: "disponible", detalle: "Bajo los cocoteros, con hamaca doble y vista turquesa." },
  { id: "k3", hotelId: "h-corn", tipo: "Familiar Marea", capacidad: 6, precio: 3400, unidades: 1, estado: "disponible", detalle: "El más grande, con cocina básica y mesa frente al mar." },
];

// ----- Utilidades de fechas y dinero -----

// Devuelve la fecha de hoy en formato ISO (yyyy-mm-dd)
export function hoyISO(): string {
  return aISO(new Date());
}

// Convierte un Date a formato ISO (yyyy-mm-dd)
export function aISO(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dia = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

// Suma días a una fecha y devuelve ISO
export function sumarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return aISO(d);
}

// Noches de estadía = fecha de salida - fecha de llegada
export function calcularNoches(llegada: string, salida: string): number {
  const ms = new Date(`${salida}T12:00:00`).getTime() - new Date(`${llegada}T12:00:00`).getTime();
  return Math.round(ms / 86400000);
}

// Formatea dinero en córdobas: C$ 1,200.00
export function fmtDinero(n: number): string {
  return `C$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Formatea una fecha ISO en español corto: 12 ago 2026
export function fmtFecha(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-NI", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Reglas de negocio del cálculo de reserva (IVA 15%)
export function calcularTotales(precioNoche: number, noches: number) {
  const subtotal = precioNoche * noches;
  const iva = Math.round(subtotal * 0.15);
  return { subtotal, iva, total: subtotal + iva };
}

// Nueva calificación promedio = ((promedio × reseñas) + nueva) ÷ (reseñas + 1)
export function nuevoPromedio(promedio: number, totalResenas: number, estrellas: number): number {
  return Math.round(((promedio * totalResenas + estrellas) / (totalResenas + 1)) * 10) / 10;
}

// Dice si dos rangos de fechas se traslapan (para la disponibilidad)
export function seTraslapan(aIni: string, aFin: string, bIni: string, bFin: string): boolean {
  return aIni < bFin && bIni < aFin;
}

// Busca rangos de fechas alternativas con disponibilidad para una habitación
// Devuelve hasta 3 opciones cercanas a la fecha original
export function sugerirFechasAlternativas(
  habitaciones: { id: string; unidades: number }[],
  disponiblesDe: (habitacionId: string, llegada: string, salida: string) => number,
  noches: number,
  fechaOriginal: string
): { llegada: string; salida: string }[] {
  if (noches <= 0) return [];

  const sugerencias: { llegada: string; salida: string }[] = [];
  const hoy = hoyISO();

  // Buscamos hacia adelante y hacia atrás, empezando desde 1 día de diferencia
  for (let delta = 1; delta <= 30 && sugerencias.length < 3; delta++) {
    // Hacia adelante
    const candidataAdelante = sumarDias(fechaOriginal, delta);
    const salidaAdelante = sumarDias(candidataAdelante, noches);
    const todasLibres = habitaciones.some((hab) => {
      return disponiblesDe(hab.id, candidataAdelante, salidaAdelante) > 0;
    });
    if (todasLibres && candidataAdelante >= hoy && sugerencias.length < 3) {
      sugerencias.push({ llegada: candidataAdelante, salida: salidaAdelante });
    }

    // Hacia atrás
    const candidataAtras = sumarDias(fechaOriginal, -delta);
    const salidaAtras = sumarDias(candidataAtras, noches);
    const todasLibresAtras = habitaciones.some((hab) => {
      return disponiblesDe(hab.id, candidataAtras, salidaAtras) > 0;
    });
    if (todasLibresAtras && candidataAtras >= hoy && sugerencias.length < 3) {
      sugerencias.push({ llegada: candidataAtras, salida: salidaAtras });
    }
  }

  return sugerencias;
}

// ----- Reservas de demostración (fechas relativas a hoy) -----

const HOY = hoyISO();

// Arma una reserva de demostración calculando totales reales
function demo(
  folio: string,
  hotelId: string,
  habitacionId: string,
  turista: string,
  llegada: string,
  noches: number,
  huespedes: number,
  pago: Reserva["pago"],
  estado: EstadoReserva,
  calificada = false
): Reserva {
  const hab = HABITACIONES_SEED.find((h) => h.id === habitacionId)!;
  const t = calcularTotales(hab.precio, noches);
  return {
    folio, hotelId, habitacionId, turista, llegada,
    salida: sumarDias(llegada, noches),
    huespedes, noches, ...t, pago, estado,
    creada: sumarDias(llegada, -12),
    calificada,
  };
}

export const RESERVAS_SEED: Reserva[] = [
  // Reservas de la turista de demostración (María Fernández)
  demo("HC-1024", "h-granada", "g2", "María Fernández", sumarDias(HOY, -12), 3, 2, "tarjeta", "completada"),
  demo("HC-1031", "h-sanjuan", "s2", "María Fernández", sumarDias(HOY, 5), 3, 2, "tarjeta", "confirmada"),
  demo("HC-1035", "h-ometepe", "o2", "María Fernández", sumarDias(HOY, 12), 2, 3, "efectivo", "pendiente"),
  // Reservas que administra el hotel de demostración (Brisas del Pacífico)
  demo("HC-1041", "h-sanjuan", "s1", "Carlos Mendoza", sumarDias(HOY, 3), 2, 2, "transferencia", "pendiente"),
  demo("HC-1042", "h-sanjuan", "s2", "Lucía Peralta", HOY, 2, 2, "tarjeta", "confirmada"),
  demo("HC-1043", "h-sanjuan", "s1", "Jorge Salinas", sumarDias(HOY, -1), 3, 1, "efectivo", "checkin"),
  demo("HC-1038", "h-sanjuan", "s3", "Marta Ruiz", sumarDias(HOY, -9), 4, 3, "tarjeta", "completada", true),
  demo("HC-1036", "h-sanjuan", "s1", "Pedro Vega", sumarDias(HOY, -4), 2, 2, "efectivo", "cancelada"),
  // Reservas para probar sugerencias: llenan Brisas del Pacífico del HOY+7 al HOY+10
  // s1 tiene 6 unidades → 6 reservas
  demo("HC-1050", "h-sanjuan", "s1", "Ana López", sumarDias(HOY, 7), 3, 2, "tarjeta", "confirmada"),
  demo("HC-1051", "h-sanjuan", "s1", "Carlos Ruiz", sumarDias(HOY, 7), 3, 2, "efectivo", "confirmada"),
  demo("HC-1052", "h-sanjuan", "s1", "María García", sumarDias(HOY, 7), 3, 2, "tarjeta", "confirmada"),
  demo("HC-1053", "h-sanjuan", "s1", "Pedro López", sumarDias(HOY, 7), 3, 2, "transferencia", "confirmada"),
  demo("HC-1054", "h-sanjuan", "s1", "Laura Martínez", sumarDias(HOY, 7), 3, 2, "tarjeta", "confirmada"),
  demo("HC-1055", "h-sanjuan", "s1", "José Hernández", sumarDias(HOY, 7), 3, 2, "efectivo", "confirmada"),
  // s2 tiene 4 unidades → 4 reservas
  demo("HC-1056", "h-sanjuan", "s2", "Sofía Torres", sumarDias(HOY, 7), 3, 2, "tarjeta", "confirmada"),
  demo("HC-1057", "h-sanjuan", "s2", "Diego Vargas", sumarDias(HOY, 7), 3, 2, "efectivo", "confirmada"),
  demo("HC-1058", "h-sanjuan", "s2", "Isabella Reyes", sumarDias(HOY, 7), 3, 2, "tarjeta", "confirmada"),
  demo("HC-1059", "h-sanjuan", "s2", "Andrés Castillo", sumarDias(HOY, 7), 3, 2, "transferencia", "confirmada"),
  // s3 tiene 2 unidades → 2 reservas
  demo("HC-1060", "h-sanjuan", "s3", "Camila Ortiz", sumarDias(HOY, 7), 3, 2, "tarjeta", "confirmada"),
  demo("HC-1061", "h-sanjuan", "s3", "Roberto Méndez", sumarDias(HOY, 7), 3, 2, "efectivo", "confirmada"),
];

// ----- Reseñas iniciales de los hoteles -----

export const RESENAS_SEED: Resena[] = [
  { id: "r1", hotelId: "h-granada", autor: "María Fernández", origen: "Managua, Nicaragua", rating: 5, comentario: "El patio al atardecer es de otro mundo. El desayuno con gallo pinto y quesillo, espectacular. Volveremos en diciembre.", fecha: sumarDias(HOY, -10) },
  { id: "r2", hotelId: "h-granada", autor: "Sophie Turner", origen: "Canadá", rating: 5, comentario: "Felt like staying in a museum, but with the warmest family hosting you. The rooftop view of Mombacho is unbeatable.", fecha: sumarDias(HOY, -32) },
  { id: "r3", hotelId: "h-granada", autor: "José Luis Rivas", origen: "León, Nicaragua", rating: 4, comentario: "Hermosa la casona y muy bien ubicada. Solo faltó un poco de presión de agua en la ducha.", fecha: sumarDias(HOY, -51) },
  { id: "r4", hotelId: "h-sanjuan", autor: "Marta Ruiz", origen: "Estelí, Nicaragua", rating: 5, comentario: "Nos atendieron como familia. Ver el atardecer desde la terraza con un toste de patacones no tiene precio.", fecha: sumarDias(HOY, -8) },
  { id: "r5", hotelId: "h-sanjuan", autor: "Jake Miller", origen: "Estados Unidos", rating: 4, comentario: "Perfect surf location, boards included. Rooms are simple but clean and the sea breeze does the AC's job.", fecha: sumarDias(HOY, -27) },
  { id: "r6", hotelId: "h-ometepe", autor: "Camila Ortega", origen: "Costa Rica", rating: 5, comentario: "Despertar con el volcán enfrente y el canto de los guardabarrancos... la cabaña huele a madera nueva. Experiencia 10/10.", fecha: sumarDias(HOY, -15) },
  { id: "r7", hotelId: "h-ometepe", autor: "Lars Jensen", origen: "Dinamarca", rating: 5, comentario: "The guided hike to San Ramón waterfall was the highlight of our Nicaragua trip. Solar-powered and truly eco.", fecha: sumarDias(HOY, -40) },
  { id: "r8", hotelId: "h-corn", autor: "Valeria Soto", origen: "Bluefields, Nicaragua", rating: 5, comentario: "El rondón del domingo es obligatorio. Agua tan clara que se ven los peces desde la hamaca.", fecha: sumarDias(HOY, -19) },
  { id: "r9", hotelId: "h-matagalpa", autor: "Andrés Castellón", origen: "Jinotega, Nicaragua", rating: 4, comentario: "Frío rico, café de la misma finca y fogata con historias. La caminata al cerro Apante muy bien guiada.", fecha: sumarDias(HOY, -23) },
  { id: "r10", hotelId: "h-leon", autor: "Paola Méndez", origen: "Chinandega, Nicaragua", rating: 4, comentario: "La azotea frente a la catedral al atardecer vale toda la estadía. Café de la tarde buenísimo.", fecha: sumarDias(HOY, -35) },
];

// ----- Catálogos de apoyo para la interfaz -----

// Etiquetas legibles para los estados de reserva
export const ETIQUETA_ESTADO: Record<EstadoReserva, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  checkin: "Check-in",
  completada: "Completada",
  cancelada: "Cancelada",
};

// Etiquetas para el estado de habitaciones
export const ETIQUETA_HABITACION: Record<EstadoHabitacion, string> = {
  disponible: "Disponible",
  mantenimiento: "En mantenimiento",
  no_disponible: "No disponible",
};

// Etiquetas de amenidades con su nombre visible
export const AMENIDADES: Record<string, string> = {
  wifi: "Wi-Fi gratis",
  desayuno: "Desayuno incluido",
  aire: "Aire acondicionado",
  playa: "Frente al mar",
  surf: "Tablas de surf",
  bar: "Bar / restaurante",
  terraza: "Terraza panorámica",
  fuente: "Patios y fuente",
  tours: "Tours guiados",
  senderismo: "Senderismo",
  kayak: "Kayak",
  snorkel: "Snorkel",
  organico: "Orgánico / eco",
  mirador: "Mirador",
  tour_cafe: "Tour del café",
  fogata: "Fogata nocturna",
  biblioteca: "Biblioteca",
  jardin: "Jardines",
  parqueo: "Parqueo",
};

// Usuario de demostración según el rol elegido
export const USUARIOS_DEMO = {
  turista: { nombre: "María Fernández", etiqueta: "Turista", detalle: "Viajera desde Managua" },
  hotel: { nombre: "Brisas del Pacífico", etiqueta: "Hotel", detalle: "San Juan del Sur, Rivas" },
  admin: { nombre: "Administración", etiqueta: "Admin", detalle: "Consola Hotelica" },
} as const;

export type Rol = keyof typeof USUARIOS_DEMO;

// ----- Destinos y actividades turísticas (HU-012) -----

export type CategoriaActividad = "aventura" | "cultura" | "naturaleza" | "playa";

export type Actividad = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaActividad;
  dificultad: "baja" | "media" | "alta";
  duracion: string;
  precio: number; // en córdobas, 0 = gratuita
};

export type DestinoTuristico = {
  id: string;
  nombre: string;
  departamentoId: string;
  descripcion: string;
  imagen: string;
  actividades: Actividad[];
};

export const ETIQUETA_CATEGORIA: Record<CategoriaActividad, string> = {
  aventura: "Aventura",
  cultura: "Cultura",
  naturaleza: "Naturaleza",
  playa: "Playa",
};

export const ETIQUETA_DIFICULTAD: Record<string, string> = {
  baja: "Fácil",
  media: "Moderada",
  alta: "Difícil",
};

export const DESTINOS_TURISTICOS: DestinoTuristico[] = [
  // Granada
  {
    id: "dt-granada-centro",
    nombre: "Centro Colonial de Granada",
    departamentoId: "granada",
    descripcion: "La ciudad colonial más antigua de América continental, con arquitectura colorida, iglesias monumentales y la icónica Calle La Calzada frente al lago.",
    imagen: IMG.granada,
    actividades: [
      { id: "a-granada-1", nombre: "Recorrido por Calle La Calzada", descripcion: "Paseo peatonal junto al lago con restaurantes, bares y artesanías.", categoria: "cultura", dificultad: "baja", duracion: "1-2 horas", precio: 0 },
      { id: "a-granada-2", nombre: "Visita a la Catedral de Granada", descripcion: "Catedral neoclásica del siglo XIX, joya arquitectónica de la ciudad.", categoria: "cultura", dificultad: "baja", duracion: "45 min", precio: 0 },
      { id: "a-granada-3", nombre: "Paseo en lancha por Las Isletas", descripcion: "365 isletas volcánicas en el lago de Nicaragua, con avifauna y restaurantes flotantes.", categoria: "naturaleza", dificultad: "baja", duracion: "2-3 horas", precio: 500 },
    ],
  },
  {
    id: "dt-mombacho",
    nombre: "Volcán Mombacho",
    departamentoId: "granada",
    descripcion: "Volcán dormido a 1,344 msnm con senderos en la neblina, orquídeas endémicas y mirador con vista al lago y Las Isletas.",
    imagen: IMG.granada,
    actividades: [
      { id: "a-mombacho-1", nombre: "Sendero El Cráter", descripcion: "Camino de 1.5 km alrededor del cráter principal con miradores.", categoria: "aventura", dificultad: "media", duracion: "2 horas", precio: 250 },
      { id: "a-mombacho-2", nombre: "Sendero La Leyenda", descripcion: "Ruta de 4 km por bosque nublado con observation de aves.", categoria: "naturaleza", dificultad: "alta", duracion: "3-4 horas", precio: 250 },
    ],
  },
  // León
  {
    id: "dt-leon-centro",
    nombre: "Centro Histórico de León",
    departamentoId: "leon",
    descripcion: "Ciudad universitaria llena de murales revolucionarios, iglesias barrocas y la monumental Catedral Basílica, Patrimonio de la Humanidad.",
    imagen: IMG.leon,
    actividades: [
      { id: "a-leon-1", nombre: "Visita a la Catedral Basílica", descripcion: "La iglesia más grande de Centroamérica, sube al techo para vista panorámica.", categoria: "cultura", dificultad: "media", duracion: "1.5 horas", precio: 100 },
      { id: "a-leon-2", nombre: "Ruta de los Murales", descripcion: "Recorrido a pie por los murales revolucionarios del barrio Sutiava.", categoria: "cultura", dificultad: "baja", duracion: "2 horas", precio: 0 },
    ],
  },
  {
    id: "dt-telica",
    nombre: "Volcán Telica",
    departamentoId: "leon",
    descripcion: "Volcán activo donde puedes ver lava incandescente al atardecer. Una de las experiencias nocturnas más impresionantes de Nicaragua.",
    imagen: IMG.ometepe,
    actividades: [
      { id: "a-telica-1", nombre: "Ascenso al Telica", descripcion: "Caminata de 3 horas hasta el cráter con vista de lava.", categoria: "aventura", dificultad: "alta", duracion: "6-8 horas", precio: 350 },
      { id: "a-telica-2", nombre: "Observación nocturna de lava", descripcion: "Experiencia guiada al cráter al atardecer para ver la lava.", categoria: "aventura", dificultad: "alta", duracion: "5 horas", precio: 450 },
    ],
  },
  // Rivas
  {
    id: "dt-ometepe",
    nombre: "Isla de Ometepe",
    departamentoId: "rivas",
    descripcion: "Isla formada por dos volcanes en el lago de Nicaragua: Concepción y Midero. Paraíso de senderismo, kayak y ecoturismo.",
    imagen: IMG.ometepe,
    actividades: [
      { id: "a-ometepe-1", nombre: "Ascenso al Volcán Concepción", descripcion: "Volcán activo de 1,610 msnm con vista al lago y Costa Rica.", categoria: "aventura", dificultad: "alta", duracion: "6-8 horas", precio: 400 },
      { id: "a-ometepe-2", nombre: "Cascada San Ramón", descripcion: "Caminata de 2.5 km hasta una cascada de 60 metros en plena selva.", categoria: "naturaleza", dificultad: "media", duracion: "3 horas", precio: 200 },
      { id: "a-ometepe-3", nombre: "Kayak en el Lago", descripcion: "Recorrido en kayak por la costa de la isla con vista a los volcanes.", categoria: "aventura", dificultad: "baja", duracion: "2 horas", precio: 350 },
    ],
  },
  {
    id: "dt-sanjuan",
    nombre: "San Juan del Sur",
    departamentoId: "rivas",
    descripcion: "Pueblo pesquero con playa de arena dorada, malecón animado y los mejores atardeceres del Pacífico nicaragüense.",
    imagen: IMG.sanjuan,
    actividades: [
      { id: "a-sanjuan-1", nombre: "Surf en Playa Maderas", descripcion: "Una de las mejores playas de surf de Centroamérica, olas consistentes todo el año.", categoria: "playa", dificultad: "media", duracion: "3-4 horas", precio: 0 },
      { id: "a-sanjuan-2", nombre: "Atardecer en el Malecón", descripcion: "Paseo por el malecón con restaurants y vista al atardecer sobre el Pacífico.", categoria: "cultura", dificultad: "baja", duracion: "1-2 horas", precio: 0 },
      { id: "a-sanjuan-3", nombre: "Tour de ballenas", descripcion: "Avistamiento de ballenas jorobadas de julio a diciembre.", categoria: "naturaleza", dificultad: "baja", duracion: "3 horas", precio: 800 },
    ],
  },
  // Managua
  {
    id: "dt-managua-centro",
    nombre: "Managua Histórica",
    departamentoId: "managua",
    descripcion: "Capital de Nicaragua con el Lago de Managua, el Malecón de Tierra Popayana y ruinas de la antigua catedral destruida por el terremoto de 1972.",
    imagen: IMG.leon,
    actividades: [
      { id: "a-managua-1", nombre: "Malecón de Tierra Popayana", descripcion: "Atracciones turísticas, restaurantes y artesanías junto al lago.", categoria: "cultura", dificultad: "baja", duracion: "2 horas", precio: 0 },
      { id: "a-managua-2", nombre: "Ruinas de la Catedral Vieja", descripcion: "Restos de la catedral destruida en 1972, símbolo de resistencia.", categoria: "cultura", dificultad: "baja", duracion: "30 min", precio: 0 },
    ],
  },
  // Masaya
  {
    id: "dt-masaya",
    nombre: "Masaya y la Laguna de Apoyo",
    departamentoId: "masaya",
    descripcion: "Ciudad de las flores y el mercado de artesanías, junto a la laguna de Apoyo, un cráter volcánico convertido en lago de aguas termales.",
    imagen: IMG.matagalpa,
    actividades: [
      { id: "a-masaya-1", nombre: "Mercado de Artesanías de Masaya", descripcion: "El mercado indígena más grande de Nicaragua, artesanías en madera, barro y textiles.", categoria: "cultura", dificultad: "baja", duracion: "2 horas", precio: 0 },
      { id: "a-masaya-2", nombre: "Natación en la Laguna de Apoyo", descripcion: "Lago de cráter volcánico con aguas cálidas y minerales, perfecto para relajarse.", categoria: "naturaleza", dificultad: "baja", duracion: "3-4 horas", precio: 150 },
    ],
  },
  // Estelí
  {
    id: "dt-esteli",
    nombre: "Estelí y las Reservas Naturales",
    departamentoId: "esteli",
    descripcion: "Ciudad de los puros artesanales y las montañas verdes, puerta de entrada a las Reservas de Biosfera de la Cordillera Isabelia.",
    imagen: IMG.matagalpa,
    actividades: [
      { id: "a-esteli-1", nombre: "Ruta de los Puros Artesanales", descripcion: "Visita a fábricas de puros hechos a mano, tradición de Estelí.", categoria: "cultura", dificultad: "baja", duracion: "1.5 horas", precio: 0 },
      { id: "a-esteli-2", nombre: "Cascada de Tisey", descripcion: "Caminata por bosque nublado hasta una cascada en las montañas.", categoria: "naturaleza", dificultad: "media", duracion: "4 horas", precio: 200 },
    ],
  },
  // Matagalpa
  {
    id: "dt-matagalpa",
    nombre: "Matagalpa y las Montañas del Café",
    departamentoId: "matagalpa",
    descripcion: "Tierra de café y neblina, con fincas cafetaleras, senderos en la montaña y el clima fresco más agradable de Nicaragua.",
    imagen: IMG.matagalpa,
    actividades: [
      { id: "a-matagalpa-1", nombre: "Tour del Café", descripcion: "Recorrido por una finca cafetalera desde la semilla hasta la taza.", categoria: "cultura", dificultad: "baja", duracion: "3 horas", precio: 350 },
      { id: "a-matagalpa-2", nombre: "Sendero al Cerro Apante", descripcion: "Mirador natural con vista panorámica de la ciudad y montañas.", categoria: "naturaleza", dificultad: "media", duracion: "2.5 horas", precio: 100 },
    ],
  },
  // Caribe
  {
    id: "dt-corn",
    nombre: "Corn Island",
    departamentoId: "caribe",
    descripcion: "Islas caribeñas con agua turquesa, arena blanca y arrecifes de coral. Paraíso de snorkel, buceo y relax total.",
    imagen: IMG.corn,
    actividades: [
      { id: "a-corn-1", nombre: "Snorkel en el Arrecife", descripcion: "Explora los arrecifes de coral con peces tropicales y tortugas.", categoria: "playa", dificultad: "baja", duracion: "2 horas", precio: 400 },
      { id: "a-corn-2", nombre: "Playa Long Beach", descripcion: "La play más grande y tranquila de Little Corn, ideal para nadar.", categoria: "playa", dificultad: "baja", duracion: "3-4 horas", precio: 0 },
      { id: "a-corn-3", nombre: "Paseo en bote a Great Corn", descripcion: "Visita a la isla principal con playa y restaurantes caribeños.", categoria: "aventura", dificultad: "baja", duracion: "4 horas", precio: 300 },
    ],
  },
];
