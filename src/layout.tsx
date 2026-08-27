// ============================================================
// Hotelica — Estructura común: Navbar, Footer y avisos (toasts)
// ============================================================
import { useEffect, useState } from "react";
import { useApp } from "./store";
import type { Ruta, Navegar } from "./rutas";
import { DEPARTAMENTOS, USUARIOS_DEMO } from "./data";
import type { Rol } from "./data";
import {
  LogoMark, BanderaNI, IconoCorazon, IconoChevronAbajo, IconoMenu, IconoX,
  IconoEscudo, IconoHotel, IconoHuespedes, IconoCheck, IconoReiniciar,
} from "./icons";
import { IconoBuscar } from "./icons";
import { Marca } from "./ui";

// ----- Barra de navegación principal -----
export function Navbar({ ruta, navegar }: { ruta: Ruta; navegar: Navegar }) {
  const { favoritos, rol, cambiarRol, avisar, reiniciarDemo } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuRol, setMenuRol] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);

  // La barra se vuelve sólida cuando el visitante baja por la página
  useEffect(() => {
    const alBajar = () => setScrolled(window.scrollY > 50);
    alBajar();
    window.addEventListener("scroll", alBajar, { passive: true });
    return () => window.removeEventListener("scroll", alBajar);
  }, []);

  // Sobre el hero del inicio la barra es transparente con letras claras
  const clara = ruta.nombre === "inicio" && !scrolled && !menuMovil;
  const usuario = USUARIOS_DEMO[rol];

  // Cambia el rol de demostración y lleva a la pantalla que le corresponde
  const elegirRol = (r: Rol) => {
    cambiarRol(r);
    setMenuRol(false);
    if (r === "hotel") navegar({ nombre: "panel" });
    else if (r === "admin") navegar({ nombre: "admin" });
    avisar(`Sesión demo iniciada como ${USUARIOS_DEMO[r].etiqueta}`, "info");
  };

  // Enlace de navegación con estado activo
  const Enlace = ({ a, texto, activo }: { a: Ruta; texto: string; activo?: boolean }) => (
    <button
      onClick={() => { navegar(a); setMenuMovil(false); }}
      className={`nav-link text-sm font-medium transition-colors ${activo ? "active" : ""} ${clara ? "text-white" : "text-ink hover:text-primary"}`}
    >
      {texto}
    </button>
  );

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${clara ? "bg-transparent" : "bg-white/95 shadow-[0_2px_20px_rgba(15,23,42,0.07)] backdrop-blur"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Marca */}
        <button onClick={() => navegar({ nombre: "inicio" })} className="flex items-center gap-2.5" aria-label="Ir al inicio">
          <LogoMark size={34} />
          {/* Bloque de marca unificado (Libre Baskerville + frase) */}
          <Marca oscura={clara} />
        </button>

        {/* Navegación de escritorio */}
        <nav className="ml-6 hidden items-center gap-6 lg:flex">
          <Enlace a={{ nombre: "inicio" }} texto="Inicio" activo={ruta.nombre === "inicio"} />
          <Enlace a={{ nombre: "resultados" }} texto="Explorar hoteles" activo={ruta.nombre === "resultados" || ruta.nombre === "hotel"} />
          <Enlace a={{ nombre: "reservas" }} texto="Mis reservas" activo={ruta.nombre === "reservas"} />
          <button
            onClick={() => navegar({ nombre: "favoritos" })}
            className={`nav-link flex items-center gap-1.5 text-sm font-medium transition-colors ${ruta.nombre === "favoritos" ? "active" : ""} ${clara ? "text-white" : "text-ink hover:text-primary"}`}
          >
            Favoritos
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
              {favoritos.length}
            </span>
          </button>
          {rol === "hotel" && <Enlace a={{ nombre: "panel" }} texto="Panel del hotel" activo={ruta.nombre === "panel"} />}
          {rol === "admin" && <Enlace a={{ nombre: "admin" }} texto="Consola admin" activo={ruta.nombre === "admin"} />}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Selector de rol de demostración */}
          <div className="relative">
            <button
              onClick={() => setMenuRol((v) => !v)}
              className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-sm font-semibold transition-all ${
                clara
                  ? "border-white/35 bg-white/10 text-white hover:bg-white/20"
                  : "border-line bg-white text-ink hover:border-primary/40 hover:shadow-sm"
              }`}
              aria-haspopup="menu"
              aria-expanded={menuRol}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                rol === "turista" ? "bg-primary text-white" : rol === "hotel" ? "bg-hotel text-white" : "bg-admin text-white"
              }`}>
                {usuario.nombre.charAt(0)}
              </span>
              <span className="hidden sm:block">{usuario.etiqueta}</span>
              <IconoChevronAbajo size={14} className={`transition-transform ${menuRol ? "rotate-180" : ""}`} />
            </button>

            {menuRol && (
              <>
                <button className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuRol(false)} aria-label="Cerrar menú" />
                <div className="anim-pop absolute right-0 z-20 mt-2 w-72 rounded-xl border border-line bg-white p-2 shadow-lift">
                  {/* Marca presente en el acceso de sesión de demostración */}
                  <div className="mb-1.5 flex justify-center border-b border-line px-3 pb-3 pt-3.5">
                    <Marca tam="chica" centrada />
                  </div>
                  <p className="px-3 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-muted">Modo de demostración</p>
                  {(Object.keys(USUARIOS_DEMO) as Rol[]).map((r) => {
                    const u = USUARIOS_DEMO[r];
                    const Icono = r === "turista" ? IconoHuespedes : r === "hotel" ? IconoHotel : IconoEscudo;
                    return (
                      <button
                        key={r}
                        onClick={() => elegirRol(r)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-canvas ${rol === r ? "bg-primary-soft" : ""}`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          r === "turista" ? "bg-primary-light text-primary" : r === "hotel" ? "bg-hotel-soft text-hotel" : "bg-admin-soft text-admin"
                        }`}>
                          <Icono size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                            {u.etiqueta}
                            {rol === r && <IconoCheck size={13} className="text-primary" />}
                          </span>
                          <span className="block truncate text-xs text-muted">{u.nombre} · {u.detalle}</span>
                        </span>
                      </button>
                    );
                  })}
                  <div className="mt-1.5 border-t border-line pt-1.5">
                    <button
                      onClick={() => { reiniciarDemo(); setMenuRol(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted transition-colors hover:bg-canvas hover:text-danger"
                    >
                      <IconoReiniciar size={14} /> Restaurar datos de demostración
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Botón hamburguesa (móvil) */}
          <button
            onClick={() => setMenuMovil((v) => !v)}
            className={`rounded-lg p-2 lg:hidden ${clara ? "text-white" : "text-ink"}`}
            aria-label="Abrir menú"
          >
            {menuMovil ? <IconoX size={22} /> : <IconoMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuMovil && (
        <nav className="anim-pop border-t border-line bg-white px-4 py-4 shadow-lift lg:hidden">
          <div className="grid gap-1">
            {([
              ["inicio", "Inicio"],
              ["resultados", "Explorar hoteles"],
              ["reservas", "Mis reservas"],
              ["favoritos", `Favoritos (${favoritos.length})`],
            ] as [Ruta["nombre"], string][]).map(([n, t]) => (
              <button
                key={n}
                onClick={() => { navegar({ nombre: n } as Ruta); setMenuMovil(false); }}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${ruta.nombre === n ? "bg-primary-soft text-primary" : "text-ink hover:bg-canvas"}`}
              >
                {t}
              </button>
            ))}
            {rol !== "turista" && (
              <button
                onClick={() => { navegar({ nombre: rol === "hotel" ? "panel" : "admin" }); setMenuMovil(false); }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-primary hover:bg-primary-soft"
              >
                {rol === "hotel" ? "Panel del hotel" : "Consola admin"}
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

// ----- Avisos flotantes (feedback de cada acción) -----
export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(92vw,360px)] flex-col gap-2.5">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`anim-toast pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lift ${
            t.tono === "ok"
              ? "border-[#86EFAC] bg-[#F0FDF4] text-[#166534]"
              : t.tono === "error"
              ? "border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]"
              : "border-[#99F6E4] bg-primary-soft text-primary-dark"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.tono === "ok" ? <IconoCheck size={16} /> : t.tono === "error" ? <IconoX size={16} /> : <IconoBuscar size={16} />}
          </span>
          <p className="text-sm font-semibold leading-snug">{t.texto}</p>
        </div>
      ))}
    </div>
  );
}

// ----- Pie de página -----
export function Footer({ navegar }: { navegar: Navegar }) {
  const { reiniciarDemo } = useApp();
  return (
    <footer className="relative mt-20 overflow-hidden bg-primary-ink text-teal-100">
      {/* Franja decorativa superior con olas */}
      <svg className="absolute inset-x-0 top-0 h-8 w-full text-primary-deep" viewBox="0 0 1440 32" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0h1440v10c-120 14-240 22-360 14S840 4 720 8 480 26 360 26 120 14 0 22V0Z" fill="currentColor" />
      </svg>
      <div className="dot-texture-light pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-16 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark size={38} />
            <Marca tam="grande" oscura />
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-teal-200/90">
            <BanderaNI size={15} /> Donde Nicaragua te recibe
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-teal-200/70">
            Reserva hoteles pequeños y familiares: del patio colonial de Granada a la arena blanca de Corn Island.
          </p>
          <button
            onClick={reiniciarDemo}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-teal-700/60 px-3.5 py-2 text-xs font-semibold text-teal-200 transition-colors hover:border-accent hover:text-accent"
          >
            <IconoReiniciar size={13} /> Restaurar datos de demostración
          </button>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">Destinos</h4>
          <ul className="mt-4 grid gap-2 text-sm">
            {DEPARTAMENTOS.slice(0, 6).map((d) => (
              <li key={d.id}>
                <button onClick={() => navegar({ nombre: "resultados", depto: d.id })} className="text-teal-200/80 transition-colors hover:text-accent">
                  {d.nombre}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">Explora</h4>
          <ul className="mt-4 grid gap-2 text-sm">
            <li><button onClick={() => navegar({ nombre: "resultados" })} className="text-teal-200/80 transition-colors hover:text-accent">Todos los hoteles</button></li>
            <li><button onClick={() => navegar({ nombre: "reservas" })} className="text-teal-200/80 transition-colors hover:text-accent">Mis reservas</button></li>
            <li><button onClick={() => navegar({ nombre: "favoritos" })} className="text-teal-200/80 transition-colors hover:text-accent">Mis favoritos</button></li>
            <li><button onClick={() => navegar({ nombre: "inicio" })} className="text-teal-200/80 transition-colors hover:text-accent">Cómo funciona</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">Proyecto académico</h4>
          <ul className="mt-4 grid gap-2 text-sm text-teal-200/70">
            <li>Ingeniería de Software · Fase 1</li>
            <li>Maqueta funcional (datos simulados)</li>
            <li>10 historias de usuario implementadas</li>
            <li className="flex items-center gap-1.5 pt-1 text-teal-200/90">
              <IconoCorazon size={13} lleno className="text-accent" /> Hecho en Nicaragua
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-teal-800/60 py-4">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-teal-300/60 sm:px-6">
          © 2026 Hotelica — Reservación hotelera de Nicaragua · Cálculos: noches × precio + IVA 15%
        </p>
      </div>
    </footer>
  );
}
