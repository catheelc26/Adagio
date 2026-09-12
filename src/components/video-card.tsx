import Link from "next/link";
import { VideoThumbnail } from "@/components/video-thumbnail";
import { FavoriteButton } from "@/components/favorite-button";
import { formatDuration } from "@/lib/format";

const TAG_LABEL: Record<string, string> = {
  INICIAR: "Para iniciar",
  AVANZADO: "Para avanzado",
};

export type VideoCardData = {
  id: string;
  title: string;
  duration: number;
  isPreview: boolean;
  tag?: "INICIAR" | "AVANZADO" | null;
  thumbnailUrl: string;
  pillar: { slug: string; name: string; icon: string };
};

export function VideoCard({
  video,
  locked,
  favorited,
  isAuthed,
}: {
  video: VideoCardData;
  locked: boolean;
  favorited: boolean;
  isAuthed: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-cream/10 bg-navy-900/50 transition-colors hover:border-gold/30">
      <Link href={`/video/${video.id}`} className="block">
        <div className="relative">
          <VideoThumbnail
            icon={video.pillar.icon}
            title={video.title}
            thumbnailUrl={video.thumbnailUrl}
          />
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy-950/55 backdrop-blur-[1px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-7 w-7 text-cream/80"
              >
                <rect x="5" y="10.5" width="14" height="9" rx="2" />
                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
          )}
          {video.tag && (
            <span className="absolute left-2 top-2 rounded-full bg-navy-950/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cream-dim/90">
              {TAG_LABEL[video.tag]}
            </span>
          )}
          <span className="absolute bottom-2 right-2 rounded bg-navy-950/80 px-1.5 py-0.5 text-xs text-cream-dim/90">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gold/70">
            {video.pillar.name}
          </p>
          <h3 className="mt-1.5 font-serif text-base text-cream line-clamp-2">
            {video.title}
          </h3>
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <FavoriteButton
          videoId={video.id}
          initialFavorited={favorited}
          isAuthed={isAuthed}
          size="sm"
        />
      </div>
    </div>
  );
}
