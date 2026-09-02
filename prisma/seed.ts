import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SAMPLE_CLIPS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
];

let clipCursor = 0;
function nextClip() {
  const clip = SAMPLE_CLIPS[clipCursor % SAMPLE_CLIPS.length];
  clipCursor += 1;
  return clip;
}

type PillarSeed = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  levels: {
    slug: string;
    name: string;
    description: string;
    videos: { title: string; description: string; isPreview?: boolean }[];
  }[];
};

const PILLARS: PillarSeed[] = [
  {
    slug: "ballet",
    name: "Ballet",
    tagline: "La técnica como lenguaje",
    icon: "ballet",
    description:
      "Formación clásica que trabaja alineación, línea y musicalidad como la base sobre la que se construye todo lo demás.",
    levels: [
      {
        slug: "fundamentos",
        name: "Fundamentos",
        description: "Colocación, barra y los cimientos técnicos del ballet clásico.",
        videos: [
          {
            title: "Colocación y alineación en la barra",
            description: "Los principios de colocación pélvica y alineación vertical que sostienen toda la técnica.",
            isPreview: true,
          },
          {
            title: "Plié y port de bras esenciales",
            description: "Trabajo de calidad de movimiento desde los primeros ejercicios de barra.",
          },
        ],
      },
      {
        slug: "intermedio",
        name: "Intermedio",
        description: "Centro, saltos y giros con foco en control y musicalidad.",
        videos: [
          {
            title: "Adagio en el centro: control y línea",
            description: "Cómo sostener la técnica de barra al pasar al centro sin apoyo.",
          },
          {
            title: "Pirouettes: preparación y eje",
            description: "Desglose paso a paso de la mecánica del giro clásico.",
          },
        ],
      },
      {
        slug: "avanzado",
        name: "Avanzado",
        description: "Repertorio, virtuosismo y refinamiento artístico.",
        videos: [
          {
            title: "Grand allegro con proyección escénica",
            description: "Integrar amplitud, elevación y musicalidad en el salto grande.",
          },
          {
            title: "Variación de repertorio: interpretación",
            description: "De la técnica pura a la narrativa: cómo habitar una variación.",
          },
        ],
      },
    ],
  },
  {
    slug: "fisioterapia",
    name: "Fisioterapia",
    tagline: "Prevención antes que cura",
    icon: "physio",
    description:
      "Herramientas de fisioterapia aplicadas a la danza para prevenir lesiones, identificar compensaciones y optimizar la recuperación.",
    levels: [
      {
        slug: "fundamentos",
        name: "Fundamentos",
        description: "Autoevaluación postural y señales tempranas de sobrecarga.",
        videos: [
          {
            title: "Autoevaluación postural para bailarines",
            description: "Una guía práctica para detectar desequilibrios antes de que se conviertan en lesión.",
            isPreview: true,
          },
          { title: "Cuidado del pie y el tobillo en danza", description: "Movilidad, estabilidad y fortalecimiento específico." },
        ],
      },
      {
        slug: "intermedio",
        name: "Intermedio",
        description: "Prevención activa y trabajo de zonas de riesgo.",
        videos: [
          { title: "Prevención de lesiones de rodilla", description: "Control neuromuscular para proteger la articulación en salto y giro." },
          { title: "Salud de cadera para bailarines", description: "Movilidad de cadera sin comprometer la estabilidad lumbar." },
        ],
      },
      {
        slug: "avanzado",
        name: "Avanzado",
        description: "Readaptación y trabajo tras lesión.",
        videos: [
          { title: "Vuelta a la danza tras una lesión", description: "Progresión segura de carga para regresar a la técnica completa." },
          { title: "Gestión del dolor crónico en la profesión", description: "Estrategias fisioterapéuticas para carreras largas y sostenibles." },
        ],
      },
    ],
  },
  {
    slug: "pilates-pbt",
    name: "Pilates / PBT",
    tagline: "Fuerza con propósito",
    icon: "pilates",
    description:
      "Pilates y Progressing Ballet Technique (PBT) para construir la fuerza funcional específica que sostiene la técnica de danza.",
    levels: [
      {
        slug: "fundamentos",
        name: "Fundamentos",
        description: "Powerhouse, respiración y activación consciente.",
        videos: [
          { title: "El powerhouse: tu centro de control", description: "Activación del core al servicio del movimiento, no en su contra.", isPreview: true },
          { title: "PBT: conciencia del pie plantígrado", description: "Ejercicios con banda para activar la musculatura del pie y el tobillo." },
        ],
      },
      {
        slug: "intermedio",
        name: "Intermedio",
        description: "Fuerza aplicada a extensiones y equilibrio.",
        videos: [
          { title: "Fuerza de cadera para développé", description: "Trabajo progresivo de PBT para extensiones más altas y controladas." },
          { title: "Pilates en reformer para bailarines", description: "Secuencia de fuerza y control aplicada al vocabulario de danza." },
        ],
      },
      {
        slug: "avanzado",
        name: "Avanzado",
        description: "Potencia, resistencia y transferencia a escena.",
        videos: [
          { title: "Resistencia muscular para funciones largas", description: "Cómo entrenar la fuerza que se sostiene durante toda una función." },
          { title: "PBT avanzado: estabilidad en un pie", description: "Retos de equilibrio progresivos para relevé y giros." },
        ],
      },
    ],
  },
  {
    slug: "yoga",
    name: "Yoga",
    tagline: "Movilidad y respiración",
    icon: "yoga",
    description:
      "Prácticas de yoga que amplían el rango de movimiento, liberan tensión acumulada y enseñan a habitar el cuerpo con calma.",
    levels: [
      {
        slug: "fundamentos",
        name: "Fundamentos",
        description: "Respiración consciente y movilidad de base.",
        videos: [
          { title: "Respiración diafragmática para bailarines", description: "La base de toda práctica: aprender a respirar con el cuerpo entero.", isPreview: true },
          { title: "Secuencia de movilidad matutina", description: "20 minutos para despertar el cuerpo antes de clase o función." },
        ],
      },
      {
        slug: "intermedio",
        name: "Intermedio",
        description: "Flexibilidad activa y apertura de cadera.",
        videos: [
          { title: "Apertura de cadera profunda", description: "Trabajo seguro y progresivo hacia una mayor amplitud." },
          { title: "Vinyasa para bailarines", description: "Fuerza, fluidez y transición consciente entre posturas." },
        ],
      },
      {
        slug: "avanzado",
        name: "Avanzado",
        description: "Equilibrio, inversión y práctica restaurativa profunda.",
        videos: [
          { title: "Inversiones con seguridad", description: "Progresiones hacia el equilibrio invertido con control." },
          { title: "Yoga restaurativo post-función", description: "Recuperación activa para el sistema nervioso y el cuerpo." },
        ],
      },
    ],
  },
  {
    slug: "meditacion",
    name: "Meditación",
    tagline: "La mente también se entrena",
    icon: "meditation",
    description:
      "Meditación y trabajo mental para gestionar la presión escénica, sostener la disciplina y cuidar la salud emocional del bailarín.",
    levels: [
      {
        slug: "fundamentos",
        name: "Fundamentos",
        description: "Atención plena y primeros pasos en meditación.",
        videos: [
          { title: "Introducción a la atención plena", description: "Una meditación guiada de 10 minutos para empezar a entrenar la mente.", isPreview: true },
          { title: "Meditación para antes de clase", description: "Cómo llegar presente y enfocada al estudio." },
        ],
      },
      {
        slug: "intermedio",
        name: "Intermedio",
        description: "Gestión de la ansiedad escénica y autocrítica.",
        videos: [
          { title: "Gestionar el nervio antes de escena", description: "Herramientas mentales para transformar el nervio en presencia." },
          { title: "Silenciar la autocrítica en el espejo", description: "Trabajo de diálogo interno para una práctica más compasiva." },
        ],
      },
      {
        slug: "avanzado",
        name: "Avanzado",
        description: "Visualización y disciplina mental a largo plazo.",
        videos: [
          { title: "Visualización para el repertorio", description: "Técnicas de visualización usadas por bailarines de alto nivel." },
          { title: "Meditación para carreras longevas", description: "Sostener la motivación y la salud mental a lo largo de los años." },
        ],
      },
    ],
  },
  {
    slug: "anatomia",
    name: "Anatomía",
    tagline: "Conocer para cuidar",
    icon: "anatomy",
    description:
      "Comprensión profunda del cuerpo humano —huesos, músculos y articulaciones— al servicio de un movimiento más inteligente y seguro.",
    levels: [
      {
        slug: "fundamentos",
        name: "Fundamentos",
        description: "El esqueleto y las articulaciones del bailarín.",
        videos: [
          { title: "El esqueleto en movimiento", description: "Un recorrido visual por las estructuras óseas clave en la danza.", isPreview: true },
          { title: "Anatomía de la columna vertebral", description: "Curvas, movilidad segmentaria y salud de la espalda." },
        ],
      },
      {
        slug: "intermedio",
        name: "Intermedio",
        description: "Cadenas musculares aplicadas al vocabulario técnico.",
        videos: [
          { title: "Cadenas musculares en el arabesque", description: "Qué músculos trabajan realmente cuando levantas la pierna atrás." },
          { title: "Anatomía funcional del turnout", description: "De dónde viene realmente la rotación externa de cadera." },
        ],
      },
      {
        slug: "avanzado",
        name: "Avanzado",
        description: "Anatomía aplicada al análisis del movimiento propio.",
        videos: [
          { title: "Leer tu propio cuerpo en el espejo", description: "Aplicar el conocimiento anatómico a la autoobservación técnica." },
          { title: "Anatomía del salto y el aterrizaje", description: "Absorción de impacto y protección articular en el aire." },
        ],
      },
    ],
  },
  {
    slug: "biomecanica",
    name: "Biomecánica",
    tagline: "La física del movimiento",
    icon: "biomechanics",
    description:
      "Principios de biomecánica para entender por qué el cuerpo se mueve como se mueve —y encontrar formas más eficientes de moverlo.",
    levels: [
      {
        slug: "fundamentos",
        name: "Fundamentos",
        description: "Ejes, planos y palancas del cuerpo humano.",
        videos: [
          { title: "Ejes y planos de movimiento", description: "El vocabulario básico de la biomecánica aplicado a pasos cotidianos.", isPreview: true },
          { title: "Palancas óseas y eficiencia del gesto", description: "Cómo la longitud de tus segmentos corporales afecta tu técnica." },
        ],
      },
      {
        slug: "intermedio",
        name: "Intermedio",
        description: "Transferencia de fuerza y equilibrio dinámico.",
        videos: [
          { title: "Transferencia de peso en el pas de bourrée", description: "Analizar la eficiencia biomecánica de los pasos de enlace." },
          { title: "El centro de masa en el equilibrio", description: "Por qué unos equilibrios se sostienen y otros no." },
        ],
      },
      {
        slug: "avanzado",
        name: "Avanzado",
        description: "Análisis biomecánico del salto y el giro.",
        videos: [
          { title: "Biomecánica del grand jeté", description: "Trayectoria parabólica, impulso y aterrizaje seguro." },
          { title: "Momento angular en las pirouettes", description: "La física detrás de un giro estable y sostenido." },
        ],
      },
    ],
  },
  {
    slug: "conciencia-corporal",
    name: "Conciencia Corporal",
    tagline: "Sentir antes de ejecutar",
    icon: "awareness",
    description:
      "Trabajo somático y propioceptivo para escuchar el cuerpo, afinar la percepción interna y tomar decisiones de movimiento más inteligentes.",
    levels: [
      {
        slug: "fundamentos",
        name: "Fundamentos",
        description: "Escaneo corporal y propiocepción básica.",
        videos: [
          { title: "Escaneo corporal guiado", description: "Una práctica somática para reconectar con las sensaciones del cuerpo.", isPreview: true },
          { title: "Propiocepción: sentir sin mirar", description: "Ejercicios para afinar la percepción interna del movimiento." },
        ],
      },
      {
        slug: "intermedio",
        name: "Intermedio",
        description: "Movimiento consciente y exploración somática.",
        videos: [
          { title: "Movimiento libre y exploración somática", description: "Salir de la técnica fijada para reconectar con el impulso propio." },
          { title: "Conciencia corporal en el suelo", description: "Trabajo de floorwork para redescubrir apoyos y transferencias de peso." },
        ],
      },
      {
        slug: "avanzado",
        name: "Avanzado",
        description: "Integración somática en la técnica avanzada.",
        videos: [
          { title: "De la sensación a la ejecución precisa", description: "Cómo la conciencia corporal refina la técnica de más alto nivel." },
          { title: "Conciencia corporal en la creación coreográfica", description: "Usar la escucha interna como herramienta artística." },
        ],
      },
    ],
  },
];

