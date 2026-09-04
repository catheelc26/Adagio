import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { uid } from "./format";

// ---------------------------------------------------------------------
// "Colecciones" — todas viven como filas en una única tabla Postgres
// llamada `documents` (columns: collection, id, data jsonb), para que el
// resto de la app pueda seguir pensando en documentos/colecciones como en
// la versión original, aunque por debajo sea una base de datos relacional.
// Ver supabase/schema.sql para la definición de la tabla y sus políticas.
// ---------------------------------------------------------------------
export const COLLECTIONS = {
  students: "students",
  payments: "payments",
  reminders: "reminders",
  rateHistory: "rateHistory",
  schedule: "schedule",
  trialBookings: "trialBookings",
  teacherNotes: "teacherNotes",
  tasks: "tasks",
  attendance: "attendance",
  announcements: "announcements",
  events: "events",
  studentPhotos: "studentPhotos",
  paymentProofs: "paymentProofs",
};

const SETTINGS_ID = "settings";
const DEFAULT_SETTINGS = {
  officialRate: 0,
  rateDate: null,
  adminPin: "",
  inscriptionFee: 15,
  teacherPin: "",
  studioPhoto: null,
  paymentDetails: {},
};

/** Lista en tiempo real de una colección completa, con helpers add/update/remove. */
export function useCollection(name) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase.from("documents").select("id, data").eq("collection", name);
    if (err) {
      setError(err.message || "No se pudo cargar la información.");
    } else {
      setItems((data || []).map((row) => ({ ...row.data, id: row.id })));
      setError(null);
    }
    setLoading(false);
  }, [name]);

  useEffect(() => {
    setLoading(true);
    reload();
    if (!supabase) return;
    const channel = supabase
      .channel(`documents:${name}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "documents", filter: `collection=eq.${name}` }, () => {
        reload();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [name, reload]);

  const add = useCallback(
    async (data) => {
      if (!supabase) throw new Error("La base de datos no está configurada.");
      const id = data.id || uid();
      const payload = { ...data, id, createdAt: data.createdAt || new Date().toISOString() };
      const { error: err } = await supabase.from("documents").upsert({ collection: name, id, data: payload });
      if (err) throw err;
      return id;
    },
    [name]
  );

  const update = useCallback(
    async (id, patch) => {
      if (!supabase) throw new Error("La base de datos no está configurada.");
      const current = items.find((it) => it.id === id) || {};
      const merged = { ...current, ...patch, id };
      const { error: err } = await supabase.from("documents").update({ data: merged }).eq("collection", name).eq("id", id);
      if (err) throw err;
    },
    [name, items]
  );

  const remove = useCallback(
    async (id) => {
      if (!supabase) throw new Error("La base de datos no está configurada.");
      const { error: err } = await supabase.from("documents").delete().eq("collection", name).eq("id", id);
      if (err) throw err;
    },
    [name]
  );

  return { items, loading, error, add, update, remove };
}

/** Documento único (usado hoy solo para la configuración global). */
export function useSettings() {
  const [value, setValue] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("documents").select("data").eq("collection", "config").eq("id", SETTINGS_ID).maybeSingle();
    setValue(data ? { ...DEFAULT_SETTINGS, ...data.data } : DEFAULT_SETTINGS);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    if (!supabase) return;
    const channel = supabase
      .channel("documents:config:settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents", filter: `collection=eq.config` }, () => {
        reload();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  const save = useCallback(
    async (patch) => {
      if (!supabase) throw new Error("La base de datos no está configurada.");
      const merged = { ...value, ...patch };
      const { error: err } = await supabase.from("documents").upsert({ collection: "config", id: SETTINGS_ID, data: merged });
      if (err) throw err;
    },
    [value]
  );

  return { value, loading, save };
}

/** Foto de un estudiante o comprobante de pago, guardados como data URI. */
export async function getImage(collectionName, id) {
  if (!supabase || !id) return null;
  const { data } = await supabase.from("documents").select("data").eq("collection", collectionName).eq("id", id).maybeSingle();
  return data?.data?.dataUrl ?? null;
}

export async function setImage(collectionName, id, dataUrl) {
  if (!supabase) throw new Error("La base de datos no está configurada.");
  const { error: err } = await supabase.from("documents").upsert({ collection: collectionName, id, data: { dataUrl } });
  if (err) throw err;
}

export async function deleteImage(collectionName, id) {
  if (!supabase) throw new Error("La base de datos no está configurada.");
  const { error: err } = await supabase.from("documents").delete().eq("collection", collectionName).eq("id", id);
  if (err) throw err;
}
