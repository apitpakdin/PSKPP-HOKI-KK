import { formatClock, teamName } from "../../lib/format";
import { allMatchesWithList, matchLabel } from "../../lib/matches";
import { useTournamentDispatch } from "../../state/TournamentContext";

export default function ScoreboardPanel({ state, selectedId, onSelect, match, list }) {
  const dispatch = useTournamentDispatch();
  const options = allMatchesWithList(state).filter(({ m }) => m.teamA && m.teamB);

  if (!match) {
    return (
      <div className="score-panel">
        <div className="score-tag">
          <span className="dot" />
          <span>TIADA PERLAWANAN DIPILIH</span>
        </div>
        <p style={{ font: "500 12.5px Barlow, sans-serif", color: "rgba(255,255,255,.6)" }}>
          Pasukan Peringkat XY belum ditentukan. Jalankan undian selepas peringkat kumpulan
          tamat.
        </p>
      </div>
    );
  }

  const adjust = (side, delta) => dispatch({ type: "ADJUST_SCORE", list, id: match.id, side, delta });
  const canScore = match.status !== "scheduled";

  return (
    <div className="score-panel">
      <select value={selectedId ?? ""} onChange={(e) => onSelect(e.target.value)}>
        {options.map(({ m }) => (
          <option key={m.id} value={m.id}>
            {matchLabel(state, m)}
          </option>
        ))}
      </select>

      <div className="score-tag">
        <span className="dot" />
        <span>
          {match.status === "live"
            ? "SEDANG BERLANGSUNG"
            : match.status === "finished"
              ? "TAMAT"
              : "BELUM MULA"}{" "}
          · {match.phase === "final" ? "PERLAWANAN AKHIR" : `KUMPULAN ${match.group}`}
        </span>
      </div>

      <div className="score-main">
        <div className="score-team">
          <div className="name">{teamName(state.teams, match.teamA)}</div>
          <div className="score-controls">
            <button
              className="score-btn"
              disabled={!canScore || match.scoreA === 0}
              onClick={() => adjust("A", -1)}
            >
              −
            </button>
            <div className="score-num">{match.scoreA}</div>
            <button className="score-btn plus" disabled={!canScore} onClick={() => adjust("A", 1)}>
              +
            </button>
          </div>
        </div>
        <div className="score-vs">–</div>
        <div className="score-team right">
          <div className="name">{teamName(state.teams, match.teamB)}</div>
          <div className="score-controls">
            <button
              className="score-btn"
              disabled={!canScore || match.scoreB === 0}
              onClick={() => adjust("B", -1)}
            >
              −
            </button>
            <div className="score-num">{match.scoreB}</div>
            <button className="score-btn plus" disabled={!canScore} onClick={() => adjust("B", 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="score-foot">
        <div className="score-clock">
          {match.status === "finished"
            ? "PERLAWANAN TAMAT"
            : `SUKU KE-${match.quarter} · ${formatClock(match.clockSeconds)}`}
        </div>
        <div className="score-foot-actions">
          {match.status === "scheduled" && (
            <button
              className="chip-btn gold"
              onClick={() => dispatch({ type: "START_MATCH", list, id: match.id })}
            >
              Mulakan perlawanan
            </button>
          )}
          {match.status === "live" && (
            <>
              <button
                className="chip-btn"
                onClick={() => dispatch({ type: "TOGGLE_CLOCK", list, id: match.id })}
              >
                {match.running ? "Henti masa" : "Sambung masa"}
              </button>
              <button
                className="chip-btn gold"
                onClick={() => dispatch({ type: "END_QUARTER", list, id: match.id })}
              >
                {match.quarter >= 4 ? "Tamatkan perlawanan" : "Tamatkan suku"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
