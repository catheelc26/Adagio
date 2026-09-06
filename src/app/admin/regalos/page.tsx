import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createGiftCodeAction, deleteGiftCodeAction } from "@/lib/actions/gift-codes";

export const metadata: Metadata = {
  title: "Códigos de regalo",
};

export default async function RegalosPage() {
  await requireAdmin();

  const codes = await prisma.giftCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { redeemedBy: { select: { name: true, email: true } } },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Panel privado</p>
          <h1 className="mt-1 font-serif text-3xl text-cream">Códigos de regalo</h1>
          <p className="mt-2 max-w-xl text-sm text-cream-dim/70">
            Genera un código para regalarle a alguien un mes de acceso completo,
            gratis. Compártelo tú misma por el medio que prefieras — no
            aparece en ningún lugar público del sitio.
          </p>
        </div>
        <form action={createGiftCodeAction}>
          <button
            type="submit"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light"
          >
            + Generar código
          </button>
        </form>
      </div>

      <div className="mt-10 divide-y divide-cream/10 rounded-xl border border-cream/10">
        {codes.length === 0 && (
          <p className="px-4 py-6 text-sm text-cream-dim/50">
            Todavía no has generado ningún código.
          </p>
        )}
        {codes.map((giftCode) => (
          <div
            key={giftCode.id}
            className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
          >
            <div className="min-w-0">
              <p className="font-mono text-lg tracking-[0.2em] text-cream">{giftCode.code}</p>
              <p className="mt-1 truncate text-xs text-cream-dim/50">
                {appUrl}/canjear?codigo={giftCode.code}
              </p>
              {giftCode.redeemedAt ? (
                <p className="mt-1 text-xs text-teal">
                  Canjeado por {giftCode.redeemedBy?.name ?? giftCode.redeemedBy?.email} el{" "}
                  {new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(giftCode.redeemedAt)}
                </p>
              ) : (
                <p className="mt-1 text-xs text-cream-dim/50">
                  Sin usar todavía — otorga {giftCode.durationDays} días de acceso.
                </p>
              )}
            </div>
            {!giftCode.redeemedAt && (
              <form action={deleteGiftCodeAction}>
                <input type="hidden" name="id" value={giftCode.id} />
                <button type="submit" className="shrink-0 text-xs text-cream-dim/50 hover:text-red-400">
                  Eliminar
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
