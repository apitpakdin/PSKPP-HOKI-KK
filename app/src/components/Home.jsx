import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div>
        <div
          style={{
            font: "600 10px Barlow, sans-serif",
            letterSpacing: ".22em",
            color: "var(--gold)",
          }}
        >
          KEJOHANAN JEMPUTAN
        </div>
        <div style={{ font: "700 36px/1 Oswald, sans-serif", marginTop: 8 }}>
          PSKPP HOKI <span style={{ color: "var(--gold)" }}>GURU PERAK</span> 2026
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          to="/app"
          style={{
            padding: "14px 22px",
            borderRadius: 12,
            background: "var(--gold)",
            color: "var(--ink)",
            fontWeight: 700,
            textDecoration: "none",
            font: "700 13px Barlow, sans-serif",
            letterSpacing: ".04em",
          }}
        >
          App peserta &amp; jurulatih
        </Link>
        <Link
          to="/dashboard"
          style={{
            padding: "14px 22px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.25)",
            color: "#fff",
            textDecoration: "none",
            font: "700 13px Barlow, sans-serif",
            letterSpacing: ".04em",
          }}
        >
          Papan skor urusetia
        </Link>
      </div>
    </div>
  );
}
