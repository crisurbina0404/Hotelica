// ============================================================
// Hotelica — Estado global de la maqueta (Fase 1)
// Persistencia en localStorage + sistema de avisos (toasts)
// ============================================================
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  HOTELES_SEED, RESERVAS_SEED, RESENAS_SEED,
  nuevoPromedio, hoyISO, seTraslapan,
} from "./data";
import type { Hotel, Reserva, Resena, EstadoReserva, Rol } from "./data";

// Forma de los datos que se guardan en el navegador
type Persistido = {
  hoteles: Hotel[];
  reservas: Reserva[];
  resenas: Resena[];
  favoritos: string[];
  folio: number; // último número de folio usado
};

const CLAVE_LS = "hotelica-fase1";

// Carga los datos guardados o usa las semillas si es la primera visita
function cargar(): Persistido {
  try {
    const crudo = localStorage.getItem(CLAVE_LS);
    if (crudo) {
      const d = JSON.parse(crudo) as Persistido;
      if (d && Array.isArray(d.reservas) && Array.isArray(d.hoteles)) return d;
    }
  } catch {
    // Si el guardado está corrupto, arrancamos con las semillas
  }
  return {
    hoteles: HOTELES_SEED,
    reservas: RESERVAS_SEED,
    resenas: RESENAS_SEED,
    favoritos: ["h-ometepe", "h-granada"],
    folio: 1043,
  };
}

// Aviso visual que aparece en la esquina (toast)
export type Toast = { id: number; texto: string; tono: "ok" | "error" | "info" };

type AppCtx = {
  hoteles: Hotel[];
  reservas: Reserva[];
  resenas: Resena[];
  favoritos: string[];
  rol: Rol;
  toasts: Toast[];
  avisar: (texto: string, tono?: Toast["tono"]) => void;
  cambiarRol: (r: Rol) => void;
  alternarFavorito: (hotelId: string) => void;
  crearReserva: (r: Omit<Reserva, "folio" | "creada" | "estado" | "calificada">) => Reserva;
  cambiarEstadoReserva: (folio: string, estado: EstadoReserva) => void;
  calificar: (folio: string, hotelId: string, estrellas: number, comentario: string) => void;
  decidirHotel: (hotelId: string, decision: "aprobado" | "rechazado") => void;
  disponiblesDe: (habitacionId: string, llegada: string, salida: string) => number;
  reiniciarDemo: () => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<Persistido>(cargar);
  const [rol, setRol] = useState<Rol>("turista");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Guardamos los cambios en el navegador cada vez que cambian los datos
  useEffect(() => {
    localStorage.setItem(CLAVE_LS, JSON.stringify(datos));
  }, [datos]);

  // Muestra un aviso y lo retira automáticamente a los 3.5 segundos
  const avisar = (texto: string, tono: Toast["tono"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, texto, tono }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  // Marca o desmarca un hotel como favorito
  const alternarFavorito = (hotelId: string) => {
    setDatos((d) => ({
      ...d,
      favoritos: d.favoritos.includes(hotelId)
        ? d.favoritos.filter((f) => f !== hotelId)
        : [...d.favoritos, hotelId],
    }));
  };

  // Crea una reserva nueva y le asigna el siguiente folio (HC-XXXX)
  const crearReserva: AppCtx["crearReserva"] = (r) => {
    const folio = `HC-${datos.folio + 1}`;
    const nueva: Reserva = {
      ...r,
      folio,
      estado: "pendiente",
      creada: hoyISO(),
      calificada: false,
    };
    setDatos((d) => ({ ...d, folio: d.folio + 1, reservas: [nueva, ...d.reservas] }));
    return nueva;
  };

  // Cambia el estado de una reserva (confirmar, check-in, check-out, cancelar)
  const cambiarEstadoReserva = (folio: string, estado: EstadoReserva) => {
    setDatos((d) => ({
      ...d,
      reservas: d.reservas.map((r) => (r.folio === folio ? { ...r, estado } : r)),
    }));
  };

  // Registra una calificación y recalcula el promedio del hotel
  const calificar = (folio: string, hotelId: string, estrellas: number, comentario: string) => {
    setDatos((d) => {
      const hotel = d.hoteles.find((h) => h.id === hotelId)!;
      const nuevaResena: Resena = {
        id: `r-${Date.now()}`,
        hotelId,
        autor: "María Fernández",
        origen: "Managua, Nicaragua",
        rating: estrellas,
        comentario,
        fecha: hoyISO(),
      };
      return {
        ...d,
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
        resenas: comentario.trim() ? [nuevaResena, ...d.resenas] : d.resenas,
      };
    });
  };

  // El administrador aprueba o rechaza un hotel registrado
  const decidirHotel = (hotelId: string, decision: "aprobado" | "rechazado") => {
    setDatos((d) => ({
      ...d,
      hoteles: d.hoteles.map((h) => (h.id === hotelId ? { ...h, aprobado: decision } : h)),
    }));
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
    const hab = datos.hoteles.flatMap(() => []); // (solo para mantener tipos)
    void hab;
    const unidades = unidadesDe(habitacionId);
    return Math.max(0, unidades - ocupadas);
  };

  const cambiarRol = (r: Rol) => setRol(r);

  // Restaura los datos originales de demostración
  const reiniciarDemo = () => {
    localStorage.removeItem(CLAVE_LS);
    setDatos({
      hoteles: HOTELES_SEED,
      reservas: RESERVAS_SEED,
      resenas: RESENAS_SEED,
      favoritos: ["h-ometepe", "h-granada"],
      folio: 1043,
    });
    avisar("Datos de demostración restaurados", "info");
  };

  const valor = useMemo<AppCtx>(
    () => ({
      hoteles: datos.hoteles,
      reservas: datos.reservas,
      resenas: datos.resenas,
      favoritos: datos.favoritos,
      rol,
      toasts,
      avisar,
      cambiarRol,
      alternarFavorito,
      crearReserva,
      cambiarEstadoReserva,
      calificar,
      decidirHotel,
      disponiblesDe,
      reiniciarDemo,
    }),
    [datos, rol, toasts]
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

// Unidades registradas de una habitación (según las semillas)
import { HABITACIONES_SEED } from "./data";
function unidadesDe(habitacionId: string): number {
  return HABITACIONES_SEED.find((h) => h.id === habitacionId)?.unidades ?? 0;
}

// Acceso al contexto desde cualquier componente
export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}
