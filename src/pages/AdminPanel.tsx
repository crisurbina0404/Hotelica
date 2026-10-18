// ============================================================
// Hotelica — Consola de administración (HU-009: aprobar hoteles)
// ============================================================
import { useMemo } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import { DEPARTAMENTOS, MUNICIPIOS, fmtDinero, fmtFecha } from "../data";
import type { Hotel, CuentaHotelero } from "../data";
import { Reveal, BadgeHotel, Modal, TituloSeccion } from "../ui";
import { MapaHotel } from "../mapa";
import {
  IconoEscudo, IconoCheck, IconoX, IconoOjo, IconoHotel, IconoGrafica, IconoPin,
} from "../icons";
import { useState } from "react";

export function PanelAdmin({ navegar }: { navegar: Navegar }) {
  const { hoteles, reservas, decidirHotel, enviarCuentaHotelero, avisar } = useApp();
  const [viendo, setViendo] = useState<Hotel | null>(null);
  const [cuentaCreada, setCuentaCreada] = useState<CuentaHotelero | null>(null);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  const pendientes = hoteles.filter((h) => h.aprobado === "pendiente");
  const aprobados = hoteles.filter((h) => h.aprobado === "aprobado");
  const historial = hoteles.filter((h) => h.aprobado !== "pendiente");

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
  const rechazar = (h: Hotel) => {
    decidirHotel(h.id, "rechazado");
    avisar(`"${h.nombre}" rechazado: no será visible para turistas.`, "error");
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

  const stats = [
    { t: "Hoteles aprobados", v: aprobados.length, icono: <IconoHotel size={19} />, color: "bg-[#DCFCE7] text-[#166534]" },
    { t: "Por aprobar", v: pendientes.length, icono: <IconoOjo size={19} />, color: "bg-accent-light text-accent-dark" },
    { t: "Reservas totales", v: reservas.length, icono: <IconoCheck size={19} />, color: "bg-[#DBEAFE] text-[#1D4ED8]" },
    { t: "Ingresos plataforma", v: fmtDinero(ingresosPlataforma), icono: <IconoGrafica size={19} />, color: "bg-admin-soft text-admin", chico: true },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6">
      {/* Encabezado con identidad del rol admin */}
      <Reveal>
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-admin to-[#312E81] p-7 text-white shadow-lift sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm"><IconoEscudo size={28} /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Consola de administración · Rol Admin</p>
                <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Supervisión de la plataforma</h1>
                <p className="mt-0.5 text-sm text-indigo-100/85">Solo los hoteles aprobados son visibles para los turistas</p>
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

      {/* ===== Aprobación de hoteles (HU-009) ===== */}
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
                    <img src={h.imagen} alt={h.nombre} className="h-10 w-13 rounded-md object-cover" style={{ width: 52 }} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{h.nombre}</p>
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
                      className="anim-grow h-full rounded-full bg-gradient-to-r from-admin to-primary"
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
    </main>
  );
}
