"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/lib/actions/favorites";

export function FavoriteButton({
  videoId,
  initialFavorited,
  isAuthed,
  size = "md",
}: {
  videoId: string;
  initialFavorited: boolean;
  isAuthed: boolean;
  size?: "sm" | "md";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const dimensions = size === "sm" ? "h-8 w-8" : "h-11 w-11";

  return (
    <button
      type="button"
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
      onClick={() => {
        if (!isAuthed) {
          router.push("/iniciar-sesion");
          return;
        }
        setFavorited((v) => !v);
        startTransition(async () => {
          try {
            await toggleFavoriteAction(videoId);
          } catch {
            setFavorited((v) => !v);
          }
        });
      }}
      className={`flex shrink-0 items-center justify-center rounded-full border transition-colors ${dimensions} ${
        favorited
          ? "border-gold bg-gold/15 text-gold"
          : "border-cream/20 text-cream-dim/70 hover:border-gold/50 hover:text-gold"
      } disabled:opacity-60`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.6}
        className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.5c-.3 0-.6-.1-.8-.3C7.8 17.4 4 14 4 9.9 4 7.2 6.1 5 8.8 5c1.4 0 2.7.6 3.2 1.6C12.5 5.6 13.8 5 15.2 5 17.9 5 20 7.2 20 9.9c0 4.1-3.8 7.5-7.2 10.3-.2.2-.5.3-.8.3Z"
        />
      </svg>
    </button>
  );
}
