import { Route, Routes } from "react-router-dom";
import { AppDataProvider, useAppData } from "./lib/AppDataContext";
import { Toast } from "./components/ui";
import { Landing } from "./screens/Landing";
import { TrialBookingFlow } from "./screens/TrialBookingFlow";
import { AdminRoute } from "./screens/AdminRoute";
import { RepresentativeRoute } from "./screens/RepresentativeRoute";
import { TeacherRoute } from "./screens/TeacherRoute";

function BackendSetupBanner() {
  const { backendReady } = useAppData();
  if (backendReady) return null;
  return (
    <div className="t12 no-print bg-wine px-4 py-2 text-center text-white">
      La base de datos no está configurada todavía — copia <code className="font-semibold">.env.example</code> a{" "}
      <code className="font-semibold">.env</code> con las credenciales del proyecto de Supabase para que los datos se guarden.
    </div>
  );
}

function AppShell() {
  const { toastMsg, clearToast } = useAppData();
  return (
    <div className="min-h-screen bg-cream text-ink">
      <BackendSetupBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/prueba" element={<TrialBookingFlow />} />
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/representante/*" element={<RepresentativeRoute />} />
        <Route path="/maestro/*" element={<TeacherRoute />} />
      </Routes>
      <Toast message={toastMsg} onClose={clearToast} />
    </div>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <AppShell />
    </AppDataProvider>
  );
}
