import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/components/nav-links";
import { MobileMenu } from "@/components/mobile-menu";
import { SignOutButton } from "@/components/sign-out-button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 border-b border-cream/10 bg-navy-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Logo className="text-[15px]" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-cream-dim/90 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-cream-dim/90 hover:text-gold"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/perfil"
                className="flex items-center gap-2 text-sm text-cream hover:text-gold"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/50 bg-navy-800 font-serif text-xs text-gold">
                  {session.user.name?.[0]?.toUpperCase() ?? "A"}
                </span>
                Mi perfil
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/iniciar-sesion"
                className="text-sm text-cream-dim/90 hover:text-gold"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-full border border-gold bg-gold/10 px-5 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-navy-950"
              >
                Unirme
              </Link>
            </>
          )}
        </div>

        <MobileMenu
          isAuthed={Boolean(session?.user)}
          isAdmin={session?.user?.role === "ADMIN"}
          profileHref="/perfil"
        />
      </div>
    </header>
  );
}
