import { useState } from "react";
import { teamName } from "../../lib/format";
import { groupStandings, saturdayComplete, shootoutStandings, xyStandings } from "../../state/standings";

function ShootoutInfo({ group, tiedCount, state }) {
  const fixtures = state.shootouts?.[group];
  const nameOf = (id) => teamName(state.teams, id);

  if (!fixtures || !fixtures.length) {
    return (
      <div className="shootout-info">
        <div className="shootout-warn">
          ⚠ {tiedCount} pasukan seri penuh — menunggu shootout dijalankan oleh urusetia.
        </div>
      </div>
    );
  }

  const allDone = fixtures.every((m) => m.status === "finished");
  const rows = allDone ? shootoutStandings(state, group) : null;
  const resolved = rows && rows.length > 0 && rows.every((r) => !r.needsShootout);

  return (
    <div className="shootout-info">
      <div className="shootout-warn">⚠ Keputusan shootout</div>
      {fixtures.map((m) => (
        <div className="shootout-row" key={m.id}>
          <span>{nameOf(m.teamA)}</span>
          <span className="shootout-score">
            {m.status === "finished" ? `${m.scoreA} – ${m.scoreB}` : "menunggu"}
          </span>
          <span>{nameOf(m.teamB)}</span>
        </div>
      ))}
      {resolved && (
        <div className="shootout-result">
          ✓ Keputusan: {rows.map((r, i) => `${i + 1}) ${nameOf(r.id)}`).join(" · ")}
        </div>
      )}
    </div>
  );
}

// Each group's table and its own shootout section (if it needs one) live in
// one card together, right where the group is, rather than as a separate
// block stacked below every table -- keeps a group's own tie-break info
// next to that group instead of pushed down past other groups' results.
function StandingsTable({ title, rows, gold, group, state }) {
  const tied = rows.filter((r) => r.needsShootout);
  const showShootout = tied.length > 0 || Boolean(state.shootouts?.[group]);

  return (
    <div className="standings-group">
      <div className={`standings-head ${gold ? "gold" : ""}`}>
        <span>{title}</span>
      </div>
      <table className="standings-table">
        <thead>
          <tr>
            <th className="st-name">Pasukan</th>
            <th>M</th>
            <th>MG</th>
            <th>S</th>
            <th>K</th>
            <th>BG</th>
            <th>G</th>
            <th>BL</th>
            <th>MT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={i < 2 ? "qualified" : ""}>
              <td className="st-name">
                {r.name}
                {r.needsShootout ? " ⚠" : ""}
              </td>
              <td>{r.played}</td>
              <td>{r.won}</td>
              <td>{r.draw}</td>
              <td>{r.lost}</td>
              <td>{r.gd}</td>
              <td>{r.gf}</td>
              <td>{r.ga}</td>
              <td className="st-pts">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showShootout && <ShootoutInfo group={group} tiedCount={tied.length} state={state} />}
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
            <StandingsTable
              title="KUMPULAN A"
              rows={groupStandings(state, "A")}
              group="A"
              state={state}
            />
            <StandingsTable
              title="KUMPULAN B"
              rows={groupStandings(state, "B")}
              group="B"
              state={state}
              gold
            />
            <StandingsTable
              title="KUMPULAN C"
              rows={groupStandings(state, "C")}
              group="C"
              state={state}
            />
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
            <StandingsTable
              title="PERINGKAT X"
              rows={xyStandings(state, "X")}
              group="X"
              state={state}
            />
            <StandingsTable
              title="PERINGKAT Y"
              rows={xyStandings(state, "Y")}
              group="Y"
              state={state}
              gold
            />
          </>
        ) : (
          <div className="empty-note">Undian Peringkat XY belum dijalankan.</div>
        )}
      </div>
    </>
  );
}
