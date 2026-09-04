import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ShieldAlert, UserCog, GraduationCap, ChevronRight } from "lucide-react";
import { BalletFlourish, PremiumPattern, Barre } from "../components/Decor";
import { useAppData } from "../lib/AppDataContext";

const EASE_OUT = [0.23, 1, 0.32, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export function Landing() {
  const navigate = useNavigate();
  const { settings } = useAppData();
  const studioPhoto = settings.value.studioPhoto;
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at top, rgba(190,155,63,0.12), transparent 55%), radial-gradient(ellipse at bottom, rgba(20,163,154,0.08), transparent 55%)" }} />
      <PremiumPattern />

      <motion.div
        variants={container}
        initial={reduceMotion ? "show" : "hidden"}
        animate="show"
        className="flex w-full max-w-sm flex-col items-center"
      >
        <motion.div variants={item} className="flex flex-col items-center">
          {studioPhoto ? (
            <img src={studioPhoto} alt="CIF Adagio" className="mb-6 h-28 w-28 rounded-full border-4 border-paper object-cover shadow-lift" />
          ) : (
            <BalletFlourish size={44} animateDraw className="mb-4" />
          )}
          <div className="rounded-2xl bg-paper p-6 shadow-lift">
            <img src="/brand/logo.png" alt="CIF Adagio — Ballet Clásico" className="w-48 max-w-[60vw]" />
          </div>
        </motion.div>

        <motion.div variants={item} className="my-8 w-full">
          <Barre className="mx-auto max-w-[220px]" />
        </motion.div>

        <motion.div variants={item} className="glass-card w-full rounded-3xl p-6">
          <p className="t13 mb-4 text-center text-muted">¿Cómo quieres entrar?</p>
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
        </motion.div>

        <motion.div variants={item}>
          <Link to="/prueba" className="t13 mt-6 inline-block font-medium text-teal underline-offset-4 hover:underline">
            Agendar clase de prueba →
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
