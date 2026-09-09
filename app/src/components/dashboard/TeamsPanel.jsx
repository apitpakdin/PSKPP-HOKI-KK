import { useEffect, useState } from "react";
import { parseSheetRows } from "../../lib/excel";
import { addPlayer, deletePlayer, fetchPlayers, replacePlayers } from "../../lib/roster";

const GROUPS = ["A", "B", "C"];

function resolveTeamId(teams, value) {
  const v = String(value ?? "").trim();
  if (!v) return null;
  if (teams[v]) return v;
  const match = Object.values(teams).find((t) => t.name.toLowerCase() === v.toLowerCase());
  return match ? match.id : null;
}

export default function TeamsPanel({ state }) {
  const [players, setPlayers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [newName, setNewName] = useState("");
  const [newTeam, setNewTeam] = useState(Object.keys(state.teams)[0]);

  const load = async () => {
    try {
      setPlayers(await fetchPlayers());
    } catch {
      setMsg("Tidak dapat memuatkan senarai pemain. Pastikan pangkalan data telah disediakan.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const rows = await parseSheetRows(file);
      const parsed = rows
        .map((r) => {
          const teamId = resolveTeamId(state.teams, r.pasukan ?? r.team ?? r.kumpulan);
          const name = String(r["nama pemain"] ?? r.nama ?? r.name ?? "").trim();
          const jerseyRaw = r["no jersi"] ?? r["nombor jersi"] ?? r.jersi ?? null;
          const jersey = jerseyRaw != null && jerseyRaw !== "" ? Number(jerseyRaw) : null;
          return teamId && name ? { team_id: teamId, name, jersey_number: jersey } : null;
        })
        .filter(Boolean);
      if (!parsed.length) {
        throw new Error("Tiada baris sah. Pastikan ada lajur 'Pasukan' dan 'Nama Pemain'.");
      }
      await replacePlayers(parsed);
      await load();
      setMsg(`${parsed.length} pemain berjaya dikemas kini daripada fail.`);
    } catch (err) {
      setMsg(err.message ?? "Gagal memuat naik fail.");
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      await addPlayer({ team_id: newTeam, name: newName.trim() });
      setNewName("");
      await load();
    } catch {
      setMsg("Gagal menambah pemain.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    try {
      await deletePlayer(id);
      await load();
    } catch {
      setMsg("Gagal memadam pemain.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel" style={{ flex: "none", width: "100%" }}>
      <div className="panel-head">
        <span>PASUKAN & PEMAIN</span>
        <label className="btn btn-primary upload-btn">
          {busy ? "Memproses..." : "Upload Excel"}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleUpload}
            disabled={busy}
            hidden
          />
        </label>
      </div>
      {msg && <div className="panel-msg">{msg}</div>}
      <div className="standings-cols">
        {GROUPS.map((g) => (
          <div className="standings-col" key={g}>
            <div className="g">KUMPULAN {g}</div>
            {Object.values(state.teams)
              .filter((t) => t.group === g)
              .map((t) => (
                <div className="roster-team" key={t.id}>
                  <div className="roster-team-name">{t.name}</div>
                  {players
                    .filter((p) => p.team_id === t.id)
                    .map((p) => (
                      <div className="roster-row" key={p.id}>
                        <span>
                          {p.name}
                          {p.jersey_number ? ` #${p.jersey_number}` : ""}
                        </span>
                        <button
                          className="roster-del"
                          onClick={() => handleDelete(p.id)}
                          disabled={busy}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        ))}
      </div>
      <form className="roster-add" onSubmit={handleAdd}>
        <select value={newTeam} onChange={(e) => setNewTeam(e.target.value)}>
          {Object.values(state.teams).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nama pemain"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="btn" type="submit" disabled={busy}>
          Tambah
        </button>
      </form>
      <div className="panel-note">
        Format Excel: lajur "Pasukan" (nama pasukan) dan "Nama Pemain" (dan "No Jersi" jika ada).
        Muat naik fail baharu akan menggantikan keseluruhan senarai sedia ada.
      </div>
    </div>
  );
}
