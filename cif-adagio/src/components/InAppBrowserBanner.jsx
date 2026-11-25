import { useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { isInAppBrowser } from "../lib/browser";

/**
 * Aviso para cuando se abre el enlace dentro de Instagram, Facebook u otra
 * app parecida — esos navegadores "de adentro" bloquean descargas y
 * ventanas nuevas, así que ahí nunca va a poder descargarse el PDF por más
 * que se arregle el código. Lo único que de verdad funciona es que la
 * persona lo abra en Safari/Chrome — este aviso se lo explica y le facilita
 * copiar el enlace para pegarlo ahí.
 */
export function InAppBrowserBanner() {
  const [copied, setCopied] = useState(false);
  if (!isInAppBrowser()) return null;

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-5 rounded-2xl border-2 border-bronze bg-bronze/10 p-4">
      <div className="flex items-start gap-2.5">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-bronze-dark" />
        <div className="min-w-0 flex-1">
          <p className="t13 font-semibold text-bronze-dark">Abre esto en tu navegador normal</p>
          <p className="t12 mt-1 text-ink">
            Parece que entraste desde Instagram, Facebook u otra app — ahí no se puede descargar el PDF de la
            entrada. Toca los tres puntos (⋮) o el menú de arriba y elige <strong>"Abrir en el navegador"</strong>{" "}
            (Chrome o Safari). Si no te aparece esa opción, copia el enlace y pégalo directo en Chrome o Safari.
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="btn btn-ghost mt-3 border-bronze/40 text-bronze-dark hover:bg-bronze/10"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </button>
        </div>
      </div>
    </div>
  );
}
