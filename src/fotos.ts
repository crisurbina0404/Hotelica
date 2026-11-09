// ============================================================
// Hotelica — Fotografías de los hoteles del catálogo (HU-038)
// Cada ficha trae su propia portada y su galería. Antes todas las
// fichas repetían la foto del departamento (la casona de Granada
// mostraba la catedral), así que la misma imagen aparecía en
// hoteles distintos.
// Las fotos viven en public/hoteles y sus créditos en
// public/hoteles/CREDITOS.md, porque son de uso libre y piden
// atribución.
// ============================================================

// La primera foto de la lista es la portada que se ve en las tarjetas
const FOTOS_HOTEL: Record<string, string[]> = {
  "h-granada": ["/hoteles/casona-fachada.jpg", "/hoteles/casona-patio.jpg", "/destinos/granada.jpg"],
  "h-sanjuan": ["/hoteles/faro-cabanas.jpg", "/hoteles/faro-bahia.jpg"],
  "h-ometepe": ["/hoteles/zapote-finca.jpg", "/destinos/rivas.jpg"],
  "h-leon": ["/hoteles/chepita-corredor.jpg", "/destinos/leon.jpg"],
  "h-matagalpa": ["/hoteles/neblina-cabana.jpg", "/destinos/matagalpa.jpg"],
  "h-corn": ["/hoteles/lula-cabana.jpg", "/destinos/caribe.jpg"],
  "h-masaya": ["/hoteles/descanso-habitaciones.jpg", "/destinos/masaya.jpg"],
};

// Fotos curadas de un hotel; null si el hotel no tiene fotos propias
// en el proyecto (por ejemplo, los que subió un hotelero)
export function fotosDeHotel(hotelId: string): string[] | null {
  const fotos = FOTOS_HOTEL[hotelId];
  return fotos && fotos.length > 0 ? fotos : null;
}

// ----- Habitaciones -----
// Un cuarto sin foto se veía como un ícono de cama: estas son las portadas
// de cada tipo. Se reutilizan entre hoteles distintos, nunca dentro del
// mismo hotel, para que dos cuartos de la misma ficha no se vean iguales.
const FOTOS_HABITACION: Record<string, string[]> = {
  // Hostal La Casona de Xalteva
  g1: ["/habitaciones/hab-doble-colonial.jpg"],
  g2: ["/habitaciones/hab-suite-piedra.jpg"],
  g3: ["/habitaciones/hab-suite-sala.jpg"],
  g4: ["/habitaciones/hab-cabana-ventana.jpg"],
  // Cabañas El Faro
  s1: ["/habitaciones/hab-bungalow-playa.jpg"],
  s2: ["/habitaciones/hab-cabana-ventana.jpg"],
  s3: ["/habitaciones/hab-suite-sala.jpg"],
  // Finca El Zapote
  o1: ["/habitaciones/hab-cabana-ventana.jpg"],
  o2: ["/habitaciones/hab-suite-piedra.jpg"],
  o3: ["/habitaciones/hab-bungalow-playa.jpg"],
  // Posada Doña Chepita
  l1: ["/habitaciones/hab-doble-colonial.jpg"],
  l2: ["/habitaciones/hab-suite-piedra.jpg"],
  l3: ["/habitaciones/hab-suite-sala.jpg"],
  // Cabañas La Neblina
  c1: ["/habitaciones/hab-cabana-ventana.jpg"],
  c2: ["/habitaciones/hab-bungalow-playa.jpg"],
  // Cabañas Miss Lula
  k1: ["/habitaciones/hab-bungalow-playa.jpg"],
  k2: ["/habitaciones/hab-bungalow-detalle.jpg"],
  k3: ["/habitaciones/hab-suite-piedra.jpg"],
  // Hospedaje El Buen Descanso
  m1: ["/habitaciones/hab-doble-colonial.jpg"],
  // Hospedaje Doña Feli
  t1: ["/habitaciones/hab-cabana-ventana.jpg"],
  // Hospedaje La Curva
  r1: ["/habitaciones/hab-bungalow-detalle.jpg"],
};

// Fotos curadas de un tipo de habitación; null si no tiene
// (por ejemplo, los cuartos que registró un hotelero con sus propias fotos)
export function fotosDeHabitacion(habitacionId: string): string[] | null {
  const fotos = FOTOS_HABITACION[habitacionId];
  return fotos && fotos.length > 0 ? fotos : null;
}

// Las rutas locales se guardan con barra inicial: en /hoteles/:id una ruta
// relativa se resolvería bajo /hoteles/hoteles/ y la foto no cargaría
export function urlFoto(ruta: string): string {
  if (!ruta) return ruta;
  if (ruta.startsWith("/") || ruta.startsWith("http") || ruta.startsWith("data:") || ruta.startsWith("blob:")) {
    return ruta;
  }
  return `/${ruta}`;
}
