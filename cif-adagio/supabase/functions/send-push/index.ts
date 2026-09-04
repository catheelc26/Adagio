// Función de Supabase Edge: envía notificaciones push a los dispositivos
// suscritos que coincidan con el "target" pedido.
//
// Cómo desplegarla: panel de Supabase → Edge Functions → Deploy a new
// function → nómbrala "send-push" → pega este archivo completo → Deploy.
// Luego, en Edge Functions → send-push → Secrets, agrega:
//   VAPID_PUBLIC_KEY   (el mismo valor que VITE_VAPID_PUBLIC_KEY en Netlify)
//   VAPID_PRIVATE_KEY  (nunca la pongas en el frontend, solo aquí)
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya existen automáticamente en
// toda función de Supabase, no hace falta configurarlos.
//
// Body esperado (lo arma automáticamente src/lib/push.js):
//   { target: { role: "admin" | "teacher" | "representative", group?: string },
//     title: string, body: string, url?: string }

import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails("mailto:no-reply@cif-adagio.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: "VAPID keys not configured" }), { status: 500, headers: CORS_HEADERS });
  }

  try {
    const { target, title, body, url } = await req.json();
    if (!target?.role || !title) {
      return new Response(JSON.stringify({ error: "Missing target.role or title" }), { status: 400, headers: CORS_HEADERS });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/documents?collection=eq.pushSubscriptions&select=id,data`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    });
    const rows = await res.json();

    const matches = (Array.isArray(rows) ? rows : []).filter((r) => {
      const d = r.data || {};
      if (d.role !== target.role) return false;
      if (target.role === "representative" && target.group && d.group && d.group !== target.group) return false;
      return Boolean(d.endpoint && d.keys);
    });

    const payload = JSON.stringify({ title, body, url });
    const results = await Promise.allSettled(
      matches.map((r) => webpush.sendNotification({ endpoint: r.data.endpoint, keys: r.data.keys }, payload))
    );

    // Limpia suscripciones muertas (410 Gone / 404) para no reintentarlas siempre.
    const deadIds = matches
      .filter((_, i) => {
        const r = results[i];
        return r.status === "rejected" && [404, 410].includes(r.reason?.statusCode);
      })
      .map((r) => r.id);
    if (deadIds.length) {
      await fetch(`${SUPABASE_URL}/rest/v1/documents?collection=eq.pushSubscriptions&id=in.(${deadIds.join(",")})`, {
        method: "DELETE",
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      });
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return new Response(JSON.stringify({ sent, total: matches.length }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 400, headers: CORS_HEADERS });
  }
});
