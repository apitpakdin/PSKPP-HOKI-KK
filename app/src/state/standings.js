// Standings computation, following Peraturan 9.1-9.7 of the tournament's
// official rules (Peraturan Jemputan PSKPP Hoki 2026):
//
//   9.2 Mata (points: menang=3, seri=1, kalah=0)
//   9.3 Bilangan kemenangan (number of wins)
//   9.4 Perbezaan gol (goal difference)
//   9.5 Gol terbanyak (most goals scored)
//   9.6 Keputusan sesama sendiri (head-to-head result), for a two-way tie
//   9.7 Shootout -- a real physical mini-competition when still tied,
//       9.7.1 run as a round-robin (liga) when more than 2 teams are
//       involved, following the same fixture order as the group stage
//       (Peraturan 9.7.1); the secretariat keys in each shootout's score
//       the same way as a normal match, rather than picking a final order.
//
// And the "Prosedur Undian Pasukan Peringkat XY" for the X/Y draw:
//
// 1. Draw the group johan (winners) first, into slots X1, Y1, Y2.
// 2. The naib johan (runner-up) from X1's group automatically goes to Y3.
// 3. The naib johan from Y1's and Y2's groups go into group X; a draw
//    decides which becomes X2 and which becomes X3.

import { ROUND_ROBIN_PAIRS } from "./seed";

function blankRow(id, name) {
  return { id, name, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
}

function headToHead(matches, group, aId, bId) {
  const match = matches.find(
    (m) =>
      m.group === group &&
      m.status === "finished" &&
      ((m.teamA === aId && m.teamB === bId) || (m.teamA === bId && m.teamB === aId)),
  );
  if (!match) return 0;
  const aScore = match.teamA === aId ? match.scoreA : match.scoreB;
  const bScore = match.teamA === aId ? match.scoreB : match.scoreA;
  if (aScore === bScore) return 0;
  return aScore > bScore ? -1 : 1;
}

function sameOnRules934(x, y) {
  return x.pts === y.pts && x.won === y.won && x.gd === y.gd && x.gf === y.gf;
}

export function computeStandings(matches, teamsById, teamIds, group) {
  const table = Object.fromEntries(
    teamIds.map((id) => [id, blankRow(id, teamsById[id]?.name ?? id)]),
  );
  const groupMatches = matches.filter((m) => m.group === group);
  const groupComplete = groupMatches.length > 0 && groupMatches.every((m) => m.status === "finished");
  groupMatches
    .filter((m) => m.status === "finished")
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

  const rows = Object.values(table).map((row) => ({ ...row, gd: row.gf - row.ga }));

  // Peraturan 9.2-9.5: mata -> bilangan kemenangan -> beza gol -> gol
  // terbanyak. These four are transitive, so a plain stable sort is safe.
  rows.sort((x, y) => y.pts - x.pts || y.won - x.won || y.gd - x.gd || y.gf - x.gf);

  // Peraturan 9.6/9.7 only decide anything once the group stage is actually
  // finished -- mid-tournament, every team starts 0-0-0-0 and would
  // otherwise look like a tie needing a shootout.
  if (groupComplete) {
    // Within each still-tied cluster, a two-way tie can be resolved by
    // head-to-head result; a three-way (or more) tie, or a head-to-head
    // draw, needs a real shootout -- flag it rather than guess.
    let i = 0;
    while (i < rows.length) {
      let j = i + 1;
      while (j < rows.length && sameOnRules934(rows[i], rows[j])) j++;
      const clusterSize = j - i;
      if (clusterSize === 2) {
        const h2h = headToHead(matches, group, rows[i].id, rows[j - 1].id);
        if (h2h > 0) {
          [rows[i], rows[j - 1]] = [rows[j - 1], rows[i]];
        } else if (h2h === 0) {
          rows[i].needsShootout = true;
          rows[j - 1].needsShootout = true;
        }
      } else if (clusterSize > 2) {
        for (let k = i; k < j; k++) rows[k].needsShootout = true;
      }
      i = j;
    }
  }

  return rows;
}

// Applies a manually-recorded shootout result (Peraturan 9.7) to whichever
// rows are still flagged needsShootout, if the secretariat has entered one
// for exactly that tied cluster.
function applyTiebreakOverride(state, group, rows) {
  const override = state.tiebreaks?.[group];
  const tied = rows.filter((r) => r.needsShootout);
  if (!override || override.length !== tied.length) return rows;
  const tiedIds = new Set(tied.map((r) => r.id));
  if (!override.every((id) => tiedIds.has(id))) return rows;

  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
  const orderedTied = override.map((id) => ({
    ...byId[id],
    needsShootout: false,
    resolvedByShootout: true,
  }));
  let oi = 0;
  return rows.map((r) => (tiedIds.has(r.id) ? orderedTied[oi++] : r));
}

export function groupStandings(state, group) {
  const teamIds = Object.values(state.teams)
    .filter((t) => t.group === group)
    .map((t) => t.id);
  const rows = computeStandings(state.saturday, state.teams, teamIds, group);
  return applyTiebreakOverride(state, group, rows);
}

export function saturdayComplete(state) {
  return state.saturday.every((m) => m.status === "finished");
}

// Builds the X/Y draw from the actual physical draw results the secretariat
// enters (which group's johan/naib landed in which slot), rather than
// randomising it — the real draw is a lot-drawing ceremony, not a coin flip
// the app should simulate.
export function buildXYDraw(state, { groupToX1, groupToY1, groupToY2, x2Group }) {
  const groups = ["A", "B", "C"];
  const johan = {};
  const naib = {};
  groups.forEach((g) => {
    const table = groupStandings(state, g);
    johan[g] = table[0].id;
    naib[g] = table[1].id;
  });

  const x3Group = x2Group === groupToY1 ? groupToY2 : groupToY1;

  return {
    X: [johan[groupToX1], naib[x2Group], naib[x3Group]],
    Y: [johan[groupToY1], johan[groupToY2], naib[groupToX1]],
  };
}

export function xyStandings(state, side) {
  if (!state.xyDraw) return [];
  const teamIds = state.xyDraw[side];
  const rows = computeStandings(state.sunday, state.teams, teamIds, side);
  return applyTiebreakOverride(state, side, rows);
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

// Peraturan 9.7.1: a shootout among more than 2 tied teams is run as a
// round-robin, in the same fixture order as the group stage itself.
export function buildShootoutFixtures(group, teamIds) {
  const pairs = teamIds.length === 2 ? [[0, 1]] : ROUND_ROBIN_PAIRS;
  return pairs.map(([x, y], i) => ({
    id: `so-${group}-${i + 1}`,
    teamA: teamIds[x],
    teamB: teamIds[y],
    scoreA: 0,
    scoreB: 0,
    status: "scheduled",
  }));
}

// Re-applies Peraturan 9.2-9.6 to the shootout's own results to find the
// final order -- the same cascade, just scored on the shootout instead of
// the group stage.
export function shootoutStandings(state, group) {
  const fixtures = state.shootouts?.[group];
  if (!fixtures || !fixtures.length) return [];
  const teamIds = [...new Set(fixtures.flatMap((m) => [m.teamA, m.teamB]))];
  const asMatches = fixtures.map((m) => ({ ...m, group }));
  return computeStandings(asMatches, state.teams, teamIds, group);
}
