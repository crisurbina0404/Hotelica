// ============================================================
// Hotelica — Panel del hotel (HU-026 reservas recibidas,
// HU-027 confirmar, HU-028 check-in, HU-029 check-out)
// El hotelero llega acá después de que el admin apruebe su
// inscripción del inicio y le cree la cuenta (HU-021)
// ============================================================
import { useMemo, useState } from "react";
import { useApp } from "../store";
import {
  DEPARTAMENTOS, ESTADOS_HABITACION, ETIQUETA_ESTADO, ETIQUETA_HABITACION, MAXIMO_FOTOS, MUNICIPIOS, TASA_IVA, TEMPORADAS, ajustarPrecio,
  calcularTotales, cupoDeFotos, errorDeGaleria, fmtDinero, fmtFecha, fmtFechaHora, hoyISO, contrasenaTemporalVencida, validarImagenHotel, soloDigitosTelefono,
} from "../data";
import { optimizarFoto, pesoDeFoto } from "../imagen";
import { descargarFactura } from "./BookingModal";
import { MapaHotel } from "../mapa";
import type { DatosHabitacion, DatosRegistroHotel, ErroresHabitacion, ErroresRegistroHotel, EstadoHabitacion, Habitacion, Reserva } from "../data";
import { Reveal, BadgeEstado, BadgeHabitacion, BadgeHotel, TituloSeccion, Modal } from "../ui";
import {
  IconoCheck, IconoX, IconoEntrada, IconoSalida, IconoCama, IconoGrafica, IconoBillete, IconoFoto,
  IconoCalendario, IconoHotel, IconoHuespedes, IconoCampana, IconoLapiz, IconoEstrella, IconoDescargar,
} from "../icons";

