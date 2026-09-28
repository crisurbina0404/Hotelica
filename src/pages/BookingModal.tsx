// ============================================================
// Hotelica — Modal de reserva con wizard de 3 pasos (HU-013)
// ============================================================
import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import type { Habitacion, Hotel, Reserva, DatosPago, Pago } from "../data";
import { calcularNoches, calcularTotales, fmtDinero, fmtFecha, hoyISO, sugerirFechasAlternativas, TASA_IVA as TASA_IVA_PCT, validarPago } from "../data";
import { Modal, Spinner, Marca } from "../ui";
// Copia interna del logo para incrustarlo en el comprobante descargable
import logoBlanco from "../assets/Logo-blanco.svg?raw";
import {
  IconoLlave, IconoTarjeta, IconoBillete, IconoBanco, IconoCheck,
  IconoCalendario, IconoHuespedes, IconoCama, IconoFlechaAtras, IconoDescargar,
} from "../icons";

type Fase = "wizard" | "procesando" | "exito";
type Paso = 1 | 2 | 3;

// Nombres de cada paso del wizard
const PASOS = [
  { numero: 1, titulo: "Datos de la reserva", icono: "📅" },
  { numero: 2, titulo: "Método de pago", icono: "💳" },
  { numero: 3, titulo: "Confirmar reserva", icono: "✅" },
];

// Bancos disponibles para la transferencia (HU-018)
const BANCOS = [
  "Banco de Nicaragua",
  "Banco Central de América",
  "BAC Credomatic",
  "Lafise Bancentro",
  "Banco de Occidente",
  "Banpro",
];

// Deja una referencia corta para el registro de pago (no guardamos la tarjeta completa)
function referenciaDe(metodo: Reserva["pago"], datos: DatosPago): string {
  if (metodo === "tarjeta") return `**** ${datos.tarjeta.replace(/\s+/g, "").slice(-4)}`;
  if (metodo === "transferencia") return datos.referencia.trim();
  return "Pago en recepción";
}

