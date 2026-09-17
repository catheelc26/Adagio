"use client";

import { deleteBlogPostAction } from "@/lib/actions/admin-blog";

export function DeleteBlogPostButton({ postId, title }: { postId: string; title: string }) {
  return (
    <form
      action={deleteBlogPostAction}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar la entrada "${title}"? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <button type="submit" className="text-xs text-cream-dim/50 hover:text-red-400">
        Eliminar
      </button>
    </form>
  );
}
