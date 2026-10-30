// ============================================================
// Hotelica — Edge Function: correo de rechazo al dueño del hotel
// Usa la API de Brevo para enviar correos transaccionales
// Se llama cuando el admin rechaza una inscripción de hotel (HU-032)
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// El logo vive en el repositorio porque los clientes de correo no muestran
// imágenes embebidas en data URI
const LOGO_URL = "https://raw.githubusercontent.com/crisurbina0404/Hotelica/main/public/logo-email.png";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const REMITENTE_CORREO = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Vacía los caracteres peligrosos para que un nombre o motivo malvado
// no pueda meter HTML ni código dentro del correo
function escaparHtml(texto: string): string {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

serve(async (req) => {
  // Manejar preflight de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Solo aceptar POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método no permitido" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obtener y validar datos del cuerpo; llegan limpios para el HTML
    const body = await req.json();
    const { correo, hotelNombre } = body;
    const dueno = escaparHtml(String(body.dueno ?? "").trim());
    const motivo = escaparHtml(String(body.motivo ?? "").trim());

    // Validar datos requeridos: sin motivo no se manda el correo (HU-032)
    if (!dueno || !correo || !hotelNombre || !motivo) {
      return new Response(
        JSON.stringify({ error: "Faltan datos requeridos para enviar el correo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar que la API key y el remitente estén configurados
    if (!BREVO_API_KEY || !REMITENTE_CORREO) {
      return new Response(
        JSON.stringify({ error: "Falta configurar BREVO_API_KEY o BREVO_SENDER_EMAIL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return new Response(
        JSON.stringify({ error: "Formato de correo electrónico inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // HTML del correo con el motivo del rechazo
    const htmlCorreo = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu hotel no fue aprobado — Hotelica</title>
        <style>
          body { margin: 0; padding: 20px 12px; background-color: #F8F6F0; font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; color: #1C2B30; }
          .envoltura { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 18px rgba(11, 53, 64, 0.14); }

          .cabecera { background: linear-gradient(135deg, #0B3540, #07242C); padding: 30px 24px 24px; text-align: center; border-bottom: 3px solid #F7A81B; }
          .logo { display: block; width: 220px; height: auto; margin: 0 auto; border: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 30px; font-weight: 700; letter-spacing: 4px; color: #F8F6F0; }
          .lema { margin: 16px 0 0; font-size: 13px; letter-spacing: 2px; color: #8FD3DE; text-transform: uppercase; }
          .guion { color: #E0A83C; }

          .contenido { padding: 30px 28px 26px; }
          .ceja { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #177E8C; }
          .titulo { margin: 8px 0 8px; font-family: 'Fraunces', Georgia, serif; font-size: 27px; font-weight: 700; color: #0B3540; }
          .saludo { margin: 12px 0 0; font-size: 15px; line-height: 1.65; color: #5D6E73; }

          .bloque { margin: 22px 0 0; padding: 6px 20px 14px; background: #F8F6F0; border: 1px solid #E4DFD2; border-radius: 12px; }
          .bloque-titulo { margin: 16px 0 2px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #0B3540; }
          .datos { width: 100%; border-collapse: collapse; }
          .datos td { padding: 11px 2px; font-size: 14px; border-bottom: 1px solid #E4DFD2; }
          .datos tr:last-child td { border-bottom: none; }
          .etiqueta { color: #5D6E73; font-weight: 500; }
          .valor { text-align: right; font-weight: 700; color: #1C2B30; }

          /* Bloque del motivo: mismo estilo marcado de las credenciales, en rojo suave */
          .motivo { margin: 24px 0 0; padding: 22px 20px; background: #FDECEC; border: 2px dashed #C0392B; border-radius: 12px; }
          .motivo-titulo { margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #B91C1C; }
          .motivo-nota { margin: 0 0 14px; font-size: 13px; color: #5D6E73; }
          .motivo-texto { margin: 0; font-size: 15px; line-height: 1.6; font-weight: 700; color: #7F1D1D; }

          .nota { margin: 22px 0 0; padding: 14px 16px; font-size: 13px; line-height: 1.65; color: #5D6E73; background: #EFF5F6; border-left: 3px solid #177E8C; border-radius: 8px; }

          .pie { padding: 24px; text-align: center; background: #07242C; }
          .pie-marca { margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 15px; font-weight: 700; letter-spacing: 4px; color: #F8F6F0; }
          .pie-texto { margin: 10px 0 0; font-size: 12px; line-height: 1.7; color: #8FD3DE; }
          .enlace { color: #177E8C; font-weight: 700; text-decoration: underline; }

          /* Celular: las filas se apilan (etiqueta arriba, valor abajo) para que no se aplasten */
          @media only screen and (max-width: 480px) {
            body { padding: 10px 6px; }
            .envoltura { border-radius: 12px; }
            .cabecera { padding: 22px 12px 16px; }
            .logo { width: 165px; height: auto; }
            .lema { font-size: 11px; letter-spacing: 1.5px; }
            .contenido { padding: 20px 16px 18px; }
            .titulo { font-size: 23px; }
            .saludo { font-size: 14px; }
            .motivo { padding: 16px 14px; }
            .bloque { padding: 6px 14px 12px; }
            .datos td {
              display: block;
              width: 100%;
              text-align: left !important;
              border-bottom: none !important;
              padding: 3px 0;
              word-break: break-word;
            }
            .datos tr {
              display: block;
              padding: 9px 0;
              border-bottom: 1px solid #E4DFD2;
            }
            .datos tr:last-child { border-bottom: none; }
            .etiqueta {
              font-size: 10px;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              padding-bottom: 1px;
            }
            .valor { font-size: 15px; padding-top: 1px; }
            .pie { padding: 18px 14px; }
          }
        </style>
      </head>
      <body>
        <div class="envoltura">
          <div class="cabecera">
            <img class="logo" src="${LOGO_URL}" width="220" height="75" alt="HOTELICA">
            <p class="lema"><span class="guion">—</span>&nbsp;&nbsp;Tu destino en Nicaragua&nbsp;&nbsp;<span class="guion">—</span></p>
          </div>

          <div class="contenido">
            <p class="ceja">Inscripción de hotel</p>
            <h1 class="titulo">Tu hotel no fue aprobado</h1>
            <p class="saludo">Hola <strong>${dueno}</strong>, revisamos la solicitud de <strong>${escaparHtml(hotelNombre)}</strong> y lamentamos informarte que no fue aprobada por ahora. A continuación te contamos el motivo de la decisión.</p>

            <div class="motivo">
              <p class="motivo-titulo">Motivo del rechazo</p>
              <p class="motivo-nota">Nuestro equipo escribió lo siguiente al revisar tu solicitud:</p>
              <p class="motivo-texto">${motivo}</p>
            </div>

            <div class="bloque">
              <p class="bloque-titulo">Qué podés hacer</p>
              <table class="datos" role="presentation">
                <tr>
                  <td class="etiqueta" align="left">1. Corregí los datos</td>
                  <td class="valor" align="right">Completá lo que falta</td>
                </tr>
                <tr>
                  <td class="etiqueta" align="left">2. Volvé a inscribirte</td>
                  <td class="valor" align="right"><a class="enlace" href="https://hotelica.vercel.app">hotelica.vercel.app</a></td>
                </tr>
                <tr>
                  <td class="etiqueta" align="left">3. Esperá la revisión</td>
                  <td class="valor" align="right">La revisamos de nuevo</td>
                </tr>
              </table>
            </div>

            <p class="nota">Tu solicitud no se borra: podés volver a enviarla cuando corrijas los datos del motivo. Si tenés alguna duda sobre esta decisión, contáctanos respondiendo a este correo.</p>
          </div>

          <div class="pie">
            <p class="pie-marca">HOTELICA</p>
            <p class="pie-texto">
              Plataforma turística de Nicaragua · Donde Nicaragua te recibe<br>
              Este es un correo automático, no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar correo con la API de Brevo
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: REMITENTE_CORREO, name: "Hotelica" },
        to: [{ email: correo, name: body.dueno }],
        subject: `Tu hotel ${hotelNombre} no fue aprobado — Hotelica`,
        htmlContent: htmlCorreo,
      }),
    });

    const data = await res.json();

    // Verificar si Brevo respondió correctamente
    if (!res.ok) {
      console.error("Error de Brevo:", data);
      return new Response(
        JSON.stringify({ error: "Error al enviar el correo", detalles: data }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Correo enviado exitosamente", id: data.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error general:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
