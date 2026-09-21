import { useMemo, useState } from "react";
import {
  CheckCircle2, Image as ImageIcon, Pencil, Plus, QrCode, ScanLine, ShieldCheck, Trash2, X,
} from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { seatSection, showLabel, ticketsForShow } from "../../lib/tickets";
import { uid, usd } from "../../lib/format";
import { COLLECTIONS } from "../../lib/db";
import { ActionMenu, ConfirmDialog, Field, MenuItem, inputCls } from "../../components/ui";
import { TicketScanner } from "../../components/TicketScanner";
import { ProofViewer } from "../../components/ProofViewer";

function ShowFormModal({ show, onClose }) {
  const { shows, toast } = useAppData();
  const [title, setTitle] = useState(show?.title || "");
  const [date, setDate] = useState(show?.date || "");
  const [time, setTime] = useState(show?.time || "");
  const [venue, setVenue] = useState(show?.venue || "");
  const [status, setStatus] = useState(show?.status || "abierto");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!title.trim()) return setError("Escribe el título de la función.");
    if (!date) return setError("Selecciona la fecha.");
    setSaving(true);
    try {
      const payload = { title: title.trim(), date, time: time.trim() || null, venue: venue.trim() || null, status };
      if (show?.id) await shows.update(show.id, payload);
      else await shows.add({ id: uid(), ...payload });
      toast(show?.id ? "Función actualizada." : "Función creada.");
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo guardar la función.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="modal-panel w-full max-w-sm rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">{show?.id ? "Editar función" : "Nueva función"}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Título" required>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Función de fin de año" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha" required>
              <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Hora">
              <input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
          <Field label="Lugar">
            <input className={inputCls} value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Ej. Teatro Municipal" />
          </Field>
          <Field label="Venta de entradas">
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="abierto">Abierta</option>
              <option value="cerrado">Cerrada</option>
            </select>
          </Field>
        </div>
        {error && <p className="t13 mt-3 text-wine">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button onClick={submit} disabled={saving} className="btn btn-primary flex-1">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShowsView() {
  const { shows, tickets, toast } = useAppData();
  const sortedShows = useMemo(() => [...shows.items].sort((a, b) => (a.date < b.date ? -1 : 1)), [shows.items]);
  const [activeShowId, setActiveShowId] = useState(sortedShows[0]?.id || null);
  const [editingShow, setEditingShow] = useState(null);
  const [creatingShow, setCreatingShow] = useState(false);
  const [deletingShow, setDeletingShow] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [proofTx, setProofTx] = useState(null);
  const [scanning, setScanning] = useState(false);

  const activeShow = sortedShows.find((s) => s.id === activeShowId) || sortedShows[0] || null;
  const showTickets = activeShow
    ? ticketsForShow(tickets.items, activeShow.id).sort((a, b) => (a.row === b.row ? a.seat.localeCompare(b.seat) : a.row - b.row))
    : [];
  const confirmedRevenue = showTickets.filter((t) => t.confirmed !== false).reduce((s, t) => s + t.price, 0);
  const pendingCount = showTickets.filter((t) => t.confirmed === false).length;
  const checkedInCount = showTickets.filter((t) => t.checkedIn).length;

  const confirmTicket = async (t) => {
    await tickets.update(t.id, { confirmed: true });
    toast("Pago confirmado.");
  };

  const toggleCheckIn = async (t) => {
    await tickets.update(t.id, { checkedIn: !t.checkedIn, checkedInAt: !t.checkedIn ? new Date().toISOString() : null });
  };

  const handleDeleteTicket = async () => {
    if (!deletingTicket) return;
    await tickets.remove(deletingTicket.id);
    setDeletingTicket(null);
    toast("Entrada eliminada — el asiento vuelve a estar disponible.");
  };

  const handleDeleteShow = async () => {
    if (!deletingShow) return;
    await shows.remove(deletingShow.id);
    if (activeShowId === deletingShow.id) setActiveShowId(null);
    setDeletingShow(null);
    toast("Función eliminada.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Presentaciones</h1>
          <p className="t13 text-muted">Funciones, venta de entradas y verificación en la puerta.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setScanning(true)} className="btn btn-ghost">
            <ScanLine size={15} /> Escanear entrada
          </button>
          <button onClick={() => setCreatingShow(true)} className="btn btn-primary">
            <Plus size={15} /> Nueva función
          </button>
        </div>
      </div>

      {sortedShows.length === 0 ? (
        <p className="t13 rounded-xl bg-cream-dim p-6 text-center text-muted">Aún no has creado ninguna función.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {sortedShows.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveShowId(s.id)}
                className={`t12 rounded-full px-3 py-1.5 font-medium ${activeShow?.id === s.id ? "bg-ink text-cream" : "bg-cream-dim text-muted hover:text-ink"}`}
              >
                {s.title}
                {s.status === "cerrado" && " · cerrada"}
              </button>
            ))}
          </div>

          {activeShow && (
            <>
              <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="t13 font-semibold text-ink">{activeShow.title}</p>
                  <p className="t12 text-muted">{showLabel(activeShow)}{activeShow.venue ? ` · ${activeShow.venue}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingShow(activeShow)} className="btn btn-ghost">
                    <Pencil size={14} /> Editar
                  </button>
                  <button onClick={() => setDeletingShow(activeShow)} className="rounded-lg p-2 text-wine hover:bg-wine/10">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="card p-3 text-center">
                  <p className="font-display text-xl text-ink">{showTickets.length}</p>
                  <p className="t11 text-muted">Entradas vendidas</p>
                </div>
                <div className="card p-3 text-center">
                  <p className="font-display text-xl text-ink">{usd(confirmedRevenue)}</p>
                  <p className="t11 text-muted">Cobrado{pendingCount > 0 ? ` · ${pendingCount} por confirmar` : ""}</p>
                </div>
                <div className="card p-3 text-center">
                  <p className="font-display text-xl text-ink">{checkedInCount}</p>
                  <p className="t11 text-muted">Escaneadas</p>
                </div>
              </div>

              <div className="space-y-2">
                {showTickets.length === 0 && (
                  <p className="t13 rounded-xl bg-cream-dim p-6 text-center text-muted">Aún no se ha vendido ninguna entrada para esta función.</p>
                )}
                {showTickets.map((t) => (
                  <div key={t.id} className="card flex items-center gap-3 p-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="t13 font-medium text-ink">{t.buyerName}</p>
                        {t.confirmed === false && <span className="t10 rounded-full bg-bronze/15 px-2 py-0.5 font-medium text-bronze-dark">Por confirmar</span>}
                        {t.checkedIn && <span className="t10 flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 font-medium text-teal-dark"><ShieldCheck size={11} /> Escaneada</span>}
                      </div>
                      <p className="t11 text-muted">
                        Fila {t.row} · Asiento {t.seat} · {seatSection(t.row)} · {t.buyerPhone}
                      </p>
                    </div>
                    <span className="t13 font-medium text-ink">{usd(t.price)}</span>
                    <ActionMenu>
                      {t.confirmed === false && <MenuItem icon={<CheckCircle2 size={15} />} label="Confirmar pago" onClick={() => confirmTicket(t)} />}
                      {t.hasProof && <MenuItem icon={<ImageIcon size={15} />} label="Ver comprobante" onClick={() => setProofTx(t.transactionId || t.id)} />}
                      <MenuItem icon={<QrCode size={15} />} label={t.checkedIn ? "Desmarcar escaneada" : "Marcar como escaneada"} onClick={() => toggleCheckIn(t)} />
                      <MenuItem icon={<Trash2 size={15} />} label="Eliminar (liberar asiento)" danger onClick={() => setDeletingTicket(t)} />
                    </ActionMenu>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {(creatingShow || editingShow) && (
        <ShowFormModal show={editingShow} onClose={() => { setCreatingShow(false); setEditingShow(null); }} />
      )}
      {scanning && <TicketScanner onClose={() => setScanning(false)} />}
      {proofTx && <ProofViewer transactionId={proofTx} collection={COLLECTIONS.ticketProofs} onClose={() => setProofTx(null)} />}
      {deletingTicket && (
        <ConfirmDialog
          title="Eliminar entrada"
          message="El asiento quedará libre nuevamente y esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          destructive
          onConfirm={handleDeleteTicket}
          onCancel={() => setDeletingTicket(null)}
        />
      )}
      {deletingShow && (
        <ConfirmDialog
          title="Eliminar función"
          message="Se eliminará la función. Las entradas ya vendidas no se borran automáticamente."
          confirmLabel="Eliminar"
          destructive
          onConfirm={handleDeleteShow}
          onCancel={() => setDeletingShow(null)}
        />
      )}
    </div>
  );
}
