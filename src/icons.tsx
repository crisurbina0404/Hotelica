// ============================================================
// Hotelica — Iconografía propia dibujada en SVG (sin librerías)
// Todos los iconos heredan el color del texto (currentColor)
// ============================================================
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

// Base común de todos los iconos
function Base({ size = 18, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

// Marca de Hotelica: llave que abre una puerta con sol naciente
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="13" fill="#0F766E" />
      <rect x="2" y="2" width="44" height="44" rx="13" stroke="#115E59" strokeWidth="1.5" />
      <path d="M12 10h6a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4h-6" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 16v16" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="31" cy="20" r="6.5" fill="#F59E0B" />
      <path d="M31 9.5v2.2M40.5 20h-2.2M37.7 13.3l-1.6 1.6M24.3 13.3l1.6 1.6" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 33c2.5-2.4 6-2.4 8.5 0s6 2.4 8.5 0" stroke="#5EEAD4" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M22 38c2.5-2.4 6-2.4 8.5 0s6 2.4 8.5 0" stroke="#99F6E4" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export const IconoBuscar = (p: P) => (
  <Base {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.4-4.4" /></Base>
);

export const IconoPin = (p: P) => (
  <Base {...p}><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></Base>
);

export const IconoCalendario = (p: P) => (
  <Base {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" /></Base>
);

export const IconoHuespedes = (p: P) => (
  <Base {...p}><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19.5c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2" /><circle cx="16.5" cy="9.5" r="2.5" /><path d="M15.7 14.6c2.3.2 4.1 1.8 4.7 4.6" /></Base>
);

export const IconoEstrella = ({ llena = false, ...p }: P & { llena?: boolean }) => (
  <Base {...p} fill={llena ? "currentColor" : "none"}>
    <path d="m12 3.4 2.5 5.2 5.7.7-4.2 4 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6-4.2-4 5.7-.7L12 3.4Z" />
  </Base>
);

export const IconoCorazon = ({ lleno = false, ...p }: P & { lleno?: boolean }) => (
  <Base {...p} fill={lleno ? "currentColor" : "none"}>
    <path d="M12 20.2S4 15.2 4 9.6C4 6.9 6 5 8.4 5c1.6 0 3 .9 3.6 2.1C12.6 5.9 14 5 15.6 5 18 5 20 6.9 20 9.6c0 5.6-8 10.6-8 10.6Z" />
  </Base>
);

export const IconoLlave = (p: P) => (
  <Base {...p}><circle cx="8" cy="8.5" r="4.5" /><path d="m11.4 11.9 8.1 8.1M16.5 17l2.3-2.3M14 14.5l2.3-2.3" /></Base>
);

export const IconoCheck = (p: P) => (
  <Base {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Base>
);

export const IconoX = (p: P) => (
  <Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>
);

export const IconoCama = (p: P) => (
  <Base {...p}><path d="M3 18v-8.5M3 15h18v3M21 15v-3.5a2 2 0 0 0-2-2h-8.5V13" /><circle cx="6.8" cy="11.5" r="1.7" /></Base>
);

export const IconoEntrada = (p: P) => (
  <Base {...p}><path d="M13 4h5a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20h-5" /><path d="M4 12h10m0 0-3.5-3.5M14 12l-3.5 3.5" /></Base>
);

export const IconoSalida = (p: P) => (
  <Base {...p}><path d="M11 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h5" /><path d="M20 12H10m10 0-3.5-3.5M20 12l-3.5 3.5" /></Base>
);

export const IconoEscudo = (p: P) => (
  <Base {...p}><path d="M12 3.5 5 6v6c0 4.4 3 7.4 7 8.5 4-1.1 7-4.1 7-8.5V6l-7-2.5Z" /><path d="m9 12 2.2 2.2L15.5 10" /></Base>
);

export const IconoHotel = (p: P) => (
  <Base {...p}><path d="M4 20V6.5A1.5 1.5 0 0 1 5.5 5h8A1.5 1.5 0 0 1 15 6.5V20M15 9h3.5A1.5 1.5 0 0 1 20 10.5V20M2.5 20h19" /><path d="M7.5 9h2m-2 3.5h2m-2 3.5h2M12 16.5h1V20h-1z" /></Base>
);

export const IconoPalmera = (p: P) => (
  <Base {...p}><path d="M12.5 21c-.6-5-.6-9 .5-13" /><path d="M13 8c-2.8-2.4-6-2.6-8.5-1 2 .3 4.5 1 6.5 2.5M13 8c.6-3.2 2.8-5 5.8-5.2-1.2 1.5-2 3.2-2.2 5M13 8c3-.8 5.8-.2 7.5 1.8-2-.3-4.4-.2-6.4.6" /><path d="M5 21h14" /></Base>
);

export const IconoOla = (p: P) => (
  <Base {...p}><path d="M3 9c2.2-2.3 5-2.3 7.2 0s5 2.3 7.2 0" /><path d="M3 15c2.2-2.3 5-2.3 7.2 0s5 2.3 7.2 0" opacity="0.6" /></Base>
);

export const IconoFiltro = (p: P) => (
  <Base {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Base>
);

export const IconoOjo = (p: P) => (
  <Base {...p}><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></Base>
);

export const IconoChevronAbajo = (p: P) => (
  <Base {...p}><path d="m6 9.5 6 6 6-6" /></Base>
);

export const IconoFlechaAtras = (p: P) => (
  <Base {...p}><path d="M19 12H5m0 0 5.5-5.5M5 12l5.5 5.5" /></Base>
);

export const IconoMenu = (p: P) => (
  <Base {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Base>
);

export const IconoTarjeta = (p: P) => (
  <Base {...p}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10.5h18M7 15h4" /></Base>
);

export const IconoBillete = (p: P) => (
  <Base {...p}><rect x="3" y="7" width="18" height="11" rx="2" /><circle cx="12" cy="12.5" r="2.6" /><path d="M6.5 10.2v.01M17.5 14.8v.01" /></Base>
);

export const IconoBanco = (p: P) => (
  <Base {...p}><path d="m12 4 8.5 5h-17L12 4ZM5 9.5V17m4.7-7.5V17m4.6-7.5V17M19 9.5V17M3.5 17h17M4.5 20h15" /></Base>
);

export const IconoWifi = (p: P) => (
  <Base {...p}><path d="M3 9.5C8 5 16 5 21 9.5M6.2 13c3.4-3 8.2-3 11.6 0M9.4 16.2c1.6-1.4 3.6-1.4 5.2 0" /><circle cx="12" cy="19" r="1" fill="currentColor" /></Base>
);

export const IconoCafe = (p: P) => (
  <Base {...p}><path d="M5 9h11v6.5A4.5 4.5 0 0 1 11.5 20h-2A4.5 4.5 0 0 1 5 15.5V9Z" /><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 5.5c-.8 1-.8 1.8 0 2.7M11.5 5.5c-.8 1-.8 1.8 0 2.7" /></Base>
);

export const IconoSendero = (p: P) => (
  <Base {...p}><path d="m4 20 5.5-11L14 20M6.2 16h5.6M14.5 13 17 8l3 5.5M15.7 11h2.6" /></Base>
);

export const IconoSol = (p: P) => (
  <Base {...p}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M21 12h-2M5 12H3M18.4 5.6 17 7M7 17l-1.4 1.4M18.4 18.4 17 17M7 7 5.6 5.6" /></Base>
);

export const IconoRayo = (p: P) => (
  <Base {...p}><path d="M13 3 5 13.5h5L10.5 21 19 10.5h-5.5L13 3Z" /></Base>
);

export const IconoMaleta = (p: P) => (
  <Base {...p}><rect x="4" y="8" width="16" height="12" rx="2.5" /><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16M9.5 13v2.5M14.5 13v2.5" /></Base>
);

export const IconoComillas = (p: P) => (
  <Base {...p}><path d="M7 7C5 8.2 4 10 4 12.5V17h5v-5H6.5c0-1.8.7-3 2-3.8L7 7Zm9 0c-2 1.2-3 3-3 5.5V17h5v-5h-2.5c0-1.8.7-3 2-3.8L16 7Z" fill="currentColor" stroke="none" /></Base>
);

export const IconoReiniciar = (p: P) => (
  <Base {...p}><path d="M4 5v5h5" /><path d="M4.5 10A8 8 0 1 1 4 13.5" /></Base>
);

export const IconoGrafica = (p: P) => (
  <Base {...p}><path d="M4 4v16h16" /><path d="M8 16v-5m4 5V7m4 9v-3" /></Base>
);

// Bandera de Nicaragua simplificada (franjas azul-blanco-azul)
export function BanderaNI({ size = 16 }: { size?: number }) {
  return (
    <svg width={size * 1.4} height={size} viewBox="0 0 28 20" aria-hidden="true">
      <rect width="28" height="20" rx="3" fill="#F4F7FB" />
      <path d="M0 3a3 3 0 0 1 3-3h22a3 3 0 0 1 3 3v3.7H0V3Z" fill="#3A6FC4" />
      <path d="M0 13.3h28V17a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-3.7Z" fill="#3A6FC4" />
      <path d="m14 6.2 3 6h-6l3-6Z" fill="none" stroke="#C8A24B" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
