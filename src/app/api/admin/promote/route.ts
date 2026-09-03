import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const secret = process.env.SEED_SECRET;
  const url = new URL(request.url);
  const provided = url.searchParams.get("secret");
  const email = url.searchParams.get("email")?.trim().toLowerCase();

  if (!secret) {
    return NextResponse.json(
      { error: "SEED_SECRET no está configurado en este entorno." },
      { status: 404 }
    );
  }

  if (provided !== secret) {
    return NextResponse.json({ error: "Secreto incorrecto." }, { status: 403 });
  }

  if (!email) {
    return NextResponse.json(
      { error: "Añade ?email=tu@email.com a la URL." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: `No existe ninguna cuenta con el email ${email}. Regístrate primero en /registro.` },
      { status: 404 }
    );
  }

  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });

  return NextResponse.json({
    ok: true,
    message: `${email} ahora es administradora y puede entrar en /admin.`,
  });
}
