import { HashRouter, Route, Routes } from "react-router-dom";
import { TournamentProvider } from "./state/TournamentContext";
import { AuthProvider, useAuth } from "./state/AuthContext";
import Home from "./components/Home";
import MobileApp from "./components/mobile/MobileApp";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/dashboard/Login";

function DashboardGate() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return session ? <Dashboard /> : <Login />;
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
      </TournamentProvider>
    </AuthProvider>
  );
}
