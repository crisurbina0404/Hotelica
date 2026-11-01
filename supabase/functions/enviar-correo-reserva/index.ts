// ============================================================
// Hotelica — Edge Function: enviar correo de confirmación de reserva
// Usa la API de Brevo para enviar correos transaccionales
// El HTML sale de la plantilla compartida de _shared/correo.ts, para
// que los tres correos del proyecto tengan la misma retícula.
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { correoReserva, escaparHtml } from "../_shared/correo.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
// Correo que verificaste como remitente en Brevo
const REMITENTE_CORREO = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Adónde lleva el botón del correo: la app no tiene rutas por URL,
// así que el botón abre el sitio y el turista entra a "Mis reservas"
const ORIGEN_APP = Deno.env.get("ORIGEN_APP") ?? "https://hotelica.vercel.app";

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Números que llegan del navegador: si no vienen numéricos, cambiamos a null
function numeroLimpio(valor: unknown): number | null {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
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

    // Obtener y validar datos del cuerpo. Todo lo que después va al HTML
    // del correo llega limpio (sin HTML ni código entre medio), y los
    // montos solo cuentan si son números de verdad
    const body = await req.json();
    // Guardamos el texto crudo para los asuntos y la versión en texto plano,
    // y su versión escapada para el HTML del correo
    const folioTexto = String(body.folio ?? "").trim();
    const hotelTexto = String(body.hotelNombre ?? "").trim();
    const folio = escaparHtml(folioTexto);
    const hotelNombre = escaparHtml(hotelTexto);
    const turista = escaparHtml(String(body.turista ?? "").trim());
    const correo = String(body.correo ?? "").trim();
    const llegada = String(body.llegada ?? "").trim();
    const salida = String(body.salida ?? "").trim();
    const total = numeroLimpio(body.total);
    const habitacion = escaparHtml(String(body.habitacion ?? "").trim());
    const subtotal = numeroLimpio(body.subtotal);
    const iva = numeroLimpio(body.iva);
    const noches = numeroLimpio(body.noches);
    const huespedes = numeroLimpio(body.huespedes);
    const pago = escaparHtml(String(body.pago ?? "").trim());
    const estadoPago = escaparHtml(String(body.estadoPago ?? "").trim());
    const referencia = escaparHtml(String(body.referencia ?? "").trim());
    const estado = escaparHtml(String(body.estado ?? "").trim());

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

    // Colores de cada estado (paleta oficial de Hotelica, §1.4 de la skill)
    const CHIP_ESTADO: Record<string, [string, string]> = {
      pendiente: ["#FEF3C7", "#92400E"],
      confirmada: ["#DBEAFE", "#1D4ED8"],
      checkin: ["#D9E9EC", "#0B3540"],
      completada: ["#DCFCE7", "#166534"],
      cancelada: ["#FEE2E2", "#B91C1C"],
      pagado: ["#DCFCE7", "#166534"],
      reembolsado: ["#EFF5F6", "#0B3540"],
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

    // Fondo y tinta de la pastilla, con su texto en español
    const chipDe = (clave: string) => {
      const [fondo, tinta] = CHIP_ESTADO[clave] ?? ["#EFF5F6", "#0B3540"];
      return { texto: ETIQUETA_ESTADO[clave] ?? clave, fondo, tinta };
    };

    // Método de pago tal como lo lee una persona
    const metodoPago = pago === "tarjeta"
      ? "Tarjeta"
      : pago === "efectivo"
        ? "Efectivo en recepción"
        : pago
          ? "Transferencia bancaria"
          : undefined;

    // HTML del correo (comprobante de reserva) desde la plantilla común
    const htmlCorreo = correoReserva({
      folio,
      hotel: hotelNombre,
      turista,
      llegada: llegadaFormateada,
      salida: salidaFormateada,
      habitacion: habitacion || undefined,
      noches: noches !== null ? String(noches) : null,
      huespedes: huespedes !== null ? String(huespedes) : null,
      estado: estado ? chipDe(estado) : undefined,
      metodoPago,
      estadoPago: estadoPago ? chipDe(estadoPago) : undefined,
      referencia: referencia || undefined,
      subtotal: typeof subtotal === "number" ? money(subtotal) : undefined,
      iva: typeof iva === "number" ? money(iva) : undefined,
      total: money(total) || `C$ ${total}`,
      urlApp: ORIGEN_APP,
    });

    // Versión en texto plano: ayuda a los filtros de spam y a quien lee sin HTML
    const textoPlano = [
      `Tu reserva en ${hotelTexto} quedó registrada.`,
      "",
      `Folio: ${folioTexto}`,
      `Llegada: ${llegadaFormateada}`,
      `Salida: ${salidaFormateada}`,
      habitacion ? `Habitación: ${String(body.habitacion ?? "").trim()}` : "",
      noches !== null ? `Noches: ${noches}` : "",
      huespedes !== null ? `Huéspedes: ${huespedes}` : "",
      `Total con IVA incluido: ${money(total) || `C$ ${total}`}`,
      "",
      "Llevá tu folio y tu identificación al check-in. Para cambiar o cancelar la reserva, entrá a Mis reservas desde tu cuenta.",
      "",
      `Hotelica · ${ORIGEN_APP}`,
    ].filter((linea) => linea !== "").join("\n");

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
        subject: `Reserva ${folio} en ${hotelTexto}`,
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
