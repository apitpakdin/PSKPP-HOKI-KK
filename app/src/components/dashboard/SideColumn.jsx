import { teamName } from "../../lib/format";
import { allMatchesWithList } from "../../lib/matches";

function nextMatch(state) {
  const all = allMatchesWithList(state).map(({ m }) => m);
  return all.find((m) => m.status === "scheduled" && m.teamA && m.teamB) ?? null;
}

export default function SideColumn({ state }) {
  const next = nextMatch(state);
  const allSat = state.saturday;
  const doneSat = allSat.filter((m) => m.status === "finished").length;
  const allMatches = [...state.saturday, ...state.sunday, state.final].filter(
    (m) => m.teamA && m.teamB,
  );
  const goals = allMatches.reduce((sum, m) => sum + m.scoreA + m.scoreB, 0);

  return (
    <div className="side-col">
      <div className="info-box">
        <div className="eyebrow">
          SETERUSNYA{next ? ` · ${next.time.toUpperCase()}` : ""}
        </div>
        {next ? (
          <>
            <div className="headline">
              {teamName(state.teams, next.teamA)} vs {teamName(state.teams, next.teamB)}
            </div>
            <div className="detail">
              {next.phase === "final" ? "Perlawanan Akhir" : `Kumpulan ${next.group}`}
            </div>
          </>
        ) : (
          <div className="headline">Tiada perlawanan berjadual</div>
        )}
      </div>
      <div className="info-box" style={{ display: "flex", gap: 20 }}>
        <div className="stat">
          <div className="num">
            {doneSat}
            <small>/9</small>
          </div>
          <div className="lbl">SELESAI</div>
        </div>
        <div className="stat">
          <div className="num">{goals}</div>
          <div className="lbl">GOL</div>
        </div>
        <div className="stat">
          <div className="num">9</div>
          <div className="lbl">PASUKAN</div>
        </div>
      </div>
    </div>
  );
}