async function main() {
  console.log("Sembrando The Adagio Method…");

  for (const pillar of PILLARS) {
    const createdPillar = await prisma.pillar.upsert({
      where: { slug: pillar.slug },
      update: {
        name: pillar.name,
        tagline: pillar.tagline,
        description: pillar.description,
        icon: pillar.icon,
      },
      create: {
        slug: pillar.slug,
        name: pillar.name,
        tagline: pillar.tagline,
        description: pillar.description,
        icon: pillar.icon,
        order: PILLARS.indexOf(pillar),
      },
    });

    for (const [levelIndex, level] of pillar.levels.entries()) {
      const createdLevel = await prisma.level.upsert({
        where: { pillarId_slug: { pillarId: createdPillar.id, slug: level.slug } },
        update: {
          name: level.name,
          description: level.description,
          order: levelIndex,
        },
        create: {
          pillarId: createdPillar.id,
          slug: level.slug,
          name: level.name,
          description: level.description,
          order: levelIndex,
        },
      });

      for (const [videoIndex, video] of level.videos.entries()) {
        const existing = await prisma.video.findFirst({
          where: { levelId: createdLevel.id, title: video.title },
        });

        if (existing) {
          await prisma.video.update({
            where: { id: existing.id },
            data: {
              description: video.description,
              isPreview: Boolean(video.isPreview),
            },
          });
          continue;
        }

        await prisma.video.create({
          data: {
            levelId: createdLevel.id,
            title: video.title,
            description: video.description,
            videoUrl: nextClip(),
            thumbnailUrl: `gradient:${pillar.icon}`,
            duration: 8 * 60 + videoIndex * 90,
            order: videoIndex,
            isPreview: Boolean(video.isPreview),
          },
        });
      }
    }
  }

  const demoEmail = "invitada@adagiomethod.com";
  const demoPasswordHash = await bcrypt.hash("adagio2026", 12);

  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      name: "Bailarina Invitada",
      email: demoEmail,
      passwordHash: demoPasswordHash,
      bio: "Cuenta de demostración de The Adagio Method.",
      subscription: {
        create: {
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        },
      },
    },
  });

  console.log("Cuenta de demostración: invitada@adagiomethod.com / adagio2026");
  console.log("Listo ✨");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
