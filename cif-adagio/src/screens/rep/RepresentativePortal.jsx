import { useState } from "react";
import {
  Home, Wallet, CalendarDays, Megaphone, LogOut, Camera, Receipt, Image as ImageIcon, Sparkles, SquareCheck,
} from "lucide-react";
import { useAppData } from "../../lib/AppDataContext";
import { groupById, requiresInscription, WEEKDAYS, eventTypeInfo } from "../../lib/constants";
import { owesMonthlyFee } from "../../lib/business";
import { currentMonthKey, usd } from "../../lib/format";
import { compressImage } from "../../lib/image";
import { COLLECTIONS, setImage } from "../../lib/db";
import { Chip, StudentAvatar } from "../../components/ui";
import { PushToggle } from "../../components/PushToggle";
import { MonthCalendar } from "../../components/MonthCalendar";
import { ReglamentoModal } from "../../components/ReglamentoModal";
import { PaymentForm } from "../../components/PaymentForm";
import { ReceiptModal } from "../../components/ReceiptModal";
import { ProofViewer } from "../../components/ProofViewer";

const TABS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "pagos", label: "Pagos", icon: Wallet },
  { id: "calendario", label: "Calendario", icon: CalendarDays },
  { id: "avisos", label: "Avisos", icon: Megaphone },
];

