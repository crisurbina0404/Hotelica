// ============================================================
// Hotelica — Edge Function: enviar cuenta de hotelero al aprobar
// Usa la API de Brevo para enviar correos transaccionales
// Se llama cuando el admin aprueba una inscripción de hotel (HU-021)
//
// Desde el 2026-10-29 el correo ya no lleva contraseña: nadie debería
// recibir credenciales por correo. La función crea el usuario de
// Supabase Auth y manda un ENLACE de un solo uso para que el dueño
// defina su propia contraseña dentro de Hotelica.
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// El logo vive en el repositorio porque los clientes de correo no muestran
// imágenes embebidas en data URI
const LOGO_URL = "https://raw.githubusercontent.com/crisurbina0404/Hotelica/main/public/logo-email.png";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const REMITENTE_CORREO = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";

// Supabase injecta estas dos en cada Edge Function (rol de servicio)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Adónde regresa el enlace: la propia app, que trae la página para definir contraseña
const ORIGEN_APP = Deno.env.get("ORIGEN_APP") ?? "https://hotelica.vercel.app";

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

    // Solo un administrador con sesión puede pedir este correo:
    // sin esta guardia, cualquier usuario con sesión podría pedir
    // invitaciones para cualquier correo (correo molesto / suplantación)
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "El servidor no tiene permisos de servicio configurados" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    const { data: { user }, error: errorToken } = await supabase.auth.getUser(token);
    if (errorToken || !user) {
      return new Response(
        JSON.stringify({ error: "Necesitas iniciar sesión para pedir este correo" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const correoAdmin = (user.email ?? "").trim().toLowerCase();
    const { data: filaAdmin } = await supabase
      .from("administradores")
      .select("correo")
      .eq("correo", correoAdmin)
      .maybeSingle();
    if (!filaAdmin) {
      return new Response(
        JSON.stringify({ error: "Solo un administrador puede enviar esta invitación" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obtener y validar datos del cuerpo (ya no viaja ninguna contraseña)
    const body = await req.json();
    const { nombre, correo, hotelNombre } = body;

    // Validar datos requeridos
    if (!nombre || !correo || !hotelNombre) {
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

    // 1) El usuario de auth del dueño debe existir para que pueda poner
    //    su contraseña y entrar después. Lo creamos con una contraseña
    //    inventada (nadie la conoce ni la recibe): el dueño la define
    //    ahora mismo con el enlace de un solo uso que va en el correo
    const { error: errorCreando } = await supabase.auth.admin.createUser({
      email: correo.trim().toLowerCase(),
      email_confirm: true,
      password: `H${crypto.randomUUID()}${crypto.randomUUID()}`,
    });

    const mensajeError = String(errorCreando?.message ?? "");
    if (errorCreando && !mensajeError.includes("already registered")) {
      console.error("No se pudo crear el usuario de auth:", errorCreando);
      return new Response(
        JSON.stringify({ error: "No se pudo crear la cuenta de hotelero en la autenticación", detalles: mensajeError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Enlace de un solo uso (tipo recovery): al abrirlo, la app cae
    //    directo en la pantalla "Restablecer contraseña" del sitio
    const { data: enlaceGenerado, error: errorEnlace } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: correo.trim().toLowerCase(),
      options: { redirectTo: ORIGEN_APP },
    });
    const enlaceAcceso = enlaceGenerado?.properties?.link;
    if (errorEnlace || !enlaceAcceso) {
      console.error("No se pudo generar el enlace:", errorEnlace);
      return new Response(
        JSON.stringify({ error: "No se pudo generar el enlace de acceso", detalles: String(errorEnlace?.message ?? "") }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // HTML del correo: el dueño define su contraseña con el botón,
    // y el enlace es de un solo uso
    const htmlCorreo = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu cuenta de hotelero — Hotelica</title>
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

          .acceso { margin: 24px 0 0; padding: 22px 20px; background: #FDF0D7; border: 2px dashed #F7A81B; border-radius: 12px; text-align: center; }
          .acceso-titulo { margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #D98A0B; }
          .acceso-nota { margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #5D6E73; }
          .boton { display: inline-block; padding: 14px 30px; background: #F7A81B; color: #1C2B30; border-radius: 999px; font-size: 15px; font-weight: 800; text-decoration: none; }
          .acceso-alternativo { margin: 14px 0 0; font-size: 12px; line-height: 1.6; color: #92400E; word-break: break-all; }

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
            .acceso { padding: 16px 14px; }
            .boton { display: block; text-align: center; }
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
            <p class="ceja">Cuenta de hotelero</p>
            <h1 class="titulo">¡Tu hotel fue aprobado!</h1>
            <p class="saludo">Hola <strong>${escaparHtml(nombre)}</strong>, nos complace informarte que la solicitud de <strong>${escaparHtml(hotelNombre)}</strong> fue aprobada. Tu hotel ya aparece en las búsquedas de Hotelica. Con el botón de abajo eliges la contraseña de tu cuenta de hotelero.</p>

            <div class="acceso">
              <p class="acceso-titulo">Activa tu cuenta</p>
              <p class="acceso-nota">Pulsa el botón, elige tu contraseña y ya podrás entrar a tu panel con tu correo (${escaparHtml(correo)}) y la contraseña que elijas. El enlace es de un solo uso.</p>
              <a class="boton" href="${escaparHtml(enlaceAcceso)}">Definir mi contraseña</a>
              <p class="acceso-alternativo">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>${escaparHtml(enlaceAcceso)}</p>
            </div>

            <div class="bloque">
              <p class="bloque-titulo">Cómo usar tu cuenta</p>
              <table class="datos" role="presentation">
                <tr>
                  <td class="etiqueta" align="left">1. Define tu contraseña</td>
                  <td class="valor" align="right">Con el botón de arriba</td>
                </tr>
                <tr>
                  <td class="etiqueta" align="left">2. Ingresa a</td>
                  <td class="valor" align="right"><a class="enlace" href="${ORIGEN_APP}">hotelica.vercel.app</a></td>
                </tr>
                <tr>
                  <td class="etiqueta" align="left">3. Entra con</td>
                  <td class="valor" align="right">Tu correo y la contraseña que elegiste</td>
                </tr>
              </table>
            </div>

            <p class="nota">Una vez dentro, podrás consultar y confirmar reservas, registrar check-ins y check-outs, ver reportes de ocupación y mucho más. Si el enlace ya no funciona, responde a este correo para pedir uno nuevo. Por seguridad, nunca te pediremos tu contraseña por correo ni por teléfono.</p>
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
        to: [{ email: correo, name: nombre }],
        subject: `¡Tu hotel ${hotelNombre} fue aprobado! — Hotelica`,
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
