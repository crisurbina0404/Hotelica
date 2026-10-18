// ============================================================
// Hotelica — Mapa real del hotel (HU-037)
// Leaflet + OpenStreetMap: código abierto, sin API keys.
// Dos variantes: "vista" (solo lectura, para el detalle y la
// revisión del admin) y "selector" (el dueño marca la ubicación
// exacta con un clic o arrastrando el pin).
// ============================================================
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Punto } from "./data";

// El pin es SVG propio con los colores de marca: no usamos las
// imágenes por defecto de Leaflet (no cargan con Vite y no son
// nuestras). La punta del icono marca el punto exacto.
const PIN = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0B3540" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" fill="#F7A81B"/><circle cx="12" cy="10" r="2.6" fill="#F8F6F0"/></svg>`;

const iconoPin = L.divIcon({
  className: "",
  html: PIN,
  iconSize: [36, 36],
  iconAnchor: [18, 34],
});

// Centro con el que abre el mapa si aún no hay ni punto ni municipio
const CENTRO_NICARAGUA: Punto = { lat: 12.15, lng: -85.35 };

// ¿El visitante pidió reducir el movimiento? Si es así, el mapa
// no anima el encuadre (regla del proyecto: movimiento finito)
function movimientoReducido(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Reencuadra el mapa cuando cambia el centro elegido (por ejemplo, cuando
// el dueño selecciona otro municipio). Sin esto, MapContainer conserva la
// vista con la que montó y el mapa seguiría mostrando el país entero.
// El punto ya elegido no mueve la vista: solo el centro manda.
function Reencuadrar({ centro, zoom, sinMovimiento }: { centro: Punto | null; zoom: number; sinMovimiento: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!centro) return;
    map.setView([centro.lat, centro.lng], zoom, { animate: !sinMovimiento });
  }, [map, centro?.lat, centro?.lng, zoom, sinMovimiento]);
  return null;
}

// En la variante "selector": cada clic en el mapa deja el pin ahí
function ClicParaUbicar({ alCambiar }: { alCambiar: (p: Punto) => void }) {
  useMapEvents({
    click(e) {
      alCambiar({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
    },
  });
  return null;
}

export function MapaHotel({
  punto,
  nombre,
  variante = "vista",
  alCambiar,
  altura = "h-72",
  zoom,
  centro,
}: {
  /** Ubicación del pin; en la variante "selector" puede venir vacía */
  punto?: Punto | null;
  /** Nombre del hotel, para el aviso accesible y el popup */
  nombre: string;
  /** "vista" = solo lectura · "selector" = clic o arrastre marcan el punto */
  variante?: "vista" | "selector";
  alCambiar?: (p: Punto) => void;
  /** Clase de Tailwind para la altura del contenedor */
  altura?: string;
  /** Nivel de zoom; sin punto ni centro se abre viendo todo Nicaragua */
  zoom?: number;
  /** Punto que determina el encuadre inicial (centro del municipio o el pin) */
  centro?: Punto | null;
}) {
  const sinMovimiento = useMemo(movimientoReducido, []);
  const encuadre = centro ?? punto;
  const inicio = encuadre ?? CENTRO_NICARAGUA;
  const zoomFinal = encuadre ? (zoom ?? 15) : 8;

  return (
    <div
      role="region"
      aria-label={`Mapa de la ubicación de ${nombre}`}
      // relative + z-0 crea su propio contexto de apilamiento: así los
      // controles del mapa (z-index de Leaflet) no pisan la barra superior
      className={`relative z-0 overflow-hidden rounded-xl border border-line ${altura}`}
    >
      <MapContainer
        center={[inicio.lat, inicio.lng]}
        zoom={zoomFinal}
        scrollWheelZoom={false}
        zoomAnimation={!sinMovimiento}
        fadeAnimation={!sinMovimiento}
        markerZoomAnimation={!sinMovimiento}
        className="h-full w-full"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuidores'
        />
        {punto && (
          <Marker
            position={[punto.lat, punto.lng]}
            icon={iconoPin}
            draggable={variante === "selector" && !!alCambiar}
            eventHandlers={
              variante === "selector" && alCambiar
                ? {
                    dragend: (e) => {
                      const ll = (e.target as L.Marker).getLatLng();
                      alCambiar({ lat: Number(ll.lat.toFixed(6)), lng: Number(ll.lng.toFixed(6)) });
                    },
                  }
                : undefined
            }
          >
            {variante === "vista" && <Popup>{nombre}</Popup>}
          </Marker>
        )}
        {variante === "selector" && alCambiar && <ClicParaUbicar alCambiar={alCambiar} />}
        <Reencuadrar centro={centro ?? null} zoom={zoomFinal} sinMovimiento={sinMovimiento} />
      </MapContainer>
    </div>
  );
}
