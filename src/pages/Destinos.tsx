// ============================================================
// Hotelica — Destinos y actividades turísticas (HU-012)
// ============================================================
import { useState, useMemo } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import {
  DEPARTAMENTOS, DESTINOS_TURISTICOS, ETIQUETA_CATEGORIA, ETIQUETA_DIFICULTAD, fmtDinero,
} from "../data";
import type { CategoriaActividad } from "../data";
import { Reveal, TituloSeccion } from "../ui";
import {
  IconoPin, IconoPalmera, IconoSendero, IconoOjo, IconoCafe,
} from "../icons";

// Colores para cada categoría de actividad
const COLORES_CATEGORIA: Record<CategoriaActividad, string> = {
  aventura: "bg-[#F97316]/10 text-[#EA580C] border-[#F97316]/30",
  cultura: "bg-[#8B5CF6]/10 text-[#7C3AED] border-[#8B5CF6]/30",
  naturaleza: "bg-[#22C55E]/10 text-[#16A34A] border-[#22C55E]/30",
  playa: "bg-[#0EA5E9]/10 text-[#0284C7] border-[#0EA5E9]/30",
};

// Iconos para cada categoría
const ICONOS_CATEGORIA: Record<CategoriaActividad, React.ReactNode> = {
  aventura: <IconoSendero size={14} />,
  cultura: <IconoCafe size={14} />,
  naturaleza: <IconoPalmera size={14} />,
  playa: <IconoOjo size={14} />,
};

