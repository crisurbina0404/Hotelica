// ============================================================
// Hotelica — Punto de entrada de la maqueta (Fase 1)
// Enrutamiento por estado: cada pantalla = una historia de usuario
// ============================================================
import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./store";
import type { Ruta } from "./rutas";
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

// Rutas protegidas: requieren usuario autenticado
const RUTAS_PROTEGIDAS: Ruta["nombre"][] = ["reservas", "perfil", "panel", "admin"];

function AppInner() {
  const { usuario } = useApp();
  // La pantalla actual se guarda en el estado (sin URL, es una maqueta)
  const [ruta, setRuta] = useState<Ruta>({ nombre: "inicio" });

  // Detectar si Supabase redirigió con token de recuperación de contraseña
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token") && hash.includes("type=recovery")) {
      // Limpiar el hash de la URL y navegar a restablecer contraseña
      window.history.replaceState(null, "", window.location.pathname);
      setRuta({ nombre: "restablecer" });
    }
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
    // Protección de rutas: si no hay usuario y la ruta es protegida, redirigir a inicio
    if (!usuario && RUTAS_PROTEGIDAS.includes(r.nombre)) {
      setRuta({ nombre: "inicio" });
      return;
    }
    setRuta(r);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  // Renderiza la pantalla que corresponde a la ruta actual
  const pantalla = () => {
    switch (ruta.nombre) {
      case "inicio": return <Inicio navegar={navegar} />;
      case "resultados": return <Resultados ruta={ruta} navegar={navegar} />;
      case "hotel": return <DetalleHotel id={ruta.id} navegar={navegar} />;
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
          <Marca tam="enorme" centrada />
        </div>
      )}

      {/* Capa ambiental de fondo con los tintes del proyecto */}
      <div className="ambient-bg min-h-screen">
        <Navbar ruta={ruta} navegar={navegar} />
        {pantalla()}
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
