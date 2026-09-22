// ============================================================
// Hotelica — Edge Function: enviar correo de confirmación de reserva
// Usa la API de Brevo para enviar correos transaccionales
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
// Correo que verificaste como remitente en Brevo
const REMITENTE_CORREO = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

    // Obtener y validar datos del cuerpo
    const body = await req.json();
    const { folio, hotelNombre, turista, correo, llegada, salida, noches, huespedes, total } = body;

    // Validar datos requeridos
    if (!folio || !hotelNombre || !turista || !correo || !llegada || !salida || !total) {
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

    // En Fase 1 las reservas viven en el navegador, así que solo
    // checamos duplicados si la reserva sí está en la base de datos
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: reservaEnBD } = await supabase
        .from("reservas")
        .select("correo_enviado")
        .eq("folio", folio)
        .maybeSingle();

      if (reservaEnBD?.correo_enviado) {
        return new Response(
          JSON.stringify({ message: "El correo ya fue enviado anteriormente", duplicado: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Formatear fechas para el correo
    const llegadaFormateada = new Date(llegada + "T12:00:00").toLocaleDateString("es-NI", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    const salidaFormateada = new Date(salida + "T12:00:00").toLocaleDateString("es-NI", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    // HTML del correo de confirmación
    const htmlCorreo = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Outfit', sans-serif; background-color: #F8F6F0; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0B3540, #07242C); padding: 30px; text-align: center; }
          .logo { font-family: 'Libre Baskerville', serif; font-size: 28px; font-weight: 700; color: #F8F6F0; margin: 0; }
          .tagline { color: #177E8C; font-size: 14px; margin-top: 5px; }
          .content { padding: 30px; }
          .folio { background: #FEF3C7; border: 2px dashed #F7A81B; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .folio-numero { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800; color: #92400E; }
          .datos { background: #F8F6F0; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .dato { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E4DFD2; }
          .dato:last-child { border-bottom: none; }
          .dato-label { color: #5D6E73; font-size: 14px; }
          .dato-valor { font-weight: 600; color: #1C2B30; font-size: 14px; }
          .total { background: #0B3540; color: white; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .total-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8FD3DE; }
          .total-monto { font-family: 'Fraunces', serif; font-size: 36px; font-weight: 800; color: #F7A81B; }
          .footer { text-align: center; padding: 20px; color: #5D6E73; font-size: 12px; }
          .boton { display: inline-block; background: #F7A81B; color: #0B3540; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">HOTELICA</h1>
            <p class="tagline">Tu destino en Nicaragua 🇳🇮</p>
          </div>
          
          <div class="content">
            <h2 style="color: #0B3540; margin-top: 0;">¡Reserva confirmada!</h2>
            <p style="color: #5D6E73;">Hola <strong>${turista}</strong>, tu reserva fue registrada exitosamente.</p>
            
            <div class="folio">
              <p style="margin: 0; color: #92400E; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Tu folio</p>
              <p class="folio-numero">${folio}</p>
              <p style="margin: 0; color: #92400E; font-size: 12px;">Guárdalo para el check-in</p>
            </div>
            
            <div class="datos">
              <div class="dato">
                <span class="dato-label">Hotel</span>
                <span class="dato-valor">${hotelNombre}</span>
              </div>
              <div class="dato">
                <span class="dato-label">Llegada</span>
                <span class="dato-valor">${llegadaFormateada}</span>
              </div>
              <div class="dato">
                <span class="dato-label">Salida</span>
                <span class="dato-valor">${salidaFormateada}</span>
              </div>
              <div class="dato">
                <span class="dato-label">Noches</span>
                <span class="dato-valor">${noches}</span>
              </div>
              <div class="dato">
                <span class="dato-label">Huéspedes</span>
                <span class="dato-valor">${huespedes}</span>
              </div>
            </div>
            
            <div class="total">
              <p class="total-label">Total a pagar</p>
              <p class="total-monto">C$ ${total.toLocaleString("ni-NI", { minimumFractionDigits: 2 })}</p>
            </div>
            
            <p style="color: #5D6E73; font-size: 14px; text-align: center;">
              Presenta tu folio en recepción para el check-in.
            </p>
          </div>
          
          <div class="footer">
            <p>Hotelica — Plataforma turística de Nicaragua</p>
            <p>Este es un correo automático, no respondas a este mensaje.</p>
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
        to: [{ email: correo, name: turista }],
        subject: `Reserva ${folio} — Hotelica`,
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

    // Marcar correo como enviado (si la reserva y la columna existen)
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error } = await supabase
        .from("reservas")
        .update({ correo_enviado: true })
        .eq("folio", folio);

      if (error) {
        console.log("No se pudo marcar correo_enviado:", error.message);
      }
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
