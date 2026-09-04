import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { useTeacherSession } from "../lib/session";
import { PremiumPattern } from "../components/Decor";
import { inputCls } from "../components/ui";

export function TeacherGate() {
  const { settings } = useAppData();
  const [, setSession] = useTeacherSession();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!settings.value.teacherPin) return setError("El PIN de maestros aún no ha sido configurado. Pide a administración que lo active.");
    if (!name.trim()) return setError("Escribe tu nombre.");
    if (pin.trim() !== settings.value.teacherPin) return setError("PIN incorrecto.");
    setSession(name.trim());
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6" style={{ background: "linear-gradient(160deg,#20343b,#1a2a2f)" }}>
      <PremiumPattern />
      <Link to="/" className="absolute left-5 top-5 flex items-center gap-1.5 t13 text-cream/70 hover:text-cream">
        <ArrowLeft size={16} /> Inicio
      </Link>
      <div className="glass-card animate-fade-up w-full max-w-sm rounded-3xl p-7" style={{ background: "rgba(250,246,236,0.08)", borderColor: "rgba(255,255,255,0.14)" }}>
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/20">
            <GraduationCap size={22} className="text-teal-light" />
          </div>
          <h1 className="font-display text-xl text-cream">Portal de maestros</h1>
          <p className="t12 mt-1 text-cream/60">Escribe tu nombre y el PIN compartido del equipo docente.</p>
        </div>
        <div className="space-y-3">
          <input className={`${inputCls} bg-cream/95`} placeholder="Tu nombre" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
          <input
            type="password"
            className={`${inputCls} bg-cream/95`}
            placeholder="PIN"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {error && <p className="t12 text-blush">{error}</p>}
          <button onClick={handleLogin} className="btn btn-teal w-full">Entrar</button>
        </div>
      </div>
    </div>
  );
}
