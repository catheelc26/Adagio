import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, UserCog, GraduationCap, ChevronRight } from "lucide-react";
import { BalletFlourish, PremiumPattern, Barre } from "../components/Decor";
import { useAppData } from "../lib/AppDataContext";

export function Landing() {
  const navigate = useNavigate();
  const { settings } = useAppData();
  const studioPhoto = settings.value.studioPhoto;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at top, rgba(184,147,91,0.14), transparent 60%)" }} />
      <PremiumPattern />

      <div className="animate-fade-up flex flex-col items-center">
        {studioPhoto ? (
          <img src={studioPhoto} alt="CIF Adagio" className="mb-6 h-28 w-28 rounded-full border-4 border-paper object-cover shadow-lift" />
        ) : (
          <BalletFlourish size={44} animateDraw className="mb-4" />
        )}
        <div className="rounded-2xl bg-paper p-6 shadow-lift">
          <img src="/brand/logo.png" alt="CIF Adagio — Ballet Clásico" className="w-48 max-w-[60vw]" />
        </div>
      </div>

      <Barre className="animate-fade-up animate-fade-up-1 my-8 max-w-[220px]" />

      <div className="animate-fade-up animate-fade-up-2 glass-card w-full max-w-sm rounded-3xl p-6">
        <p className="t12 mb-4 text-center uppercase tracking-[0.2em] text-muted">¿Cómo quieres entrar?</p>
        <div className="space-y-3">
          <button onClick={() => navigate("/admin")} className="btn btn-primary w-full justify-between px-4 py-3">
            <span className="flex items-center gap-2">
              <ShieldAlert size={18} /> Administración
            </span>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => navigate("/representante")} className="btn btn-teal w-full justify-between px-4 py-3">
            <span className="flex items-center gap-2">
              <UserCog size={18} /> Soy representante
            </span>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => navigate("/maestro")} className="btn btn-bronze w-full justify-between px-4 py-3">
            <span className="flex items-center gap-2">
              <GraduationCap size={18} /> Soy maestro/a
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <Link to="/prueba" className="animate-fade-up animate-fade-up-3 t13 mt-6 font-medium text-teal underline-offset-4 hover:underline">
        Agendar clase de prueba →
      </Link>
    </div>
  );
}
