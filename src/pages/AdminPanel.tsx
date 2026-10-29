// ============================================================
// Hotelica — Consola de administración
// Bandeja de hoteles (HU-031/032), usuarios (HU-033),
// estadísticas globales (HU-034) y avisos de reservas (HU-035)
// ============================================================
import { useMemo } from "react";
import { useApp } from "../store";
import type { EventoReserva, TipoEvento } from "../store";
import type { Navegar } from "../rutas";
import { DEPARTAMENTOS, MUNICIPIOS, fmtDinero, fmtFecha, fmtFechaHora, requisitosIncompletos } from "../data";
import type { Hotel, CuentaHotelero, UsuarioPlataforma } from "../data";
import { Reveal, BadgeHotel, Modal, TituloSeccion } from "../ui";
import { MapaHotel } from "../mapa";
import { EstadisticasGlobales } from "./EstadisticasGlobales";
import {
  IconoEscudo, IconoCheck, IconoX, IconoOjo, IconoHotel, IconoGrafica, IconoPin, IconoUsuario, IconoCampana,
} from "../icons";
import { useState } from "react";

// Cómo se ve cada rol en la lista de usuarios (HU-033).
// Los tres van con los colores de rol de la guía de diseño: teal, ámbar e índigo
const ETIQUETA_ROL: Record<UsuarioPlataforma["rol"], string> = { Turista: "Turista", Hotel: "Hotelero", Admin: "Admin" };
const COLOR_ROL: Record<UsuarioPlataforma["rol"], string> = {
  Turista: "bg-primary-light text-primary",
  Hotel: "bg-hotel-soft text-hotel",
  Admin: "bg-admin-soft text-admin",
};

// Cómo se ve cada evento de reserva en la bitácora del admin (HU-035)
const ETIQUETA_EVENTO: Record<TipoEvento, string> = {
  nueva: "Nueva", pago: "Pago", confirmada: "Confirmada",
  rechazada: "Rechazada", cancelada: "Cancelada", entrada: "Entrada", salida: "Salida",
};

// Colores con los mismos pasteles de estado del sitio (guía de diseño §1.4)
const COLOR_EVENTO: Record<TipoEvento, string> = {
  nueva: "bg-accent-light text-[#92400E] border-[#FCD34D]",
  pago: "bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]",
  confirmada: "bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]",
  rechazada: "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]",
  cancelada: "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]",
  entrada: "bg-primary-light text-primary border-[#5EEAD4]",
  salida: "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]",
};

