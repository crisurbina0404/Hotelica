// ============================================================
// Hotelica — Edge Function: enviar correo de confirmación de reserva
// Usa la API de Brevo para enviar correos transaccionales
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// El logo vive en el repositorio porque los clientes de correo no muestran
// imágenes embebidas en data URI (por eso salía la imagen rota)
const LOGO_URL = "https://raw.githubusercontent.com/crisurbina0404/Hotelica/main/public/logo-email.png";

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
    const {
      folio, hotelNombre, turista, correo, llegada, salida, noches, huespedes, total,
      // Datos extra del comprobante (Fase 1 llegan desde el navegador)
      habitacion = "", subtotal = null, iva = null, pago = "", estadoPago = "",
      referencia = "", estado = "",
    } = body;

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

    // Dinero en córdobas con el formato del proyecto (C$ 1,234.00)
    const money = (n: unknown) =>
      typeof n === "number" && Number.isFinite(n)
        ? `C$ ${n.toLocaleString("ni-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "";

    // Colores de cada estado (paleta oficial de Hotelica)
    const CHIP_ESTADO: Record<string, string> = {
      pendiente: "#FEF3C7|#92400E",
      confirmada: "#DBEAFE|#1D4ED8",
      checkin: "#D9E9EC|#0B3540",
      completada: "#DCFCE7|#166534",
      cancelada: "#FEE2E2|#B91C1C",
      pagado: "#DCFCE7|#166534",
    };
    const chip = (clave: string, texto: string) => {
      const colores = CHIP_ESTADO[clave] ?? "#EFF5F6|#0B3540";
      const [fondo, tinta] = colores.split("|");
      return `<span style="display:inline-block;padding:4px 13px;border-radius:999px;background:${fondo};color:${tinta};font-size:12px;font-weight:700;letter-spacing:0.5px;">${texto}</span>`;
    };

    // Etiqueta en español de cada estado de la reserva
    const ETIQUETA_ESTADO: Record<string, string> = {
      pendiente: "Pendiente",
      confirmada: "Confirmada",
      checkin: "Check-in",
      completada: "Completada",
      cancelada: "Cancelada",
      pagado: "Pagado",
      reembolsado: "Reembolsado",
    };

    // Filas de la tabla de datos (se pintan con <table> para que el
    // espaciado se respete en cualquier cliente de correo)
    const fila = (etiqueta: string, valor: string) =>
      `<tr>
            <td class="etiqueta" align="left">${etiqueta}</td>
            <td class="valor" align="right">${valor}</td>
          </tr>`;

    // HTML del correo de confirmación (comprobante de reserva)
    const htmlCorreo = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reserva ${folio} — Hotelica</title>
        <style>
          body { margin: 0; padding: 20px 12px; background-color: #F8F6F0; font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; color: #1C2B30; }
          .envoltura { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 18px rgba(11, 53, 64, 0.14); }

          /* Cabecera de marca: logo de Hotelica + lema (HU comprobantes) */
          .cabecera { background: linear-gradient(135deg, #0B3540, #07242C); padding: 30px 24px 24px; text-align: center; border-bottom: 3px solid #F7A81B; }
          .logo { display: block; width: 220px; height: auto; margin: 0 auto; border: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 30px; font-weight: 700; letter-spacing: 4px; color: #F8F6F0; }
          .lema { margin: 16px 0 0; font-size: 13px; letter-spacing: 2px; color: #8FD3DE; text-transform: uppercase; }
          .guion { color: #E0A83C; }

          .contenido { padding: 30px 28px 26px; }
          .ceja { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #177E8C; }
          .titulo { margin: 8px 0 8px; font-family: 'Fraunces', Georgia, serif; font-size: 27px; font-weight: 700; color: #0B3540; }
          .saludo { margin: 12px 0 0; font-size: 15px; line-height: 1.65; color: #5D6E73; }

          .folio { margin: 24px 0 6px; padding: 22px 20px; text-align: center; background: #FDF0D7; border: 2px dashed #F7A81B; border-radius: 12px; }
          .folio-ceja { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #D98A0B; }
          .folio-numero { margin: 8px 0 6px; font-family: 'Fraunces', Georgia, serif; font-size: 36px; font-weight: 800; color: #0B3540; }
          .folio-nota { margin: 0; font-size: 13px; color: #5D6E73; }

          .bloque { margin: 22px 0 0; padding: 6px 20px 14px; background: #F8F6F0; border: 1px solid #E4DFD2; border-radius: 12px; }
          .bloque-titulo { margin: 16px 0 2px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #0B3540; }
          .datos { width: 100%; border-collapse: collapse; }
          .datos td { padding: 11px 2px; font-size: 14px; border-bottom: 1px solid #E4DFD2; }
          .datos tr:last-child td { border-bottom: none; }
          .etiqueta { color: #5D6E73; font-weight: 500; }
          .valor { text-align: right; font-weight: 700; color: #1C2B30; }

          .total { margin: 24px 0 0; padding: 22px 20px; text-align: center; background: #0B3540; border-radius: 12px; }
          .total-etiqueta { margin: 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #8FD3DE; }
          .total-monto { margin: 8px 0 12px; font-family: 'Fraunces', Georgia, serif; font-size: 34px; font-weight: 800; color: #F7A81B; }

          .nota { margin: 22px 0 0; padding: 14px 16px; font-size: 13px; line-height: 1.65; color: #5D6E73; background: #EFF5F6; border-left: 3px solid #177E8C; border-radius: 8px; }

          .pie { padding: 24px; text-align: center; background: #07242C; }
          .pie-marca { margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 15px; font-weight: 700; letter-spacing: 4px; color: #F8F6F0; }
          .pie-texto { margin: 10px 0 0; font-size: 12px; line-height: 1.7; color: #8FD3DE; }
        </style>
      </head>
      <body>
        <div class="envoltura">
          <div class="cabecera">
            <img class="logo" src="${LOGO_URL}" width="220" height="75" alt="HOTELICA">
            <p class="lema"><span class="guion">—</span>&nbsp;&nbsp;Tu destino en Nicaragua&nbsp;&nbsp;<span class="guion">—</span></p>
          </div>

          <div class="contenido">
            <p class="ceja">Comprobante de reserva</p>
            <h1 class="titulo">¡Reserva confirmada!</h1>
            <p class="saludo">Hola <strong>${turista}</strong>, tu reserva fue registrada exitosamente. Guarda este comprobante: el folio es lo que necesitas para el check-in.</p>

            <div class="folio">
              <p class="folio-ceja">Tu folio</p>
              <p class="folio-numero">${folio}</p>
              <p class="folio-nota">Guárdalo para el check-in</p>
            </div>

            <div class="bloque">
              <p class="bloque-titulo">Detalle de la reserva</p>
              <table class="datos" role="presentation">
                ${fila("Hotel", hotelNombre)}
                ${habitacion ? fila("Habitación", habitacion) : ""}
                ${fila("Llegada", llegadaFormateada)}
                ${fila("Salida", salidaFormateada)}
                ${fila("Noches", String(noches))}
                ${fila("Huéspedes", String(huespedes))}
                ${estado ? fila("Estado", chip(estado, ETIQUETA_ESTADO[estado] ?? estado)) : ""}
              </table>
            </div>

            ${pago || estadoPago ? `
            <div class="bloque">
              <p class="bloque-titulo">Pago</p>
              <table class="datos" role="presentation">
                ${pago ? fila("Método", pago === "tarjeta" ? "Tarjeta" : pago === "efectivo" ? "Efectivo en recepción" : "Transferencia bancaria") : ""}
                ${estadoPago ? fila("Estado del pago", chip(estadoPago, ETIQUETA_ESTADO[estadoPago] ?? estadoPago)) : ""}
                ${referencia ? fila("Referencia", referencia) : ""}
              </table>
            </div>` : ""}

            ${typeof subtotal === "number" || typeof iva === "number" ? `
            <div class="bloque">
              <p class="bloque-titulo">Resumen del pago</p>
              <table class="datos" role="presentation">
                ${typeof subtotal === "number" ? fila("Subtotal", money(subtotal)) : ""}
                ${typeof iva === "number" ? fila("IVA (15%)", money(iva)) : ""}
              </table>
            </div>` : ""}

            <div class="total">
              <p class="total-etiqueta">Total a pagar (IVA incluido)</p>
              <p class="total-monto">${money(total) || `C$ ${total}`}</p>
              ${estado ? chip(estado, ETIQUETA_ESTADO[estado] ?? estado) : ""}
            </div>

            <p class="nota">Presenta tu folio en recepción junto con tu identificación para completar el check-in. Si necesitas cambiar o cancelar tu reserva, ingresa a tu cuenta y ve a <strong>Mis reservas</strong>.</p>
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
