import { shootoutStandings } from "../../state/standings";

export default function ShootoutResolver({ group, label, tiedRows, state, dispatch }) {
  const fixtures = state.shootouts?.[group];
  const tiedIds = tiedRows.map((r) => r.id).sort().join(",");
  const fixtureIds = fixtures
    ? [...new Set(fixtures.flatMap((m) => [m.teamA, m.teamB]))].sort().join(",")
    : null;
  const stale = fixtures && fixtureIds !== tiedIds;

  const nameOf = (id) => tiedRows.find((r) => r.id === id)?.name ?? state.teams[id]?.name ?? id;

  if (!fixtures || stale) {
    return (
      <div className="tie-resolver">
        <div className="tie-warn">
          ⚠ {label}: {tiedRows.length} pasukan seri penuh (mata, menang, beza gol, jaringan) —
          perlu shootout ikut Peraturan 9.7.
        </div>
        <button
          className="btn btn-primary"
          onClick={() =>
            dispatch({ type: "START_SHOOTOUT", group, teamIds: tiedRows.map((r) => r.id) })
          }
        >
          Jana jadual shootout
        </button>
      </div>
    );
  }

  const allDone = fixtures.every((m) => m.status === "finished");
  const rows = shootoutStandings(state, group);
  const resolved = allDone && rows.every((r) => !r.needsShootout);

  return (
    <div className="tie-resolver">
      <div className="tie-warn">
        ⚠ {label}: jadual shootout (ikut susunan jadual perlawanan kumpulan, Peraturan 9.7.1)
      </div>
      {fixtures.map((m) => (
        <div className="so-row" key={m.id}>
          <div className="so-teams">
            {nameOf(m.teamA)} vs {nameOf(m.teamB)}
          </div>
          <div className="so-score-line">
            <button
              className="so-btn"
              disabled={m.status === "finished" || m.scoreA === 0}
              onClick={() =>
                dispatch({ type: "ADJUST_SHOOTOUT_SCORE", group, id: m.id, side: "A", delta: -1 })
              }
            >
              −
            </button>
            <span className="so-num">{m.scoreA}</span>
            <button
              className="so-btn plus"
              disabled={m.status === "finished"}
              onClick={() =>
                dispatch({ type: "ADJUST_SHOOTOUT_SCORE", group, id: m.id, side: "A", delta: 1 })
              }
            >
              +
            </button>
            <span className="so-dash">–</span>
            <button
              className="so-btn"
              disabled={m.status === "finished" || m.scoreB === 0}
              onClick={() =>
                dispatch({ type: "ADJUST_SHOOTOUT_SCORE", group, id: m.id, side: "B", delta: -1 })
              }
            >
              −
            </button>
            <span className="so-num">{m.scoreB}</span>
            <button
              className="so-btn plus"
              disabled={m.status === "finished"}
              onClick={() =>
                dispatch({ type: "ADJUST_SHOOTOUT_SCORE", group, id: m.id, side: "B", delta: 1 })
              }
            >
              +
            </button>
            {m.status === "finished" ? (
              <span className="so-done">✓</span>
            ) : (
              <button
                className="btn"
                onClick={() => dispatch({ type: "FINISH_SHOOTOUT_MATCH", group, id: m.id })}
              >
                Selesai
              </button>
            )}
          </div>
        </div>
      ))}
      {allDone && !resolved && (
        <div className="tie-warn">Masih seri selepas shootout — jana pusingan baharu.</div>
      )}
      {resolved && (
        <div className="so-result">
          ✓ Keputusan: {rows.map((r, i) => `${i + 1}) ${nameOf(r.id)}`).join(" · ")}
        </div>
      )}
      <button className="btn" onClick={() => dispatch({ type: "RESET_SHOOTOUT", group })}>
        {resolved ? "Jana semula shootout" : "Set semula jadual shootout"}
      </button>
    </div>
  );
}
