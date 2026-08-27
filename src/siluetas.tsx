// ============================================================
// Hotelica — Siluetas de departamentos en SVG inline
// Dibujos de trazo sólido (viewBox 64×64, fill="currentColor")
// sin gradientes, filtros ni imágenes externas.
// ============================================================
import type { ReactNode } from "react";

// Nombre legible de cada departamento para la etiqueta accesible
const NOMBRES: Record<string, string> = {
  granada: "Granada",
  leon: "León",
  rivas: "Rivas",
  managua: "Managua",
  masaya: "Masaya",
  esteli: "Estelí",
  matagalpa: "Matagalpa",
  caribe: "RACCS (Caribe Sur)",
};

// Cada silueta comparte la misma línea de suelo (y ≈ 52) para dar consistencia
const SILUETAS: Record<string, ReactNode> = {
  // Iglesia colonial con su cruz y las isletas del lago
  granada: (
    <>
      <path d="M29.2 6h1.6v2.6h2.6v1.6h-2.6v2.8h-1.6V10.2h-2.6V8.6h2.6z" />
      <path d="M25 22l5-7 5 7z" />
      <path d="M26 22h8v30h-8z" />
      <path d="M12 52V34l9-8 9 8v18z" />
      <path d="M38 52a4 4 0 0 1 8 0z" />
      <path d="M48 52a3 3 0 0 1 6 0z" />
      <rect x="6" y="52" width="52" height="3" rx="1.5" />
    </>
  ),
  // Catedral con cúpula y el volcán Cerro Negro humeando
  leon: (
    <>
      <path d="M16.2 16.5h1.6v2.2h2.2v1.6h-2.2v2.2h-1.6v-2.2H14v-1.6h2.2z" />
      <circle cx="17" cy="24" r="3" />
      <path d="M6 36l11-8 11 8z" />
      <path d="M6 36h22v16H6z" />
      <path d="M32 52L45 24h4l13 28z" />
      <circle cx="50" cy="17.5" r="2.6" opacity=".55" />
      <circle cx="54.5" cy="12" r="1.9" opacity=".35" />
    </>
  ),
  // Los dos conos de Ometepe con el sol sobre el lago
  rivas: (
    <>
      <path d="M8 52L24 24l8 12 8-16 16 32z" />
      <circle cx="50" cy="14" r="6" opacity=".6" />
      <rect x="6" y="52" width="52" height="3" rx="1.5" />
    </>
  ),
  // Skyline de la capital con la laguna y el volcán al fondo
  managua: (
    <>
      <path d="M38 52L50 27l3 1 9 24z" opacity=".5" />
      <path d="M6 52V36h6v-8h6v12h6V20h6v14h6v-4h8v22z" />
      <path d="M26.5 14h1.5v6h-1.5z" />
      <rect x="6" y="52" width="52" height="3" rx="1.5" />
    </>
  ),
  // La cruz en la loma, el mercado artesanal y la laguna
  masaya: (
    <>
      <path d="M15 12h2v4h4v2h-4v6h-2v-6h-4v-2h4z" />
      <path d="M6 40a10 10 0 0 1 20 0z" />
      <path d="M34 28l4-5 4 5 4-5 4 5v4H34z" />
      <path d="M36 32h12v10H36z" />
      <ellipse cx="32" cy="45" rx="24" ry="5" />
    </>
  ),
  // Cordillera del norte con la hoja de tabaco en primer plano
  esteli: (
    <>
      <path d="M14 52L30 26l18 26z" opacity=".5" />
      <path d="M28 52L43 30l15 22z" />
      <path d="M16 14c-6 4-10 12-8 21 1 4.5 4 7 8 7s7-2.5 8-7c2-9-2-17-8-21z" />
      <path d="M15 42h2v8h-2z" />
    </>
  ),
  // Montañas neblinosas con la rama de café y sus cerezas
  matagalpa: (
    <>
      <path d="M10 52L24 30l12 14 8-10 14 18z" opacity=".5" />
      <path d="M4 52L16 32l8 10 6-8 14 18z" />
      <path d="M44 16l2.5-.8 6 22-2.5.8z" />
      <ellipse cx="42" cy="24" rx="6" ry="2.4" transform="rotate(-32 42 24)" />
      <ellipse cx="53" cy="27" rx="6" ry="2.4" transform="rotate(24 53 27)" />
      <ellipse cx="45" cy="33" rx="5.5" ry="2.2" transform="rotate(-28 45 33)" />
      <circle cx="50" cy="39" r="2.4" />
      <circle cx="55" cy="42" r="2.4" opacity=".7" />
    </>
  ),
  // Palmera inclinada con los cayos sobre el mar Caribe
  caribe: (
    <>
      <path d="M18 52c1.5-9 2-18 6-26l2.6 1.2c-3.8 8-4.4 16.4-5.8 24.8z" />
      <path d="M25.5 25c-5-6-13-7.5-18.5-4.5 6 1.2 12 3.6 16.6 7.6z" />
      <path d="M27 24.5c5.5-5.5 13.5-6.5 18.5-3-6 .8-12 3-16.6 6.6z" />
      <path d="M26 24c-.6-6.5 2-12.5 7-16-.6 6-2.6 11-5.2 15.6z" />
      <path d="M25.4 24.4c-3.6-4.8-4.2-10.8-1.4-15.4.8 5.4 1.2 10 .4 14.4z" />
      <circle cx="24.5" cy="26.8" r="2" />
      <circle cx="28.6" cy="27.6" r="2" />
      <path d="M38 50a7 3.2 0 0 1 14 0z" />
      <path d="M54 50a4.5 2.2 0 0 1 9 0z" />
      <rect x="6" y="50" width="52" height="3.5" rx="1.75" />
    </>
  ),
};

// Silueta accesible de un departamento (hereda el color del tema)
export function SiluetaDepto({ id, className = "h-24 w-24" }: { id: string; className?: string }) {
  const nombre = NOMBRES[id] ?? id;
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Silueta de ${nombre}`}
      className={className}
      fill="currentColor"
    >
      {SILUETAS[id] ?? SILUETAS.managua}
    </svg>
  );
}
