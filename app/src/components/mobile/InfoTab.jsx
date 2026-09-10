const MAPS_QUERY = encodeURIComponent(
  "Turf Hoki Universiti Sultan Azlan Shah, Kuala Kangsar, Perak",
);

const CONTACTS = [
  { name: "Mior Syafiq (PT)", phoneDisplay: "013-505 3236", wa: "60135053236" },
  { name: "Hafiz (Pen. PT)", phoneDisplay: "013-506 2845", wa: "60135062845" },
];

export default function InfoTab() {
  return (
    <>
      <div className="info-hero">
        <div className="mobile-eyebrow">KEJOHANAN JEMPUTAN</div>
        <div className="info-title">
          PSKPP HOKI
          <br />
          <span className="accent">GURU PERAK</span> 2026
        </div>
        <div className="info-rule" />
        <div className="info-tagline">
          Bertanding dengan semangat,
          <br />
          berjaya dengan hikmah.
        </div>
      </div>
      <div className="mobile-content" style={{ paddingTop: 0 }}>
        <div className="info-grid">
          <div className="info-card">
            <div className="label">TARIKH</div>
            <div className="value">
              19 &amp; 20 Sept 2026
              <br />
              <span className="sub">Sabtu &amp; Ahad</span>
            </div>
          </div>
          <div className="info-card">
            <div className="label">FORMAT</div>
            <div className="value">
              Liga 3 kumpulan
              <br />
              <span className="sub">15:5:15</span>
            </div>
          </div>
        </div>
        <div className="info-card">
          <div className="label">TEMPAT</div>
          <div className="value">
            Turf Hoki Universiti Sultan Azlan Shah (USAS), Kuala Kangsar
          </div>
        </div>
        <div className="info-card">
          <div className="label">ANJURAN</div>
          <div className="value">SMK Tun Perak, Padang Rengas &amp; Guru Hoki Kuala Kangsar</div>
        </div>
        <div className="tentatif-card">
          <div className="tentatif-title">TENTATIF · SABTU</div>
          <div className="tentatif-row">
            <span className="time">7:30 pg</span>
            <span className="desc">Pendaftaran pasukan</span>
          </div>
          <div className="tentatif-row">
            <span className="time">8:00 pg</span>
            <span className="desc">Perlawanan dimulakan</span>
          </div>
          <div className="tentatif-row">
            <span className="time">6:30 ptg</span>
            <span className="desc">Perlawanan tamat</span>
          </div>
          <div className="tentatif-row">
            <span className="time">7:50 ptg</span>
            <span className="desc">Makan malam di SMK Tun Perak</span>
          </div>
        </div>
        <div className="tentatif-card">
          <div className="tentatif-title">HUBUNGI URUSETIA</div>
          {CONTACTS.map((c) => (
            <div className="contact-row" key={c.wa}>
              <div>
                <div className="contact-name">{c.name}</div>
                <div className="contact-phone">{c.phoneDisplay}</div>
              </div>
              <a
                className="contact-wa"
                href={`https://wa.me/${c.wa}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          ))}
        </div>
        <div className="info-actions">
          <a
            className="primary"
            href={`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`}
            target="_blank"
            rel="noreferrer"
          >
            ARAH KE TURF
          </a>
          <a className="secondary" href={`https://wa.me/${CONTACTS[0].wa}`} target="_blank" rel="noreferrer">
            HUBUNGI URUSETIA
          </a>
        </div>
      </div>
    </>
  );
}
