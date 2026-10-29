// ============================================================
// Hotelica — Sección de estadísticas globales (HU-034)
// Consume los datos del contexto, los valida con estadisticas.ts
// y muestra las métricas globales del panel de administración.
// ============================================================
import { useMemo, useState } from "react";
import { useApp } from "../store";
import { fmtDinero, fmtFechaHora } from "../data";
import { calcularEstadisticasGlobales } from "../estadisticas";
import { exportarEstadisticasExcel, exportarEstadisticasPDF } from "../exportarEstadisticas";
import { EstadoVacio, Reveal, Spinner, TarjetaMetrica, TituloSeccion } from "../ui";
import {
  IconoBillete, IconoCalendario, IconoDescargar, IconoHotel, IconoUsuario,
} from "../icons";

type Exportando = "pdf" | "excel" | null;

export function EstadisticasGlobales() {
  const {
    hoteles, reservas, cuentasHotelero, avisar,
    sincronizando, errorSync, ultimaSync, reintentarSync,
  } = useApp();
  const [exportando, setExportando] = useState<Exportando>(null);
  const [errorExport, setErrorExport] = useState<string | null>(null);

  // Se recalcula automáticamente cuando cambian hoteles, reservas o cuentas
  const metricas = useMemo(
    () => calcularEstadisticasGlobales(hoteles, reservas, cuentasHotelero),
    [hoteles, reservas, cuentasHotelero],
  );

  // Solo mostramos esqueletos cuando no hay ningún dato local que enseñar
  const cargando = sincronizando && !metricas.hayDatos;

  // Los cuatro recuadros van del mismo índigo del rol: una sola familia, sin
  // semáforo de colores que despiste (la guía de colores es solo para estados)
  const tarjetas = [
    {
      titulo: "Usuarios activos",
      valor: metricas.usuariosActivos.toLocaleString("es-NI"),
      detalle: metricas.usuariosActivos > 0
        ? `${metricas.turistasActivos} turista${metricas.turistasActivos === 1 ? "" : "s"} · ${metricas.hotelerosActivos} hotelero${metricas.hotelerosActivos === 1 ? "" : "s"}`
        : "Sin actividad registrada",
      icono: <IconoUsuario size={19} />,
      color: "bg-admin-soft text-admin",
    },
    {
      titulo: "Hoteles registrados",
      valor: metricas.hotelesRegistrados.toLocaleString("es-NI"),
      detalle: `${metricas.hotelesAprobados} aprobado${metricas.hotelesAprobados === 1 ? "" : "s"} · ${metricas.hotelesPendientes} por aprobar`,
      icono: <IconoHotel size={19} />,
      color: "bg-admin-soft text-admin",
    },
    {
      titulo: "Total de reservas",
      valor: metricas.totalReservas.toLocaleString("es-NI"),
      detalle: `${metricas.reservasActivas} no cancelada${metricas.reservasActivas === 1 ? "" : "s"} · ${metricas.reservasCanceladas} cancelada${metricas.reservasCanceladas === 1 ? "" : "s"}`,
      icono: <IconoCalendario size={19} />,
      color: "bg-admin-soft text-admin",
    },
    {
      titulo: "Ingresos totales",
      valor: fmtDinero(metricas.ingresosTotales),
      detalle: "Suma de las reservas no canceladas",
      icono: <IconoBillete size={19} />,
      color: "bg-admin-soft text-admin",
      compacto: true,
    },
  ];

  // Exporta el reporte y avisa por toast si salió bien o si falló
  const exportar = async (tipo: "pdf" | "excel") => {
    setErrorExport(null);
    setExportando(tipo);

    try {
      if (tipo === "pdf") await exportarEstadisticasPDF(metricas);
      else await exportarEstadisticasExcel(metricas);
      avisar(
        `Reporte ${tipo === "pdf" ? "PDF" : "Excel"} exportado correctamente.`,
        "ok",
      );
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "No se pudo generar el reporte.";
      setErrorExport(mensaje);
      avisar(`No se pudo exportar el reporte: ${mensaje}`, "error");
    } finally {
      setExportando(null);
    }
  };

  return (
    <section className="mt-10" aria-label="Estadísticas globales">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <TituloSeccion ceja="Panel global" titulo="Estadísticas globales" />

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => void exportar("pdf")}
              disabled={!metricas.hayDatos || exportando !== null}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-admin px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#312E81] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {exportando === "pdf" ? <><Spinner size={15} /> Generando…</> : <><IconoDescargar size={15} /> Exportar PDF</>}
            </button>
            <button
              type="button"
              onClick={() => void exportar("excel")}
              disabled={!metricas.hayDatos || exportando !== null}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#15803D] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {exportando === "excel" ? <><Spinner size={15} /> Generando…</> : <><IconoDescargar size={15} /> Exportar Excel</>}
            </button>
          </div>
        </div>
      </Reveal>

      {/* Estado de la consulta: cargando, sincronizado o con error */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-muted" aria-live="polite">
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${sincronizando ? "bg-accent" : errorSync ? "bg-danger" : "bg-success"}`} />
          {sincronizando ? "Actualizando datos…" : errorSync ? "Datos locales" : "Datos sincronizados"}
        </span>
        {ultimaSync && !errorSync && <span>Última actualización: {fmtFechaHora(ultimaSync)}</span>}
        <span>Se actualiza automáticamente con cada cambio.</span>
      </div>

      {/* Error de consulta: la app sigue con los datos guardados localmente */}
      {errorSync && (
        <div role="alert" className="mt-4 rounded-xl border-2 border-[#FCA5A5] bg-[#FEF2F2] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-sm font-bold text-[#B91C1C]">No se pudieron consultar los datos remotos</p>
              <p className="mt-1 text-xs leading-relaxed text-[#B91C1C]/80">
                {errorSync}. Se muestran los datos guardados en este navegador para que puedas seguir trabajando.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void reintentarSync()}
              disabled={sincronizando}
              className="rounded-lg border border-[#FCA5A5] bg-white px-4 py-2 text-xs font-bold text-[#B91C1C] transition-colors hover:bg-[#FEE2E2] disabled:opacity-60"
            >
              {sincronizando ? "Reintentando…" : "Reintentar"}
            </button>
          </div>
        </div>
      )}

      {/* Validación en tiempo real de registros descartados */}
      {metricas.problemas.length > 0 && (
        <div role="status" className="mt-4 rounded-xl border border-[#FCD34D] bg-[#FEF3C7] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#92400E]">Validación de datos</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-[#92400E]/90">
            {metricas.problemas.map((problema) => <li key={problema}>{problema}</li>)}
          </ul>
          <p className="mt-2 text-[11px] text-[#92400E]/80">
            Esos registros se excluyeron de los totales para no distorsionar las métricas.
          </p>
        </div>
      )}

      {errorExport && (
        <p role="alert" className="mt-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-semibold text-[#B91C1C]">
          No se pudo generar el archivo: {errorExport}
        </p>
      )}

      {/* Estado sin datos */}
      {!cargando && !metricas.hayDatos ? (
        <div className="mt-6">
          <EstadoVacio
            titulo="Todavía no hay estadísticas"
            detalle="No encontramos hoteles ni reservas válidas para calcular las métricas globales. Cuando exista actividad, aparecerá acá."
            accion={errorSync ? (
              <button
                type="button"
                onClick={() => void reintentarSync()}
                className="rounded-lg bg-admin px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#312E81]"
              >
                Reintentar consulta
              </button>
            ) : undefined}
          />
        </div>
      ) : (
        <>
          {/* Tarjetas de métricas */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tarjetas.map((tarjeta, indice) => (
              <Reveal key={tarjeta.titulo} delay={indice * 70}>
                <TarjetaMetrica
                  titulo={tarjeta.titulo}
                  valor={tarjeta.valor}
                  detalle={tarjeta.detalle}
                  icono={tarjeta.icono}
                  color={tarjeta.color}
                  compacto={tarjeta.compacto}
                  cargando={cargando}
                />
              </Reveal>
            ))}
          </div>

          {/* Resumen del cálculo y regla de negocio aplicada */}
          <Reveal delay={120}>
            <div className="mt-4 grid gap-3 rounded-xl border border-line bg-white p-5 shadow-card sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Reservas no canceladas</p>
                <p className="mt-1 font-display text-xl font-extrabold text-ink tabular-nums">
                  {metricas.reservasActivas.toLocaleString("es-NI")}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Ticket promedio</p>
                <p className="mt-1 font-display text-xl font-extrabold text-ink tabular-nums">{fmtDinero(metricas.ticketPromedio)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">IVA incluido</p>
                <p className="mt-1 font-display text-xl font-extrabold text-ink tabular-nums">{fmtDinero(metricas.ivaTotal)}</p>
              </div>
              <p className="text-[11px] leading-relaxed text-muted sm:col-span-3">
                Los ingresos suman los totales de las reservas no canceladas. Las canceladas y los registros inválidos quedan fuera del cálculo.
              </p>
            </div>
          </Reveal>
        </>
      )}
    </section>
  );
}
