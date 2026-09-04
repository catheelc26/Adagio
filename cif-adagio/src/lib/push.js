import { supabase } from "./supabase";
import { uid } from "./format";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
export const pushConfigured = Boolean(VAPID_PUBLIC_KEY);

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** "unsupported" | "denied" | "available" | "subscribed" */
export async function getPushStatus() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !pushConfigured) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  return sub ? "subscribed" : "available";
}

export async function subscribeToPush({ role, group = null, studentId = null }) {
  if (!pushConfigured) throw new Error("Las notificaciones no están configuradas todavía.");
  if (!supabase) throw new Error("La base de datos no está configurada.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Diste permiso denegado para las notificaciones.");

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = sub.toJSON();
  const { error } = await supabase.from("documents").upsert({
    collection: "pushSubscriptions",
    id: uid(),
    data: { role, group, studentId, endpoint: json.endpoint, keys: json.keys, createdAt: new Date().toISOString() },
  });
  if (error) throw error;
}

export async function unsubscribeFromPush() {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (!sub) return;
  if (supabase) {
    const { data: rows } = await supabase.from("documents").select("id, data").eq("collection", "pushSubscriptions");
    const stale = (rows || []).filter((r) => r.data?.endpoint === sub.endpoint);
    if (stale.length) {
      await supabase.from("documents").delete().eq("collection", "pushSubscriptions").in("id", stale.map((r) => r.id));
    }
  }
  await sub.unsubscribe();
}

/**
 * Pide al backend (función de Supabase) que envíe una notificación push.
 * Si las notificaciones no están configuradas o falla el envío, no interrumpe
 * el flujo principal (crear el aviso/pago/reserva ya se hizo).
 */
export async function notifyPush({ target, title, body, url }) {
  if (!pushConfigured || !supabase) return;
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}`, apikey: anonKey },
      body: JSON.stringify({ target, title, body, url }),
    });
  } catch {
    /* best-effort: never block the caller's main action */
  }
}
