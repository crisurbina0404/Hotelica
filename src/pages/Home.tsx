// ============================================================
// Hotelica — Inicio (HU-001: buscar hoteles por destino)
// ============================================================
import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import {
  DEPARTAMENTOS, MUNICIPIOS, IMAGEN_HERO, fmtDinero, sumarDias, hoyISO,
} from "../data";
import { t } from "../i18n";
import { Reveal, TituloSeccion, Estrellas } from "../ui";
import { TarjetaHotel } from "../tarjeta";
import {
  BanderaNI, IconoBuscar, IconoCalendario, IconoHuespedes, IconoPalmera,
  IconoPin, IconoComillas, IconoLlave, IconoCama, IconoCheck,
} from "../icons";
import { SiluetaDepto } from "../siluetas";

// Gradientes que identifican a cada departamento en la sección de destinos
const GRADIENTES: Record<string, string> = {
  granada: "from-[#B45309] to-[#7C2D12]",
  leon: "from-[#F4502C] to-[#9A2E12]",
  rivas: "from-[#0E7490] to-[#155E75]",
  managua: "from-[#0B3540] to-[#06222A]",
  masaya: "from-[#BE185D] to-[#831843]",
  esteli: "from-[#4D7C0F] to-[#365314]",
  matagalpa: "from-[#15803D] to-[#14532D]",
  caribe: "from-[#127181] to-[#0B3540]",
};

