import { useEffect, useMemo, useState } from "react";
import { fetchPlayers } from "../../lib/roster";
import { downloadCertificate } from "../../lib/certificate";

export default function SijilTab({ state }) {
  const [players, setPlayers] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchPlayers()
      .then(setPlayers)
      .catch(() => setLoadError(true));
  }, []);

  const teamPlayers = useMemo(
    () => players.filter((p) => p.team_id === teamId),
    [players, teamId],
  );

  const handleGenerate = async () => {
    const player = teamPlayers.find((p) => p.id === playerId);
    const team = state.teams[teamId];
    if (!player || !team) return;
    setBusy(true);
    try {
      await downloadCertificate({ name: player.name, teamName: team.name });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="info-hero">
        <div className="mobile-eyebrow">SIJIL PENYERTAAN</div>
        <div className="info-title">
          Jana <span className="accent">Sijil</span> Anda
        </div>
        <div className="info-rule" />
        <div className="info-tagline">
          Pilih pasukan dan nama untuk muat turun sijil terus ke peranti anda.
        </div>
      </div>
      <div className="mobile-content" style={{ paddingTop: 0 }}>
        {loadError && (
          <div className="sijil-note">Tidak dapat memuatkan senarai pemain. Sila cuba lagi.</div>
        )}

        <div className="sijil-field">
          <div className="label">PASUKAN</div>
          <select
            value={teamId}
            onChange={(e) => {
              setTeamId(e.target.value);
              setPlayerId("");
            }}
          >
            <option value="">Pilih pasukan</option>
            {Object.values(state.teams).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sijil-field">
          <div className="label">NAMA</div>
          <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} disabled={!teamId}>
            <option value="">
              {!teamId
                ? "Pilih pasukan dahulu"
                : teamPlayers.length
                  ? "Pilih nama"
                  : "Senarai pemain belum didaftarkan"}
            </option>
            {teamPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button className="sijil-btn" disabled={!playerId || busy} onClick={handleGenerate}>
          {busy ? "Menjana..." : "Jana & Muat Turun Sijil"}
        </button>
      </div>
    </>
  );
}
