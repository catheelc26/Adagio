import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Camera, CheckCircle2, ChevronRight, Download, Search, X } from "lucide-react";
import { PAYMENT_METHODS, paymentMethodInfo } from "../lib/constants";
import { pagoMovilAccountForGroup } from "../lib/business";
import { groupTicketsByTransaction, isSeatTaken, seatKey, seatPrice, showLabel, ticketsForShow } from "../lib/tickets";
import { reminderContactEmail, reminderContactName, reminderContactPhone, uid, usd } from "../lib/format";
import { compressImage } from "../lib/image";
import { COLLECTIONS, setImage } from "../lib/db";
import { useAppData } from "../lib/AppDataContext";
import { notifyPush } from "../lib/push";
import { downloadTicketsPdf } from "../lib/ticketsPdf";
import { CopyButton, CopyRow, Field, inputCls } from "../components/ui";
import { InAppBrowserBanner } from "../components/InAppBrowserBanner";
import { SeatMap } from "../components/SeatMap";
import { TicketQR } from "../components/TicketQR";
import { TicketReceipt } from "../components/TicketReceipt";

const EASE_OUT = [0.23, 1, 0.32, 1];
const stepMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: EASE_OUT },
};

/**
 * Buscador para quien compró entradas desde afuera (no representante) y no
 * guardó su PDF ni su captura — antes solo quedaban las entradas de este
 * mismo celular (guardadas en el navegador), así que si cambiaban de
 * dispositivo o borraban datos, no había forma de recuperarlas. Ahora busca
 * directo en la base de datos por nombre, teléfono, correo o cómo pagaron,
 * sin importar desde qué celular se compró.
 */
