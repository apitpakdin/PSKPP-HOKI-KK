import { useState } from "react";
import { groupStandings } from "../../state/standings";
import { useTournamentDispatch } from "../../state/TournamentContext";

const GROUPS = ["A", "B", "C"];

function TieResolver({ group, tiedRows, dispatch }) {
  const [order, setOrder] = useState(tiedRows.map((r) => r.id));

  const setRank = (rank, id) => {
    setOrder((prev) => {
      const next = prev.filter((x) => x !== id);
      next.splice(rank, 0, id);
      return next;
    });
  };

  const nameOf = (id) => tiedRows.find((r) => r.id === id)?.name ?? id;

  return (
    <div className="tie-resolver">
      <div className="tie-warn">
        ⚠ Kumpulan {group}: {tiedRows.length} pasukan seri penuh (mata, menang, beza gol,
        jaringan{tiedRows.length === 2 ? " & pusingan" : ""}) — perlu shootout ikut Peraturan
        9.7.
      </div>
      {order.map((id, i) => (
        <div className="tie-row" key={id}>
          <span>#{i + 1}</span>
          <select value={id} onChange={(e) => setRank(i, e.target.value)}>
            {tiedRows.map((r) => (
              <option key={r.id} value={r.id}>
                {nameOf(r.id)}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button
        className="btn btn-primary"
        onClick={() => dispatch({ type: "SET_TIEBREAK", group, order })}
      >
        Sahkan keputusan shootout
      </button>
    </div>
  );
}

export default function StandingsPanel({ state }) {
  const dispatch = useTournamentDispatch();
  const standingsByGroup = Object.fromEntries(GROUPS.map((g) => [g, groupStandings(state, g)]));

  return (
    <div className="panel">
      <div className="panel-head">KEDUDUKAN KUMPULAN</div>
      <div className="standings-cols">
        {GROUPS.map((g) => (
          <div className="standings-col" key={g}>
            <div className="g">{g}</div>
            {standingsByGroup[g].map((r, i) => (
              <div key={r.id} className={`row ${i === 2 ? "low" : ""}`}>
                <span>
                  {r.name}
                  {r.needsShootout ? " ⚠" : ""}
                </span>
                <span>{r.pts}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {GROUPS.map((g) => {
        const tied = standingsByGroup[g].filter((r) => r.needsShootout);
        if (!tied.length) return null;
        return <TieResolver key={g} group={g} tiedRows={tied} dispatch={dispatch} />;
      })}
    </div>
  );
}
