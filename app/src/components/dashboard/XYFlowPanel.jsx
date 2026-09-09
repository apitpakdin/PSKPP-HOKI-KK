import { useState } from "react";
import { teamName } from "../../lib/format";
import { finalTeams, groupStandings, saturdayComplete } from "../../state/standings";
import { useTournamentDispatch } from "../../state/TournamentContext";

const GROUPS = ["A", "B", "C"];

export default function XYFlowPanel({ state }) {
  const dispatch = useTournamentDispatch();
  const complete = saturdayComplete(state);
  const [groupToX1, setGroupToX1] = useState("A");
  const [groupToY1, setGroupToY1] = useState("B");
  const [groupToY2, setGroupToY2] = useState("C");
  const [x2Pick, setX2Pick] = useState("B");
  const x2Group = x2Pick === groupToY1 || x2Pick === groupToY2 ? x2Pick : groupToY1;

  const johanName = (g) => teamName(state.teams, groupStandings(state, g)[0]?.id);
  const naibName = (g) => teamName(state.teams, groupStandings(state, g)[1]?.id);

  const slotsDistinct = new Set([groupToX1, groupToY1, groupToY2]).size === 3;
  const canClearDraw = state.xyDraw && state.sunday.every((m) => m.status === "scheduled");

  if (!state.xyDraw) {
    return (
      <div className="panel" style={{ width: 430, flex: "none" }}>
        <div className="panel-head">
          <span>UNDIAN XY → PERLAWANAN AKHIR</span>
          <span className="tag">AHAD 20 SEPT</span>
        </div>
        {!complete ? (
          <div className="draw-cta">
            <p>
              Menunggu peringkat kumpulan selesai (
              {state.saturday.filter((m) => m.status === "finished").length}/9 perlawanan).
            </p>
          </div>
        ) : (
          <form
            className="draw-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!slotsDistinct) return;
              dispatch({ type: "RUN_DRAW", groupToX1, groupToY1, groupToY2, x2Group });
            }}
          >
            <p className="draw-help">
              Masukkan keputusan cabutan undi johan kumpulan sebenar (bukan dijana secara rawak).
            </p>
            <div className="draw-row">
              <label>X1</label>
              <select value={groupToX1} onChange={(e) => setGroupToX1(e.target.value)}>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    Johan Kump {g} · {johanName(g)}
                  </option>
                ))}
              </select>
            </div>
            <div className="draw-row">
              <label>Y1</label>
              <select value={groupToY1} onChange={(e) => setGroupToY1(e.target.value)}>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    Johan Kump {g} · {johanName(g)}
                  </option>
                ))}
              </select>
            </div>
            <div className="draw-row">
              <label>Y2</label>
              <select value={groupToY2} onChange={(e) => setGroupToY2(e.target.value)}>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    Johan Kump {g} · {johanName(g)}
                  </option>
                ))}
              </select>
            </div>
            {!slotsDistinct && (
              <div className="draw-error">
                Setiap kumpulan (A, B, C) mesti diagihkan ke X1, Y1, Y2 secara berasingan.
              </div>
            )}
            {slotsDistinct && (
              <div className="draw-row">
                <label>X2</label>
                <select value={x2Group} onChange={(e) => setX2Pick(e.target.value)}>
                  <option value={groupToY1}>
                    Naib Johan {groupToY1} · {naibName(groupToY1)}
                  </option>
                  <option value={groupToY2}>
                    Naib Johan {groupToY2} · {naibName(groupToY2)}
                  </option>
                </select>
              </div>
            )}
            {slotsDistinct && (
              <div className="draw-note">
                Y3 auto: Naib Johan {groupToX1} · {naibName(groupToX1)}. X3 auto: Naib Johan{" "}
                {groupToY1 === x2Group ? groupToY2 : groupToY1} ·{" "}
                {naibName(groupToY1 === x2Group ? groupToY2 : groupToY1)}.
              </div>
            )}
            <button className="btn-gold btn" type="submit" disabled={!slotsDistinct}>
              Sahkan undian
            </button>
          </form>
        )}
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
      {canClearDraw && (
        <div className="xy-foot">
          <button
            className="btn"
            onClick={() => {
              if (confirm("Padam undian XY dan masukkan semula?")) {
                dispatch({ type: "CLEAR_XY_DRAW" });
              }
            }}
          >
            Padam & undi semula
          </button>
        </div>
      )}
    </div>
  );
}
