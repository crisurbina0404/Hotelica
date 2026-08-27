// ============================================================
// Hotelica — Punto de entrada de la maqueta (Fase 1)
// Enrutamiento por estado: cada pantalla = una historia de usuario
// ============================================================
import { useEffect, useState } from "react";
import { AppProvider } from "./store";
import type { Ruta } from "./rutas";
import { Navbar, Footer, Toasts } from "./layout";
import { Marca } from "./ui";
import { LogoMark } from "./icons";
import { Inicio } from "./pages/Home";
import { Resultados } from "./pages/Results";
import { DetalleHotel } from "./pages/HotelDetail";
import { MisReservas, Favoritos } from "./pages/MyReservations";
import { PanelHotel } from "./pages/HotelPanel";
import { PanelAdmin } from "./pages/AdminPanel";

function App() {
  // La pantalla actual se guarda en el estado (sin URL, es una maqueta)
  const [ruta, setRuta] = useState<Ruta>({ nombre: "inicio" });

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

  // Renderiza la pantalla que corresponde a la ruta actual
  const pantalla = () => {
    switch (ruta.nombre) {
      case "inicio": return <Inicio navegar={navegar} />;
      case "resultados": return <Resultados ruta={ruta} navegar={navegar} />;
      case "hotel": return <DetalleHotel id={ruta.id} navegar={navegar} />;
      case "reservas": return <MisReservas navegar={navegar} />;
      case "favoritos": return <Favoritos navegar={navegar} />;
      case "panel": return <PanelHotel />;
      case "admin": return <PanelAdmin navegar={navegar} />;
    }
  };

  return (
    <AppProvider>
      {/* Splash de marca al abrir la maqueta */}
      {splash && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-canvas transition-opacity duration-500 ${
            splashVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <LogoMark size={76} />
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
    </AppProvider>
  );
}

export default App;
