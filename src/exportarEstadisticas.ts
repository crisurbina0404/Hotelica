// ============================================================
// Hotelica — Exportación del reporte de estadísticas (HU-034)
// PDF y Excel con la misma información que se ve en pantalla.
// Las librerías se cargan al hacer clic para no pesar en el inicio.
// ============================================================
import { fmtDinero, fmtFechaHora } from "./data";
import type { EstadisticasGlobales } from "./estadisticas";

// Colores de la marca usados en el PDF
const PROFUNDO: [number, number, number] = [11, 53, 64];
const ACENTO: [number, number, number] = [247, 168, 27];
const TEXTO: [number, number, number] = [28, 43, 48];
const MUTED: [number, number, number] = [93, 110, 115];
const CLARO: [number, number, number] = [248, 246, 240];

// Nombre del archivo con la fecha del día: hotelica-estadisticas-2026-10-26.pdf
function nombreArchivo(extension: "pdf" | "xlsx"): string {
  return `hotelica-estadisticas-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

// Texto de alcance para dejar claro de dónde salen las cifras
const ALCANCE = "Datos de la plataforma guardados en este navegador.";

// Genera el PDF con la marca, la fecha y las cuatro métricas de la HU
export async function exportarEstadisticasPDF(metricas: EstadisticasGlobales): Promise<void> {
  // jsPDF expone la clase como export nombrado en el build de navegador y de Node
  const { jsPDF: ConstructorPDF } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");

  const doc = new ConstructorPDF({ unit: "pt", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();

  // Cabecera con la identidad visual del proyecto
  doc.setFillColor(...PROFUNDO);
  doc.rect(0, 0, ancho, 112, "F");
  doc.setFillColor(...ACENTO);
  doc.rect(0, 108, ancho, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("HOTELICA", 40, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(143, 211, 222);
  doc.text("Tu destino en Nicaragua", 40, 70);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("Reporte de estadísticas globales", 40, 96);

  // Metadatos exigidos por la HU: fecha de generación y alcance
  doc.setTextColor(...TEXTO);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Fecha de generación:", 40, 142);
  doc.setFont("helvetica", "normal");
  doc.text(fmtFechaHora(metricas.calculadoEn), 155, 142);

  doc.setTextColor(...MUTED);
  doc.setFontSize(9);
  doc.text(ALCANCE, 40, 158);

  // Tabla principal con las métricas solicitadas
  autoTable(doc, {
    startY: 180,
    margin: { left: 40, right: 40 },
    head: [["Métrica", "Valor"]],
    body: [
      ["Usuarios activos", metricas.usuariosActivos.toLocaleString("es-NI")],
      ["Hoteles registrados", metricas.hotelesRegistrados.toLocaleString("es-NI")],
      ["Total de reservas", metricas.totalReservas.toLocaleString("es-NI")],
      ["Ingresos totales", fmtDinero(metricas.ingresosTotales)],
    ],
    theme: "grid",
    headStyles: {
      fillColor: PROFUNDO,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 11,
    },
    bodyStyles: { fontSize: 11, textColor: TEXTO },
    alternateRowStyles: { fillColor: CLARO },
    columnStyles: {
      0: { cellWidth: 240, fontStyle: "bold" },
      1: { halign: "right" },
    },
    styles: { font: "helvetica", cellPadding: 9, lineColor: [228, 223, 210], lineWidth: 0.5 },
  });

  // Detalle del cálculo, para auditar la regla de negocio
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...TEXTO);
  doc.text("Detalle del cálculo", 40, 390);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const detalle = [
    `Ingresos = suma del total de reservas NO canceladas.`,
    `Reservas no canceladas: ${metricas.reservasActivas.toLocaleString("es-NI")} · canceladas: ${metricas.reservasCanceladas.toLocaleString("es-NI")}.`,
    `IVA incluido en los ingresos: ${fmtDinero(metricas.ivaTotal)} · ticket promedio: ${fmtDinero(metricas.ticketPromedio)}.`,
    `Registros inválidos excluidos: ${metricas.registrosInvalidos.toLocaleString("es-NI")}.`,
  ];
  detalle.forEach((linea, indice) => {
    doc.text(linea, 40, 408 + indice * 15);
  });

  // Pie de página
  doc.setDrawColor(...CLARO);
  doc.line(40, alto - 66, ancho - 40, alto - 66);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "Hotelica · Reporte generado automáticamente · Las reservas canceladas no suman ingresos.",
    40,
    alto - 48,
  );

  doc.save(nombreArchivo("pdf"));
}

// Genera el Excel con una hoja de métricas y detalle del cálculo
export async function exportarEstadisticasExcel(metricas: EstadisticasGlobales): Promise<void> {
  const XLSX = await import("xlsx");

  const filas: (string | number)[][] = [
    ["HOTELICA — Estadísticas globales"],
    ["Fecha de generación", fmtFechaHora(metricas.calculadoEn)],
    ["Alcance", ALCANCE],
    [],
    ["Métrica", "Valor"],
    ["Usuarios activos", metricas.usuariosActivos],
    ["Hoteles registrados", metricas.hotelesRegistrados],
    ["Total de reservas", metricas.totalReservas],
    ["Ingresos totales (C$)", metricas.ingresosTotales],
    [],
    ["Detalle del cálculo", "Valor"],
    ["Reservas no canceladas", metricas.reservasActivas],
    ["Reservas canceladas", metricas.reservasCanceladas],
    ["IVA incluido (C$)", metricas.ivaTotal],
    ["Ticket promedio (C$)", Math.round(metricas.ticketPromedio * 100) / 100],
    ["Registros inválidos excluidos", metricas.registrosInvalidos],
    ["Regla de ingresos", "Suma del total de reservas no canceladas"],
  ];

  const hoja = XLSX.utils.aoa_to_sheet(filas);
  hoja["!cols"] = [{ wch: 34 }, { wch: 42 }];

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Estadísticas");
  XLSX.writeFile(libro, nombreArchivo("xlsx"));
}
