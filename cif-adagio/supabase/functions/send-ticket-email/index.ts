// Función de Supabase Edge: manda por correo el PDF de unas entradas ya
// armado (lo arma el navegador, con jsPDF — ver src/lib/ticketsPdf.js) a
// través de Resend (resend.com), un servicio de envío de correos con un
// plan gratuito (3.000 correos al mes). No guarda nada en la base de
// datos — solo reenvía el correo.
//
// Cómo desplegarla: panel de Supabase → Edge Functions → Deploy a new
// function → nómbrala exactamente "send-ticket-email" → pega este archivo
// completo → Deploy.
//
// Secrets que hay que agregar (Edge Functions → send-ticket-email →
// Secrets):
//   RESEND_API_KEY   la clave de tu cuenta de Resend (resend.com/api-keys)
//   RESEND_FROM      (opcional) remitente, ej. "CIF Adagio <entradas@tudominio.com>"
//                     — sin esto, usa un remitente de pruebas de Resend que
//                     SOLO entrega al correo de tu propia cuenta de Resend,
//                     no a compradores reales. Para enviar a cualquier
//                     comprador hace falta verificar un dominio propio en
//                     Resend (resend.com/domains) y usar un remitente de
//                     ese dominio aquí.
//
// Body esperado (lo arma automáticamente src/lib/ticketsPdf.js):
//   { to: string, buyerName: string, showTitle: string, showDate: string,
//     filename: string, pdfBase64: string }

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "CIF Adagio <onboarding@resend.dev>";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY no está configurada." }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { to, buyerName, showTitle, showDate, filename, pdfBase64 } = await req.json();
    if (!to || !pdfBase64) {
      return new Response(JSON.stringify({ error: "Falta el correo o el PDF." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const html = `
      <p>Hola ${buyerName || ""},</p>
      <p>Aquí tienes tus entradas para <strong>${showTitle || "la función"}</strong>${showDate ? ` — ${showDate}` : ""}.</p>
      <p>Guarda este correo o el PDF adjunto — muéstralo en la puerta el día de la función.</p>
      <p>¡Nos vemos pronto!<br>CIF Adagio</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject: `Tus entradas — ${showTitle || "CIF Adagio"}`,
        html,
        attachments: [{ filename: filename || "entradas.pdf", content: pdfBase64 }],
      }),
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      return new Response(JSON.stringify({ error: result?.message || "Resend no pudo enviar el correo." }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: result?.id }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS_HEADERS });
  }
});
