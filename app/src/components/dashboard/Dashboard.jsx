import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTournamentDispatch, useTournamentState } from "../../state/TournamentContext";
import { allMatchesWithList, findMatch } from "../../lib/matches";
import Sidebar from "./Sidebar";
import ScoreboardPanel from "./ScoreboardPanel";
import SideColumn from "./SideColumn";
import StandingsPanel from "./StandingsPanel";
import XYFlowPanel from "./XYFlowPanel";
import "./dashboard.css";

function defaultSelection(state) {
  const all = allMatchesWithList(state);
  const live = all.find(({ m }) => m.status === "live");
  if (live) return live.m.id;
  const next = all.find(({ m }) => m.status === "scheduled" && m.teamA && m.teamB);
  return next ? next.m.id : all[0].m.id;
}

export default function Dashboard() {
  const state = useTournamentState();
  const dispatch = useTournamentDispatch();
  const [selectedId, setSelectedId] = useState(() => defaultSelection(state));

  const found = findMatch(state, selectedId) ?? findMatch(state, defaultSelection(state));

  const doneSat = useMemo(
    () => state.saturday.filter((m) => m.status === "finished").length,
    [state.saturday],
  );

  return (
    <div className="dash-shell">
      <div className="dash-frame">
        <Sidebar />
        <main className="dash-main">
          <div className="dash-topbar">
            <div>
              <div className="dash-h1">PAPAN SKOR</div>
              <div className="dash-sub">
                Sabtu 19 September 2026 · {doneSat}/9 perlawanan kumpulan selesai
              </div>
            </div>
            <div className="dash-actions">
              <button className="btn" onClick={() => window.print()}>
                Eksport PDF
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (confirm("Set semula seluruh kejohanan? Semua keputusan akan dipadam.")) {
                    dispatch({ type: "RESET" });
                  }
                }}
              >
                Set semula
              </button>
            </div>
          </div>

          <div className="dash-row">
            <ScoreboardPanel
              state={state}
              selectedId={found?.m.id}
              onSelect={setSelectedId}
              match={found?.m}
              list={found?.list}
            />
            <SideColumn state={state} />
          </div>

          <div className="dash-row" style={{ alignItems: "stretch" }}>
            <StandingsPanel state={state} />
            <XYFlowPanel state={state} />
          </div>
        </main>
      </div>
      <Link to="/app" className="mobile-link">
        Buka app peserta →
      </Link>
    </div>
  );
}
