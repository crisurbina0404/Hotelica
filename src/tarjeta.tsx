// ============================================================
// Hotelica — Tarjeta de hotel (HU-006, HU-008, HU-009, HU-010)
// HU-006: resultados de búsqueda
// HU-008: indicador de habitaciones por capacidad
// HU-009: tarjeta con info del hotel
// HU-010: favoritos
// ============================================================
import { useState } from "react";
import { useApp } from "./store";
import type { Hotel } from "./data";
import { AMENIDADES, DEPARTAMENTOS, MUNICIPIOS, calcularTotales, fmtDinero } from "./data";
import type { Navegar } from "./rutas";
import { Estrellas } from "./ui";
import { IconoCorazon, IconoPin } from "./icons";

export function TarjetaHotel({ hotel, navegar, retraso = 0, llegada, salida, huespedes = 2, variante = "columna" }: { hotel: Hotel; navegar: Navegar; retraso?: number; llegada?: string; salida?: string; huespedes?: number; variante?: "columna" | "grande" }) {
  const { favoritos, alternarFavorito, avisar } = useApp();
  const [latido, setLatido] = useState(false);
  const esFavorito = favoritos.includes(hotel.id);

  // Calculamos disponibilidad solo si tenemos fechas
  const hayFechas = llegada && salida;
  const disponibles = hayFechas ? totalDisponibles(hotel.id, llegada, salida) : 0;

  // Habitaciones aptas para la cantidad de huéspedes
  const aptas = hayFechas ? habitacionesAptas(hotel.id, llegada, salida, huespedes) : 0;

  const muni = MUNICIPIOS.find((m) => m.id === hotel.municipioId);
  const depto = DEPARTAMENTOS.find((d) => d.id === hotel.departamentoId);

  // Precio más barato del hotel y su total con IVA 15%, para mostrarlo a la vista
  const precio = precioDesde(hotel.id);
  const totalNoche = calcularTotales(precio, 1).total;

  // Marca o quita el hotel de favoritos con una pequeña animación
  const alTocarCorazon = (e: React.MouseEvent) => {
    e.stopPropagation();
    alternarFavorito(hotel.id);
    setLatido(true);
    setTimeout(() => setLatido(false), 450);
    avisar(esFavorito ? "Se quitó de tus favoritos" : "Guardado en tus favoritos", esFavorito ? "info" : "ok");
  };

  return (
    <article
      className={`group cursor-pointer overflow-hidden border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-lift ${
        // La tarjeta grande se queda con esquinas normales; las de columna llevan el arco
        variante === "grande" ? "flex flex-col rounded-xl sm:flex-row" : "arco"
      }`}
      onClick={() => navegar({ nombre: "hotel", id: hotel.id })}
      style={{ animationDelay: `${retraso}ms` }}
    >
      {/* Fotografía con zoom suave al pasar el cursor */}
      <div
        className={`relative overflow-hidden ${
          variante === "grande" ? "aspect-[4/3] sm:aspect-auto sm:w-1/2" : "aspect-[4/3]"
        }`}
      >
        <img
          src={hotel.imagen}
          alt={hotel.nombre}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/10" />

        {hotel.destacado && (
          <span className="absolute left-3 top-4 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-ink shadow-md">
            Destacado
          </span>
        )}

        <button
          onClick={alTocarCorazon}
          aria-label={esFavorito ? "Quitar de favoritos" : "Marcar como favorito"}
          className={`absolute right-3 top-4 rounded-full p-2 shadow-md transition-colors ${
            esFavorito ? "bg-white text-danger" : "bg-ink/35 text-white hover:bg-white hover:text-danger"
          }`}
        >
          <span className={latido ? "anim-heart block" : "block"}>
            <IconoCorazon size={17} lleno={esFavorito} />
          </span>
        </button>

        <p className="absolute bottom-3 left-3 rounded-md bg-white/92 px-2.5 py-1 text-xs font-bold text-primary-dark shadow-sm backdrop-blur-sm">
          {muni?.nombre}, {depto?.nombre}
        </p>
      </div>

      <div className={`flex-1 p-4 ${variante === "grande" ? "sm:flex sm:flex-col sm:justify-center sm:p-6" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.05rem] font-bold leading-snug text-ink transition-colors group-hover:text-primary">
            {hotel.nombre}
          </h3>
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-primary-soft px-1.5 py-0.5 text-sm font-bold text-primary-dark">
            {hotel.rating.toFixed(1)}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m12 3.4 2.5 5.2 5.7.7-4.2 4 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6-4.2-4 5.7-.7L12 3.4Z" />
            </svg>
          </span>
        </div>

        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <IconoPin size={12} /> {hotel.direccion.split(",").slice(0, 2).join(",")}
        </p>

        <div className="mt-2.5 flex items-center gap-2 text-xs text-muted">
          <Estrellas valor={hotel.rating} size={13} />
          <span>{hotel.totalResenas} reseñas</span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {hotel.amenidades.slice(0, 3).map((a) => (
            <span key={a} className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">
              {AMENIDADES[a] ?? a}
            </span>
          ))}
        </div>

        {/* Disponibilidad para las fechas seleccionadas */}
        {hayFechas && (
          <p className={`mt-2.5 text-xs font-bold ${disponibles === 0 ? "text-danger" : disponibles <= 5 ? "text-accent-dark" : "text-success"}`}>
            {disponibles === 0
              ? "Sin disponibilidad"
              : disponibles <= 5
                ? `¡Solo ${disponibles} disponible${disponibles > 1 ? "s" : ""}!`
                : `${disponibles} unidades disponibles`}
          </p>
        )}

        {/* Indicador de habitaciones aptas para los huéspedes */}
        {hayFechas && aptas > 0 && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" />
              <path d="M3 22h18" />
              <path d="M6 10v4" />
              <path d="M10 10v4" />
              <path d="M14 10v4" />
              <path d="M18 10v4" />
              <path d="M6 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
            </svg>
            {aptas} habitaci{aptas === 1 ? "ón" : "ones"} para {huespedes} huéspede{huespedes > 1 ? "s" : ""}
          </p>
        )}

        <div className="mt-4 pt-3.5">
          {/* Separador dibujado como trazo de hamaca, en vez de línea recta de 1px */}
          <svg viewBox="0 0 120 8" preserveAspectRatio="none" className="mb-3 h-2 w-full text-line" aria-hidden="true">
            <path d="M0 1 Q60 7 120 1" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="flex items-end justify-between">
            <div>
              {/* Precio por noche y total con IVA a la vista (transparencia) */}
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-bold leading-none text-primary tabular-nums">
                  {fmtDinero(precio)}
                </span>
                <span className="text-xs font-medium text-muted">por noche</span>
              </p>
              <p className="mt-1 text-[11px] font-medium text-muted tabular-nums">
                {fmtDinero(totalNoche)} con IVA 15%
              </p>
            </div>
            <span className="rounded-lg bg-primary px-3.5 py-2 text-sm font-bold text-white transition-colors group-hover:bg-primary-dark">
              Ver hotel
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

// El precio "desde" es el de la habitación más económica del hotel
// Precio más económico del hotel
function precioDesde(hotelId: string): number {
  const { habitaciones } = useApp();
  const precios = habitaciones.filter((h) => h.hotelId === hotelId).map((h) => h.precio);
  return precios.length ? Math.min(...precios) : 0;
}

// Suma todas las unidades disponibles del hotel para unas fechas
function totalDisponibles(hotelId: string, llegada: string, salida: string): number {
  const { disponiblesDe, habitaciones } = useApp();
  const delHotel = habitaciones.filter((h) => h.hotelId === hotelId && h.estado === "disponible");
  return delHotel.reduce((suma, h) => suma + disponiblesDe(h.id, llegada, salida), 0);
}

// Cuenta habitaciones aptas para una cantidad de huéspedes
function habitacionesAptas(hotelId: string, llegada: string, salida: string, huespedes: number): number {
  const { disponiblesDe, habitaciones } = useApp();
  const aptas = habitaciones.filter(
    (h) => h.hotelId === hotelId && h.estado === "disponible" && h.capacidad >= huespedes
  );
  return aptas.filter((h) => disponiblesDe(h.id, llegada, salida) > 0).length;
}
