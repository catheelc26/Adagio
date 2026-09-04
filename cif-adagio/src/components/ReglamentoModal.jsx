import { X } from "lucide-react";
import { REGLAMENTO, REGLAMENTO_CIERRE } from "../lib/constants";

export function ReglamentoModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-cream shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-cream px-5 pb-3 pt-5">
          <h3 className="font-display text-lg text-ink">Reglamento de CIF Adagio</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-5 p-5">
          {REGLAMENTO.map((section) => (
            <div key={section.title}>
              <h4 className="font-display mb-2 text-base text-wine">{section.title}</h4>
              <ol className="list-inside list-decimal space-y-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className="t13 text-ink">
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <p className="t12 border-t border-line-soft pt-4 text-muted">{REGLAMENTO_CIERRE}</p>
        </div>
        <div className="border-t border-line p-4">
          <button onClick={onClose} className="btn btn-teal w-full">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
