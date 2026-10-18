// ============================================================
// Hotelica — Inscripción pública de un hotel (HU-021)
// Cualquiera llena este formulario sin cuenta; la solicitud le
// llega al administrador, que revisa y crea la cuenta de hotelero
// ============================================================
import { useRef, useState } from "react";
import { useApp } from "../store";
import {
  DEPARTAMENTOS, MUNICIPIOS, validarRegistroHotel, validarImagenHotel, soloDigitosTelefono,
} from "../data";
import type { DatosRegistroHotel, ErroresRegistroHotel, Hotel } from "../data";
import { Reveal } from "../ui";
import { MapaHotel } from "../mapa";
import { IconoCheck, IconoPin } from "../icons";

// Formulario en blanco para inscribir un hotel
const FORM_VACIO: DatosRegistroHotel = {
  dueno: "",
  correo: "",
  nombre: "",
  departamentoId: "",
  municipioId: "",
  direccion: "",
  ubicacion: null,
  descripcion: "",
  telefono: "",
  imagen: "",
};

export function InscribeHotel({ enVentana = false }: { enVentana?: boolean }) {
  const { hoteles, registrarHotel, avisar, usuario } = useApp();

  const [registro, setRegistro] = useState<DatosRegistroHotel>(() =>
    // Si ya hay sesión, prellenamos los datos del dueño
    usuario ? { ...FORM_VACIO, dueno: usuario.nombre, correo: usuario.correo } : FORM_VACIO
  );
  const [errores, setErrores] = useState<ErroresRegistroHotel>({});
  const [enviado, setEnviado] = useState(false);
  const [solicitud, setSolicitud] = useState<Hotel | null>(null);
  const inputImagen = useRef<HTMLInputElement>(null);

  // Consulta pública de estado de la solicitud (HU-021)
  const [correoConsulta, setCorreoConsulta] = useState("");
  const [resultadoConsulta, setResultadoConsulta] = useState<
    | { tipo: "pendiente"; hotel: Hotel }
    | { tipo: "aprobado"; hotel: Hotel; cuenta: { correo: string; contrasena: string } }
    | { tipo: "rechazado"; hotel: Hotel }
    | { tipo: "no-encontrado" }
    | null
  >(null);

  // Los municipios se filtran según el departamento elegido
  const municipiosDelDepto = MUNICIPIOS.filter((m) => m.departamentoId === registro.departamentoId);

  // Centro del municipio elegido: ahí abre el mapa y ahí cae el pin por defecto (HU-037)
  const centroMunicipio = MUNICIPIOS.find((m) => m.id === registro.municipioId)?.centro ?? null;

  // Actualiza un campo y borra su error en cuanto el usuario escribe de nuevo
  const cambiarCampo = (campo: keyof DatosRegistroHotel, valor: string) => {
    setRegistro((r) => ({ ...r, [campo]: valor }));
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  };

  // Al cambiar el departamento volvemos a elegir el municipio (y su pin)
  const cambiarDepartamento = (id: string) => {
    setRegistro((r) => ({ ...r, departamentoId: id, municipioId: "", ubicacion: null }));
    setErrores((e) => ({ ...e, departamentoId: undefined, municipioId: undefined, ubicacion: undefined }));
  };

  // Al elegir el municipio ubicamos el pin en su centro: el dueño lo
  // afina con un clic si la entrada del hotel está en otro punto
  const cambiarMunicipio = (id: string) => {
    const centro = MUNICIPIOS.find((m) => m.id === id)?.centro ?? null;
    setRegistro((r) => ({ ...r, municipioId: id, ubicacion: centro }));
    setErrores((e) => ({ ...e, municipioId: undefined, ubicacion: undefined }));
  };

  // Lee la foto elegida y la deja como imagen representativa
  const elegirImagen = (archivo: File | undefined) => {
    if (!archivo) return;
    const errorImagen = validarImagenHotel(archivo);
    if (errorImagen) {
      setErrores((e) => ({ ...e, imagen: errorImagen }));
      setRegistro((r) => ({ ...r, imagen: "" }));
      if (inputImagen.current) inputImagen.current.value = "";
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      setRegistro((r) => ({ ...r, imagen: String(lector.result) }));
      setErrores((e) => ({ ...e, imagen: undefined }));
    };
    lector.onerror = () => setErrores((e) => ({ ...e, imagen: "No se pudo leer la imagen: probá con otra." }));
    lector.readAsDataURL(archivo);
  };

  // Envía la solicitud solo si todos los campos pasan las validaciones
  const enviarSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);

    const errs = validarRegistroHotel(registro, hoteles);
    setErrores(errs);
    if (Object.keys(errs).length > 0) {
      avisar("Revisá los campos marcados: faltan datos para enviar.", "error");
      return;
    }

    const resultado = registrarHotel(registro);
    if (resultado.errores) {
      setErrores(resultado.errores);
      avisar("No se pudo enviar la solicitud.", "error");
      return;
    }

    setSolicitud(resultado.hotel ?? null);
    setRegistro(FORM_VACIO);
    setEnviado(false);
    if (inputImagen.current) inputImagen.current.value = "";
    avisar("Solicitud enviada: un administrador va a revisar tu hotel.", "ok");
  };

  // Vuelve al formulario para inscribir otro hotel
  const inscribirOtro = () => {
    setSolicitud(null);
    setErrores({});
    setEnviado(false);
  };

  // Busca la solicitud por el correo del dueño y muestra el estado
  const consultarEstado = (e: React.FormEvent) => {
    e.preventDefault();
    const correo = correoConsulta.trim().toLowerCase();
    if (!correo) {
      avisar("Ingresá el correo con el que inscribiste tu hotel.", "error");
      return;
    }

    const hotel = hoteles.find((h) => h.correoDueno?.toLowerCase() === correo);
    if (!hotel) {
      setResultadoConsulta({ tipo: "no-encontrado" });
      return;
    }

    if (hotel.aprobado === "pendiente") {
      setResultadoConsulta({ tipo: "pendiente", hotel });
    } else if (hotel.aprobado === "rechazado") {
      setResultadoConsulta({ tipo: "rechazado", hotel });
    } else {
      // Aprobado: por seguridad NUNCA mostramos la contraseña acá, solo el estado
      setResultadoConsulta({ tipo: "aprobado", hotel, cuenta: { correo: hotel.correoDueno ?? correo, contrasena: "" } });
    }
  };

  // Estilo de los campos del formulario (mismo criterio que el resto del sitio)
  const claseCampo = "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2";
  const claseCampoNormal = `${claseCampo} border-line focus:border-primary focus:ring-primary/25`;
  const claseCampoError = `${claseCampo} border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25`;
  const hayErrores = enviado && Object.values(errores).some(Boolean);

  return (
    <section
      className={enVentana ? "" : "mx-auto max-w-7xl px-4 pt-24 sm:px-6"}
      aria-label="Inscribir un hotel"
    >
      <Reveal>
        <div className={`overflow-hidden ${enVentana ? "" : "rounded-2xl border border-line bg-white shadow-lift"}`}>
          {/* Encabezado de la sección */}
          <div className="relative bg-gradient-to-br from-primary to-primary-deep px-7 py-10 sm:px-12">
            <span className="dot-texture-light absolute inset-0 opacity-40" />
            <div className="relative max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Para hoteleros</p>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                Inscribe tu hotel y que toda Nicaragua te encuentre
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-teal-100/85">
                Completá el formulario sin necesidad de cuenta. El administrador revisa tu solicitud y,
                al aprobarla, te crea tu cuenta de hotelero para entrar a tu panel.
              </p>
            </div>
          </div>

          {solicitud ? (
            /* Aviso de éxito: la solicitud quedó enviada para revisión */
            <div className="p-7 sm:p-10">
              <div className="anim-pop rounded-xl border border-[#FCD34D] bg-accent-light p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-hotel"><IconoCheck size={22} /></span>
                    <div>
                      <p className="font-display text-xl font-bold text-ink">{solicitud.nombre}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#92400E]">Solicitud enviada</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#92400E]">Pendiente</span>
                </div>
                <p className="mt-4 text-sm font-medium leading-relaxed text-[#92400E]">
                  <b>Tu solicitud está en revisión.</b> El resultado te aparecerá en tu correo
                  electrónico ({solicitud.correoDueno}): si tu hotel es aprobado, ahí recibirás
                  también tu cuenta de hotelero para entrar a tu panel.
                </p>
                <button
                  type="button"
                  onClick={inscribirOtro}
                  className="mt-5 rounded-lg border-2 border-[#FCD34D] px-4 py-2 text-xs font-bold text-[#92400E] transition-colors hover:bg-white"
                >
                  Inscribir otro hotel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={enviarSolicitud} noValidate className="grid gap-5 p-7 sm:grid-cols-2 sm:p-10">
              {/* Aviso general cuando se intentó enviar con errores */}
              {hayErrores && (
                <p role="alert" className="anim-pop rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C] sm:col-span-2">
                  Revisá los campos marcados: faltan datos o alguno no es válido.
                </p>
              )}

              {/* Datos del dueño (con ellos se crea la cuenta) */}
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Tu nombre (dueño)</span>
                <input
                  type="text"
                  value={registro.dueno}
                  onChange={(e) => cambiarCampo("dueno", e.target.value)}
                  maxLength={60}
                  placeholder="Ej: María Fernández López"
                  className={errores.dueno ? claseCampoError : claseCampoNormal}
                />
                {errores.dueno && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.dueno}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Tu correo</span>
                <input
                  type="email"
                  value={registro.correo}
                  onChange={(e) => cambiarCampo("correo", e.target.value)}
                  maxLength={80}
                  placeholder="Ej: dueno@tuhotel.com"
                  className={errores.correo ? claseCampoError : claseCampoNormal}
                />
                <p className="mt-1 text-[11px] text-muted">Ahí vas a recibir tu cuenta de hotelero cuando el admin te apruebe.</p>
                {errores.correo && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.correo}</p>
                )}
              </label>

              {/* Datos del hotel */}
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Nombre del hotel</span>
                <input
                  type="text"
                  value={registro.nombre}
                  onChange={(e) => cambiarCampo("nombre", e.target.value)}
                  maxLength={60}
                  placeholder="Ej: Hotel Mirador de Ometepe"
                  className={errores.nombre ? claseCampoError : claseCampoNormal}
                />
                {errores.nombre && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.nombre}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Departamento</span>
                <select
                  value={registro.departamentoId}
                  onChange={(e) => cambiarDepartamento(e.target.value)}
                  className={errores.departamentoId ? claseCampoError : claseCampoNormal}
                >
                  <option value="">Elegí un departamento</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
                {errores.departamentoId && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.departamentoId}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Municipio</span>
                <select
                  value={registro.municipioId}
                  onChange={(e) => cambiarMunicipio(e.target.value)}
                  disabled={!registro.departamentoId}
                  className={`${errores.municipioId ? claseCampoError : claseCampoNormal} disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted`}
                >
                  <option value="">
                    {registro.departamentoId ? "Elegí un municipio" : "Elegí primero el departamento"}
                  </option>
                  {municipiosDelDepto.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
                {errores.municipioId && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.municipioId}</p>
                )}
              </label>

              {/* Ubicación exacta en el mapa (HU-037): el pin arranca en el
                  centro del municipio y el dueño lo mueve a la entrada real */}
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Ubicación exacta</span>
                <p className="mb-2 text-[11px] text-muted">
                  {registro.municipioId
                    ? "Hacé clic en el mapa para dejar el pin en la entrada de tu hotel (o arrastralo para afinarlo)."
                    : "Elegí el departamento y el municipio: el mapa se abre sobre tu zona y ahí marcás la entrada exacta."}
                </p>
                <div className={errores.ubicacion ? "rounded-xl border border-[#FCA5A5]" : ""}>
                  <MapaHotel
                    variante="selector"
                    nombre={registro.nombre || "tu hotel"}
                    punto={registro.ubicacion}
                    centro={centroMunicipio}
                    zoom={13}
                    altura="h-72 sm:h-80"
                    alCambiar={(p) => {
                      setRegistro((r) => ({ ...r, ubicacion: p }));
                      setErrores((e) => ({ ...e, ubicacion: undefined }));
                    }}
                  />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                  <IconoPin size={12} className="text-primary" />
                  {registro.ubicacion ? (
                    <span className="tabular-nums">
                      Latitud {registro.ubicacion.lat.toFixed(4)} · Longitud {registro.ubicacion.lng.toFixed(4)}
                    </span>
                  ) : (
                    "Sin marcar: elegí un municipio para empezar."
                  )}
                </p>
                {errores.ubicacion && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.ubicacion}</p>
                )}
              </div>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Dirección</span>
                <input
                  type="text"
                  value={registro.direccion}
                  onChange={(e) => cambiarCampo("direccion", e.target.value)}
                  maxLength={120}
                  placeholder="Ej: Frente al malecón, costado sur de la bahía"
                  className={errores.direccion ? claseCampoError : claseCampoNormal}
                />
                {errores.direccion && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.direccion}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Teléfono (opcional)</span>
                <input
                  type="tel"
                  value={registro.telefono}
                  onChange={(e) => cambiarCampo("telefono", soloDigitosTelefono(e.target.value))}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={8}
                  placeholder="Ej: 88881234"
                  className={errores.telefono ? claseCampoError : claseCampoNormal}
                />
                <p className="mt-1 text-[11px] text-muted">8 dígitos, empezando por 2, 5, 7 u 8.</p>
                {errores.telefono && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.telefono}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Descripción</span>
                <textarea
                  value={registro.descripcion}
                  onChange={(e) => cambiarCampo("descripcion", e.target.value)}
                  maxLength={600}
                  rows={4}
                  placeholder="Contá qué ofrece el hotel, cómo es el lugar y para quién es ideal..."
                  className={`${errores.descripcion ? claseCampoError : claseCampoNormal} resize-y`}
                />
                <p className="mt-1 text-[11px] text-muted">{registro.descripcion.length}/600 caracteres (mínimo 30).</p>
                {errores.descripcion && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.descripcion}</p>
                )}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Imagen representativa</span>
                <input
                  ref={inputImagen}
                  type="file"
                  accept="image/*"
                  onChange={(e) => elegirImagen(e.target.files?.[0])}
                  className={`block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent-light file:px-4 file:py-2 file:text-xs file:font-bold file:text-hotel transition-colors hover:file:bg-accent hover:file:text-white ${errores.imagen ? "border border-[#FCA5A5] p-2" : ""}`}
                />
                <p className="mt-1 text-[11px] text-muted">JPG, PNG o WEBP de hasta 5 MB. Es obligatoria al menos una.</p>
                {registro.imagen && (
                  <img
                    src={registro.imagen}
                    alt="Vista previa de la imagen representativa"
                    className="mt-3 h-36 w-full rounded-lg border border-line object-cover"
                  />
                )}
                {errores.imagen && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.imagen}</p>
                )}
              </label>

              {/* Qué pasa después de enviar, en una frase al lado del botón
                  (HU-036): reemplaza a las tres tarjetas numeradas que cerraban
                  el formulario y repetían lo que ya dice el encabezado */}
              <div className="flex flex-col items-start gap-4 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-end">
                <p className="max-w-md text-xs leading-relaxed text-muted">
                  Un administrador del equipo de Hotelica revisa tu solicitud y, si el hotel cumple los requisitos,
                  tu cuenta de hotelero llega al correo que dejaste arriba.
                </p>
                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-dark hover:shadow-lg active:scale-[0.97]"
                >
                  <IconoCheck size={16} />
                  Finalizar solicitud
                </button>
              </div>
            </form>
          )}
        </div>
      </Reveal>

      {/* ===== Consulta pública de estado de la solicitud ===== */}
      <Reveal delay={100}>
        <div className={enVentana ? "mt-5 rounded-xl border border-line p-5 sm:p-6" : "mt-6 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8"}>
          <h3 className="font-display text-lg font-bold text-ink">¿Ya inscribiste tu hotel? Consulta el estado</h3>
          <p className="mt-1 text-sm text-muted">
            Ingresá el correo que usaste al inscribir tu hotel y mirá si ya fue aprobado.
          </p>

          <form onSubmit={consultarEstado} className="mt-4 flex flex-wrap gap-3 sm:flex-nowrap">
            <input
              type="email"
              value={correoConsulta}
              onChange={(e) => { setCorreoConsulta(e.target.value); setResultadoConsulta(null); }}
              placeholder="tu@correo.com"
              className={`${claseCampoNormal} flex-1`}
              aria-label="Correo para consultar estado"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
            >
              Consultar
            </button>
          </form>

          {resultadoConsulta && (
            <div className="anim-pop mt-4">
              {resultadoConsulta.tipo === "no-encontrado" && (
                <p className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
                  No encontramos ninguna solicitud con ese correo. Verificá que sea el mismo con el que inscribiste tu hotel.
                </p>
              )}

              {resultadoConsulta.tipo === "pendiente" && (
                <div className="rounded-lg border border-[#FCD34D] bg-[#FEF3C7] px-4 py-3">
                  <p className="text-sm font-bold text-[#92400E]">
                    Tu solicitud de <b>{resultadoConsulta.hotel.nombre}</b> está <b>Pendiente</b>.
                  </p>
                  <p className="mt-1 text-xs text-[#92400E]/80">
                    Un administrador la va a revisar pronto. Cuando sea aprobada vas a recibir un correo con tu cuenta de hotelero.
                  </p>
                </div>
              )}

              {resultadoConsulta.tipo === "rechazado" && (
                <div className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3">
                  <p className="text-sm font-bold text-[#B91C1C]">
                    La solicitud de <b>{resultadoConsulta.hotel.nombre}</b> fue <b>Rechazada</b>.
                  </p>
                  <p className="mt-1 text-xs text-[#B91C1C]/80">
                    Lamentablemente tu hotel no fue aprobado. Podés inscribirlo de nuevo con información actualizada.
                  </p>
                </div>
              )}

              {resultadoConsulta.tipo === "aprobado" && (
                <div className="rounded-lg border border-[#86EFAC] bg-[#F0FDF4] px-4 py-4">
                  <p className="text-sm font-bold text-[#166534]">
                    ¡Tu hotel <b>{resultadoConsulta.hotel.nombre}</b> fue <b>Aprobado</b>! Ya aparece en las búsquedas de Hotelica.
                  </p>
                  <p className="mt-2 text-xs text-[#166534]/80">
                    Tus credenciales de acceso se enviaron <b>solo</b> al correo que dejaste al inscribirte
                    ({resultadoConsulta.cuenta.correo}). Por seguridad no se muestran acá: revisá tu bandeja de entrada
                    y cambiá tu contraseña temporal en las primeras 24 horas.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