function TicketLookupModal({ onClose }) {
  const { tickets, shows } = useAppData();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (normalizedQuery.length < 3) return [];
    const found = tickets.items.filter((t) => {
      const haystack = [t.buyerName, t.buyerPhone, t.buyerEmail, paymentMethodInfo(t.method).label, t.reference]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
    return groupTicketsByTransaction(found);
  }, [tickets.items, normalizedQuery]);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="modal-panel max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-cream p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">Buscar mis entradas</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={20} /></button>
        </div>

        <Field label="Tu nombre, teléfono, correo o cómo pagaste">
          <input
            className={inputCls}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. María Pérez, 0414-1234567, pago móvil…"
          />
        </Field>

        <div className="mt-4 space-y-3">
          {query.trim().length > 0 && normalizedQuery.length < 3 && (
            <p className="t12 text-muted">Escribe al menos 3 letras para buscar.</p>
          )}
          {normalizedQuery.length >= 3 && matches.length === 0 && (
            <p className="t13 rounded-xl bg-cream-dim p-4 text-center text-muted">
              No encontramos ninguna entrada con eso. Revisa cómo lo escribiste, o escríbenos por WhatsApp si sigues
              sin encontrarla.
            </p>
          )}
          {matches.map((group) => {
            const first = group[0];
            const s = shows.items.find((x) => x.id === first.showId);
            const sorted = group.slice().sort((a, b) => (a.row === b.row ? a.seat - b.seat : a.row.localeCompare(b.row)));
            return (
              <div key={first.transactionId || first.id} className="card space-y-2 p-3">
                <div>
                  <p className="t13 font-semibold text-ink">{s?.title || "Función"}</p>
                  {s && <p className="t11 text-muted">{showLabel(s)}</p>}
                </div>
                <p className="t12 text-ink">
                  {first.buyerName} — {sorted.map((t) => `Fila ${t.row} · Asiento ${t.seat}`).join(", ")}
                </p>
                {first.confirmed === false && (
                  <p className="t11 font-medium text-bronze-dark">Pago por confirmar</p>
                )}
                <button onClick={() => downloadTicketsPdf(group, s)} className="btn btn-primary w-full">
                  <Download size={15} /> Descargar PDF
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Compra de entradas con selección de butaca, como en un cine. Se usa tanto
 * como página pública (`/entradas`, sin `student` ni `onClose`) como dentro
 * del portal de representantes (con `student` para pre-llenar sus datos y
 * `onClose` para volver a la pantalla anterior en vez de navegar).
 */
function CloseOrBack({ onClose }) {
  return onClose ? (
    <button onClick={onClose} className="flex items-center gap-1.5 t13 text-muted hover:text-ink">
      <ArrowLeft size={16} /> Volver
    </button>
  ) : (
    <Link to="/" className="flex items-center gap-1.5 t13 text-muted hover:text-ink">
      <ArrowLeft size={16} /> Inicio
    </Link>
  );
}

export function TicketBookingFlow({ student, onClose }) {
  const { shows, tickets, settings } = useAppData();
  const openShows = useMemo(
    () => shows.items.filter((s) => s.status !== "cerrado").sort((a, b) => (a.date < b.date ? -1 : 1)),
    [shows.items]
  );

  const [showId, setShowId] = useState(openShows.length === 1 ? openShows[0].id : null);
  const [stage, setStage] = useState(openShows.length === 1 ? "seats" : "show");
  const [selected, setSelected] = useState([]);

  const [buyerName, setBuyerName] = useState(student ? reminderContactName(student) : "");
  const [buyerPhone, setBuyerPhone] = useState(student ? reminderContactPhone(student) : "");
  const [buyerEmail, setBuyerEmail] = useState(student ? reminderContactEmail(student) : "");

  const [date] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [reference, setReference] = useState("");
  const [proofPreview, setProofPreview] = useState(null);
  const [proofError, setProofError] = useState("");
  const [compressingProof, setCompressingProof] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdTickets, setCreatedTickets] = useState(null);
  const [showLookup, setShowLookup] = useState(false);

  const show = shows.items.find((s) => s.id === showId);
  const currency = paymentMethodInfo(method).currency;
  const rate = Number(settings.value.officialRate) || 0;
  const pagoMovilAccount = method === "pago_movil" ? pagoMovilAccountForGroup(settings.value.pagoMovilAccounts, null) : null;
  const methodNote = method !== "pago_movil" ? (settings.value.paymentDetails || {})[method] : null;
  const total = useMemo(() => selected.reduce((sum, s) => sum + seatPrice(s.seat), 0), [selected]);

  const toggleSeat = (row, seat) => {
    setSelected((prev) => {
      const exists = prev.some((s) => s.row === row && s.seat === seat);
      if (exists) return prev.filter((s) => !(s.row === row && s.seat === seat));
      return [...prev, { row, seat }];
    });
  };

  const chooseShow = (id) => {
    setShowId(id);
    setSelected([]);
    setStage("seats");
  };

  const goToBuyer = () => {
    if (selected.length === 0) return setError("Elige al menos un asiento.");
    setError("");
    setStage(student ? "pago" : "datos");
  };

  const validateBuyer = () => {
    if (!buyerName.trim()) return setError("Escribe tu nombre completo."), false;
    if (!buyerPhone.trim()) return setError("Escribe un teléfono de contacto."), false;
    setError("");
    return true;
  };

  const handleProof = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofError("");
    setCompressingProof(true);
    try {
      const compressed = await compressImage(file);
      setProofPreview(compressed);
    } catch {
      setProofError("No se pudo cargar esa foto. Prueba con otra — la necesitas para poder reportar el pago.");
    } finally {
      setCompressingProof(false);
      e.target.value = "";
    }
  };

  const submit = async () => {
    setError("");
    if (!show) return setError("Selecciona una función.");
    if (selected.length === 0) return setError("Elige al menos un asiento.");
    if (!buyerName.trim() || !buyerPhone.trim()) return setError("Completa tus datos de contacto.");
    if (currency === "VES" && !(rate > 0)) return setError("La tasa oficial aún no está configurada — elige otro método de pago.");
    if (!proofPreview) return setError("Adjunta una foto del comprobante de pago para poder reportarlo.");

    const takenNow = selected.filter((s) => isSeatTaken(tickets.items, showId, s.row, s.seat));
    if (takenNow.length > 0) {
      setSelected((prev) => prev.filter((s) => !takenNow.some((t) => t.row === s.row && t.seat === s.seat)));
      return setError("Alguien más reservó uno de los asientos elegidos mientras completabas el formulario. Revisa tu selección.");
    }

    setSaving(true);
    try {
      const transactionId = uid();
      const hasProof = Boolean(proofPreview);
      const created = [];
      for (const seat of selected) {
        const payload = {
          id: uid(),
          transactionId,
          showId,
          row: seat.row,
          seat: seat.seat,
          price: seatPrice(seat.seat),
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          buyerEmail: buyerEmail.trim() || null,
          studentId: student?.id || null,
          date,
          method,
          reference: reference.trim() || null,
          hasProof,
          confirmed: false,
          reportedBy: student ? "representante" : "publico",
          checkedIn: false,
          checkedInAt: null,
        };
        await tickets.add(payload);
        created.push(payload);
      }
      if (proofPreview) await setImage(COLLECTIONS.ticketProofs, transactionId, proofPreview);
      notifyPush({
        target: { role: "admin" },
        title: "Nueva compra de entradas",
        body: `${buyerName.trim()} compró ${created.length} entrada${created.length > 1 ? "s" : ""} para ${show.title}.`,
        url: "/admin",
      });
      setCreatedTickets(created);
      setStage("listo");
    } catch (err) {
      setError(err.message || "No se pudo completar la compra.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={onClose ? "modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-cream" : "min-h-screen bg-cream"}>
      <div className="mx-auto min-h-screen max-w-md px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <CloseOrBack onClose={onClose} />
          <span className="t11 uppercase tracking-widest text-faint">Entradas</span>
        </div>

        {!onClose && <InAppBrowserBanner />}

        <AnimatePresence mode="wait">
          {stage === "show" && (
            <motion.div key="show" {...stepMotion}>
              <div className="mb-1 flex items-start justify-between gap-3">
                <h1 className="font-display text-2xl text-ink">Elige una función</h1>
                {!student && (
                  <button
                    onClick={() => setShowLookup(true)}
                    className="btn btn-ghost shrink-0 whitespace-nowrap"
                  >
                    <Search size={14} /> Ya compré
                  </button>
                )}
              </div>
              {openShows.length === 0 ? (
                <p className="t13 mt-6 rounded-xl bg-cream-dim p-4 text-center text-muted">
                  No hay funciones con entradas disponibles por ahora. Vuelve pronto.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {openShows.map((s) => {
                    const sold = ticketsForShow(tickets.items, s.id).length;
                    return (
                      <button key={s.id} onClick={() => chooseShow(s.id)} className="card w-full p-4 text-left transition hover:shadow-lift">
                        <p className="t13 font-semibold text-ink">{s.title}</p>
                        <p className="t12 mt-0.5 text-muted">{showLabel(s)}</p>
                        {s.venue && <p className="t11 mt-1 text-faint">{s.venue}</p>}
                        <p className="t11 mt-2 text-faint">{sold} entrada{sold === 1 ? "" : "s"} vendida{sold === 1 ? "" : "s"}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {stage === "seats" && show && (
            <motion.div key="seats" {...stepMotion}>
              <h1 className="font-display mb-1 text-2xl text-ink">{show.title}</h1>
              <p className="t13 mb-4 text-muted">{showLabel(show)}</p>
              <SeatMap showId={showId} tickets={tickets.items} selected={selected.map((s) => seatKey(s.row, s.seat))} onToggle={toggleSeat} />
              {selected.length > 0 && (
                <div className="mt-4 rounded-xl bg-cream-dim p-3">
                  <p className="t12 font-medium text-ink">
                    {selected.length} asiento{selected.length > 1 ? "s" : ""} · {selected.map((s) => `${s.row}${s.seat}`).join(", ")}
                  </p>
                  <p className="t11 text-muted">Total: <span className="font-semibold text-ink">{usd(total)}</span></p>
                </div>
              )}
              {error && <p className="t13 mt-3 text-wine">{error}</p>}
              <button disabled={selected.length === 0} onClick={goToBuyer} className="btn btn-primary mt-5 w-full">
                Continuar <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {stage === "datos" && (
            <motion.div key="datos" {...stepMotion}>
              <h1 className="font-display mb-1 text-2xl text-ink">Tus datos</h1>
              <p className="t13 mb-6 text-muted">Los necesitamos para poder ubicarte el día de la función.</p>
              <div className="space-y-4">
                <Field label="Nombre completo" required>
                  <input className={inputCls} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
                </Field>
                <Field label="Teléfono" required>
                  <input className={inputCls} value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
                </Field>
                <Field label="Correo">
                  <input type="email" className={inputCls} value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
                </Field>
              </div>
              {error && <p className="t13 mt-3 text-wine">{error}</p>}
              <button
                onClick={() => validateBuyer() && setStage("pago")}
                className="btn btn-primary mt-6 w-full"
              >
                Continuar <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {stage === "pago" && (
            <motion.div key="pago" {...stepMotion}>
              <h1 className="font-display mb-1 text-2xl text-ink">Pago</h1>
              <p className="t13 mb-4 text-muted">
                {selected.length} asiento{selected.length > 1 ? "s" : ""} · Total {usd(total)}
              </p>
              <div className="space-y-4">
                <Field label="Método" required>
                  <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </Field>
                {method === "pago_movil" && (
                  <div className="rounded-xl bg-cream-dim p-4">
                    <p className="t11 mb-2 font-semibold uppercase tracking-wide text-bronze-dark">Datos para Pago Móvil</p>
                    {pagoMovilAccount ? (
                      <div className="space-y-1.5">
                        {pagoMovilAccount.label && <p className="t12 mb-1 text-muted">{pagoMovilAccount.label}</p>}
                        <CopyRow label="Banco" value={pagoMovilAccount.bank} />
                        <CopyRow label="Cédula" value={pagoMovilAccount.cedula} />
                        <CopyRow label="Teléfono" value={pagoMovilAccount.phone} />
                      </div>
                    ) : (
                      <p className="t13 text-muted">Administración aún no ha configurado los datos de Pago Móvil.</p>
                    )}
                  </div>
                )}
                {methodNote && (
                  <div className="rounded-xl bg-cream-dim p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="t11 mb-1 font-semibold uppercase tracking-wide text-bronze-dark">Datos para {paymentMethodInfo(method).label}</p>
                        <p className="t13 whitespace-pre-wrap text-ink">{methodNote}</p>
                      </div>
                      <CopyButton value={methodNote} />
                    </div>
                  </div>
                )}
                <Field label="Referencia">
                  <input className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} />
                </Field>
                {currency === "VES" && (
                  <div className="rounded-xl bg-teal/10 p-4">
                    <p className="t12 font-medium text-teal-dark">Tasa oficial: {rate > 0 ? `Bs. ${rate}` : "sin configurar"}</p>
                    {rate > 0 && (
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="font-display text-2xl text-ink">Bs. {(total * rate).toFixed(2)}</p>
                        <CopyButton value={(total * rate).toFixed(2)} />
                      </div>
                    )}
                  </div>
                )}
                <Field label="Comprobante (foto)" required>
                  <label className="btn btn-ghost w-full cursor-pointer">
                    <Camera size={16} />
                    {compressingProof ? "Cargando…" : proofPreview ? "Cambiar foto" : "Adjuntar comprobante"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleProof} disabled={compressingProof} />
                  </label>
                  <p className="t11 mt-1.5 text-muted">Obligatorio — adjunta la foto del comprobante de pago.</p>
                  {proofError && <p className="t11 mt-1 text-wine">{proofError}</p>}
                  {proofPreview && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={proofPreview} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      <button type="button" onClick={() => setProofPreview(null)} className="t12 text-wine underline underline-offset-2">
                        Quitar foto
                      </button>
                    </div>
                  )}
                </Field>
              </div>
              {error && <p className="t13 mt-3 text-wine">{error}</p>}
              <button disabled={saving} onClick={submit} className="btn btn-primary mt-6 w-full">
                {saving ? "Procesando…" : `Comprar por ${usd(total)}`}
              </button>
            </motion.div>
          )}

          {stage === "listo" && createdTickets && (
            <motion.div key="listo" {...stepMotion}>
              <div className="mb-5 flex flex-col items-center text-center">
                <CheckCircle2 size={40} className="mb-2 text-teal" />
                <h1 className="font-display text-2xl text-ink">¡Listo!</h1>
                <p className="t13 mt-1 max-w-xs text-muted">
                  Guarda estas entradas — muéstralas en la puerta el día de la función. Quedan por confirmar hasta que administración revise el pago.
                </p>
              </div>
              {!student && (
                <div className="mb-5 rounded-2xl border-2 border-bronze bg-bronze/10 p-4 text-center">
                  <Camera size={28} className="mx-auto mb-2 text-bronze-dark" />
                  <p className="font-display text-lg uppercase tracking-wide text-bronze-dark">
                    GUARDA TUS ENTRADAS AHORA
                  </p>
                  <p className="t13 mt-1 text-ink">
                    Toma una captura de pantalla o descarga el PDF abajo <strong>antes de salir de esta pantalla</strong>.
                    No hace falta imprimirlas, pero sí tenerlas guardadas en tu teléfono — las vas a necesitar a la
                    mano el día de la función.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {createdTickets.length > 1 && <TicketReceipt tickets={createdTickets} show={show} />}
                {createdTickets.map((t) => (
                  <TicketQR key={t.id} ticket={t} show={show} />
                ))}
              </div>
              <button onClick={() => downloadTicketsPdf(createdTickets, show)} className="btn btn-primary mt-5 w-full">
                <Download size={15} /> Descargar PDF
              </button>
              {onClose ? (
                <button onClick={onClose} className="btn btn-ghost mt-2 w-full">Volver al portal</button>
              ) : (
                <Link to="/" className="btn btn-ghost mt-2 w-full">Volver al inicio</Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showLookup && <TicketLookupModal onClose={() => setShowLookup(false)} />}
    </div>
  );
}
