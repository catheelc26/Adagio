import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserCog } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";
import { useRepSession } from "../lib/session";
import { PremiumPattern } from "../components/Decor";
import { inputCls } from "../components/ui";
import { StudentForm } from "../components/StudentForm";

export function RepresentativeGate() {
  const { students } = useAppData();
  const [, setSession] = useRepSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return setError("Ingresa tu código de acceso.");
    const student = students.items.find((s) => (s.accessCode || "").toUpperCase() === trimmed);
    if (!student) return setError("Código no encontrado. Verifica que esté bien escrito.");
    if (student.status === "inactive") return setError("Este estudiante está inactivo. Contacta a la administración.");
    setSession(student.id);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6" style={{ background: "linear-gradient(160deg,#2a2130,#201c1c)" }}>
      <PremiumPattern />
      <Link to="/" className="absolute left-5 top-5 flex items-center gap-1.5 t13 text-cream/70 hover:text-cream">
        <ArrowLeft size={16} /> Inicio
      </Link>
      <div className="glass-card animate-fade-up w-full max-w-sm rounded-3xl p-7" style={{ background: "rgba(250,246,236,0.08)", borderColor: "rgba(255,255,255,0.14)" }}>
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blush/20">
            <UserCog size={22} className="text-blush" />
          </div>
          <h1 className="font-display text-xl text-cream">Portal de representantes</h1>
          <p className="t12 mt-1 text-cream/60">Ingresa el código de acceso de 6 caracteres de tu estudiante.</p>
        </div>
        <div className="space-y-3">
          <input
            className={`${inputCls} bg-cream/95 text-center tracking-[0.3em]`}
            placeholder="XXXXXX"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {error && <p className="t12 text-blush">{error}</p>}
          <button onClick={handleLogin} className="btn btn-primary w-full" style={{ background: "var(--color-blush)" }}>
            Entrar
          </button>
        </div>
        <button onClick={() => setShowSignup(true)} className="t12 mt-5 w-full text-center text-cream/70 underline underline-offset-4 hover:text-cream">
          Registrar a mi estudiante por primera vez
        </button>
      </div>

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
