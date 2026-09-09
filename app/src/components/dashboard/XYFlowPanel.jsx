import { teamName } from "../../lib/format";
import { finalTeams, saturdayComplete } from "../../state/standings";
import { useTournamentDispatch } from "../../state/TournamentContext";

export default function XYFlowPanel({ state }) {
  const dispatch = useTournamentDispatch();
  const complete = saturdayComplete(state);

  if (!state.xyDraw) {
    return (
      <div className="panel" style={{ width: 430, flex: "none" }}>
        <div className="panel-head">
          <span>ALIRAN XY → PERLAWANAN AKHIR</span>
          <span className="tag">AHAD 20 SEPT</span>
        </div>
        <div className="draw-cta">
          <p>
            {complete
              ? "Peringkat kumpulan tamat. Jalankan undian untuk menentukan Kumpulan X dan Y."
              : `Menunggu peringkat kumpulan selesai (${state.saturday.filter((m) => m.status === "finished").length}/9 perlawanan).`}
          </p>
          <button
            className="btn-gold btn"
            disabled={!complete}
            onClick={() => dispatch({ type: "RUN_DRAW" })}
          >
            Jalankan undian
          </button>
        </div>
      </div>
    );
  }

  const { teamA, teamB } = finalTeams(state);
  const final = state.final;

  return (
    <div className="panel" style={{ width: 430, flex: "none" }}>
      <div className="panel-head">
        <span>ALIRAN XY → PERLAWANAN AKHIR</span>
        <span className="tag">AHAD 20 SEPT</span>
      </div>
      <div className="xy-body">
        <div className="xy-side">
          <div className="xy-box">
            <div className="hd">KUMPULAN X</div>
            {state.xyDraw.X.map((id) => (
              <div className="team" key={id}>
                {teamName(state.teams, id)}
              </div>
            ))}
          </div>
          <div className="xy-box">
            <div className="hd gold">KUMPULAN Y</div>
            {state.xyDraw.Y.map((id) => (
              <div className="team" key={id}>
                {teamName(state.teams, id)}
              </div>
            ))}
          </div>
        </div>
        <div className="xy-arrow">→</div>
        <div className="xy-final">
          <div className="tag">PERLAWANAN AKHIR</div>
          {final.status === "finished" ? (
            <>
              <div className="team">
                {teamName(state.teams, final.teamA)} {final.scoreA}
              </div>
              <div className="vs">vs</div>
              <div className="team">
                {teamName(state.teams, final.teamB)} {final.scoreB}
              </div>
            </>
          ) : (
            <>
              <div className="team">{teamA ? teamName(state.teams, teamA) : "Johan Kumpulan X"}</div>
              <div className="vs">vs</div>
              <div className="team">{teamB ? teamName(state.teams, teamB) : "Johan Kumpulan Y"}</div>
            </>
          )}
          <div className="foot">12:30 tgh · penyampaian medal 1:00</div>
        </div>
      </div>
    </div>
  );
}
