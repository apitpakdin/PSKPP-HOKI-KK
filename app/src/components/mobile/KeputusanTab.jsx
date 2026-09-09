import { useState } from "react";
import { useCurrentLive } from "../../state/TournamentContext";
import { teamName } from "../../lib/format";

function LiveHero({ state, m }) {
  return (
    <div className="live-hero">
      <div className="live-hero-tag">
        <span className="dot" />
        <span>
          LANGSUNG · {m.phase === "final" ? "PERLAWANAN AKHIR" : `KUMPULAN ${m.group}`}
        </span>
      </div>
      <div className="live-hero-score">
        <div className="live-hero-team">
          <div className="name">{teamName(state.teams, m.teamA)}</div>
        </div>
        <div className="live-hero-num">
          {m.scoreA}
          <span className="dash">–</span>
          {m.scoreB}
        </div>
        <div className="live-hero-team right">
          <div className="name">{teamName(state.teams, m.teamB)}</div>
        </div>
      </div>
      <div className="live-hero-quarters">
        {[1, 2, 3, 4].map((q) => (
          <div key={q} className={q < m.quarter ? "done" : q === m.quarter ? "current" : ""} />
        ))}
      </div>
      <div className="live-hero-foot">
        <span>SUKU KE-{m.quarter} · 15:5:15</span>
      </div>
    </div>
  );
}

export default function KeputusanTab({ state }) {
  const [day, setDay] = useState("sat");
  const live = useCurrentLive(state);
  const list = day === "sat" ? state.saturday : [...state.sunday, state.final];
  const finished = list.filter((m) => m.status === "finished");

  return (
    <>
      <header className="mobile-header" style={{ borderBottom: "none" }}>
        <div className="mobile-title" style={{ fontSize: 22 }}>
          KEPUTUSAN
        </div>
      </header>
      <div className="day-toggle" style={{ paddingTop: 0 }}>
        <button className={day === "sat" ? "active" : ""} onClick={() => setDay("sat")}>
          SABTU
        </button>
        <button className={day === "sun" ? "active" : ""} onClick={() => setDay("sun")}>
          AHAD
        </button>
      </div>
      <div className="mobile-content">
        {live && (day === "sat" ? live.day === "sat" : live.day === "sun") && (
          <LiveHero state={state} m={live} />
        )}
        <div className="section-label">SELESAI {day === "sat" ? "HARI INI" : "AHAD"}</div>
        {finished.length === 0 && <div className="empty-note">Belum ada keputusan.</div>}
        {finished.map((m) => (
          <div key={m.id} className="finished-row">
            <div style={{ flex: 1 }}>
              <div className="meta">
                {m.phase === "final" ? "PERLAWANAN AKHIR" : `KUMPULAN ${m.group}`} · {m.time}
              </div>
              <div className={`line ${m.scoreA >= m.scoreB ? "winner" : ""}`}>
                <span>{teamName(state.teams, m.teamA)}</span>
                <span className="score">{m.scoreA}</span>
              </div>
              <div className={`line ${m.scoreB >= m.scoreA ? "winner" : ""}`}>
                <span>{teamName(state.teams, m.teamB)}</span>
                <span className="score">{m.scoreB}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
