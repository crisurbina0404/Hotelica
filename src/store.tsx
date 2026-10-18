// ============================================================
// Hotelica — Estado global de la maqueta (Fase 1)
// Persistencia en localStorage + sistema de avisos (toasts)
// ============================================================
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  HOTELES_SEED, RESERVAS_SEED, RESENAS_SEED, HABITACIONES_SEED,
  nuevoPromedio, hoyISO, seTraslapan, sePuedeCalificar, validarCalificacion,
  claveDeFavoritos, favoritosDe, alternarFavoritoDe, validarRegistroHotel,
  generarContrasenaHotelero, contrasenaTemporalVencida, validarHabitacion,
  errorDePrecio, errorDeAjuste, ajustarPrecio,
  cupoDeFotos, errorDeGaleria, conPortada,
} from "./data";
import type { Hotel, Reserva, Resena, EstadoReserva, Rol, Pago, Calificacion, DatosRegistroHotel, ErroresRegistroHotel, CuentaHotelero, Habitacion, EstadoHabitacion, DatosHabitacion, ErroresHabitacion } from "./data";
import type { Idioma } from "./i18n";
import { supabase } from "./lib/supabase";

// Datos del usuario autenticado (login simulado)
export type Usuario = {
  nombre: string;
  rol: "Turista" | "Hotel" | "Admin";
  correo: string;
  telefono: string;
  direccion: string;
};

// Aviso que queda para el hotel en su panel (HU-016)
export type Notificacion = {
  id: string;
  hotelId: string;
  folio: string;
  texto: string;
  fecha: string; // ISO (yyyy-mm-dd)
  leida: boolean;
};

// Forma de los datos que se guardan en el navegador
type Persistido = {
  hoteles: Hotel[];
  reservas: Reserva[];
  resenas: Resena[];
  favoritos: Record<string, string[]>; // lista propia de cada cuenta ("invitado" sin sesión)
  notificaciones: Notificacion[];
  pagos: Pago[];
  calificaciones: Calificacion[];
  folio: number; // último número de folio usado
  cuentasHotelero: CuentaHotelero[]; // cuentas creadas por el admin al aprobar hoteles (HU-021)
  habitaciones: Habitacion[]; // inventario de cada hotel, que el hotelero administra (HU-023)
};

// Clave de almacenamiento (cambia cuando el catálogo de datos evoluciona)
const CLAVE_LS = "hotelica-fase1-v2";

// Carga los datos guardados o usa las semillas si es la primera visita
function cargar(): Persistido {
  try {
    const crudo = localStorage.getItem(CLAVE_LS);
    if (crudo) {
      const d = JSON.parse(crudo) as Persistido;
      // Los guardados viejos pueden traer campos nuevos: arrancamos con listas vacías
      if (d && Array.isArray(d.reservas) && Array.isArray(d.hoteles)) {
        // Los guardados viejos traían los favoritos en una sola lista:
        // ahora van separados por cuenta (HU-020)
        const viejos = d.favoritos as unknown;
        const favoritos: Record<string, string[]> = Array.isArray(viejos)
          ? { invitado: viejos as string[] }
          : (viejos as Record<string, string[]> | undefined) ?? {};
        return {
          ...d, favoritos,
          // Los guardados viejos no traían habitaciones: usamos las semillas (HU-023)
          habitaciones: d.habitaciones ?? HABITACIONES_SEED,
          notificaciones: d.notificaciones ?? [],
          pagos: d.pagos ?? [],
          calificaciones: d.calificaciones ?? [],
          // Cuentas viejas sin fecha: les damos la hora actual y ya no son temporales
          cuentasHotelero: (d.cuentasHotelero ?? []).map((c) => ({
            ...c,
            creadaEn: c.creadaEn ?? new Date().toISOString(),
            contrasenaTemporal: c.contrasenaTemporal ?? false,
          })),
        };
      }
    }
  } catch {
    // Si el guardado está corrupto, arrancamos con las semillas
  }
  return {
    hoteles: HOTELES_SEED,
    reservas: RESERVAS_SEED,
    resenas: RESENAS_SEED,
    favoritos: { invitado: ["h-ometepe", "h-granada"] },
    notificaciones: [],
    pagos: [],
    calificaciones: [],
    folio: 1061,
    cuentasHotelero: [],
    habitaciones: HABITACIONES_SEED,
  };
}

// Lee lo último que haya en el navegador; devuelve null si no hay nada o está corrupto
function leerGuardado(): Persistido | null {
  try {
    const crudo = localStorage.getItem(CLAVE_LS);
    if (!crudo) return null;
    const d = JSON.parse(crudo) as Persistido;
    return d && Array.isArray(d.reservas) && Array.isArray(d.hoteles) ? d : null;
  } catch {
    return null;
  }
}

// Aviso visual que aparece en la esquina (toast)
export type Toast = { id: number; texto: string; tono: "ok" | "error" | "info" };

