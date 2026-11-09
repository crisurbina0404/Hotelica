// Mapa de pantallas de la maqueta (navegación por estado, HU por pantalla)
export type Ruta =
  | { nombre: "inicio" }
  | { nombre: "resultados"; depto?: string; muni?: string; llegada?: string; salida?: string; huespedes?: number }
  | { nombre: "hotel"; id: string }
  | { nombre: "destinos"; depto?: string }
  | { nombre: "reservas" }
  | { nombre: "favoritos" }
  | { nombre: "perfil" }
  | { nombre: "recuperar" }
  | { nombre: "restablecer"; token?: string }
  | { nombre: "panel" }
  | { nombre: "admin" };

export type Navegar = (r: Ruta) => void;

// Cada pantalla tiene su propia dirección para que el navegador pueda
// guardarla en el historial y volver con las flechas de atrás y adelante
export function rutaAUrl(r: Ruta): string {
  switch (r.nombre) {
    case "inicio":
      return "/";
    case "resultados": {
      const consulta = new URLSearchParams();
      if (r.depto) consulta.set("departamento", r.depto);
      if (r.muni) consulta.set("municipio", r.muni);
      if (r.llegada) consulta.set("llegada", r.llegada);
      if (r.salida) consulta.set("salida", r.salida);
      if (r.huespedes) consulta.set("huespedes", String(r.huespedes));
      const texto = consulta.toString();
      return texto ? `/hoteles?${texto}` : "/hoteles";
    }
    case "hotel":
      return `/hoteles/${r.id}`;
    case "destinos":
      return r.depto ? `/destinos?departamento=${r.depto}` : "/destinos";
    case "reservas":
      return "/mis-reservas";
    case "favoritos":
      return "/favoritos";
    case "perfil":
      return "/perfil";
    case "recuperar":
      return "/recuperar";
    case "restablecer":
      return "/restablecer";
    case "panel":
      return "/panel";
    case "admin":
      return "/admin";
  }
}

// Lee la dirección del navegador y devuelve la pantalla que toca mostrar
export function urlARuta(url: string): Ruta {
  const { pathname, search } = new URL(url, window.location.origin);
  const consulta = new URLSearchParams(search);
  const partes = pathname.split("/").filter(Boolean);

  // /hoteles/:id abre el detalle y /hoteles abre la lista de resultados
  if (partes[0] === "hoteles") {
    if (partes[1]) return { nombre: "hotel", id: partes[1] };
    const huespedes = Number(consulta.get("huespedes"));
    return {
      nombre: "resultados",
      depto: consulta.get("departamento") ?? undefined,
      muni: consulta.get("municipio") ?? undefined,
      llegada: consulta.get("llegada") ?? undefined,
      salida: consulta.get("salida") ?? undefined,
      huespedes: huespedes > 0 ? huespedes : undefined,
    };
  }

  switch (partes[0]) {
    case "destinos":
      return { nombre: "destinos", depto: consulta.get("departamento") ?? undefined };
    case "mis-reservas":
      return { nombre: "reservas" };
    case "favoritos":
      return { nombre: "favoritos" };
    case "perfil":
      return { nombre: "perfil" };
    case "recuperar":
      return { nombre: "recuperar" };
    case "restablecer":
      return { nombre: "restablecer" };
    case "panel":
      return { nombre: "panel" };
    case "admin":
      return { nombre: "admin" };
    default:
      return { nombre: "inicio" };
  }
}
