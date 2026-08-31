// Diccionario de traducciones ES/EN para Hotelica
export type Idioma = "es" | "en";

export const traducciones = {
  es: {
    // Header
    inicio: "Inicio",
    explorar: "Explorar hoteles",
    reservas: "Mis reservas",
    favoritos: "Favoritos",
    panelHotel: "Panel del hotel",
    consolaAdmin: "Consola admin",
    iniciarSesion: "Iniciar sesión",
    cerrarSesion: "Cerrar sesión",
    hola: "Hola",
    // Home
    heroTitulo: "Encuentra tu próximo destino en",
    heroSubtitulo: "Reserva hoteles pequeños y familiares de forma sencilla: patios coloniales, playas del Pacífico, montañas cafetaleras y el azul del Caribe.",
    heroDestinos: "hoteles familiares",
    heroMunicipios: "municipios",
    heroResenas: "reseñas de viajeros",
    buscadorTitulo: "¿A dónde viajas?",
    buscadorSubtitulo: "Busca por departamento, fechas y número de huéspedes",
    buscarBtn: "Buscar hoteles",
    verTodos: "Ver todos los hoteles →",
    // Login
    loginTitulo: "Iniciar sesión",
    loginCorreo: "Correo electrónico",
    loginContrasena: "Contraseña",
    loginBtn: "Iniciar sesión",
    loginError: "Ingresa tu correo y contraseña para continuar.",
    loginRedes: "O continúa con",
    loginGoogle: "Google",
    loginFacebook: "Facebook",
    loginApple: "Apple",
  },
  en: {
    // Header
    inicio: "Home",
    explorar: "Search hotels",
    reservas: "My Reservations",
    favoritos: "Favorites",
    panelHotel: "Hotel Panel",
    consolaAdmin: "Admin Console",
    iniciarSesion: "Log in",
    cerrarSesion: "Log out",
    hola: "Hello",
    // Home
    heroTitulo: "Find your next destination in",
    heroSubtitulo: "Book small, family-run hotels easily: colonial courtyards, Pacific beaches, coffee mountains and the blue Caribbean.",
    heroDestinos: "family hotels",
    heroMunicipios: "municipalities",
    heroResenas: "traveler reviews",
    buscadorTitulo: "Where are you going?",
    buscadorSubtitulo: "Search by department, dates and number of guests",
    buscarBtn: "Search hotels",
    verTodos: "See all hotels →",
    // Login
    loginTitulo: "Log in",
    loginCorreo: "Email",
    loginContrasena: "Password",
    loginBtn: "Log in",
    loginError: "Enter your email and password to continue.",
    loginRedes: "Or continue with",
    loginGoogle: "Google",
    loginFacebook: "Facebook",
    loginApple: "Apple",
  },
} as const;

// Devuelve una cadena traducida según el idioma activo
export function t(idioma: Idioma, clave: keyof typeof traducciones["es"]): string {
  return traducciones[idioma][clave];
}
