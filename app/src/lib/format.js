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
