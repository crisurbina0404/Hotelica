// ============================================================
// Hotelica — Punto de entrada de la maqueta (Fase 1)
// Enrutamiento por estado: cada pantalla = una historia de usuario
// ============================================================
import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./store";
import { supabase } from "./lib/supabase";
import type { Ruta } from "./rutas";
import type { Rol } from "./data";
import { Navbar, Footer, Toasts } from "./layout";
import { Marca } from "./ui";
import { Inicio } from "./pages/Home";
import { Resultados } from "./pages/Results";
import { DetalleHotel } from "./pages/HotelDetail";
import { Destinos } from "./pages/Destinos";
import { MisReservas, Favoritos } from "./pages/MyReservations";
import { PanelHotel } from "./pages/HotelPanel";
import { PanelAdmin } from "./pages/AdminPanel";
import { Perfil } from "./pages/Profile";
import { RecuperarContrasena } from "./pages/ForgotPassword";
import { RestablecerContrasena } from "./pages/ResetPassword";

// Rutas protegidas: piden permiso antes de mostrarse
const RUTAS_PROTEGIDAS: Ruta["nombre"][] = ["reservas", "perfil", "panel", "admin"];

// La maqueta en celular solo ofrece el módulo turista (HU-039)
const CONSULTA_MOVIL = "(max-width: 1023px)";

function usePantallaMovil(): boolean {
  const [movil, setMovil] = useState(() => window.matchMedia(CONSULTA_MOVIL).matches);
  useEffect(() => {
    const mq = window.matchMedia(CONSULTA_MOVIL);
    const alCambiar = (e: MediaQueryListEvent) => setMovil(e.matches);
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);
  return movil;
}

// ¿Puede verse esta pantalla? Con sesión siempre; sin sesión, el panel del hotel y la
// consola de admin también se abren con el rol de demo que elige el selector
function puedeVer(nombre: Ruta["nombre"], haySesion: boolean, rolActual: Rol): boolean {
  if (haySesion) return true;
  if (nombre === "panel") return rolActual === "hotel";
  if (nombre === "admin") return rolActual === "admin";
  return !RUTAS_PROTEGIDAS.includes(nombre); // reservas y perfil sí piden sesión
}

function AppInner() {
  const { usuario, rol } = useApp();
  // La pantalla actual se guarda en el estado (sin URL, es una maqueta)
  const [ruta, setRuta] = useState<Ruta>({ nombre: "inicio" });
  const movil = usePantallaMovil();

  // En celular la única experiencia es la del turista: el panel del hotel y la
  // consola del admin no se abren aunque el demo haya quedado en ese rol.
  const rolVisible: Rol = movil ? "turista" : rol;
  const rutaSoloTurista = movil && (ruta.nombre === "panel" || ruta.nombre === "admin");

  // Pantalla que de verdad se muestra: si el rol actual no tiene permiso, es el inicio.
  // El chequeo va al renderizar y no en navegar() porque el selector de demo cambia
  // el rol y la ruta en el mismo clic, y el rol todavía no se había actualizado
  const rutaVisible: Ruta =
    !rutaSoloTurista && puedeVer(ruta.nombre, !!usuario, rolVisible) ? ruta : { nombre: "inicio" };

  // Dejamos la ruta válida en memoria: al cerrar sesión o cambiar de rol volvemos al inicio
  useEffect(() => {
    if (rutaVisible.nombre === ruta.nombre) return;
    setRuta({ nombre: "inicio" });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [rutaVisible.nombre, ruta.nombre]);

  // Detectar si Supabase redirigió con token de recuperación de contraseña
  // Puede llegar en el hash (#access_token=...&type=recovery) o como código PKCE (?code=...)
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const enHash = hash.includes("access_token") && hash.includes("type=recovery");
    const enQuery = params.has("code");
    if (enHash || enQuery) {
      // Limpiar la URL y navegar a restablecer contraseña
      window.history.replaceState(null, "", window.location.pathname);
      setRuta({ nombre: "restablecer" });
    }
  }, []);

  // Supabase avisa con PASSWORD_RECOVERY cuando el enlace del correo es válido
  // (cubre el flujo PKCE, donde el token no queda visible en la URL)
  useEffect(() => {
    const { data: escucha } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY") {
        setRuta({ nombre: "restablecer" });
      }
    });
    return () => escucha.subscription.unsubscribe();
  }, []);

  // Splash de entrada con la marca unificada (se desvanece al cargar)
  const [splash, setSplash] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);
  useEffect(() => {
    const desvanecer = setTimeout(() => setSplashVisible(false), 950);
    const retirar = setTimeout(() => setSplash(false), 1400);
    return () => { clearTimeout(desvanecer); clearTimeout(retirar); };
  }, []);

  // Al navegar, volvemos al inicio de la página
  const navegar = (r: Ruta) => {
    setRuta(r);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  // Renderiza la pantalla que corresponde a la ruta que se puede ver
  const pantalla = (actual: Ruta) => {
    switch (actual.nombre) {
      case "inicio": return <Inicio navegar={navegar} />;
      case "resultados": return <Resultados ruta={actual} navegar={navegar} />;
      case "hotel": return <DetalleHotel id={actual.id} navegar={navegar} />;
      case "destinos": return <Destinos navegar={navegar} />;
      case "reservas": return <MisReservas navegar={navegar} />;
      case "favoritos": return <Favoritos navegar={navegar} />;
      case "perfil": return <Perfil navegar={navegar} />;
      case "recuperar": return <RecuperarContrasena navegar={navegar} />;
      case "restablecer": return <RestablecerContrasena navegar={navegar} />;
      case "panel": return <PanelHotel />;
      case "admin": return <PanelAdmin navegar={navegar} />;
    }
  };

  return (
    <>
      {/* Splash de marca al abrir la maqueta */}
      {splash && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-canvas transition-opacity duration-500 ${
            splashVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {/* El logo tiene márgenes transparentes anclados a la izquierda: lo corremos
              un cuarto de su propio ancho (no en píxeles fijos) para que quede centrado
              también en celular, donde antes se salía de la pantalla */}
          <div className="flex w-full justify-center overflow-hidden px-4">
            <div className="translate-x-[26%]">
              {/* max-w-none: el logo no debe encogerse con el ancho del celular,
                  porque el centrado se calcula sobre su ancho real */}
              <Marca tam="splash" centrada className="max-w-none" />
            </div>
          </div>
        </div>
      )}

      {/* Capa ambiental de fondo con los tintes del proyecto */}
      <div className="ambient-bg min-h-screen">
        <Navbar ruta={rutaVisible} navegar={navegar} />
        {pantalla(rutaVisible)}
        <Footer navegar={navegar} />
        <Toasts />
      </div>
    </>
  );
}

// App wrapper con provider (separa Provider del uso de useApp)
function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;
