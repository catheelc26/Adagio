import { useCallback, useSyncExternalStore } from "react";

// Sesiones ligeras basadas en sessionStorage: sobreviven a un refresco de
// página (a diferencia del artefacto original, que perdía la sesión al
// recargar) pero se limpian al cerrar la pestaña/navegador — coherente con
// que ninguno de los tres accesos (PIN admin, PIN maestro, código de
// representante) es una cuenta real con contraseña.
//
// Se usa useSyncExternalStore (no useState) a propósito: la puerta de
// entrada (Gate) y la pantalla protegida (Shell/Portal) llaman este hook
// desde componentes distintos, así que necesitan compartir el mismo valor —
// con useState cada componente tendría su propia copia desincronizada.
function createSessionStore(key) {
  const listeners = new Set();

  const getSnapshot = () => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const set = (value) => {
    try {
      if (value === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    } catch {
      /* ignore (private browsing, storage disabled, etc.) */
    }
    listeners.forEach((listener) => listener());
  };

  return { getSnapshot, subscribe, set };
}

function useSessionValue(store) {
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const setValue = useCallback((v) => store.set(v), [store]);
  return [value, setValue];
}

const adminStore = createSessionStore("cif_admin_session");
const teacherStore = createSessionStore("cif_teacher_session");
const repStore = createSessionStore("cif_rep_session");

export const useAdminSession = () => useSessionValue(adminStore);
export const useTeacherSession = () => useSessionValue(teacherStore);
export const useRepSession = () => useSessionValue(repStore);
