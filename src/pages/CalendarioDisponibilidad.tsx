// ============================================================
// Hotelica — Calendario visual de disponibilidad (HU-011)
// Muestra días libres, parcialmente ocupados y bloqueados
// ============================================================
import { useMemo, useState } from "react";
import { aISO, sumarDias, hoyISO } from "../data";

// Días de la semana en español (lunes a domingo)
const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

// Meses en español
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Tipo de disponibilidad para un día
type EstadoDia = "libre" | "parcial" | "bloqueado" | "pasado" | "seleccionado" | "rango";

export function CalendarioDisponibilidad({
  habitaciones,
  disponiblesDe,
  llegada,
  salida,
  alSeleccionar,
}: {
  habitaciones: { id: string; unidades: number }[];
  disponiblesDe: (habitacionId: string, llegada: string, salida: string) => number;
  llegada: string;
  salida: string;
  alSeleccionar: (llegada: string, salida: string) => void;
}) {
  const hoy = hoyISO();
  const [mesActual, setMesActual] = useState(() => {
    const d = new Date(`${llegada}T12:00:00`);
    return { anio: d.getFullYear(), mes: d.getMonth() };
  });
  // Controla el modo de selección: null = esperando primera fecha, string = primera fecha seleccionada
  const [primeraFecha, setPrimeraFecha] = useState<string | null>(null);

  // Genera los días del mes actual con su estado de disponibilidad
  const dias = useMemo(() => {
    const primerDia = new Date(mesActual.anio, mesActual.mes, 1);
    const ultimoDia = new Date(mesActual.anio, mesActual.mes + 1, 0);
    const totalDias = ultimoDia.getDate();

    // Día de la semana del primer día (0=lun, 6=dom) ajustado
    let diaSemana = primerDia.getDay() - 1;
    if (diaSemana < 0) diaSemana = 6;

    const resultado: { fecha: string; dia: number; estado: EstadoDia; disponibles: number }[] = [];

    // Espacios vacíos antes del primer día
    for (let i = 0; i < diaSemana; i++) {
      resultado.push({ fecha: "", dia: 0, estado: "libre", disponibles: 0 });
    }

    // Cada día del mes
    for (let d = 1; d <= totalDias; d++) {
      const fecha = aISO(new Date(mesActual.anio, mesActual.mes, d));
      let estado: EstadoDia = "libre";
      let disponibles = 0;

      if (fecha < hoy) {
        estado = "pasado";
      } else {
        // Sumamos todas las unidades disponibles de todas las habitaciones
        let totalDisponibles = 0;
        let totalUnidades = 0;
        for (const hab of habitaciones) {
          const disp = disponiblesDe(hab.id, fecha, sumarDias(fecha, 1));
          totalDisponibles += disp;
          totalUnidades += hab.unidades;
        }
        disponibles = totalDisponibles;

        if (totalDisponibles === 0) {
          estado = "bloqueado";
        } else if (totalDisponibles < totalUnidades) {
          estado = "parcial";
        }

        // Marcar si está en el rango seleccionado
        if (llegada && salida && fecha >= llegada && fecha < salida) {
          estado = "seleccionado";
        }
        if (llegada && fecha === llegada) {
          estado = "rango";
        }
      }

      resultado.push({ fecha, dia: d, estado, disponibles });
    }

    return resultado;
  }, [mesActual, habitaciones, disponiblesDe, llegada, salida, hoy]);

  // Navegar al mes anterior
  const mesAnterior = () => {
    setMesActual((prev) => {
      if (prev.mes === 0) return { anio: prev.anio - 1, mes: 11 };
      return { ...prev, mes: prev.mes - 1 };
    });
  };

  // Navegar al mes siguiente
  const mesSiguiente = () => {
    setMesActual((prev) => {
      if (prev.mes === 11) return { anio: prev.anio + 1, mes: 0 };
      return { ...prev, mes: prev.mes + 1 };
    });
  };

  // Maneja la selección de fechas (primer clic = llegada, segundo clic = salida)
  const seleccionarFecha = (fecha: string) => {
    if (primeraFecha === null) {
      // Primer clic: establecer llegada
      setPrimeraFecha(fecha);
    } else {
      // Segundo clic: establecer salida
      let nuevaLlegada = primeraFecha;
      let nuevaSalida = fecha;
      // Si la segunda fecha es anterior, las intercambiamos
      if (fecha < primeraFecha) {
        nuevaLlegada = fecha;
        nuevaSalida = primeraFecha;
      }
      alSeleccionar(nuevaLlegada, nuevaSalida);
      setPrimeraFecha(null);
    }
  };

  // Colores de cada estado según la paleta oficial
  const colorEstado: Record<EstadoDia, string> = {
    libre: "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0] cursor-pointer",
    parcial: "bg-accent-light text-[#92400E] hover:bg-[#FDE68A] cursor-pointer",
    bloqueado: "bg-[#FEE2E2] text-[#B91C1C] cursor-not-allowed",
    pasado: "bg-canvas text-muted/50 cursor-not-allowed",
    seleccionado: "bg-primary text-white",
    rango: "bg-primary text-white",
  };

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-card">
      {/* Encabezado del mes con navegación */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={mesAnterior}
          className="rounded-lg px-3 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
        >
          ← Anterior
        </button>
        <h4 className="font-display text-base font-bold text-ink">
          {MESES[mesActual.mes]} {mesActual.anio}
        </h4>
        <button
          onClick={mesSiguiente}
          className="rounded-lg px-3 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
        >
          Siguiente →
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7 gap-1">
        {dias.map((d, i) =>
          d.fecha === "" ? (
            <div key={`vacio-${i}`} className="h-9" />
          ) : (
            <button
              key={d.fecha}
              disabled={d.estado === "pasado" || d.estado === "bloqueado" || d.estado === "seleccionado"}
              onClick={() => seleccionarFecha(d.fecha)}
              className={`h-9 rounded-lg text-xs font-semibold transition-all ${colorEstado[d.estado]} ${
                d.estado === "seleccionado" ? "ring-2 ring-accent ring-offset-1" : ""
              } ${primeraFecha === d.fecha ? "ring-2 ring-accent ring-offset-1" : ""}`}
              title={
                d.estado === "bloqueado"
                  ? "Sin disponibilidad"
                  : d.estado === "parcial"
                  ? `${d.disponibles} de ${d.disponibles} disponibles`
                  : d.estado === "libre"
                  ? "Disponible"
                  : ""
              }
            >
              {d.dia}
            </button>
          )
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold text-muted">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-[#DCFCE7] border border-[#86EFAC]" /> Libre
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-accent-light border border-[#FCD34D]" /> Parcial
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-[#FEE2E2] border border-[#FCA5A5]" /> Bloqueado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-primary" /> Seleccionado
        </span>
      </div>
      <p className="mt-2 text-[10px] text-muted">
        {primeraFecha === null
          ? "Haz clic en una fecha de llegada"
          : "Ahora selecciona la fecha de salida"}
      </p>
    </div>
  );
}
