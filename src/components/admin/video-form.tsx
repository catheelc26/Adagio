"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/actions/auth";

type PillarWithLevels = {
  id: string;
  name: string;
  levels: { id: string; name: string }[];
};

type ExistingVideo = {
  id: string;
  levelId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  isPreview: boolean;
};

export function VideoForm({
  pillars,
  action,
  video,
}: {
  pillars: PillarWithLevels[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  video?: ExistingVideo;
}) {
  const initialState: FormState = {};
  const [state, formAction, isPending] = useActionState(action, initialState);

  const initialPillar = video
    ? (pillars.find((p) => p.levels.some((l) => l.id === video.levelId))?.id ?? pillars[0]?.id)
    : pillars[0]?.id;

  const [pillarId, setPillarId] = useState(initialPillar ?? "");
  const selectedPillar = pillars.find((p) => p.id === pillarId);

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-cream/15 bg-navy-950 px-4 py-2.5 text-cream outline-none focus:border-gold";

  return (
    <form action={formAction} className="space-y-5">
      {video && <input type="hidden" name="videoId" value={video.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-cream-dim/80">Pilar</label>
          <select
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
        </div>

        <div>
          <label htmlFor="levelId" className="block text-sm text-cream-dim/80">
            Nivel
          </label>
          <select
            id="levelId"
            name="levelId"
            defaultValue={video?.levelId}
            className={inputClass}
          >
            {selectedPillar?.levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.levelId && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.levelId[0]}</p>
          )}
        </div>
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
