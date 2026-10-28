// ============================================================
// Hotelica — Componentes de interfaz reutilizables
// ============================================================
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";
import type { EstadoHabitacion, EstadoHotel, EstadoReserva } from "./data";
import { ETIQUETA_ESTADO, ETIQUETA_HABITACION, criteriosDeContrasena } from "./data";
import { IconoEstrella, IconoMaleta, IconoX, IconoCheck } from "./icons";

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

// Rutas centralizadas de todos los logos del proyecto (un solo lugar para cambiarlos)
export const LOGOS = {
  // Logo completo (ícono + HOTELICA + guiones): navbar, splash y modal de reserva.
  // Es el único logo de la marca en la barra: sobre el hero se le agrega un
  // contorno claro en vez de cambiar a la versión blanca (HU-039)
  completo: "/Logo.svg",
  // Solo texto con guiones: pensado para el footer
  textoClaro: "/text-subtext-white.svg",
  // Marca del volcán sola: favicon y usos chicos
  sello: "/favicon.svg",
};

// ----- Bloque de marca unificado: imagen oficial con texto incluido -----
export function Marca({
  tam = "md",
  centrada = false,
  conIcono = true,
  clara = false,
  className = "",
}: {
  tam?: "chica" | "md" | "grande" | "enorme" | "splash" | "navbar";
  centrada?: boolean;
  conIcono?: boolean;
  clara?: boolean;
  className?: string;
}) {
  // Nota: los SVG vienen en lienzos 2000x2000 con márgenes transparentes enormes,
  // por eso las alturas son tan grandes: la banda visible del logo es solo ~20% del lienzo
  const clases: Record<string, string> = {
    chica: "h-55 w-auto",
    md: "h-60 w-auto",
    grande: "h-60 w-auto",
    enorme: "h-72 w-auto",
    // Splash: en celular más chico para que el logo no se salga de la pantalla
    splash: "h-60 w-auto sm:h-72",
    // La barra superior: más chica en celular, para que entren la marca y los botones
    navbar: "h-36 w-auto lg:h-60",
  };

  const cls = `${clases[tam]} ${centrada ? "mx-auto" : ""} ${className}`.trim();

  // Estilo común de ambas versiones del logo
  const estiloLogo: CSSProperties = {
    aspectRatio: "2 / 1",
    objectFit: "contain",
    objectPosition: "left center",
  };

  return (
    // Un solo logo: el de la marca. Sobre la fotografía del hero se le suma un
    // contorno claro fino (borde blando) para que se lea sin cambiar de versión
    <span className={`relative inline-block ${cls}`}>
      <img
        src={LOGOS.completo}
        alt="Hotelica - Tu destino en Nicaragua"
        className={cls}
        style={{
          ...estiloLogo,
          filter: clara
            ? "drop-shadow(0 0 1px rgba(255,255,255,0.95)) drop-shadow(0 0 4px rgba(255,255,255,0.6)) drop-shadow(0 1px 5px rgba(5,27,33,0.35))"
            : undefined,
          transition: "filter 300ms ease",
        }}
      />
    </span>
  );
}

// ----- Marca del footer: solo texto claro, más grande para cerrar la página -----
// Misma lógica de márgenes: h-48 muestra el texto un poco más grande que el h-40 anterior
export function MarcaFooter({ className = "" }: { className?: string }) {
  return (
    <img
      src={LOGOS.textoClaro}
      alt="Hotelica — Tu destino en Nicaragua"
      className={`h-48 w-auto ${className}`.trim()}
    />
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
  const [visible, setVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  // Sincronizar apertura/cierre con animación
  useEffect(() => {
    if (abierto) {
      // Guardar posición del scroll antes de abrir
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      setVisible(true);
      setCerrando(false);
    } else if (visible) {
      setCerrando(true);
      const timer = setTimeout(() => {
        // Restaurar scroll al cerrar
        const scrollY = parseInt(document.body.style.top || "0", 10) * -1;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
        setVisible(false);
        setCerrando(false);
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [abierto, visible]);

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return;
    const teclado = (e: KeyboardEvent) => e.key === "Escape" && alCerrar();
    window.addEventListener("keydown", teclado);
    return () => window.removeEventListener("keydown", teclado);
  }, [abierto, alCerrar]);

  if (!visible) return null;
  // Portal al body: el header usa backdrop-blur, y eso convertiría al header en
  // el contenedor de los elementos fixed, recortando la ventana flotante (HU-038)
  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-end justify-center p-0 transition-opacity duration-200 sm:items-center sm:p-6 ${cerrando ? "opacity-0" : "opacity-100"}`} role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-primary-ink/70 backdrop-blur-[3px]" onClick={alCerrar} aria-label="Cerrar" />
      <div className={`relative w-full ${ancho} max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-lift sm:rounded-2xl ${cerrando ? "scale-95 transition-transform duration-200" : "anim-pop"}`}>
        <button
          onClick={alCerrar}
          aria-label="Cerrar ventana"
          className="absolute right-3.5 top-3.5 z-10 rounded-full bg-ink/5 p-2 text-muted transition-colors hover:bg-ink/10 hover:text-ink"
        >
          <IconoX size={16} />
        </button>
        {children}
      </div>
    </div>,
    document.body
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

// ----- Tarjeta de métrica para los paneles (estadísticas globales, HU-034) -----
export function TarjetaMetrica({
  titulo,
  valor,
  detalle,
  icono,
  color,
  compacto = false,
  cargando = false,
}: {
  titulo: string;
  valor: string;
  detalle: string;
  icono: ReactNode;
  color: string;
  compacto?: boolean;
  cargando?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 shadow-card transition-transform hover:-translate-y-1">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>{icono}</span>
      <div className="min-w-0">
        {/* Mientras el dato no está, mostramos una barra que pulsa en vez de un cero engañoso */}
        {cargando ? (
          <p className="h-6 w-16 animate-pulse rounded-md bg-canvas" />
        ) : (
          <p className={`font-display font-extrabold leading-none text-ink tabular-nums ${compacto ? "text-base" : "text-2xl"}`}>
            {valor}
          </p>
        )}
        <p className="mt-1 text-xs font-semibold text-muted">{titulo}</p>
        {detalle && <p className="mt-0.5 text-[11px] leading-snug text-muted/90">{detalle}</p>}
      </div>
    </div>
  );
}

// ----- Palomitas de los criterios de contraseña segura (HU-040) -----
export function ChecklistContrasena({ clave, oscuro = false }: { clave: string; oscuro?: boolean }) {
  const c = criteriosDeContrasena(clave);
  const items = [
    { ok: c.largo, texto: "Al menos 8 caracteres" },
    { ok: c.minuscula, texto: "Una letra minúscula" },
    { ok: c.numero, texto: "Un número" },
    { ok: c.simbolo, texto: "Un símbolo (por ejemplo: @ # ! ?)" },
  ];
  return (
    <ul className="mt-2 grid gap-1">
      {items.map((item) => (
        <li
          key={item.texto}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            item.ok ? "text-[#15803D]" : oscuro ? "text-[#92400E]/60" : "text-muted"
          }`}
        >
          {item.ok ? <IconoCheck size={13} /> : <IconoX size={13} />}
          {item.texto}
        </li>
      ))}
    </ul>
  );
}
