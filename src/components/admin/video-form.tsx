"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/actions/auth";

type PillarOption = {
  id: string;
  name: string;
  isTheory: boolean;
};

type ExistingVideo = {
  id: string;
  pillarId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  tag: "INICIAR" | "AVANZADO" | null;
  isPreview: boolean;
};

export function VideoForm({
  pillars,
  action,
  video,
}: {
  pillars: PillarOption[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  video?: ExistingVideo;
}) {
  const initialState: FormState = {};
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [pillarId, setPillarId] = useState(video?.pillarId ?? pillars[0]?.id ?? "");
  const selectedPillar = pillars.find((p) => p.id === pillarId);

  const existingThumbnail = video?.thumbnailUrl?.startsWith("gradient:") ? "" : video?.thumbnailUrl ?? "";
  const [thumbnailUrl, setThumbnailUrl] = useState(existingThumbnail);

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-cream outline-none focus:border-gold";

  return (
    <form action={formAction} className="space-y-5">
      {video && <input type="hidden" name="videoId" value={video.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pillarId" className="block text-sm text-cream-dim/80">
            Pilar
          </label>
          <select
            id="pillarId"
            name="pillarId"
            value={pillarId}
            onChange={(e) => setPillarId(e.target.value)}
            className={inputClass}
          >
            {pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.pillarId && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.pillarId[0]}</p>
          )}
        </div>

        {!selectedPillar?.isTheory && (
          <div>
            <label htmlFor="tag" className="block text-sm text-cream-dim/80">
              Etiqueta (opcional)
            </label>
            <select
              id="tag"
              name="tag"
              defaultValue={video?.tag ?? ""}
              className={inputClass}
            >
              <option value="">Sin etiqueta</option>
              <option value="INICIAR">Para iniciar</option>
              <option value="AVANZADO">Para avanzado</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm text-cream-dim/80">
          Título de la clase
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={video?.title}
          className={inputClass}
        />
        {state.fieldErrors?.title && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm text-cream-dim/80">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={video?.description}
          className={`${inputClass} resize-none`}
        />
        {state.fieldErrors?.description && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="videoUrl" className="block text-sm text-cream-dim/80">
          Enlace del vídeo (Vimeo, YouTube, Bunny, un .mp4 directo…)
        </label>
        <input
          id="videoUrl"
          name="videoUrl"
          type="url"
          placeholder="https://..."
          required
          defaultValue={video?.videoUrl}
          className={inputClass}
        />
        {state.fieldErrors?.videoUrl && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.videoUrl[0]}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
        <div>
          <label htmlFor="thumbnailUrl" className="block text-sm text-cream-dim/80">
            Portada (opcional)
          </label>
          <input
            id="thumbnailUrl"
            name="thumbnailUrl"
            type="url"
            placeholder="https://... (imagen de portada)"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-cream-dim/50">
            Pega el enlace de una imagen (por ejemplo, subida a tu repositorio
            o a un servicio de imágenes). Si lo dejas vacío, se usa un fondo
            de color automático con el ícono del pilar.
          </p>
          {state.fieldErrors?.thumbnailUrl && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.thumbnailUrl[0]}</p>
          )}
        </div>
        <div className="aspect-video overflow-hidden rounded-lg border border-cream/15 bg-navy-950">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="durationMinutes" className="block text-sm text-cream-dim/80">
              Duración — minutos
            </label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={0}
              max={600}
              defaultValue={video ? Math.floor(video.duration / 60) : 8}
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="durationSeconds" className="block text-sm text-cream-dim/80">
              Segundos
            </label>
            <input
              id="durationSeconds"
              name="durationSeconds"
              type="number"
              min={0}
              max={59}
              defaultValue={video ? video.duration % 60 : 0}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2.5 text-sm text-cream-dim/80">
            <input
              type="checkbox"
              name="isPreview"
              defaultChecked={video?.isPreview}
              className="h-4 w-4 rounded border-cream/30 bg-navy-950 accent-gold"
            />
            Vista previa gratuita (visible sin suscripción)
          </label>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {isPending ? "Guardando…" : video ? "Guardar cambios" : "Crear clase"}
      </button>
    </form>
  );
}
