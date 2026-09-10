// ============================================================
// Hotelica — Recuperar contraseña (HU-004)
// El usuario ingresa su correo para recibir un enlace de
// restablecimiento de contraseña
// ============================================================
import { useState } from "react";
import { useApp } from "../store";
import type { Navegar } from "../rutas";
import { Reveal, TituloSeccion } from "../ui";
import { IconoFlechaAtras } from "../icons";

export function RecuperarContrasena({ navegar }: { navegar: Navegar }) {
  const { olvidarContrasena, avisar } = useApp();

  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const enviarRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!correo.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    setCargando(true);
    const resultado = await olvidarContrasena(correo);
    setCargando(false);

    if (resultado.error) {
      setError(resultado.error);
      return;
    }

    setEnviado(true);
  };

  // Pantalla de éxito: se envió el correo
  if (enviado) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-12 pt-24 sm:px-6">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="p-8 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-[#166534]">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <h2 className="mt-5 font-display text-xl font-bold text-ink">Revisá tu correo</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Te enviamos un enlace a <b className="text-ink">{correo}</b> para restablecer tu contraseña.
                Revisá tu bandeja de entrada y la carpeta de spam.
              </p>
              <button
                onClick={() => navegar({ nombre: "inicio" })}
                className="mt-7 w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.97]"
              >
                Volver al inicio
              </button>
              <p className="mt-4 text-center text-xs text-muted">
                ¿No recibiste el correo?{" "}
                <button onClick={() => { setEnviado(false); setCorreo(""); }} className="font-bold text-primary hover:underline">
                  Intentar con otro correo
                </button>
              </p>
            </div>
          </div>
        </Reveal>
      </main>
    );
  }

  // Formulario: ingresar correo
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-ink">¿Olvidaste tu contraseña?</h2>
              <p className="mt-1.5 text-sm text-muted">
                Ingresá el correo asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={enviarRecuperacion} className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => { setCorreo(e.target.value); setError(""); }}
                  placeholder="tu@email.com"
                  autoFocus
                  className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25"
                />
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
                {cargando ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-muted">
              ¿Recordaste tu contraseña?{" "}
              <button onClick={() => navegar({ nombre: "inicio" })} className="font-bold text-primary hover:underline">
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
