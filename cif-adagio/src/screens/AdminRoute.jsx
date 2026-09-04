import { AdminGate } from "./AdminGate";
import { AdminShell } from "./admin/AdminShell";
import { useAdminSession } from "../lib/session";

export function AdminRoute() {
  const [session] = useAdminSession();
  return session ? <AdminShell /> : <AdminGate />;
}
