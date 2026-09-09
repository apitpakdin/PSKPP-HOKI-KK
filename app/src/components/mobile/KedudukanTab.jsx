import { useState } from "react";
import { groupStandings, saturdayComplete, xyStandings } from "../../state/standings";

function StandingsTable({ label, rows, gold }) {
  return (
    <div className="standings-group">
      <div className={`standings-head ${gold ? "gold" : ""}`}>
        <span>KUMPULAN {label}</span>
        <span>M · S · JG · MT</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.id} className={`standings-row ${i < 2 ? "qualified" : ""}`}>
          <span className="standings-rank">{i + 1}</span>
          <span className="standings-name">{r.name}</span>
          <span className="standings-meta">
            {r.played} · {r.won} · {r.gd >= 0 ? `+${r.gd}` : r.gd}
          </span>
          <span className="standings-pts">{r.pts}</span>
        </div>
      ))}
    </div>
  );
}

export default function KedudukanTab({ state }) {
  const [stage, setStage] = useState("group");
  const done = state.saturday.filter((m) => m.status === "finished").length;
  const complete = saturdayComplete(state);

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-title" style={{ fontSize: 22 }}>
          KEDUDUKAN
        </div>
        <div className="mobile-subtitle">
          {stage === "group"
            ? `Selepas ${done} daripada 9 perlawanan · Sabtu 19 Sept`
            : "Peringkat XY · Ahad 20 Sept"}
        </div>
      </header>
      <div className="day-toggle">
        <button className={stage === "group" ? "active" : ""} onClick={() => setStage("group")}>
          KUMPULAN
        </button>
        <button
          className={stage === "xy" ? "active" : ""}
          onClick={() => setStage("xy")}
          disabled={!state.xyDraw}
        >
          PERINGKAT XY
        </button>
      </div>
      <div className="mobile-content">
        {stage === "group" ? (
          <>
            <StandingsTable label="A" rows={groupStandings(state, "A")} />
            <StandingsTable label="B" rows={groupStandings(state, "B")} gold />
            <StandingsTable label="C" rows={groupStandings(state, "C")} />
            <div className="callout">
              <span className="diamond" />
              <p>
                Johan &amp; naib johan setiap kumpulan layak ke <b>Peringkat XY</b>
                {complete ? " · undian telah dijalankan di urusetia" : ""}
              </p>
            </div>
          </>
        ) : state.xyDraw ? (
          <>
            <StandingsTable label="X" rows={xyStandings(state, "X")} />
            <StandingsTable label="Y" rows={xyStandings(state, "Y")} gold />
          </>
        ) : (
          <div className="empty-note">Undian Peringkat XY belum dijalankan.</div>
        )}
      </div>
    </>
  );
}
