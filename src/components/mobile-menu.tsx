"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/components/nav-links";

export function MobileMenu({
  isAuthed,
  profileHref,
}: {
  isAuthed: boolean;
  profileHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Abrir menú"
        className="relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`h-px w-6 bg-cream transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
        />
        <span className={`h-px w-6 bg-cream transition-opacity ${open ? "opacity-0" : ""}`} />
        <span
          className={`h-px w-6 bg-cream transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-center gap-8 bg-navy-950/98 px-8 backdrop-blur-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-serif text-2xl text-cream hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 h-px w-16 bg-gold/40" />
          {isAuthed ? (
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="font-serif text-2xl text-gold"
            >
              Mi perfil
            </Link>
          ) : (
            <>
              <Link
                href="/iniciar-sesion"
                onClick={() => setOpen(false)}
                className="font-serif text-2xl text-cream hover:text-gold"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                onClick={() => setOpen(false)}
                className="font-serif text-2xl text-gold"
              >
                Unirme al ecosistema
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
