// ============================================================
// Hotelica — Modal de reserva (HU-003: reservar con cálculo de total)
// ============================================================
import { useState } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import type { Habitacion, Hotel, Reserva } from "../data";
import { calcularNoches, calcularTotales, fmtDinero, fmtFecha, hoyISO } from "../data";
import { Modal, Spinner } from "../ui";
import {
  IconoLlave, IconoTarjeta, IconoBillete, IconoBanco, IconoCheck,
  IconoCalendario, IconoHuespedes, IconoCama,
} from "../icons";

type Fase = "formulario" | "procesando" | "exito";

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
  const { crearReserva, disponiblesDe, avisar } = useApp();
  const [llegada, setLlegada] = useState(l0);
  const [salida, setSalida] = useState(s0);
  const [huespedes, setHuespedes] = useState(h0);
  const [pago, setPago] = useState<Reserva["pago"]>("tarjeta");
  const [error, setError] = useState("");
  const [fase, setFase] = useState<Fase>("formulario");
  const [reserva, setReserva] = useState<Reserva | null>(null);

  // Cálculo de negocio: noches, subtotal, IVA 15% y total
  const noches = calcularNoches(llegada, salida);
  const { subtotal, iva, total } = calcularTotales(habitacion.precio, Math.max(0, noches));
  const disponibles = disponiblesDe(habitacion.id, llegada, salida);

  // Valida las reglas de negocio antes de confirmar
  const confirmar = () => {
    if (salida <= llegada) {
      setError("La fecha de salida debe ser posterior a la fecha de llegada.");
      return;
    }
    if (huespedes < 1) {
      setError("El número de huéspedes debe ser mayor o igual a 1.");
      return;
    }
    if (huespedes > habitacion.capacidad) {
      setError("La habitación seleccionada no admite esa cantidad de huéspedes.");
      return;
    }
    if (disponibles <= 0) {
      setError("No hay habitaciones disponibles para este tipo en las fechas elegidas.");
      return;
    }
    setError("");
    setFase("procesando");

    // Simulamos el procesamiento y creamos la reserva con su folio
    setTimeout(() => {
      const nueva = crearReserva({
        hotelId: hotel.id,
        habitacionId: habitacion.id,
        turista: "María Fernández",
        llegada, salida, huespedes,
        noches, subtotal, iva, total, pago,
      });
      setReserva(nueva);
      setFase("exito");
      avisar(`Reserva ${nueva.folio} creada correctamente`, "ok");
    }, 900);
  };

  const claseCampo = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25";

  const metodos = [
    { id: "tarjeta", nombre: "Tarjeta", icono: <IconoTarjeta size={18} /> },
    { id: "efectivo", nombre: "Efectivo", icono: <IconoBillete size={18} /> },
    { id: "transferencia", nombre: "Transferencia", icono: <IconoBanco size={18} /> },
  ] as const;

  return (
    <Modal abierto alCerrar={fase === "procesando" ? () => {} : alCerrar} ancho="max-w-3xl">
      {fase !== "exito" ? (
        <div className="grid md:grid-cols-[1.2fr_1fr]">
          {/* ===== Columna de datos de la reserva ===== */}
          <div className="p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Nueva reserva</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">{hotel.nombre}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-muted">
              <IconoCama size={15} className="text-primary" /> {habitacion.tipo} · hasta {habitacion.capacidad} huéspedes
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted"><IconoCalendario size={12} /> Llegada</span>
                <input type="date" value={llegada} min={hoyISO()} onChange={(e) => setLlegada(e.target.value)} className={claseCampo} />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted"><IconoCalendario size={12} /> Salida</span>
                <input type="date" value={salida} min={llegada} onChange={(e) => setSalida(e.target.value)} className={claseCampo} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted"><IconoHuespedes size={12} /> Huéspedes</span>
                <input type="number" min={1} max={habitacion.capacidad} value={huespedes} onChange={(e) => setHuespedes(Number(e.target.value))} className={claseCampo} />
                <span className="mt-1 block text-[11px] text-muted">Capacidad máxima de esta habitación: {habitacion.capacidad}</span>
              </label>
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-muted">Método de pago (simulado)</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {metodos.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPago(m.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 text-xs font-bold transition-all ${
                    pago === m.id ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:border-primary/40"
                  }`}
                >
                  {m.icono} {m.nombre}
                </button>
              ))}
            </div>

            {error && (
              <p role="alert" className="anim-pop mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C]">
                {error}
              </p>
            )}
          </div>

          {/* ===== Columna del resumen de precio ===== */}
          <div className="flex flex-col border-t border-line bg-primary-soft/60 p-6 sm:p-7 md:border-l md:border-t-0">
            <p className="font-display text-base font-bold text-ink">Resumen de precio</p>
            <div className="mt-4 grid gap-2.5 text-sm">
              <p className="flex justify-between text-muted"><span>Precio por noche</span><b className="text-ink">{fmtDinero(habitacion.precio)}</b></p>
              <p className="flex justify-between text-muted"><span>Noches</span><b className="text-ink">{noches > 0 ? noches : "—"}</b></p>
              <p className="flex justify-between text-muted"><span>Subtotal</span><b className="text-ink">{fmtDinero(subtotal)}</b></p>
              <p className="flex justify-between text-muted"><span>IVA (15%)</span><b className="text-ink">{fmtDinero(iva)}</b></p>
              <p className="flex justify-between text-muted"><span>Disponibles</span><b className={disponibles > 0 ? "text-success" : "text-danger"}>{disponibles}</b></p>
            </div>

            <div className="mt-4 rounded-xl bg-primary-deep p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-200/80">Total a pagar</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-accent">{fmtDinero(total)}</p>
              <p className="mt-1 text-[11px] text-teal-200/70">{fmtFecha(llegada)} → {fmtFecha(salida)} · {huespedes} huésped{huespedes > 1 ? "es" : ""}</p>
            </div>

            <button
              onClick={confirmar}
              disabled={fase === "procesando"}
              className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-accent py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-dark hover:shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {fase === "procesando" ? (<><Spinner size={17} /> Procesando reserva...</>) : (<><IconoLlave size={17} /> Confirmar reserva</>)}
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
              Demostración: no se realiza ningún cargo real. La reserva queda en estado <b>Pendiente</b> hasta que el hotel la confirme.
            </p>
          </div>
        </div>
      ) : (
        /* ===== Pantalla de éxito con folio ===== */
        <div className="flex flex-col items-center px-6 py-12 text-center sm:px-12">
          <span className="anim-pop flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary">
            <IconoLlave size={38} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">¡Tu reserva fue realizada con éxito!</h2>
          <p className="mt-2 text-sm text-muted">Guarda tu folio: lo necesitarás para el check-in en recepción.</p>

          <p className="mt-5 rounded-xl border-2 border-dashed border-accent bg-accent-light px-8 py-3 font-display text-3xl font-extrabold tracking-wider text-accent-dark">
            {reserva?.folio}
          </p>

          {reserva && (
            <div className="mt-6 w-full max-w-sm rounded-xl border border-line bg-canvas p-5 text-left text-sm">
              <p className="flex justify-between py-1"><span className="text-muted">Hotel</span><b className="text-ink">{hotel.nombre}</b></p>
              <p className="flex justify-between py-1"><span className="text-muted">Habitación</span><b className="text-ink">{habitacion.tipo}</b></p>
              <p className="flex justify-between py-1"><span className="text-muted">Fechas</span><b className="text-ink">{fmtFecha(reserva.llegada)} → {fmtFecha(reserva.salida)}</b></p>
              <p className="flex justify-between py-1"><span className="text-muted">Huéspedes</span><b className="text-ink">{reserva.huespedes}</b></p>
              <p className="flex justify-between border-t border-line py-2 text-base"><span className="font-semibold text-muted">Total (IVA incluido)</span><b className="font-display text-primary">{fmtDinero(reserva.total)}</b></p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={() => { alCerrar(); navegar({ nombre: "reservas" }); }} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
              <IconoCheck size={16} /> Ver mis reservas
            </button>
            <button onClick={() => { alCerrar(); navegar({ nombre: "resultados" }); }} className="rounded-lg border-2 border-primary px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-soft">
              Seguir explorando
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
