// ============================================================
// Hotelica — Panel del hotel (HU-007 confirmar/cancelar,
// HU-008 check-in / check-out)
// ============================================================
import { useMemo } from "react";
import { useApp } from "../store";
import {
  HABITACIONES_SEED, MUNICIPIOS, fmtDinero, fmtFecha, hoyISO,
} from "../data";
import type { Reserva } from "../data";
import { Reveal, BadgeEstado, BadgeHabitacion, TituloSeccion } from "../ui";
import {
  IconoCheck, IconoX, IconoEntrada, IconoSalida, IconoCama, IconoGrafica,
  IconoCalendario, IconoHotel, IconoHuespedes,
} from "../icons";

export function PanelHotel() {
  const { reservas, cambiarEstadoReserva, avisar } = useApp();
  const HOTEL_ID = "h-sanjuan"; // hotel de demostración: Brisas del Pacífico
  const hoy = hoyISO();

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
      {/* Encabezado del panel con identidad del rol hotel */}
      <Reveal>
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-hotel to-[#7C2D12] p-7 text-white shadow-lift sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm"><IconoHotel size={28} /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Panel del hotel · Rol Hotel</p>
                <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Brisas del Pacífico</h1>
                <p className="mt-0.5 text-sm text-amber-100/85">San Juan del Sur, Rivas · atendido por Rodolfo Quintana</p>
              </div>
            </div>
            <div className="rounded-xl bg-white/12 px-5 py-3.5 text-right backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200">Ingresos estimados</p>
              <p className="font-display text-2xl font-extrabold text-white">{fmtDinero(ingresos)}</p>
            </div>
          </div>
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

      {/* ===== Gestión de reservas (HU-007 / HU-008) ===== */}
      <section className="mt-12">
        <Reveal>
          <TituloSeccion ceja="Flujo: Pendiente → Confirmada → Check-in → Completada" titulo="Gestión de reservas" />
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white shadow-card">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-primary-soft/60 text-[11px] font-bold uppercase tracking-wider text-primary-dark">
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

// Import auxiliar para mantener las referencias de iconos usadas arriba
void MUNICIPIOS;
