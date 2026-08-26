// ============================================================
// Hotelica — Mis reservas (HU-004 historial, HU-005 cancelar,
// HU-006 calificar) y Favoritos (HU-010)
// ============================================================
import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import {
  ETIQUETA_ESTADO, HABITACIONES_SEED, fmtDinero, fmtFecha, hoyISO,
} from "../data";
import type { EstadoReserva, Reserva } from "../data";
import { Reveal, BadgeEstado, Modal, Estrellas, EstrellasInput, EstadoVacio, TituloSeccion } from "../ui";
import { TarjetaHotel } from "../tarjeta";
import {
  IconoCalendario, IconoHuespedes, IconoOjo, IconoX, IconoEstrella,
  IconoLlave, IconoCama, IconoCorazon,
} from "../icons";

export function MisReservas({ navegar }: { navegar: Navegar }) {
  const { reservas, hoteles, cambiarEstadoReserva, calificar, avisar } = useApp();
  const [filtro, setFiltro] = useState<EstadoReserva | "todas">("todas");
  const [detalle, setDetalle] = useState<Reserva | null>(null);
  const [porCancelar, setPorCancelar] = useState<Reserva | null>(null);
  const [porCalificar, setPorCalificar] = useState<Reserva | null>(null);

  // Solo mostramos las reservas de la turista de demostración
  const mias = useMemo(
    () => reservas.filter((r) => r.turista === "María Fernández"),
    [reservas]
  );
  const visibles = filtro === "todas" ? mias : mias.filter((r) => r.estado === filtro);
  const hoy = hoyISO();

  // Una reserva se puede cancelar antes del check-in y si la llegada no pasó
  const sePuedeCancelar = (r: Reserva) =>
    (r.estado === "pendiente" || r.estado === "confirmada") && r.llegada >= hoy;

  const hotelDe = (r: Reserva) => hoteles.find((h) => h.id === r.hotelId);
  const habDe = (r: Reserva) => HABITACIONES_SEED.find((h) => h.id === r.habitacionId);

  // Ejecuta la cancelación confirmada por el turista
  const cancelar = () => {
    if (!porCancelar) return;
    cambiarEstadoReserva(porCancelar.folio, "cancelada");
    avisar("La reserva fue cancelada correctamente.", "ok");
    setPorCancelar(null);
  };

  const chips: (EstadoReserva | "todas")[] = ["todas", "pendiente", "confirmada", "checkin", "completada", "cancelada"];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6">
      <Reveal>
        <TituloSeccion ceja="Tu historial de viajes" titulo="Mis reservas" />
        <p className="mt-2 text-sm text-muted">
          Sesión demo: <b className="text-ink">María Fernández</b> · {mias.length} reserva{mias.length !== 1 && "s"} en total
        </p>
      </Reveal>

      {/* Filtros por estado */}
      <Reveal delay={100}>
        <div className="mt-7 flex flex-wrap gap-2">
          {chips.map((c) => {
            const activo = filtro === c;
            const cant = c === "todas" ? mias.length : mias.filter((r) => r.estado === c).length;
            return (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                  activo ? "border-primary bg-primary text-white shadow-md" : "border-line bg-white text-muted hover:border-primary/50 hover:text-primary"
                }`}
              >
                {c === "todas" ? "Todas" : ETIQUETA_ESTADO[c]} ({cant})
              </button>
            );
          })}
        </div>
      </Reveal>

      {visibles.length === 0 ? (
        <div className="mt-8">
          <EstadoVacio
            titulo={filtro === "todas" ? "Aún no tienes reservas" : `No tienes reservas ${ETIQUETA_ESTADO[filtro].toLowerCase()}s`}
            detalle="Cuando reserves una habitación aparecerá aquí con su folio, fechas y estado."
            accion={
              <button onClick={() => navegar({ nombre: "resultados" })} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
                Explorar hoteles
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5">
          {visibles.map((r, i) => {
            const h = hotelDe(r);
            const hab = habDe(r);
            return (
              <Reveal key={r.folio} delay={i * 70}>
                <article className="group grid gap-5 rounded-xl border border-line bg-white p-5 shadow-card transition-all hover:border-primary/30 hover:shadow-lift sm:grid-cols-[150px_1fr_auto]">
                  <div className="relative h-32 overflow-hidden rounded-lg sm:h-full">
                    <img src={h?.imagen} alt={h?.nombre} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute left-2 top-2 rounded-md bg-primary-ink/80 px-2 py-0.5 font-mono text-[11px] font-bold text-accent">{r.folio}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-display text-lg font-bold text-ink">{h?.nombre}</h3>
                      <BadgeEstado estado={r.estado} />
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-muted">
                      <IconoCama size={14} className="text-primary" /> {hab?.tipo} · reserva del {fmtFecha(r.creada)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
                      <span className="flex items-center gap-1.5"><IconoCalendario size={14} className="text-primary" /> {fmtFecha(r.llegada)} → {fmtFecha(r.salida)}</span>
                      <span className="flex items-center gap-1.5"><IconoHuespedes size={14} className="text-primary" /> {r.huespedes} huésped{r.huespedes > 1 ? "es" : ""}</span>
                      <span className="font-semibold text-ink">{r.noches} noche{r.noches > 1 ? "s" : ""} · <b className="text-primary">{fmtDinero(r.total)}</b> <span className="text-xs text-muted">(IVA incl.)</span></span>
                    </div>
                  </div>

                  {/* Acciones según el estado de la reserva */}
                  <div className="flex flex-row flex-wrap items-center gap-2 border-t border-line pt-4 sm:flex-col sm:items-stretch sm:border-0 sm:pt-0">
                    <button onClick={() => setDetalle(r)} className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary-soft">
                      <IconoOjo size={14} /> Ver detalle
                    </button>
                    {sePuedeCancelar(r) && (
                      <button onClick={() => setPorCancelar(r)} className="flex items-center justify-center gap-1.5 rounded-lg border border-danger/30 px-4 py-2 text-xs font-bold text-danger transition-colors hover:bg-[#FEF2F2]">
                        <IconoX size={14} /> Cancelar reserva
                      </button>
                    )}
                    {r.estado === "completada" && !r.calificada && (
                      <button onClick={() => setPorCalificar(r)} className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent-dark active:scale-95">
                        <IconoEstrella size={14} /> Calificar estadía
                      </button>
                    )}
                    {r.estado === "completada" && r.calificada && (
                      <span className="flex items-center justify-center gap-1.5 rounded-lg bg-[#DCFCE7] px-4 py-2 text-xs font-bold text-[#166534]">
                        <IconoEstrella size={14} llena /> Ya calificaste
                      </span>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Modal de detalle de la reserva */}
      <Modal abierto={!!detalle} alCerrar={() => setDetalle(null)} ancho="max-w-md">
        {detalle && (
          <DetalleReserva r={detalle} alCerrar={() => setDetalle(null)} />
        )}
      </Modal>

      {/* Modal de confirmación de cancelación (texto oficial del proyecto) */}
      <Modal abierto={!!porCancelar} alCerrar={() => setPorCancelar(null)} ancho="max-w-md">
        <div className="p-7 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEE2E2] text-danger"><IconoX size={28} /></span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink">¿Cancelar la reserva {porCancelar?.folio}?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            ¿Seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setPorCancelar(null)} className="rounded-lg border-2 border-line px-5 py-2.5 text-sm font-bold text-muted transition-colors hover:border-ink/30 hover:text-ink">
              Conservar reserva
            </button>
            <button onClick={cancelar} className="rounded-lg bg-danger px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#B91C1C] active:scale-95">
              Sí, cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de calificación (HU-006) */}
      {porCalificar && (
        <ModalCalificar
          reserva={porCalificar}
          hotelNombre={hotelDe(porCalificar)?.nombre ?? ""}
          alCerrar={() => setPorCalificar(null)}
          alEnviar={(estrellas, comentario) => {
            calificar(porCalificar.folio, porCalificar.hotelId, estrellas, comentario);
            avisar("¡Gracias! Tu calificación ya cuenta para el promedio del hotel.", "ok");
            setPorCalificar(null);
          }}
        />
      )}
    </main>
  );
}

// ----- Vista detallada de una reserva -----
function DetalleReserva({ r, alCerrar }: { r: Reserva; alCerrar: () => void }) {
  const { hoteles } = useApp();
  const h = hoteles.find((x) => x.id === r.hotelId);
  const hab = HABITACIONES_SEED.find((x) => x.id === r.habitacionId);
  const pagoTxt = r.pago === "tarjeta" ? "Tarjeta" : r.pago === "efectivo" ? "Efectivo en recepción" : "Transferencia bancaria";
  void alCerrar;
  return (
    <div className="p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Folio de reserva</p>
          <p className="font-mono text-xl font-bold text-primary-dark">{r.folio}</p>
        </div>
        <BadgeEstado estado={r.estado} />
      </div>
      <div className="mt-5 overflow-hidden rounded-xl">
        <img src={h?.imagen} alt={h?.nombre} className="h-40 w-full object-cover" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{h?.nombre}</h3>
      <p className="text-sm text-muted">{hab?.tipo} · {r.huespedes} huésped{r.huespedes > 1 ? "es" : ""}</p>
      <div className="mt-4 grid gap-2 rounded-xl bg-canvas p-4 text-sm">
        <p className="flex justify-between"><span className="text-muted">Llegada</span><b className="text-ink">{fmtFecha(r.llegada)}</b></p>
        <p className="flex justify-between"><span className="text-muted">Salida</span><b className="text-ink">{fmtFecha(r.salida)}</b></p>
        <p className="flex justify-between"><span className="text-muted">Noches</span><b className="text-ink">{r.noches}</b></p>
        <p className="flex justify-between"><span className="text-muted">Subtotal</span><b className="text-ink">{fmtDinero(r.subtotal)}</b></p>
        <p className="flex justify-between"><span className="text-muted">IVA (15%)</span><b className="text-ink">{fmtDinero(r.iva)}</b></p>
        <p className="flex justify-between border-t border-line pt-2 text-base"><span className="font-semibold text-muted">Total</span><b className="font-display text-primary">{fmtDinero(r.total)}</b></p>
        <p className="flex justify-between"><span className="text-muted">Método de pago</span><b className="text-ink">{pagoTxt}</b></p>
      </div>
    </div>
  );
}

// ----- Modal para calificar la estadía -----
function ModalCalificar({
  reserva, hotelNombre, alCerrar, alEnviar,
}: {
  reserva: Reserva;
  hotelNombre: string;
  alCerrar: () => void;
  alEnviar: (estrellas: number, comentario: string) => void;
}) {
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");
  void reserva;
  return (
    <Modal abierto alCerrar={alCerrar} ancho="max-w-md">
      <div className="p-7">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Calificar estadía</p>
        <h3 className="mt-1 font-display text-xl font-bold text-ink">¿Cómo la pasaste en {hotelNombre}?</h3>
        <p className="mt-1.5 text-sm text-muted">Tu opinión ayuda a otros viajeros y mejora el promedio del hotel.</p>

        <div className="mt-6 flex justify-center">
          <EstrellasInput valor={estrellas} alCambiar={(v) => { setEstrellas(v); setError(""); }} />
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-accent-dark">
          {estrellas > 0 ? `${estrellas} de 5 estrellas` : "Toca las estrellas para calificar"}
        </p>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          placeholder="Cuéntanos sobre tu estadía (opcional)..."
          className="mt-5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25"
        />

        {error && <p role="alert" className="anim-pop mt-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2 text-sm font-semibold text-[#B91C1C]">{error}</p>}

        <button
          onClick={() => {
            if (estrellas < 1 || estrellas > 5) {
              setError("La calificación debe estar entre 1 y 5 estrellas.");
              return;
            }
            alEnviar(estrellas, comentario);
          }}
          className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.98]"
        >
          Enviar calificación
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// Favoritos (HU-010)
// ============================================================
export function Favoritos({ navegar }: { navegar: Navegar }) {
  const { hoteles, favoritos } = useApp();
  const favs = hoteles.filter((h) => favoritos.includes(h.id) && h.aprobado === "aprobado");
  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF2F2] text-danger"><IconoCorazon size={20} lleno /></span>
          <div>
            <TituloSeccion ceja="Guardados con cariño" titulo="Mis favoritos" />
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">{favs.length} hotel{favs.length !== 1 && "es"} en tu lista · se guardan en tu navegador</p>
      </Reveal>

      {favs.length === 0 ? (
        <div className="mt-8">
          <EstadoVacio
            titulo="Tu lista de favoritos está vacía"
            detalle="Toca el corazón en cualquier hotel para guardarlo aquí y encontrarlo rápido en tu próximo viaje."
            accion={
              <button onClick={() => navegar({ nombre: "resultados" })} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
                Explorar hoteles
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((h, i) => (
            <Reveal key={h.id} delay={i * 90}>
              <TarjetaHotel hotel={h} navegar={navegar} />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal delay={200}>
        <p className="mt-10 flex items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white/60 px-5 py-4 text-center text-xs font-medium text-muted">
          <IconoLlave size={14} className="text-primary" />
          Fase 1: los favoritos se guardan en tu navegador (localStorage). En Fase 2 se sincronizarán con tu cuenta.
        </p>
      </Reveal>
    </main>
  );
}
