// ============================================================
// Hotelica — Restablecer contraseña (HU-004)
// después de hacer clic en el enlace del email, el usuario
// ingresa su nueva contraseña
// ============================================================
import { useState } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import { Reveal } from "../ui";
import { IconoFlechaAtras } from "../icons";

export function RestablecerContrasena({ navegar }: { navegar: Navegar }) {
  const { restablecerContrasena, avisar } = useApp();

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaContrasena !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    const resultado = await restablecerContrasena(nuevaContrasena);
    setCargando(false);

    if (resultado.error) {
      setError(resultado.error);
      return;
    }

    avisar("¡Contraseña restablecida correctamente!", "ok");
    setExito(true);
  };

  // Pantalla de éxito
  if (exito) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-12 pt-24 sm:px-6">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="p-8 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-[#166534]">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17.5 20 6.5"/></svg>
              </span>
              <h2 className="mt-5 font-display text-xl font-bold text-ink">¡Contraseña actualizada!</h2>
              <p className="mt-2 text-sm text-muted">
                Tu contraseña fue restablecida exitosamente. Ya podés iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={() => navegar({ nombre: "inicio" })}
                className="mt-7 w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.97]"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </Reveal>
      </main>
    );
  }

  // Formulario: nueva contraseña
  const claseCampo =
    "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25";
  const claseCampoError =
    "w-full rounded-lg border border-[#FCA5A5] bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-ink outline-none transition-all focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/25";

  return (
    <main className="mx-auto max-w-lg px-4 pb-12 pt-24 sm:px-6">
      <Reveal>
        <button
          onClick={() => navegar({ nombre: "inicio" })}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-bold text-muted transition-all hover:border-primary/40 hover:text-primary hover:shadow-sm"
        >
          <IconoFlechaAtras size={15} />
          Volver
        </button>

        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="p-8">
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-ink">Restablecer contraseña</h2>
              <p className="mt-1.5 text-sm text-muted">
                Ingresá tu nueva contraseña. Asegurate de que sea fácil de recordar pero difícil de adivinar.
              </p>
            </div>

            <form onSubmit={guardar} className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Nueva contraseña
                </span>
                <div className="relative">
                  <input
                    type={verNueva ? "text" : "password"}
                    value={nuevaContrasena}
                    onChange={(e) => { setNuevaContrasena(e.target.value); setError(""); }}
                    placeholder="Mínimo 6 caracteres"
                    autoFocus
                    className={error ? claseCampoError : claseCampo}
                  />
                  <button
                    type="button"
                    onClick={() => setVerNueva(!verNueva)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    aria-label={verNueva ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {verNueva ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Confirmar contraseña
                </span>
                <div className="relative">
                  <input
                    type={verConfirmar ? "text" : "password"}
                    value={confirmar}
                    onChange={(e) => { setConfirmar(e.target.value); setError(""); }}
                    placeholder="Repetí tu contraseña"
                    className={error ? claseCampoError : claseCampo}
                  />
                  <button
                    type="button"
                    onClick={() => setVerConfirmar(!verConfirmar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    aria-label={verConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {verConfirmar ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <p role="alert" className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="mt-1 w-full rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-dark hover:shadow-lg active:scale-[0.97] disabled:opacity-50"
              >
                {cargando ? "Guardando..." : "Restablecer contraseña"}
              </button>
            </form>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
