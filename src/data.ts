// ============================================================
// Hotelica — Datos simulados de la base de datos `hotelica`
// Fase 1: maqueta funcional (sin backend todavía)
// ============================================================

// ----- Tipos que reflejan las tablas de hotelica.sql -----

export type Departamento = { id: string; nombre: string };

export type Municipio = { id: string; nombre: string; departamentoId: string; centro: { lat: number; lng: number } };

// Punto del mapa en coordenadas WGS84 (latitud, longitud)
export type Punto = { lat: number; lng: number };

export type EstadoHotel = "pendiente" | "aprobado" | "rechazado";

export type Hotel = {
  id: string;
  nombre: string;
  dueno: string;
  departamentoId: string;
  municipioId: string;
  direccion: string;
  ubicacion?: Punto; // punto exacto marcado en el mapa (HU-037)
  descripcion: string;
  imagen: string;
  galeria: string[];
  amenidades: string[];
  destacado: boolean;
  aprobado: EstadoHotel;
  rating: number; // calificación promedio
  totalResenas: number;
  fechaRegistro: string;
  contacto?: string; // teléfono opcional que dejó el hotelero al inscribirse (HU-021)
  correoDueno?: string; // correo con el que el hotelero va a entrar a su panel
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
  galeria: string[]; // fotos del tipo de habitación; la primera es la portada (HU-041)
};

// Los tres estados posibles de una habitación, en el orden en que se ofrecen
export const ESTADOS_HABITACION: EstadoHabitacion[] = ["disponible", "mantenimiento", "no_disponible"];

// Lo que el hotelero completa al registrar una habitación (HU-023)
export type DatosHabitacion = {
  tipo: string;
  capacidad: number;
  precio: number;
  unidades: number;
  estado: EstadoHabitacion;
  detalle: string;
  galeria: string[]; // fotos elegidas al registrar (HU-041)
};

// Errores campo por campo del formulario de habitación; sin errores, se puede registrar
export type ErroresHabitacion = Partial<Record<keyof DatosHabitacion, string>>;

export type EstadoReserva = "pendiente" | "confirmada" | "checkin" | "completada" | "cancelada";

export type Reserva = {
  folio: string;
  hotelId: string;
  habitacionId: string;
  turista: string;
  correo: string;
  telefono: string;
  comentarios: string;
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
  // Por qué el hotel rechazó la solicitud (HU-027), vacío si no hubo rechazo
  motivoRechazo?: string;
  // Fecha y hora en que el hotel registró la entrada (HU-028)
  checkinEn?: string;
  // Fecha y hora en que el hotel registró la salida (HU-029)
  checkoutEn?: string;
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
  { id: "caribe", nombre: "Costa Caribe Sur" },
];

