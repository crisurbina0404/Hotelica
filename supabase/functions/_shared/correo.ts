// ============================================================
// Hotelica — Plantilla compartida de los correos transaccionales
// Los tres correos (cuenta de hotelero, comprobante de reserva y
// rechazo) salen de acá: misma retícula de 600 px, misma cabecera
// con el logo, mismo ritmo vertical (bloques cada 24 px) y la
// paleta oficial de la skill de diseño.
//
// Los correos se arman con <table> porque los clientes de correo no
// entienden flex ni grid, y con estilos en <style> más atributos
// inline porque Gmail descarta buena parte del CSS moderno.
// ============================================================

// El logo vive en el repositorio: los clientes de correo no muestran
// imágenes embebidas en data URI (por eso antes salía una imagen rota)
export const LOGO_URL =
  "https://raw.githubusercontent.com/crisurbina0404/Hotelica/main/public/logo-email.png";

// Paleta oficial (los mismos hex de src/index.css y de la skill hotelica-design)
export const COLOR = {
  teal: "#0B3540",
  tealOscuro: "#092A33",
  tealProfundo: "#07242C",
  tealTinta: "#051B21",
  dorado: "#F7A81B",
  doradoOscuro: "#D98A0B",
  doradoSuave: "#FDF0D7",
  crema: "#F8F6F0",
  tinta: "#1C2B30",
  apagado: "#5D6E73",
  linea: "#E4DFD2",
  marca: "#177E8C",
  marcaClara: "#8FD3DE",
  marcaOro: "#E0A83C",
  exitoFondo: "#DCFCE7",
  exitoTinta: "#166534",
  alertaFondo: "#FEF3C7",
  alertaTinta: "#92400E",
  infoFondo: "#DBEAFE",
  infoTinta: "#1D4ED8",
  errorFondo: "#FEE2E2",
  errorTinta: "#B91C1C",
  errorBorde: "#FCA5A5",
  tealSuave: "#D9E9EC",
  tealTenue: "#EFF5F6",
};

// Números de la cabecera: el ancho y el alto mantienen la proporción
// del archivo del logo (220 × 75)
const LOGO_ANCHO = 210;
const LOGO_ALTO = 72;

