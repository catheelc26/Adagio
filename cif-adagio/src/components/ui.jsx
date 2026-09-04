import { useEffect, useState } from "react";
import { AlertCircle, MoreHorizontal, X } from "lucide-react";
import { groupById } from "../lib/constants";
import { getImage, COLLECTIONS } from "../lib/db";

export const Field = ({ label, required, children }) => (
  <label className="block">
    <span className="t11 font-medium uppercase tracking-wide text-muted">
      {label} {required && <span className="text-wine">*</span>}
    </span>
    <div className="mt-1">{children}</div>
  </label>
);

export const inputCls = "field-input";

export const Chip = ({ color, children }) => (
  <span
    className="t11 inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-white"
    style={{ backgroundColor: color }}
  >
    {children}
  </span>
);

export const Toast = ({ message, onClose }) =>
  !message ? null : (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">
      <AlertCircle size={14} className="text-bronze-light" />
      {message}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <X size={13} />
      </button>
    </div>
  );

export function ConfirmDialog({ title, message, confirmLabel = "Confirmar", destructive = false, requireTyping = null, onConfirm, onCancel }) {
  const [typed, setTyped] = useState("");
  const canConfirm = !requireTyping || typed.trim().toUpperCase() === requireTyping.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-5 shadow-2xl">
        <div className="mb-2 flex items-start gap-2">
          <AlertCircle size={20} className={destructive ? "shrink-0 text-wine" : "shrink-0 text-teal"} />
          <h3 className="font-display text-lg text-ink">{title}</h3>
        </div>
        <p className="t13 mb-4 text-muted">{message}</p>
        {requireTyping && (
          <div className="mb-4">
            <p className="t11 mb-1.5 text-muted">
              Para confirmar, escribe <strong className="text-ink">{requireTyping}</strong>:
            </p>
            <input className={inputCls} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={requireTyping} />
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-ghost flex-1">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={!canConfirm} className={`btn flex-1 ${destructive ? "btn-danger" : "btn-teal"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ActionMenu({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="p-1 text-faint hover:text-ink">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-40 w-52 overflow-hidden rounded-xl border border-line bg-paper shadow-2xl">
            {Array.isArray(children)
              ? children.map((child, i) => (child ? <div key={i} onClick={() => setOpen(false)}>{child}</div> : null))
              : <div onClick={() => setOpen(false)}>{children}</div>}
          </div>
        </>
      )}
    </div>
  );
}

export const MenuItem = ({ icon, label, onClick, danger = false }) => (
  <button onClick={onClick} className={`t13 flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-cream-dim ${danger ? "text-wine" : "text-ink"}`}>
    {icon} {label}
  </button>
);

export function StudentAvatar({ student, size = 40 }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (student.hasPhoto) {
      getImage(COLLECTIONS.studentPhotos, student.id).then((val) => {
        if (!cancelled && val) setSrc(val);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [student.id, student.hasPhoto]);

  const initials = (student.fullName || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const g = groupById(student.group);

  if (src) {
    return (
      <img src={src} alt={student.fullName} style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />
    );
  }
  return (
    <div style={{ width: size, height: size, backgroundColor: `${g?.color || "#94A3B8"}22` }} className="flex shrink-0 items-center justify-center rounded-full">
      <span className="t11 font-medium" style={{ color: g?.color || "#64748B" }}>
        {initials}
      </span>
    </div>
  );
}
