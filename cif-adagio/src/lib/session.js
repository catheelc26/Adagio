import { useState, useCallback } from "react";

// Sesiones ligeras basadas en sessionStorage: sobreviven a un refresco de
// página (a diferencia del artefacto original, que perdía la sesión al
// recargar) pero se limpian al cerrar la pestaña/navegador — coherente con
// que ninguno de los tres accesos (PIN admin, PIN maestro, código de
// representante) es una cuenta real con contraseña.
function useSessionValue(key) {
  const [value, setValue] = useState(() => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  });

  const set = useCallback(
    (v) => {
      setValue(v);
      try {
        if (v === null) sessionStorage.removeItem(key);
        else sessionStorage.setItem(key, v);
      } catch {
        /* ignore (private browsing, storage disabled, etc.) */
      }
    },
    [key]
  );

  return [value, set];
}

export const useAdminSession = () => useSessionValue("cif_admin_session");
export const useTeacherSession = () => useSessionValue("cif_teacher_session");
export const useRepSession = () => useSessionValue("cif_rep_session");
