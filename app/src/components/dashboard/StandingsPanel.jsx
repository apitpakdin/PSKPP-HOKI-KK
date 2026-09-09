import { groupStandings } from "../../state/standings";

export default function StandingsPanel({ state }) {
  return (
    <div className="panel">
      <div className="panel-head">KEDUDUKAN KUMPULAN</div>
      <div className="standings-cols">
        {["A", "B", "C"].map((g) => (
          <div className="standings-col" key={g}>
            <div className="g">{g}</div>
            {groupStandings(state, g).map((r, i) => (
              <div key={r.id} className={`row ${i === 2 ? "low" : ""}`}>
                <span>{r.name}</span>
                <span>{r.pts}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
