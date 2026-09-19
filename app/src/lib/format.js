export function teamName(teams, id) {
  if (!id) return "?";
  return teams[id]?.name ?? id;
}

export function formatClock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function statusLabel(status) {
  if (status === "live") return "SEDANG BERLANGSUNG";
  if (status === "finished") return "TAMAT";
  return "BELUM MULA";
}

// Ahad 20 Sept 2026 is the tournament's second day (Peringkat XY, tempat
// ke-3/4, final) -- peserta shouldn't have to tap to switch to it once it's
// actually that day, so the mobile tabs default to it automatically from
// midnight onward instead of always opening on Sabtu's view.
export function isTournamentSunday(now = new Date()) {
  return now >= new Date(2026, 8, 20, 0, 0, 0);
}
