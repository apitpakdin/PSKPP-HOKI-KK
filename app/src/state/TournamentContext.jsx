import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { QUARTER_SECONDS, initialState, sundaySeed, teams } from "./seed";
import {
  buildShootoutFixtures,
  buildXYDraw,
  finalTeams,
  saturdayComplete,
  shootoutStandings,
  thirdPlaceTeams,
} from "./standings";

const STORAGE_KEY = "pskpp-hoki-2026";

const TournamentStateContext = createContext(null);
const TournamentDispatchContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.saturday || !parsed.final) return initialState();
    // Spread over a fresh initialState() so a save from before a field (e.g.
    // thirdPlace, tiebreaks, shootouts) existed still loads instead of
    // wiping all progress. `teams` is always forced fresh from seed.js --
    // it's a fixed reference table no reducer action ever mutates, so an
    // old save's copy (e.g. a team name from before a rename) must never
    // win over the current source of truth.
    return { ...initialState(), ...parsed, teams };
  } catch {
    return initialState();
  }
}

function updateMatchInList(list, id, updater) {
  return list.map((m) => (m.id === id ? updater(m) : m));
}

// Once both X and Y round robins finish, lock the champions into the final
// and tempat ke-3/4 matches so they become selectable/startable on the
// scoreboard.
function syncDerivedTeams(state) {
  let next = state;
  if (next.final.status === "scheduled") {
    const { teamA, teamB } = finalTeams(next);
    if (teamA !== next.final.teamA || teamB !== next.final.teamB) {
      next = { ...next, final: { ...next.final, teamA, teamB } };
    }
  }
  if (next.thirdPlace.status === "scheduled") {
    const { teamA, teamB } = thirdPlaceTeams(next);
    if (teamA !== next.thirdPlace.teamA || teamB !== next.thirdPlace.teamB) {
      next = { ...next, thirdPlace: { ...next.thirdPlace, teamA, teamB } };
    }
  }
  return next;
}

function reducer(state, action) {
  return syncDerivedTeams(baseReducer(state, action));
}

