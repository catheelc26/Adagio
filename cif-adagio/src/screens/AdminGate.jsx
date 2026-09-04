import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { useAdminSession } from "../lib/session";
import { PremiumPattern } from "../components/Decor";
import { inputCls } from "../components/ui";

export function AdminGate() {
  const { settings } = useAppData();
  const [, setSession] = useAdminSession();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
    <div className="premium-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6" style={{ background: "linear-gradient(160deg,#201c1c,#2f2a26)" }}>
      <PremiumPattern />
      <Link to="/" className="absolute left-5 top-5 flex items-center gap-1.5 t13 text-cream/70 hover:text-cream">
        <ArrowLeft size={16} /> Inicio
      </Link>
      <div className="glass-card animate-fade-up relative w-full max-w-sm rounded-3xl p-7" style={{ background: "rgba(250,246,236,0.08)", borderColor: "rgba(255,255,255,0.14)" }}>
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-bronze/20">
            <ShieldAlert size={22} className="text-bronze-light" />
          </div>
          <h1 className="font-display text-xl text-cream">{firstTime ? "Crea el PIN de administración" : "Administración"}</h1>
          <p className="t12 mt-1 text-cream/60">
            {firstTime ? "Este PIN lo usará el equipo administrativo para entrar." : "Ingresa el PIN para continuar."}
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            className={`${inputCls} bg-cream/95`}
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
              className={`${inputCls} bg-cream/95`}
              placeholder="Confirma el PIN"
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleFirstTime()}
            />
          )}
          {error && <p className="t12 text-blush">{error}</p>}
          <button onClick={firstTime ? handleFirstTime : handleLogin} disabled={saving} className="btn btn-bronze w-full">
            {saving ? "Guardando…" : firstTime ? "Crear PIN y entrar" : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
