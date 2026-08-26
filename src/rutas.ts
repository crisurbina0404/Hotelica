// Mapa de pantallas de la maqueta (navegación por estado, HU por pantalla)
export type Ruta =
  | { nombre: "inicio" }
  | { nombre: "resultados"; depto?: string; muni?: string; llegada?: string; salida?: string; huespedes?: number }
  | { nombre: "hotel"; id: string }
  | { nombre: "reservas" }
  | { nombre: "favoritos" }
  | { nombre: "panel" }
  | { nombre: "admin" };

export type Navegar = (r: Ruta) => void;
