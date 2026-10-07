// Función de Supabase Edge: envía las entradas (con su código QR) por
// correo a quien las compró — tanto automáticamente al comprar como
// cuando alguien pide reenviarlas desde la app.
//
// Cómo desplegarla: panel de Supabase → Edge Functions → Deploy a new
// function → nómbrala "send-ticket-email" → pega este archivo completo →
// Deploy. Luego, en Edge Functions → send-ticket-email → Secrets, agrega:
//   RESEND_API_KEY   crea una cuenta gratis en resend.com → API Keys →
//                     Create API Key, y pega el valor aquí.
//   RESEND_FROM      opcional — remitente de los correos, por ejemplo
//                     "CIF Adagio <entradas@tudominio.com>". Para usar un
//                     correo con tu propio dominio hay que verificarlo en
//                     resend.com → Domains. Si no configuras esto, se usa
//                     la dirección de prueba de Resend (onboarding@resend.dev),
//                     que solo envía a la cuenta con la que te registraste —
//                     para mandarle correos reales a tus compradores
//                     necesitas verificar un dominio propio.
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya existen automáticamente, no
// hace falta configurarlos.
//
// Body esperado (lo arma src/lib/email.js):
//   { to: string, buyerName?: string, show: {title, date, time}|null,
//     tickets: [{ id, row, seat, price, confirmed }] }

import QRCode from "npm:qrcode@1.5.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "CIF Adagio <onboarding@resend.dev>";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const usd = (n: number) => `$${(Number(n) || 0).toFixed(2)}`;
const seatSection = (seat: number) => (seat >= 8 && seat <= 14 ? "Centro" : "Lateral");

function showDateLabel(show: { date?: string; time?: string } | null) {
  if (!show?.date) return "";
  const d = new Date(`${show.date}T00:00:00`);
  const str = d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  return show.time ? `${str} · ${show.time}` : str;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: CORS_HEADERS });
  }

  try {
    const { to, buyerName, show, tickets } = await req.json();
    if (!to || !Array.isArray(tickets) || tickets.length === 0) {
      return new Response(JSON.stringify({ error: "Missing to or tickets" }), { status: 400, headers: CORS_HEADERS });
    }

    const ticketsHtml = (
      await Promise.all(
        tickets.map(async (t: { id: string; row: string; seat: number; price: number; confirmed?: boolean }) => {
          const qr = await QRCode.toDataURL(`ADAGIO-TICKET:${t.id}`, { width: 240, margin: 1 });
          return `
        <table role="presentation" width="100%" style="margin:16px 0;border:1px solid #e3dcc9;border-radius:12px;overflow:hidden">
          <tr><td style="background:#2b3238;color:#f6f3ec;padding:14px;text-align:center;font-family:sans-serif">
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:.8">CIF Adagio</div>
            <div style="font-size:18px;margin-top:4px">${show?.title || "Función"}</div>
            <div style="font-size:12px;opacity:.75">${showDateLabel(show)}</div>
          </td></tr>
          <tr><td style="padding:18px;text-align:center;font-family:sans-serif">
            <img src="${qr}" width="180" height="180" alt="Código QR" style="display:block;margin:0 auto 12px" />
            <div style="font-size:16px;font-weight:600;color:#2b3238">Fila ${t.row} · Asiento ${t.seat}</div>
            <div style="font-size:13px;color:#7c7870">${seatSection(t.seat)} · ${usd(t.price)}</div>
            ${t.confirmed === false ? '<div style="margin-top:8px;font-size:12px;color:#9c7a34">Pago por confirmar</div>' : ""}
          </td></tr>
        </table>`;
        })
      )
    ).join("");

    const total = tickets.reduce((s: number, t: { price: number }) => s + (Number(t.price) || 0), 0);
    const receiptHtml =
      tickets.length > 1
        ? `<table role="presentation" width="100%" style="margin-bottom:8px;font-family:sans-serif;color:#2b3238">
             <tr><td style="padding:4px 0">Total · ${tickets.length} asientos</td>
                 <td style="padding:4px 0;text-align:right;font-weight:600">${usd(total)}</td></tr>
           </table>`
        : "";

    const html = `
      <div style="max-width:480px;margin:0 auto;font-family:sans-serif">
        <p style="color:#2b3238">Hola${buyerName ? ` ${buyerName}` : ""}, aquí tienes tu${tickets.length > 1 ? "s" : ""} entrada${
      tickets.length > 1 ? "s" : ""
    } para <strong>${show?.title || "la función"}</strong>.</p>
        ${receiptHtml}
        ${ticketsHtml}
        <p style="color:#9a9284;font-size:12px">Muéstralas en la puerta el día de la función — también puedes descargarlas como PDF desde la app.</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject: `Tus entradas — ${show?.title || "CIF Adagio"}`,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: text }), { status: 502, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 400, headers: CORS_HEADERS });
  }
});
