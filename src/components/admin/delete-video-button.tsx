"use client";

import { deleteVideoAction } from "@/lib/actions/admin-videos";

export function DeleteVideoButton({ videoId, title }: { videoId: string; title: string }) {
  return (
    <form
      action={deleteVideoAction}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar la clase "${title}"? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="videoId" value={videoId} />
      <button
        type="submit"
        className="text-xs text-cream-dim/50 hover:text-red-400"
      >
        Eliminar
      </button>
    </form>
  );
}
