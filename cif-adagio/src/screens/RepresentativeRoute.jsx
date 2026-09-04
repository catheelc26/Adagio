import { RepresentativeGate } from "./RepresentativeGate";
import { RepresentativePortal } from "./rep/RepresentativePortal";
import { useRepSession } from "../lib/session";
import { useAppData } from "../lib/AppDataContext";

export function RepresentativeRoute() {
  const [session, setSession] = useRepSession();
  const { students } = useAppData();
  const student = session ? students.items.find((s) => s.id === session) : null;

  if (!session || (!students.loading && !student)) {
    return <RepresentativeGate />;
  }
  if (students.loading) return null;

  return <RepresentativePortal student={student} onLogout={() => setSession(null)} />;
}
