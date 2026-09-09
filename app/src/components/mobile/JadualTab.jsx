import { useState } from "react";
import { teamName } from "../../lib/format";

function MatchRow({ state, m }) {
  const teams = state.teams;
  const [time, ampm] = m.time.split(" ");
  const isLive = m.status === "live";
  const isFinished = m.status === "finished";
  const groupLabel = m.phase === "final" ? "PERLAWANAN AKHIR" : `KUMPULAN ${m.group ?? ""}`;

  return (
    <div className={`match-row ${m.status}`}>
      <div className="match-time">
        <div className="t">{time}</div>
        <div className="ampm">{ampm?.toUpperCase()}</div>
      </div>
      <div className="match-divider" />
      <div className="match-body">
        <div className="match-group-label">
          {isLive && <span className="live-dot" />}
          {isLive ? `SEDANG BERLANGSUNG · SUKU ${m.quarter}` : groupLabel}
        </div>
        {isFinished || isLive ? (
          <>
            <div className={`match-teamline ${m.scoreA >= m.scoreB ? "win" : ""}`}>
              <span>{teamName(teams, m.teamA)}</span>
              <span className="match-score">{m.scoreA}</span>
            </div>
            <div className={`match-teamline ${m.scoreB >= m.scoreA ? "win" : ""}`}>
              <span>{teamName(teams, m.teamB)}</span>
              <span className="match-score">{m.scoreB}</span>
            </div>
          </>
        ) : (
          <div className="match-static-teams">
            {m.teamA ? teamName(teams, m.teamA) : "?"}
            <br />
            {m.teamB ? teamName(teams, m.teamB) : "?"}
          </div>
        )}
      </div>
      {isFinished && <div className="match-status">TAMAT</div>}
    </div>
  );
}

export default function JadualTab({ state }) {
  const [day, setDay] = useState("sat");
  const list = day === "sat" ? state.saturday : [...state.sunday, state.final];

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-eyebrow">JEMPUTAN PSKPP</div>
        <div className="mobile-title">
          HOKI GURU PERAK <span style={{ color: "var(--gold)" }}>2026</span>
        </div>
        <div className="mobile-subtitle">Turf USAS, Kuala Kangsar</div>
      </header>
      <div className="day-toggle">
        <button className={day === "sat" ? "active" : ""} onClick={() => setDay("sat")}>
          SAB · 19 SEPT
        </button>
        <button className={day === "sun" ? "active" : ""} onClick={() => setDay("sun")}>
          AHD · 20 SEPT
        </button>
      </div>
      <div className="mobile-content">
        {day === "sun" && !state.xyDraw && (
          <div className="empty-note">
            Peringkat XY akan dipaparkan di sini selepas peringkat kumpulan tamat dan undian
            dijalankan.
          </div>
        )}
        {list.map((m) => (
          <MatchRow key={m.id} state={state} m={m} />
        ))}
      </div>
    </>
  );
}