type AppCtx = {
  hoteles: Hotel[];
  habitaciones: Habitacion[]; // inventario de habitaciones que el hotelero administra (HU-023)
  reservas: Reserva[];
  resenas: Resena[];
  favoritos: string[];
  notificaciones: Notificacion[];
  pagos: Pago[];
  calificaciones: Calificacion[];
  cuentasHotelero: CuentaHotelero[];
  rol: Rol;
  usuario: Usuario | null;
  idioma: Idioma;
  toasts: Toast[];
  avisar: (texto: string, tono?: Toast["tono"]) => void;
  cambiarRol: (r: Rol) => void;
  login: (correo: string, contrasena: string) => Promise<{ error?: string }>;
  registrar: (correo: string, contrasena: string, nombre: string) => Promise<{ error?: string }>;
  loginSocial: (proveedor: string) => Promise<{ error?: string }>;
  logout: () => void;
  actualizarPerfil: (datos: { nombre: string; telefono: string; direccion: string }) => Promise<{ error?: string }>;
  olvidarContrasena: (correo: string) => Promise<{ error?: string; ok?: boolean }>;
  restablecerContrasena: (nuevaContrasena: string) => Promise<{ error?: string }>;
  registroAbierto: boolean;
  abrirRegistro: () => void;
  cerrarRegistro: () => void;
  alternarFavorito: (hotelId: string) => void;
  crearReserva: (r: Omit<Reserva, "folio" | "creada" | "estado" | "calificada">) => Reserva;
  registrarPago: (pago: { folio: string; monto: number; metodo: Reserva["pago"]; referencia: string }) => Pago;
  enviarCorreoReserva: (reserva: Reserva, hotelNombre: string) => Promise<{ ok?: boolean; error?: string }>;
  cambiarEstadoReserva: (folio: string, estado: EstadoReserva) => void;
  avisarHotel: (hotelId: string, folio: string, texto: string) => void;
  marcarNotificacionesLeidas: (hotelId: string) => void;
  calificar: (folio: string, hotelId: string, estrellas: number, comentario: string) => boolean;
  decidirHotel: (hotelId: string, decision: "aprobado" | "rechazado") => CuentaHotelero | null;
  enviarCuentaHotelero: (cuenta: CuentaHotelero, hotelNombre: string) => Promise<{ ok?: boolean; error?: string }>;
  registrarHotel: (datos: DatosRegistroHotel) => { errores?: ErroresRegistroHotel; hotel?: Hotel };
  actualizarHotel: (hotelId: string, datos: DatosRegistroHotel) => { errores?: ErroresRegistroHotel };
  agregarHabitacion: (hotelId: string, datos: DatosHabitacion) => { errores?: ErroresHabitacion; habitacion?: Habitacion };
  cambiarEstadoHabitacion: (habitacionId: string, estado: EstadoHabitacion) => void;
  cambiarPrecioHabitacion: (habitacionId: string, precio: number) => { error?: string };
  ajustarPreciosDelHotel: (hotelId: string, porcentaje: number) => { error?: string; cantidad?: number };
  agregarFotosHotel: (hotelId: string, fotos: string[]) => { error?: string; cantidad?: number };
  ponerPortadaHotel: (hotelId: string, indice: number) => { error?: string };
  quitarFotoHotel: (hotelId: string, indice: number) => { error?: string };
  cambiarContrasenaHotelero: (nueva: string, confirmar: string) => { error?: string };
  disponiblesDe: (habitacionId: string, llegada: string, salida: string) => number;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<Persistido>(cargar);
  // Login simulado: usuario autenticado (persiste en localStorage)
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      const crudo = localStorage.getItem("hotelica-usuario");
      return crudo ? JSON.parse(crudo) : null;
    } catch { return null; }
  });
  // El rol también se guarda al recargar la página, si hay sesión de hotelero/admin
  const [rol, setRol] = useState<Rol>(() => {
    if (!localStorage.getItem("hotelica-usuario")) return "turista";
    const guardado = localStorage.getItem("hotelica-rol");
    return guardado === "hotel" || guardado === "admin" ? guardado : "turista";
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  // El español es el idioma de origen: la traducción al idioma del navegador
  // la hace Google Traductor (HU-038); ya no existe selector propio de idioma
  const [idioma] = useState<Idioma>("es");
  // Modal de registro compartido por toda la app: "Reservar" sin sesión lo abre (HU-038)
  const [registroAbierto, setRegistroAbierto] = useState(false);
  const abrirRegistro = () => setRegistroAbierto(true);
  const cerrarRegistro = () => setRegistroAbierto(false);

  // Guardamos los cambios en el navegador cada vez que cambian los datos
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_LS, JSON.stringify(datos));
    } catch {
      // Las fotografías del hotel pueden llenar el almacenamiento del navegador (HU-025):
      // avisamos y seguimos trabajando con lo que ya está en memoria
      avisar("No hay espacio en el navegador para guardar los últimos cambios. Probá quitando una foto.", "error");
    }
  }, [datos]);

  // Si otra pestaña guarda cambios, copiamos su estado para no pisarnos (bug sobreventa)
  useEffect(() => {
    const alCambiarEnOtraPestana = (e: StorageEvent) => {
      if (e.key !== CLAVE_LS || !e.newValue) return;
      try {
        const d = JSON.parse(e.newValue) as Persistido;
        if (d && Array.isArray(d.reservas) && Array.isArray(d.hoteles)) setDatos(d);
      } catch {
        // Si el guardado de la otra pestaña está corrupto, lo ignoramos
      }
    };
    window.addEventListener("storage", alCambiarEnOtraPestana);
    return () => window.removeEventListener("storage", alCambiarEnOtraPestana);
  }, []);

  // Persistir usuario en localStorage
  useEffect(() => {
    if (usuario) localStorage.setItem("hotelica-usuario", JSON.stringify(usuario));
    else localStorage.removeItem("hotelica-usuario");
  }, [usuario]);

  // Persistir el rol junto con la sesión (si no hay sesión, vuelve a turista)
  useEffect(() => {
    if (usuario) localStorage.setItem("hotelica-rol", rol);
    else localStorage.removeItem("hotelica-rol");
  }, [rol, usuario]);

  // Escucha los cambios de sesión de Supabase (HU-002):
  // cuando el usuario vuelve de Google / Facebook / Apple (OAuth), recibimos su sesión aquí
  useEffect(() => {
    const { data: escucha } = supabase.auth.onAuthStateChange((evento, sesion) => {
      const u = sesion?.user;
      if (!u) return;
      const meta = u.user_metadata ?? {};
      const correo = u.email ?? "";
      const nombre = meta.nombre || meta.full_name || meta.name || correo.split("@")[0];
      const telefono = meta.telefono || meta.phone || "";
      const direccion = meta.direccion || "";
      setUsuario((actual) => {
        // Evita re-render si ya es el mismo usuario (p. ej. refresco de token)
        if (actual?.correo === correo && actual.nombre === nombre) return actual;
        // La sesión de hotelero (HU-021) manda: no la pisa la sesión de turista de Supabase
        if (actual?.rol === "Hotel") return actual;
        return { nombre, rol: "Turista", correo, telefono, direccion };
      });
      // Bienvenida cuando el usuario regresa de un proveedor social (OAuth)
      if (evento === "SIGNED_IN" && sessionStorage.getItem("hotelica-oauth")) {
        sessionStorage.removeItem("hotelica-oauth");
        avisar(`Bienvenido, ${nombre}`, "ok");
      }
    });
    return () => escucha.subscription.unsubscribe();
  }, []);

  // Muestra un aviso y lo retira automáticamente a los 3.5 segundos
  const avisar = (texto: string, tono: Toast["tono"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, texto, tono }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  // Marca o desmarca un hotel como favorito de la cuenta actual (HU-020)
  const alternarFavorito = (hotelId: string) => {
    const clave = claveDeFavoritos(usuario);
    setDatos((d) => ({
      ...d,
      favoritos: {
        ...d.favoritos,
        [clave]: alternarFavoritoDe(d.favoritos[clave] ?? [], hotelId),
      },
    }));
  };

  // Crea una reserva nueva y le asigna el siguiente folio (HC-XXXX)
  const crearReserva: AppCtx["crearReserva"] = (r) => {
    // Leemos lo último guardado en el navegador: otra pestaña pudo haber reservado antes
    const guardado = leerGuardado();
    const folio = `HC-${(guardado?.folio ?? datos.folio) + 1}`;
    const nueva: Reserva = {
      ...r,
      folio,
      estado: "pendiente",
      creada: hoyISO(),
      calificada: false,
    };
    setDatos((d) => {
      // Re-validamos disponibilidad con los datos más frescos antes de escribir
      const ocupadas = d.reservas.filter(
        (rr) =>
          rr.habitacionId === r.habitacionId &&
          rr.estado !== "cancelada" &&
          rr.estado !== "completada" &&
          seTraslapan(r.llegada, r.salida, rr.llegada, rr.salida)
      ).length;
      // Las unidades salen del inventario que tenemos en memoria
      const unidades = d.habitaciones.find((h) => h.id === r.habitacionId)?.unidades ?? 0;
      if (ocupadas >= unidades) return d; // ya no hay cupo: no escribimos
      return {
        ...d,
        folio: Math.max(d.folio, guardado?.folio ?? 0) + 1,
        reservas: [nueva, ...d.reservas],
      };
    });
    return nueva;
  };

  // Registra el pago de una reserva; si quedó pagado, la deja Confirmada (HU-018)
  const registrarPago: AppCtx["registrarPago"] = ({ folio, monto, metodo, referencia }) => {
    // En efectivo el turista paga en recepción: todo queda pendiente
    const pagado = metodo !== "efectivo";
    const nuevo: Pago = {
      id: `p-${Date.now()}`,
      folio,
      monto,
      metodo,
      estado: pagado ? "pagado" : "pendiente",
      fecha: hoyISO(),
      referencia,
    };
    setDatos((d) => ({
      ...d,
      pagos: [nuevo, ...d.pagos],
      reservas: d.reservas.map((r) =>
        r.folio === folio && pagado ? { ...r, estado: "confirmada" } : r
      ),
    }));
    return nuevo;
  };

  // Envía correo de confirmación vía Edge Function (Resend API)
  const enviarCorreoReserva = async (reserva: Reserva, hotelNombre: string): Promise<{ ok?: boolean; error?: string }> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { error: "Configuración de Supabase no encontrada" };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? supabaseAnonKey;

      const res = await fetch(`${supabaseUrl}/functions/v1/enviar-correo-reserva`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          folio: reserva.folio,
          hotelNombre,
          turista: reserva.turista,
          correo: reserva.correo,
          llegada: reserva.llegada,
          salida: reserva.salida,
          noches: reserva.noches,
          huespedes: reserva.huespedes,
          total: reserva.total,
          // Extras para que el comprobante salga completo (HU comprobantes)
          habitacion: datos.habitaciones.find((h) => h.id === reserva.habitacionId)?.tipo ?? "",
          subtotal: reserva.subtotal,
          iva: reserva.iva,
          pago: reserva.pago,
          estado: reserva.estado,
          estadoPago: datos.pagos.find((p) => p.folio === reserva.folio)?.estado ?? "",
          referencia: datos.pagos.find((p) => p.folio === reserva.folio)?.referencia ?? "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error al enviar correo:", data);
        return { error: data.error || "Error al enviar el correo" };
      }

      return { ok: true };
    } catch (error) {
      console.error("Error de red al enviar correo:", error);
      return { error: "No se pudo conectar con el servidor de correos" };
    }
  };

  // Cambia el estado de una reserva (confirmar, check-in, check-out, cancelar)
  const cambiarEstadoReserva = (folio: string, estado: EstadoReserva) => {
    setDatos((d) => ({
      ...d,
      reservas: d.reservas.map((r) => (r.folio === folio ? { ...r, estado } : r)),
    }));
  };

  // Deja un aviso en el panel del hotel (por ejemplo: "Reserva cancelada por el turista")
  const avisarHotel: AppCtx["avisarHotel"] = (hotelId, folio, texto) => {
    setDatos((d) => ({
      ...d,
      notificaciones: [
        { id: `n-${Date.now()}`, hotelId, folio, texto, fecha: hoyISO(), leida: false },
        ...d.notificaciones,
      ],
    }));
  };

  // Marca todos los avisos de un hotel como leídos
  const marcarNotificacionesLeidas: AppCtx["marcarNotificacionesLeidas"] = (hotelId) => {
    setDatos((d) => ({
      ...d,
      notificaciones: d.notificaciones.map((n) => (n.hotelId === hotelId ? { ...n, leida: true } : n)),
    }));
  };

  // Registra la calificación de la reserva y recalcula el promedio (HU-019)
  // Devuelve false si la reserva no estaba lista o ya había sido calificada
  const calificar: AppCtx["calificar"] = (folio, hotelId, estrellas, comentario) => {
    const reserva = datos.reservas.find((r) => r.folio === folio);
    if (!reserva || !sePuedeCalificar(reserva) || validarCalificacion(estrellas)) return false;
    if (!datos.hoteles.some((h) => h.id === hotelId)) return false;

    const texto = comentario.trim();
    const fecha = hoyISO();

    setDatos((d) => {
      const nueva: Calificacion = {
        id: `c-${Date.now()}`,
        folio,
        hotelId,
        autor: reserva.turista,
        estrellas,
        comentario: texto,
        fecha,
      };
      // El comentario también queda publicado como reseña del hotel
      const resena: Resena = {
        id: `r-${Date.now()}`,
        hotelId,
        autor: reserva.turista,
        origen: "Nicaragua, Centroamérica",
        rating: estrellas,
        comentario: texto,
        fecha,
      };
      return {
        ...d,
        calificaciones: [nueva, ...d.calificaciones],
        reservas: d.reservas.map((r) => (r.folio === folio ? { ...r, calificada: true } : r)),
        hoteles: d.hoteles.map((h) =>
          h.id === hotelId
            ? {
                ...h,
                rating: nuevoPromedio(h.rating, h.totalResenas, estrellas),
                totalResenas: h.totalResenas + 1,
              }
            : h
        ),
        resenas: texto ? [resena, ...d.resenas] : d.resenas,
      };
    });
    return true;
  };

  // El administrador aprueba o rechaza un hotel inscrito desde el inicio (HU-021 + HU-031/032)
  // Al aprobar se crea la cuenta con la que el hotelero entrará a su panel
  const decidirHotel = (hotelId: string, decision: "aprobado" | "rechazado"): CuentaHotelero | null => {
    const hotel = datos.hoteles.find((h) => h.id === hotelId);
    const yaTieneCuenta = datos.cuentasHotelero.some((c) => c.hotelId === hotelId);

    // Solo creamos cuenta si es una aprobación y el hotelero dejó correo
    const cuentaCreada =
      decision === "aprobado" && hotel?.correoDueno && !yaTieneCuenta
        ? {
            correo: hotel.correoDueno.trim().toLowerCase(),
            contrasena: generarContrasenaHotelero(),
            nombre: hotel.dueno,
            hotelId,
            creadaEn: new Date().toISOString(),
            contrasenaTemporal: true, // el dueño debe cambiarla en 24 horas
          }
        : null;

    setDatos((d) => ({
      ...d,
      hoteles: d.hoteles.map((h) => (h.id === hotelId ? { ...h, aprobado: decision } : h)),
      cuentasHotelero: cuentaCreada ? [...d.cuentasHotelero, cuentaCreada] : d.cuentasHotelero,
    }));

    return cuentaCreada;
  };

  // Envía el correo con las credenciales de la cuenta creada al hotelero (HU-021)
  // Usa la Edge Function enviar-cuenta-hotelero (Brevo) igual que el correo de reservas
  const enviarCuentaHotelero = async (cuenta: CuentaHotelero, hotelNombre: string): Promise<{ ok?: boolean; error?: string }> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { error: "Configuración de Supabase no encontrada" };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? supabaseAnonKey;

      const res = await fetch(`${supabaseUrl}/functions/v1/enviar-cuenta-hotelero`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          nombre: cuenta.nombre,
          correo: cuenta.correo,
          contrasena: cuenta.contrasena,
          hotelNombre,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { error: data?.error ?? "No se pudo enviar el correo" };
      }

      return { ok: true };
    } catch (e) {
      return { error: "No se pudo enviar el correo de credenciales" };
    }
  };

  // Da de alta la solicitud de un hotel nuevo (queda pendiente hasta que el admin la revise)
  const registrarHotel: AppCtx["registrarHotel"] = (registro) => {
    // Validamos con la lista más fresca para detectar nombres y correos repetidos
    const errores = validarRegistroHotel(registro, datos.hoteles);
    if (Object.keys(errores).length > 0) return { errores };

    const nuevo: Hotel = {
      id: `h-${Date.now()}`,
      nombre: registro.nombre.trim(),
      dueno: registro.dueno.trim(),
      correoDueno: registro.correo.trim().toLowerCase(),
      departamentoId: registro.departamentoId,
      municipioId: registro.municipioId,
      direccion: registro.direccion.trim(),
      ubicacion: registro.ubicacion ?? undefined, // punto exacto en el mapa (HU-037)
      descripcion: registro.descripcion.trim(),
      contacto: registro.telefono.trim() || undefined,
      imagen: registro.imagen,
      galeria: [registro.imagen],
      amenidades: [],
      destacado: false,
      aprobado: "pendiente", // estado_hotel = 'Pendiente' hasta que el admin lo revise
      rating: 0,
      totalResenas: 0,
      fechaRegistro: hoyISO(),
    };

    setDatos((d) => ({ ...d, hoteles: [...d.hoteles, nuevo] }));
    return { hotel: nuevo };
  };

  // Actualiza la información de un hotel ya inscrito (HU-022)
  const actualizarHotel: AppCtx["actualizarHotel"] = (hotelId, registro) => {
    // Validamos dejando afuera el propio hotel, para que pueda conservar su nombre y correo
    const otrosHoteles = datos.hoteles.filter((h) => h.id !== hotelId);
    const errores = validarRegistroHotel(registro, otrosHoteles);
    if (Object.keys(errores).length > 0) return { errores };

    setDatos((d) => ({
      ...d,
      hoteles: d.hoteles.map((h) =>
        h.id === hotelId
          ? {
              ...h,
              nombre: registro.nombre.trim(),
              dueno: registro.dueno.trim(),
              correoDueno: registro.correo.trim().toLowerCase(),
              departamentoId: registro.departamentoId,
              municipioId: registro.municipioId,
              direccion: registro.direccion.trim(),
              ubicacion: registro.ubicacion ?? undefined,
              descripcion: registro.descripcion.trim(),
              contacto: registro.telefono.trim() || undefined,
            }
          : h
      ),
    }));
    return {};
  };

  // Registra un tipo de habitación nuevo en el hotel del hotelero logueado (HU-023)
  const agregarHabitacion: AppCtx["agregarHabitacion"] = (hotelId, registro) => {
    // Revisamos contra las habitaciones que ya tiene ese hotel
    const delHotel = datos.habitaciones.filter((h) => h.hotelId === hotelId);
    const errores = validarHabitacion(registro, delHotel);
    if (Object.keys(errores).length > 0) return { errores };

    const nueva: Habitacion = {
      id: `hab-${Date.now()}`,
      hotelId,
      tipo: registro.tipo.trim(),
      capacidad: Number(registro.capacidad),
      precio: Number(registro.precio),
      unidades: Number(registro.unidades),
      estado: registro.estado,
      detalle: registro.detalle.trim(),
    };

    setDatos((d) => ({ ...d, habitaciones: [...d.habitaciones, nueva] }));
    return { habitacion: nueva };
  };

  // Pone una habitación disponible, en mantenimiento o fuera de venta
  const cambiarEstadoHabitacion: AppCtx["cambiarEstadoHabitacion"] = (habitacionId, estado) => {
    setDatos((d) => ({
      ...d,
      habitaciones: d.habitaciones.map((h) => (h.id === habitacionId ? { ...h, estado } : h)),
    }));
  };

  // Corrige el precio por noche de una habitación ya registrada (HU-024)
  const cambiarPrecioHabitacion: AppCtx["cambiarPrecioHabitacion"] = (habitacionId, precio) => {
    // La regla de precio es la misma que usa el registro de habitaciones (HU-023)
    const error = errorDePrecio(precio);
    if (error) return { error };

    const limpio = Math.round(Number(precio));
    setDatos((d) => ({
      ...d,
      habitaciones: d.habitaciones.map((h) => (h.id === habitacionId ? { ...h, precio: limpio } : h)),
    }));
    return {};
  };

  // Aplica un ajuste de temporada a todas las tarifas del hotel (HU-024)
  const ajustarPreciosDelHotel: AppCtx["ajustarPreciosDelHotel"] = (hotelId, porcentaje) => {
    const error = errorDeAjuste(porcentaje);
    if (error) return { error };

    const delHotel = datos.habitaciones.filter((h) => h.hotelId === hotelId);
    setDatos((d) => ({
      ...d,
      habitaciones: d.habitaciones.map((h) =>
        h.hotelId === hotelId ? { ...h, precio: ajustarPrecio(h.precio, porcentaje) } : h
      ),
    }));
    return { cantidad: delHotel.length };
  };

  // Deja la galería del hotel con la portada también en `imagen`, que es el campo
  // que leen las tarjetas de los resultados y la cabecera del panel (HU-025)
  const guardarGaleria = (hotelId: string, galeria: string[]) =>
    setDatos((d) => ({
      ...d,
      hoteles: d.hoteles.map((h) =>
        h.id === hotelId ? { ...h, galeria, imagen: galeria[0] ?? h.imagen } : h
      ),
    }));

  // Suma fotos optimizadas a la galería del hotel, respetando el tope (HU-025)
  const agregarFotosHotel: AppCtx["agregarFotosHotel"] = (hotelId, fotos) => {
    const hotel = datos.hoteles.find((h) => h.id === hotelId);
    if (!hotel) return { error: "No encontramos ese hotel." };

    const galeria = hotel.galeria ?? [];
    const nuevas = fotos.filter((f) => !!f);
    if (nuevas.length === 0) return { error: "No se pudo leer ninguna de las fotos elegidas." };

    // El tope se mide sobre todo lo que se está subiendo junto
    const error = errorDeGaleria(galeria.length + nuevas.length - 1);
    if (error) return { error };

    guardarGaleria(hotelId, [...galeria, ...nuevas]);
    return { cantidad: nuevas.length };
  };

  // Mueve una de las fotos al primer lugar: esa pasa a ser la portada (HU-025)
  const ponerPortadaHotel: AppCtx["ponerPortadaHotel"] = (hotelId, indice) => {
    const hotel = datos.hoteles.find((h) => h.id === hotelId);
    if (!hotel) return { error: "No encontramos ese hotel." };

    const galeria = hotel.galeria ?? [];
    if (indice <= 0 || indice >= galeria.length) return { error: "Elegí una de las fotos de la galería." };

    guardarGaleria(hotelId, conPortada(galeria, indice));
    return {};
  };

  // Quita una foto; la última no se puede quitar porque el hotel necesita portada (HU-025)
  const quitarFotoHotel: AppCtx["quitarFotoHotel"] = (hotelId, indice) => {
    const hotel = datos.hoteles.find((h) => h.id === hotelId);
    if (!hotel) return { error: "No encontramos ese hotel." };

    const galeria = hotel.galeria ?? [];
    if (indice < 0 || indice >= galeria.length) return { error: "Esa foto ya no está en la galería." };
    if (galeria.length <= 1) return { error: "El hotel necesita al menos una foto: subí otra antes de quitar esta." };

    guardarGaleria(hotelId, galeria.filter((_, i) => i !== indice));
    return {};
  };

  // El hotelero cambia la contraseña temporal que le dio el admin (debe hacerlo en 24h)
  const cambiarContrasenaHotelero: AppCtx["cambiarContrasenaHotelero"] = (nueva, confirmar) => {
    if (!usuario?.correo) return { error: "No hay sesión de hotelero activa" };

    const limpia = nueva.trim();
    if (limpia.length < 6) return { error: "La nueva contraseña debe tener al menos 6 caracteres." };
    if (limpia !== confirmar.trim()) return { error: "Las contraseñas no coinciden. Escribí la misma en los dos campos." };

    let encontrada = false;
    setDatos((d) => ({
      ...d,
      cuentasHotelero: d.cuentasHotelero.map((c) => {
        if (c.correo !== usuario.correo.trim().toLowerCase()) return c;
        encontrada = true;
        return { ...c, contrasena: limpia, contrasenaTemporal: false };
      }),
    }));
    if (!encontrada) return { error: "No encontramos tu cuenta de hotelero." };
    return {};
  };

  // Disponibilidad = total de unidades - unidades ocupadas en esas fechas
  const disponiblesDe = (habitacionId: string, llegada: string, salida: string) => {
    const ocupadas = datos.reservas.filter(
      (r) =>
        r.habitacionId === habitacionId &&
        r.estado !== "cancelada" &&
        r.estado !== "completada" &&
        seTraslapan(llegada, salida, r.llegada, r.salida)
    ).length;
    const unidades = datos.habitaciones.find((h) => h.id === habitacionId)?.unidades ?? 0;
    return Math.max(0, unidades - ocupadas);
  };

  const cambiarRol = (r: Rol) => setRol(r);

  // Login con Supabase Auth (HU-002) o con una cuenta de hotelero creada por el admin (HU-021)
  const login = async (correo: string, contrasena: string) => {
    if (!correo.trim() || !contrasena.trim()) {
      return { error: "Correo y contraseña son obligatorios" };
    }

    // Primero miramos si es una cuenta de hotelero creada al aprobar una inscripción
    const cuenta = datos.cuentasHotelero.find(
      (c) => c.correo === correo.trim().toLowerCase() && c.contrasena === contrasena.trim()
    );
    if (cuenta) {
      // Si la contraseña temporal ya venció (24h), no dejamos entrar
      if (contrasenaTemporalVencida(cuenta)) {
        return { error: "Tu contraseña temporal venció (24 horas). Pedile al administrador una nueva contraseña." };
      }
      setUsuario({ nombre: cuenta.nombre, rol: "Hotel", correo: cuenta.correo, telefono: "", direccion: "" });
      setRol("hotel"); // el panel del hotel queda visible en el menú
      const hotel = datos.hoteles.find((h) => h.id === cuenta.hotelId);
      avisar(`Bienvenido, ${cuenta.nombre}${hotel ? ` — ${hotel.nombre}` : ""}`, "ok");
      return {};
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });

    if (error) {
      if (error.message.includes("Invalid login")) {
        return { error: "Correo o contraseña incorrectos" };
      }
      if (error.message.includes("Email not confirmed")) {
        return { error: "El correo no fue confirmado. Revisá tu bandeja de entrada o desactivá la confirmación de email en Supabase." };
      }
      return { error: error.message };
    }

    // Obtener nombre del perfil
    if (data.user) {
      const nombre = data.user.user_metadata?.nombre || correo.split("@")[0];
      const telefono = data.user.user_metadata?.telefono || "";
      const direccion = data.user.user_metadata?.direccion || "";
      setUsuario({ nombre, rol: "Turista", correo, telefono, direccion });
      avisar(`Bienvenido, ${nombre}`, "ok");
    }

    return {};
  };

  // Registro real con Supabase Auth (HU-001)
  const registrar = async (correo: string, contrasena: string, nombre: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
      options: { data: { nombre } },
    });

    if (error) {
      // Mensajes amigables según el tipo de error
      if (error.message.includes("already")) {
        return { error: "Este correo ya está registrado" };
      }
      if (error.message.includes("password")) {
        return { error: "La contraseña debe tener al menos 6 caracteres" };
      }
      return { error: error.message };
    }

    // Si se creó el usuario, iniciar sesión automáticamente
    if (data.user) {
      const nombreDisplay = nombre || correo.split("@")[0];
      setUsuario({ nombre: nombreDisplay, rol: "Turista", correo, telefono: "", direccion: "" });
      avisar(`Bienvenido, ${nombreDisplay}`, "ok");
    }

    return {};
  };

  // Login real con Google vía Supabase Auth (HU-002)
  // Abre el flujo OAuth; al volver al sitio, onAuthStateChange recibe la sesión
  const loginSocial = async (_proveedor: string) => {
    sessionStorage.setItem("hotelica-oauth", "google"); // para saludar al volver
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      sessionStorage.removeItem("hotelica-oauth");
      console.error("Error OAuth con Google:", error.message);
      return { error: "El acceso con Google no está disponible. Verificá que el proveedor esté habilitado en Supabase (Authentication → Providers)." };
    }
    return {}; // el navegador redirige a Google
  };

  // Cerrar sesión
  // Cerrar sesión con Supabase Auth (HU-003)
  const logout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setRol("turista");
    avisar("Sesión cerrada", "info");
  };

  // Actualizar perfil del usuario autenticado (HU-005)
  const actualizarPerfil = async (datos: { nombre: string; telefono: string; direccion: string }) => {
    if (!usuario) return { error: "No hay sesión activa" };

    // Validaciones básicas antes de enviar
    if (!datos.nombre.trim() || datos.nombre.trim().length < 3) {
      return { error: "El nombre debe tener al menos 3 caracteres" };
    }
    if (!datos.telefono.trim()) {
      return { error: "El teléfono es obligatorio" };
    }
    if (!datos.direccion.trim() || datos.direccion.trim().length < 5) {
      return { error: "La dirección debe tener al menos 5 caracteres" };
    }

    // Intentamos actualizar en Supabase Auth (user_metadata)
    const { error } = await supabase.auth.updateUser({
      data: { nombre: datos.nombre, telefono: datos.telefono, direccion: datos.direccion },
    });

    // Si Supabase falla (sesión expirada, login social, etc.), guardamos localmente
    if (error) {
      console.warn("Supabase updateUser falló, guardando localmente:", error.message);
    }

    // Actualizamos el estado local con los nuevos datos (siempre, con o sin Supabase)
    setUsuario({
      ...usuario,
      nombre: datos.nombre,
      telefono: datos.telefono,
      direccion: datos.direccion,
    });

    return {};
  };

  // Enviar email de recuperación de contraseña (HU-004)
  const olvidarContrasena = async (correo: string) => {
    if (!correo.trim()) {
      return { error: "Ingresa tu correo electrónico" };
    }

    // redirectTo: el enlace del correo regresa a la misma dirección donde pidió el cambio
    let { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: window.location.origin,
    });

    // Si Supabase rechazó la redirección (URL no autorizada), reintentamos sin ella
    if (error && (error.message.toLowerCase().includes("redirect") || error.message.toLowerCase().includes("allow"))) {
      console.warn("Redirect rechazado, reintentando sin redirectTo:", error.message);
      ({ error } = await supabase.auth.resetPasswordForEmail(correo));
    }

    if (error) {
      console.error("Error Supabase resetPasswordForEmail:", error.message, error);
      // Mensajes claros según lo que reportó Supabase
      if (error.message.includes("Security purposes") || error.message.includes("rate limit") || error.message.includes("after")) {
        return { error: "Esperá un minuto antes de pedir otro correo: Supabase limita los envíos por seguridad." };
      }
      if (error.message.toLowerCase().includes("redirect")) {
        return { error: "No se pudo enviar: la URL de redirección no está autorizada en Supabase (Authentication → URL Configuration)." };
      }
      return { error: "No se pudo enviar el correo de recuperación. Verificá que el correo esté registrado y sea tu correo de turista." };
    }

    return { ok: true };
  };

  // Restablecer contraseña con el token del email (HU-004)
  const restablecerContrasena = async (nuevaContrasena: string) => {
    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      return { error: "La contraseña debe tener al menos 6 caracteres" };
    }

    const { error } = await supabase.auth.updateUser({
      password: nuevaContrasena,
    });

    if (error) {
      return { error: "No se pudo restablecer la contraseña. El enlace pudo haber expirado. Solicita uno nuevo." };
    }

    return {};
  };

  const valor = useMemo<AppCtx>(
    () => ({
      hoteles: datos.hoteles,
      habitaciones: datos.habitaciones,
      reservas: datos.reservas,
      resenas: datos.resenas,
      favoritos: favoritosDe(datos.favoritos, usuario),
      notificaciones: datos.notificaciones,
      pagos: datos.pagos,
      calificaciones: datos.calificaciones,
      cuentasHotelero: datos.cuentasHotelero,
      rol,
      usuario,
      idioma,
      toasts,
      avisar,
      cambiarRol,
      login,
      registrar,
      loginSocial,
      logout,
      actualizarPerfil,
      olvidarContrasena,
      restablecerContrasena,
      registroAbierto,
      abrirRegistro,
      cerrarRegistro,
      alternarFavorito,
      crearReserva,
      registrarPago,
      enviarCorreoReserva,
      cambiarEstadoReserva,
      avisarHotel,
      marcarNotificacionesLeidas,
      calificar,
      decidirHotel,
      enviarCuentaHotelero,
      registrarHotel,
      actualizarHotel,
      agregarHabitacion,
      cambiarEstadoHabitacion,
      cambiarPrecioHabitacion,
      ajustarPreciosDelHotel,
      agregarFotosHotel,
      ponerPortadaHotel,
      quitarFotoHotel,
      cambiarContrasenaHotelero,
      disponiblesDe,
    }),
    [datos, rol, usuario, idioma, toasts]
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

// Acceso al contexto desde cualquier componente
export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}
