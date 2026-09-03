import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seed-data";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then(({ pillars, demoEmail }) => {
    console.log(`Sembrados ${pillars} pilares.`);
    console.log(`Cuenta de demostración: ${demoEmail} / adagio2026`);
    console.log("Listo ✨");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
