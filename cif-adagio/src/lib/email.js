// Envío de entradas por correo — pide al backend (función de Supabase) que
// las mande, con su código QR. Best-effort: si falla, no interrumpe la
// compra (las entradas ya quedaron guardadas y se pueden descargar o
// reenviar después). Ver supabase/functions/send-ticket-email para
// desplegar la función y configurar el proveedor de correo.
export async function sendTicketsEmail({ to, buyerName, show, tickets }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!to || !supabaseUrl || !anonKey || !tickets?.length) return { ok: false };

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-ticket-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}`, apikey: anonKey },
      body: JSON.stringify({
        to,
        buyerName,
        show: show ? { title: show.title, date: show.date, time: show.time } : null,
        tickets: tickets.map((t) => ({ id: t.id, row: t.row, seat: t.seat, price: t.price, confirmed: t.confirmed })),
      }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