export function Inicio({ navegar }: { navegar: Navegar }) {
  const { hoteles, resenas, favoritos, idioma, avisar } = useApp();

  // ----- Estado del buscador principal (HU-001) -----
  const [depto, setDepto] = useState("");
  const [muni, setMuni] = useState("");
  const [llegada, setLlegada] = useState(sumarDias(hoyISO(), 7));
  const [salida, setSalida] = useState(sumarDias(hoyISO(), 10));
  const [huespedes, setHuespedes] = useState(2);
  const [error, setError] = useState("");

  // Solo aprobados son visibles para el turista (regla de negocio)
  const aprobados = hoteles.filter((h) => h.aprobado === "aprobado");
  const destacados = aprobados.filter((h) => h.destacado);

  // Municipios del departamento elegido
  const municipios = MUNICIPIOS.filter((m) => m.departamentoId === depto);

  // Valida el formulario y lanza la búsqueda de hoteles
  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depto) {
      setError("Selecciona un departamento para comenzar tu búsqueda.");
      return;
    }
    if (salida <= llegada) {
      setError("La fecha de salida debe ser posterior a la fecha de llegada.");
      return;
    }
    if (huespedes < 1) {
      setError("El número de huéspedes debe ser mayor o igual a 1.");
      return;
    }
    setError("");
    navegar({ nombre: "resultados", depto, muni: muni || undefined, llegada, salida, huespedes });
  };

  const claseCampo =
    "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25";

  return (
    <main>
      {/* ============ HERO: lo primero que ve el turista ============ */}
      <section className="relative flex min-h-[700px] flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGEN_HERO} alt="Atardecer en el lago de Nicaragua con los volcanes de Ometepe" className="h-full w-full object-cover" />
          {/* Overlay teal profundo definido en la guía de estilo */}
          <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(11,53,64,0.66)_0%,rgba(7,36,44,0.58)_45%,rgba(5,27,33,0.78)_100%)]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pb-40 pt-32 sm:px-6 lg:pb-44">
          <Reveal>
            <p className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              <BanderaNI size={14} /> Plataforma turística de Nicaragua
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[3.6rem]">
              {t(idioma, "heroTitulo")}{" "}
              <span className="relative inline-block text-accent">
                Nicaragua
                {/* Ola dibujada bajo la palabra clave */}
                <svg className="wave-underline absolute -bottom-2 left-0 w-full" viewBox="0 0 300 14" fill="none" aria-hidden="true">
                  <path d="M3 10c30-7 55-7 74 0s49 7 74 0 49-7 74 0 47 7 72 0" stroke="#F7A81B" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-teal-50/90 sm:text-lg">
              {t(idioma, "heroSubtitulo")}
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-2 text-sm text-teal-50/95">
              <span className="flex items-center gap-2"><span className="text-accent"><IconoPalmera size={18} /></span><b>{aprobados.length}</b> {t(idioma, "heroDestinos")}</span>
              <span className="flex items-center gap-2"><span className="text-accent"><IconoPin size={18} /></span><b>{MUNICIPIOS.length}</b> {t(idioma, "heroMunicipios")}</span>
              <span className="flex items-center gap-2"><span className="text-accent"><IconoComillas size={18} /></span><b>{resenas.length}</b> {t(idioma, "heroResenas")}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ BUSCADOR PRINCIPAL (HU-001) ============ */}
      <section className="relative z-10 mx-auto -mt-28 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <form onSubmit={buscar} className="rounded-2xl border border-line bg-white p-5 shadow-lift sm:p-6" aria-label="Buscador de hoteles">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white"><IconoBuscar size={17} /></span>
              <div>
                <p className="font-display text-base font-bold text-ink">{t(idioma, "buscadorTitulo")}</p>
                <p className="text-xs text-muted">{t(idioma, "buscadorSubtitulo")}</p>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-[1.15fr_1.15fr_1fr_1fr_0.8fr_auto]">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Departamento *</span>
                <select
                  value={depto}
                  onChange={(e) => { setDepto(e.target.value); setMuni(""); }}
                  className={claseCampo}
                >
                  <option value="">Elige un departamento</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Municipio (opcional)</span>
                <select value={muni} onChange={(e) => setMuni(e.target.value)} className={claseCampo} disabled={!depto}>
                  <option value="">{depto ? "Todos los municipios" : "Elige primero un departamento"}</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted"><IconoCalendario size={12} /> Llegada</span>
                <input type="date" value={llegada} min={hoyISO()} onChange={(e) => setLlegada(e.target.value)} className={claseCampo} />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted"><IconoCalendario size={12} /> Salida</span>
                <input type="date" value={salida} min={llegada} onChange={(e) => setSalida(e.target.value)} className={claseCampo} />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted"><IconoHuespedes size={12} /> Huéspedes</span>
                <input
                  type="number" min={1} max={10} value={huespedes}
                  onChange={(e) => setHuespedes(Number(e.target.value))}
                  className={claseCampo}
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-dark hover:shadow-lg active:scale-[0.97] lg:w-auto"
                >
                  <IconoBuscar size={16} className="transition-transform group-hover:rotate-12" />
                  {t(idioma, "buscarBtn")}
                </button>
              </div>
            </div>

            {/* Mensaje de validación del formulario */}
            {error && (
              <p role="alert" className="anim-pop mt-3.5 flex items-center gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></svg>
                {error}
              </p>
            )}
          </form>
        </Reveal>
      </section>

      {/* ============ DESTINOS POR DEPARTAMENTO ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <TituloSeccion ceja="Destinos que enamoran" titulo="De la colonia al Caribe, un departamento a la vez" />
            <button onClick={() => navegar({ nombre: "resultados" })} className="nav-link text-sm font-bold text-primary">
              {t(idioma, "verTodos")}
            </button>
          </div>
        </Reveal>

        <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
          {DEPARTAMENTOS.map((d, i) => {
            const cantidad = aprobados.filter((h) => h.departamentoId === d.id).length;
            return (
              <Reveal key={d.id} delay={i * 70} className="snap-start">
                <button
                  onClick={() => navegar({ nombre: "resultados", depto: d.id })}
                  className={`group relative flex h-52 w-56 shrink-0 flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br ${GRADIENTES[d.id]} p-4 text-left shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift`}
                >
                  <span className="dot-texture-light absolute inset-0 opacity-60" />
                  {/* Silueta característica del departamento (SVG inline accesible) */}
                  <span className="absolute -right-3 -top-3 text-white/25 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <SiluetaDepto id={d.id} className="h-28 w-28" />
                  </span>
                  <span className="relative rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                    {cantidad > 0 ? `${cantidad} hotel${cantidad > 1 ? "es" : ""}` : "Próximamente"}
                  </span>
                  <h3 className="relative mt-2 font-display text-xl font-bold text-white">{d.nombre}</h3>
                  <p className="relative mt-0.5 flex items-center gap-1 text-xs text-white/80">
                    <IconoPin size={12} />
                    {MUNICIPIOS.filter((m) => m.departamentoId === d.id).slice(0, 2).map((m) => m.nombre).join(" · ")}
                  </p>
                  <span className="relative mt-2.5 text-xs font-bold text-accent-light opacity-0 transition-opacity group-hover:opacity-100">
                    Explorar →
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ HOTELES DESTACADOS ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <TituloSeccion ceja="Los favoritos de los viajeros" titulo="Hoteles destacados de esta temporada" />
            <p className="flex items-center gap-1.5 text-sm font-semibold text-muted">
              <span className="text-danger">♥</span> {favoritos.length} en tu lista de favoritos
            </p>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((h, i) => (
            <Reveal key={h.id} delay={i * 90}>
              <TarjetaHotel hotel={h} navegar={navegar} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA (flujo Buscar → Reservar) ============ */}
      <section className="relative mt-24 overflow-hidden bg-primary-deep py-20">
        <span className="dot-texture-light absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <TituloSeccionCentro
              ceja="Así de fácil"
              titulo="De la búsqueda a la hamaca en cuatro pasos"
            />
          </Reveal>

          <div className="mt-14 grid gap-10 lg:grid-cols-4 lg:gap-6">
            {[
              { n: "01", t: "Busca tu destino", d: "Elige departamento, fechas y huéspedes. Te mostramos hoteles familiares aprobados.", icono: <IconoBuscar size={24} /> },
              { n: "02", t: "Compara habitaciones", d: "Revisa capacidad, disponibilidad real y reseñas de otros viajeros.", icono: <IconoCama size={24} /> },
              { n: "03", t: "Reserva con cálculo claro", d: "Noches, subtotal e IVA 15% siempre a la vista. Sin cargos sorpresa.", icono: <IconoLlave size={24} /> },
              { n: "04", t: "Disfruta tu estadía", d: "Check-in en recepción, califica al final y guarda tus favoritos.", icono: <IconoPalmera size={24} /> },
            ].map((p, i) => (
              <Reveal key={p.n} delay={i * 130}>
                <div className={`relative ${i % 2 === 1 ? "lg:translate-y-8" : ""}`}>
                  {i < 3 && (
                    <svg className="absolute -right-4 top-8 hidden text-accent/60 lg:block" width="34" height="14" viewBox="0 0 34 14" fill="none" aria-hidden="true">
                      <path d="M1 7h28m0 0-6-5.5M29 7l-6 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <span className="font-display text-5xl font-extrabold text-white/10">{p.n}</span>
                  <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white shadow-lg">
                    {p.icono}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-white">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-teal-200/75">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS DE VIAJEROS ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal>
          <TituloSeccion ceja="Voces viajeras" titulo="Lo que dicen quienes ya reservaron" />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {resenas.slice(0, 3).map((r, i) => {
            const hotel = hoteles.find((h) => h.id === r.hotelId);
            return (
              <Reveal key={r.id} delay={i * 110} className={i === 1 ? "md:translate-y-6" : ""}>
                <figure className="flex h-full flex-col rounded-xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <span className="text-accent"><IconoComillas size={26} /></span>
                  <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">“{r.comentario}”</blockquote>
                  <div className="mt-5">
                    <Estrellas valor={r.rating} size={14} />
                  </div>
                  <figcaption className="mt-3 flex items-center gap-3 border-t border-line pt-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {r.autor.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink">{r.autor}</span>
                      <span className="block text-xs text-muted">{r.origen} · se hospedó en {hotel?.nombre}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ LLAMADO PARA HOTELEROS ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-deep px-7 py-12 shadow-lift sm:px-12">
            <span className="dot-texture-light absolute inset-0 opacity-40" />
            <span className="absolute -right-8 -top-10 text-white/10"><IconoPalmera size={220} /></span>
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Para hoteleros</p>
                <h2 className="mt-3 max-w-lg font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                  ¿Tienes un hotel pequeño o familiar? Que toda Nicaragua te encuentre.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-teal-100/85">
                  Regístrate gratis, el administrador revisa tu solicitud y en menos de 48 horas apareces en las búsquedas de miles de viajeros.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <button
                  onClick={() => avisar("Solicitud enviada: el administrador revisará tu hotel (demostración)", "info")}
                  className="rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-dark hover:shadow-xl active:scale-[0.97]"
                >
                  Registrar mi hotel gratis
                </button>
                <p className="flex items-center gap-1.5 text-xs text-teal-100/70">
                  <IconoCheck size={13} className="text-accent" /> Aprobación revisada por el equipo de Hotelica
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

// Encabezado centrado (variante del título de sección)
function TituloSeccionCentro({ ceja, titulo }: { ceja: string; titulo: string }) {
  return (
    <div className="text-center">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
        <span className="h-px w-6 bg-accent" /> {ceja} <span className="h-px w-6 bg-accent" />
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-[1.9rem]">{titulo}</h2>
    </div>
  );
}
