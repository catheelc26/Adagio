import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useCollection, useSettings, COLLECTIONS } from "./db";
import { supabaseReady } from "./supabase";
import { DEFAULT_GROUPS } from "./constants";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const groupsCollection = useCollection(COLLECTIONS.groups);
  const students = useCollection(COLLECTIONS.students);
  const payments = useCollection(COLLECTIONS.payments);
  const reminders = useCollection(COLLECTIONS.reminders);
  const rateHistory = useCollection(COLLECTIONS.rateHistory);
  const schedule = useCollection(COLLECTIONS.schedule);
  const trialBookings = useCollection(COLLECTIONS.trialBookings);
  const teacherNotes = useCollection(COLLECTIONS.teacherNotes);
  const tasks = useCollection(COLLECTIONS.tasks);
  const attendance = useCollection(COLLECTIONS.attendance);
  const announcements = useCollection(COLLECTIONS.announcements);
  const events = useCollection(COLLECTIONS.events);
  const settings = useSettings();

  // La colección `groups` empieza vacía en cualquier proyecto de Supabase
  // nuevo. La primera vez que carga (para cualquiera: admin, representante
  // o la página pública), la poblamos con los 7 grupos de siempre para que
  // nada se rompa — a partir de ahí administración puede agregar, editar o
  // quitar grupos desde Ajustes y esos cambios quedan en la base de datos.
  const seededGroups = useRef(false);
  const groupsAdd = groupsCollection.add;
  useEffect(() => {
    if (seededGroups.current || !supabaseReady || groupsCollection.loading || groupsCollection.items.length > 0) return;
    seededGroups.current = true;
    DEFAULT_GROUPS.forEach((g) => { groupsAdd(g).catch(() => {}); });
  }, [groupsAdd, supabaseReady, groupsCollection.loading, groupsCollection.items.length]);
  const groups = {
    ...groupsCollection,
    items: groupsCollection.items.length > 0 ? groupsCollection.items : DEFAULT_GROUPS,
  };

  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const toast = useCallback((msg) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const value = {
    backendReady: supabaseReady,
    groups,
    students,
    payments,
    reminders,
    rateHistory,
    schedule,
    trialBookings,
    teacherNotes,
    tasks,
    attendance,
    announcements,
    events,
    settings,
    toast,
    toastMsg,
    clearToast: () => setToastMsg(null),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData debe usarse dentro de <AppDataProvider>");
  return ctx;
}
