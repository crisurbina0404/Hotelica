// ============================================================
// Hotelica — Panel del hotel (HU-026 reservas recibidas,
// HU-027 confirmar, HU-028 check-in, HU-029 check-out)
// El hotelero llega acá después de que el admin apruebe su
// inscripción del inicio y le cree la cuenta (HU-021)
// ============================================================
import { useMemo, useState } from "react";
import { useApp } from "../store";
import {
  DEPARTAMENTOS, HABITACIONES_SEED, MUNICIPIOS, fmtDinero, fmtFecha, hoyISO, contrasenaTemporalVencida,
} from "../data";
import type { DatosRegistroHotel, ErroresRegistroHotel, Reserva } from "../data";
import { Reveal, BadgeEstado, BadgeHabitacion, BadgeHotel, TituloSeccion } from "../ui";
import {
  IconoCheck, IconoX, IconoEntrada, IconoSalida, IconoCama, IconoGrafica,
  IconoCalendario, IconoHotel, IconoHuespedes, IconoCampana, IconoLapiz, IconoEstrella,
} from "../icons";

export function PanelHotel() {
  const { hoteles, reservas, cambiarEstadoReserva, avisar, notificaciones, marcarNotificacionesLeidas, usuario, actualizarHotel, cuentasHotelero, cambiarContrasenaHotelero } = useApp();
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

  // Al cambiar el departamento volvemos a elegir el municipio
  const cambiarDepartamentoEdicion = (id: string) => {
    setFormEdicion((f) => (f ? { ...f, departamentoId: id, municipioId: "" } : f));
    setErroresEdicion((e) => ({ ...e, departamentoId: undefined, municipioId: undefined }));
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

  const habitaciones = HABITACIONES_SEED.filter((h) => h.hotelId === HOTEL_ID);

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
  const confirmar = (r: Reserva) => {
    cambiarEstadoReserva(r.folio, "confirmada");
    avisar(`Reserva ${r.folio} confirmada. El turista ya puede verla como Confirmada.`, "ok");
  };
  const cancelar = (r: Reserva) => {
    cambiarEstadoReserva(r.folio, "cancelada");
    avisar(`Reserva ${r.folio} cancelada por el hotel.`, "error");
  };
  const checkIn = (r: Reserva) => {
    cambiarEstadoReserva(r.folio, "checkin");
    avisar(`Check-in registrado para ${r.turista} (${r.folio}).`, "ok");
  };
  const checkOut = (r: Reserva) => {
    cambiarEstadoReserva(r.folio, "completada");
    avisar(`Check-out listo: ${r.turista} puede calificar su estadía.`, "ok");
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
                  onChange={(e) => cambiarCampoEdicion("municipioId", e.target.value)}
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

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Teléfono (opcional)</span>
                <input
                  type="tel"
                  value={formEdicion.telefono}
                  onChange={(e) => cambiarCampoEdicion("telefono", e.target.value)}
                  maxLength={20}
                  placeholder="Ej: 8888-8888"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 ${
                    erroresEdicion.telefono ? "border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25" : "border-line focus:border-primary focus:ring-primary/25"
                  }`}
                />
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
        <Reveal delay={100}>
          <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white shadow-card">
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
                  const hab = HABITACIONES_SEED.find((h) => h.id === r.habitacionId);
                  return (
                    <tr key={r.folio} className={`border-b border-line/70 transition-colors last:border-0 hover:bg-canvas ${i % 2 === 1 ? "bg-canvas/50" : ""}`}>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary-dark">{r.folio}</td>
                      <td className="px-4 py-3.5 font-semibold text-ink">{r.turista}</td>
                      <td className="px-4 py-3.5 text-muted">{hab?.tipo}</td>
                      <td className="px-4 py-3.5 text-muted">{fmtFecha(r.llegada)}</td>
                      <td className="px-4 py-3.5 text-muted">{fmtFecha(r.salida)}</td>
                      <td className="px-4 py-3.5 text-muted">{r.huespedes}</td>
                      <td className="px-4 py-3.5 font-semibold text-ink">{fmtDinero(r.total)}</td>
                      <td className="px-4 py-3.5"><BadgeEstado estado={r.estado} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          {r.estado === "pendiente" && (
                            <>
                              <Accion onClick={() => confirmar(r)} clase="bg-primary hover:bg-primary-dark" icono={<IconoCheck size={13} />} texto="Confirmar" />
                              <Accion onClick={() => cancelar(r)} clase="border border-danger/35 text-danger hover:bg-[#FEF2F2]" icono={<IconoX size={13} />} texto="Cancelar" />
                            </>
                          )}
                          {r.estado === "confirmada" && (
                            <>
                              {r.llegada <= hoy ? (
                                <Accion onClick={() => checkIn(r)} clase="bg-primary hover:bg-primary-dark" icono={<IconoEntrada size={13} />} texto="Check-in" />
                              ) : (
                                <span className="cursor-not-allowed rounded-md bg-line/60 px-2.5 py-1.5 text-[11px] font-bold text-muted" title="El check-in se habilita el día de llegada">
                                  Check-in el {fmtFecha(r.llegada)}
                                </span>
                              )}
                              <Accion onClick={() => cancelar(r)} clase="border border-danger/35 text-danger hover:bg-[#FEF2F2]" icono={<IconoX size={13} />} texto="Cancelar" />
                            </>
                          )}
                          {r.estado === "checkin" && (
                            <Accion onClick={() => checkOut(r)} clase="bg-success hover:bg-[#15803D]" icono={<IconoSalida size={13} />} texto="Check-out" />
                          )}
                          {(r.estado === "completada" || r.estado === "cancelada") && (
                            <span className="text-[11px] font-semibold text-muted">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ===== Habitaciones del hotel ===== */}
      <section className="mt-12">
        <Reveal>
          <TituloSeccion ceja="Inventario" titulo="Habitaciones del hotel" />
        </Reveal>
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
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </main>
  );
}

// Botón pequeño de acción para la tabla de reservas
function Accion({ onClick, clase, icono, texto }: { onClick: () => void; clase: string; icono: React.ReactNode; texto: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-bold text-white transition-all active:scale-95 ${clase}`}>
      {icono} {texto}
    </button>
  );
}