function baseReducer(state, action) {
  switch (action.type) {
    case "ADJUST_SCORE": {
      const { list, id, side, delta } = action;
      const key = side === "A" ? "scoreA" : "scoreB";
      const apply = (m) => ({ ...m, [key]: Math.max(0, m[key] + delta) });
      if (list === "final" || list === "thirdPlace") return { ...state, [list]: apply(state[list]) };
      return { ...state, [list]: updateMatchInList(state[list], id, apply) };
    }
    case "SET_MATCH_REFEREE": {
      const { list, id, refereeId } = action;
      const apply = (m) => ({ ...m, refereeId });
      if (list === "final" || list === "thirdPlace") return { ...state, [list]: apply(state[list]) };
      return { ...state, [list]: updateMatchInList(state[list], id, apply) };
    }
    case "START_MATCH": {
      const { list, id } = action;
      const apply = (m) => ({ ...m, status: "live", running: true });
      if (list === "final" || list === "thirdPlace") return { ...state, [list]: apply(state[list]) };
      return { ...state, [list]: updateMatchInList(state[list], id, apply) };
    }
    case "TOGGLE_CLOCK": {
      const { list, id } = action;
      const apply = (m) => ({ ...m, running: !m.running });
      if (list === "final" || list === "thirdPlace") return { ...state, [list]: apply(state[list]) };
      return { ...state, [list]: updateMatchInList(state[list], id, apply) };
    }
    case "END_QUARTER": {
      const { list, id } = action;
      const apply = (m) => {
        if (m.quarter >= 4) {
          return { ...m, status: "finished", running: false };
        }
        return { ...m, quarter: m.quarter + 1, clockSeconds: QUARTER_SECONDS, running: false };
      };
      if (list === "final" || list === "thirdPlace") return { ...state, [list]: apply(state[list]) };
      return { ...state, [list]: updateMatchInList(state[list], id, apply) };
    }
    case "FINISH_MATCH": {
      const { list, id } = action;
      const apply = (m) => ({ ...m, status: "finished", running: false });
      if (list === "final" || list === "thirdPlace") return { ...state, [list]: apply(state[list]) };
      return { ...state, [list]: updateMatchInList(state[list], id, apply) };
    }
    case "TICK": {
      const tick = (m) =>
        m.running && m.clockSeconds > 0 ? { ...m, clockSeconds: m.clockSeconds - 1 } : m;
      return {
        ...state,
        saturday: state.saturday.map(tick),
        sunday: state.sunday.map(tick),
        thirdPlace: tick(state.thirdPlace),
        final: tick(state.final),
      };
    }
    case "RUN_DRAW": {
      if (!saturdayComplete(state) || state.xyDraw) return state;
      const { groupToX1, groupToY1, groupToY2, x2Group } = action;
      const draw = buildXYDraw(state, { groupToX1, groupToY1, groupToY2, x2Group });
      return { ...state, xyDraw: draw, sunday: sundaySeed(draw) };
    }
    case "CLEAR_XY_DRAW": {
      if (state.sunday.some((m) => m.status !== "scheduled")) return state;
      return { ...state, xyDraw: null, sunday: [] };
    }
    case "START_SHOOTOUT": {
      const { group, teamIds } = action;
      return {
        ...state,
        shootouts: { ...state.shootouts, [group]: buildShootoutFixtures(group, teamIds) },
      };
    }
    case "ADJUST_SHOOTOUT_SCORE": {
      const { group, id, side, delta } = action;
      const key = side === "A" ? "scoreA" : "scoreB";
      const fixtures = (state.shootouts[group] ?? []).map((m) =>
        m.id === id ? { ...m, [key]: Math.max(0, m[key] + delta) } : m,
      );
      return { ...state, shootouts: { ...state.shootouts, [group]: fixtures } };
    }
    case "FINISH_SHOOTOUT_MATCH": {
      const { group, id } = action;
      const fixtures = (state.shootouts[group] ?? []).map((m) =>
        m.id === id ? { ...m, status: "finished" } : m,
      );
      const next = { ...state, shootouts: { ...state.shootouts, [group]: fixtures } };
      const allDone = fixtures.every((m) => m.status === "finished");
      if (allDone) {
        const rows = shootoutStandings(next, group);
        if (rows.length && rows.every((r) => !r.needsShootout)) {
          return { ...next, tiebreaks: { ...next.tiebreaks, [group]: rows.map((r) => r.id) } };
        }
      }
      return next;
    }
    case "RESET_SHOOTOUT": {
      const { group } = action;
      const shootouts = { ...state.shootouts };
      delete shootouts[group];
      const tiebreaks = { ...state.tiebreaks };
      delete tiebreaks[group];
      return { ...state, shootouts, tiebreaks };
    }
    case "RESET": {
      return initialState();
    }
    default:
      return state;
  }
}

export function TournamentProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => syncDerivedTeams(loadState()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TournamentStateContext.Provider value={state}>
      <TournamentDispatchContext.Provider value={dispatch}>
        {children}
      </TournamentDispatchContext.Provider>
    </TournamentStateContext.Provider>
  );
}

export function useTournamentState() {
  const ctx = useContext(TournamentStateContext);
  if (!ctx) throw new Error("useTournamentState must be used within TournamentProvider");
  return ctx;
}

export function useTournamentDispatch() {
  const ctx = useContext(TournamentDispatchContext);
  if (!ctx) throw new Error("useTournamentDispatch must be used within TournamentProvider");
  return ctx;
}

export function useCurrentLive(state) {
  return useMemo(() => {
    const all = [...state.saturday, ...state.sunday, state.thirdPlace, state.final].filter(
      Boolean,
    );
    return all.find((m) => m.status === "live") ?? null;
  }, [state]);
}
