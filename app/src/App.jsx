import { HashRouter, Route, Routes } from "react-router-dom";
import { TournamentProvider } from "./state/TournamentContext";
import Home from "./components/Home";
import MobileApp from "./components/mobile/MobileApp";
import Dashboard from "./components/dashboard/Dashboard";

export default function App() {
  return (
    <TournamentProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<MobileApp />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </HashRouter>
    </TournamentProvider>
  );
}
