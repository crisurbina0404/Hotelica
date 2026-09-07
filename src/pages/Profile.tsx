// ============================================================
// Hotelica — Gestionar perfil (HU-005)
// El usuario autenticado puede consultar y editar sus datos
// ============================================================
import { useState } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import { Reveal, TituloSeccion } from "../ui";
import { IconoFlechaAtras, IconoUsuario, IconoCheck } from "../icons";

// Tipo para los errores de validación del formulario
type ErroresForm = {
  nombre?: string;
  telefono?: string;
  direccion?: string;
};

// Valida los campos del formulario y devuelve los errores encontrados
function validarCampos(nombre: string, telefono: string, direccion: string): ErroresForm {
  const errores: ErroresForm = {};

  if (!nombre.trim()) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (nombre.trim().length < 3) {
    errores.nombre = "El nombre debe tener al menos 3 caracteres.";
  }

  if (!telefono.trim()) {
    errores.telefono = "El teléfono es obligatorio.";
  } else if (!/^[\d\-\+\(\)\s]{7,}$/.test(telefono.trim())) {
    errores.telefono = "Ingresa un número de teléfono válido.";
  }

  if (!direccion.trim()) {
    errores.direccion = "La dirección es obligatoria.";
  } else if (direccion.trim().length < 5) {
    errores.direccion = "La dirección debe tener al menos 5 caracteres.";
  }

  return errores;
}

export function Perfil({ navegar }: { navegar: Navegar }) {
  const { usuario, actualizarPerfil, avisar } = useApp();

  // Estado del modo edición
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<ErroresForm>({});

  // Campos del formulario (se cargan con los datos actuales del usuario)
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [correo] = useState(usuario?.correo ?? "");
  const [telefono, setTelefono] = useState(usuario?.telefono ?? "");
  const [direccion, setDireccion] = useState(usuario?.direccion ?? "");

  // Valores originales para restaurar al cancelar
  const [originales, setOriginales] = useState({
    nombre: usuario?.nombre ?? "",
    telefono: usuario?.telefono ?? "",
    direccion: usuario?.direccion ?? "",
  });

  // Si no hay usuario autenticado, no debería llegar aquí (ruta protegida)
  if (!usuario) {
    navegar({ nombre: "inicio" });
    return null;
  }

  // Entrar en modo edición y guardar los valores actuales como respaldo
  const iniciarEdicion = () => {
    setOriginales({ nombre, telefono, direccion });
    setErrores({});
    setEditando(true);
  };

  // Restaurar valores originales y salir del modo edición
  const cancelarEdicion = () => {
    setNombre(originales.nombre);
    setTelefono(originales.telefono);
    setDireccion(originales.direccion);
    setErrores({});
    setEditando(false);
  };

  // Guardar los cambios del perfil
  const guardarCambios = async () => {
    const erroresEncontrados = validarCampos(nombre, telefono, direccion);
    setErrores(erroresEncontrados);

    // Si hay errores, no enviamos
    if (Object.keys(erroresEncontrados).length > 0) return;

    setCargando(true);
    const resultado = await actualizarPerfil({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
    });
    setCargando(false);

    if (resultado.error) {
      avisar(resultado.error, "error");
      return;
    }

    avisar("¡Guardado exitosamente!", "ok");
    setEditando(false);
  };

  // Estilo base de los campos del formulario
  const claseCampo =
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:ring-2 focus:ring-primary/25";
  const claseCampoNormal = `${claseCampo} border-line focus:border-primary`;
  const claseCampoError = `${claseCampo} border-[#FCA5A5] focus:border-[#EF4444] focus:ring-[#EF4444]/25`;
  const claseCampoBloqueado = `${claseCampo} border-line bg-canvas text-muted cursor-not-allowed`;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-12 pt-24 sm:px-6">
      {/* Encabezado con botón volver */}
      <Reveal>
        <button
          onClick={() => navegar({ nombre: "inicio" })}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-bold text-muted transition-all hover:border-primary/40 hover:text-primary hover:shadow-sm"
        >
          <IconoFlechaAtras size={15} />
          Volver
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <IconoUsuario size={20} />
          </span>
          <div>
            <TituloSeccion ceja="Tu información personal" titulo="Mi perfil" />
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          Administra y actualiza tu información personal.
        </p>
      </Reveal>

      {/* Tarjeta de perfil */}
      <Reveal delay={100}>
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          {/* Barra superior de la tarjeta */}
          <div className="border-b border-line bg-canvas/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-display text-sm font-bold">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{usuario.nombre}</p>
                  <p className="text-xs text-muted">{correo}</p>
                </div>
              </div>
              {!editando && (
                <button
                  onClick={iniciarEdicion}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md active:scale-95"
                >
                  Editar perfil
                </button>
              )}
            </div>
          </div>

          {/* Campos del formulario */}
          <div className="p-6 sm:p-8">
            <div className="grid gap-5">
              {/* Nombre completo */}
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Nombre completo
                </span>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: undefined }));
                  }}
                  disabled={!editando}
                  placeholder="Tu nombre completo"
                  className={editando ? (errores.nombre ? claseCampoError : claseCampoNormal) : claseCampoBloqueado}
                />
                {errores.nombre && (
                  <p className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.nombre}</p>
                )}
              </label>

              {/* Correo electrónico (no editable) */}
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Correo electrónico
                </span>
                <div className="relative">
                  <input
                    type="email"
                    value={correo}
                    disabled
                    className={`${claseCampoBloqueado} pr-10`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" title="Correo no editable">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted">El correo no se puede modificar desde aquí.</p>
              </label>

              {/* Teléfono */}
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Teléfono
                </span>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(e.target.value);
                    if (errores.telefono) setErrores((prev) => ({ ...prev, telefono: undefined }));
                  }}
                  disabled={!editando}
                  placeholder="8888-8888"
                  className={editando ? (errores.telefono ? claseCampoError : claseCampoNormal) : claseCampoBloqueado}
                />
                {errores.telefono && (
                  <p className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.telefono}</p>
                )}
              </label>

              {/* Dirección */}
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Dirección
                </span>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value);
                    if (errores.direccion) setErrores((prev) => ({ ...prev, direccion: undefined }));
                  }}
                  disabled={!editando}
                  placeholder="Managua, Nicaragua"
                  className={editando ? (errores.direccion ? claseCampoError : claseCampoNormal) : claseCampoBloqueado}
                />
                {errores.direccion && (
                  <p className="mt-1.5 text-xs font-semibold text-[#B91C1C]">{errores.direccion}</p>
                )}
              </label>
            </div>

            {/* Botones de acción (solo se muestran en modo edición) */}
            {editando && (
              <div className="mt-6 flex justify-end gap-3 border-t border-line pt-5">
                <button
                  onClick={cancelarEdicion}
                  disabled={cargando}
                  className="rounded-lg border-2 border-line px-5 py-2.5 text-sm font-bold text-muted transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCambios}
                  disabled={cargando}
                  className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-dark hover:shadow-lg active:scale-[0.97] disabled:opacity-50"
                >
                  {cargando ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <IconoCheck size={15} />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Nota informativa sobre la seguridad */}
      <Reveal delay={200}>
        <p className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white/60 px-5 py-4 text-center text-xs font-medium text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary"><path d="M12 3.5 5 6v6c0 4.4 3 7.4 7 8.5 4-1.1 7-4.1 7-8.5V6l-7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>
          Tu perfil está protegido. Solo vos podés modificar tu propia información.
        </p>
      </Reveal>
    </main>
  );
}
