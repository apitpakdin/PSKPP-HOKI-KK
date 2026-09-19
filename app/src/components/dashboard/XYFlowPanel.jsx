import { useState } from "react";
import { teamName } from "../../lib/format";
import { finalTeams, saturdayComplete, thirdPlaceTeams, xyQualifiers } from "../../state/standings";
import { useTournamentDispatch } from "../../state/TournamentContext";

const SLOT_KEYS = ["X1", "X2", "X3", "Y1", "Y2", "Y3"];

export default function XYFlowPanel({ state }) {
  const dispatch = useTournamentDispatch();
  const complete = saturdayComplete(state);
  const qualifiers = xyQualifiers(state);
  const [slots, setSlots] = useState({ X1: "", X2: "", X3: "", Y1: "", Y2: "", Y3: "" });

  const chosenIds = SLOT_KEYS.map((k) => slots[k]).filter(Boolean);
  const allFilled = SLOT_KEYS.every((k) => slots[k]);
  const allDistinct = new Set(chosenIds).size === chosenIds.length;
  const drawValid = allFilled && allDistinct;

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
              if (!drawValid) return;
              dispatch({
                type: "RUN_DRAW",
                X: [slots.X1, slots.X2, slots.X3],
                Y: [slots.Y1, slots.Y2, slots.Y3],
              });
            }}
          >
            <p className="draw-help">
              Masukkan keputusan cabutan undi sebenar bagi setiap slot -- pilih mana-mana johan
              atau naib johan untuk mana-mana slot, ikut cabutan fizikal sebenar (bukan dijana
              secara automatik).
            </p>
            {SLOT_KEYS.map((key) => (
              <div className="draw-row" key={key}>
                <label>{key}</label>
                <select
                  value={slots[key]}
                  onChange={(e) => setSlots((s) => ({ ...s, [key]: e.target.value }))}
                >
                  <option value="">— pilih pasukan —</option>
                  {qualifiers.map((q) => (
                    <option
                      key={q.id}
                      value={q.id}
                      disabled={chosenIds.includes(q.id) && slots[key] !== q.id}
                    >
                      {q.rank === "johan" ? "Johan" : "Naib Johan"} {q.group} ·{" "}
                      {teamName(state.teams, q.id)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {allFilled && !allDistinct && (
              <div className="draw-error">Setiap pasukan hanya boleh dipilih untuk satu slot.</div>
            )}
            <button className="btn-gold btn" type="submit" disabled={!drawValid}>
              Sahkan undian
            </button>
          </form>
        )}
      </div>
    );
  }

  const { teamA, teamB } = finalTeams(state);
  const final = state.final;
  const third = state.thirdPlace;
  const thirdIds = thirdPlaceTeams(state);

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
          <div className="tag">PERLAWANAN AKHIR · 2:20 PTG</div>
          {final.status === "finished" ? (
            <>
              <div className="team">
                {teamName(state.teams, final.teamA)} {final.scoreA}
              </div>
              <div className="vs">vs</div>
              <div className="team">
                {teamName(state.teams, final.teamB)} {final.scoreB}
              </div>
              {final.scoreA === final.scoreB && (final.soScoreA ?? 0) !== (final.soScoreB ?? 0) && (
                <div className="foot">
                  Menang shootout {final.soScoreA}–{final.soScoreB}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="team">{teamA ? teamName(state.teams, teamA) : "Johan Kumpulan X"}</div>
              <div className="vs">vs</div>
              <div className="team">{teamB ? teamName(state.teams, teamB) : "Johan Kumpulan Y"}</div>
            </>
          )}
          <div className="foot">
            Tempat ke-3/4 (1:45 ptg):{" "}
            {third.status === "finished" ? (
              <>
                {teamName(state.teams, third.teamA)} {third.scoreA} – {third.scoreB}{" "}
                {teamName(state.teams, third.teamB)}
                {third.scoreA === third.scoreB && (third.soScoreA ?? 0) !== (third.soScoreB ?? 0)
                  ? ` (shootout ${third.soScoreA}–${third.soScoreB})`
                  : ""}
              </>
            ) : (
              <>
                {thirdIds.teamA ? teamName(state.teams, thirdIds.teamA) : "Naib Johan X"} vs{" "}
                {thirdIds.teamB ? teamName(state.teams, thirdIds.teamB) : "Naib Johan Y"}
              </>
            )}
          </div>
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