// El centro de cada municipio sirve para centrar el mapa y para validar la
// ubicación exacta que marca el hotelero (HU-037)
export const MUNICIPIOS: Municipio[] = [
  { id: "m-granada", nombre: "Granada", departamentoId: "granada", centro: { lat: 11.9346, lng: -85.956 } },
  { id: "m-diria", nombre: "Diriá", departamentoId: "granada", centro: { lat: 11.885, lng: -86.035 } },
  { id: "m-nandaime", nombre: "Nandaime", departamentoId: "granada", centro: { lat: 11.7578, lng: -86.2519 } },
  { id: "m-rivas", nombre: "Rivas", departamentoId: "rivas", centro: { lat: 11.4014, lng: -85.8292 } },
  { id: "m-sanjuan", nombre: "San Juan del Sur", departamentoId: "rivas", centro: { lat: 11.2513, lng: -85.873 } },
  { id: "m-tola", nombre: "Tola", departamentoId: "rivas", centro: { lat: 11.435, lng: -85.95 } },
  { id: "m-altagracia", nombre: "Altagracia (Ometepe)", departamentoId: "rivas", centro: { lat: 11.467, lng: -85.613 } },
  { id: "m-leon", nombre: "León", departamentoId: "leon", centro: { lat: 12.4356, lng: -86.8772 } },
  { id: "m-telica", nombre: "Telica", departamentoId: "leon", centro: { lat: 12.495, lng: -86.69 } },
  { id: "m-nagarote", nombre: "Nagarote", departamentoId: "leon", centro: { lat: 12.2667, lng: -86.564 } },
  { id: "m-masaya", nombre: "Masaya", departamentoId: "masaya", centro: { lat: 11.975, lng: -86.252 } },
  { id: "m-catarina", nombre: "Catarina", departamentoId: "masaya", centro: { lat: 11.913, lng: -86.283 } },
  { id: "m-nindirí", nombre: "Nindirí", departamentoId: "masaya", centro: { lat: 12.002, lng: -86.222 } },
  { id: "m-matagalpa", nombre: "Matagalpa", departamentoId: "matagalpa", centro: { lat: 12.9256, lng: -85.9272 } },
  { id: "m-sanramon", nombre: "San Ramón", departamentoId: "matagalpa", centro: { lat: 12.9233, lng: -85.846 } },
  { id: "m-sebaco", nombre: "Sébaco", departamentoId: "matagalpa", centro: { lat: 12.9333, lng: -86.1 } },
  { id: "m-esteli", nombre: "Estelí", departamentoId: "esteli", centro: { lat: 13.0919, lng: -86.3539 } },
  { id: "m-condega", nombre: "Condega", departamentoId: "esteli", centro: { lat: 13.1653, lng: -86.3267 } },
  { id: "m-managua", nombre: "Managua", departamentoId: "managua", centro: { lat: 12.115, lng: -86.268 } },
  { id: "m-tipitapa", nombre: "Tipitapa", departamentoId: "managua", centro: { lat: 12.196, lng: -86.298 } },
  { id: "m-sandino", nombre: "Ciudad Sandino", departamentoId: "managua", centro: { lat: 12.161, lng: -86.344 } },
  { id: "m-bluefields", nombre: "Bluefields", departamentoId: "caribe", centro: { lat: 11.964, lng: -83.735 } },
  { id: "m-corn", nombre: "Corn Island", departamentoId: "caribe", centro: { lat: 11.9417, lng: -83.0536 } },
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
    ubicacion: { lat: 11.9302, lng: -85.9553 }, // La Calzada, Granada
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
    ubicacion: { lat: 11.2505, lng: -85.8735 }, // malecón de la bahía
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
    ubicacion: { lat: 11.4335, lng: -85.6482 }, // camino a la cascada San Ramón
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
    ubicacion: { lat: 12.4353, lng: -86.8745 }, // León centro
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
    ubicacion: { lat: 12.9083, lng: -85.8867 }, // Km 4 hacia San Ramón
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
    ubicacion: { lat: 11.9408, lng: -83.0478 }, // South West Bay, Little Corn
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
    ubicacion: { lat: 11.914, lng: -86.281 }, // mirador de Catarina
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
    ubicacion: { lat: 12.5033, lng: -86.7047 }, // Los Portillas, falda del Telica
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
    ubicacion: { lat: 12.1673, lng: -86.2733 }, // Carretera Norte Km 11
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
  { id: "g1", hotelId: "h-granada", tipo: "Estándar Doble", capacidad: 2, precio: 1200, unidades: 5, estado: "disponible", galeria: [], detalle: "Cama doble, baño privado y vista al patio de las buganvilias." },
  { id: "g2", hotelId: "h-granada", tipo: "Superior Colonial", capacidad: 3, precio: 1500, unidades: 4, estado: "disponible", galeria: [], detalle: "Cama queen + sofá cama, pisos originales de barro cocido." },
  { id: "g3", hotelId: "h-granada", tipo: "Suite del Mombacho", capacidad: 4, precio: 2400, unidades: 2, estado: "disponible", galeria: [], detalle: "Suite con terraza privada y vista al volcán Mombacho." },
  { id: "g4", hotelId: "h-granada", tipo: "Familiar Los Patios", capacidad: 6, precio: 2900, unidades: 2, estado: "mantenimiento", galeria: [], detalle: "Dos ambientes conectados, ideal para familias grandes." },
  // Brisas del Pacífico
  { id: "s1", hotelId: "h-sanjuan", tipo: "Estándar Mar", capacidad: 2, precio: 1400, unidades: 6, estado: "disponible", galeria: [], detalle: "Cama queen y balcón con brisa directa del Pacífico." },
  { id: "s2", hotelId: "h-sanjuan", tipo: "Superior Bahía", capacidad: 3, precio: 1900, unidades: 4, estado: "disponible", galeria: [], detalle: "Vista frontal a la bahía, hamaca privada en el balcón." },
  { id: "s3", hotelId: "h-sanjuan", tipo: "Suite Surfista", capacidad: 4, precio: 2600, unidades: 2, estado: "disponible", galeria: [], detalle: "Ducha exterior, rack para tablas y mini refrigerador." },
  // Eco Lodge Ometepe Verde
  { id: "o1", hotelId: "h-ometepe", tipo: "Cabaña Bosque", capacidad: 2, precio: 1100, unidades: 6, estado: "disponible", galeria: [], detalle: "Cabaña de madera entre plataneras, baño con agua caliente solar." },
  { id: "o2", hotelId: "h-ometepe", tipo: "Cabaña Volcán", capacidad: 3, precio: 1600, unidades: 4, estado: "disponible", galeria: [], detalle: "Vista directa al Concepción desde la cama." },
  { id: "o3", hotelId: "h-ometepe", tipo: "Cabaña Familiar Ceiba", capacidad: 5, precio: 2200, unidades: 2, estado: "disponible", galeria: [], detalle: "Altillo para niños y corredor con mecedoras." },
  // La Casona del Sol
  { id: "l1", hotelId: "h-leon", tipo: "Estándar Colonial", capacidad: 2, precio: 950, unidades: 6, estado: "disponible", galeria: [], detalle: "Cama doble alrededor del patio de la casona." },
  { id: "l2", hotelId: "h-leon", tipo: "Superior Catedral", capacidad: 3, precio: 1350, unidades: 3, estado: "disponible", galeria: [], detalle: "Balcón con vista a los domos de la catedral." },
  { id: "l3", hotelId: "h-leon", tipo: "Suite Darío", capacidad: 2, precio: 1900, unidades: 2, estado: "no_disponible", galeria: [], detalle: "Suite homenaje con biblioteca de poesía incluida." },
  // Finca Café & Montaña
  { id: "c1", hotelId: "h-matagalpa", tipo: "Cabaña Pino", capacidad: 2, precio: 1050, unidades: 5, estado: "disponible", galeria: [], detalle: "Cabaña de pino con chimenea y olor a café recién tostado." },
  { id: "c2", hotelId: "h-matagalpa", tipo: "Cabaña Niebla", capacidad: 4, precio: 1650, unidades: 3, estado: "disponible", galeria: [], detalle: "Dos cuartos, perfecta para familias de montaña." },
  // Coco Loco Bungalows
  { id: "k1", hotelId: "h-corn", tipo: "Bungalow Playa", capacidad: 2, precio: 1800, unidades: 5, estado: "disponible", galeria: [], detalle: "A tres metros del mar, techo de palma y ducha caribeña." },
  { id: "k2", hotelId: "h-corn", tipo: "Bungalow Coco", capacidad: 3, precio: 2300, unidades: 3, estado: "disponible", galeria: [], detalle: "Bajo los cocoteros, con hamaca doble y vista turquesa." },
  { id: "k3", hotelId: "h-corn", tipo: "Familiar Marea", capacidad: 6, precio: 3400, unidades: 1, estado: "disponible", galeria: [], detalle: "El más grande, con cocina básica y mesa frente al mar." },
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

// Marca de ahora mismo con fecha y hora (yyyy-mm-ddTHH:MM), para el check-in (HU-028)
export function ahoraISO(): string {
  const d = new Date();
  const hora = `${d.getHours()}`.padStart(2, "0");
  const minuto = `${d.getMinutes()}`.padStart(2, "0");
  return `${aISO(d)}T${hora}:${minuto}`;
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

// Formatea la marca de entrada con su hora: 12 ago 2026 · 2:35 p.m. (HU-028)
export function fmtFechaHora(marca: string): string {
  return new Date(marca).toLocaleString("es-NI", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Tasa de IVA aplicada a las reservas (15% según la regla de negocio de HU-014)
export const TASA_IVA = 0.15;

// Reglas de negocio del cálculo de reserva (subtotal + IVA + total)
// Entradas inválidas (negativas, NaN o infinitas) se tratan como 0 para
// garantizar que el total nunca resulte negativo o indeterminado.
export function calcularTotales(precioNoche: number, noches: number) {
  const precio = Number.isFinite(precioNoche) && precioNoche > 0 ? precioNoche : 0;
  const n = Number.isFinite(noches) && noches > 0 ? Math.round(noches) : 0;
  const subtotal = precio * n;
  const iva = Math.round(subtotal * TASA_IVA);
  return { subtotal, iva, total: subtotal + iva };
}

// Nueva calificación promedio = ((promedio × reseñas) + nueva) ÷ (reseñas + 1)
export function nuevoPromedio(promedio: number, totalResenas: number, estrellas: number): number {
  return Math.round(((promedio * totalResenas + estrellas) / (totalResenas + 1)) * 10) / 10;
}

// ----- Calificación de la estadía (HU-019) -----

// Equivalente a la tabla `calificaciones`: una fila por reserva calificada
export type Calificacion = {
  id: string;
  folio: string;      // reserva que originó la calificación
  hotelId: string;
  autor: string;
  estrellas: number;  // entero de 1 a 5
  comentario: string; // opcional
  fecha: string;      // ISO (yyyy-mm-dd)
};

// Solo se puede calificar después del check-out y una sola vez por reserva
export function sePuedeCalificar(reserva: Pick<Reserva, "estado" | "calificada">): boolean {
  return reserva.estado === "completada" && !reserva.calificada;
}

// Las estrellas tienen que ser un entero entre 1 y 5
export function validarCalificacion(estrellas: number): string {
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
    return "La calificación debe estar entre 1 y 5 estrellas.";
  }
  return "";
}

// Devuelve la calificación que dejó el turista en una reserva
export function calificacionDe(lista: Calificacion[], folio: string): Calificacion | undefined {
  return lista.find((c) => c.folio === folio);
}

// ----- Favoritos por cuenta (HU-020) -----

// Cada cuenta tiene su lista de favoritos; sin sesión se usa la clave de invitado
export function claveDeFavoritos(usuario: { correo: string } | null | undefined): string {
  const correo = usuario?.correo?.trim().toLowerCase();
  return correo ? correo : "invitado";
}

// Lista de favoritos de la cuenta consultada
export function favoritosDe(
  mapa: Record<string, string[]>,
  usuario: { correo: string } | null | undefined
): string[] {
  return mapa[claveDeFavoritos(usuario)] ?? [];
}

// Marca o desmarca un hotel de la lista, sin dejar duplicados
export function alternarFavoritoDe(lista: string[], hotelId: string): string[] {
  return lista.includes(hotelId)
    ? lista.filter((f) => f !== hotelId)
    : [...lista, hotelId];
}

// ----- Inscripción de un hotel desde el inicio público (HU-021) -----

// Lo que el hotelero completa en el formulario de inscripción
export type DatosRegistroHotel = {
  dueno: string; // nombre de quien administra el hotel
  correo: string; // correo con el que va a entrar a su panel (la cuenta la crea el admin)
  nombre: string;
  departamentoId: string;
  municipioId: string;
  direccion: string;
  ubicacion: Punto | null; // punto exacto marcado en el mapa (HU-037)
  descripcion: string;
  telefono: string; // opcional
  imagen: string; // data URL de la foto representativa
};

// Errores campo por campo; si no queda ninguno, el formulario se puede enviar
export type ErroresRegistroHotel = Partial<Record<keyof DatosRegistroHotel, string>>;

// Cuenta de hotelero creada por el administrador al aprobar la solicitud (HU-021)
export type CuentaHotelero = {
  correo: string;
  contrasena: string;
  nombre: string; // nombre del dueño, que es el nombre del usuario
  hotelId: string;
  creadaEn: string; // fecha y hora en que el admin creó la cuenta (ISO)
  contrasenaTemporal: boolean; // true mientras no cambie la contraseña que dio el admin
};

// La contraseña temporal que regala el admin solo dura 48 horas (seguridad HU-040)
export const VIDA_TEMPORAL_MS = 48 * 60 * 60 * 1000;

// ¿Pasaron ya las 48 horas sin que el hotelero haya cambiado su contraseña?
export function contrasenaTemporalVencida(cuenta: CuentaHotelero, ahora = Date.now()): boolean {
  if (!cuenta.contrasenaTemporal) return false;
  return ahora - new Date(cuenta.creadaEn).getTime() > VIDA_TEMPORAL_MS;
}

// Contraseña temporal que recibe el hotelero junto con su cuenta
export function generarContrasenaHotelero(): string {
  return `hotel${Math.floor(1000 + Math.random() * 9000)}`;
}

// ----- Criterios de contraseña segura del hotelero (HU-040) -----

// Estado de cada criterio; sirve para las palomitas de la interfaz y para validar
export type CriteriosContrasena = {
  largo: boolean; // al menos 8 caracteres
  minuscula: boolean; // al menos una letra minúscula
  numero: boolean; // al menos un número
  simbolo: boolean; // al menos un símbolo (@ # ! ? etc.)
};

// Revisa los cuatro criterios de una contraseña nueva
export function criteriosDeContrasena(clave: string): CriteriosContrasena {
  return {
    largo: clave.length >= 8,
    minuscula: /[a-záéíóúñ]/.test(clave),
    numero: /[0-9]/.test(clave),
    simbolo: /[^A-Za-z0-9áéíóúñÁÉÍÓÚÑ]/.test(clave),
  };
}

// ¿La contraseña cumple los cuatro criterios?
export function esContrasenaSegura(clave: string): boolean {
  const c = criteriosDeContrasena(clave);
  return c.largo && c.minuscula && c.numero && c.simbolo;
}

// Mensaje del primer criterio que falte (vacío si la contraseña está bien)
export function errorCriteriosContrasena(clave: string): string {
  const c = criteriosDeContrasena(clave);
  if (!c.largo) return "La contraseña debe tener al menos 8 caracteres.";
  if (!c.minuscula) return "La contraseña debe incluir al menos una letra minúscula.";
  if (!c.numero) return "La contraseña debe incluir al menos un número.";
  if (!c.simbolo) return "La contraseña debe incluir al menos un símbolo (por ejemplo: @ # ! ?).";
  return "";
}

// ----- Ubicación exacta del hotel en el mapa (HU-037) -----

// Límites aproximados de Nicaragua: un pin fuera de ellos no corresponde
export const LIMITES_NICARAGUA = { latMin: 10.7, latMax: 15.0, lngMin: -87.7, lngMax: -83.1 };

// Qué tan lejos del centro del municipio declarado se puede marcar el pin
export const RADIO_MUNICIPIO_KM = 30;

// Distancia en línea recta entre dos puntos, en kilómetros (fórmula haversine)
export function distanciaKm(a: Punto, b: Punto): number {
  const rad = (grados: number) => (grados * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// Devuelve el motivo por el que la ubicación no sirve, o undefined si está bien
export function validarUbicacionExacta(
  ubicacion: Punto | null,
  municipioId: string
): string | undefined {
  if (!ubicacion || !Number.isFinite(ubicacion.lat) || !Number.isFinite(ubicacion.lng)) {
    return "Marcá la ubicación exacta del hotel en el mapa.";
  }

  const { lat, lng } = ubicacion;
  if (
    lat < LIMITES_NICARAGUA.latMin || lat > LIMITES_NICARAGUA.latMax ||
    lng < LIMITES_NICARAGUA.lngMin || lng > LIMITES_NICARAGUA.lngMax
  ) {
    return "Ese punto queda fuera de Nicaragua: mové el mapa y marcá dónde está tu hotel.";
  }

  // El pin tiene que quedar cerca del municipio que se está declarando
  const municipio = MUNICIPIOS.find((m) => m.id === municipioId);
  if (municipio) {
    const distancia = distanciaKm(ubicacion, municipio.centro);
    if (distancia > RADIO_MUNICIPIO_KM) {
      return `El punto está a ${Math.round(distancia)} km de ${municipio.nombre}: mové el pin dentro de tu municipio.`;
    }
  }

  return undefined;
}

// Revisa todos los campos del formulario antes de enviar la solicitud
export function validarRegistroHotel(
  datos: DatosRegistroHotel,
  hotelesExistentes: Hotel[] = []
): ErroresRegistroHotel {
  const errores: ErroresRegistroHotel = {};

  // Dueño: obligatorio, es con quien se comunica la plataforma
  const dueno = datos.dueno.trim();
  if (!dueno) {
    errores.dueno = "Tu nombre es obligatorio: sos el dueño del hotel.";
  } else if (dueno.length < 4) {
    errores.dueno = "Escribí tu nombre completo (al menos 4 caracteres).";
  } else if (dueno.length > 60) {
    errores.dueno = "El nombre no puede pasar de 60 caracteres.";
  }

  // Correo: con él el hotelero va a entrar a su panel cuando el admin cree la cuenta
  const correo = datos.correo.trim().toLowerCase();
  if (!correo) {
    errores.correo = "El correo es obligatorio: ahí recibirás tu cuenta de hotelero.";
  } else if (!esCorreo(correo)) {
    errores.correo = "Ingresá un correo válido, por ejemplo: dueño@tuhotel.com";
  } else if (hotelesExistentes.some((h) => h.correoDueno?.toLowerCase() === correo)) {
    errores.correo = "Ese correo ya tiene un hotel inscrito: entrá con tu cuenta.";
  }

  // Nombre: obligatorio, con un largo razonable y sin repetir el de otro hotel
  const nombre = datos.nombre.trim();
  if (!nombre) {
    errores.nombre = "El nombre del hotel es obligatorio.";
  } else if (nombre.length < 4) {
    errores.nombre = "El nombre debe tener al menos 4 caracteres.";
  } else if (nombre.length > 60) {
    errores.nombre = "El nombre no puede pasar de 60 caracteres.";
  } else if (hotelesExistentes.some((h) => h.nombre?.trim().toLowerCase() === nombre.toLowerCase())) {
    errores.nombre = "Ya hay un hotel registrado con ese nombre.";
  }

  // Departamento: tiene que ser uno del catálogo oficial
  if (!DEPARTAMENTOS.some((d) => d.id === datos.departamentoId)) {
    errores.departamentoId = "Seleccioná el departamento donde queda el hotel.";
  }

  // Municipio: tiene que existir y pertenecer al departamento elegido
  const municipio = MUNICIPIOS.find((m) => m.id === datos.municipioId);
  if (!municipio) {
    errores.municipioId = "Seleccioná el municipio.";
  } else if (municipio.departamentoId !== datos.departamentoId) {
    errores.municipioId = "Ese municipio no pertenece al departamento elegido.";
  }

  // Dirección: obligatoria y clara para que el huésped pueda llegar
  const direccion = datos.direccion.trim();
  if (!direccion) {
    errores.direccion = "La dirección es obligatoria.";
  } else if (direccion.length < 8) {
    errores.direccion = "Describí la dirección con al menos 8 caracteres.";
  } else if (direccion.length > 120) {
    errores.direccion = "La dirección no puede pasar de 120 caracteres.";
  }

  // Descripción: obligatoria, ni muy corta ni interminable
  const descripcion = datos.descripcion.trim();
  if (!descripcion) {
    errores.descripcion = "La descripción es obligatoria.";
  } else if (descripcion.length < 30) {
    errores.descripcion = "Contá un poco más del hotel: al menos 30 caracteres.";
  } else if (descripcion.length > 600) {
    errores.descripcion = "La descripción no puede pasar de 600 caracteres.";
  }

  // Teléfono: opcional, pero si se llena tiene que ser nicaragüense de 8 dígitos
  const telefono = datos.telefono.trim();
  if (telefono) {
    const errorTelefono = errorTelefonoNicaragua(telefono);
    if (errorTelefono) errores.telefono = errorTelefono;
  }

  // Imagen representativa: la revisamos al elegir el archivo
  if (!datos.imagen) {
    errores.imagen = "Cargá al menos una imagen representativa del hotel.";
  }

  // Ubicación exacta: obligatoria, dentro de Nicaragua y del municipio declarado (HU-037)
  const errorUbicacion = validarUbicacionExacta(datos.ubicacion, datos.municipioId);
  if (errorUbicacion) {
    errores.ubicacion = errorUbicacion;
  }

  return errores;
}

// Revisa que la foto elegida sea imagen y no pese más de 5 MB
export function validarImagenHotel(archivo: File): string {
  if (!archivo.type.startsWith("image/")) {
    return "El archivo tiene que ser una imagen (JPG, PNG o WEBP).";
  }
  if (archivo.size > 5 * 1024 * 1024) {
    return "La imagen pesa más de 5 MB: elegí una más liviana.";
  }
  return "";
}

// Revisa los datos de una habitación nueva antes de registrarla (HU-023)
export function validarHabitacion(
  datos: DatosHabitacion,
  habitacionesDelHotel: Habitacion[] = []
): ErroresHabitacion {
  const errores: ErroresHabitacion = {};

  // Tipo: obligatorio, con largo razonable y sin repetir otro tipo del mismo hotel
  const tipo = datos.tipo.trim();
  if (!tipo) {
    errores.tipo = "El tipo de habitación es obligatorio, por ejemplo: Estándar Doble.";
  } else if (tipo.length < 4) {
    errores.tipo = "El tipo debe tener al menos 4 caracteres.";
  } else if (tipo.length > 40) {
    errores.tipo = "El tipo no puede pasar de 40 caracteres.";
  } else if (habitacionesDelHotel.some((h) => h.tipo.trim().toLowerCase() === tipo.toLowerCase())) {
    errores.tipo = "Ya tenés un tipo de habitación con ese nombre en este hotel.";
  }

  // Capacidad: cuántos huéspedes admite la habitación
  const capacidad = Number(datos.capacidad);
  if (!Number.isInteger(capacidad) || capacidad < 1) {
    errores.capacidad = "La capacidad debe ser un número entero de al menos 1 huésped.";
  } else if (capacidad > 10) {
    errores.capacidad = "La capacidad no puede pasar de 10 huéspedes.";
  }

  // Precio por noche: la misma regla que usa la configuración de precios (HU-024)
  const errorPrecio = errorDePrecio(datos.precio);
  if (errorPrecio) errores.precio = errorPrecio;

  // Unidades: cuántas habitaciones iguales existen en el hotel
  const unidades = Number(datos.unidades);
  if (!Number.isInteger(unidades) || unidades < 1) {
    errores.unidades = "Las unidades deben ser un número entero de al menos 1.";
  } else if (unidades > 50) {
    errores.unidades = "No podés registrar más de 50 unidades de un mismo tipo.";
  }

  // Estado: tiene que ser uno de los tres que maneja la base de datos
  if (!ESTADOS_HABITACION.includes(datos.estado)) {
    errores.estado = "Elegí un estado válido para la habitación.";
  }

  // Detalle: texto corto que describe la habitación al turista
  const detalle = datos.detalle.trim();
  if (!detalle) {
    errores.detalle = "Escribí una descripción breve de la habitación.";
  } else if (detalle.length < 15) {
    errores.detalle = "La descripción debe tener al menos 15 caracteres.";
  } else if (detalle.length > 200) {
    errores.detalle = "La descripción no puede pasar de 200 caracteres.";
  }

  return errores;
}

// ----- Precios por noche del hotel (HU-024) -----

// Precio máximo por noche que acepta el sistema
const PRECIO_MAXIMO = 50000;

// Ajustes de temporada que el hotelero puede aplicar a todas sus tarifas
// El ajuste va en tanto por uno: 0.2 es un 20 % más
// ("personalizado" no es una temporada: la usa el panel para escribir otro porcentaje)
export const TEMPORADAS = [
  { id: "normal", nombre: "Temporada normal (0 %)", ajuste: 0, nota: "Deja las tarifas tal como están hoy." },
  { id: "alta", nombre: "Temporada alta (+20 %)", ajuste: 0.2, nota: "Feriados y vacaciones: las noches se venden más caras." },
  { id: "baja", nombre: "Temporada baja (−15 %)", ajuste: -0.15, nota: "Meses flojos: baja la tarifa para llenar el hotel." },
] as const;

// Límites del ajuste que se puede aplicar a un precio
const AJUSTE_MINIMO = -0.5;
const AJUSTE_MAXIMO = 1;

// Revisa un precio por noche y devuelve el motivo del error, o "" si está bien (HU-024)
export function errorDePrecio(precio: number): string {
  const n = Number(precio);
  if (!Number.isFinite(n) || n <= 0) return "El precio por noche debe ser mayor que cero.";
  if (n > PRECIO_MAXIMO) return `El precio por noche no puede pasar de ${fmtDinero(PRECIO_MAXIMO)}.`;
  return "";
}

// Revisa el ajuste de temporada antes de aplicarlo a las tarifas (HU-024)
export function errorDeAjuste(ajuste: number): string {
  const n = Number(ajuste);
  if (!Number.isFinite(n)) return "Elegí un ajuste válido para la temporada.";
  if (n < AJUSTE_MINIMO) return "El ajuste no puede bajar más del 50 %.";
  if (n > AJUSTE_MAXIMO) return "El ajuste no puede subir más del 100 %.";
  return "";
}

// Aplica un ajuste de temporada a un precio y lo deja en córdobas enteros.
// El resultado nunca sale de los límites que acepta el sistema (HU-024)
export function ajustarPrecio(precio: number, ajuste: number): number {
  const base = Number.isFinite(precio) && precio > 0 ? precio : 0;
  // Un ajuste escrito a medias (por ejemplo vacío) no cambia el precio
  if (!Number.isFinite(ajuste)) return base;
  const nuevo = Math.round(base * (1 + ajuste));
  return Math.min(PRECIO_MAXIMO, Math.max(1, nuevo));
}

// ----- Fotografías del hotel (HU-025) -----

// Tope de fotos por hotel: la maqueta las guarda dentro de los datos del navegador
export const MAXIMO_FOTOS = 6;

// Cuántas fotos más entran en la galería del hotel (HU-025)
export function cupoDeFotos(cantidadActual: number): number {
  return Math.max(0, MAXIMO_FOTOS - cantidadActual);
}

// Revisa si la galería todavía admite fotos; devuelve el motivo o "" (HU-025)
export function errorDeGaleria(cantidadActual: number): string {
  if (cupoDeFotos(cantidadActual) > 0) return "";
  return `Ya tenés ${MAXIMO_FOTOS} fotos, el máximo por hotel. Quitá una para subir otra.`;
}

// Devuelve la galería con la foto elegida en el primer lugar, que es la portada (HU-025)
export function conPortada(galeria: string[], indice: number): string[] {
  if (indice <= 0 || indice >= galeria.length) return galeria;
  const elegida = galeria[indice];
  return [elegida, ...galeria.filter((_, i) => i !== indice)];
}

// ----- Fotos de las habitaciones (HU-041) -----

// Tope de fotos por tipo de habitación (menos que el hotel: es el mismo cuarto)
export const MAXIMO_FOTOS_HABITACION = 4;

// Cuántas fotos más entran en la galería de una habitación (HU-041)
export function cupoDeFotosHabitacion(cantidadActual: number): number {
  return Math.max(0, MAXIMO_FOTOS_HABITACION - cantidadActual);
}

// Revisa si la galería de la habitación aún admite fotos; devuelve el motivo o "" (HU-041)
export function errorDeGaleriaHabitacion(cantidadActual: number): string {
  if (cupoDeFotosHabitacion(cantidadActual) > 0) return "";
  return `Ya tenés ${MAXIMO_FOTOS_HABITACION} fotos, el máximo por habitación. Quitá una para subir otra.`;
}

// Correo con formato usuario@dominio.algo
function esCorreo(texto: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto);
}

// Teléfono de Nicaragua: empieza por 2, 5, 7 u 8 y tiene exactamente 8 dígitos
// (se dejan pasar espacios y guiones al escribir, y un prefijo 505 opcional)
export function errorTelefonoNicaragua(texto: string): string {
  const digitos = texto.replace(/[\s-]/g, "");
  const nacional = digitos.startsWith("505") && digitos.length === 11 ? digitos.slice(3) : digitos;
  if (!/^\d*$/.test(nacional)) return "El teléfono solo admite números (sin letras ni símbolos).";
  if (nacional.length !== 8) return "El teléfono debe tener exactamente 8 dígitos.";
  if (!/^[2578]/.test(nacional)) return "El teléfono debe empezar por 2, 5, 7 u 8.";
  return "";
}

// Versión booleana, para cuando solo hace falta saber si el número sirve
export function esTelefonoNicaragua(texto: string): boolean {
  return errorTelefonoNicaragua(texto) === "";
}

// Deja solo los dígitos escritos, con el máximo de un teléfono nicaragüense
export function soloDigitosTelefono(texto: string): string {
  return texto.replace(/\D/g, "").slice(0, 8);
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
    folio, hotelId, habitacionId, turista,
    correo: `${turista.toLowerCase().replace(/\s+/g, ".")}@correo.com`,
    telefono: "8888-1234",
    comentarios: "",
    llegada,
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

  // Reservas de demostración: fechas ocupadas para mostrar sugerencias
  // Hotel San Juan del Sur - Llenar TODAS las unidades para fechas específicas
  // s1 = 6 unidades, s2 = 4 unidades, s3 = 2 unidades = 12 total

  // OCTUBRE - Fechas completamente bloqueadas para demostración

  // 3 Oct (HOY+12) - COMPLETAMENTE LLENO
  demo("HC-3001", "h-sanjuan", "s1", "Pedro Martínez", sumarDias(HOY, 12), 3, 2, "tarjeta", "confirmada"),
  demo("HC-3002", "h-sanjuan", "s1", "María López", sumarDias(HOY, 12), 3, 2, "efectivo", "confirmada"),
  demo("HC-3003", "h-sanjuan", "s1", "Carlos Ruiz", sumarDias(HOY, 12), 3, 2, "tarjeta", "confirmada"),
  demo("HC-3004", "h-sanjuan", "s1", "Ana García", sumarDias(HOY, 12), 3, 2, "transferencia", "confirmada"),
  demo("HC-3005", "h-sanjuan", "s1", "José Martínez", sumarDias(HOY, 12), 3, 2, "tarjeta", "confirmada"),
  demo("HC-3006", "h-sanjuan", "s1", "Laura Sánchez", sumarDias(HOY, 12), 3, 2, "efectivo", "confirmada"),
  demo("HC-3007", "h-sanjuan", "s2", "Carlos Ramírez", sumarDias(HOY, 12), 4, 3, "tarjeta", "confirmada"),
  demo("HC-3008", "h-sanjuan", "s2", "María Herrera", sumarDias(HOY, 12), 4, 3, "efectivo", "confirmada"),
  demo("HC-3009", "h-sanjuan", "s2", "Pedro López", sumarDias(HOY, 12), 4, 3, "tarjeta", "confirmada"),
  demo("HC-3010", "h-sanjuan", "s2", "Ana Castillo", sumarDias(HOY, 12), 4, 3, "transferencia", "confirmada"),
  demo("HC-3011", "h-sanjuan", "s3", "Sofía Torres", sumarDias(HOY, 12), 3, 2, "tarjeta", "confirmada"),
  demo("HC-3012", "h-sanjuan", "s3", "Diego Vargas", sumarDias(HOY, 12), 3, 2, "efectivo", "confirmada"),

  // 4 Oct (HOY+13) - COMPLETAMENTE LLENO
  demo("HC-3013", "h-sanjuan", "s1", "Laura Martínez", sumarDias(HOY, 13), 2, 2, "tarjeta", "confirmada"),
  demo("HC-3014", "h-sanjuan", "s1", "José Hernández", sumarDias(HOY, 13), 2, 2, "efectivo", "confirmada"),
  demo("HC-3015", "h-sanjuan", "s1", "María García", sumarDias(HOY, 13), 2, 2, "tarjeta", "confirmada"),
  demo("HC-3016", "h-sanjuan", "s1", "Pedro López", sumarDias(HOY, 13), 2, 2, "transferencia", "confirmada"),
  demo("HC-3017", "h-sanjuan", "s1", "Ana Martínez", sumarDias(HOY, 13), 2, 2, "tarjeta", "confirmada"),
  demo("HC-3018", "h-sanjuan", "s1", "Carlos Ruiz", sumarDias(HOY, 13), 2, 2, "efectivo", "confirmada"),
  demo("HC-3019", "h-sanjuan", "s2", "Sofía Torres", sumarDias(HOY, 13), 3, 2, "tarjeta", "confirmada"),
  demo("HC-3020", "h-sanjuan", "s2", "Diego Vargas", sumarDias(HOY, 13), 3, 2, "efectivo", "confirmada"),
  demo("HC-3021", "h-sanjuan", "s2", "Laura Gómez", sumarDias(HOY, 13), 3, 2, "tarjeta", "confirmada"),
  demo("HC-3022", "h-sanjuan", "s2", "Carlos Ramírez", sumarDias(HOY, 13), 3, 2, "transferencia", "confirmada"),
  demo("HC-3023", "h-sanjuan", "s3", "María Herrera", sumarDias(HOY, 13), 4, 3, "tarjeta", "confirmada"),
  demo("HC-3024", "h-sanjuan", "s3", "Pedro López", sumarDias(HOY, 13), 4, 3, "efectivo", "confirmada"),

  // 5 Oct (HOY+14) - COMPLETAMENTE LLENO
  demo("HC-3025", "h-sanjuan", "s1", "Ana Castillo", sumarDias(HOY, 14), 3, 2, "tarjeta", "confirmada"),
  demo("HC-3026", "h-sanjuan", "s1", "José Martínez", sumarDias(HOY, 14), 3, 2, "efectivo", "confirmada"),
  demo("HC-3027", "h-sanjuan", "s1", "Laura Sánchez", sumarDias(HOY, 14), 3, 2, "tarjeta", "confirmada"),
  demo("HC-3028", "h-sanjuan", "s1", "María López", sumarDias(HOY, 14), 3, 2, "transferencia", "confirmada"),
  demo("HC-3029", "h-sanjuan", "s1", "Pedro Martínez", sumarDias(HOY, 14), 3, 2, "tarjeta", "confirmada"),
  demo("HC-3030", "h-sanjuan", "s1", "Carlos García", sumarDias(HOY, 14), 3, 2, "efectivo", "confirmada"),
  demo("HC-3031", "h-sanjuan", "s2", "María García", sumarDias(HOY, 14), 2, 2, "tarjeta", "confirmada"),
  demo("HC-3032", "h-sanjuan", "s2", "Pedro López", sumarDias(HOY, 14), 2, 2, "efectivo", "confirmada"),
  demo("HC-3033", "h-sanjuan", "s2", "Ana Martínez", sumarDias(HOY, 14), 2, 2, "tarjeta", "confirmada"),
  demo("HC-3034", "h-sanjuan", "s2", "Carlos Ruiz", sumarDias(HOY, 14), 2, 2, "transferencia", "confirmada"),
  demo("HC-3035", "h-sanjuan", "s3", "Laura Martínez", sumarDias(HOY, 14), 3, 3, "tarjeta", "confirmada"),
  demo("HC-3036", "h-sanjuan", "s3", "José Hernández", sumarDias(HOY, 14), 3, 3, "efectivo", "confirmada"),

  // 10 Oct (HOY+19) - COMPLETAMENTE LLENO
  demo("HC-3037", "h-sanjuan", "s1", "Sofía Torres", sumarDias(HOY, 19), 2, 2, "tarjeta", "confirmada"),
  demo("HC-3038", "h-sanjuan", "s1", "Diego Vargas", sumarDias(HOY, 19), 2, 2, "efectivo", "confirmada"),
  demo("HC-3039", "h-sanjuan", "s1", "Laura Gómez", sumarDias(HOY, 19), 2, 2, "tarjeta", "confirmada"),
  demo("HC-3040", "h-sanjuan", "s1", "Carlos Ramírez", sumarDias(HOY, 19), 2, 2, "transferencia", "confirmada"),
  demo("HC-3041", "h-sanjuan", "s1", "María Herrera", sumarDias(HOY, 19), 2, 2, "tarjeta", "confirmada"),
  demo("HC-3042", "h-sanjuan", "s1", "Pedro López", sumarDias(HOY, 19), 2, 2, "efectivo", "confirmada"),
  demo("HC-3043", "h-sanjuan", "s2", "Ana Castillo", sumarDias(HOY, 19), 3, 3, "tarjeta", "confirmada"),
  demo("HC-3044", "h-sanjuan", "s2", "José Martínez", sumarDias(HOY, 19), 3, 3, "efectivo", "confirmada"),
  demo("HC-3045", "h-sanjuan", "s2", "Laura Sánchez", sumarDias(HOY, 19), 3, 3, "tarjeta", "confirmada"),
  demo("HC-3046", "h-sanjuan", "s2", "María López", sumarDias(HOY, 19), 3, 3, "transferencia", "confirmada"),
  demo("HC-3047", "h-sanjuan", "s3", "Pedro Martínez", sumarDias(HOY, 19), 2, 2, "tarjeta", "confirmada"),
  demo("HC-3048", "h-sanjuan", "s3", "Carlos García", sumarDias(HOY, 19), 2, 2, "efectivo", "confirmada"),
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

// Recorrido normal de una reserva (HU-017): por aquí avanzan las que no se cancelan
export const FLUJO_RESERVA: EstadoReserva[] = ["pendiente", "confirmada", "checkin", "completada"];

// Índice del paso que está viviendo la reserva; -1 cuando está cancelada
export function pasoDeEstado(estado: EstadoReserva): number {
  return estado === "cancelada" ? -1 : FLUJO_RESERVA.indexOf(estado);
}

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

// ----- Historial de reservas del turista (HU-015) -----

// Nombre de la turista de demostración (la que aparece cuando nadie inicia sesión)
export const TURISTA_DEMO = USUARIOS_DEMO.turista.nombre;

// Devuelve solo las reservas del usuario, de más recientes a más antiguas.
// Sin sesión (usuario null) se muestran las reservas de la turista demo.
export function historialDeReservas(
  reservas: Reserva[],
  usuario: { nombre: string; correo: string } | null
): Reserva[] {
  const mias = usuario
    ? reservas.filter((r) => (usuario.correo !== "" && r.correo === usuario.correo) || r.turista === usuario.nombre)
    : reservas.filter((r) => r.turista === TURISTA_DEMO);
  // Más recientes primero: la fecha de creación ISO (yyyy-mm-dd) ordena alfabéticamente
  return [...mias].sort((a, b) => b.creada.localeCompare(a.creada));
}

// Solo se puede cancelar antes del check-in y si la reserva sigue abierta
// (pendiente o confirmada) — regla de negocio de HU-016
export function sePuedeCancelar(reserva: Pick<Reserva, "estado" | "llegada">, hoy: string): boolean {
  const estadoPermitido = reserva.estado === "pendiente" || reserva.estado === "confirmada";
  return estadoPermitido && reserva.llegada >= hoy;
}

// ----- Pagos de las reservas (HU-018) -----

export type EstadoPago = "pagado" | "pendiente" | "reembolsado";

// Registro de un pago asociado al folio de una reserva
export type Pago = {
  id: string;
  folio: string;      // reserva a la que pertenece
  monto: number;      // total cobrado
  metodo: Reserva["pago"];
  estado: EstadoPago;
  fecha: string;      // ISO (yyyy-mm-dd)
  referencia: string; // últimos 4 dígitos de la tarjeta o n.º de referencia
};

// Lo que el turista escribe en el formulario de pago
export type DatosPago = {
  titular: string;
  tarjeta: string;
  vencimiento: string; // MM/AA
  cvv: string;
  banco: string;
  referencia: string;
};

export const ETIQUETA_PAGO: Record<EstadoPago, string> = {
  pagado: "Pagado",
  pendiente: "Pendiente",
  reembolsado: "Reembolsado",
};

// Valida los datos del método elegido; devuelve "" cuando todo está bien
export function validarPago(metodo: Reserva["pago"], datos: DatosPago, hoy: string): string {
  // En efectivo no se pide nada: se paga al llegar al hotel
  if (metodo === "efectivo") return "";

  if (metodo === "transferencia") {
    if (!datos.banco.trim()) return "Selecciona el banco desde donde haces la transferencia.";
    if (datos.referencia.trim().length < 6) return "Ingresa el número de referencia de la transferencia (mínimo 6 caracteres).";
    return "";
  }

  // Tarjeta de crédito o débito
  const digitos = datos.tarjeta.replace(/\s+/g, "");
  if (!/^\d{16}$/.test(digitos)) return "El número de tarjeta debe tener 16 dígitos.";
  if (!datos.titular.trim()) return "Ingresa el nombre del titular de la tarjeta.";
  if (!/^\d{2}\/\d{2}$/.test(datos.vencimiento)) return "El vencimiento debe tener el formato MM/AA.";

  // Revisa que la tarjeta siga vigente comparando MM/AA con la fecha de hoy
  const [mes, anio] = datos.vencimiento.split("/").map(Number);
  if (mes < 1 || mes > 12) return "El mes de vencimiento no es válido.";
  const anioHoy = Number(hoy.slice(2, 4));
  const mesHoy = Number(hoy.slice(5, 7));
  if (anio < anioHoy || (anio === anioHoy && mes < mesHoy)) return "La tarjeta está vencida.";

  if (!/^\d{3}$/.test(datos.cvv)) return "El código de seguridad (CVV) tiene 3 dígitos.";
  return "";
}

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
