import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { getPushStatus, subscribeToPush, unsubscribeFromPush } from "../lib/push";
import { useAppData } from "../lib/AppDataContext";

/** Campanita para activar/desactivar notificaciones push de este dispositivo. */
export function PushToggle({ role, group = null, studentId = null }) {
  const { toast } = useAppData();
  const [status, setStatus] = useState("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushStatus().then(setStatus);
  }, []);

  if (status === "unsupported" || status === "checking") return null;

  const toggle = async () => {
    setBusy(true);
    try {
      if (status === "subscribed") {
        await unsubscribeFromPush();
        setStatus("available");
        toast("Notificaciones desactivadas en este dispositivo.");
      } else {
        await subscribeToPush({ role, group, studentId });
        setStatus("subscribed");
        toast("¡Notificaciones activadas!");
      }
    } catch (err) {
      toast(err.message || "No se pudo cambiar las notificaciones.");
      getPushStatus().then(setStatus);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy || status === "denied"}
      title={status === "denied" ? "Bloqueaste las notificaciones en el navegador" : status === "subscribed" ? "Desactivar notificaciones" : "Activar notificaciones"}
      className="rounded-full p-2 text-muted hover:bg-cream-dim hover:text-ink disabled:opacity-40"
    >
      {status === "subscribed" ? <Bell size={17} className="text-teal" /> : <BellOff size={17} />}
    </button>
  );
}
