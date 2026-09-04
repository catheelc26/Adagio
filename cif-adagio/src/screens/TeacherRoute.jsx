import { TeacherGate } from "./TeacherGate";
import { TeacherPortal } from "./teacher/TeacherPortal";
import { useTeacherSession } from "../lib/session";

export function TeacherRoute() {
  const [session, setSession] = useTeacherSession();
  return session ? <TeacherPortal teacherName={session} onLogout={() => setSession(null)} /> : <TeacherGate />;
}