// Arma el comprobante en HTML con la marca de Hotelica y lo descarga (HU-018)
function descargarComprobante(r: Reserva, hotelNombre: string, habitacionTipo: string, pago?: Pago | null) {
  // Paleta oficial: mismos colores de badge que en la aplicación
  const CHIP: Record<string, [string, string]> = {
    pendiente: ["#FEF3C7", "#92400E"],
    confirmada: ["#DBEAFE", "#1D4ED8"],
    checkin: ["#D9E9EC", "#0B3540"],
    completada: ["#DCFCE7", "#166534"],
    cancelada: ["#FEE2E2", "#B91C1C"],
    pagado: ["#DCFCE7", "#166534"],
  };
  const ETIQUETA: Record<string, string> = {
    pendiente: "Pendiente", confirmada: "Confirmada", checkin: "Check-in",
    completada: "Completada", cancelada: "Cancelada", pagado: "Pagado", reembolsado: "Reembolsado",
  };
  const chip = (clave: string) => {
    const [fondo, tinta] = CHIP[clave] ?? ["#EFF5F6", "#0B3540"];
    const texto = ETIQUETA[clave] ?? clave;
    return `<span style="display:inline-block;padding:4px 13px;border-radius:999px;background:${fondo};color:${tinta};font-size:12px;font-weight:700;">${texto}</span>`;
  };
  const fila = (etiqueta: string, valor: string) =>
    `<tr><td class="etiqueta">${etiqueta}</td><td class="valor">${valor}</td></tr>`;
  const metodo = r.pago === "tarjeta" ? "Tarjeta" : r.pago === "efectivo" ? "Efectivo en recepción" : "Transferencia bancaria";

  const comprobante = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Comprobante ${r.folio} — Hotelica</title>
<style>
  body { font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; background: #F8F6F0; color: #1C2B30; margin: 0; padding: 40px 16px; }
  .caja { max-width: 600px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 18px rgba(11,53,64,.14); }
  .cabecera { background: linear-gradient(135deg, #0B3540, #07242C); padding: 30px 24px 24px; text-align: center; border-bottom: 3px solid #F7A81B; }
  .cabecera svg { width: 220px; height: auto; display: block; margin: 0 auto; }
  .lema { margin: 16px 0 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #8FD3DE; }
  .guion { color: #E0A83C; }
  .contenido { padding: 30px 28px 26px; }
  .ceja { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #177E8C; }
  .titulo { margin: 8px 0; font-family: 'Fraunces', Georgia, serif; font-size: 27px; font-weight: 700; color: #0B3540; }
  .folio { margin: 24px 0 6px; padding: 22px 20px; text-align: center; background: #FDF0D7; border: 2px dashed #F7A81B; border-radius: 12px; }
  .folio-ceja { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #D98A0B; }
  .folio-numero { margin: 8px 0 6px; font-family: 'Fraunces', Georgia, serif; font-size: 36px; font-weight: 800; color: #0B3540; }
  .folio-nota { margin: 0; font-size: 13px; color: #5D6E73; }
  .bloque { margin: 22px 0 0; padding: 6px 20px 14px; background: #F8F6F0; border: 1px solid #E4DFD2; border-radius: 12px; }
  .bloque-titulo { margin: 16px 0 2px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #0B3540; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 11px 2px; font-size: 14px; border-bottom: 1px solid #E4DFD2; }
  tr:last-child td { border-bottom: none; }
  .etiqueta { color: #5D6E73; font-weight: 500; }
  .valor { text-align: right; font-weight: 700; color: #1C2B30; }
  .total { margin: 24px 0 0; padding: 22px 20px; text-align: center; background: #0B3540; border-radius: 12px; }
  .total-etiqueta { margin: 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #8FD3DE; }
  .total-monto { margin: 8px 0 12px; font-family: 'Fraunces', Georgia, serif; font-size: 34px; font-weight: 800; color: #F7A81B; }
  .nota { margin: 22px 0 0; padding: 14px 16px; font-size: 13px; line-height: 1.65; color: #5D6E73; background: #EFF5F6; border-left: 3px solid #177E8C; border-radius: 8px; }
  .pie { padding: 24px; text-align: center; background: #07242C; }
  .pie-marca { margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 15px; font-weight: 700; letter-spacing: 4px; color: #F8F6F0; }
  .pie-texto { margin: 10px 0 0; font-size: 12px; line-height: 1.7; color: #8FD3DE; }
</style></head>
<body><div class="caja">
  <div class="cabecera">
    ${logoBlanco}
    <p class="lema"><span class="guion">—</span>&nbsp;&nbsp;Tu destino en Nicaragua&nbsp;&nbsp;<span class="guion">—</span></p>
  </div>

  <div class="contenido">
    <p class="ceja">Comprobante de reserva y pago</p>
    <h1 class="titulo">Reserva ${r.folio}</h1>

    <div class="folio">
      <p class="folio-ceja">Tu folio</p>
      <p class="folio-numero">${r.folio}</p>
      <p class="folio-nota">Guárdalo para el check-in</p>
    </div>

    <div class="bloque">
      <p class="bloque-titulo">Detalle de la reserva</p>
      <table>
        ${fila("Hotel", hotelNombre)}
        ${fila("Habitación", habitacionTipo)}
        ${fila("Huésped", r.turista)}
        ${fila("Correo", r.correo || "—")}
        ${fila("Llegada", fmtFecha(r.llegada))}
        ${fila("Salida", fmtFecha(r.salida))}
        ${fila("Noches", String(r.noches))}
        ${fila("Huéspedes", String(r.huespedes))}
        ${fila("Estado de la reserva", chip(r.estado))}
      </table>
    </div>

    <div class="bloque">
      <p class="bloque-titulo">Pago</p>
      <table>
        ${fila("Método", metodo)}
        ${pago ? fila("Estado del pago", chip(pago.estado)) : ""}
        ${pago ? fila("Referencia", pago.referencia) : ""}
        ${pago ? fila("Fecha de pago", fmtFecha(pago.fecha)) : ""}
      </table>
    </div>

    <div class="bloque">
      <p class="bloque-titulo">Resumen del pago</p>
      <table>
        ${fila("Subtotal", fmtDinero(r.subtotal))}
        ${fila(`IVA (${TASA_IVA_PCT * 100}%)`, fmtDinero(r.iva))}
      </table>
    </div>

    <div class="total">
      <p class="total-etiqueta">Total pagado (IVA incluido)</p>
      <p class="total-monto">${fmtDinero(r.total)}</p>
      ${pago ? chip(pago.estado) : ""}
    </div>

    <p class="nota">Presenta este comprobante en recepción junto con tu identificación para completar el check-in. Emitido el ${fmtFecha(r.creada)}.</p>
  </div>

  <div class="pie">
    <p class="pie-marca">HOTELICA</p>
    <p class="pie-texto">Plataforma turística de Nicaragua · Donde Nicaragua te recibe</p>
  </div>
</div></body></html>`;

  const blob = new Blob([comprobante], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `comprobante-${r.folio}.html`;
  enlace.click();
  URL.revokeObjectURL(url);
}

export function ModalReserva({
  hotel, habitacion, llegada: l0, salida: s0, huespedes: h0, navegar, alCerrar,
}: {
  hotel: Hotel;
  habitacion: Habitacion;
  llegada: string;
  salida: string;
  huespedes: number;
  navegar: Navegar;
  alCerrar: () => void;
}) {
  const { crearReserva, registrarPago, enviarCorreoReserva, disponiblesDe, avisar, usuario } = useApp();
  const [llegada, setLlegada] = useState(l0);
  const [salida, setSalida] = useState(s0);
  const [huespedes, setHuespedes] = useState(h0);
  const [pago, setPago] = useState<Reserva["pago"]>("tarjeta");
  // Datos del formulario de pago (HU-018)
  const [datosPago, setDatosPago] = useState<DatosPago>({
    titular: "", tarjeta: "", vencimiento: "", cvv: "", banco: "", referencia: "",
  });
  // Registro de pago creado al confirmar, para mostrarlo en el comprobante
  const [pagoRegistro, setPagoRegistro] = useState<Pago | null>(null);
  const [error, setError] = useState("");
  const [fase, setFase] = useState<Fase>("wizard");
  const [pasoActual, setPasoActual] = useState<Paso>(1);
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [correoEnviado, setCorreoEnviado] = useState<boolean | null>(null);

  // Campo opcional de comentarios
  const [comentarios, setComentarios] = useState("");

  // Cálculos de negocio
  const noches = calcularNoches(llegada, salida);
  const { subtotal, iva, total } = calcularTotales(habitacion.precio, Math.max(0, noches));
  const disponibles = disponiblesDe(habitacion.id, llegada, salida);

  // Sugerencias cuando no hay disponibilidad
  const sugerencias = useMemo(() => {
    if (disponibles > 0 || noches <= 0) return [];
    return sugerirFechasAlternativas(
      [{ id: habitacion.id, unidades: habitacion.unidades }],
      disponiblesDe,
      noches,
      llegada
    );
  }, [disponibles, noches, llegada, habitacion, disponiblesDe]);

  // Validar el paso actual antes de avanzar
  const validarPaso = (): boolean => {
    setError("");

    if (pasoActual === 1) {
      if (salida <= llegada) {
        setError("La fecha de salida debe ser posterior a la fecha de llegada.");
        return false;
      }
      if (huespedes < 1) {
        setError("El número de huéspedes debe ser mayor o igual a 1.");
        return false;
      }
      if (huespedes > habitacion.capacidad) {
        setError("La habitación seleccionada no admite esa cantidad de huéspedes.");
        return false;
      }
      if (disponibles <= 0) {
        setError("No hay habitaciones disponibles para este tipo en las fechas elegidas.");
        return false;
      }
    }

    // Paso 2: los datos del pago deben estar completos antes de avanzar (HU-018)
    if (pasoActual === 2) {
      const errorPago = validarPago(pago, datosPago, hoyISO());
      if (errorPago) {
        setError(errorPago);
        return false;
      }
    }

    return true;
  };

  // Avanzar al siguiente paso
  const siguientePaso = () => {
    if (!validarPaso()) return;
    if (pasoActual < 3) {
      setPasoActual((p) => (p + 1) as Paso);
    }
  };

  // Retroceder al paso anterior
  const pasoAnterior = () => {
    setError("");
    if (pasoActual > 1) {
      setPasoActual((p) => (p - 1) as Paso);
    }
  };

  // Confirmar la reserva (paso 3)
  const confirmar = async () => {
    setFase("procesando");
    setCorreoEnviado(null);

    // Primero creamos la reserva
    const nueva = crearReserva({
      hotelId: hotel.id,
      habitacionId: habitacion.id,
      turista: usuario?.nombre ?? "Turista",
      correo: usuario?.correo ?? "",
      telefono: usuario?.telefono ?? "",
      comentarios,
      llegada, salida, huespedes,
      noches, subtotal, iva, total, pago,
    });

    // Después registramos el pago contra ese folio (HU-018)
    const registro = registrarPago({
      folio: nueva.folio,
      monto: nueva.total,
      metodo: pago,
      referencia: referenciaDe(pago, datosPago),
    });
    setPagoRegistro(registro);

    // Con pago completo la reserva sale Confirmada; en efectivo queda Pendiente
    const reservaFinal: Reserva = registro.estado === "pagado"
      ? { ...nueva, estado: "confirmada" }
      : nueva;
    setReserva(reservaFinal);
    avisar(`Reserva ${nueva.folio} creada correctamente`, "ok");
    if (registro.estado === "pagado") {
      avisar(`Pago de ${fmtDinero(registro.monto)} registrado. Tu reserva quedó Confirmada.`, "ok");
    } else {
      avisar("Pago en efectivo pendiente: se realiza en recepción al llegar.", "info");
    }

    // Luego intentamos enviar el correo
    const resultadoCorreo = await enviarCorreoReserva(reservaFinal, hotel.nombre);

    if (resultadoCorreo.ok) {
      setCorreoEnviado(true);
      avisar(`Correo de confirmación enviado a ${usuario?.correo}`, "ok");
    } else {
      setCorreoEnviado(false);
      avisar(`Reserva creada pero no se pudo enviar el correo: ${resultadoCorreo.error}`, "error");
    }

    setFase("exito");
  };

  const claseCampo = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25";
  const etiquetaCampo = "mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted";

  // Actualiza un solo campo del formulario de pago y baja el aviso de error
  const actualizarPago = (campo: keyof DatosPago, valor: string) => {
    setError("");
    setDatosPago((d) => ({ ...d, [campo]: valor }));
  };

  const metodos = [
    { id: "tarjeta", nombre: "Tarjeta", icono: <IconoTarjeta size={18} /> },
    { id: "efectivo", nombre: "Efectivo", icono: <IconoBillete size={18} /> },
    { id: "transferencia", nombre: "Transferencia", icono: <IconoBanco size={18} /> },
  ] as const;

  return (
    <Modal abierto alCerrar={fase === "procesando" ? () => {} : alCerrar} ancho="max-w-3xl">
      {fase === "exito" ? (
        /* ===== Pantalla de éxito ===== */
        <div className="flex flex-col items-center px-6 py-12 text-center sm:px-12">
          <span className="anim-pop flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary">
            <IconoLlave size={38} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">¡Tu reserva fue realizada con éxito!</h2>
          <p className="mt-2 text-sm text-muted">Guarda tu folio: lo necesitarás para el check-in en recepción.</p>

          {/* Confirmación de correo enviado */}
          {correoEnviado === true && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#DCFCE7] px-4 py-2.5 text-sm font-semibold text-[#166534]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Correo de confirmación enviado a <b>{usuario?.correo}</b>
            </div>
          )}
          {correoEnviado === false && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#FEF3C7] px-4 py-2.5 text-sm font-semibold text-[#92400E]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              No se pudo enviar el correo. Tu reserva está registrada con folio <b>{reserva?.folio}</b>
            </div>
          )}

          <p className="mt-5 rounded-xl border-2 border-dashed border-accent bg-accent-light px-8 py-3 font-display text-3xl font-extrabold tracking-wider text-accent-dark">
            {reserva?.folio}
          </p>

          {reserva && (
            <div className="mt-6 w-full max-w-sm rounded-xl border border-line bg-canvas p-5 text-left text-sm">
              <p className="flex justify-between py-1"><span className="text-muted">Hotel</span><b className="text-ink">{hotel.nombre}</b></p>
              <p className="flex justify-between py-1"><span className="text-muted">Habitación</span><b className="text-ink">{habitacion.tipo}</b></p>
              <p className="flex justify-between py-1"><span className="text-muted">Fechas</span><b className="text-ink">{fmtFecha(reserva.llegada)} → {fmtFecha(reserva.salida)}</b></p>
              <p className="flex justify-between py-1"><span className="text-muted">Huéspedes</span><b className="text-ink">{reserva.huespedes}</b></p>
              {/* Desglose subtotal + IVA + total (HU-014) */}
              <p className="flex justify-between py-1"><span className="text-muted">Precio por noche</span><b className="text-ink">{fmtDinero(reserva.subtotal / Math.max(1, reserva.noches))}</b></p>
              <p className="flex justify-between py-1"><span className="text-muted">Noches</span><b className="text-ink">{reserva.noches}</b></p>
              <p className="flex justify-between py-1"><span className="text-muted">Subtotal</span><b className="text-ink">{fmtDinero(reserva.subtotal)}</b></p>
              <p className="flex justify-between py-1"><span className="text-muted">IVA ({TASA_IVA_PCT * 100}%)</span><b className="text-ink">{fmtDinero(reserva.iva)}</b></p>
              <p className="flex justify-between border-t border-line py-2 text-base"><span className="font-semibold text-muted">Total (IVA incluido)</span><b className="font-display text-primary">{fmtDinero(reserva.total)}</b></p>
            </div>
          )}

          {reserva && pagoRegistro && (
            <p className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold ${pagoRegistro.estado === "pagado" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEF3C7] text-[#92400E]"}`}>
              <IconoTarjeta size={14} />
              Pago {pagoRegistro.estado === "pagado" ? "registrado" : "pendiente"} · {pagoRegistro.referencia} · {fmtDinero(pagoRegistro.monto)}
            </p>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={() => { alCerrar(); navegar({ nombre: "reservas" }); }} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
              <IconoCheck size={16} /> Ver mis reservas
            </button>
            <button onClick={() => reserva && descargarComprobante(reserva, hotel.nombre, habitacion.tipo, pagoRegistro)} className="flex items-center gap-2 rounded-lg border-2 border-primary px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-soft">
              <IconoDescargar size={16} /> Descargar comprobante
            </button>
            <button onClick={() => { alCerrar(); navegar({ nombre: "resultados" }); }} className="rounded-lg border-2 border-line px-6 py-3 text-sm font-bold text-muted transition-colors hover:border-primary hover:text-primary">
              Seguir explorando
            </button>
          </div>

          <div className="mt-9">
            <Marca tam="chica" centrada />
          </div>
        </div>
      ) : (
        /* ===== Wizard de 3 pasos ===== */
        <div>
          {/* Barra de progreso */}
          <div className="border-b border-line px-6 py-4 sm:px-7">
            <div className="flex items-center justify-between">
              {PASOS.map((p, i) => (
                <div key={p.numero} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      pasoActual >= p.numero
                        ? "bg-accent text-white"
                        : "bg-line text-muted"
                    }`}>
                      {pasoActual > p.numero ? <IconoCheck size={14} /> : p.numero}
                    </span>
                    <span className={`hidden text-xs font-semibold sm:block ${
                      pasoActual >= p.numero ? "text-ink" : "text-muted"
                    }`}>
                      {p.titulo}
                    </span>
                  </div>
                  {i < PASOS.length - 1 && (
                    <div className={`mx-3 h-0.5 w-8 sm:w-16 ${
                      pasoActual > p.numero ? "bg-accent" : "bg-line"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-[1.2fr_1fr]">
            {/* ===== Columna izquierda: contenido del paso ===== */}
            <div className="p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Paso {pasoActual} de 3</p>
              <h2 className="mt-1 font-display text-xl font-bold text-ink">{PASOS[pasoActual - 1].titulo}</h2>

              {/* PASO 1: Datos de la reserva */}
              {pasoActual === 1 && (
                <div className="mt-5">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                    <IconoCama size={16} className="text-primary" /> {habitacion.tipo} · hasta {habitacion.capacidad} huéspedes
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                        <IconoCalendario size={12} /> Llegada
                      </span>
                      <input type="date" value={llegada} min={hoyISO()} onChange={(e) => setLlegada(e.target.value)} className={claseCampo} />
                    </label>
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                        <IconoCalendario size={12} /> Salida
                      </span>
                      <input type="date" value={salida} min={llegada} onChange={(e) => setSalida(e.target.value)} className={claseCampo} />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                        <IconoHuespedes size={12} /> Huéspedes
                      </span>
                      <input type="number" min={1} max={habitacion.capacidad} value={huespedes} onChange={(e) => setHuespedes(Number(e.target.value))} className={claseCampo} />
                      <span className="mt-1 block text-[11px] text-muted">Capacidad máxima: {habitacion.capacidad}</span>
                    </label>
                  </div>

                  {/* Datos del usuario logiado (solo lectura) */}
                  {usuario && (
                    <div className="mt-4 rounded-lg bg-primary-soft p-3 text-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Reservando como</p>
                      <p className="mt-1 font-semibold text-ink">{usuario.nombre}</p>
                      <p className="text-xs text-muted">{usuario.correo} · {usuario.telefono}</p>
                    </div>
                  )}

                  {/* Disponibilidad en tiempo real */}
                  <div className={`mt-4 rounded-lg p-3 text-sm font-semibold ${disponibles > 0 ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#B91C1C]"}`}>
                    {disponibles > 0 ? `${disponibles} disponible${disponibles > 1 ? "s" : ""} para estas fechas` : "No hay disponibilidad para estas fechas"}
                  </div>

                  {/* Sugerencias */}
                  {sugerencias.length > 0 && (
                    <div className="mt-4 rounded-lg border border-[#93C5FD] bg-[#DBEAFE] p-4">
                      <p className="text-xs font-bold text-[#1D4ED8]">Fechas alternativas disponibles</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sugerencias.map((s) => (
                          <button key={s.llegada} type="button" onClick={() => { setLlegada(s.llegada); setSalida(s.salida); setError(""); }}
                            className="rounded-lg border border-[#93C5FD] bg-white px-3 py-1.5 text-[11px] font-bold text-[#1D4ED8] transition-all hover:bg-[#BFDBFE]">
                            {fmtFecha(s.llegada)} → {fmtFecha(s.salida)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASO 2: Método de pago */}
              {pasoActual === 2 && (
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Selecciona tu método de pago</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {metodos.map((m) => (
                      <button key={m.id} type="button" onClick={() => { setPago(m.id); setError(""); }}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-4 text-xs font-bold transition-all ${
                          pago === m.id ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:border-primary/40"
                        }`}>
                        {m.icono} {m.nombre}
                      </button>
                    ))}
                  </div>

                  {/* Formulario con los datos del método elegido (HU-018) */}
                  {pago === "tarjeta" && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className={etiquetaCampo}>Nombre del titular</span>
                        <input value={datosPago.titular} onChange={(e) => actualizarPago("titular", e.target.value)} placeholder="Como figura en la tarjeta" className={claseCampo} />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className={etiquetaCampo}>Número de tarjeta</span>
                        <input value={datosPago.tarjeta} onChange={(e) => actualizarPago("tarjeta", e.target.value)} placeholder="0000 0000 0000 0000" inputMode="numeric" maxLength={19} className={claseCampo} />
                      </label>
                      <label className="block">
                        <span className={etiquetaCampo}>Vencimiento</span>
                        <input value={datosPago.vencimiento} onChange={(e) => actualizarPago("vencimiento", e.target.value)} placeholder="MM/AA" maxLength={5} className={claseCampo} />
                      </label>
                      <label className="block">
                        <span className={etiquetaCampo}>CVV</span>
                        <input value={datosPago.cvv} onChange={(e) => actualizarPago("cvv", e.target.value)} placeholder="123" inputMode="numeric" maxLength={3} className={claseCampo} />
                      </label>
                    </div>
                  )}

                  {pago === "transferencia" && (
                    <div className="mt-4 grid gap-3">
                      <label className="block">
                        <span className={etiquetaCampo}>Banco de origen</span>
                        <select value={datosPago.banco} onChange={(e) => actualizarPago("banco", e.target.value)} className={claseCampo}>
                          <option value="">Selecciona tu banco</option>
                          {BANCOS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className={etiquetaCampo}>Número de referencia</span>
                        <input value={datosPago.referencia} onChange={(e) => actualizarPago("referencia", e.target.value)} placeholder="Ej: TRX-001234" className={claseCampo} />
                      </label>
                      <p className="text-xs text-muted">Transfiere el total a la cuenta de Hotelica y anota aquí el número de referencia.</p>
                    </div>
                  )}

                  {pago === "efectivo" && (
                    <div className="mt-4 rounded-lg border border-line bg-canvas p-4 text-sm text-muted">
                      Pagas en efectivo al llegar a recepción. Tu reserva queda <b className="text-ink">Pendiente</b> hasta que realices el pago.
                    </div>
                  )}

                  {/* Comentarios o solicitudes especiales */}
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Comentarios o solicitudes especiales (opcional)</p>
                    <textarea
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      placeholder="Ej: Necesito cama extra, llego tarde, piso alto..."
                      rows={3}
                      className={`${claseCampo} mt-2 resize-none`}
                    />
                  </div>

                  <p className="mt-4 text-xs text-muted">
                    {pago === "efectivo"
                      ? "Recuerda llevar el efectivo exacto para el check-in."
                      : "Tus datos se validan antes de procesar el pago. Demostración: no se realiza ningún cargo real."}
                  </p>
                </div>
              )}

              {/* PASO 3: Confirmación */}
              {pasoActual === 3 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-ink">Revisa los datos de tu reserva:</p>

                  <div className="mt-4 rounded-xl border border-line bg-canvas p-4 text-sm">
                    <div className="grid gap-2.5">
                      <p className="flex justify-between"><span className="text-muted">Hotel</span><b className="text-ink">{hotel.nombre}</b></p>
                      <p className="flex justify-between"><span className="text-muted">Habitación</span><b className="text-ink">{habitacion.tipo}</b></p>
                      <p className="flex justify-between"><span className="text-muted">Huésped</span><b className="text-ink">{usuario?.nombre}</b></p>
                      <p className="flex justify-between"><span className="text-muted">Correo</span><b className="text-ink">{usuario?.correo}</b></p>
                      <p className="flex justify-between"><span className="text-muted">Teléfono</span><b className="text-ink">{usuario?.telefono}</b></p>
                      <p className="flex justify-between"><span className="text-muted">Llegada</span><b className="text-ink">{fmtFecha(llegada)}</b></p>
                      <p className="flex justify-between"><span className="text-muted">Salida</span><b className="text-ink">{fmtFecha(salida)}</b></p>
                      <p className="flex justify-between"><span className="text-muted">Noches</span><b className="text-ink">{noches}</b></p>
                      <p className="flex justify-between"><span className="text-muted">Huéspedes</span><b className="text-ink">{huespedes}</b></p>
                      <p className="flex justify-between"><span className="text-muted">Método de pago</span><b className="text-ink capitalize">{pago}</b></p>
                      {pago !== "efectivo" && (
                        <p className="flex justify-between"><span className="text-muted">Referencia de pago</span><b className="text-ink">{referenciaDe(pago, datosPago)}</b></p>
                      )}
                      {comentarios && <p className="flex justify-between"><span className="text-muted">Comentarios</span><b className="text-ink text-right max-w-[200px]">{comentarios}</b></p>}
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted">
                    {pago === "efectivo"
                      ? "Al confirmar, la reserva y el pago quedan Pendientes hasta que pagues en recepción."
                      : "Al confirmar se registra el pago y tu reserva pasa a estado Confirmada."}
                  </p>
                </div>
              )}

              {/* Mensaje de error */}
              {error && (
                <p role="alert" className="anim-pop mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C]">
                  {error}
                </p>
              )}
            </div>

            {/* ===== Columna derecha: resumen de precio ===== */}
            <div className="flex flex-col border-t border-line bg-primary-soft/60 p-6 sm:p-7 md:border-l md:border-t-0">
              <p className="font-display text-base font-bold text-ink">Resumen de precio</p>
              <div className="mt-4 grid gap-2.5 text-sm">
                <p className="flex justify-between text-muted"><span>Precio por noche</span><b className="text-ink">{fmtDinero(habitacion.precio)}</b></p>
                <p className="flex justify-between text-muted"><span>Noches</span><b className="text-ink">{noches > 0 ? noches : "—"}</b></p>
                <p className="flex justify-between text-muted"><span>Subtotal</span><b className="text-ink">{fmtDinero(subtotal)}</b></p>
                <p className="flex justify-between text-muted"><span>IVA ({TASA_IVA_PCT * 100}%)</span><b className="text-ink">{fmtDinero(iva)}</b></p>
                <p className="flex justify-between text-muted"><span>Disponibles</span><b className={disponibles > 0 ? "text-success" : "text-danger"}>{disponibles}</b></p>
              </div>

              <div className="mt-4 rounded-xl bg-primary-deep p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-200/80">Total a pagar</p>
                <p className="mt-1 font-display text-3xl font-extrabold text-accent">{fmtDinero(total)}</p>
                <p className="mt-1 text-[11px] text-teal-200/70">{fmtFecha(llegada)} → {fmtFecha(salida)} · {huespedes} huésped{huespedes > 1 ? "es" : ""}</p>
              </div>

              {/* Botones de navegación del wizard */}
              <div className="mt-5 flex gap-3">
                {pasoActual > 1 && (
                  <button onClick={pasoAnterior}
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-primary px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-soft">
                    <IconoFlechaAtras size={16} /> Anterior
                  </button>
                )}
                {pasoActual < 3 ? (
                  <button onClick={siguientePaso}
                    className="flex-1 rounded-lg bg-accent py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-dark hover:shadow-lg active:scale-[0.98]">
                    Siguiente
                  </button>
                ) : (
                  <button onClick={confirmar} disabled={fase === "procesando"}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-accent py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-dark hover:shadow-lg active:scale-[0.98] disabled:opacity-70">
                    {fase === "procesando" ? (<><Spinner size={17} /> Procesando...</>) : (<><IconoLlave size={17} /> Confirmar reserva</>)}
                  </button>
                )}
              </div>

              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
                Demostración: no se realiza ningún cargo real.
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