// Vacía los caracteres peligrosos para que un nombre o un motivo no
// logren meter HTML ni código dentro del correo
export function escaparHtml(texto: string): string {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Hoja de estilos común. Cada bloque mide lo mismo y respira lo mismo:
// 24 px de separación, 22 px de relleno lateral y 12 px de radio.
const ESTILOS = `
  body { margin: 0; padding: 24px 12px; background-color: ${COLOR.crema}; color: ${COLOR.tinta}; font-family: 'Plus Jakarta Sans', 'Segoe UI', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  table { border-collapse: collapse; }
  .oculto { display: none !important; visibility: hidden; opacity: 0; height: 0; width: 0; overflow: hidden; mso-hide: all; }

  /* Marco del correo: 600 px, borde de 1 px y la misma sombra suave de las tarjetas del sitio */
  .envoltura { width: 100%; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid ${COLOR.linea}; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 26px rgba(11, 53, 64, 0.12); }

  /* Cabecera de marca: teal profundo y filete dorado, igual en los tres correos */
  .cabecera { background-color: ${COLOR.teal}; padding: 32px 24px 26px; text-align: center; border-bottom: 3px solid ${COLOR.dorado}; }
  .logo { display: block; width: ${LOGO_ANCHO}px; height: auto; margin: 0 auto; border: 0; }
  .lema { margin: 14px 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2.4px; text-transform: uppercase; color: ${COLOR.marcaClara}; }
  .guion { color: ${COLOR.marcaOro}; }

  .contenido { padding: 32px; }
  .ceja { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: ${COLOR.marca}; }
  .titulo { margin: 10px 0 0; font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size: 26px; line-height: 1.25; font-weight: 700; color: ${COLOR.teal}; }
  .saludo { margin: 14px 0 0; font-size: 15px; line-height: 1.7; color: ${COLOR.apagado}; }
  .saludo strong { color: ${COLOR.tinta}; }

  /* Bloque realzado: folio, enlace de activación o motivo del rechazo */
  .destacado { margin: 24px 0 0; padding: 24px 22px; text-align: center; background: ${COLOR.doradoSuave}; border: 2px dashed ${COLOR.dorado}; border-radius: 12px; }
  .destacado-ceja { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: ${COLOR.doradoOscuro}; }
  .destacado-valor { margin: 8px 0 0; font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.15; font-weight: 800; color: ${COLOR.teal}; font-variant-numeric: tabular-nums; }
  .destacado-nota { margin: 8px 0 0; font-size: 13px; line-height: 1.65; color: ${COLOR.apagado}; }

  /* Variante del rechazo: el mismo bloque, en coral de la paleta (no en rojo inventado) */
  .destacado--alerta { background: ${COLOR.errorFondo}; border-color: ${COLOR.errorBorde}; }
  .destacado--alerta .destacado-ceja { color: ${COLOR.errorTinta}; }
  .destacado--alerta .destacado-valor { font-size: 16px; line-height: 1.65; font-weight: 700; color: ${COLOR.errorTinta}; }

  /* Bloques de datos: fondo crema, borde de 1 px y esquinas de 12 px */
  .bloque { margin: 24px 0 0; padding: 4px 22px 8px; background: ${COLOR.crema}; border: 1px solid ${COLOR.linea}; border-radius: 12px; }
  .bloque-titulo { margin: 18px 0 4px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: ${COLOR.teal}; }
  .datos { width: 100%; border-collapse: collapse; }
  .datos td { padding: 12px 0; font-size: 14px; line-height: 1.55; vertical-align: top; border-bottom: 1px solid ${COLOR.linea}; }
  .datos tr:last-child td { border-bottom: 0; }
  .etiqueta { color: ${COLOR.apagado}; font-weight: 500; }
  .valor { color: ${COLOR.tinta}; font-weight: 700; text-align: right; font-variant-numeric: tabular-nums; }

  /* Dos columnas iguales para fechas y huéspedes: la simetría es exacta */
  .pareja-celda { width: 50%; padding: 14px 2px; text-align: center; }
  .pareja-borde { border-right: 1px solid ${COLOR.linea}; }
  .pareja-etiqueta { display: block; font-size: 11px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; color: ${COLOR.apagado}; }
  .pareja-valor { display: block; margin-top: 5px; font-size: 14px; font-weight: 700; color: ${COLOR.tinta}; }

  .chip { display: inline-block; padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 800; letter-spacing: 0.3px; }

  /* Total: bloque teal con la cifra en dorado, igual que el resumen del sitio */
  .total { margin: 24px 0 0; padding: 24px 22px; background-color: ${COLOR.teal}; border-radius: 12px; text-align: center; }
  .total-ceja { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: ${COLOR.marcaClara}; }
  .total-monto { margin: 10px 0 0; font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.1; font-weight: 800; color: ${COLOR.dorado}; font-variant-numeric: tabular-nums; }
  .total-pie { margin: 14px 0 0; }

  .accion { margin: 24px 0 0; text-align: center; }
  .boton { display: inline-block; padding: 14px 30px; border-radius: 10px; font-size: 15px; font-weight: 800; text-decoration: none; background-color: ${COLOR.dorado}; color: ${COLOR.tealTinta}; }
  .boton--teal { background-color: ${COLOR.teal}; color: #FFFFFF; }

  .acceso-alternativo { margin: 16px 0 0; font-size: 12px; line-height: 1.6; color: ${COLOR.alertaTinta}; word-break: break-all; }
  .enlace { color: ${COLOR.marca}; font-weight: 700; text-decoration: underline; }

  .nota { margin: 24px 0 0; padding: 14px 16px; font-size: 13px; line-height: 1.7; color: ${COLOR.apagado}; background: ${COLOR.tealTenue}; border-left: 3px solid ${COLOR.marca}; border-radius: 8px; }

  .pie { padding: 26px 24px; text-align: center; background-color: ${COLOR.tealProfundo}; }
  .pie-marca { margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; font-weight: 700; letter-spacing: 5px; color: ${COLOR.crema}; }
  .pie-texto { margin: 10px 0 0; font-size: 12px; line-height: 1.7; color: ${COLOR.marcaClara}; }

  /* Celular: mismos bloques, una sola columna; las parejas también se apilan */
  @media only screen and (max-width: 480px) {
    body { padding: 12px 8px; }
    .envoltura { border-radius: 12px; }
    .cabecera { padding: 24px 14px 20px; }
    .logo { width: 168px; }
    .lema { font-size: 10px; letter-spacing: 1.6px; }
    .contenido { padding: 22px 18px 24px; }
    .titulo { font-size: 22px; }
    .saludo { font-size: 14px; }
    .destacado, .total { padding: 20px 16px; }
    .destacado-valor, .total-monto { font-size: 26px; }
    .destacado--alerta .destacado-valor { font-size: 15px; }
    .bloque { padding: 2px 16px 6px; }
    .datos td { display: block; width: 100%; text-align: left !important; border-bottom: 0; padding: 4px 0; }
    .datos tr { display: block; padding: 10px 0; border-bottom: 1px solid ${COLOR.linea}; }
    .datos tr:last-child { border-bottom: 0; }
    .etiqueta { font-size: 10px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }
    .valor { font-size: 15px; padding-top: 0; }
    .pareja-celda { display: block; width: 100%; padding: 12px 0; border-right: 0; }
    .pareja-celda + .pareja-celda { border-top: 1px solid ${COLOR.linea}; }
    .boton { display: block; text-align: center; }
    .pie { padding: 20px 16px; }
  }
`;

// Pastilla de estado con los colores por estado de la paleta (HU-034)
export function chip(fondo: string, tinta: string, texto: string): string {
  return `<span class="chip" style="background-color:${fondo};color:${tinta};">${texto}</span>`;
}

// Fila etiqueta/valor: etiqueta a la izquierda, valor a la derecha
export function fila(etiqueta: string, valor: string): string {
  return `<tr><td class="etiqueta" align="left">${etiqueta}</td><td class="valor" align="right">${valor}</td></tr>`;
}

// Dos celdas del mismo ancho, separadas por un filete: sirve para
// llegada/salida y para noches/huéspedes sin que la retícula se rompa
export function pareja(
  izquierda: { etiqueta: string; valor: string },
  derecha: { etiqueta: string; valor: string }
): string {
  return `<tr><td colspan="2" style="padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="pareja-celda pareja-borde" align="center" valign="top">
        <span class="pareja-etiqueta">${izquierda.etiqueta}</span>
        <span class="pareja-valor">${izquierda.valor}</span>
      </td>
      <td class="pareja-celda" align="center" valign="top">
        <span class="pareja-etiqueta">${derecha.etiqueta}</span>
        <span class="pareja-valor">${derecha.valor}</span>
      </td>
    </tr></table>
  </td></tr>`;
}

// Tabla de datos ya envuelta para que todas midan y respiren igual
export function tabla(filas: string): string {
  return `<table role="presentation" class="datos" width="100%" cellpadding="0" cellspacing="0" border="0">${filas}</table>`;
}

// Bloque crema con su título en mayúsculas
export function bloque(titulo: string, contenidoHtml: string): string {
  return `<div class="bloque"><p class="bloque-titulo">${titulo}</p>${contenidoHtml}</div>`;
}

// Botón de acción: dorado para la acción principal, teal para la secundaria
export function boton(texto: string, url: string, variante: "dorado" | "teal" = "dorado"): string {
  const clase = variante === "teal" ? "boton boton--teal" : "boton";
  return `<a class="${clase}" href="${url}">${texto}</a>`;
}

// Documento completo: cabecera de marca, contenido y pie
export function plantillaCorreo(opciones: {
  titulo: string; // <title> del documento
  previo: string; // texto de vista previa en la bandeja
  ceja: string;
  encabezado: string;
  contenido: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${opciones.titulo}</title>
  <style>${ESTILOS}</style>
</head>
<body>
  <div class="oculto">${opciones.previo}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <div class="envoltura">
          <div class="cabecera">
            <img class="logo" src="${LOGO_URL}" width="${LOGO_ANCHO}" height="${LOGO_ALTO}" alt="HOTELICA">
            <p class="lema"><span class="guion">—</span>&nbsp;&nbsp;Tu destino en Nicaragua&nbsp;&nbsp;<span class="guion">—</span></p>
          </div>

          <div class="contenido">
            <p class="ceja">${opciones.ceja}</p>
            <h1 class="titulo">${opciones.encabezado}</h1>
            ${opciones.contenido}
          </div>

          <div class="pie">
            <p class="pie-marca">HOTELICA</p>
            <p class="pie-texto">
              Plataforma turística de Nicaragua · Donde Nicaragua te recibe<br>
              Correo automático de Hotelica. Si necesitás ayuda, respondé a este mensaje y te contesta el equipo.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================
// Los tres correos, armados sobre la misma plantilla
// ============================================================

export type ChipCorreo = { texto: string; fondo: string; tinta: string };

// Comprobante de reserva: folio, detalle en parejas simétricas, pago y total
function chipDe(o: ChipCorreo | undefined): string {
  return o ? chip(o.fondo, o.tinta, o.texto) : "";
}

export function correoReserva(o: {
  folio: string;
  hotel: string;
  turista: string;
  llegada: string;
  salida: string;
  habitacion?: string;
  noches?: string | null;
  huespedes?: string | null;
  estado?: ChipCorreo;
  metodoPago?: string;
  estadoPago?: ChipCorreo;
  referencia?: string;
  subtotal?: string;
  iva?: string;
  total: string;
  urlApp: string;
}): string {
  const estadoChip = chipDe(o.estado);
  const pagoChip = chipDe(o.estadoPago);

  // Fechas y huéspedes van en parejas del mismo ancho; el estado cierra la tabla
  const filas =
    fila("Hotel", o.hotel) +
    (o.habitacion ? fila("Habitación", o.habitacion) : "") +
    pareja({ etiqueta: "Llegada", valor: o.llegada }, { etiqueta: "Salida", valor: o.salida }) +
    (o.noches && o.huespedes
      ? pareja({ etiqueta: "Noches", valor: o.noches }, { etiqueta: "Huéspedes", valor: o.huespedes })
      : (o.noches ? fila("Noches", o.noches) : "") + (o.huespedes ? fila("Huéspedes", o.huespedes) : "")) +
    (o.estado ? fila("Estado", estadoChip) : "");

  return plantillaCorreo({
    titulo: `Reserva ${o.folio} · ${o.hotel}`,
    previo: `Tu reserva en ${o.hotel} quedó registrada · Folio ${o.folio} · Total ${o.total}`,
    ceja: "Comprobante de reserva",
    encabezado: "Tu reserva quedó registrada",
    contenido: `
      <p class="saludo">Hola <strong>${o.turista}</strong>, ya tenés tu lugar en <strong>${o.hotel}</strong>. Abajo está el detalle, el total con IVA y el folio que te van a pedir al llegar.</p>

      <div class="destacado">
        <p class="destacado-ceja">Tu folio</p>
        <p class="destacado-valor">${o.folio}</p>
        <p class="destacado-nota">Mostralo en recepción el día de llegada</p>
      </div>

      ${bloque("Detalle de la reserva", tabla(filas))}

      ${o.metodoPago || o.estadoPago || o.referencia
        ? bloque("Pago", tabla(
            (o.metodoPago ? fila("Método", o.metodoPago) : "") +
            (o.estadoPago ? fila("Estado del pago", pagoChip) : "") +
            (o.referencia ? fila("Referencia", o.referencia) : "")
          ))
        : ""}

      ${o.subtotal || o.iva
        ? bloque("Resumen del pago", tabla(
            (o.subtotal ? fila("Subtotal", o.subtotal) : "") +
            (o.iva ? fila("IVA (15%)", o.iva) : "")
          ))
        : ""}

      <div class="total">
        <p class="total-ceja">Total a pagar (IVA incluido)</p>
        <p class="total-monto">${o.total}</p>
        ${estadoChip ? `<p class="total-pie">${estadoChip}</p>` : ""}
      </div>

      <div class="accion">${boton("Entrar a Hotelica", o.urlApp, "teal")}</div>

      <p class="nota">Llegá después de las 2:00 p. m. y dejá la habitación antes de las 11:00 a. m. Llevá tu cédula o pasaporte: sin identificación no se puede completar el check-in. Para cambiar o cancelar la reserva, entrá a <strong>Mis reservas</strong> desde tu cuenta.</p>
    `,
  });
}

// Aviso de aprobación: el botón del enlace de un solo uso manda sobre todo lo demás
export function correoCuentaHotelero(o: {
  nombre: string;
  hotel: string;
  correo: string;
  enlace: string;
  enlaceVisible: string;
  urlApp: string;
}): string {
  return plantillaCorreo({
    titulo: `Tu cuenta de hotelero · ${o.hotel}`,
    previo: `${o.hotel} ya aparece en Hotelica · Elegí tu contraseña para entrar a tu panel`,
    ceja: "Cuenta de hotelero",
    encabezado: "Tu hotel ya está en Hotelica",
    contenido: `
      <p class="saludo">Hola <strong>${o.nombre}</strong>, aprobamos la inscripción de <strong>${o.hotel}</strong>: ya aparece en las búsquedas y puede recibir reservas. Falta un paso para entrar a tu panel: elegir tu contraseña.</p>

      <div class="destacado">
        <p class="destacado-ceja">Activa tu cuenta</p>
        <p class="destacado-nota">El enlace sirve una sola vez y vence pronto. Abrilo en este mismo dispositivo, elegí una contraseña segura y quedás dentro del panel.</p>
        <div class="accion">${boton("Definir mi contraseña", o.enlace)}</div>
        <p class="acceso-alternativo">Si el botón no abre, copiá este enlace en tu navegador:<br>${o.enlace}</p>
      </div>

      ${bloque("Tu cuenta", tabla(
        fila("Hotel", o.hotel) +
        fila("Correo de acceso", o.correo) +
        fila("Rol", "Hotelero")
      ))}

      ${bloque("Cómo entrar la primera vez", tabla(
        fila("1. Definí tu contraseña", "Con el botón de arriba") +
        fila("2. Abrí Hotelica", `<a class="enlace" href="${o.urlApp}">${o.enlaceVisible}</a>`) +
        fila("3. Ingresá con", "Tu correo y la contraseña que elegiste")
      ))}

      <p class="nota">En el panel vas a poder confirmar reservas, registrar check-ins y check-outs y seguir la ocupación de tu hotel. Si el enlace vence o no abre, pedile uno nuevo al administrador. Nunca te vamos a pedir tu contraseña por correo ni por teléfono.</p>
    `,
  });
}

// Rechazo: el motivo ocupa el bloque realzado, en coral de la paleta
export function correoRechazo(o: {
  dueno: string;
  hotel: string;
  motivo: string;
  enlaceVisible: string;
  urlApp: string;
}): string {
  return plantillaCorreo({
    titulo: `Sobre la inscripción de ${o.hotel} · Hotelica`,
    previo: `Revisamos ${o.hotel} y te contamos qué falta para publicarlo`,
    ceja: "Inscripción de hotel",
    encabezado: "Todavía no podemos publicar tu hotel",
    contenido: `
      <p class="saludo">Hola <strong>${o.dueno}</strong>, revisamos la inscripción de <strong>${o.hotel}</strong> y por ahora no cumple los requisitos para publicarse. Abajo está el motivo tal como lo anotó nuestro equipo.</p>

      <div class="destacado destacado--alerta">
        <p class="destacado-ceja">Motivo de la decisión</p>
        <p class="destacado-valor">${o.motivo}</p>
      </div>

      ${bloque("Qué podés hacer", tabla(
        fila("1. Revisá el motivo", "Es lo que falta corregir") +
        fila("2. Corregí y volvé a inscribir", `<a class="enlace" href="${o.urlApp}">${o.enlaceVisible}</a>`) +
        fila("3. Te revisamos de nuevo", "Te escribimos con la decisión")
      ))}

      <div class="accion">${boton("Volver a inscribir mi hotel", o.urlApp)}</div>

      <p class="nota">No perdés nada de lo que cargaste: corregí lo que señala el motivo y enviá la inscripción otra vez. Si algo no queda claro, respondé a este correo y lo revisamos con vos.</p>
    `,
  });
}
