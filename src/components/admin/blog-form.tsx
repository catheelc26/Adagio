"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/actions/auth";

type ExistingPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  published: boolean;
};

export function BlogForm({
  action,
  post,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  post?: ExistingPost;
}) {
  const initialState: FormState = {};
  const [state, formAction, isPending] = useActionState(action, initialState);

  // Campos controlados: React resetea los campos "no controlados" (los que
  // solo usan defaultValue) apenas termina la acción del formulario, incluso
  // cuando falla la validación — así que si no guardamos el valor aquí, se
  // borra todo lo escrito justo cuando aparece el error. Con estado propio,
  // el texto sobrevive.
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [published, setPublished] = useState(post?.published ?? false);

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-cream outline-none focus:border-gold";

  return (
    <form action={formAction} className="space-y-5">
      {post && <input type="hidden" name="postId" value={post.id} />}

      <div>
        <label htmlFor="title" className="block text-sm text-cream-dim/80">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
        {state.fieldErrors?.title && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm text-cream-dim/80">
          Resumen breve (se muestra en la lista de entradas)
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          required
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={`${inputClass} resize-none`}
        />
        {state.fieldErrors?.excerpt && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.excerpt[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm text-cream-dim/80">
          Contenido
        </label>
        <textarea
          id="content"
          name="content"
          rows={14}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${inputClass} resize-y`}
        />
        <p className="mt-1.5 text-xs text-cream-dim/50">
          Escribe con párrafos separados por una línea en blanco — se
          formatean automáticamente al publicar.
        </p>
        {state.fieldErrors?.content && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.content[0]}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
        <div>
          <label htmlFor="coverImageUrl" className="block text-sm text-cream-dim/80">
            Imagen de portada (opcional)
          </label>
          <input
            id="coverImageUrl"
            name="coverImageUrl"
            type="url"
            placeholder="https://..."
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-cream-dim/50">
            Pega el enlace de una imagen. Si lo dejas vacío, se usa un fondo
            de color automático.
          </p>
          {state.fieldErrors?.coverImageUrl && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.coverImageUrl[0]}</p>
          )}
        </div>
        <div className="aspect-video overflow-hidden rounded-lg border border-cream/15 bg-navy-950">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt="Vista previa de la portada"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-cream-dim/40">
              Sin portada
            </div>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-cream-dim/80">
        <input
          type="checkbox"
          name="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-cream/30 bg-navy-950 accent-gold"
        />
        Publicada (visible en /blog)
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {isPending ? "Guardando…" : post ? "Guardar cambios" : "Crear entrada"}
      </button>
    </form>
  );
}