export function PanelHotel() {
  const { hoteles, habitaciones: todasLasHabitaciones, reservas, pagos, cambiarEstadoReserva, registrarCheckin, registrarCheckout, avisar, notificaciones, marcarNotificacionesLeidas, usuario, actualizarHotel, agregarHabitacion, cambiarEstadoHabitacion, cambiarPrecioHabitacion, ajustarPreciosDelHotel, agregarFotosHotel, ponerPortadaHotel, quitarFotoHotel, cuentasHotelero, cambiarContrasenaHotelero } = useApp();
  const hoy = hoyISO();

  // El hotel del dueño logueado; si no hay sesión de hotelero, el de demostración
  const mio = usuario?.correo
    ? hoteles.find((h) => h.correoDueno?.toLowerCase() === usuario.correo.trim().toLowerCase())
    : undefined;
  const hotel = mio ?? hoteles.find((h) => h.id === "h-sanjuan")!;
  const HOTEL_ID = hotel.id;

  // Contraseña temporal: el hotelero debe cambiarla en 24 horas (seguridad HU-021)
  const cuentaMia = usuario?.correo
    ? cuentasHotelero.find((c) => c.correo === usuario.correo.trim().toLowerCase())
    : undefined;
  const passwordTemporal = cuentaMia?.contrasenaTemporal ?? false;
  const passwordVencida = cuentaMia ? contrasenaTemporalVencida(cuentaMia) : false;
  const [nuevaPass, setNuevaPass] = useState("");
  const [confirmaPass, setConfirmaPass] = useState("");
  const [errorPass, setErrorPass] = useState("");

  // Cambia la contraseña temporal y desbloquea el resto del panel
  const guardarPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const resultado = cambiarContrasenaHotelero(nuevaPass, confirmaPass);
    if (resultado.error) {
      setErrorPass(resultado.error);
      return;
    }
    setErrorPass("");
    setNuevaPass("");
    setConfirmaPass("");
    avisar("Contraseña actualizada: ya podés usar tu panel con normalidad.", "ok");
  };

  // Edición de la información del hotel (HU-022)
  const [editando, setEditando] = useState(false);
  const [formEdicion, setFormEdicion] = useState<DatosRegistroHotel | null>(null);
  const [erroresEdicion, setErroresEdicion] = useState<ErroresRegistroHotel>({});
  const [editadoEnviado, setEditadoEnviado] = useState(false);

  // Registro de habitaciones del hotel (HU-023)
  const [registrando, setRegistrando] = useState(false);
  const [formHabitacion, setFormHabitacion] = useState<DatosHabitacion>(HABITACION_VACIA);
  const [erroresHabitacion, setErroresHabitacion] = useState<ErroresHabitacion>({});
  const [habitacionEnviada, setHabitacionEnviada] = useState(false);

  // Configuración de precios de cada tipo de habitación (HU-024)
  const [borradores, setBorradores] = useState<Record<string, string>>({});
  const [erroresPrecio, setErroresPrecio] = useState<Record<string, string>>({});
  const [temporada, setTemporada] = useState<string>("normal");
  const [ajustePropio, setAjustePropio] = useState("10");
  const [errorAjuste, setErrorAjuste] = useState("");

  // Galería de fotografías del hotel (HU-025)
  const [errorFoto, setErrorFoto] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  // Rechazo de una reserva: primero pedimos el motivo en un modal (HU-027)
  const [porRechazar, setPorRechazar] = useState<Reserva | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");

  // Los municipios se filtran según el departamento elegido
  const municipiosDelDepto = formEdicion
    ? MUNICIPIOS.filter((m) => m.departamentoId === formEdicion.departamentoId)
    : [];

  // Abre el formulario con los datos actuales del hotel ya cargados
  const abrirEdicion = () => {
    setFormEdicion({
      dueno: hotel.dueno,
      correo: hotel.correoDueno ?? "",
      nombre: hotel.nombre,
      departamentoId: hotel.departamentoId,
      municipioId: hotel.municipioId,
      direccion: hotel.direccion,
      ubicacion: hotel.ubicacion ?? null, // punto exacto en el mapa (HU-037)
      descripcion: hotel.descripcion,
      telefono: hotel.contacto ?? "",
      imagen: hotel.imagen,
    });
    setErroresEdicion({});
    setEditadoEnviado(false);
    setEditando(true);
  };

  // Actualiza un campo del formulario de edición y borra su error al escribir
  const cambiarCampoEdicion = (campo: keyof DatosRegistroHotel, valor: string) => {
    setFormEdicion((f) => (f ? { ...f, [campo]: valor } : f));
    setErroresEdicion((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  };

  // Al cambiar el departamento volvemos a elegir el municipio (y su pin)
  const cambiarDepartamentoEdicion = (id: string) => {
    setFormEdicion((f) => (f ? { ...f, departamentoId: id, municipioId: "", ubicacion: null } : f));
    setErroresEdicion((e) => ({ ...e, departamentoId: undefined, municipioId: undefined, ubicacion: undefined }));
  };

  // Al cambiar el municipio el pin pasa al centro de ese municipio (HU-037)
  const cambiarMunicipioEdicion = (id: string) => {
    const centro = MUNICIPIOS.find((m) => m.id === id)?.centro ?? null;
    setFormEdicion((f) => (f ? { ...f, municipioId: id, ubicacion: centro } : f));
    setErroresEdicion((e) => ({ ...e, municipioId: undefined, ubicacion: undefined }));
  };

  // Guarda los cambios solo si todas las reglas pasan
  const guardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    setEditadoEnviado(true);
    if (!formEdicion) return;

    const resultado = actualizarHotel(HOTEL_ID, formEdicion);
    if (resultado.errores) {
      setErroresEdicion(resultado.errores);
      avisar("Revisá los campos marcados: no se guardaron los cambios.", "error");
      return;
    }

    setEditando(false);
    setFormEdicion(null);
    avisar("Cambios guardados: la información del hotel quedó actualizada.", "ok");
  };

  // Actualiza un campo del formulario de habitación y borra su error al escribir
  const cambiarCampoHabitacion = (campo: keyof DatosHabitacion, valor: string | number) => {
    setFormHabitacion((f) => ({ ...f, [campo]: valor }));
    setErroresHabitacion((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  };

  // Borde coral del campo que quedó con error (mismo patrón que la edición del hotel)
  const bordeHabitacion = (campo: keyof DatosHabitacion) =>
    erroresHabitacion[campo]
      ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25"
      : "border-line focus:border-hotel focus:ring-hotel/25";

  // Registra la habitación solo si todas las reglas pasan
  const guardarHabitacion = (e: React.FormEvent) => {
    e.preventDefault();
    setHabitacionEnviada(true);

    const resultado = agregarHabitacion(HOTEL_ID, formHabitacion);
    if (resultado.errores) {
      setErroresHabitacion(resultado.errores);
      avisar("Revisá los campos marcados: la habitación no se registró.", "error");
      return;
    }

    // Dejamos el formulario limpio por si quiere registrar otra
    setRegistrando(false);
    setFormHabitacion(HABITACION_VACIA);
    setErroresHabitacion({});
    setHabitacionEnviada(false);
    avisar(`Habitación registrada: ${resultado.habitacion?.tipo}.`, "ok");
  };

  // Mientras el hotel esté en revisión no se permite editar (HU-022)
  const edicionBloqueada = hotel.aprobado === "pendiente";

  // Municipio y departamento para el encabezado
  const municipio = MUNICIPIOS.find((m) => m.id === hotel.municipioId)?.nombre ?? "";
  const departamento = DEPARTAMENTOS.find((d) => d.id === hotel.departamentoId)?.nombre ?? "";

  // Avisos que dejaron los turistas (por ejemplo, cancelaciones) — HU-016
  const avisos = useMemo(
    () => notificaciones.filter((n) => n.hotelId === HOTEL_ID),
    [notificaciones]
  );
  const avisosSinLeer = avisos.filter((n) => !n.leida).length;

  // Reservas que administra este hotel
  const delHotel = useMemo(
    () =>
      reservas
        .filter((r) => r.hotelId === HOTEL_ID)
        .sort((a, b) => a.llegada.localeCompare(b.llegada)),
    [reservas]
  );

  // Botones que el hotelero puede usar según el estado de la reserva.
  // Los comparten la tabla de escritorio y las tarjetas del celular
  const accionesDe = (r: Reserva) => (
    <>
      {r.estado === "pendiente" && (
        <>
          <Accion onClick={() => confirmar(r)} clase="bg-primary text-white hover:bg-primary-dark" icono={<IconoCheck size={13} />} texto="Confirmar" />
          <Accion onClick={() => abrirRechazo(r)} clase="border border-danger/35 text-danger hover:bg-[#FEF2F2]" icono={<IconoX size={13} />} texto="Rechazar" />
        </>
      )}
      {r.estado === "confirmada" && (
        <>
          {r.llegada <= hoy ? (
            <Accion onClick={() => checkIn(r)} clase="bg-primary text-white hover:bg-primary-dark" icono={<IconoEntrada size={13} />} texto="Check-in" />
          ) : (
            <span className="cursor-not-allowed rounded-md bg-line/60 px-2.5 py-1.5 text-[11px] font-bold text-muted" title="El check-in se habilita el día de llegada">
              Check-in el {fmtFecha(r.llegada)}
            </span>
          )}
          <Accion onClick={() => cancelar(r)} clase="border border-danger/35 text-danger hover:bg-[#FEF2F2]" icono={<IconoX size={13} />} texto="Cancelar" />
        </>
      )}
      {r.estado === "checkin" && (
        <Accion onClick={() => checkOut(r)} clase="bg-success text-white hover:bg-[#15803D]" icono={<IconoSalida size={13} />} texto="Check-out" />
      )}
      {r.estado === "completada" && (
        <Accion onClick={() => descargarFacturaDe(r)} clase="border border-primary/40 text-primary hover:bg-primary-soft" icono={<IconoDescargar size={13} />} texto="Factura" />
      )}
      {r.estado === "cancelada" && (
        <span className="text-[11px] font-semibold text-muted">—</span>
      )}
    </>
  );

  // Habitaciones que el hotelero tiene registradas en su hotel (HU-023)
  const habitaciones = todasLasHabitaciones.filter((h) => h.hotelId === HOTEL_ID);

  // ----- Configuración de precios del hotel (HU-024) -----

  // Lo que se está escribiendo en una tarjeta; sin borrador, se muestra el precio guardado
  const borradorDe = (h: Habitacion) => borradores[h.id] ?? String(h.precio);

  // Precio más bajo y más alto de una lista, para mostrar el rango de las tarifas
  const rangoDe = (lista: number[]) =>
    lista.length ? { min: Math.min(...lista), max: Math.max(...lista) } : { min: 0, max: 0 };
  const rangoActual = rangoDe(habitaciones.map((h) => h.precio));

  // Ajuste elegido: el de la temporada o el que el hotelero escribió en porcentaje
  const ajusteElegido =
    temporada === "propio" ? Number(ajustePropio) / 100 : TEMPORADAS.find((t) => t.id === temporada)!.ajuste;

  // Cómo quedarían las tarifas con ese ajuste (vista previa, antes de aplicarlo)
  const rangoConAjuste = rangoDe(habitaciones.map((h) => ajustarPrecio(h.precio, ajusteElegido)));

  // ----- Fotografías del hotel (HU-025) -----

  const galeria = hotel.galeria ?? [];
  // La portada es la primera foto de la galería; si no hay ninguna, la foto del hotel
  const portada = galeria[0] ?? hotel.imagen;

  // Sube una o varias fotos: se validan, se optimizan y recién ahí se guardan (HU-025)
  const elegirFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const elegidos = Array.from(e.target.files ?? []);
    e.target.value = ""; // así se puede volver a elegir el mismo archivo
    if (elegidos.length === 0) return;

    setErrorFoto("");

    // Tope de la galería: si ya está llena, avisamos sin procesar nada
    const cupo = cupoDeFotos((hotel.galeria ?? []).length);
    if (cupo === 0) {
      setErrorFoto(errorDeGaleria((hotel.galeria ?? []).length));
      return;
    }

    setSubiendo(true);
    const paraSubir = elegidos.slice(0, cupo);
    const optimizadas: string[] = [];
    let motivo = "";

    for (const archivo of paraSubir) {
      // Revisamos el archivo y después lo achicamos antes de guardarlo
      const errorArchivo = validarImagenHotel(archivo);
      if (errorArchivo) {
        motivo = errorArchivo;
        continue;
      }
      const resultado = await optimizarFoto(archivo);
      if (resultado.error || !resultado.foto) {
        motivo = resultado.error ?? "No se pudo procesar la imagen.";
        continue;
      }
      optimizadas.push(resultado.foto);
    }

    if (optimizadas.length > 0) {
      const guardado = agregarFotosHotel(HOTEL_ID, optimizadas);
      if (guardado.error) motivo = guardado.error;
      else avisar(`Subimos ${optimizadas.length} ${optimizadas.length === 1 ? "foto" : "fotos"} a tu galería.`, "ok");
    }

    // Si eligió más de las que entran, quedan afuera y lo decimos
    if (elegidos.length > cupo) {
      motivo = motivo || `Solo entran ${cupo} fotos más: el máximo es ${MAXIMO_FOTOS} por hotel.`;
    }

    setErrorFoto(motivo);
    setSubiendo(false);
  };

  // Mueve una foto al primer lugar: esa pasa a ser la portada (HU-025)
  const usarComoPortada = (indice: number) => {
    const resultado = ponerPortadaHotel(HOTEL_ID, indice);
    if (resultado.error) {
      avisar(resultado.error, "error");
      return;
    }
    avisar("Listo: esa foto es ahora la portada del hotel.", "ok");
  };

  // Quita una foto de la galería (HU-025)
  const quitarFoto = (indice: number) => {
    const resultado = quitarFotoHotel(HOTEL_ID, indice);
    if (resultado.error) {
      avisar(resultado.error, "error");
      return;
    }
    avisar("Foto quitada de la galería.", "info");
  };

  // Guarda el precio escrito en la tarjeta de una habitación (HU-024)
  const guardarPrecio = (h: Habitacion) => {
    const escrito = borradorDe(h);
    const resultado = cambiarPrecioHabitacion(h.id, Number(escrito));
    if (resultado.error) {
      setErroresPrecio((e) => ({ ...e, [h.id]: resultado.error as string }));
      avisar("Ese precio no se puede guardar: revisá el valor.", "error");
      return;
    }

    // Sin borrador, el campo vuelve a mostrar el precio que quedó guardado
    setBorradores((b) => {
      const copia = { ...b };
      delete copia[h.id];
      return copia;
    });
    setErroresPrecio((e) => {
      const copia = { ...e };
      delete copia[h.id];
      return copia;
    });
    avisar(`Listo: ${h.tipo} queda en ${fmtDinero(Number(escrito))} por noche.`, "ok");
  };

  // Aplica el ajuste de temporada a todas las habitaciones del hotel (HU-024)
  const aplicarTemporada = () => {
    const resultado = ajustarPreciosDelHotel(HOTEL_ID, ajusteElegido);
    if (resultado.error) {
      setErrorAjuste(resultado.error);
      avisar("No se aplicó el ajuste: revisá el porcentaje.", "error");
      return;
    }

    setErrorAjuste("");
    setBorradores({}); // los borradores viejos ya no sirven con las tarifas nuevas
    const cuantas = resultado.cantidad ?? 0;
    avisar(`Ajuste aplicado a ${cuantas} ${cuantas === 1 ? "habitación" : "habitaciones"}.`, "ok");
  };

  // Indicadores del tablero (fórmulas de la guía de negocio)
  const pendientes = delHotel.filter((r) => r.estado === "pendiente").length;
  const confirmadas = delHotel.filter((r) => r.estado === "confirmada").length;
  const checkinsHoy = delHotel.filter((r) => r.estado === "confirmada" && r.llegada <= hoy).length;
  const checkoutsHoy = delHotel.filter((r) => r.estado === "checkin" && r.salida <= hoy).length;

  // % Ocupación = (unidades ocupadas hoy ÷ total de unidades) × 100
  const ocupadasHoy = delHotel.filter((r) => r.estado === "checkin").length;
  const totalUnidades = habitaciones.reduce((acc, h) => acc + h.unidades, 0);
  const ocupacion = Math.round((ocupadasHoy / totalUnidades) * 100);

  // Ingresos = suma de totales de reservas no canceladas
  const ingresos = delHotel.filter((r) => r.estado !== "cancelada").reduce((acc, r) => acc + r.total, 0);

  // Acciones con sus reglas de negocio
  // Antes de actuar revisamos que la reserva siga pendiente y sea de este hotel (HU-027)
  const sePuedeActuar = (r: Reserva) => {
    if (r.hotelId !== HOTEL_ID) {
      avisar("Esa reserva no pertenece a tu hotel.", "error");
      return false;
    }
    if (r.estado !== "pendiente") {
      avisar(`La reserva ${r.folio} ya no está pendiente: su estado es ${ETIQUETA_ESTADO[r.estado]}.`, "error");
      return false;
    }
    return true;
  };

  const confirmar = (r: Reserva) => {
    if (!sePuedeActuar(r)) return;
    cambiarEstadoReserva(r.folio, "confirmada");
    avisar(`Reserva ${r.folio} confirmada. El turista ya puede verla como Confirmada.`, "ok");
  };

  // Abre el modal donde el hotelero escribe por qué rechaza (HU-027)
  const abrirRechazo = (r: Reserva) => {
    if (!sePuedeActuar(r)) return;
    setMotivoRechazo("");
    setErrorMotivo("");
    setPorRechazar(r);
  };

  // Aplica el rechazo con el motivo escrito: la reserva queda cancelada
  const confirmarRechazo = () => {
    if (!porRechazar) return;
    const motivo = motivoRechazo.trim();
    if (motivo.length < 3) {
      setErrorMotivo("Escribí el motivo del rechazo: el turista lo va a leer.");
      return;
    }
    if (!sePuedeActuar(porRechazar)) {
      setPorRechazar(null);
      return;
    }
    cambiarEstadoReserva(porRechazar.folio, "cancelada", motivo);
    avisar(`Reserva ${porRechazar.folio} rechazada. El turista verá el motivo que escribiste.`, "error");
    setPorRechazar(null);
    setMotivoRechazo("");
  };

  const cancelar = (r: Reserva) => {
    cambiarEstadoReserva(r.folio, "cancelada");
    avisar(`Reserva ${r.folio} cancelada por el hotel.`, "error");
  };
  // El check-in solo se registra sobre una reserva activa: confirmada,
  // de este hotel y con la llegada ya cumplida (HU-028)
  const sePuedeCheckin = (r: Reserva) => {
    if (r.hotelId !== HOTEL_ID) {
      avisar("Esa reserva no pertenece a tu hotel.", "error");
      return false;
    }
    if (r.estado !== "confirmada") {
      avisar(`La reserva ${r.folio} no está confirmada: su estado es ${ETIQUETA_ESTADO[r.estado]}.`, "error");
      return false;
    }
    if (r.llegada > hoy) {
      avisar(`El check-in de ${r.folio} se habilita el ${fmtFecha(r.llegada)}.`, "error");
      return false;
    }
    return true;
  };

  const checkIn = (r: Reserva) => {
    if (!sePuedeCheckin(r)) return;
    const entrada = registrarCheckin(r.folio);
    avisar(`Check-in registrado para ${r.turista} (${r.folio}) · entrada ${fmtFechaHora(entrada)}.`, "ok");
  };
  // El check-out solo se registra sobre un huésped que está en estadía (HU-029)
  const sePuedeCheckOut = (r: Reserva) => {
    if (r.hotelId !== HOTEL_ID) {
      avisar("Esa reserva no pertenece a tu hotel.", "error");
      return false;
    }
    if (r.estado !== "checkin") {
      avisar(`La reserva ${r.folio} no está en estadía: su estado es ${ETIQUETA_ESTADO[r.estado]}.`, "error");
      return false;
    }
    return true;
  };

  // Descarga la factura de una estadía cerrada, con su pago si lo hay
  const descargarFacturaDe = (r: Reserva) => {
    const hab = habitaciones.find((h) => h.id === r.habitacionId);
    const pago = pagos.find((p) => p.folio === r.folio);
    descargarFactura(r, hotel.nombre, hab?.tipo ?? "", pago);
  };

  const checkOut = (r: Reserva) => {
    if (!sePuedeCheckOut(r)) return;
    const salida = registrarCheckout(r.folio);
    // La factura se arma con la reserva ya cerrada para que figure como Completada
    descargarFacturaDe({ ...r, estado: "completada", checkoutEn: salida });
    avisar(`Check-out registrado para ${r.turista} (${r.folio}) · salida ${fmtFechaHora(salida)}. Se descargó la factura.`, "ok");
  };

  const stats = [
    { t: "Reservas pendientes", v: pendientes, icono: <IconoCalendario size={19} />, color: "bg-accent-light text-accent-dark" },
    { t: "Confirmadas", v: confirmadas, icono: <IconoCheck size={19} />, color: "bg-[#DBEAFE] text-[#1D4ED8]" },
    { t: "Check-ins por hacer", v: checkinsHoy, icono: <IconoEntrada size={19} />, color: "bg-primary-light text-primary" },
    { t: "Check-outs de hoy", v: checkoutsHoy, icono: <IconoSalida size={19} />, color: "bg-[#DCFCE7] text-[#166534]" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6">
      {/* Portada del hotel: su propia foto con overlay oscuro — panel rol Hotel */}
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl shadow-lift">
          {/* Foto del hotel de fondo */}
          <img
            src={hotel.imagen}
            alt={`Foto de ${hotel.nombre}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Capa oscura para que el texto se lea bien */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07242C]/90 via-[#07242C]/70 to-[#B45309]/40" />
          <span className="dot-texture-light absolute inset-0 opacity-30" />

          <div className="relative flex flex-wrap items-center justify-between gap-5 p-7 sm:p-9">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm"><IconoHotel size={28} /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Panel del hotel · Rol Hotel</p>
                <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{hotel.nombre}</h1>
                <p className="mt-0.5 text-sm text-white/80">{municipio}, {departamento} · atendido por {hotel.dueno}</p>
                {/* Estrellas si el hotel ya tiene calificaciones */}
                {hotel.rating > 0 && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-accent">
                    <IconoEstrella llena size={13} />
                    {hotel.rating.toFixed(1)} · {hotel.totalResenas} reseña{hotel.totalResenas === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-white/12 px-5 py-3.5 text-right backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200">Ingresos estimados</p>
              <p className="font-display text-2xl font-extrabold text-white">{fmtDinero(ingresos)}</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Aviso obligatorio: cambiar la contraseña temporal en 24 horas */}
      {passwordTemporal && (
        <Reveal delay={20}>
          <div className={`mt-5 rounded-xl border-2 p-5 shadow-card ${passwordVencida ? "border-[#FCA5A5] bg-[#FEF2F2]" : "border-[#FCD34D] bg-[#FEF3C7]"}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <p className={`text-sm font-bold ${passwordVencida ? "text-[#B91C1C]" : "text-[#92400E]"}`}>
                  {passwordVencida
                    ? "Tu contraseña temporal ya venció (24 horas)."
                    : "Cambiá tu contraseña temporal: tienes 24 horas."}
                </p>
                <p className={`mt-1 text-xs leading-relaxed ${passwordVencida ? "text-[#B91C1C]/80" : "text-[#92400E]/80"}`}>
                  La contraseña que te dio el administrador es débil y solo dura 24 horas por seguridad.
                  Creá la tuya propia (mínimo 6 caracteres) para seguir usando el panel y tus reservas.
                </p>
              </div>
            </div>
            <form onSubmit={guardarPassword} className="mt-4 grid max-w-md gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#92400E]">Nueva contraseña</span>
                <input
                  type="password"
                  value={nuevaPass}
                  onChange={(e) => setNuevaPass(e.target.value)}
                  minLength={6}
                  maxLength={40}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#92400E]">Confirmar contraseña</span>
                <input
                  type="password"
                  value={confirmaPass}
                  onChange={(e) => setConfirmaPass(e.target.value)}
                  minLength={6}
                  maxLength={40}
                  placeholder="Repetí la contraseña"
                  className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25"
                />
              </label>
              {errorPass && (
                <p role="alert" className="anim-pop text-xs font-semibold text-[#B91C1C] sm:col-span-2">{errorPass}</p>
              )}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-accent-dark active:scale-[0.97]"
                >
                  <IconoCheck size={14} />
                  Guardar mi contraseña
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      )}

      {/* Estado del hotel ante la plataforma */}
      <Reveal delay={40}>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-5 py-4 shadow-card">
          <p className="text-sm text-muted">
            Tu hotel está <b className="text-ink">visible para los turistas</b> porque un administrador aprobó tu inscripción.
          </p>
          <BadgeHotel estado={hotel.aprobado} />
        </div>
      </Reveal>

      {/* ===== Información del hotel y edición (HU-022) ===== */}
      <Reveal delay={80}>
        <div className="mt-5 rounded-xl border border-line bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <span className="flex items-center gap-2 text-sm font-bold text-ink">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hotel-soft text-hotel"><IconoHotel size={17} /></span>
                Información del hotel
              </span>
              <p className="mt-2 text-sm leading-relaxed text-muted">{hotel.descripcion}</p>
              <p className="mt-2 text-xs text-muted">
                {hotel.direccion} · {municipio}, {departamento}
                {hotel.contacto && ` · Tel: ${hotel.contacto}`}
              </p>
            </div>
            {edicionBloqueada ? (
              <span
                className="cursor-not-allowed rounded-lg bg-line/60 px-4 py-2 text-xs font-bold text-muted"
                title="Esperá a que un administrador apruebe tu hotel para editar su información"
              >
                Editar información (en revisión)
              </span>
            ) : (
              <button
                onClick={() => (editando ? setEditando(false) : abrirEdicion())}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
              >
                <IconoLapiz size={14} />
                {editando ? "Cerrar edición" : "Editar información"}
              </button>
            )}
          </div>

          {/* Formulario de edición con los datos actuales precargados */}
          {editando && formEdicion && (
            <form onSubmit={guardarEdicion} noValidate className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
              {editadoEnviado && Object.values(erroresEdicion).some(Boolean) && (
                <p role="alert" className="anim-pop rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C] sm:col-span-2">
                  Revisá los campos marcados: no se guardaron los cambios.
                </p>
              )}

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Nombre del hotel</span>
                <input
                  type="text"
                  value={formEdicion.nombre}
                  onChange={(e) => cambiarCampoEdicion("nombre", e.target.value)}
                  maxLength={60}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${
                    erroresEdicion.nombre ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25" : "border-line focus:border-primary focus:ring-primary/25"
                  }`}
                />
                {erroresEdicion.nombre && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresEdicion.nombre}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Departamento</span>
                <select
                  value={formEdicion.departamentoId}
                  onChange={(e) => cambiarDepartamentoEdicion(e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${
                    erroresEdicion.departamentoId ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25" : "border-line focus:border-primary focus:ring-primary/25"
                  }`}
                >
                  <option value="">Elegí un departamento</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
                {erroresEdicion.departamentoId && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresEdicion.departamentoId}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Municipio</span>
                <select
                  value={formEdicion.municipioId}
                  onChange={(e) => cambiarMunicipioEdicion(e.target.value)}
                  disabled={!formEdicion.departamentoId}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted ${
                    erroresEdicion.municipioId ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25" : "border-line focus:border-primary focus:ring-primary/25"
                  }`}
                >
                  <option value="">
                    {formEdicion.departamentoId ? "Elegí un municipio" : "Elegí primero el departamento"}
                  </option>
                  {municipiosDelDepto.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
                {erroresEdicion.municipioId && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresEdicion.municipioId}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Dirección</span>
                <input
                  type="text"
                  value={formEdicion.direccion}
                  onChange={(e) => cambiarCampoEdicion("direccion", e.target.value)}
                  maxLength={120}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${
                    erroresEdicion.direccion ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25" : "border-line focus:border-primary focus:ring-primary/25"
                  }`}
                />
                {erroresEdicion.direccion && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresEdicion.direccion}</p>
                )}
              </label>

              {/* Ubicación exacta en el mapa (HU-037): misma lógica que la inscripción */}
              <div className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Ubicación exacta</span>
                <p className="mb-2 text-[11px] text-muted">
                  Hacé clic en el mapa para dejar el pin en la entrada de tu hotel (o arrastralo para afinarlo).
                </p>
                <div className={erroresEdicion.ubicacion ? "rounded-xl border border-[#FCA5A5]" : ""}>
                  <MapaHotel
                    variante="selector"
                    nombre={hotel.nombre}
                    punto={formEdicion.ubicacion}
                    centro={MUNICIPIOS.find((m) => m.id === formEdicion.municipioId)?.centro ?? null}
                    zoom={13}
                    altura="h-72"
                    alCambiar={(p) => {
                      setFormEdicion((f) => (f ? { ...f, ubicacion: p } : f));
                      setErroresEdicion((e) => ({ ...e, ubicacion: undefined }));
                    }}
                  />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                  {formEdicion.ubicacion ? (
                    <span className="tabular-nums">
                      Latitud {formEdicion.ubicacion.lat.toFixed(4)} · Longitud {formEdicion.ubicacion.lng.toFixed(4)}
                    </span>
                  ) : (
                    "Sin marcar: elegí un municipio para empezar."
                  )}
                </p>
                {erroresEdicion.ubicacion && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresEdicion.ubicacion}</p>
                )}
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Teléfono (opcional)</span>
                <input
                  type="tel"
                  value={formEdicion.telefono}
                  onChange={(e) => cambiarCampoEdicion("telefono", soloDigitosTelefono(e.target.value))}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={8}
                  placeholder="Ej: 88881234"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${
                    erroresEdicion.telefono ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25" : "border-line focus:border-primary focus:ring-primary/25"
                  }`}
                />
                <p className="mt-1 text-[11px] text-muted">8 dígitos, empezando por 2, 5, 7 u 8.</p>
                {erroresEdicion.telefono && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresEdicion.telefono}</p>
                )}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Descripción</span>
                <textarea
                  value={formEdicion.descripcion}
                  onChange={(e) => cambiarCampoEdicion("descripcion", e.target.value)}
                  maxLength={600}
                  rows={4}
                  className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${
                    erroresEdicion.descripcion ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25" : "border-line focus:border-primary focus:ring-primary/25"
                  }`}
                />
                <p className="mt-1 text-[11px] text-muted">{formEdicion.descripcion.length}/600 caracteres (mínimo 30).</p>
                {erroresEdicion.descripcion && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresEdicion.descripcion}</p>
                )}
              </label>

              <div className="flex justify-end gap-3 border-t border-line pt-5 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="rounded-lg border border-line px-5 py-2.5 text-sm font-bold text-muted transition-colors hover:bg-canvas"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-dark active:scale-[0.97]"
                >
                  <IconoCheck size={15} />
                  Guardar cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </Reveal>

      {/* Tarjetas de resumen */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.t} delay={i * 80}>
            <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 shadow-card transition-transform hover:-translate-y-1">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>{s.icono}</span>
              <div>
                <p className="font-display text-2xl font-extrabold leading-none text-ink">{s.v}</p>
                <p className="mt-1 text-xs font-semibold text-muted">{s.t}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Barra de ocupación */}
      <Reveal delay={150}>
        <div className="mt-5 rounded-xl border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-sm font-bold text-ink">
            <span className="flex items-center gap-2"><IconoGrafica size={16} className="text-hotel" /> Ocupación actual</span>
            <span className="font-display text-lg text-hotel">{ocupacion}%</span>
          </div>
          <div className="mt-3 h-3.5 overflow-hidden rounded-full bg-canvas">
            <div className="anim-grow h-full rounded-full bg-gradient-to-r from-hotel to-accent" style={{ width: `${ocupacion}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {ocupadasHoy} de {totalUnidades} unidades ocupadas hoy · Ocupación = (ocupadas ÷ total) × 100
          </p>
        </div>
      </Reveal>

      {/* ===== Avisos del hotel (HU-016) ===== */}
      <Reveal delay={200}>
        <div className="mt-5 rounded-xl border border-line bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-bold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7] text-hotel"><IconoCampana size={17} /></span>
              Avisos recientes
              {avisosSinLeer > 0 && (
                <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white">{avisosSinLeer}</span>
              )}
            </span>
            {avisosSinLeer > 0 && (
              <button
                onClick={() => marcarNotificacionesLeidas(HOTEL_ID)}
                className="text-xs font-bold text-hotel underline-offset-2 hover:underline"
              >
                Marcar como leídos
              </button>
            )}
          </div>

          {avisos.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Todavía no hay avisos. Cuando un turista cancele una reserva va a aparecer aquí.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {avisos.map((n) => (
                <li
                  key={n.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-sm ${
                    n.leida ? "border-line bg-white" : "border-[#FCD34D] bg-[#FEF3C7]"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    <IconoCampana size={15} className={n.leida ? "text-muted" : "text-hotel"} />
                    {n.texto}
                  </span>
                  <span className="text-xs text-muted">{fmtFecha(n.fecha)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

      {/* ===== Gestión de reservas (HU-027 / HU-028 / HU-029) ===== */}
      <section className="mt-12">
        <Reveal>
          <TituloSeccion ceja="Flujo: Pendiente → Confirmada → Check-in → Completada" titulo="Gestión de reservas" />
        </Reveal>
        {/* En escritorio mostramos la tabla completa */}
        <Reveal delay={100}>
          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-line bg-white shadow-card lg:block">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-[#FEF3C7] text-[11px] font-bold uppercase tracking-wider text-[#92400E]">
                  <th className="px-4 py-3.5">Folio</th>
                  <th className="px-4 py-3.5">Turista</th>
                  <th className="px-4 py-3.5">Habitación</th>
                  <th className="px-4 py-3.5">Llegada</th>
                  <th className="px-4 py-3.5">Salida</th>
                  <th className="px-4 py-3.5">Huésp.</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {delHotel.map((r, i) => {
                  const hab = habitaciones.find((h) => h.id === r.habitacionId);
                  return (
                    <tr key={r.folio} className={`border-b border-line/70 transition-colors last:border-0 hover:bg-canvas ${i % 2 === 1 ? "bg-canvas/50" : ""}`}>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary-dark">{r.folio}</td>
                      <td className="px-4 py-3.5 font-semibold text-ink">{r.turista}</td>
                      <td className="px-4 py-3.5 text-muted">{hab?.tipo}</td>
                      <td className="px-4 py-3.5 text-muted">{fmtFecha(r.llegada)}</td>
                      <td className="px-4 py-3.5 text-muted">{fmtFecha(r.salida)}</td>
                      <td className="px-4 py-3.5 text-muted">{r.huespedes}</td>
                      <td className="px-4 py-3.5 font-semibold text-ink">{fmtDinero(r.total)}</td>
                      <td className="px-4 py-3.5">
                        <BadgeEstado estado={r.estado} />
                        {/* Sello con la hora de la entrada registrada (HU-028) */}
                        {r.checkinEn && (
                          <span className="mt-1 block text-[11px] font-semibold text-muted">Entrada {fmtFechaHora(r.checkinEn)}</span>
                        )}
                        {/* Sello con la hora de la salida registrada (HU-029) */}
                        {r.checkoutEn && (
                          <span className="mt-0.5 block text-[11px] font-semibold text-muted">Salida {fmtFechaHora(r.checkoutEn)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-1.5">{accionesDe(r)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* En celular, una tarjeta por reserva con los datos y las acciones a la vista */}
        <div className="mt-6 grid gap-3 lg:hidden">
          {delHotel.map((r) => {
            const hab = habitaciones.find((h) => h.id === r.habitacionId);
            return (
              <Reveal key={r.folio}>
                <div className="rounded-xl border border-line bg-white p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-primary-dark">{r.folio}</p>
                      <p className="mt-0.5 font-display text-base font-bold text-ink">{r.turista}</p>
                    </div>
                    <BadgeEstado estado={r.estado} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Habitación</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-ink">{hab?.tipo}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Huéspedes</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-ink">{r.huespedes}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Llegada</dt>
                      <dd className="mt-0.5 text-sm text-muted">{fmtFecha(r.llegada)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Salida</dt>
                      <dd className="mt-0.5 text-sm text-muted">{fmtFecha(r.salida)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Total</dt>
                      <dd className="mt-0.5 text-sm font-bold text-ink">{fmtDinero(r.total)}</dd>
                    </div>
                    {/* La hora de la entrada, si el hotel ya la registró (HU-028) */}
                    {r.checkinEn && (
                      <div className="col-span-2">
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Entrada</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-ink">{fmtFechaHora(r.checkinEn)}</dd>
                      </div>
                    )}
                    {/* La hora de la salida, si la estadía ya se cerró (HU-029) */}
                    {r.checkoutEn && (
                      <div className="col-span-2">
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Salida</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-ink">{fmtFechaHora(r.checkoutEn)}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-3.5 flex flex-wrap justify-end gap-1.5 border-t border-line pt-3">
                    {accionesDe(r)}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== Habitaciones del hotel (HU-023) ===== */}
      <section className="mt-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <TituloSeccion ceja="Inventario" titulo="Habitaciones del hotel" />
            {edicionBloqueada ? (
              <span
                className="cursor-not-allowed rounded-lg bg-line/60 px-4 py-2 text-xs font-bold text-muted"
                title="Esperá a que un administrador apruebe tu hotel para registrar habitaciones"
              >
                Registrar habitación (en revisión)
              </span>
            ) : (
              <button
                onClick={() => setRegistrando((v) => !v)}
                className="flex items-center gap-2 rounded-lg bg-hotel px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
              >
                <IconoCama size={14} />
                {registrando ? "Cerrar formulario" : "Registrar habitación"}
              </button>
            )}
          </div>
        </Reveal>

        {/* Formulario para dar de alta un tipo de habitación */}
        {registrando && (
          <Reveal>
            <form onSubmit={guardarHabitacion} noValidate className="mt-5 grid gap-5 rounded-xl border border-line bg-white p-5 shadow-card sm:grid-cols-2">
              {habitacionEnviada && Object.values(erroresHabitacion).some(Boolean) && (
                <p role="alert" className="anim-pop rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C] sm:col-span-2">
                  Revisá los campos marcados: la habitación no se registró.
                </p>
              )}

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Tipo de habitación</span>
                <input
                  type="text"
                  value={formHabitacion.tipo}
                  onChange={(e) => cambiarCampoHabitacion("tipo", e.target.value)}
                  maxLength={40}
                  placeholder="Estándar Doble"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${bordeHabitacion("tipo")}`}
                />
                {erroresHabitacion.tipo && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresHabitacion.tipo}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Capacidad (huéspedes)</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formHabitacion.capacidad}
                  onChange={(e) => cambiarCampoHabitacion("capacidad", Number(e.target.value))}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${bordeHabitacion("capacidad")}`}
                />
                {erroresHabitacion.capacidad && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresHabitacion.capacidad}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Unidades de este tipo</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formHabitacion.unidades}
                  onChange={(e) => cambiarCampoHabitacion("unidades", Number(e.target.value))}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${bordeHabitacion("unidades")}`}
                />
                {erroresHabitacion.unidades && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresHabitacion.unidades}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Precio por noche (C$)</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={formHabitacion.precio}
                  onChange={(e) => cambiarCampoHabitacion("precio", Number(e.target.value))}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${bordeHabitacion("precio")}`}
                />
                {erroresHabitacion.precio && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresHabitacion.precio}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Estado inicial</span>
                <select
                  value={formHabitacion.estado}
                  onChange={(e) => cambiarCampoHabitacion("estado", e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${bordeHabitacion("estado")}`}
                >
                  {ESTADOS_HABITACION.map((es) => (
                    <option key={es} value={es}>{ETIQUETA_HABITACION[es]}</option>
                  ))}
                </select>
                {erroresHabitacion.estado && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresHabitacion.estado}</p>
                )}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Descripción para el turista</span>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={formHabitacion.detalle}
                  onChange={(e) => cambiarCampoHabitacion("detalle", e.target.value)}
                  placeholder="Cama doble, baño privado y vista al patio de las buganvilias."
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${bordeHabitacion("detalle")}`}
                />
                <span className="mt-1 block text-[11px] font-semibold text-muted">
                  {formHabitacion.detalle.length}/200 caracteres (mínimo 15).
                </span>
                {erroresHabitacion.detalle && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresHabitacion.detalle}</p>
                )}
              </label>

              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-hotel px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                >
                  <IconoCheck size={15} /> Registrar habitación
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegistrando(false);
                    setFormHabitacion(HABITACION_VACIA);
                    setErroresHabitacion({});
                    setHabitacionEnviada(false);
                  }}
                  className="rounded-lg border border-line px-5 py-2.5 text-sm font-bold text-muted transition-colors hover:border-primary/40"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </Reveal>
        )}

        {habitaciones.length === 0 && (
          <p className="mt-6 rounded-xl border border-dashed border-line bg-white px-5 py-8 text-center text-sm font-semibold text-muted">
            Todavía no registraste habitaciones. Usá "Registrar habitación" para que los turistas puedan reservarlas.
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {habitaciones.map((h, i) => {
            // Unidades ocupadas ahora mismo (reservas en estado Check-in)
            const ocupadas = reservas.filter((r) => r.habitacionId === h.id && r.estado === "checkin").length;
            return (
              <Reveal key={h.id} delay={i * 80}>
                <div className="rounded-xl border border-line bg-white p-5 shadow-card transition-transform hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-hotel-soft text-hotel"><IconoCama size={20} /></span>
                    <BadgeHabitacion estado={h.estado} />
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold text-ink">{h.tipo}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted"><IconoHuespedes size={12} /> Capacidad: {h.capacidad} · {h.unidades} unidades</p>
                  <div className="mt-3.5">
                    <div className="flex justify-between text-[11px] font-bold text-muted">
                      <span>Ocupadas hoy</span><span className="text-hotel">{ocupadas}/{h.unidades}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas">
                      <div className="anim-grow h-full rounded-full bg-hotel" style={{ width: `${(ocupadas / h.unidades) * 100}%` }} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-bold text-primary">{fmtDinero(h.precio)} <span className="text-[11px] font-medium text-muted">/ noche</span></p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{h.detalle}</p>

                  {/* Cambiar la disponibilidad de un tipo de habitación (HU-023) */}
                  <label className="mt-3.5 block">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Cambiar estado</span>
                    <select
                      value={h.estado}
                      disabled={edicionBloqueada}
                      onChange={(e) => {
                        const nuevo = e.target.value as EstadoHabitacion;
                        cambiarEstadoHabitacion(h.id, nuevo);
                        avisar(`${h.tipo}: ahora está "${ETIQUETA_HABITACION[nuevo]}".`, "info");
                      }}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-ink outline-none transition-all focus:border-hotel focus:ring-2 focus:ring-hotel/25 disabled:cursor-not-allowed disabled:bg-canvas"
                    >
                      {ESTADOS_HABITACION.map((es) => (
                        <option key={es} value={es}>{ETIQUETA_HABITACION[es]}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== Precios del hotel (HU-024) ===== */}
      <section className="mt-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <TituloSeccion ceja="Tarifas" titulo="Precios del hotel" />
            {habitaciones.length > 0 && (
              <span className="rounded-lg bg-hotel-soft px-3.5 py-2 text-xs font-bold text-hotel tabular-nums">
                Tus noches van de {fmtDinero(rangoActual.min)} a {fmtDinero(rangoActual.max)}
              </span>
            )}
          </div>
        </Reveal>

        {habitaciones.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-line bg-white px-5 py-8 text-center text-sm font-semibold text-muted">
            Todavía no hay precios que configurar: registrá primero un tipo de habitación.
          </p>
        ) : (
          <>
            {edicionBloqueada && (
              <p className="mt-5 rounded-xl border border-[#FCD34D] bg-hotel-soft px-4 py-3 text-xs font-semibold text-[#92400E]">
                Tu hotel está en revisión: cuando el administrador lo apruebe vas a poder cambiar tus precios.
              </p>
            )}

            {/* Ajuste de temporada: cambia todas las tarifas de una sola vez */}
            <Reveal>
              <div className="mt-5 rounded-xl border border-line bg-white p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-light text-accent-dark"><IconoBillete size={18} /></span>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">Ajuste por temporada</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">
                      Subí o bajá todas las tarifas de una vez. Con este ajuste tus noches quedarían de {fmtDinero(rangoConAjuste.min)} a {fmtDinero(rangoConAjuste.max)}.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Temporada</span>
                    <select
                      value={temporada}
                      disabled={edicionBloqueada}
                      onChange={(e) => {
                        setTemporada(e.target.value);
                        setErrorAjuste("");
                      }}
                      className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:border-hotel focus:ring-2 focus:ring-hotel/25 disabled:cursor-not-allowed disabled:bg-canvas"
                    >
                      {TEMPORADAS.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                      <option value="propio">Ajuste propio</option>
                    </select>
                  </label>

                  {temporada === "propio" && (
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Ajuste (%)</span>
                      <input
                        type="number"
                        min={-50}
                        max={100}
                        step={5}
                        value={ajustePropio}
                        disabled={edicionBloqueada}
                        onChange={(e) => {
                          setAjustePropio(e.target.value);
                          setErrorAjuste("");
                        }}
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 disabled:cursor-not-allowed disabled:bg-canvas ${errorAjuste ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25" : "border-line focus:border-hotel focus:ring-hotel/25"}`}
                      />
                      <span className="mt-1 block text-[11px] font-semibold text-muted">Entre −50 % y +100 %.</span>
                    </label>
                  )}

                  <button
                    onClick={aplicarTemporada}
                    disabled={edicionBloqueada}
                    className="flex items-center justify-center gap-2 rounded-lg bg-hotel px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconoGrafica size={15} /> Aplicar a todas
                  </button>
                </div>

                {errorAjuste && (
                  <p role="alert" className="mt-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-semibold text-[#B91C1C]">
                    {errorAjuste}
                  </p>
                )}
              </div>
            </Reveal>

            {/* Una tarjeta por tipo de habitación, con su precio editable */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {habitaciones.map((h, i) => {
                // Total por noche que paga el turista, con la fórmula oficial
                const { iva, total } = calcularTotales(h.precio, 1);
                const sinGuardar = borradorDe(h) !== String(h.precio);
                return (
                  <Reveal key={h.id} delay={i * 80}>
                    <div className="flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-base font-bold text-ink">{h.tipo}</h3>
                          <p className="mt-0.5 text-xs text-muted">Capacidad: {h.capacidad} · {h.unidades} unidades</p>
                        </div>
                        <BadgeHabitacion estado={h.estado} />
                      </div>

                      <p className="mt-3.5 text-xs font-semibold text-muted">
                        El turista paga{" "}
                        <span className="font-display text-base font-bold text-hotel tabular-nums">{fmtDinero(total)}</span> por noche
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-muted tabular-nums">
                        {fmtDinero(h.precio)} + {fmtDinero(iva)} de IVA {Math.round(TASA_IVA * 100)} %
                      </p>

                      <label className="mt-3.5 block">
                        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Precio por noche (C$)</span>
                        <input
                          type="number"
                          min={1}
                          step={50}
                          value={borradorDe(h)}
                          disabled={edicionBloqueada}
                          onChange={(e) => {
                            setBorradores((b) => ({ ...b, [h.id]: e.target.value }));
                            setErroresPrecio((er) => (er[h.id] ? { ...er, [h.id]: "" } : er));
                          }}
                          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 disabled:cursor-not-allowed disabled:bg-canvas ${erroresPrecio[h.id] ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25" : "border-line focus:border-hotel focus:ring-hotel/25"}`}
                        />
                        {erroresPrecio[h.id] && (
                          <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{erroresPrecio[h.id]}</p>
                        )}
                      </label>

                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3.5">
                        <button
                          onClick={() => guardarPrecio(h)}
                          disabled={edicionBloqueada || !sinGuardar}
                          className="flex items-center gap-1.5 rounded-md bg-hotel px-3.5 py-2 text-[11px] font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-line/60 disabled:text-muted"
                        >
                          <IconoCheck size={13} /> Guardar precio
                        </button>
                        {sinGuardar && !edicionBloqueada && (
                          <button
                            onClick={() =>
                              setBorradores((b) => {
                                const copia = { ...b };
                                delete copia[h.id];
                                return copia;
                              })
                            }
                            className="rounded-md border border-line px-3 py-2 text-[11px] font-bold text-muted transition-colors hover:border-primary/40"
                          >
                            Deshacer
                          </button>
                        )}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <p className="mt-4 rounded-xl border border-line bg-white px-4 py-3 text-xs font-semibold text-muted">
              Las reservas que ya te hicieron conservan el precio con el que se crearon: los cambios se aplican a las reservas nuevas.
            </p>
          </>
        )}
      </section>

      {/* ===== Fotografías del hotel (HU-025) ===== */}
      <section className="mt-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <TituloSeccion ceja="Galería" titulo="Fotografías del hotel" />
            <span className="rounded-lg bg-hotel-soft px-3.5 py-2 text-xs font-bold text-hotel tabular-nums">
              {galeria.length} de {MAXIMO_FOTOS} fotos
            </span>
          </div>
        </Reveal>

        {edicionBloqueada && (
          <p className="mt-5 rounded-xl border border-[#FCD34D] bg-hotel-soft px-4 py-3 text-xs font-semibold text-[#92400E]">
            Tu hotel está en revisión: cuando el administrador lo apruebe vas a poder subir y ordenar tus fotos.
          </p>
        )}

        <Reveal>
          <div className="mt-5 grid gap-5 rounded-xl border border-line bg-white p-5 shadow-card lg:grid-cols-[1.15fr_1fr]">
            {/* La portada es la primera foto de la galería */}
            <div>
              <span className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                <IconoFoto size={13} /> Portada (la primera foto)
              </span>
              <div className="overflow-hidden rounded-xl border border-line">
                <img src={portada} alt={`Portada de ${hotel.nombre}`} className="h-52 w-full object-cover sm:h-64" />
              </div>
              <p className="mt-2 text-xs font-medium text-muted">
                Es la foto que ve el turista en los resultados de búsqueda y la que abre tu panel.
              </p>
            </div>

            {/* Subida de fotos nuevas */}
            <div className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Subir fotos</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  disabled={edicionBloqueada || subiendo}
                  onChange={elegirFotos}
                  className={`block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent-light file:px-4 file:py-2 file:text-xs file:font-bold file:text-hotel transition-colors hover:file:bg-accent hover:file:text-white disabled:cursor-not-allowed disabled:opacity-60 ${errorFoto ? "rounded-lg border border-[#FCA5A5] p-2" : ""}`}
                />
              </label>
              <p className="text-[11px] font-semibold leading-relaxed text-muted">
                JPG, PNG o WEBP de hasta 5 MB. Las fotos se achican antes de guardarse: entran hasta {MAXIMO_FOTOS} por hotel
                {cupoDeFotos(galeria.length) > 0 && ` y te quedan ${cupoDeFotos(galeria.length)} lugares libres.`}
              </p>
              {subiendo && <p className="text-xs font-semibold text-hotel">Optimizando las fotos…</p>}
              {errorFoto && (
                <p role="alert" className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-semibold text-[#B91C1C]">
                  {errorFoto}
                </p>
              )}
            </div>
          </div>
        </Reveal>

        {/* Miniaturas: cambiar de portada o quitar una foto */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {galeria.map((f, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
              <img src={f} alt={`Foto ${i + 1} de ${hotel.nombre}`} className="h-24 w-full object-cover sm:h-28" />
              <div className="p-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted tabular-nums">
                  {etiquetaFoto(i, f)}
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {i !== 0 && (
                    <button
                      onClick={() => usarComoPortada(i)}
                      disabled={edicionBloqueada}
                      className="rounded-md bg-hotel px-2.5 py-1.5 text-[11px] font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-line/60 disabled:text-muted"
                    >
                      Usar como portada
                    </button>
                  )}
                  <button
                    onClick={() => quitarFoto(i)}
                    disabled={edicionBloqueada}
                    className="rounded-md border border-danger/35 px-2.5 py-1.5 text-[11px] font-bold text-danger transition-colors hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:border-line disabled:text-muted"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-xl border border-line bg-white px-4 py-3 text-xs font-semibold text-muted">
          Las fotos viajan dentro de los datos del navegador y se optimizan al subirlas. El hotel nunca se queda sin ninguna: la portada es la que lo representa en las búsquedas.
        </p>
      </section>

      {/* Modal para rechazar una reserva: sin motivo no se envía (HU-027) */}
      <Modal abierto={!!porRechazar} alCerrar={() => setPorRechazar(null)} ancho="max-w-md">
        <div className="p-7">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE2E2] text-danger">
            <IconoX size={26} />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink">Rechazar la reserva {porRechazar?.folio}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {porRechazar?.turista} pierde esta habitación en esas fechas. Escribí el motivo: el turista lo va a ver en su reserva.
          </p>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Motivo del rechazo</span>
            <textarea
              value={motivoRechazo}
              onChange={(e) => {
                setMotivoRechazo(e.target.value);
                if (errorMotivo) setErrorMotivo("");
              }}
              rows={3}
              placeholder="Ej.: No quedan habitaciones libres para esas fechas."
              className={`w-full resize-none rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${errorMotivo ? "border-[#FCA5A5] focus:ring-danger/30" : "border-line focus:ring-primary/30"}`}
            />
          </label>
          {errorMotivo && <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errorMotivo}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setPorRechazar(null)}
              className="rounded-lg border-2 border-line px-5 py-2.5 text-sm font-bold text-muted transition-colors hover:border-ink/30 hover:text-ink"
            >
              Volver
            </button>
            <button
              onClick={confirmarRechazo}
              className="rounded-lg bg-danger px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#B91C1C] active:scale-95"
            >
              Sí, rechazar
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

// Etiqueta de cada miniatura: si es portada o su número, y su peso cuando la foto se subió (HU-025)
function etiquetaFoto(indice: number, foto: string): string {
  const nombre = indice === 0 ? "Portada" : `Foto ${indice + 1}`;
  const peso = pesoDeFoto(foto);
  return peso ? `${nombre} · ${peso}` : nombre;
}

// Valores con los que arranca el formulario de registro de habitación (HU-023)
const HABITACION_VACIA: DatosHabitacion = {
  tipo: "",
  capacidad: 2,
  precio: 0,
  unidades: 1,
  estado: "disponible",
  detalle: "",
};

// Botón pequeño de acción para la tabla de reservas
function Accion({ onClick, clase, icono, texto }: { onClick: () => void; clase: string; icono: React.ReactNode; texto: string }) {
  return (
    // El color del texto lo pone cada uso: si vive acá, gana sobre el que pase el botón
    <button onClick={onClick} className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-bold transition-all active:scale-95 ${clase}`}>
      {icono} {texto}
    </button>
  );
}
