// ============================================================
// Hotelica — Detalle de hotel (HU-002: habitaciones disponibles)
// ============================================================
import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import {
  AMENIDADES, DEPARTAMENTOS, MUNICIPIOS, ETIQUETA_HABITACION,
  fmtDinero, fmtFecha, hoyISO, sumarDias,
} from "../data";
import type { Habitacion, Hotel } from "../data";
import { Reveal, Estrellas, BadgeHabitacion, TituloSeccion } from "../ui";
import { ModalReserva } from "./BookingModal";
import {
  IconoFlechaAtras, IconoPin, IconoCorazon, IconoCama, IconoHuespedes,
  IconoWifi, IconoCafe, IconoSendero, IconoCheck, IconoCalendario, IconoPalmera,
} from "../icons";

// Icono según la amenidad (iconografía propia del proyecto)
function IconoAmenidad({ a }: { a: string }) {
  if (a === "wifi") return <IconoWifi size={15} />;
  if (a === "tour_cafe" || a === "desayuno") return <IconoCafe size={15} />;
  if (a === "senderismo" || a === "snorkel" || a === "kayak") return <IconoSendero size={15} />;
  return <IconoCheck size={15} />;
}

export function DetalleHotel({ id, navegar }: { id: string; navegar: Navegar }) {
  const { hoteles, resenas, favoritos, alternarFavorito, disponiblesDe, avisar } = useApp();
  const hotel = hoteles.find((h) => h.id === id);

  // Fechas y huéspedes que controlan la disponibilidad mostrada
  const [llegada, setLlegada] = useState(sumarDias(hoyISO(), 7));
  const [salida, setSalida] = useState(sumarDias(hoyISO(), 10));
  const [huespedes, setHuespedes] = useState(2);
  const [habitacion, setHabitacion] = useState<Habitacion | null>(null);

  const resenasHotel = useMemo(() => resenas.filter((r) => r.hotelId === id), [resenas, id]);

  if (!hotel) {
    return (
      <main className="mx-auto max-w-3xl px-4 pt-40 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Este hotel no existe o aún no está aprobado.</h1>
        <button onClick={() => navegar({ nombre: "resultados" })} className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">
          Volver a la búsqueda
        </button>
      </main>
    );
  }

  const muni = MUNICIPIOS.find((m) => m.id === hotel.municipioId);
  const depto = DEPARTAMENTOS.find((d) => d.id === hotel.departamentoId);
  const esFavorito = favoritos.includes(hotel.id);

  // Distribución de estrellas para las barras de reseñas
  const distro = [5, 4, 3, 2, 1].map((n) => ({
    n,
    cant: resenasHotel.filter((r) => r.rating === n).length,
  }));

  // Importa las habitaciones del hotel desde el catálogo de semillas
  const rooms = HABITACIONES.filter((h) => h.hotelId === hotel.id);

  const claseCampo = "rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6">
      {/* Botón para regresar a los resultados */}
      <Reveal>
        <button onClick={() => navegar({ nombre: "resultados", depto: hotel.departamentoId })} className="group flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary-dark">
          <IconoFlechaAtras size={16} className="transition-transform group-hover:-translate-x-1" />
          Volver a hoteles en {depto?.nombre}
        </button>
      </Reveal>

      {/* ===== Galería principal ===== */}
      <Reveal delay={80}>
        <div className="mt-5 grid gap-2.5 overflow-hidden rounded-2xl sm:grid-cols-3 sm:grid-rows-2">
          <div className="relative h-72 overflow-hidden sm:col-span-2 sm:h-[420px] sm:row-span-2">
            <img src={hotel.galeria[0]} alt={hotel.nombre} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            {hotel.destacado && (
              <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">Hotel destacado</span>
            )}
          </div>
          {hotel.galeria.slice(1, 3).map((g, i) => (
            <div key={i} className="relative hidden h-full overflow-hidden sm:block">
              <img src={g} alt={`${hotel.nombre} — vista ${i + 2}`} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
          ))}
        </div>
      </Reveal>

      {/* ===== Encabezado del hotel ===== */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{hotel.nombre}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted">
                  <IconoPin size={15} className="text-primary" /> {hotel.direccion} · {muni?.nombre}, {depto?.nombre}
                </p>
              </div>
              <button
                onClick={() => {
                  alternarFavorito(hotel.id);
                  avisar(esFavorito ? "Se quitó de tus favoritos" : "Guardado en tus favoritos", esFavorito ? "info" : "ok");
                }}
                className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                  esFavorito ? "border-danger/30 bg-[#FEF2F2] text-danger" : "border-line text-muted hover:border-danger/40 hover:text-danger"
                }`}
              >
                <IconoCorazon size={16} lleno={esFavorito} />
                {esFavorito ? "En favoritos" : "Guardar"}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <Estrellas valor={hotel.rating} size={17} />
              <span className="font-display text-lg font-bold text-ink">{hotel.rating.toFixed(1)}</span>
              <span className="text-sm text-muted">· {hotel.totalResenas} reseñas de viajeros</span>
            </div>

            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">{hotel.descripcion}</p>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Lo que ofrece</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {hotel.amenidades.map((a) => (
                  <span key={a} className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
                    <IconoAmenidad a={a} /> {AMENIDADES[a] ?? a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Tarjeta resumen lateral */}
        <Reveal delay={140}>
          <aside className="h-fit rounded-xl border border-line bg-white p-6 shadow-card lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Atendido por su dueño</p>
            <p className="mt-1.5 flex items-center gap-2 font-display text-lg font-bold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-accent-dark">{hotel.dueno.charAt(0)}</span>
              {hotel.dueno}
            </p>
            <div className="mt-4 grid gap-2.5 border-t border-line pt-4 text-sm text-muted">
              <p className="flex items-center gap-2"><IconoCalendario size={15} className="text-primary" /> Check-in 2:00 pm · Check-out 11:00 am</p>
              <p className="flex items-center gap-2"><IconoPalmera size={15} className="text-primary" /> Hotel familiar verificado por Hotelica</p>
              <p className="flex items-center gap-2"><IconoHuespedes size={15} className="text-primary" /> Grupos pequeños, trato personal</p>
            </div>
            <a href="#habitaciones" className="mt-5 flex items-center justify-center rounded-lg bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
              Ver habitaciones disponibles
            </a>
          </aside>
        </Reveal>
      </div>

      {/* ===== Habitaciones (HU-002) ===== */}
      <section id="habitaciones" className="mt-16 scroll-mt-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <TituloSeccion ceja="Disponibilidad en tiempo real" titulo="Elige tu habitación" />
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="flex items-center gap-2 text-xs font-bold text-muted">
                Llegada <input type="date" value={llegada} min={hoyISO()} onChange={(e) => setLlegada(e.target.value)} className={claseCampo} />
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-muted">
                Salida <input type="date" value={salida} min={llegada} onChange={(e) => setSalida(e.target.value)} className={claseCampo} />
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-muted">
                Huéspedes <input type="number" min={1} max={10} value={huespedes} onChange={(e) => setHuespedes(Number(e.target.value))} className={`${claseCampo} w-20`} />
              </label>
            </div>
          </div>
        </Reveal>

        <div className="mt-7 grid gap-4">
          {rooms.every((r) => r.estado !== "disponible" || disponiblesDe(r.id, llegada, salida) === 0 || r.capacidad < huespedes) && (
            <p className="rounded-xl border border-[#FCD34D] bg-accent-light px-5 py-4 text-sm font-semibold text-[#92400E]">
              Por ahora este hotel no tiene habitaciones disponibles para las fechas seleccionadas. Prueba con otras fechas.
            </p>
          )}

          {rooms.map((r, i) => {
            const disponibles = disponiblesDe(r.id, llegada, salida);
            const sirveCapacidad = r.capacidad >= huespedes;
            const sePuede = r.estado === "disponible" && disponibles > 0 && sirveCapacidad && salida > llegada;
            return (
              <Reveal key={r.id} delay={i * 80}>
                <div className={`flex flex-col gap-4 rounded-xl border bg-white p-5 transition-all hover:shadow-card sm:flex-row sm:items-center ${sePuede ? "border-line hover:border-primary/35" : "border-line opacity-80"}`}>
                  {/* Miniatura ilustrada del tipo de habitación */}
                  <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-soft to-primary-light text-primary sm:w-32">
                    <IconoCama size={38} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-ink">{r.tipo}</h3>
                      <BadgeHabitacion estado={r.estado} />
                      {r.estado === "disponible" && (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${disponibles > 0 ? "bg-primary-light text-primary-dark" : "bg-[#FEE2E2] text-[#B91C1C]"}`}>
                          {disponibles > 0 ? `${disponibles} disponible${disponibles > 1 ? "s" : ""}` : "Agotado para tus fechas"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted">{r.detalle}</p>
                    <p className="mt-2 flex items-center gap-3 text-xs font-semibold text-muted">
                      <span className="flex items-center gap-1"><IconoHuespedes size={13} /> Hasta {r.capacidad} huéspedes</span>
                      <span className="flex items-center gap-1"><IconoCama size={13} /> {r.unidades} unidades</span>
                      {!sirveCapacidad && <span className="text-[#B91C1C]">No admite {huespedes} huéspedes</span>}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-line pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <p className="text-right">
                      <span className="font-display text-xl font-bold text-primary">{fmtDinero(r.precio)}</span>
                      <span className="block text-[11px] font-semibold text-muted">por noche · + IVA</span>
                    </p>
                    <button
                      disabled={!sePuede}
                      onClick={() => setHabitacion(r)}
                      className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${
                        sePuede
                          ? "bg-accent text-white shadow-md hover:bg-accent-dark active:scale-95"
                          : "cursor-not-allowed bg-line text-muted"
                      }`}
                    >
                      {r.estado !== "disponible" ? ETIQUETA_HABITACION[r.estado] : "Reservar"}
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== Ubicación ===== */}
      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-soft via-white to-accent-light">
            {/* Mapa estilizado dibujado con SVG */}
            <svg className="absolute inset-0 h-full w-full text-primary/15" aria-hidden="true">
              <defs>
                <pattern id="malla" width="34" height="34" patternUnits="userSpaceOnUse">
                  <path d="M34 0H0v34" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#malla)" />
              <path d="M-20 190 C 120 140, 240 230, 420 170 S 700 120, 900 180" fill="none" stroke="#0F766E" strokeOpacity="0.35" strokeWidth="10" strokeLinecap="round" />
              <path d="M60 40 C 180 90, 300 20, 460 70 S 720 60, 860 30" fill="none" stroke="#F59E0B" strokeOpacity="0.4" strokeWidth="5" strokeDasharray="2 10" strokeLinecap="round" />
            </svg>
            <span className="anim-floaty relative flex flex-col items-center text-primary">
              <IconoPin size={44} />
              <span className="mt-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary-dark shadow-md">{muni?.nombre}, {depto?.nombre}</span>
            </span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="flex h-full flex-col justify-center rounded-xl border border-line bg-white p-7 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Cómo llegar</p>
            <h3 className="mt-2 font-display text-xl font-bold text-ink">{hotel.direccion}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Estamos a {muni?.nombre}, en el departamento de {depto?.nombre}. El hotel comparte indicaciones detalladas
              al confirmar tu reserva: puntos de referencia, transporte local y parqueo.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted">
              <span className="rounded-full bg-canvas px-3 py-1.5">Recepción 24 h</span>
              <span className="rounded-full bg-canvas px-3 py-1.5">Transporte bajo pedido</span>
              <span className="rounded-full bg-canvas px-3 py-1.5">Parqueo gratuito</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Reseñas ===== */}
      <section className="mt-16">
        <Reveal>
          <TituloSeccion ceja="Opiniones reales" titulo={`Lo que dicen de ${hotel.nombre}`} />
        </Reveal>
        <div className="mt-7 grid gap-6 lg:grid-cols-[300px_1fr]">
          <Reveal>
            <div className="h-fit rounded-xl border border-line bg-white p-6 text-center shadow-card">
              <p className="font-display text-5xl font-extrabold text-primary">{hotel.rating.toFixed(1)}</p>
              <div className="mt-2 flex justify-center"><Estrellas valor={hotel.rating} size={18} /></div>
              <p className="mt-1.5 text-sm text-muted">{hotel.totalResenas} reseñas verificadas</p>
              <div className="mt-5 grid gap-1.5">
                {distro.map((d) => (
                  <div key={d.n} className="flex items-center gap-2 text-xs font-semibold text-muted">
                    <span className="w-3">{d.n}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                      <div
                        className="anim-grow h-full rounded-full bg-accent"
                        style={{ width: `${resenasHotel.length ? (d.cant / resenasHotel.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-4 text-right">{d.cant}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {resenasHotel.length === 0 && (
              <p className="rounded-xl border border-line bg-white p-6 text-sm text-muted sm:col-span-2">
                Aún no hay reseñas escritas para este hotel. ¡Sé la primera persona en calificar tu estadía!
              </p>
            )}
            {resenasHotel.map((r, i) => (
              <Reveal key={r.id} delay={i * 90}>
                <figure className="h-full rounded-xl border border-line bg-white p-5 shadow-card transition-transform duration-300 hover:-translate-y-1">
                  <Estrellas valor={r.rating} size={13} />
                  <blockquote className="mt-2.5 text-sm leading-relaxed text-ink">“{r.comentario}”</blockquote>
                  <figcaption className="mt-3.5 flex items-center gap-2.5 border-t border-line pt-3.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                      {r.autor.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                    </span>
                    <span className="text-xs">
                      <b className="block text-ink">{r.autor}</b>
                      <span className="text-muted">{r.origen} · {fmtFecha(r.fecha)}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de reserva (HU-003) */}
      {habitacion && (
        <ModalReserva
          hotel={hotel as Hotel}
          habitacion={habitacion}
          llegada={llegada}
          salida={salida}
          huespedes={Math.min(huespedes, habitacion.capacidad)}
          navegar={navegar}
          alCerrar={() => setHabitacion(null)}
        />
      )}
    </main>
  );
}

// Catálogo de habitaciones (mismo origen de datos que el resto de la maqueta)
import { HABITACIONES_SEED as HABITACIONES } from "../data";
