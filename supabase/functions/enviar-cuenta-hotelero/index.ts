// ============================================================
// Hotelica — Edge Function: enviar cuenta de hotelero al aprobar
// Usa la API de Brevo para enviar correos transaccionales
// Se llama cuando el admin aprueba una inscripción de hotel (HU-021)
//
// Desde el 2026-10-29 el correo ya no lleva contraseña: nadie debería
// recibir credenciales por correo. La función crea el usuario de
// Supabase Auth y manda un ENLACE de un solo uso para que el dueño
// defina su propia contraseña dentro de Hotelica.
//
// El HTML sale de la plantilla compartida de _shared/correo.ts.
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { correoCuentaHotelero, escaparHtml } from "../_shared/correo.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const REMITENTE_CORREO = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";

// Supabase injecta estas dos en cada Edge Function (rol de servicio)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Adónde regresa el enlace: la propia app, que trae la página para definir contraseña
const ORIGEN_APP = Deno.env.get("ORIGEN_APP") ?? "https://hotelica.vercel.app";

// Cómo se muestra el enlace del sitio dentro del correo
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

    // HTML del correo desde la plantilla común: el dueño define su
    // contraseña con el botón y el enlace es de un solo uso
    const htmlCorreo = correoCuentaHotelero({
      nombre: escaparHtml(nombre),
      hotel: escaparHtml(hotelNombre),
      correo: escaparHtml(correo.trim().toLowerCase()),
      enlace: escaparHtml(enlaceAcceso),
      enlaceVisible: ENLACE_VISIBLE,
      urlApp: ORIGEN_APP,
    });

    // Versión en texto plano del correo
    const textoPlano = [
      `Tu hotel ${hotelNombre} ya aparece en Hotelica.`,
      "",
      "Para entrar a tu panel, definí tu contraseña con este enlace de un solo uso:",
      enlaceAcceso,
      "",
      `Correo de acceso: ${correo.trim().toLowerCase()}`,
      `Después ingresá a ${ORIGEN_APP} con ese correo y la contraseña que elegiste.`,
      "",
      "Nunca te vamos a pedir tu contraseña por correo ni por teléfono.",
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
        to: [{ email: correo, name: nombre }],
        subject: `${hotelNombre} ya está en Hotelica · activá tu cuenta`,
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
