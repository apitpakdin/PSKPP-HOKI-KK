import { teamName } from "../../lib/format";
import { allMatchesWithList } from "../../lib/matches";

const DAY_LABEL = { sat: "SABTU 19 SEPTEMBER", sun: "AHAD 20 SEPTEMBER" };

function rowGroup(m) {
  return m.phase === "final" ? "Akhir" : `Kump ${m.group}`;
}

export default function SchedulePanel({ state }) {
  const all = allMatchesWithList(state).map(({ m }) => m);

  return (
    <div className="panel" style={{ flex: "none", width: "100%" }}>
      <div className="panel-head">JADUAL PERLAWANAN</div>
      <div className="schedule-body">
        {["sat", "sun"].map((day) => {
          const matches = all.filter((m) => m.day === day);
          if (!matches.length) return null;
          return (
            <div className="schedule-day" key={day}>
              <div className="schedule-day-label">{DAY_LABEL[day]}</div>
              {matches.map((m) => (
                <div className="schedule-row" key={m.id}>
                  <span className="schedule-time">{m.time}</span>
                  <span className="schedule-group">{rowGroup(m)}</span>
                  <span className="schedule-teams">
                    {teamName(state.teams, m.teamA)} vs {teamName(state.teams, m.teamB)}
                  </span>
                  <span className={`schedule-status status-${m.status}`}>
                    {m.status === "finished"
                      ? `${m.scoreA} – ${m.scoreB}`
                      : m.status === "live"
                        ? "LIVE"
                        : "BELUM MULA"}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
