// ============================================================
// Hotelica — Estadísticas globales de la plataforma (HU-034)
// Funciones puras: no usan React ni consultan la base de datos.
// Reciben los datos del contexto y devuelven las métricas ya
// validadas, para que la interfaz solo se encargue de mostrarlas.
// ============================================================
import type { CuentaHotelero, EstadoReserva, Hotel, Reserva } from "./data";

// Estados que puede tener una reserva; cualquier otro valor es inválido
const ESTADOS_RESERVA: EstadoReserva[] = [
  "pendiente",
  "confirmada",
  "checkin",
  "completada",
  "cancelada",
];

// Lista que puede llegar incompleta desde el contexto o una consulta
type Lista<T> = readonly (T | null | undefined)[] | null | undefined;

export type EstadisticasGlobales = {
  usuariosActivos: number;
  turistasActivos: number;
  hotelerosActivos: number;
  hotelesRegistrados: number;
  hotelesAprobados: number;
  hotelesPendientes: number;
  totalReservas: number;
  reservasActivas: number;
  reservasCanceladas: number;
  ingresosTotales: number;
  ivaTotal: number;
  ticketPromedio: number;
  registrosInvalidos: number;
  problemas: string[];
  hayDatos: boolean;
  calculadoEn: string;
};

// Resultado interno del recorrido de reservas
type ResumenReservas = {
  validas: number;
  invalidas: number;
  canceladas: number;
  noCanceladas: number;
  ingresos: number;
  iva: number;
  sinTotal: number;
  estadoInvalido: number;
  hotelDesconocido: number;
  usuarios: Set<string>;
  hotelesConReservas: Set<string>;
};

// Un hotel sirve para las métricas solo si tiene id y nombre legibles
function esHotelValido(hotel: Hotel | null | undefined): hotel is Hotel {
  return (
    !!hotel &&
    typeof hotel === "object" &&
    typeof hotel.id === "string" &&
    hotel.id.trim() !== "" &&
    typeof hotel.nombre === "string" &&
    hotel.nombre.trim() !== ""
  );
}

// Valida el estado contra la lista cerrada de estados de reserva
function esEstadoValido(estado: unknown): estado is EstadoReserva {
  return typeof estado === "string" && (ESTADOS_RESERVA as string[]).includes(estado);
}

// Deja el correo en minúsculas y sin espacios para no contar dos veces al mismo usuario
function correoNormalizado(valor: unknown): string {
  return typeof valor === "string" ? valor.trim().toLowerCase() : "";
}

// Identifica usuarios por correo; si no hay, usa el nombre para no perder el registro
function claveUsuario(correo: unknown, nombre: unknown): string {
  const email = correoNormalizado(correo);
  if (email) return `correo:${email}`;
  const texto = typeof nombre === "string" ? nombre.trim().toLowerCase() : "";
  return texto ? `nombre:${texto}` : "";
}

// Recorre las reservas, descarta las inválidas y acumula los totales de negocio
function resumirReservas(reservas: Lista<Reserva>, hoteles: Hotel[]): ResumenReservas {
  const idsHoteles = new Set(hoteles.map((h) => h.id));
  const usuarios = new Set<string>();
  const hotelesConReservas = new Set<string>();
  let validas = 0;
  let invalidas = 0;
  let canceladas = 0;
  let noCanceladas = 0;
  let ingresos = 0;
  let iva = 0;
  let sinTotal = 0;
  let estadoInvalido = 0;
  let hotelDesconocido = 0;

  for (const reserva of Array.isArray(reservas) ? reservas : []) {
    // Registros nulos o sin folio/hotel no se pueden contabilizar
    if (
      !reserva ||
      typeof reserva !== "object" ||
      typeof reserva.folio !== "string" ||
      reserva.folio.trim() === "" ||
      typeof reserva.hotelId !== "string" ||
      reserva.hotelId.trim() === ""
    ) {
      invalidas += 1;
      continue;
    }

    // El estado debe ser uno de los cinco permitidos
    if (!esEstadoValido(reserva.estado)) {
      invalidas += 1;
      estadoInvalido += 1;
      continue;
    }

    // El total debe ser un número finito y no negativo
    if (typeof reserva.total !== "number" || !Number.isFinite(reserva.total) || reserva.total < 0) {
      invalidas += 1;
      sinTotal += 1;
      continue;
    }

    // Si hay hoteles cargados, la reserva debe apuntar a uno existente
    if (idsHoteles.size > 0 && !idsHoteles.has(reserva.hotelId)) {
      invalidas += 1;
      hotelDesconocido += 1;
      continue;
    }

    validas += 1;

    // Las canceladas cuentan como reservas, pero nunca como ingreso
    if (reserva.estado === "cancelada") {
      canceladas += 1;
      continue;
    }

    noCanceladas += 1;
    ingresos += reserva.total;
    hotelesConReservas.add(reserva.hotelId);

    // El IVA es informativo: si viene inválido se ignora, no invalida la reserva
    if (typeof reserva.iva === "number" && Number.isFinite(reserva.iva) && reserva.iva >= 0) {
      iva += reserva.iva;
    }

    const clave = claveUsuario(reserva.correo, reserva.turista);
    if (clave) usuarios.add(clave);
  }

  return {
    validas,
    invalidas,
    canceladas,
    noCanceladas,
    ingresos,
    iva,
    sinTotal,
    estadoInvalido,
    hotelDesconocido,
    usuarios,
    hotelesConReservas,
  };
}

