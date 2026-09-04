import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { useAdminSession } from "../lib/session";
import { inputCls } from "../components/ui";

const EASE_OUT = [0.23, 1, 0.32, 1];

export function AdminGate() {
  const { settings } = useAppData();
  const [, setSession] = useAdminSession();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const reduceMotion = useReducedMotion();

  const firstTime = settings.loading ? null : !settings.value.adminPin;

  const handleFirstTime = async () => {
    if (pin.trim().length < 4) return setError("El PIN debe tener al menos 4 dígitos.");
    if (pin !== confirmPin) return setError("Los PIN no coinciden.");
    setSaving(true);
    try {
      await settings.save({ adminPin: pin.trim() });
      setSession("ok");
    } catch {
      setError("No se pudo guardar el PIN. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = () => {
    if (pin.trim() === settings.value.adminPin) {
      setSession("ok");
    } else {
      setError("PIN incorrecto.");
    }
  };

  if (settings.loading) return null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10 bg-cream" />
      <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at top, var(--color-blue-light), transparent 55%)" }} />
      <Link to="/" className="absolute left-5 top-5 flex items-center gap-1.5 t13 text-muted hover:text-ink">
        <ArrowLeft size={16} /> Inicio
      </Link>
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="card relative w-full max-w-sm p-7"
      >
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--color-blue-light)" }}>
            <ShieldAlert size={22} className="text-blue" />
          </div>
          <h1 className="font-display text-xl text-ink">{firstTime ? "Crea el PIN de administración" : "Administración"}</h1>
          <p className="t12 mt-1 text-muted">
            {firstTime ? "Este PIN lo usará el equipo administrativo para entrar." : "Ingresa el PIN para continuar."}
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            className={inputCls}
            placeholder="PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && (firstTime ? handleFirstTime() : handleLogin())}
          />
          {firstTime && (
            <input
              type="password"
              inputMode="numeric"
              className={inputCls}
              placeholder="Confirma el PIN"
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleFirstTime()}
            />
          )}
          {error && <p className="t12 text-wine">{error}</p>}
          <button onClick={firstTime ? handleFirstTime : handleLogin} disabled={saving} className="btn btn-blue w-full">
            {saving ? "Guardando…" : firstTime ? "Crear PIN y entrar" : "Entrar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
