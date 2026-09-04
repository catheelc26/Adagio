import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { uid } from "./format";

// ---------------------------------------------------------------------
// Colecciones Firestore — reemplazan las 11 listas + 1 objeto que la
// versión original guardaba bajo claves window.storage:"ballet:*".
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

const SETTINGS_DOC = ["config", "settings"];
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

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      collection(db, name),
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "No se pudo cargar la información.");
        setLoading(false);
      }
    );
    return unsub;
  }, [name]);

  const add = useCallback(
    async (data) => {
      if (!db) throw new Error("Firebase no está configurado.");
      const id = data.id || uid();
      await setDoc(doc(db, name, id), { ...data, id, createdAt: data.createdAt || new Date().toISOString() });
      return id;
    },
    [name]
  );

  const update = useCallback(
    async (id, patch) => {
      if (!db) throw new Error("Firebase no está configurado.");
      await updateDoc(doc(db, name, id), patch);
    },
    [name]
  );

  const remove = useCallback(
    async (id) => {
      if (!db) throw new Error("Firebase no está configurado.");
      await deleteDoc(doc(db, name, id));
    },
    [name]
  );

  return { items, loading, error, add, update, remove };
}

/** Documento único (usado hoy solo para la configuración global). */
export function useSettings() {
  const [value, setValue] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, ...SETTINGS_DOC), (snap) => {
      setValue(snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : DEFAULT_SETTINGS);
      setLoading(false);
    });
    return unsub;
  }, []);

  const save = useCallback(async (patch) => {
    if (!db) throw new Error("Firebase no está configurado.");
    await setDoc(doc(db, ...SETTINGS_DOC), patch, { merge: true });
  }, []);

  return { value, loading, save };
}

/** Foto de un estudiante o comprobante de pago, guardados como data URI en Firestore. */
export async function getImage(collectionName, id) {
  if (!db || !id) return null;
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? snap.data().dataUrl : null;
}

export async function setImage(collectionName, id, dataUrl) {
  if (!db) throw new Error("Firebase no está configurado.");
  await setDoc(doc(db, collectionName, id), { dataUrl, updatedAt: serverTimestamp() });
}

export async function deleteImage(collectionName, id) {
  if (!db) throw new Error("Firebase no está configurado.");
  await deleteDoc(doc(db, collectionName, id));
}