// Un hotelero está activo si su hotel recibió al menos una reserva no cancelada
function hotelerosActivos(
  cuentas: Lista<CuentaHotelero>,
  hotelesConReservas: Set<string>,
): Set<string> {
  const claves = new Set<string>();

  for (const cuenta of Array.isArray(cuentas) ? cuentas : []) {
    if (!cuenta || typeof cuenta !== "object" || typeof cuenta.hotelId !== "string") continue;
    if (!hotelesConReservas.has(cuenta.hotelId)) continue;

    const clave = claveUsuario(cuenta.correo, cuenta.nombre);
    if (clave) claves.add(clave);
  }

  return claves;
}

// Calcula todas las métricas del panel a partir de los datos disponibles
export function calcularEstadisticasGlobales(
  hoteles: Lista<Hotel>,
  reservas: Lista<Reserva>,
  cuentasHotelero: Lista<CuentaHotelero> = [],
): EstadisticasGlobales {
  const listaHoteles = Array.isArray(hoteles) ? hoteles : [];
  const hotelesValidos = listaHoteles.filter(esHotelValido);
  const hotelesInvalidos = listaHoteles.length - hotelesValidos.length;
  const resumen = resumirReservas(reservas, hotelesValidos);
  const clavesHoteleros = hotelerosActivos(cuentasHotelero, resumen.hotelesConReservas);

  // Un mismo correo puede aparecer como turista y hotelero: se cuenta una sola vez
  const usuarios = new Set<string>([...resumen.usuarios, ...clavesHoteleros]);

  const aprobados = hotelesValidos.filter((h) => h.aprobado === "aprobado").length;
  const pendientes = hotelesValidos.filter((h) => h.aprobado === "pendiente").length;

  // Mensajes de validación que la interfaz muestra en tiempo real
  const problemas: string[] = [];
  if (hotelesInvalidos > 0) {
    problemas.push(`Se ignoraron ${hotelesInvalidos} hotel(es) sin id o nombre válido.`);
  }
  if (resumen.invalidas > 0) {
    const detalles: string[] = [];
    if (resumen.sinTotal > 0) detalles.push(`${resumen.sinTotal} sin total válido`);
    if (resumen.estadoInvalido > 0) detalles.push(`${resumen.estadoInvalido} con estado desconocido`);
    if (resumen.hotelDesconocido > 0) detalles.push(`${resumen.hotelDesconocido} con hotel inexistente`);
    problemas.push(
      `Se ignoraron ${resumen.invalidas} reserva(s) inválida(s)${detalles.length > 0 ? `: ${detalles.join(", ")}` : ""}.`,
    );
  }

  return {
    usuariosActivos: usuarios.size,
    turistasActivos: resumen.usuarios.size,
    hotelerosActivos: clavesHoteleros.size,
    hotelesRegistrados: hotelesValidos.length,
    hotelesAprobados: aprobados,
    hotelesPendientes: pendientes,
    totalReservas: resumen.validas,
    reservasActivas: resumen.noCanceladas,
    reservasCanceladas: resumen.canceladas,
    ingresosTotales: resumen.ingresos,
    ivaTotal: resumen.iva,
    ticketPromedio: resumen.noCanceladas > 0 ? resumen.ingresos / resumen.noCanceladas : 0,
    registrosInvalidos: resumen.invalidas + hotelesInvalidos,
    problemas,
    hayDatos: hotelesValidos.length > 0 || resumen.validas > 0,
    calculadoEn: new Date().toISOString(),
  };
}
