// ============================================================
// Hotelica — Inicio (HU-006: buscar hoteles por departamento)
// ============================================================
import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import {
  DEPARTAMENTOS, MUNICIPIOS, IMAGEN_HERO, fmtDinero, sumarDias, hoyISO,
} from "../data";
import { t } from "../i18n";
import { Reveal, TituloSeccion, Estrellas, Modal } from "../ui";
import { TarjetaHotel } from "../tarjeta";
import { InscribeHotel } from "./InscribeHotel";
import {
  BanderaNI, IconoBuscar, IconoCalendario, IconoHuespedes, IconoPalmera,
  IconoPin, IconoComillas, IconoCheck, IconoHotel,
} from "../icons";

export function Inicio({ navegar }: { navegar: Navegar }) {
  const { hoteles, resenas, favoritos, idioma } = useApp();

  // ----- Estado del buscador principal (HU-006) -----
  const [depto, setDepto] = useState("");
  const [muni, setMuni] = useState("");
  const [llegada, setLlegada] = useState(sumarDias(hoyISO(), 7));
  const [salida, setSalida] = useState(sumarDias(hoyISO(), 10));
  const [huespedes, setHuespedes] = useState(2);
  const [error, setError] = useState("");
  // Guarda cuál campo falló, para pintarlo y anunciarlo al enviar (no al escribir)
  const [campoError, setCampoError] = useState("");
  // Ventana flotante con el formulario de inscripción de hoteleros (HU-038)
  const [inscripcionAbierta, setInscripcionAbierta] = useState(false);

  // Solo aprobados son visibles para el turista (regla de negocio)
  const aprobados = hoteles.filter((h) => h.aprobado === "aprobado");
  const destacados = aprobados.filter((h) => h.destacado);

  // La primera reseña manda como cita destacada; las otras dos acompañan debajo
  const [citaDestacada, ...otrasResenas] = resenas.slice(0, 3);

  // Municipios del departamento elegido
  const municipios = MUNICIPIOS.filter((m) => m.departamentoId === depto);

  // Valida el formulario y lanza la búsqueda de hoteles
  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depto) {
      setError("Selecciona un departamento para comenzar tu búsqueda.");
      setCampoError("depto");
      return;
    }
    if (salida <= llegada) {
      setError("La fecha de salida debe ser posterior a la fecha de llegada.");
      setCampoError("fechas");
      return;
    }
    if (huespedes < 1) {
      setError("El número de huéspedes debe ser mayor o igual a 1.");
      setCampoError("huespedes");
      return;
    }
    setError("");
    setCampoError("");
    navegar({ nombre: "resultados", depto, muni: muni || undefined, llegada, salida, huespedes });
  };

  const claseCampo =
    "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25";

  // Borde coral del campo que falló, y enlace con el mensaje de error
  const marcar = (quien: string) =>
    campoError === quien ? " border-danger focus:border-danger focus:ring-danger/25" : "";
  const esInvalido = (quien: string) => (campoError === quien ? true : undefined);
  const enlazarError = (quien: string) => (campoError === quien ? "error-busqueda" : undefined);

  return (
    <main>
      {/* ============ HERO: lo primero que ve el turista ============ */}
      <section className="relative flex min-h-[560px] flex-col overflow-hidden sm:min-h-[700px]">
        <div className="absolute inset-0">
          <img src={IMAGEN_HERO} alt="Atardecer en el lago de Nicaragua con los volcanes de Ometepe" className="h-full w-full object-cover" />
          {/* Overlay teal profundo definido en la guía de estilo */}
          <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(11,53,64,0.66)_0%,rgba(7,36,44,0.58)_45%,rgba(5,27,33,0.78)_100%)]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pb-32 pt-20 sm:px-6 sm:pb-40 sm:pt-32 lg:pb-44">
          <Reveal>
            <p className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              <BanderaNI size={14} /> Plataforma turística de Nicaragua
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[3.6rem]">
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
            <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-teal-50/90 sm:text-lg">
              {t(idioma, "heroSubtitulo")}
            </p>
          </Reveal>

          <Reveal delay={360}>
            {/* En móvil van en grid de 3 para que ninguna cifra quede sola
                en una línea suelta; desde tablet vuelven a ser fila flex */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-sm text-pretty text-teal-50/95 sm:flex sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-2">
              <span className="flex items-center gap-2"><span className="text-accent"><IconoPalmera size={18} /></span><b>{aprobados.length}</b> {t(idioma, "heroDestinos")}</span>
              <span className="flex items-center gap-2"><span className="text-accent"><IconoPin size={18} /></span><b>{MUNICIPIOS.length}</b> {t(idioma, "heroMunicipios")}</span>
              <span className="flex items-center gap-2"><span className="text-accent"><IconoComillas size={18} /></span><b>{resenas.length}</b> {t(idioma, "heroResenas")}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ BUSCADOR PRINCIPAL (HU-006) ============ */}
      <section className="relative z-10 mx-auto -mt-28 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <form onSubmit={buscar} className="rounded-2xl border border-line bg-white p-4 shadow-lift sm:p-6" aria-label="Buscador de hoteles">
            <div className="mb-3 flex items-center gap-2.5 sm:mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white"><IconoBuscar size={17} /></span>
              <div>
                <p className="font-display text-base font-bold text-ink">{t(idioma, "buscadorTitulo")}</p>
                <p className="text-xs text-muted">{t(idioma, "buscadorSubtitulo")}</p>
              </div>
            </div>

            {/* Jerarquía de campos: dónde (ancho) → cuándo (medio) → cuántos (compacto) */}
            {/* En móvil la retícula es de 2 columnas para que dónde/cuándo/cuántos
                queden en parejas y el CTA quede dentro de la primera pantalla */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-[1.5fr_1.25fr_1fr_1fr_0.65fr_auto]">
              <label className="block">
                <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted sm:mb-1">Departamento *</span>
                <select
                  value={depto}
                  onChange={(e) => { setDepto(e.target.value); setMuni(""); }}
                  className={claseCampo + marcar("depto")}
                  aria-required="true"
                  aria-invalid={esInvalido("depto")}
                  aria-describedby={enlazarError("depto")}
                >
                  <option value="">Elige un departamento</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted sm:mb-1">Municipio (opcional)</span>
                <select value={muni} onChange={(e) => setMuni(e.target.value)} className={claseCampo} disabled={!depto}>
                  <option value="">{depto ? "Todos los municipios" : "Elige primero un departamento"}</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-0.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted sm:mb-1"><IconoCalendario size={12} /> Llegada</span>
                <input
                  type="date" value={llegada} min={hoyISO()}
                  onChange={(e) => setLlegada(e.target.value)}
                  className={claseCampo + marcar("fechas")}
                  aria-invalid={esInvalido("fechas")}
                  aria-describedby={enlazarError("fechas")}
                />
              </label>

              <label className="block">
                <span className="mb-0.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted sm:mb-1"><IconoCalendario size={12} /> Salida</span>
                <input
                  type="date" value={salida} min={llegada}
                  onChange={(e) => setSalida(e.target.value)}
                  className={claseCampo + marcar("fechas")}
                  aria-invalid={esInvalido("fechas")}
                  aria-describedby={enlazarError("fechas")}
                />
              </label>

              <label className="block">
                <span className="mb-0.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted sm:mb-1"><IconoHuespedes size={12} /> Huéspedes</span>
                <input
                  type="number" min={1} max={10} value={huespedes}
                  onChange={(e) => setHuespedes(Number(e.target.value))}
                  className={claseCampo + marcar("huespedes")}
                  aria-invalid={esInvalido("huespedes")}
                  aria-describedby={enlazarError("huespedes")}
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-accent px-3 py-3 text-sm font-bold text-primary-ink shadow-md transition-all hover:bg-accent-dark hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97] sm:px-6 sm:py-2.5 lg:w-auto"
                >
                  <IconoBuscar size={16} className="hidden transition-transform group-hover:rotate-12 sm:block" />
                  {t(idioma, "buscarBtn")}
                </button>
              </div>
            </div>

            {/* Mensaje de validación del formulario */}
            {error && (
              <p id="error-busqueda" role="alert" className="anim-pop mt-3.5 flex items-center gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></svg>
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
            <button onClick={() => navegar({ nombre: "destinos" })} className="nav-link text-sm font-bold text-primary">
              Ver todos los destinos
            </button>
          </div>
        </Reveal>

        {/* Tira deslizable con las 8 tarjetas: se mueve con el dedo o la
            rueda, pero sin barra visible en el borde */}
        <div className="tira-desliza mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
          {DEPARTAMENTOS.map((d, i) => {
            const cantidad = aprobados.filter((h) => h.departamentoId === d.id).length;
            return (
              <Reveal key={d.id} delay={i * 70} className="snap-start">
                <button
                  onClick={() => navegar({ nombre: "resultados", depto: d.id })}
                  className="group relative flex h-52 w-56 shrink-0 flex-col justify-end overflow-hidden rounded-xl bg-primary-ink p-4 text-left shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
                >
                  {/* Fotografía real del departamento, de uso libre (HU-038) */}
                  <img
                    src={`destinos/${d.id}.jpg`}
                    alt={`Vista de ${d.nombre}, Nicaragua`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Velo oscuro: el texto se lee sobre cualquier foto */}
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
                  <span className="relative w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
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

      {/* ============ LLAMADO PARA HOTELEROS ============
          Va justo después de los destinos: de "mira estos lugares" a
          "anuncia el tuyo". Al no cerrar la página, se rompe el orden
          predecible destacados → cómo funciona → testimonios → hoteleros. */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-deep px-7 py-12 shadow-lift sm:px-12">
            <span className="dot-texture-light absolute inset-0 opacity-40" />
            {/* Silueta de hotel: la tarjeta habla de hoteleros, no de viajes (HU-038).
                Apoyada en la esquina inferior derecha para que se lea el edificio
                completo y no compita con el titular. */}
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-10 hidden text-white/12 sm:block">
              <IconoHotel size={250} strokeWidth={0.8} />
            </span>
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Para hoteleros</p>
                <h2 className="mt-3 max-w-lg font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                  Registra tu hotel ahora
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-teal-100/85">
                  ¿Tienes un hotel pequeño o familiar? Que toda Nicaragua te encuentre: completá el formulario
                  sin cuenta y el administrador revisa tu solicitud en menos de 48 horas.
                </p>
              </div>
              <div className="flex flex-col items-start gap-4 lg:items-end">
                <button
                  onClick={() => setInscripcionAbierta(true)}
                  className="rounded-lg bg-accent px-6 py-3 text-sm font-bold text-primary-ink shadow-md transition-all hover:bg-accent-dark hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97]"
                >
                  Registrar mi hotel
                </button>
                <p className="flex items-center gap-1.5 text-xs text-teal-100/70">
                  <IconoCheck size={13} className="text-accent" /> Aprobación revisada por el equipo de Hotelica
                </p>
              </div>
            </div>
          </div>
        </Reveal>
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
        {/* Retícula rota a propósito: una tarjeta grande en horizontal y las
            otras tres en su propia fila, en vez de cuatro tarjetas idénticas */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {destacados[0] && (
            <Reveal className="lg:col-span-3">
              <TarjetaHotel hotel={destacados[0]} navegar={navegar} variante="grande" />
            </Reveal>
          )}
          {destacados.slice(1).map((h, i) => (
            <Reveal key={h.id} delay={(i + 1) * 90}>
              <TarjetaHotel hotel={h} navegar={navegar} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA (HU-036: bloque editorial asimétrico,
          en vez de un patrón numerado de columnas iguales) ============ */}
      <section className="relative mt-24 overflow-hidden bg-primary-deep py-20">
        <span className="dot-texture-light absolute inset-0 opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Mancheta a la izquierda: ancho menor, respiración amplia */}
          <Reveal>
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                <span className="h-px w-6 bg-accent" /> Así de fácil
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-[1.12] text-white sm:text-4xl">
                De la búsqueda<br className="hidden sm:block" /> a la hamaca
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-teal-200/75">
                Buscás, comparás, reservás y ya estás en la hamaca. En medio quedan cuatro cosas
                simples y un cálculo que se ve entero antes de pagar.
              </p>
              <button
                onClick={() => navegar({ nombre: "resultados" })}
                className="mt-7 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary-ink transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Empezar por la búsqueda
              </button>
            </div>
          </Reveal>

          {/* Índice editorial a la derecha: filete en vez de cajas, y sangrías
              alternadas para que no se lea como retícula uniforme */}
          <Reveal delay={120}>
            <ol className="grid gap-7">
              {[
                { verbo: "Buscás", t: "Tu destino", d: "Elige departamento, fechas y huéspedes. Te mostramos hoteles familiares verificados por nuestro equipo." },
                { verbo: "Comparás", t: "Habitaciones", d: "Revisa capacidad, disponibilidad real y reseñas de otros viajeros." },
                { verbo: "Reservás", t: "Con cálculo claro", d: "Noches, subtotal e IVA 15% siempre a la vista. Sin cargos sorpresa." },
                { verbo: "Disfrutás", t: "Tu estadía", d: "Check-in en recepción, califica al final y guarda tus favoritos." },
              ].map((p, i) => (
                <li
                  key={p.verbo}
                  className={`border-t border-white/15 pt-4 ${i % 2 === 1 ? "lg:ml-16" : ""}`}
                >
                  <h3 className="flex flex-wrap items-baseline gap-x-3 font-display text-xl font-bold text-white">
                    {p.verbo}
                    <span className="text-sm font-semibold tracking-wide text-accent-light">{p.t}</span>
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-teal-200/75">{p.d}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ============ TESTIMONIOS DE VIAJEROS ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal>
          <TituloSeccion ceja="Voces viajeras" titulo="Lo que dicen quienes ya reservaron" />
        </Reveal>
        {/* Retícula rota a propósito: una cita ancha manda y las otras dos
            van debajo, en vez de tres testimonios idénticos en fila */}
        {citaDestacada && (
          <Reveal>
            <figure className="mt-10 flex flex-col gap-6 rounded-xl border border-line bg-white p-7 shadow-card sm:p-9 lg:flex-row lg:items-center lg:gap-10">
              <span className="shrink-0 text-accent"><IconoComillas size={38} /></span>
              <div className="flex-1">
                <blockquote className="font-display text-xl leading-snug text-ink sm:text-2xl">
                  “{citaDestacada.comentario}”
                </blockquote>
                <figcaption className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {citaDestacada.autor.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                  </span>
                  <span className="text-sm font-bold text-ink">{citaDestacada.autor}</span>
                  <span className="text-xs text-muted">
                    {citaDestacada.origen} · se hospedó en {hoteles.find((h) => h.id === citaDestacada.hotelId)?.nombre}
                  </span>
                  <Estrellas valor={citaDestacada.rating} size={14} />
                </figcaption>
              </div>
            </figure>
          </Reveal>
        )}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {otrasResenas.map((r, i) => {
            const hotel = hoteles.find((h) => h.id === r.hotelId);
            return (
              <Reveal key={r.id} delay={(i + 1) * 110}>
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

      {/* ============ INSCRIPCIÓN DE HOTELES (HU-021) ============
          El formulario vive en una ventana flotante abierta desde la tarjeta
          de hoteleros; ya no ocupa el pie de la portada (HU-038). */}
      <Modal abierto={inscripcionAbierta} alCerrar={() => setInscripcionAbierta(false)} ancho="max-w-3xl">
        <InscribeHotel enVentana />
      </Modal>
    </main>
  );
}


