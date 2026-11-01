// ============================================================
// Hotelica — Edge Function: correo de rechazo al dueño del hotel
// Usa la API de Brevo para enviar correos transaccionales
// Se llama cuando el admin rechaza una inscripción de hotel (HU-032)
//
// El HTML sale de la plantilla compartida de _shared/correo.ts.
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { correoRechazo, escaparHtml } from "../_shared/correo.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const REMITENTE_CORREO = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";

// Enlace visible del sitio dentro del correo
const ORIGEN_APP = Deno.env.get("ORIGEN_APP") ?? "https://hotelica.vercel.app";
const ENLACE_VISIBLE = ORIGEN_APP.replace(/^https?:\/\//, "").replace(/\/$/, "");

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // HTML del correo con el motivo del rechazo, desde la plantilla común
    const htmlCorreo = correoRechazo({
      dueno,
      hotel: escaparHtml(hotelNombre),
      motivo,
      enlaceVisible: ENLACE_VISIBLE,
      urlApp: ORIGEN_APP,
    });

    // Versión en texto plano del correo
    const textoPlano = [
      `Revisamos la inscripción de ${hotelNombre} y por ahora no cumple los requisitos para publicarse.`,
      "",
      `Motivo: ${String(body.motivo ?? "").trim()}`,
      "",
      `Podés corregir lo que falta y volver a inscribir el hotel en ${ORIGEN_APP}. Si tenés dudas, respondé a este correo.`,
      "",
      "Hotelica · Donde Nicaragua te recibe",
    ].join("\n");

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
        subject: `Sobre la inscripción de ${hotelNombre} en Hotelica`,
        htmlContent: htmlCorreo,
        textContent: textoPlano,
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
