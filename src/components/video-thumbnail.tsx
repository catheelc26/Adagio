import { PillarIcon } from "@/components/pillar-icon";

const GRADIENTS: Record<string, string> = {
  ballet: "from-[#2a2560] via-[#151a45] to-[#0a0e2e]",
  physio: "from-[#1f4a52] via-[#122b3f] to-[#0a0e2e]",
  pilates: "from-[#3d3120] via-[#1c1e3f] to-[#0a0e2e]",
  yoga: "from-[#264a3d] via-[#132b3f] to-[#0a0e2e]",
  meditation: "from-[#3a2c55] via-[#1a1c45] to-[#0a0e2e]",
  anatomy: "from-[#4a2a3a] via-[#1c1a45] to-[#0a0e2e]",
  biomechanics: "from-[#233a55] via-[#151c45] to-[#0a0e2e]",
  awareness: "from-[#2f4560] via-[#151f45] to-[#0a0e2e]",
};

export function VideoThumbnail({
  icon,
  title,
  compact = false,
}: {
  icon: string;
  title: string;
  compact?: boolean;
}) {
  const gradient = GRADIENTS[icon] ?? GRADIENTS.ballet;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-linear-to-br ${gradient} ${
        compact ? "aspect-video" : "aspect-video"
      }`}
    >
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_20%,rgba(201,166,107,0.35),transparent_55%)]" />
      <PillarIcon icon={icon} className="relative h-10 w-10 text-gold/70" />
      <span className="sr-only">{title}</span>
    </div>
  );
}
