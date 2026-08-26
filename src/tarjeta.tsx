// ============================================================
// Hotelica — Tarjeta de hotel (HU-001 resultados / HU-010 favoritos)
// ============================================================
import { useState } from "react";
import { useApp } from "./store";
import type { Hotel } from "./data";
import { AMENIDADES, DEPARTAMENTOS, MUNICIPIOS, fmtDinero } from "./data";
import type { Navegar } from "./rutas";
import { Estrellas } from "./ui";
import { IconoCorazon, IconoPin } from "./icons";

export function TarjetaHotel({ hotel, navegar, retraso = 0 }: { hotel: Hotel; navegar: Navegar; retraso?: number }) {
  const { favoritos, alternarFavorito, avisar } = useApp();
  const [latido, setLatido] = useState(false);
  const esFavorito = favoritos.includes(hotel.id);

  const muni = MUNICIPIOS.find((m) => m.id === hotel.municipioId);
  const depto = DEPARTAMENTOS.find((d) => d.id === hotel.departamentoId);

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
      className="group cursor-pointer overflow-hidden rounded-xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-lift"
      onClick={() => navegar({ nombre: "hotel", id: hotel.id })}
      style={{ animationDelay: `${retraso}ms` }}
    >
      {/* Fotografía con zoom suave al pasar el cursor */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.imagen}
          alt={hotel.nombre}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/10" />

        {hotel.destacado && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
            Destacado
          </span>
        )}

        <button
          onClick={alTocarCorazon}
          aria-label={esFavorito ? "Quitar de favoritos" : "Marcar como favorito"}
          className={`absolute right-3 top-3 rounded-full p-2 shadow-md transition-colors ${
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

      <div className="p-4">
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

        <div className="mt-4 flex items-end justify-between border-t border-line pt-3.5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Desde</p>
            <p className="font-display text-lg font-bold leading-none text-primary">
              {fmtDinero(precioDesde(hotel.id))}
              <span className="text-xs font-medium text-muted"> / noche</span>
            </p>
          </div>
          <span className="rounded-lg bg-primary px-3.5 py-2 text-sm font-bold text-white transition-colors group-hover:bg-primary-dark">
            Ver hotel
          </span>
        </div>
      </div>
    </article>
  );
}

// El precio "desde" es el de la habitación más económica del hotel
import { HABITACIONES_SEED } from "./data";
function precioDesde(hotelId: string): number {
  const precios = HABITACIONES_SEED.filter((h) => h.hotelId === hotelId).map((h) => h.precio);
  return precios.length ? Math.min(...precios) : 0;
}
