import { createContext, useContext, useState, useCallback, useRef } from "react";
import { useCollection, useSettings, COLLECTIONS } from "./db";
import { firebaseReady } from "./firebase";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
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

  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const toast = useCallback((msg) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const value = {
    firebaseReady,
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
