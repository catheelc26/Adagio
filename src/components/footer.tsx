import Link from "next/link";
import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/components/nav-links";

export function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-navy-950">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo className="text-[15px]" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-dim/70">
              Un ecosistema de enseñanza que une danza, ciencia y consciencia
              corporal para formar bailarines más fuertes, conscientes y
              longevos.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
              Explorar
            </h3>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-dim/70 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
              Cuenta
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/iniciar-sesion" className="text-sm text-cream-dim/70 hover:text-gold">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/registro" className="text-sm text-cream-dim/70 hover:text-gold">
                  Crear cuenta
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="text-sm text-cream-dim/70 hover:text-gold">
                  Mi perfil
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream-dim/50 md:flex-row">
          <p>© {new Date().getFullYear()} The Adagio Method. Todos los derechos reservados.</p>
          <p className="italic font-accent text-base text-gold/70">
            Ballet · Fisioterapia · Pilates/PBT · Yoga · Meditación · Anatomía · Biomecánica · Conciencia Corporal
          </p>
        </div>
      </div>
    </footer>
  );
}
