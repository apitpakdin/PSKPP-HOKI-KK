// Seed data for Kejohanan Jemputan PSKPP Hoki Guru Perak 2026.
// Groups and teams from the tournament poster; Saturday fixtures follow the
// 8:00am-3:30pm, 45-minute-slot round robin (3 matches per group).

export const QUARTER_SECONDS = 15 * 60; // 15:5:15 quarters

export const teams = {
  A1: { id: "A1", name: "Kinta Utara", group: "A" },
  A2: { id: "A2", name: "Kerian", group: "A" },
  A3: { id: "A3", name: "Manjung", group: "A" },
  B1: { id: "B1", name: "Batang PDG", group: "B" },
  B2: { id: "B2", name: "Kuala Kangsar", group: "B" },
  B3: { id: "B3", name: "Perak Tengah", group: "B" },
  C1: { id: "C1", name: "Hulu Perak", group: "C" },
  C2: { id: "C2", name: "Bagan & Hilir", group: "C" },
  C3: { id: "C3", name: "Kinta Selatan", group: "C" },
};

export const GROUPS = ["A", "B", "C"];

function blankMatch({ id, day, phase, group, time, teamA, teamB }) {
  return {
    id,
    day,
    phase,
    group,
    time,
    teamA,
    teamB,
    scoreA: 0,
    scoreB: 0,
    status: "scheduled", // scheduled | live | finished
    quarter: 1,
    clockSeconds: QUARTER_SECONDS,
    running: false,
    refereeId: null,
  };
}

// Round-robin order for 3 seeded teams: 1v2, 3v1, 2v3. The first team in
// each pair is the home team (listed first / plays first on the schedule).
export const ROUND_ROBIN_PAIRS = [
  [0, 1],
  [2, 0],
  [1, 2],
];

export function saturdaySeed() {
  const groupOrder = ["A", "B", "C"];
  const groupSeeds = {
    A: ["A1", "A2", "A3"],
    B: ["B1", "B2", "B3"],
    C: ["C1", "C2", "C3"],
  };
  const times = [
    "8:00 pg",
    "8:45 pg",
    "9:30 pg",
    "10:15 pg",
    "11:00 pg",
    "11:45 pg",
    "2:00 ptg",
    "2:45 ptg",
    "3:30 ptg",
  ];
  const matches = [];
  for (let round = 0; round < 3; round++) {
    groupOrder.forEach((group, gi) => {
      const seeds = groupSeeds[group];
      const [x, y] = ROUND_ROBIN_PAIRS[round];
      const time = times[round * 3 + gi];
      matches.push(
        blankMatch({
          id: `sat-${group}-${round + 1}`,
          day: "sat",
          phase: "group",
          group,
          time,
          teamA: seeds[x],
          teamB: seeds[y],
        }),
      );
    });
  }
  return matches;
}

const SUNDAY_TIMES = ["7:30 pg", "8:15 pg", "9:00 pg", "9:45 pg", "10:30 pg", "11:15 pg"];

// draw: { X: [id,id,id], Y: [id,id,id] } seeded 1/2/3 per side
export function sundaySeed(draw) {
  const matches = [];
  for (let round = 0; round < 3; round++) {
    const [x, y] = ROUND_ROBIN_PAIRS[round];
    matches.push(
      blankMatch({
        id: `sun-X-${round + 1}`,
        day: "sun",
        phase: "xy",
        group: "X",
        time: SUNDAY_TIMES[round * 2],
        teamA: draw.X[x],
        teamB: draw.X[y],
      }),
    );
    matches.push(
      blankMatch({
        id: `sun-Y-${round + 1}`,
        day: "sun",
        phase: "xy",
        group: "Y",
        time: SUNDAY_TIMES[round * 2 + 1],
        teamA: draw.Y[x],
        teamB: draw.Y[y],
      }),
    );
  }
  return matches;
}

export function finalSeed() {
  return blankMatch({
    id: "final",
    day: "sun",
    phase: "final",
    group: null,
    time: "12:30 tgh",
    teamA: null,
    teamB: null,
  });
}

export function initialState() {
  return {
    teams,
    saturday: saturdaySeed(),
    xyDraw: null,
    sunday: [],
    final: finalSeed(),
    tiebreaks: {},
    shootouts: {},
  };
}