export function PanelAdmin({ navegar }: { navegar: Navegar }) {
  const { hoteles, reservas, decidirHotel, enviarCuentaHotelero, enviarRechazoHotelero, avisar, avisarHotel, usuarios, cambiarEstadoUsuario, usuario,
    eventosAdmin, marcarEvento, marcarEventosLeidos, borrarEvento, borrarEventosLeidos } = useApp();
  const [viendo, setViendo] = useState<Hotel | null>(null);
  const [cuentaCreada, setCuentaCreada] = useState<CuentaHotelero | null>(null);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  // Solicitud que se está rechazando y el motivo que escribió el admin (HU-032)
  const [rechazando, setRechazando] = useState<Hotel | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");
  // Filtro de la lista de usuarios por rol (HU-033)
  const [filtroRol, setFiltroRol] = useState<UsuarioPlataforma["rol"] | "Todos">("Todos");
  // Filtro de la bitácora de eventos por tipo (HU-035)
  const [filtroEvento, setFiltroEvento] = useState<TipoEvento | "Todas">("Todas");

  const pendientes = hoteles.filter((h) => h.aprobado === "pendiente");
  const aprobados = hoteles.filter((h) => h.aprobado === "aprobado");
  const historial = hoteles.filter((h) => h.aprobado !== "pendiente");

  // Lista de usuarios de la plataforma, con filtro por rol (HU-033)
  const usuariosVisibles = filtroRol === "Todos" ? usuarios : usuarios.filter((u) => u.rol === filtroRol);
  const miCorreo = (usuario?.correo ?? "").trim().toLowerCase();

  // Bitácora de reservas con filtro por tipo; el hotel se resuelve para mostrar su nombre (HU-035)
  const eventosVisibles = filtroEvento === "Todas"
    ? eventosAdmin
    : eventosAdmin.filter((e) => e.tipo === filtroEvento);
  const eventosSinLeer = eventosAdmin.filter((e) => !e.leida).length;
  const eventosLeidos = eventosAdmin.length - eventosSinLeer;
  const hotelDeEvento = (e: EventoReserva) => hoteles.find((h) => h.id === e.hotelId)?.nombre ?? "Hotel desconocido";

  // Activar o desactivar una cuenta desde la lista (HU-033)
  const accionUsuario = (u: UsuarioPlataforma) => {
    const activo = !u.activo; // el botón siempre ofrece lo contrario del estado actual
    const r = cambiarEstadoUsuario(u.correo, activo);
    if (r.error) {
      avisar(r.error, "error");
      return;
    }
    avisar(
      activo
        ? `${u.nombre} activado: ya puede iniciar sesión.`
        : `${u.nombre} desactivado: ya no podrá iniciar sesión.`,
      "ok"
    );
  };

  // Ingresos totales de la plataforma (reservas no canceladas)
  const ingresosPlataforma = reservas.filter((r) => r.estado !== "cancelada").reduce((a, r) => a + r.total, 0);

  // Reservas por departamento para el reporte de barras
  const reporte = useMemo(() => {
    const porDepto = DEPARTAMENTOS.map((d) => {
      const hotelesDe = hoteles.filter((h) => h.departamentoId === d.id).map((h) => h.id);
      const cant = reservas.filter((r) => hotelesDe.includes(r.hotelId) && r.estado !== "cancelada").length;
      return { nombre: d.nombre, cant };
    });
    const max = Math.max(1, ...porDepto.map((p) => p.cant));
    return { porDepto, max };
  }, [hoteles, reservas]);

  const aprobar = async (h: Hotel) => {
    // Si al hotel le falta algo básico no se aprueba y le decimos qué falta (HU-031)
    const faltan = requisitosIncompletos(h);
    if (faltan.length > 0) {
      avisar(`"${h.nombre}" no se puede aprobar todavía. Falta: ${faltan.join("; ")}.`, "error");
      return;
    }

    // Al aprobar se crea la cuenta de hotelero que le da acceso al panel (HU-021)
    const cuenta = decidirHotel(h.id, "aprobado");
    if (cuenta) {
      setCuentaCreada(cuenta);
      avisar(`"${h.nombre}" aprobado: cuenta creada para ${cuenta.correo}.`, "ok");
      // Enviamos el correo real con las credenciales al hotelero
      setEnviandoCorreo(true);
      const resultado = await enviarCuentaHotelero(cuenta, h.nombre);
      setEnviandoCorreo(false);
      if (resultado.ok) {
        avisar(`Correo con credenciales enviado a ${cuenta.correo}.`, "ok");
      } else {
        avisar(`No se pudo enviar el correo: ${resultado.error ?? "error desconocido"}. Copiá las credenciales del modal.`, "error");
      }
    } else {
      avisar(`"${h.nombre}" aprobado: ya aparece en las búsquedas de los turistas.`, "ok");
    }
  };
  // El rechazo abre su formulario en vez de decidir al vuelo (HU-032)
  const rechazar = (h: Hotel) => {
    setMotivo("");
    setErrorMotivo("");
    setRechazando(h);
  };

  // Confirma el rechazo con el motivo escrito (HU-032)
  const confirmarRechazo = async () => {
    if (!rechazando) return;
    const texto = motivo.trim();
    // Sin motivo no hay rechazo: el hotelero tiene que saber por qué (HU-032).
    // Pedimos los mismos 3 caracteres que el rechazo de reservas del panel del
    // hotel (HU-027): las dos reglas tenían medidas distinto
    if (texto.length < 3) {
      setErrorMotivo("Escribí el motivo del rechazo: el hotelero necesita saber por qué.");
      return;
    }
    const hotel = rechazando;
    decidirHotel(hotel.id, "rechazado", texto);
    // Aviso automático en el panel del hotel con el motivo (HU-032)
    avisarHotel(hotel.id, "", `Hotel rechazado por Hotelica: ${texto}`);
    avisar(`"${hotel.nombre}" rechazado: no será visible para turistas.`, "error");
    // Cerramos el formulario antes de esperar el correo
    setRechazando(null);

    // El correo de rechazo solo sale si el dueño dejó contacto (HU-032)
    if (hotel.correoDueno) {
      setEnviandoCorreo(true);
      const resultado = await enviarRechazoHotelero(hotel.dueno, hotel.correoDueno.trim().toLowerCase(), hotel.nombre, texto);
      setEnviandoCorreo(false);
      if (resultado.ok) {
        avisar(`Correo de rechazo enviado a ${hotel.correoDueno}.`, "ok");
      } else {
        avisar(`No se pudo enviar el correo de rechazo: ${resultado.error ?? "error desconocido"}. El aviso del panel sí quedó.`, "error");
      }
    }
  };

  // Botones de la solicitud. Los comparten la tabla de escritorio y las tarjetas del celular
  const accionesHotel = (h: Hotel) => (
    <>
      <button onClick={() => setViendo(h)} className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-bold text-muted transition-colors hover:border-admin/50 hover:text-admin">
        <IconoOjo size={13} /> Ver
      </button>
      <button onClick={() => aprobar(h)} className="flex items-center gap-1 rounded-md bg-success px-2.5 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#15803D] active:scale-95">
        <IconoCheck size={13} /> Aprobar
      </button>
      <button onClick={() => rechazar(h)} className="flex items-center gap-1 rounded-md bg-danger px-2.5 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#B91C1C] active:scale-95">
        <IconoX size={13} /> Rechazar
      </button>
    </>
  );

  // Los cuatro recuadros van del mismo índigo del rol: la variedad de color
  // queda para las pastillas de estado, que ahí sí está codificando información
  const stats = [
    { t: "Hoteles aprobados", v: aprobados.length, icono: <IconoHotel size={19} />, color: "bg-admin-soft text-admin" },
    { t: "Por aprobar", v: pendientes.length, icono: <IconoOjo size={19} />, color: "bg-admin-soft text-admin" },
    { t: "Reservas totales", v: reservas.length, icono: <IconoCheck size={19} />, color: "bg-admin-soft text-admin" },
    { t: "Ingresos plataforma", v: fmtDinero(ingresosPlataforma), icono: <IconoGrafica size={19} />, color: "bg-admin-soft text-admin", chico: true },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6">
      {/* Encabezado con identidad del rol admin */}
      <Reveal>
        {/* Índigo sólido con la textura de puntos de fondo: sin gradiente, la guía lo prohíbe */}
        <div className="dot-texture-light overflow-hidden rounded-2xl bg-admin p-7 text-white shadow-lift sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm"><IconoEscudo size={28} /></span>
              <div>
                {/* El nombre y el rol salen de la sesión: son los datos de la base, no del navegador */}
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-soft">Consola de administración · {usuario?.nombre ?? "Rol Admin"}</p>
                <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Supervisión de la plataforma</h1>
                <p className="mt-0.5 text-sm text-white/85">Solo los hoteles aprobados son visibles para los turistas</p>
              </div>
            </div>
            <button onClick={() => navegar({ nombre: "resultados" })} className="rounded-lg bg-white/12 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
              Ver sitio como turista
            </button>
          </div>
        </div>
      </Reveal>

      {/* Indicadores */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.t} delay={i * 80}>
            <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 shadow-card transition-transform hover:-translate-y-1">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.color}`}>{s.icono}</span>
              <div className="min-w-0">
                <p className={`font-display font-extrabold leading-none text-ink ${s.chico ? "text-base" : "text-2xl"}`}>{s.v}</p>
                <p className="mt-1 text-xs font-semibold text-muted">{s.t}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ===== Aprobación de hoteles (HU-031) ===== */}
      <section className="mt-12">
        <Reveal>
          <TituloSeccion ceja="Solicitudes de registro" titulo={`Hoteles pendientes de aprobación (${pendientes.length})`} />
        </Reveal>

        {pendientes.length === 0 ? (
          <Reveal delay={100}>
            <div className="mt-6 flex items-center gap-4 rounded-xl border border-[#86EFAC] bg-[#F0FDF4] p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success text-white"><IconoCheck size={22} /></span>
              <div>
                <p className="font-display text-base font-bold text-[#166534]">Bandeja al día</p>
                <p className="text-sm text-[#166534]/80">No hay hoteles esperando aprobación. Cuando un hotelero se registre, aparecerá aquí.</p>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={100}>
            <div className="mt-6 hidden overflow-x-auto rounded-xl border border-line bg-white shadow-card lg:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-admin-soft/50 text-[11px] font-bold uppercase tracking-wider text-admin">
                    <th className="px-4 py-3.5">Hotel</th>
                    <th className="px-4 py-3.5">Dueño</th>
                    <th className="px-4 py-3.5">Ubicación</th>
                    <th className="px-4 py-3.5">Registro</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-4 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientes.map((h, i) => (
                    <tr key={h.id} className={`border-b border-line/70 transition-colors last:border-0 hover:bg-canvas ${i % 2 === 1 ? "bg-canvas/50" : ""}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={h.imagen} alt={h.nombre} className="h-11 w-14 rounded-md object-cover" />
                          <span className="font-semibold text-ink">{h.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted">{h.dueno}</td>
                      <td className="px-4 py-3.5 text-muted">
                        {MUNICIPIOS.find((m) => m.id === h.municipioId)?.nombre}, {DEPARTAMENTOS.find((d) => d.id === h.departamentoId)?.nombre}
                      </td>
                      <td className="px-4 py-3.5 text-muted">{fmtFecha(h.fechaRegistro)}</td>
                      <td className="px-4 py-3.5"><BadgeHotel estado={h.aprobado} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-1.5">{accionesHotel(h)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        )}

        {/* En celular, una tarjeta por solicitud con las acciones a la vista */}
        <div className="mt-6 grid gap-3 lg:hidden">
          {pendientes.map((h) => (
            <Reveal key={h.id}>
              <div className="rounded-xl border border-line bg-white p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <img src={h.imagen} alt={h.nombre} className="h-14 w-16 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0">
                    <p className="font-display text-base font-bold text-ink">{h.nombre}</p>
                    <p className="mt-0.5 text-xs text-muted">{h.dueno}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Ubicación</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-ink">
                      {MUNICIPIOS.find((m) => m.id === h.municipioId)?.nombre}, {DEPARTAMENTOS.find((d) => d.id === h.departamentoId)?.nombre}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Registro</dt>
                    <dd className="mt-0.5 text-sm text-muted">{fmtFecha(h.fechaRegistro)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">Estado</dt>
                    <dd className="mt-1"><BadgeHotel estado={h.aprobado} /></dd>
                  </div>
                </dl>
                <div className="mt-3.5 flex flex-wrap justify-end gap-1.5 border-t border-line pt-3">
                  {accionesHotel(h)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* ===== Historial de decisiones ===== */}
        <section>
          <Reveal>
            <TituloSeccion ceja="Historial" titulo="Hoteles ya revisados" />
          </Reveal>
          <div className="mt-6 grid gap-2.5">
            {historial.map((h, i) => (
              <Reveal key={h.id} delay={i * 50}>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-4 py-3 shadow-card transition-transform hover:-translate-y-0.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={h.imagen} alt={h.nombre} className="h-10 w-[52px] rounded-md object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{h.nombre}</p>
                      {/* El motivo del rechazo queda a la vista en el historial (HU-032) */}
                      {h.aprobado === "rechazado" && h.motivoRechazo && (
                        <p className="truncate text-[11px] font-semibold text-danger">Motivo: {h.motivoRechazo}</p>
                      )}
                      <p className="flex items-center gap-1 text-[11px] text-muted">
                        <IconoPin size={11} /> {MUNICIPIOS.find((m) => m.id === h.municipioId)?.nombre}
                      </p>
                    </div>
                  </div>
                  <BadgeHotel estado={h.aprobado} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== Reporte por departamento ===== */}
        <section>
          <Reveal>
            <TituloSeccion ceja="Reporte básico" titulo="Reservas por departamento" />
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-6 rounded-xl border border-line bg-white p-6 shadow-card">
              {reporte.porDepto.map((p, i) => (
                <div key={p.nombre} className="mb-3.5 last:mb-0">
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span className="text-ink">{p.nombre}</span>
                    <span className="text-muted">{p.cant} reserva{p.cant !== 1 && "s"}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-canvas">
                    <div
                      className="anim-grow h-full rounded-full bg-admin"
                      style={{ width: `${(p.cant / reporte.max) * 100}%`, animationDelay: `${i * 90}ms` }}
                    />
                  </div>
                </div>
              ))}
              <p className="mt-5 border-t border-line pt-3.5 text-[11px] leading-relaxed text-muted">
                Reporte calculado en vivo: cuenta las reservas no canceladas de cada departamento.
              </p>
            </div>
          </Reveal>
        </section>
      </div>

      {/* ===== Centro de notificaciones de reservas (HU-035) ===== */}
      <section className="mt-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <TituloSeccion
              ceja="Actividad de reservas"
              titulo={`Notificaciones de reservas${eventosSinLeer > 0 ? ` (${eventosSinLeer} sin ver)` : ` (${eventosAdmin.length})`}`}
            />
            <div className="flex gap-2">
              <button
                onClick={marcarEventosLeidos}
                disabled={eventosSinLeer === 0}
                className="rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-bold text-muted transition-colors hover:border-admin/50 hover:text-admin disabled:cursor-not-allowed disabled:opacity-50"
              >
                Marcar leídas
              </button>
              <button
                onClick={borrarEventosLeidos}
                disabled={eventosLeidos === 0}
                className="rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-bold text-muted transition-colors hover:border-danger/50 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
              >
                Borrar las leídas
              </button>
            </div>
          </div>
        </Reveal>

        {/* Filtro por tipo de evento: la bitácora se puede ver completa o por cada movimiento */}
        <Reveal delay={60}>
          <div className="mt-6 flex flex-wrap gap-2">
            {(["Todas", "nueva", "pago", "confirmada", "rechazada", "cancelada", "entrada", "salida"] as const).map((f) => {
              const cantidad = f === "Todas"
                ? eventosAdmin.length
                : eventosAdmin.filter((e) => e.tipo === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFiltroEvento(f)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    filtroEvento === f
                      ? "bg-admin text-white"
                      : "border border-line bg-white text-muted hover:border-admin/50 hover:text-admin"
                  }`}
                >
                  {f === "Todas" ? "Todas" : ETIQUETA_EVENTO[f]} ({cantidad})
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-5 rounded-xl border border-line bg-white shadow-card">
            {eventosVisibles.length === 0 ? (
              <div className="flex items-center gap-4 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-admin-soft text-admin"><IconoCampana size={22} /></span>
                <div>
                  <p className="font-display text-base font-bold text-ink">Sin actividad por ahora</p>
                  <p className="text-sm text-muted">
                    {filtroEvento === "Todas"
                      ? "Cuando un turista reserve, pague, cancele o se registre su llegada, el movimiento va a parar acá."
                      : "No hay notificaciones de ese tipo todavía."}
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-line/70">
                {eventosVisibles.map((e) => (
                  <li
                    key={e.id}
                    data-evento={e.tipo}
                    className={`flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-canvas/60 ${
                      e.leida ? "" : "bg-admin-soft/25"
                    }`}
                  >
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${COLOR_EVENTO[e.tipo]}`}>
                      {ETIQUETA_EVENTO[e.tipo]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">
                        <span className="tabular-nums text-admin">{e.folio}</span> · {e.texto}
                      </p>
                      <p className="truncate text-xs text-muted">{hotelDeEvento(e)} · {fmtFechaHora(e.fecha)}</p>
                    </div>
                    {e.leida ? (
                      <span className="text-[11px] font-semibold text-muted">Visto</span>
                    ) : (
                      <button
                        onClick={() => marcarEvento(e.id)}
                        className="rounded-md border border-line px-2.5 py-1.5 text-[11px] font-bold text-muted transition-colors hover:border-admin/50 hover:text-admin"
                      >
                        Marcar vista
                      </button>
                    )}
                    <button
                      onClick={() => borrarEvento(e.id)}
                      aria-label={`Borrar la notificación del folio ${e.folio}`}
                      className="rounded-md border border-transparent p-1.5 text-muted transition-colors hover:border-danger/40 hover:text-danger"
                    >
                      <IconoX size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      </section>

      {/* ===== Usuarios de la plataforma (HU-033) ===== */}
      <section className="mt-12">
        <Reveal>
          <TituloSeccion ceja="Usuarios" titulo={`Usuarios de la plataforma (${usuarios.length})`} />
        </Reveal>

        {/* Filtro por rol: la lista se puede ver completa o por cada rol */}
        <Reveal delay={60}>
          <div className="mt-6 flex flex-wrap gap-2">
            {(["Todos", "Turista", "Hotel", "Admin"] as const).map((f) => {
              const cantidad = f === "Todos" ? usuarios.length : usuarios.filter((u) => u.rol === f).length;
              const etiqueta = f === "Todos" ? "Todos" : ETIQUETA_ROL[f];
              return (
                <button
                  key={f}
                  onClick={() => setFiltroRol(f)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    filtroRol === f
                      ? "bg-admin text-white"
                      : "border border-line bg-white text-muted hover:border-admin/50 hover:text-admin"
                  }`}
                >
                  {etiqueta} ({cantidad})
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-5 overflow-hidden rounded-xl border border-line bg-white shadow-card">
            {usuariosVisibles.length === 0 ? (
              <p className="p-6 text-sm text-muted">No hay usuarios de ese rol todavía.</p>
            ) : (
              <ul className="divide-y divide-line/70">
                {usuariosVisibles.map((u) => {
                  // La propia fila del admin es de solo lectura: nadie se desactiva a sí mismo (HU-033)
                  const esMiCuenta = u.correo === miCorreo;
                  return (
                    <li key={u.correo} className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-canvas/60">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${COLOR_ROL[u.rol]}`}>
                        <IconoUsuario size={19} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">
                          {u.nombre}
                          {esMiCuenta && <span className="ml-1.5 text-[11px] font-semibold text-muted">(tu cuenta)</span>}
                        </p>
                        <p className="truncate text-xs text-muted">{u.correo}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${COLOR_ROL[u.rol]}`}>
                        {ETIQUETA_ROL[u.rol]}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          u.activo ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-danger"
                        }`}
                      >
                        {u.activo ? "Activo" : "Desactivado"}
                      </span>
                      {esMiCuenta ? (
                        <span className="w-28 text-right text-[11px] font-semibold text-muted">Solo lectura</span>
                      ) : (
                        <button
                          onClick={() => accionUsuario(u)}
                          className={`flex w-28 items-center justify-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-bold text-white transition-all active:scale-95 ${
                            u.activo ? "bg-danger hover:bg-[#B91C1C]" : "bg-success hover:bg-[#15803D]"
                          }`}
                        >
                          {u.activo ? <IconoX size={13} /> : <IconoCheck size={13} />}
                          {u.activo ? "Desactivar" : "Activar"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Reveal>
      </section>

      {/* ===== Estadísticas globales de toda la plataforma (HU-034) ===== */}
      <EstadisticasGlobales />

      {/* Modal con la cuenta creada al aprobar una solicitud (HU-021) */}
      <Modal abierto={!!cuentaCreada} alCerrar={() => setCuentaCreada(null)} ancho="max-w-md">
        {cuentaCreada && (
          <div className="p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]"><IconoCheck size={22} /></span>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">Cuenta de hotelero creada</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {enviandoCorreo
                ? "Enviando el correo con las credenciales al dueño del hotel..."
                : `Se envió un correo a ${cuentaCreada.correo} con estos datos. También podés enviárselos manualmente:`}
            </p>
            <div className="mt-4 rounded-xl bg-canvas p-4 text-sm">
              <p className="flex justify-between py-0.5"><span className="text-muted">Correo</span><b className="text-ink">{cuentaCreada.correo}</b></p>
              <p className="flex justify-between py-0.5"><span className="text-muted">Contraseña</span><b className="font-mono text-ink">{cuentaCreada.contrasena}</b></p>
            </div>
            <button
              onClick={() => setCuentaCreada(null)}
              className="mt-5 w-full rounded-lg bg-admin py-3 text-sm font-bold text-white transition-colors hover:bg-[#312E81]"
            >
              Entendido
            </button>
          </div>
        )}
      </Modal>

      {/* Modal de revisión del hotel */}
      <Modal abierto={!!viendo} alCerrar={() => setViendo(null)} ancho="max-w-lg">
        {viendo && (
          <div className="p-7">
            <img src={viendo.imagen} alt={viendo.nombre} className="h-48 w-full rounded-xl object-cover" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">{viendo.nombre}</h3>
                <p className="mt-0.5 text-sm text-muted">{viendo.direccion}</p>
              </div>
              <BadgeHotel estado={viendo.aprobado} />
            </div>
            <p className="mt-3.5 text-sm leading-relaxed text-muted">{viendo.descripcion}</p>
            {/* Ubicación exacta marcada por el dueño (HU-037): el admin la ve antes de decidir */}
            <div className="mt-4">
              <MapaHotel
                punto={viendo.ubicacion ?? MUNICIPIOS.find((m) => m.id === viendo.municipioId)?.centro ?? null}
                nombre={viendo.nombre}
                altura="h-48"
                zoom={14}
              />
            </div>
            <div className="mt-4 rounded-xl bg-canvas p-4 text-sm">
              <p className="flex justify-between py-0.5"><span className="text-muted">Dueño</span><b className="text-ink">{viendo.dueno}</b></p>
              {viendo.contacto && (
                <p className="flex justify-between py-0.5"><span className="text-muted">Contacto</span><b className="text-ink">{viendo.contacto}</b></p>
              )}
              <p className="flex justify-between py-0.5"><span className="text-muted">Solicitud</span><b className="text-ink">{fmtFecha(viendo.fechaRegistro)}</b></p>
              <p className="flex justify-between py-0.5"><span className="text-muted">Amenidades</span><b className="text-ink">{viendo.amenidades.length}</b></p>
            </div>
            {viendo.aprobado === "pendiente" && (
              <div className="mt-5 flex gap-2.5">
                <button onClick={() => { aprobar(viendo); setViendo(null); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success py-3 text-sm font-bold text-white transition-all hover:bg-[#15803D] active:scale-[0.98]">
                  <IconoCheck size={15} /> Aprobar hotel
                </button>
                <button onClick={() => { rechazar(viendo); setViendo(null); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-danger py-3 text-sm font-bold text-white transition-all hover:bg-[#B91C1C] active:scale-[0.98]">
                  <IconoX size={15} /> Rechazar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
      {/* Modal del rechazo: requisitos incumplidos + motivo obligatorio (HU-032) */}
      <Modal abierto={!!rechazando} alCerrar={() => setRechazando(null)} ancho="max-w-md">
        {rechazando && (
          <div className="p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE2E2] text-danger"><IconoX size={22} /></span>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">Rechazar "{rechazando.nombre}"</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              El hotel saldrá de la bandeja y no aparecerá en las búsquedas. El motivo queda registrado y el hotelero lo verá en sus avisos.
            </p>
            {/* Lo que le falta al hotel, como apoyo para escribir el motivo (HU-032) */}
            {requisitosIncompletos(rechazando).length > 0 && (
              <div className="mt-4 rounded-xl bg-[#FEF2F2] p-4 text-sm">
                <p className="font-bold text-danger">Requisitos incumplidos</p>
                <ul className="mt-1.5 list-inside list-disc text-muted">
                  {requisitosIncompletos(rechazando).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            <label htmlFor="motivo-rechazo" className="mt-4 block text-xs font-bold uppercase tracking-wider text-muted">
              Motivo del rechazo (obligatorio)
            </label>
            <textarea
              id="motivo-rechazo"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErrorMotivo("");
              }}
              rows={3}
              placeholder="Ej: La descripción es muy corta y no tiene foto representativa"
              className="mt-1.5 w-full resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-danger focus:ring-2 focus:ring-danger/25"
            />
            {errorMotivo && <p className="mt-1.5 text-xs font-semibold text-danger">{errorMotivo}</p>}
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setRechazando(null)}
                className="flex-1 rounded-lg border border-line py-3 text-sm font-bold text-muted transition-colors hover:border-ink/30"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRechazo}
                className="flex-1 rounded-lg bg-danger py-3 text-sm font-bold text-white transition-all hover:bg-[#B91C1C] active:scale-[0.98]"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