export function Destinos({ navegar }: { navegar: Navegar }) {
  const { idioma } = useApp();

  // Filtro por departamento
  const [deptoFiltro, setDeptoFiltro] = useState("");
  // Filtro por categoría de actividad
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaActividad | "">("");
  // Destino seleccionado para ver detalle
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<string | null>(null);

  // Filtrar destinos
  const destinosFiltrados = useMemo(() => {
    return DESTINOS_TURISTICOS.filter((d) => {
      if (deptoFiltro && d.departamentoId !== deptoFiltro) return false;
      if (categoriaFiltro) {
        const tieneActividad = d.actividades.some((a) => a.categoria === categoriaFiltro);
        if (!tieneActividad) return false;
      }
      return true;
    });
  }, [deptoFiltro, categoriaFiltro]);

  // Obtener el destino seleccionado
  const destinoDetalle = DESTINOS_TURISTICOS.find((d) => d.id === destinoSeleccionado);

  // Obtener nombre del departamento
  const nombreDepto = (id: string) => DEPARTAMENTOS.find((d) => d.id === id)?.nombre ?? id;

  const claseCampo = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
      {/* Encabezado */}
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Explora Nicaragua</p>
            <h1 className="mt-1.5 font-display text-3xl font-bold text-ink sm:text-4xl">Destinos y actividades turísticas</h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Descubre los mejores destinos de cada departamento y las actividades que puedes realizar en cada lugar.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Filtros */}
      <Reveal delay={100}>
        <div className="mt-8 flex flex-wrap gap-3 rounded-xl border border-line bg-white p-4 shadow-card">
          <label className="block flex-1 min-w-[200px]">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Departamento</span>
            <select
              value={deptoFiltro}
              onChange={(e) => setDeptoFiltro(e.target.value)}
              className={claseCampo}
            >
              <option value="">Todos los departamentos</option>
              {DEPARTAMENTOS.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </label>

          <label className="block flex-1 min-w-[200px]">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Categoría de actividad</span>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value as CategoriaActividad | "")}
              className={claseCampo}
            >
              <option value="">Todas las categorías</option>
              {Object.entries(ETIQUETA_CATEGORIA).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              onClick={() => { setDeptoFiltro(""); setCategoriaFiltro(""); }}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-bold text-muted transition-colors hover:border-primary/40 hover:text-primary"
            >
              Limpiar
            </button>
          </div>
        </div>
      </Reveal>

      {/* Contador de resultados */}
      <Reveal delay={150}>
        <p className="mt-6 text-sm font-semibold text-muted">
          <b className="text-primary">{destinosFiltrados.length}</b> destino{destinosFiltrados.length !== 1 && "s"} encontrado{destinosFiltrados.length !== 1 && "s"}
        </p>
      </Reveal>

      {/* Grid de destinos */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinosFiltrados.map((destino, i) => (
          <Reveal key={destino.id} delay={(i % 3) * 80}>
            <button
              onClick={() => setDestinoSeleccionado(destino.id)}
              className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-white text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              {/* Imagen del destino */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={destino.imagen}
                  alt={destino.nombre}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-ink backdrop-blur-sm">
                  <IconoPin size={12} className="text-primary" />
                  {nombreDepto(destino.departamentoId)}
                </span>
              </div>

              {/* Contenido */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-lg font-bold text-ink group-hover:text-primary transition-colors">
                  {destino.nombre}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
                  {destino.descripcion}
                </p>

                {/* Actividades */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {destino.actividades.slice(0, 3).map((act) => (
                    <span
                      key={act.id}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${COLORES_CATEGORIA[act.categoria]}`}
                    >
                      {ICONOS_CATEGORIA[act.categoria]}
                      {ETIQUETA_CATEGORIA[act.categoria]}
                    </span>
                  ))}
                  {destino.actividades.length > 3 && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                      +{destino.actividades.length - 3}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Ver detalle →
                </p>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Estado vacío */}
      {destinosFiltrados.length === 0 && (
        <Reveal>
          <div className="flex flex-col items-center rounded-xl border border-line bg-white/70 py-20">
            <IconoPin size={48} className="text-muted/30" />
            <p className="mt-4 font-display text-lg font-bold text-ink">No encontramos destinos</p>
            <p className="mt-1 text-sm text-muted">Intenta con otro departamento o categoría de actividad.</p>
            <button
              onClick={() => { setDeptoFiltro(""); setCategoriaFiltro(""); }}
              className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
            >
              Limpiar filtros
            </button>
          </div>
        </Reveal>
      )}

      {/* ============ MODAL DE DETALLE DEL DESTINO ============ */}
      {destinoDetalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setDestinoSeleccionado(null)}
        >
          <Reveal>
            <div
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-white shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Imagen */}
              <div className="relative h-56 overflow-hidden sm:h-64">
                <img src={destinoDetalle.imagen} alt={destinoDetalle.nombre} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button
                  onClick={() => setDestinoSeleccionado(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-ink backdrop-blur-sm">
                    <IconoPin size={12} className="text-primary" />
                    {nombreDepto(destinoDetalle.departamentoId)}
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">{destinoDetalle.nombre}</h2>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-ink">{destinoDetalle.descripcion}</p>

                {/* Actividades */}
                <div className="mt-6">
                  <h3 className="font-display text-base font-bold text-ink">Actividades turísticas</h3>
                  <p className="mt-1 text-xs text-muted">{destinoDetalle.actividades.length} actividad{destinoDetalle.actividades.length !== 1 && "es"} disponible{destinoDetalle.actividades.length !== 1 && "s"}</p>

                  <div className="mt-4 space-y-3">
                    {destinoDetalle.actividades.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-xl border border-line p-4 transition-all hover:border-primary/30 hover:shadow-card"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-display text-sm font-bold text-ink">{act.nombre}</h4>
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${COLORES_CATEGORIA[act.categoria]}`}>
                                {ICONOS_CATEGORIA[act.categoria]}
                                {ETIQUETA_CATEGORIA[act.categoria]}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted">{act.descripcion}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-muted">
                          <span className="flex items-center gap-1">
                            <IconoSendero size={12} className="text-primary" />
                            {ETIQUETA_DIFICULTAD[act.dificultad]}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconoOjo size={12} className="text-primary" />
                            {act.duracion}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconoCafe size={12} className="text-primary" />
                            {act.precio === 0 ? "Gratuita" : fmtDinero(act.precio)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </main>
  );
}
