import { HashRouter, Route, Routes } from "react-router-dom";
import { TournamentProvider } from "./state/TournamentContext";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { useUpdateAvailable } from "./lib/useUpdateAvailable";
import Home from "./components/Home";
import MobileApp from "./components/mobile/MobileApp";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/dashboard/Login";

function DashboardGate() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return session ? <Dashboard /> : <Login />;
}

// Surfaced on every route (not just mobile) so urusetia's dashboard tab
// catches up too, without forcing a disruptive reload mid-action.
function UpdateBanner() {
  const available = useUpdateAvailable();
  if (!available) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "10px 16px",
        background: "var(--ink)",
        color: "#fff",
        font: "600 12.5px Barlow, sans-serif",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.25)",
      }}
    >
      <span>Kemaskini baharu tersedia untuk apps ini.</span>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "6px 14px",
          borderRadius: 7,
          border: "none",
          background: "var(--gold)",
          color: "var(--ink)",
          fontWeight: 700,
        }}
      >
        Muat semula
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app" element={<MobileApp />} />
            <Route path="/dashboard" element={<DashboardGate />} />
          </Routes>
        </HashRouter>
        <UpdateBanner />
      </TournamentProvider>
    </AuthProvider>
  );
}