export function RepresentativePortal({ student, onLogout }) {
  const { payments, schedule, events, tasks, announcements, toast } = useAppData();
  const [tab, setTab] = useState("inicio");
  const [showReglamento, setShowReglamento] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [proofId, setProofId] = useState(null);

  const g = groupById(student.group);
  const month = currentMonthKey();
  const welcomeName = student.isMinor ? student.guardianName : student.fullName;

  const paidThisMonth = payments.items.some(
    (p) => p.studentId === student.id && p.type === "mensualidad" && p.month === month && p.confirmed !== false
  );

  let statusLabel = "Al día";
  let statusColor = "var(--color-teal)";
  if (student.pendingReview) {
    statusLabel = "En revisión";
    statusColor = "var(--color-bronze)";
  } else if (student.scholarshipType === "full") {
    statusLabel = "Becado";
    statusColor = "var(--color-plum)";
  } else if (owesMonthlyFee(student) && !paidThisMonth) {
    statusLabel = "Pendiente";
    statusColor = "var(--color-wine)";
  }

  const currentYear = String(new Date().getFullYear());
  const needsInscription =
    requiresInscription(student.group) &&
    !payments.items.some((p) => p.studentId === student.id && p.type === "inscripcion" && p.date?.startsWith(currentYear));

  const visibleAnnouncements = announcements.items.filter(
    (a) => (a.group === null || a.group === undefined || a.group === student.group) && (!a.expiresAt || a.expiresAt >= new Date().toISOString().slice(0, 10))
  );

  const groupSlots = schedule.items.filter((s) => s.group === student.group);
  const groupEvents = events.items.filter((e) => !e.group || e.group === student.group);
  const groupTasks = tasks.items.filter((t) => t.group === student.group).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthPrefix = todayStr.slice(0, 7);
  const upcomingEvents = groupEvents.filter((e) => e.date >= todayStr).sort((a, b) => (a.date < b.date ? -1 : 1));
  const monthHighlight = upcomingEvents.find((e) => e.type === "evento" && e.date.startsWith(currentMonthPrefix));

  const studentPayments = payments.items.filter((p) => p.studentId === student.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const transactionIds = Array.from(new Set(studentPayments.map((p) => p.transactionId || p.id)));

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 400, 0.75);
    await setImage(COLLECTIONS.studentPhotos, student.id, compressed);
    toast("Foto actualizada.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-cream/95 px-5 py-3 backdrop-blur">
        <div className="relative">
          <StudentAvatar student={student} size={44} />
          <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-ink p-1 text-cream">
            <Camera size={10} />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>
        <div className="flex-1">
          <p className="t13 font-medium text-ink">Hola, {welcomeName}</p>
          <p className="t11 text-muted">{g?.name}</p>
        </div>
        <PushToggle role="representative" group={student.group} studentId={student.id} />
        <button onClick={onLogout} className="flex items-center gap-1.5 t12 text-muted hover:text-wine">
          <LogOut size={15} /> Salir
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 space-y-5 px-5 py-6 pb-24">
        {tab === "inicio" && (
          <>
            <div className="relative h-32 overflow-hidden rounded-[24px] shadow-soft">
              <img src="/photos-web/portrait-barre.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 20%" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(190deg, rgba(43,50,56,0.05) 40%, rgba(43,50,56,0.6) 100%)" }} />
              <div className="absolute inset-x-4 bottom-3.5">
                <p className="font-display text-lg font-semibold leading-tight text-white">Hola, {welcomeName}</p>
                <p className="t12 text-white/85">{g?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Chip color={statusColor}>{statusLabel}</Chip>
              {!owesMonthlyFee(student) && student.scholarshipType !== "full" && <Chip color="var(--color-blue)">Por clase</Chip>}
            </div>

            {student.pendingReview && (
              <div className="card border-l-4 border-l-bronze p-4">
                <p className="t13 text-ink">Tu registro está pendiente de revisión por administración. Ya puedes usar el portal mientras tanto.</p>
              </div>
            )}

            {needsInscription && (
              <div className="card border-l-4 border-l-wine p-4">
                <p className="t13 text-ink">Aún no se ha registrado la inscripción anual de este año para {student.fullName}.</p>
              </div>
            )}

            {visibleAnnouncements.length > 0 && (
              <button onClick={() => setTab("avisos")} className="card flex w-full items-center gap-3 p-4 text-left">
                <Megaphone size={18} className="text-bronze-dark" />
                <p className="t13 text-ink">{visibleAnnouncements.length} aviso{visibleAnnouncements.length > 1 ? "s" : ""} de la escuela</p>
              </button>
            )}

            <div className="card p-4">
              <p className="t11 mb-2 font-semibold uppercase tracking-wide text-bronze-dark">Horario de {g?.name}</p>
              {groupSlots.length === 0 ? (
                <p className="t13 text-muted">Aún no hay horario configurado.</p>
              ) : (
                <div className="space-y-1.5">
                  {groupSlots.map((s) => (
                    <p key={s.id} className="t13 text-ink">{WEEKDAYS[s.weekday]} · {s.startTime}–{s.endTime}</p>
                  ))}
                </div>
              )}
            </div>

            {groupTasks.length > 0 && (
              <div className="card p-4">
                <p className="t11 mb-2 font-semibold uppercase tracking-wide text-bronze-dark">Tareas de {g?.name}</p>
                <div className="space-y-2">
                  {groupTasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="t13 text-ink">
                      • {t.description}
                      {t.dueDate && <span className="t11 text-muted"> — para el {t.dueDate}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-4">
              <p className="t11 mb-2 font-semibold uppercase tracking-wide text-bronze-dark">Contacto de emergencia registrado</p>
              <p className="t13 text-ink">{student.emergencyName} ({student.emergencyRelationship || "—"})</p>
              <p className="t13 text-muted">{student.emergencyPhone}</p>
            </div>

            <button onClick={() => setShowReglamento(true)} className="btn btn-ghost w-full">Ver reglamento</button>
          </>
        )}

        {tab === "pagos" && (
          <>
            <button onClick={() => setShowPaymentForm(true)} className="btn btn-primary w-full">
              Registrar un pago
            </button>
            <div className="space-y-2">
              {transactionIds.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-4 text-center text-muted">Aún no hay pagos registrados.</p>}
              {transactionIds.map((tid) => {
                const first = studentPayments.find((p) => (p.transactionId || p.id) === tid);
                const sum = studentPayments.filter((p) => (p.transactionId || p.id) === tid).reduce((s, p) => s + p.amount, 0);
                return (
                  <div key={tid} className="card flex items-center gap-3 p-3">
                    <div className="flex-1">
                      <p className="t13 text-ink">{first.date} · {first.concept}</p>
                      <p className="t11 text-muted">{first.confirmed === false ? "Por confirmar" : "Confirmado"} · {usd(sum)}</p>
                    </div>
                    <button onClick={() => setReceiptId(tid)} className="rounded-lg p-2 text-teal hover:bg-teal/10"><Receipt size={16} /></button>
                    {first.hasProof && (
                      <button onClick={() => setProofId(tid)} className="rounded-lg p-2 text-bronze-dark hover:bg-bronze/10"><ImageIcon size={16} /></button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "calendario" && (
          <>
            <MonthCalendar weeklySlots={groupSlots} events={groupEvents} groupColor={g?.color || "var(--color-teal)"} />

            {monthHighlight && (
              <div className="relative overflow-hidden rounded-2xl p-4 shadow-soft" style={{ background: "linear-gradient(135deg, var(--color-bronze), var(--color-bronze-dark))" }}>
                <p className="t11 flex items-center gap-1.5 font-semibold uppercase tracking-wide text-white/80">
                  <Sparkles size={12} /> Enfoque del mes
                </p>
                <p className="font-display mt-1 text-base font-semibold text-white">{monthHighlight.title}</p>
                <p className="t12 mt-0.5 text-white/85">
                  {new Date(monthHighlight.date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" })} · {monthHighlight.startTime}
                </p>
              </div>
            )}

            {groupTasks.length > 0 && (
              <div className="card p-4">
                <p className="t11 mb-2.5 font-semibold uppercase tracking-wide text-bronze-dark">Tareas de {g?.name}</p>
                <div className="space-y-2">
                  {groupTasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-start gap-2">
                      <SquareCheck size={15} className="mt-0.5 shrink-0 text-teal" />
                      <p className="t13 text-ink">
                        {t.description}
                        {t.dueDate && <span className="t11 text-muted"> — para el {t.dueDate}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="t11 mb-2 font-semibold uppercase tracking-wide text-bronze-dark">Próximos eventos</p>
              <div className="space-y-2">
                {upcomingEvents.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-4 text-center text-muted">Sin eventos próximos.</p>}
                {upcomingEvents.slice(0, 6).map((e) => (
                  <div key={e.id} className="card flex items-center gap-3 p-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: eventTypeInfo(e.type).color }} />
                    <div className="flex-1">
                      <p className="t13 text-ink">{e.title}</p>
                      <p className="t11 text-muted">{e.date} · {e.startTime}–{e.endTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "avisos" && (
          <div className="space-y-2">
            {visibleAnnouncements.length === 0 && <p className="t13 rounded-xl bg-cream-dim p-4 text-center text-muted">Sin avisos por ahora.</p>}
            {visibleAnnouncements.map((a) => (
              <div key={a.id} className="card p-4">
                <p className="t13 text-ink">{a.text}</p>
                {a.expiresAt && <p className="t11 mt-1 text-muted">Vigente hasta {a.expiresAt}</p>}
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-1 flex-col items-center gap-1 py-2.5 t10 font-medium ${tab === t.id ? "text-teal" : "text-faint"}`}>
              <t.icon size={19} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {showReglamento && <ReglamentoModal onClose={() => setShowReglamento(false)} />}
      {showPaymentForm && <PaymentForm student={student} isAdmin={false} onClose={() => setShowPaymentForm(false)} />}
      {receiptId && <ReceiptModal transactionId={receiptId} payments={studentPayments} students={[student]} onClose={() => setReceiptId(null)} />}
      {proofId && <ProofViewer transactionId={proofId} onClose={() => setProofId(null)} />}
    </div>
  );
}
