// ============================================================
// Hotelica — Optimización de las fotografías del hotel (HU-025)
// Las fotos viajan dentro de los datos del navegador, así que
// hay que bajarles el peso antes de guardarlas: si no, unas
// pocas fotos de celular llenan el almacenamiento y la
// plataforma deja de poder guardar cambios.
// ============================================================

// Ancho máximo al que se reescala una foto subida
const ANCHO_MAXIMO = 1280;

// Calidad del JPEG resultante (0 a 1): 0.72 se ve bien y pesa poco
const CALIDAD = 0.72;

// Lee el archivo, lo reescala en un canvas y devuelve la foto ya optimizada.
// Si algo falla, devuelve el motivo del error en lugar de la foto.
export function optimizarFoto(archivo: File): Promise<{ foto?: string; error?: string }> {
  return new Promise((resolve) => {
    const lector = new FileReader();

    lector.onerror = () => resolve({ error: "No se pudo leer la imagen: probá con otra." });

    lector.onload = () => {
      const original = new Image();

      original.onerror = () => resolve({ error: "El archivo elegido no es una imagen que se pueda leer." });

      original.onload = () => {
        // Conservamos la proporción: nunca agrandamos una foto chica
        const escala = Math.min(1, ANCHO_MAXIMO / original.width);
        const lienzo = document.createElement("canvas");
        lienzo.width = Math.round(original.width * escala);
        lienzo.height = Math.round(original.height * escala);

        const pincel = lienzo.getContext("2d");
        if (!pincel) {
          resolve({ error: "Este navegador no pudo procesar la imagen." });
          return;
        }

        pincel.drawImage(original, 0, 0, lienzo.width, lienzo.height);
        resolve({ foto: lienzo.toDataURL("image/jpeg", CALIDAD) });
      };

      original.src = String(lector.result);
    };

    lector.readAsDataURL(archivo);
  });
}

// Peso aproximado de una foto ya optimizada, para mostrarlo en pantalla.
// Las fotos del catálogo son enlaces (no viajan dentro de los datos), así que no tienen peso que mostrar.
export function pesoDeFoto(foto: string): string {
  if (!foto.startsWith("data:")) return "";
  // En un data URL cada 4 caracteres base64 son 3 bytes de imagen
  const bytes = Math.round(Math.max(0, foto.length - foto.indexOf(",") - 1) * 0.75);
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
