// ============================================================
// Hotelica — Componentes de interfaz reutilizables
// ============================================================
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { EstadoHabitacion, EstadoHotel, EstadoReserva } from "./data";
import { ETIQUETA_ESTADO, ETIQUETA_HABITACION } from "./data";
import { IconoEstrella, IconoMaleta, IconoX } from "./icons";

// ----- Aparición suave al hacer scroll (firma visual del sitio) -----
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

// ----- Estrellas de calificación (soporta fracciones) -----
export function Estrellas({ valor, size = 15, className = "" }: { valor: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (valor / 5) * 100));
  return (
    <span className={`relative inline-flex ${className}`} aria-label={`Calificación ${valor} de 5`}>
      <span className="flex gap-0.5 text-line">
        {[0, 1, 2, 3, 4].map((i) => (
          <IconoEstrella key={i} size={size} />
        ))}
      </span>
      <span className="absolute inset-0 overflow-hidden text-accent" style={{ width: `${pct}%` }}>
        <span className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <IconoEstrella key={i} size={size} llena />
          ))}
        </span>
      </span>
    </span>
  );
}

// ----- Selector de estrellas interactivo para calificar -----
export function EstrellasInput({ valor, alCambiar }: { valor: number; alCambiar: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const activo = hover || valor;
  return (
    <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => alCambiar(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`Calificar con ${n} estrellas`}
          className={`transition-transform duration-150 hover:scale-125 ${n <= activo ? "text-accent" : "text-line"}`}
        >
          <IconoEstrella size={34} llena={n <= activo} />
        </button>
      ))}
    </div>
  );
}

// Colores oficiales de cada estado de reserva (según guía de estilo)
const CLASES_ESTADO: Record<EstadoReserva, string> = {
  pendiente: "bg-accent-light text-[#92400E] border-[#FCD34D]",
  confirmada: "bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]",
  checkin: "bg-primary-light text-primary border-[#5EEAD4]",
  completada: "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]",
  cancelada: "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]",
};

// ----- Pastilla de estado de reserva -----
export function BadgeEstado({ estado }: { estado: EstadoReserva }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CLASES_ESTADO[estado]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}

// ----- Pastilla de estado de hotel (pendiente / aprobado / rechazado) -----
export function BadgeHotel({ estado }: { estado: EstadoHotel }) {
  const c =
    estado === "aprobado"
      ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]"
      : estado === "pendiente"
      ? "bg-accent-light text-[#92400E] border-[#FCD34D]"
      : "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]";
  const t = estado === "aprobado" ? "Aprobado" : estado === "pendiente" ? "Pendiente" : "Rechazado";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c}`}>{t}</span>;
}

// ----- Pastilla de estado de habitación -----
export function BadgeHabitacion({ estado }: { estado: EstadoHabitacion }) {
  const c =
    estado === "disponible"
      ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]"
      : estado === "mantenimiento"
      ? "bg-accent-light text-[#92400E] border-[#FCD34D]"
      : "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c}`}>{ETIQUETA_HABITACION[estado]}</span>;
}

// ----- Ventana modal con fondo oscurecido -----
export function Modal({
  abierto,
  alCerrar,
  children,
  ancho = "max-w-2xl",
}: {
  abierto: boolean;
  alCerrar: () => void;
  children: ReactNode;
  ancho?: string;
}) {
  // Bloqueamos el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    if (!abierto) return;
    document.body.style.overflow = "hidden";
    const teclado = (e: KeyboardEvent) => e.key === "Escape" && alCerrar();
    window.addEventListener("keydown", teclado);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", teclado);
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-primary-ink/70 backdrop-blur-[3px]" onClick={alCerrar} aria-label="Cerrar" />
      <div className={`anim-pop relative w-full ${ancho} max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-lift sm:rounded-2xl`}>
        <button
          onClick={alCerrar}
          aria-label="Cerrar ventana"
          className="absolute right-3.5 top-3.5 z-10 rounded-full bg-ink/5 p-2 text-muted transition-colors hover:bg-ink/10 hover:text-ink"
        >
          <IconoX size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

// ----- Spinner de carga para búsquedas -----
export function Spinner({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`anim-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" fill="none" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ----- Estado vacío con ilustración de maleta -----
export function EstadoVacio({ titulo, detalle, accion }: { titulo: string; detalle: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-line bg-white/70 px-6 py-14 text-center">
      <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
        <IconoMaleta size={36} />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink">{titulo}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{detalle}</p>
      {accion && <div className="mt-6">{accion}</div>}
    </div>
  );
}

// ----- Encabezado de sección con ceja decorativa -----
export function TituloSeccion({ ceja, titulo, centro = false }: { ceja: string; titulo: string; centro?: boolean }) {
  return (
    <div className={centro ? "text-center" : ""}>
      <p className={`mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary`}>
        <span className="h-px w-6 bg-accent" />
        {ceja}
        {centro && <span className="h-px w-6 bg-accent" />}
      </p>
      <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.9rem] sm:leading-tight">{titulo}</h2>
    </div>
  );
}
