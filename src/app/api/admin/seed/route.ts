import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-data";

export async function GET(request: Request) {
  const secret = process.env.SEED_SECRET;
  const provided = new URL(request.url).searchParams.get("secret");

  if (!secret) {
    return NextResponse.json(
      { error: "SEED_SECRET no está configurado en este entorno." },
      { status: 404 }
    );
  }

  if (provided !== secret) {
    return NextResponse.json({ error: "Secreto incorrecto." }, { status: 403 });
  }

  const result = await seedDatabase(prisma);

  return NextResponse.json({
    ok: true,
    message: `Biblioteca sembrada: ${result.pillars} pilares. Cuenta demo: ${result.demoEmail} / adagio2026`,
  });
}
