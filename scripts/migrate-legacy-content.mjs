// Migración puente para bases de datos que todavía tienen la estructura
// antigua (Pilar -> Nivel -> Vídeo). El nuevo esquema aplana esto a
// Pilar -> Vídeo directamente, con un `pillarId` obligatorio en Video.
// `prisma db push` no puede rellenar esa columna nueva por sí solo si ya
// hay filas, así que lo hacemos aquí a mano, copiando el pillarId desde el
// nivel al que pertenecía cada vídeo, antes de que se borre esa tabla.
// No toca User/Subscription/GiftCode/Favorite/Progress en absoluto.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function tableExists(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    name
  );
  return rows.length > 0;
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    table,
    column
  );
  return rows.length > 0;
}

async function main() {
  const hasLevelTable = await tableExists("Level");
  const hasLevelIdColumn = await columnExists("Video", "levelId");

  if (!hasLevelTable || !hasLevelIdColumn) {
    console.log("[migrate-legacy-content] Nada que migrar (ya está en el esquema nuevo).");
    return;
  }

  const hasPillarIdColumn = await columnExists("Video", "pillarId");
  if (!hasPillarIdColumn) {
    console.log("[migrate-legacy-content] Añadiendo columna Video.pillarId...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Video" ADD COLUMN "pillarId" TEXT`);
  }

  console.log("[migrate-legacy-content] Rellenando pillarId a partir del nivel antiguo...");
  await prisma.$executeRawUnsafe(`
    UPDATE "Video" v
    SET "pillarId" = l."pillarId"
    FROM "Level" l
    WHERE v."levelId" = l.id AND v."pillarId" IS NULL
  `);

  const remaining = await prisma.$queryRawUnsafe(
    `SELECT count(*)::int AS count FROM "Video" WHERE "pillarId" IS NULL`
  );
  const remainingCount = remaining[0]?.count ?? 0;
  if (remainingCount > 0) {
    throw new Error(
      `[migrate-legacy-content] ${remainingCount} vídeo(s) sin pillarId tras la migración — revisa manualmente antes de continuar.`
    );
  }

  console.log("[migrate-legacy-content] Listo. Todos los vídeos tienen pillarId.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
