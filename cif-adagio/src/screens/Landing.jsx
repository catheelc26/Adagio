import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ShieldAlert, UserCog, GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import { useAppData } from "../lib/AppDataContext";

const STUDIO_STRIP = [
  { src: "/photos-web/portrait-barre.jpg", alt: "Estudiante en la barra" },
  { src: "/photos-web/shoe-detail.jpg", alt: "Detalle de zapatillas" },
  { src: "/photos-web/solo-reach.jpg", alt: "Estudiante en clase" },
];

const EASE_OUT = [0.23, 1, 0.32, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

const PORTALS = [
  { to: "/admin", label: "Administración", icon: ShieldAlert, tint: "var(--color-blue-light)", fg: "var(--color-blue)" },
  { to: "/representante", label: "Representante", icon: UserCog, tint: "var(--color-teal-light)", fg: "var(--color-teal)" },
  { to: "/maestro", label: "Maestro/a", icon: GraduationCap, tint: "var(--color-bronze-light)", fg: "var(--color-bronze)" },
];

export function Landing() {
  const navigate = useNavigate();
  const { settings } = useAppData();
  const studioPhoto = settings.value.studioPhoto;
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-5 py-6">
      <motion.div variants={container} initial={reduceMotion ? "show" : "hidden"} animate="show">
        <motion.div variants={item} className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/brand/logo.png" alt="" className="h-9 w-9 rounded-xl object-contain" />
            <div>
              <p className="font-display text-[15px] font-semibold leading-none text-ink">CIF Adagio</p>
              <p className="t11 mt-0.5 text-faint">Ballet Clásico</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative mb-4 h-72 overflow-hidden rounded-[28px] shadow-lift">
          <img src={studioPhoto || "/photos-web/hero-tutu.jpg"} alt="Estudiantes de CIF Adagio" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 18%" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(190deg, rgba(43,50,56,0.05) 30%, rgba(30,25,30,0.62) 100%)" }} />
          <div className="absolute left-5 right-5 top-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-bronze-light)" }} />
              <span className="t11 font-medium text-white">Inscripciones abiertas</span>
            </span>
          </div>
          <div className="absolute inset-x-5 bottom-5">
            <p className="font-display text-2xl font-semibold leading-tight text-white">Bienvenida de nuevo</p>
            <p className="t13 mt-1.5 text-white/85">Elige tu espacio para continuar.</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="mb-3.5 grid grid-cols-3 gap-2.5">
          {PORTALS.map((p) => (
            <button
              key={p.to}
              onClick={() => navigate(p.to)}
              className="card flex flex-col items-center gap-2.5 px-2 py-4 transition-shadow hover:shadow-lift"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: p.tint }}>
                <p.icon size={18} style={{ color: p.fg }} />
              </span>
              <span className="t12 text-center font-semibold leading-tight text-ink">{p.label}</span>
            </button>
          ))}
        </motion.div>

        <motion.div variants={item} className="relative mb-4 h-32 overflow-hidden rounded-[24px] shadow-lift">
          <img src="/photos-web/turn-motion.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 25%" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(43,50,56,0.82) 30%, rgba(43,50,56,0.25) 100%)" }} />
          <Link to="/prueba" className="relative flex h-full items-center justify-between px-5">
            <span>
              <span className="t11 flex items-center gap-1.5 font-medium text-white/80">
                <Sparkles size={12} /> Primera clase gratis
              </span>
              <span className="font-display mt-1 block text-lg font-semibold leading-tight text-white">Agenda tu clase de prueba</span>
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-bronze-light)" }}>
              <ArrowRight size={18} className="text-bronze-dark" />
            </span>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <p className="t11 mb-2 px-1 font-semibold uppercase tracking-wide text-faint">Vida en el estudio</p>
          <div className="grid grid-cols-3 gap-2.5">
            {STUDIO_STRIP.map((photo) => (
              <div key={photo.src} className="aspect-square overflow-hidden rounded-2xl shadow-soft">
                <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
