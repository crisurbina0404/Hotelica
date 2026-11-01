// ============================================================
// Hotelica — Resultados de búsqueda (HU-006, HU-007, HU-008)
// HU-006: buscar hoteles por departamento
// HU-007: filtrar hoteles por precio
// HU-008: filtrar hoteles por capacidad
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../store";
import type { Ruta, Navegar } from "../rutas";
import {
  DEPARTAMENTOS, MUNICIPIOS, fmtDinero, fmtFecha, hoyISO, sumarDias,
  acotarNumero, fechasDeEstadiaValidas,
} from "../data";
import { Reveal, Spinner, EstadoVacio, Estrellas } from "../ui";
import { TarjetaHotel } from "../tarjeta";
import { IconoBuscar, IconoEstrella, IconoFiltro, IconoX, IconoHuespedes, IconoCalendario } from "../icons";

export function Resultados({ ruta, navegar }: { ruta: Extract<Ruta, { nombre: "resultados" }>; navegar: Navegar }) {
  const { hoteles, habitaciones, disponiblesDe } = useApp();

  // Parámetros que llegan del buscador del inicio
  const [depto, setDepto] = useState(ruta.depto ?? "");
  const [muni, setMuni] = useState(ruta.muni ?? "");
  const [llegada, setLlegada] = useState(ruta.llegada ?? sumarDias(hoyISO(), 7));
  const [salida, setSalida] = useState(ruta.salida ?? sumarDias(hoyISO(), 10));
  const [adultos, setAdultos] = useState(ruta.huespedes ?? 2);
  const [ninos, setNinos] = useState(0);
  const huespedes = adultos + ninos;

  // Aviso de la búsqueda rápida: un rango de fechas inválido no puede
  // quedarse en silencio mientras la lista afirma que hay disponibilidad
  const [aviso, setAviso] = useState("");
  const fechasValidas = fechasDeEstadiaValidas(llegada, salida);

  // Si llega una nueva búsqueda desde otra pantalla, sincronizamos los campos
  useEffect(() => {
    setDepto(ruta.depto ?? "");
    setMuni(ruta.muni ?? "");
    if (ruta.llegada) setLlegada(ruta.llegada);
    if (ruta.salida) setSalida(ruta.salida);
    if (ruta.huespedes) setAdultos(ruta.huespedes);
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
    const ps = habitaciones.filter((h) => h.hotelId === hotelId && h.estado === "disponible").map((h) => h.precio);
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
      const aptas = habitaciones.filter(
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
  }, [hoteles, habitaciones, depto, muni, llegada, salida, huespedes, precioMax, ratingMin, soloDestacados, orden, disponiblesDe]);

  const nombreDepto = DEPARTAMENTOS.find((d) => d.id === depto)?.nombre;
  const nombreMuni = MUNICIPIOS.find((m) => m.id === muni)?.nombre;
  const titulo = nombreMuni ? `Hoteles en ${nombreMuni}` : nombreDepto ? `Hoteles en ${nombreDepto}` : "Hoteles en toda Nicaragua";

  // Limpia todos los filtros y vuelve a la búsqueda completa
  const limpiar = () => {
    setDepto(""); setMuni(""); setPrecioMax(3500); setRatingMin(0); setSoloDestacados(false);
    setOrden("destacados"); setAdultos(2); setNinos(0);
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
              <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-primary-dark"><IconoCalendario size={13} /> {fechasValidas ? `${fmtFecha(llegada)} → ${fmtFecha(salida)}` : "Elegí tus fechas"}</span>
              <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-primary-dark"><IconoHuespedes size={13} /> {adultos} adulto{adultos > 1 ? "s" : ""}{ninos > 0 ? `, ${ninos} niño${ninos > 1 ? "s" : ""}` : ""}</span>
            </div>
          </div>

          {/* Búsqueda rápida editable */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!llegada || !salida) {
                setAviso("Elegí la fecha de llegada y la de salida para buscar.");
                return;
              }
              if (salida <= llegada) {
                setAviso("La fecha de salida debe ser posterior a la fecha de llegada.");
                return;
              }
              setAviso("");
            }}
            className="grid w-full grid-cols-2 gap-2 rounded-xl border border-line bg-white p-2.5 shadow-card lg:w-auto lg:grid-cols-[10rem_9rem_9rem_5rem_5rem_auto] lg:items-center"
            noValidate
          >
            <select value={depto} onChange={(e) => { setDepto(e.target.value); setMuni(""); }} className={`${claseCampo} col-span-2 lg:col-span-1`} aria-label="Departamento">
              <option value="">Toda Nicaragua</option>
              {DEPARTAMENTOS.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            <input type="date" value={llegada} min={hoyISO()} onChange={(e) => { setLlegada(e.target.value); setAviso(""); }} className={claseCampo} aria-label="Fecha de llegada" />
            <input type="date" value={salida} min={llegada} onChange={(e) => { setSalida(e.target.value); setAviso(""); }} className={claseCampo} aria-label="Fecha de salida" />
            <input type="number" min={1} max={10} value={adultos} onChange={(e) => setAdultos(acotarNumero(e.target.value, 1, 10))} className={claseCampo} aria-label="Adultos" placeholder="Adultos" />
            <input type="number" min={0} max={8} value={ninos} onChange={(e) => setNinos(acotarNumero(e.target.value, 0, 8))} className={claseCampo} aria-label="Niños" placeholder="Niños" />
            <button type="submit" className="col-span-2 flex h-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark lg:col-span-1" >
              <IconoBuscar size={15} /> Buscar
            </button>
          </form>
        </div>

        {aviso && (
          <p role="alert" className="mt-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C]">
            {aviso}
          </p>
        )}
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* ===== Barra lateral de filtros ===== */}
        <aside className="h-fit rounded-xl border border-line bg-white p-5 shadow-card lg:sticky lg:top-24">
          <p className="flex items-center gap-2 font-display text-sm font-bold text-ink">
            <IconoFiltro size={16} className="text-primary" /> Filtrar resultados
          </p>

          <div className="mt-5 border-t border-line pt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Ordenar por</p>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as typeof orden)}
              className={`${claseCampo} mt-2`}
              aria-label="Ordenar por"
            >
              <option value="destacados">Destacados primero</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="rating">Mejor calificados</option>
            </select>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">
              Destacados son los que eligió el equipo de Hotelica; las otras opciones ordenan por precio por noche o por el promedio de reseñas reales.
            </p>
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Precio máximo</p>
              <span className="rounded-md bg-accent-light px-2 py-0.5 text-xs font-bold text-primary">{fmtDinero(precioMax)}</span>
            </div>
            <input
              type="range" min={800} max={3500} step={100} value={precioMax}
              onChange={(e) => setPrecioMax(Number(e.target.value))}
              className="mt-2.5 w-full accent-[#F7A81B]"
              aria-label="Precio máximo por noche"
            />
            <div className="flex justify-between text-[10px] font-semibold text-muted"><span>C$ 800</span><span>C$ 3,500</span></div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">
              Solo aparecen hoteles con alguna habitación por debajo de ese precio por noche, sin contar el IVA.
            </p>
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Calificación mínima</p>
            {/* Cuatro botones del mismo ancho: los bordes caen alineados con el resto de los controles */}
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setRatingMin(r)}
                  className={`flex items-center justify-center gap-1 rounded-lg border px-1 py-1.5 text-xs font-bold transition-all ${
                    ratingMin === r ? "border-primary bg-primary text-white" : "border-line bg-white text-muted hover:border-primary/50"
                  }`}
                >
                  {r === 0 ? "Todas" : <><IconoEstrella size={11} llena /> {r}+</>}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">
              Filtra por el promedio de las reseñas escritas por quienes ya se hospedaron. "Todas" no filtra nada.
            </p>
          </div>

          {/* Los dos contadores comparten retícula: mismo alto y mismo ancho, así el
              bloque de huéspedes no queda desparejo con el resto del filtro */}
          <div className="mt-5 border-t border-line pt-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { etiqueta: "Adultos", valor: adultos, menos: () => setAdultos(Math.max(1, adultos - 1)), mas: () => setAdultos(Math.min(10, adultos + 1)), reducir: "Reducir adultos", aumentar: "Aumentar adultos" },
                { etiqueta: "Niños", valor: ninos, menos: () => setNinos(Math.max(0, ninos - 1)), mas: () => setNinos(Math.min(8, ninos + 1)), reducir: "Reducir niños", aumentar: "Aumentar niños" },
              ].map((contador) => (
                <div key={contador.etiqueta}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{contador.etiqueta}</p>
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-line px-1.5 py-1">
                    <button
                      onClick={contador.menos}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-lg font-bold leading-none text-muted transition-colors hover:bg-canvas hover:text-primary"
                      aria-label={contador.reducir}
                    >
                      −
                    </button>
                    <span className="font-display text-base font-bold tabular-nums text-ink">{contador.valor}</span>
                    <button
                      onClick={contador.mas}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-lg font-bold leading-none text-muted transition-colors hover:bg-canvas hover:text-primary"
                      aria-label={contador.aumentar}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">
              Cuántas personas se hospedan: de 1 a 10 adultos y de 0 a 8 niños. Los niños también cuentan para la capacidad.
            </p>
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 transition-colors hover:border-primary/40">
              <input type="checkbox" checked={soloDestacados} onChange={(e) => setSoloDestacados(e.target.checked)} className="h-4 w-4 accent-[#0B3540]" />
              <span className="text-sm font-semibold text-ink">Solo destacados</span>
            </label>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">
              Deja únicamente los hoteles que el equipo de Hotelica marcó como destacados.
            </p>
          </div>

          <button onClick={limpiar} className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-xs font-bold text-muted transition-colors hover:border-danger/40 hover:text-[#B91C1C]">
            <IconoX size={13} /> Limpiar filtros
          </button>
        </aside>

        {/* ===== Lista de resultados ===== */}
        <div>
          {!fechasValidas ? (
            // Sin fechas válidas no se afirma disponibilidad: la lista se reemplaza
            // por el pedido de fechas en lugar de mostrar "hoteles disponibles"
            <div className="rounded-xl border border-line bg-white px-5 py-10 text-center">
              <p className="font-display text-base font-bold text-ink">Elegí tus fechas</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                Necesitamos una llegada y una salida válidas para mostrarte la disponibilidad real de cada hotel.
              </p>
            </div>
          ) : cargando ? (
            // Estado de carga solicitado en la guía
            <div className="flex flex-col items-center rounded-xl border border-line bg-white/70 py-24">
              <Spinner size={38} className="text-primary" />
              <p className="mt-4 font-display text-base font-bold text-ink">Buscando hoteles...</p>
              <p className="mt-1 text-sm text-muted">Revisando disponibilidad en {nombreDepto ?? "toda Nicaragua"}</p>
            </div>
          ) : resultados.length === 0 ? (
            // Estado vacío según la cantidad de huéspedes
            <EstadoVacio
              titulo="Sin resultados por ahora"
              detalle={
                huespedes > 4
                  ? `No encontramos habitaciones para ${huespedes} huéspedes. Intenta con menos personas o prueba otro destino.`
                  : "No encontramos hoteles para tu búsqueda. Intenta con otro destino u otras fechas."
              }
              accion={
                <button onClick={limpiar} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
                  Limpiar filtros
                </button>
              }
            />
          ) : (
            <>
              <div className="mb-5">
                <p className="text-sm font-semibold text-muted">
                  <b className="text-primary">{resultados.length}</b> hotel{resultados.length !== 1 && "es"} con disponibilidad para tus fechas
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted">
                  Solo aparecen hoteles aprobados por el equipo de Hotelica; el precio es por noche y el IVA se suma al reservar.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {resultados.map((h, i) => (
                  <Reveal key={h.id} delay={(i % 3) * 90}>
                    <TarjetaHotel hotel={h} navegar={navegar} llegada={llegada} salida={salida} huespedes={huespedes} />
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
