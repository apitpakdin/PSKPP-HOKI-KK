const NAV_ITEMS = [
  { id: "papan-skor", label: "Papan skor" },
  { id: "jadual", label: "Jadual perlawanan" },
  { id: "kedudukan", label: "Kedudukan" },
  { id: "peringkat-xy", label: "Peringkat XY" },
  { id: "pasukan", label: "Pasukan & pemain" },
  { id: "pengadil", label: "Pengadil" },
];

export default function Sidebar({ active, onSelect }) {
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
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`dash-nav-item ${item.id === active ? "active" : ""}`}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
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
