const NAV_ITEMS = [
  "Papan skor",
  "Jadual perlawanan",
  "Kedudukan",
  "Peringkat XY",
  "Pasukan & pemain",
  "Pengadil",
];

export default function Sidebar() {
  return (
    <aside className="dash-sidebar">
      <div>
        <div className="dash-brand-eyebrow">URUSETIA</div>
        <div className="dash-brand-title">
          PSKPP HOKI
          <br />
          GURU PERAK
        </div>
        <div className="dash-brand-year">2026</div>
      </div>
      <nav className="dash-nav">
        {NAV_ITEMS.map((item, i) => (
          <button key={item} className={`dash-nav-item ${i === 0 ? "active" : ""}`} disabled={i !== 0}>
            {item}
          </button>
        ))}
      </nav>
      <div className="dash-turf-card">
        <div className="label">TURF</div>
        <div className="value">USAS Kuala Kangsar
          <br />
          14 sesi · 15:5:15
        </div>
      </div>
    </aside>
  );
}
