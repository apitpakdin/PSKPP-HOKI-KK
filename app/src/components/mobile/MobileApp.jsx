import { useState } from "react";
import { Link } from "react-router-dom";
import { useTournamentState } from "../../state/TournamentContext";
import JadualTab from "./JadualTab";
import KedudukanTab from "./KedudukanTab";
import KeputusanTab from "./KeputusanTab";
import InfoTab from "./InfoTab";
import "./mobile.css";

const TABS = [
  { id: "jadual", label: "JADUAL", Comp: JadualTab },
  { id: "kedudukan", label: "KEDUDUKAN", Comp: KedudukanTab },
  { id: "keputusan", label: "KEPUTUSAN", Comp: KeputusanTab },
  { id: "info", label: "INFO", Comp: InfoTab },
];

export default function MobileApp() {
  const [tab, setTab] = useState("jadual");
  const state = useTournamentState();
  const Active = TABS.find((t) => t.id === tab).Comp;

  return (
    <div className="mobile-app">
      <div style={{ position: "relative" }}>
        <Link
          to="/dashboard"
          style={{
            position: "absolute",
            right: 12,
            top: 10,
            zIndex: 1,
            font: "600 9px Barlow, sans-serif",
            color: "rgba(255,255,255,.4)",
            textDecoration: "none",
          }}
        >
          Urusetia →
        </Link>
      </div>
      <Active state={state} />
      <nav className="mobile-tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={t.id === tab ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === tab && <div className="underline" />}
          </button>
        ))}
      </nav>
    </div>
  );
}
