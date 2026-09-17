import { useEffect, useState } from "react";
import { teamName } from "../../lib/format";
import { allMatchesWithList } from "../../lib/matches";
import {
  downloadWorkbook,
  generateAllMatchFormsWorkbook,
  generateMatchFormWorkbook,
  matchFormFilename,
} from "../../lib/matchForm";
import { fetchPlayers, fetchReferees } from "../../lib/roster";
import { useTournamentDispatch } from "../../state/TournamentContext";

const DAY_LABEL = { sat: "SABTU 19 SEPTEMBER", sun: "AHAD 20 SEPTEMBER" };

function rowGroup(m) {
  if (m.phase === "final") return "Akhir";
  if (m.phase === "third") return "Tempat 3/4";
  return `Kump ${m.group}`;
}

export default function SchedulePanel({ state }) {
  const dispatch = useTournamentDispatch();
  const [referees, setReferees] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [players, setPlayers] = useState([]);
  const [formBusy, setFormBusy] = useState(null);
  const all = allMatchesWithList(state);

  useEffect(() => {
    fetchReferees()
      .then(setReferees)
      .catch(() => setLoadError(true));
    fetchPlayers()
      .then(setPlayers)
      .catch(() => {});
  }, []);

  const handlePrintOne = async (m) => {
    setFormBusy(m.id);
    try {
      const wb = await generateMatchFormWorkbook(state, m, players);
      await downloadWorkbook(wb, matchFormFilename(state, m));
    } finally {
      setFormBusy(null);
    }
  };

  const handlePrintAll = async () => {
    setFormBusy("all");
    try {
      const wb = await generateAllMatchFormsWorkbook(state, players);
      await downloadWorkbook(wb, "Borang Perlawanan - Semua Perlawanan.xlsx");
    } finally {
      setFormBusy(null);
    }
  };

  return (
    <div className="panel" style={{ flex: "none", width: "100%" }}>
      <div className="panel-head">JADUAL PERLAWANAN</div>
      {!referees.length && (
        <div className="panel-msg">
          {loadError
            ? "Tidak dapat memuatkan senarai pengadil."
            : "Belum ada pengadil didaftarkan — daftar di tab Pengadil untuk boleh tetapkan pengadil perlawanan."}
        </div>
      )}
      <div className="schedule-toolbar">
        <button className="btn" disabled={formBusy === "all"} onClick={handlePrintAll}>
          {formBusy === "all" ? "Menjana…" : "Muat Turun Semua Borang Perlawanan"}
        </button>
      </div>
      <div className="schedule-body">
        {["sat", "sun"].map((day) => {
          const dayMatches = all.filter(({ m }) => m.day === day);
          if (!dayMatches.length) return null;
          return (
            <div className="schedule-day" key={day}>
              <div className="schedule-day-label">{DAY_LABEL[day]}</div>
              {dayMatches.map(({ m, list }) => (
                <div className="schedule-row" key={m.id}>
                  <span className="schedule-time">{m.time}</span>
                  <span className="schedule-group">{rowGroup(m)}</span>
                  <span className="schedule-teams">
                    {teamName(state.teams, m.teamA)} vs {teamName(state.teams, m.teamB)}
                  </span>
                  <select
                    className="schedule-referee"
                    value={m.refereeId ?? ""}
                    disabled={!referees.length}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_MATCH_REFEREE",
                        list,
                        id: m.id,
                        refereeId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">Belum ditetapkan</option>
                    {referees.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <span className={`schedule-status status-${m.status}`}>
                    {m.status === "finished"
                      ? `${m.scoreA} – ${m.scoreB}`
                      : m.status === "live"
                        ? "LIVE"
                        : "BELUM MULA"}
                  </span>
                  <button
                    className="btn btn-sm"
                    disabled={!m.teamA || !m.teamB || formBusy === m.id}
                    onClick={() => handlePrintOne(m)}
                  >
                    {formBusy === m.id ? "Menjana…" : "Borang"}
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
