import { useEffect, useState } from "react";
import { parseSheetRows } from "../../lib/excel";
import { addPlayer, deletePlayer, fetchPlayers, replaceTeamPlayers } from "../../lib/roster";

const GROUPS = ["A", "B", "C"];

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

  const handleUpload = async (teamId, e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const rows = await parseSheetRows(file);
      const parsed = rows
        .map((r) => {
          const name = String(r["nama pemain"] ?? r.nama ?? r.name ?? "").trim();
          const jerseyRaw = r["no jersi"] ?? r["nombor jersi"] ?? r.jersi ?? null;
          const jersey = jerseyRaw != null && jerseyRaw !== "" ? Number(jerseyRaw) : null;
          return name ? { team_id: teamId, name, jersey_number: jersey } : null;
        })
        .filter(Boolean);
      if (!parsed.length) {
        throw new Error("Tiada baris sah. Pastikan ada lajur 'Nama Pemain'.");
      }
      await replaceTeamPlayers(teamId, parsed);
      await load();
      setMsg(`${parsed.length} pemain ${state.teams[teamId]?.name} berjaya dikemas kini.`);
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
                  <div className="roster-team-head">
                    <div className="roster-team-name">{t.name}</div>
                    <label className="roster-upload-btn">
                      {busy ? "..." : "Upload"}
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleUpload(t.id, e)}
                        disabled={busy}
                        hidden
                      />
                    </label>
                  </div>
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
        Upload fail Excel di bawah nama pasukan berkenaan — setiap pasukan ada fail sendiri.
        Format: lajur "Nama Pemain" (dan "No Jersi" jika ada). Fail baharu menggantikan senarai
        pasukan itu sahaja, tidak menjejaskan pasukan lain.
      </div>
    </div>
  );
}
