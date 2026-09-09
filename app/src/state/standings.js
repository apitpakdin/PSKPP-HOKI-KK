// Standings computation and the X/Y draw procedure, following the "Prosedur
// Undian Pasukan Peringkat XY" from the tournament's Sains Sukan reference:
//
// 1. Draw the group johan (winners) first, into slots X1, Y1, Y2.
// 2. The naib johan (runner-up) from X1's group automatically goes to Y3.
// 3. The naib johan from Y1's and Y2's groups go into group X; a draw
//    decides which becomes X2 and which becomes X3.

function blankRow(id, name) {
  return { id, name, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
}

export function computeStandings(matches, teamsById, teamIds, group) {
  const table = Object.fromEntries(
    teamIds.map((id) => [id, blankRow(id, teamsById[id]?.name ?? id)]),
  );
  matches
    .filter((m) => m.group === group && m.status === "finished")
    .forEach((m) => {
      const a = table[m.teamA];
      const b = table[m.teamB];
      if (!a || !b) return;
      a.played += 1;
      b.played += 1;
      a.gf += m.scoreA;
      a.ga += m.scoreB;
      b.gf += m.scoreB;
      b.ga += m.scoreA;
      if (m.scoreA > m.scoreB) {
        a.won += 1;
        a.pts += 3;
        b.lost += 1;
      } else if (m.scoreA < m.scoreB) {
        b.won += 1;
        b.pts += 3;
        a.lost += 1;
      } else {
        a.draw += 1;
        b.draw += 1;
        a.pts += 1;
        b.pts += 1;
      }
    });

  return Object.values(table)
    .map((row) => ({ ...row, gd: row.gf - row.ga }))
    .sort(
      (x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name),
    );
}

export function groupStandings(state, group) {
  const teamIds = Object.values(state.teams)
    .filter((t) => t.group === group)
    .map((t) => t.id);
  return computeStandings(state.saturday, state.teams, teamIds, group);
}

export function saturdayComplete(state) {
  return state.saturday.every((m) => m.status === "finished");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawXY(state) {
  const groups = ["A", "B", "C"];
  const johan = {};
  const naib = {};
  groups.forEach((g) => {
    const table = groupStandings(state, g);
    johan[g] = table[0].id;
    naib[g] = table[1].id;
  });

  const [gX1, gY1, gY2] = shuffle(groups);
  const [nX2, nX3] = shuffle([naib[gY1], naib[gY2]]);

  return {
    X: [johan[gX1], nX2, nX3],
    Y: [johan[gY1], johan[gY2], naib[gX1]],
  };
}

export function xyStandings(state, side) {
  if (!state.xyDraw) return [];
  const teamIds = state.xyDraw[side];
  return computeStandings(state.sunday, state.teams, teamIds, side);
}

export function xyComplete(state, side) {
  return state.sunday.filter((m) => m.group === side).every((m) => m.status === "finished");
}

export function finalTeams(state) {
  if (!state.xyDraw || !xyComplete(state, "X") || !xyComplete(state, "Y")) {
    return { teamA: null, teamB: null };
  }
  return {
    teamA: xyStandings(state, "X")[0]?.id ?? null,
    teamB: xyStandings(state, "Y")[0]?.id ?? null,
  };
}
