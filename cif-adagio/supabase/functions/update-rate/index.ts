// Función de Supabase Edge: actualiza sola, todos los días, la tasa
// oficial BCV y una tasa de referencia del paralelo (la que de hecho sigue
// de cerca lo que se negocia en Binance P2P, que es como hoy en día se
// arma casi cualquier "tasa paralelo" en Venezuela) — llamando a DolarAPI
// (ve.dolarapi.com), un servicio gratuito y comunitario, sin necesidad de
// clave. No es la API oficial del BCV (el banco no tiene una pública):
// es la misma fuente que usan muchas apps venezolanas para esto.
//
// Si DolarAPI alguna vez deja de responder o cambia de formato, esta
// función simplemente no actualiza nada ese día — nunca borra ni daña lo
// que ya estaba guardado, y en Ajustes siempre se puede seguir corrigiendo
// la tasa a mano, igual que antes.
//
// Cómo desplegarla: panel de Supabase → Edge Functions → Deploy a new
// function → nómbrala exactamente "update-rate" → pega este archivo
// completo → Deploy. (No hace falta configurar ningún secreto nuevo:
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya existen automáticamente en
// toda función de Supabase.)
//
// Para que se llame sola cada día, ver supabase/schedule-update-rate.sql.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const restHeaders = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

// Mismo generador de id "legible" que usa el resto de la app (ver uid() en
// src/lib/format.js) — solo para que los documentos creados desde aquí se
// vean igual que los que crea la app.
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

async function fetchRate(fuente: string): Promise<number | null> {
  try {
    const res = await fetch(`https://ve.dolarapi.com/v1/dolares/${fuente}`);
    if (!res.ok) return null;
    const data = await res.json();
    const value = Number(data?.promedio);
    return value > 0 ? value : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const [officialRate, binanceRate] = await Promise.all([fetchRate("oficial"), fetchRate("paralelo")]);

    if (!officialRate) {
      return new Response(JSON.stringify({ error: "No se pudo obtener la tasa oficial de DolarAPI hoy." }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Mismo formato de fecha que usa "Guardar tasas" en Ajustes (para que
    // una entrada automática y una manual del mismo día se reconozcan como
    // la misma).
    const today = new Date().toISOString().slice(0, 10);

    const settingsPatch: Record<string, unknown> = { officialRate, rateDate: today };
    if (binanceRate) {
      settingsPatch.binanceRate = binanceRate;
      settingsPatch.binanceRateDate = today;
    }

    const settingsRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/merge_document`, {
      method: "POST",
      headers: restHeaders,
      body: JSON.stringify({ p_collection: "config", p_id: "settings", p_patch: settingsPatch }),
    });
    if (!settingsRes.ok) throw new Error(`No se pudo guardar la tasa en Ajustes: ${await settingsRes.text()}`);

    // rateHistory: una entrada por día — si ya existe la de hoy (por
    // ejemplo porque administración ya la había guardado a mano), se
    // actualiza en vez de duplicarla.
    const historyPatch: Record<string, unknown> = { rate: officialRate };
    if (binanceRate) historyPatch.binanceRate = binanceRate;

    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/documents?collection=eq.rateHistory&data->>date=eq.${today}&select=id`,
      { headers: restHeaders }
    );
    const existingRows = await existingRes.json();

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      const historyRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/merge_document`, {
        method: "POST",
        headers: restHeaders,
        body: JSON.stringify({ p_collection: "rateHistory", p_id: existingRows[0].id, p_patch: historyPatch }),
      });
      if (!historyRes.ok) throw new Error(`No se pudo actualizar el historial de tasas: ${await historyRes.text()}`);
    } else {
      const id = uid();
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
        method: "POST",
        headers: { ...restHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({
          collection: "rateHistory",
          id,
          data: { id, date: today, ...historyPatch, createdAt: new Date().toISOString() },
        }),
      });
      if (!insertRes.ok) throw new Error(`No se pudo crear el historial de tasas: ${await insertRes.text()}`);
    }

    return new Response(JSON.stringify({ ok: true, officialRate, binanceRate, date: today }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS_HEADERS });
  }
});
