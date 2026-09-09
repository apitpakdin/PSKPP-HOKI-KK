import { useEffect, useState } from "react";
import { parseSheetRows } from "../../lib/excel";
import { addReferee, deleteReferee, fetchReferees, replaceReferees } from "../../lib/roster";

export default function RefereesPanel() {
  const [referees, setReferees] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const load = async () => {
    try {
      setReferees(await fetchReferees());
    } catch {
      setMsg("Tidak dapat memuatkan senarai pengadil. Pastikan pangkalan data telah disediakan.");
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
          const name = String(r.nama ?? r["nama pengadil"] ?? r.name ?? "").trim();
          const phone = String(r.telefon ?? r["no telefon"] ?? r.phone ?? "").trim() || null;
          const level = String(r.gred ?? r.tahap ?? r.level ?? "").trim() || null;
          return name ? { name, phone, level } : null;
        })
        .filter(Boolean);
      if (!parsed.length) {
        throw new Error("Tiada baris sah. Pastikan ada lajur 'Nama'.");
      }
      await replaceReferees(parsed);
      await load();
      setMsg(`${parsed.length} pengadil berjaya dikemas kini daripada fail.`);
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
      await addReferee({ name: newName.trim(), phone: newPhone.trim() || null });
      setNewName("");
      setNewPhone("");
      await load();
    } catch {
      setMsg("Gagal menambah pengadil.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    try {
      await deleteReferee(id);
      await load();
    } catch {
      setMsg("Gagal memadam pengadil.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel" style={{ flex: "none", width: "100%" }}>
      <div className="panel-head">
        <span>PENGADIL</span>
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
      <div className="referee-list">
        {referees.length === 0 && !msg && (
          <div className="panel-note">Belum ada pengadil didaftarkan.</div>
        )}
        {referees.map((r) => (
          <div className="roster-row referee-row" key={r.id}>
            <span>
              {r.name}
              {r.phone ? ` · ${r.phone}` : ""}
              {r.level ? ` · ${r.level}` : ""}
            </span>
            <button className="roster-del" onClick={() => handleDelete(r.id)} disabled={busy}>
              ×
            </button>
          </div>
        ))}
      </div>
      <form className="roster-add" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Nama pengadil"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="text"
          placeholder="No telefon (pilihan)"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
        />
        <button className="btn" type="submit" disabled={busy}>
          Tambah
        </button>
      </form>
      <div className="panel-note">
        Format Excel: lajur "Nama" (dan "Telefon", "Gred" jika ada). Muat naik fail baharu akan
        menggantikan keseluruhan senarai sedia ada.
      </div>
    </div>
  );
}
