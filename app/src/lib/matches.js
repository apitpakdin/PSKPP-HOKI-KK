import { teamName } from "./format";

export function allMatchesWithList(state) {
  return [
    ...state.saturday.map((m) => ({ m, list: "saturday" })),
    ...state.sunday.map((m) => ({ m, list: "sunday" })),
    { m: state.final, list: "final" },
  ];
}

export function findMatch(state, id) {
  return allMatchesWithList(state).find(({ m }) => m.id === id) ?? null;
}

export function matchLabel(state, m) {
  const group = m.phase === "final" ? "Akhir" : `Kump ${m.group}`;
  const a = m.teamA ? teamName(state.teams, m.teamA) : "?";
  const b = m.teamB ? teamName(state.teams, m.teamB) : "?";
  return `${m.time} · ${group} · ${a} vs ${b}`;
}
