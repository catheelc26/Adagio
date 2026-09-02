import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex flex-col items-start leading-none select-none ${className}`}
      aria-label="The Adagio Method — inicio"
    >
      <span className="font-serif text-[0.55em] tracking-[0.45em] text-cream-dim/80 uppercase">
        The
      </span>
      <span className="font-accent italic text-[1.9em] -mt-[0.15em] bg-linear-to-r from-gold-light via-gold to-gold-light bg-clip-text text-transparent">
        Adagio
      </span>
      <span className="font-serif text-[0.6em] tracking-[0.5em] text-cream -mt-[0.2em] uppercase">
        Method
      </span>
    </Link>
  );
}
