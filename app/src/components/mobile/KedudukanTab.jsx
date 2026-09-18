import { useState } from "react";
import { teamName } from "../../lib/format";
import { groupStandings, saturdayComplete, shootoutStandings, xyStandings } from "../../state/standings";

const GROUPS = ["A", "B", "C"];

function StandingsTable({ label, rows, gold }) {
  return (
    <div className="standings-group">
      <div className={`standings-head ${gold ? "gold" : ""}`}>
        <span>KUMPULAN {label}</span>
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
              <td className="st-pts">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ShootoutInfo({ group, tiedCount, state }) {
  const fixtures = state.shootouts?.[group];
  const nameOf = (id) => teamName(state.teams, id);

  if (!fixtures || !fixtures.length) {
    return (
      <div className="shootout-info">
        <div className="shootout-warn">
          ⚠ Kumpulan {group}: {tiedCount} pasukan seri penuh — menunggu shootout dijalankan oleh
          urusetia.
        </div>
      </div>
    );
  }

  const allDone = fixtures.every((m) => m.status === "finished");
  const rows = allDone ? shootoutStandings(state, group) : null;
  const resolved = rows && rows.length > 0 && rows.every((r) => !r.needsShootout);

  return (
    <div className="shootout-info">
      <div className="shootout-warn">⚠ Keputusan shootout Kumpulan {group}</div>
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
            {GROUPS.map((g) => {
              const tied = groupStandings(state, g).filter((r) => r.needsShootout);
              if (!tied.length && !state.shootouts?.[g]) return null;
              return (
                <ShootoutInfo key={g} group={g} tiedCount={tied.length} state={state} />
              );
            })}
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
            {["X", "Y"].map((g) => {
              const tied = xyStandings(state, g).filter((r) => r.needsShootout);
              if (!tied.length && !state.shootouts?.[g]) return null;
              return (
                <ShootoutInfo key={g} group={g} tiedCount={tied.length} state={state} />
              );
            })}
          </>
        ) : (
          <div className="empty-note">Undian Peringkat XY belum dijalankan.</div>
        )}
      </div>
    </>
  );
}
