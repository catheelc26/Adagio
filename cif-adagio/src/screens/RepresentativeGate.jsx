import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, UserCog } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { useRepSession } from "../lib/session";
import { inputCls } from "../components/ui";
import { StudentForm } from "../components/StudentForm";

const EASE_OUT = [0.23, 1, 0.32, 1];

export function RepresentativeGate() {
  const { students } = useAppData();
  const [, setSession] = useRepSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleLogin = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return setError("Ingresa tu código de acceso.");
    const student = students.items.find((s) => (s.accessCode || "").toUpperCase() === trimmed);
    if (!student) return setError("Código no encontrado. Verifica que esté bien escrito.");
    if (student.status === "inactive") return setError("Este estudiante está inactivo. Contacta a la administración.");
    setSession(student.id);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10 bg-cream" />
      <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at top, var(--color-teal-light), transparent 55%)" }} />
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
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--color-teal-light)" }}>
            <UserCog size={22} className="text-teal" />
          </div>
          <h1 className="font-display text-xl text-ink">Portal de representantes</h1>
          <p className="t12 mt-1 text-muted">Ingresa el código de acceso de 6 caracteres de tu estudiante.</p>
        </div>
        <div className="space-y-3">
          <input
            className={`${inputCls} text-center tracking-[0.3em]`}
            placeholder="XXXXXX"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {error && <p className="t12 text-wine">{error}</p>}
          <button onClick={handleLogin} className="btn btn-teal w-full">
            Entrar
          </button>
        </div>
        <button onClick={() => setShowSignup(true)} className="t12 mt-5 w-full text-center text-muted underline underline-offset-4 hover:text-ink">
          Registrar a mi estudiante por primera vez
        </button>
      </motion.div>

      {showSignup && (
        <StudentForm
          isAdmin={false}
          onClose={() => setShowSignup(false)}
          onSaved={(id) => {
            setShowSignup(false);
            setSession(id);
          }}
        />
      )}
    </div>
  );
}
