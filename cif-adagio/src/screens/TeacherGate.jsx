import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { useTeacherSession } from "../lib/session";
import { inputCls } from "../components/ui";

const EASE_OUT = [0.23, 1, 0.32, 1];

export function TeacherGate() {
  const { settings } = useAppData();
  const [, setSession] = useTeacherSession();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();

  const handleLogin = () => {
    if (!settings.value.teacherPin) return setError("El PIN de maestros aún no ha sido configurado. Pide a administración que lo active.");
    if (!name.trim()) return setError("Escribe tu nombre.");
    if (pin.trim() !== settings.value.teacherPin) return setError("PIN incorrecto.");
    setSession(name.trim());
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10 bg-cream" />
      <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at top, var(--color-bronze-light), transparent 55%)" }} />
      <Link to="/" className="absolute left-5 top-5 flex items-center gap-1.5 t13 text-muted hover:text-ink">
        <ArrowLeft size={16} /> Inicio
      </Link>
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="card w-full max-w-sm p-7"
      >
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--color-bronze-light)" }}>
            <GraduationCap size={22} className="text-bronze" />
          </div>
          <h1 className="font-display text-xl text-ink">Portal de maestros</h1>
          <p className="t12 mt-1 text-muted">Escribe tu nombre y el PIN compartido del equipo docente.</p>
        </div>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Tu nombre" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
          <input
            type="password"
            className={inputCls}
            placeholder="PIN"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {error && <p className="t12 text-wine">{error}</p>}
          <button onClick={handleLogin} className="btn btn-bronze w-full">Entrar</button>
        </div>
      </motion.div>
    </div>
  );
}
