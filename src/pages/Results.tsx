// ============================================================
// Hotelica — Resultados de búsqueda (HU-001)
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../store";
import type { Ruta, Navegar } from "../rutas";
import {
  DEPARTAMENTOS, MUNICIPIOS, HABITACIONES_SEED, fmtFecha, hoyISO, sumarDias,
} from "../data";
import { Reveal, Spinner, EstadoVacio, Estrellas } from "../ui";
import { TarjetaHotel } from "../tarjeta";
import { IconoBuscar, IconoEstrella, IconoFiltro, IconoX, IconoHuespedes, IconoCalendario } from "../icons";

export function Resultados({ ruta, navegar }: { ruta: Extract<Ruta, { nombre: "resultados" }>; navegar: Navegar }) {
  const { hoteles, disponiblesDe } = useApp();

  // Parámetros que llegan del buscador del inicio
  const [depto, setDepto] = useState(ruta.depto ?? "");
  const [muni, setMuni] = useState(ruta.muni ?? "");
  const [llegada, setLlegada] = useState(ruta.llegada ?? sumarDias(hoyISO(), 7));
  const [salida, setSalida] = useState(ruta.salida ?? sumarDias(hoyISO(), 10));
  const [huespedes, setHuespedes] = useState(ruta.huespedes ?? 2);

  // Si llega una nueva búsqueda desde otra pantalla, sincronizamos los campos
  useEffect(() => {
    setDepto(ruta.depto ?? "");
    setMuni(ruta.muni ?? "");
    if (ruta.llegada) setLlegada(ruta.llegada);
    if (ruta.salida) setSalida(ruta.salida);
    if (ruta.huespedes) setHuespedes(ruta.huespedes);
  }, [ruta]);

  // Filtros adicionales de la barra lateral
  const [orden, setOrden] = useState<"destacados" | "precio_asc" | "precio_desc" | "rating">("destacados");
  const [precioMax, setPrecioMax] = useState(3500);
  const [ratingMin, setRatingMin] = useState(0);
  const [soloDestacados, setSoloDestacados] = useState(false);

  // Simulamos una pequeña espera para mostrar el estado "Buscando hoteles..."
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    setCargando(true);
    const t = setTimeout(() => setCargando(false), 650);
    return () => clearTimeout(t);
  }, [depto, muni, llegada, salida, huespedes, precioMax, ratingMin, soloDestacados, orden]);

  const municipios = MUNICIPIOS.filter((m) => m.departamentoId === depto);

  // Precio mínimo de cada hotel (para ordenar y filtrar)
  const precioMin = (hotelId: string) => {
    const ps = HABITACIONES_SEED.filter((h) => h.hotelId === hotelId && h.estado === "disponible").map((h) => h.precio);
    return ps.length ? Math.min(...ps) : Infinity;
  };

  // Un hotel califica si tiene habitaciones con capacidad y disponibilidad real
  const resultados = useMemo(() => {
    const base = hoteles.filter((h) => h.aprobado === "aprobado");
    const filtrados = base.filter((h) => {
      if (depto && h.departamentoId !== depto) return false;
      if (muni && h.municipioId !== muni) return false;
      if (soloDestacados && !h.destacado) return false;
      if (ratingMin > 0 && h.rating < ratingMin) return false;
      const min = precioMin(h.id);
      if (min > precioMax) return false;
      // Debe existir al menos una habitación que admita a los huéspedes con cupo
      const aptas = HABITACIONES_SEED.filter(
        (hab) =>
          hab.hotelId === h.id &&
          hab.estado === "disponible" &&
          hab.capacidad >= huespedes &&
          disponiblesDe(hab.id, llegada, salida) > 0
      );
      return aptas.length > 0;
    });

    // Ordenamiento elegido por el turista
    return [...filtrados].sort((a, b) => {
      if (orden === "precio_asc") return precioMin(a.id) - precioMin(b.id);
      if (orden === "precio_desc") return precioMin(b.id) - precioMin(a.id);
      if (orden === "rating") return b.rating - a.rating;
      return Number(b.destacado) - Number(a.destacado) || b.rating - a.rating;
    });
  }, [hoteles, depto, muni, llegada, salida, huespedes, precioMax, ratingMin, soloDestacados, orden, disponiblesDe]);

  const nombreDepto = DEPARTAMENTOS.find((d) => d.id === depto)?.nombre;
  const nombreMuni = MUNICIPIOS.find((m) => m.id === muni)?.nombre;
  const titulo = nombreMuni ? `Hoteles en ${nombreMuni}` : nombreDepto ? `Hoteles en ${nombreDepto}` : "Hoteles en toda Nicaragua";

  // Limpia todos los filtros y vuelve a la búsqueda completa
  const limpiar = () => {
    setDepto(""); setMuni(""); setPrecioMax(3500); setRatingMin(0); setSoloDestacados(false);
    setOrden("destacados"); setHuespedes(2);
  };

  const claseCampo = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6">
      {/* Encabezado de la búsqueda */}
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Resultados de búsqueda</p>
            <h1 className="mt-1.5 font-display text-3xl font-bold text-ink sm:text-4xl">{titulo}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted">
              <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-primary-dark"><IconoCalendario size={13} /> {fmtFecha(llegada)} → {fmtFecha(salida)}</span>
              <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-primary-dark"><IconoHuespedes size={13} /> {huespedes} huésped{huespedes > 1 ? "es" : ""}</span>
            </div>
          </div>

          {/* Búsqueda rápida editable */}
          <form
            onSubmit={(e) => { e.preventDefault(); if (salida <= llegada) return; }}
            className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2.5 shadow-card lg:w-auto"
          >
            <select value={depto} onChange={(e) => { setDepto(e.target.value); setMuni(""); }} className={`${claseCampo} lg:w-40`} aria-label="Departamento">
              <option value="">Toda Nicaragua</option>
              {DEPARTAMENTOS.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            <input type="date" value={llegada} min={hoyISO()} onChange={(e) => setLlegada(e.target.value)} className={`${claseCampo} lg:w-36`} aria-label="Fecha de llegada" />
            <input type="date" value={salida} min={llegada} onChange={(e) => setSalida(e.target.value)} className={`${claseCampo} lg:w-36`} aria-label="Fecha de salida" />
            <input type="number" min={1} max={10} value={huespedes} onChange={(e) => setHuespedes(Number(e.target.value))} className={`${claseCampo} lg:w-20`} aria-label="Huéspedes" />
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark" >
              <IconoBuscar size={15} /> Buscar
            </button>
          </form>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* ===== Barra lateral de filtros ===== */}
        <aside className="h-fit rounded-xl border border-line bg-white p-5 shadow-card lg:sticky lg:top-24">
          <p className="flex items-center gap-2 font-display text-sm font-bold text-ink">
            <IconoFiltro size={16} className="text-primary" /> Filtrar resultados
          </p>

          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Ordenar por</p>
            <select value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)} className={`${claseCampo} mt-2`}>
              <option value="destacados">Destacados primero</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="rating">Mejor calificados</option>
            </select>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Precio máximo</p>
              <span className="rounded-md bg-accent-light px-2 py-0.5 text-xs font-bold text-accent-dark">C$ {precioMax.toLocaleString()}</span>
            </div>
            <input
              type="range" min={800} max={3500} step={100} value={precioMax}
              onChange={(e) => setPrecioMax(Number(e.target.value))}
              className="mt-2.5 w-full accent-[#F7A81B]"
              aria-label="Precio máximo por noche"
            />
            <div className="flex justify-between text-[10px] font-semibold text-muted"><span>C$ 800</span><span>C$ 3,500</span></div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Calificación mínima</p>
            <div className="mt-2 flex gap-1.5">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setRatingMin(r)}
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all ${
                    ratingMin === r ? "border-primary bg-primary text-white" : "border-line bg-white text-muted hover:border-primary/50"
                  }`}
                >
                  {r === 0 ? "Todas" : <><IconoEstrella size={11} llena /> {r}+</>}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 transition-colors hover:border-primary/40">
            <input type="checkbox" checked={soloDestacados} onChange={(e) => setSoloDestacados(e.target.checked)} className="h-4 w-4 accent-[#0B3540]" />
            <span className="text-sm font-semibold text-ink">Solo destacados</span>
          </label>

          <button onClick={limpiar} className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-xs font-bold text-muted transition-colors hover:border-danger/40 hover:text-danger">
            <IconoX size={13} /> Limpiar filtros
          </button>
        </aside>

        {/* ===== Lista de resultados ===== */}
        <div>
          {cargando ? (
            // Estado de carga solicitado en la guía
            <div className="flex flex-col items-center rounded-xl border border-line bg-white/70 py-24">
              <Spinner size={38} className="text-primary" />
              <p className="mt-4 font-display text-base font-bold text-ink">Buscando hoteles...</p>
              <p className="mt-1 text-sm text-muted">Revisando disponibilidad en {nombreDepto ?? "toda Nicaragua"}</p>
            </div>
          ) : resultados.length === 0 ? (
            // Estado vacío con el mensaje oficial del proyecto
            <EstadoVacio
              titulo="Sin resultados por ahora"
              detalle="No encontramos hoteles para tu búsqueda. Intenta con otro destino u otras fechas."
              accion={
                <button onClick={limpiar} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
                  Limpiar filtros
                </button>
              }
            />
          ) : (
            <>
              <p className="mb-5 text-sm font-semibold text-muted">
                <b className="text-primary">{resultados.length}</b> hotel{resultados.length !== 1 && "es"} con disponibilidad para tus fechas
              </p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {resultados.map((h, i) => (
                  <Reveal key={h.id} delay={(i % 3) * 90}>
                    <TarjetaHotel hotel={h} navegar={navegar} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// Evitamos que la importación sin uso rompa la compilación
void Estrellas;
