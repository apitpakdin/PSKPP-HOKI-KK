import { groupStandings, xyStandings } from "../../state/standings";
import { useTournamentDispatch } from "../../state/TournamentContext";
import ShootoutResolver from "./ShootoutResolver";

const GROUPS = ["A", "B", "C"];

function GroupTable({ title, rows }) {
  return (
    <div className="stand-group">
      <div className="stand-group-title">{title}</div>
      <table className="stand-table">
        <thead>
          <tr>
            <th className="stand-name">Pasukan</th>
            <th>Main</th>
            <th>Menang</th>
            <th>Seri</th>
            <th>Kalah</th>
            <th>Beza Gol</th>
            <th>Gol</th>
            <th>Bolos</th>
            <th>Mata</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={i === 2 ? "low" : ""}>
              <td className="stand-name">
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
              <td className="stand-pts">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StandingsPanel({ state }) {
  const dispatch = useTournamentDispatch();
  const standingsByGroup = Object.fromEntries(GROUPS.map((g) => [g, groupStandings(state, g)]));
  const xySides = state.xyDraw ? ["X", "Y"] : [];
  const standingsBySide = Object.fromEntries(xySides.map((g) => [g, xyStandings(state, g)]));

  return (
    <div className="panel">
      <div className="panel-head">KEDUDUKAN KUMPULAN</div>
      {GROUPS.map((g) => (
        <GroupTable key={g} title={`KUMPULAN ${g}`} rows={standingsByGroup[g]} />
      ))}
      {GROUPS.map((g) => {
        const tied = standingsByGroup[g].filter((r) => r.needsShootout);
        if (!tied.length) return null;
        return (
          <ShootoutResolver
            key={g}
            group={g}
            label={`Kumpulan ${g}`}
            tiedRows={tied}
            state={state}
            dispatch={dispatch}
          />
        );
      })}
      {xySides.length > 0 && (
        <>
          <div className="panel-head">KEDUDUKAN PERINGKAT XY</div>
          {xySides.map((g) => (
            <GroupTable key={g} title={`PERINGKAT ${g}`} rows={standingsBySide[g]} />
          ))}
          {xySides.map((g) => {
            const tied = standingsBySide[g].filter((r) => r.needsShootout);
            if (!tied.length) return null;
            return (
              <ShootoutResolver
                key={g}
                group={g}
                label={`Peringkat ${g}`}
                tiedRows={tied}
                state={state}
                dispatch={dispatch}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
