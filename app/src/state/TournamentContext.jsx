import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  QUARTER_SECONDS,
  finalSeed,
  initialState,
  saturdaySeed,
  sundaySeed,
  teams,
  thirdPlaceSeed,
} from "./seed";
import {
  buildShootoutFixtures,
  buildXYDraw,
  finalTeams,
  saturdayComplete,
  shootoutStandings,
  thirdPlaceTeams,
} from "./standings";

const STORAGE_KEY = "pskpp-hoki-2026";
const REMOTE_ID = "main";

const TournamentStateContext = createContext(null);
const TournamentDispatchContext = createContext(null);

// Merges a saved match's live progress (score, status, quarter, clock,
// referee) onto a freshly-seeded match, so a corrected schedule (a fixed
// kickoff time, fixture order, or team slot) always wins over whatever an
// old save happened to have -- the same problem `teams` had before it was
// forced fresh, just for the match schedule itself.
function mergeProgress(fresh, saved) {
  if (!saved) return fresh;
  return {
    ...fresh,
    scoreA: saved.scoreA ?? fresh.scoreA,
    scoreB: saved.scoreB ?? fresh.scoreB,
    status: saved.status ?? fresh.status,
    quarter: saved.quarter ?? fresh.quarter,
    clockSeconds: saved.clockSeconds ?? fresh.clockSeconds,
    running: saved.running ?? fresh.running,
    refereeId: saved.refereeId ?? fresh.refereeId,
  };
}

// thirdPlace/final additionally need teamA/teamB merged in: those are
// derived dynamically from standings and frozen once the match starts (not
// re-derivable from a "fresh seed", unlike Saturday/Sunday's fixed slots).
function mergeProgressWithTeams(fresh, saved) {
  const merged = mergeProgress(fresh, saved);
  if (!saved) return merged;
  return { ...merged, teamA: saved.teamA ?? fresh.teamA, teamB: saved.teamB ?? fresh.teamB };
}

// Saturday/sunday team slots are fixed by the schedule (Saturday always, and
// Sunday once the persisted xyDraw is re-applied to the current fixture
// order), so only mutable progress is merged back in -- an old save's
// teamA/teamB must never override a corrected fixture order.
function mergeScheduleList(freshList, savedList) {
  const savedById = Object.fromEntries((savedList ?? []).map((m) => [m.id, m]));
  return freshList.map((fresh) => mergeProgress(fresh, savedById[fresh.id]));
}

// Spread a saved/incoming snapshot over a fresh initialState() so one from
// before a field (e.g. thirdPlace, tiebreaks, shootouts) existed still loads
// instead of wiping all progress. `teams` and the match schedule (saturday/
// sunday/thirdPlace/final structure) are always forced fresh from seed.js --
// they're fixed source-of-truth data no reducer action mutates, so a stale
// copy (e.g. times/fixture order from before a jadual fix, whether from an
// old localStorage save or an old client's write to the shared Supabase row)
// must never win over the current source of truth. Only each match's own
// live progress is carried over.
function withCorrectedSchedule(parsed) {
  return {
    ...initialState(),
    ...parsed,
    teams,
    saturday: mergeScheduleList(saturdaySeed(), parsed.saturday),
    sunday: mergeScheduleList(sundaySeed(parsed.xyDraw ?? null), parsed.sunday),
    thirdPlace: mergeProgressWithTeams(thirdPlaceSeed(), parsed.thirdPlace),
    final: mergeProgressWithTeams(finalSeed(), parsed.final),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.saturday || !parsed.final) return initialState();
    return withCorrectedSchedule(parsed);
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
        // Peraturan 10.1: two 15-minute halves with a 5-minute break
        // (15:5:15), not four quarters.
        if (m.quarter >= 2) {
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
      const saturday = state.saturday.map(tick);
      const sunday = state.sunday.map(tick);
      const thirdPlace = tick(state.thirdPlace);
      const final = tick(state.final);
      const changed =
        saturday.some((m, i) => m !== state.saturday[i]) ||
        sunday.some((m, i) => m !== state.sunday[i]) ||
        thirdPlace !== state.thirdPlace ||
        final !== state.final;
      // Nothing running on this device's view: bail out to the SAME state
      // reference so an idle tab doesn't re-push a stale copy every second
      // and race with (and silently overwrite) a genuinely fresher change.
      if (!changed) return state;
      return { ...state, saturday, sunday, thirdPlace, final };
    }
    case "RUN_DRAW": {
      if (!saturdayComplete(state) || state.xyDraw) return state;
      const { groupToX1, groupToY1, groupToY2, x2Group } = action;
      const draw = buildXYDraw(state, { groupToX1, groupToY1, groupToY2, x2Group });
      return { ...state, xyDraw: draw, sunday: sundaySeed(draw) };
    }
    case "CLEAR_XY_DRAW": {
      if (state.sunday.some((m) => m.status !== "scheduled")) return state;
      return { ...state, xyDraw: null, sunday: sundaySeed(null) };
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
    case "SYNC_REMOTE": {
      if (!action.state || !action.state.saturday || !action.state.final) return state;
      return withCorrectedSchedule(action.state);
    }
    default:
      return state;
  }
}

export function TournamentProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => syncDerivedTeams(loadState()));
  // Highest revision (a Date.now() timestamp) this device has accepted,
  // whether from its own confirmed push or a remote update. A delayed/
  // out-of-order update from *before* a newer local change (e.g. urusetia
  // starts the next match, but a stale echo of the previous state arrives
  // moments later) is recognised as stale by this and dropped instead of
  // silently reverting the newer state.
  const lastRev = useRef(0);
  // Revisions this device has pushed but not yet seen echoed back (or
  // confirmed) -- lets a self-echo be recognised and skipped *immediately*,
  // without waiting on lastRev to have been bumped first. Without this, if
  // the Realtime echo of our own write happens to arrive before the REST
  // upsert's own response does (plausible -- the websocket is often faster
  // than a full request/response round trip), the echo would look "newer
  // than anything seen so far" and get re-applied via SYNC_REMOTE, which
  // changes the state reference and re-triggers the push effect below --
  // pushing the same content again under a new rev, which echoes again,
  // forever: a self-sustaining update loop.
  const pendingSelfRevs = useRef(new Set());
  // Timestamp of the most recent *local* dispatch not yet confirmed pushed.
  // Closes a narrower version of the same problem lastRev/pendingSelfRevs
  // solve: right after a local action (e.g. "Set semula"), there's a ~300ms
  // debounce window before a rev even exists for it yet, during which an
  // already-in-flight fetch from *before* the action can still resolve and
  // carry an old (but individually valid, rev <= lastRev not yet true since
  // lastRev may still be 0 this early) snapshot -- applying it would
  // silently undo the action the user just took. Never cleared back to 0:
  // once the corresponding push confirms, lastRev overtakes it anyway, so
  // it simply stops mattering rather than needing to be reset.
  const pendingFloor = useRef(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Push this device's state to the shared Supabase row so every other open
  // browser (urusetia and every peserta phone) can see it live. RLS only
  // lets an authenticated (signed-in urusetia) session's write actually
  // land -- a peserta browser's attempt is rejected, which is fine, it only
  // ever needs to read. `lastRev` is only advanced once the write is
  // *confirmed* to have landed (supabase-js resolves with an `error` field
  // rather than rejecting on an RLS denial) -- bumping it optimistically
  // would let a peserta phone's own stream of rejected attempts poison its
  // own revision counter and make it start ignoring urusetia's real,
  // legitimately-older-looking updates. Debounced slightly so a burst of
  // changes in the same tick (e.g. a score click plus the next TICK)
  // coalesces into one request instead of several.
  useEffect(() => {
    pendingFloor.current = Date.now();
    const timeout = setTimeout(() => {
      const rev = Date.now();
      pendingSelfRevs.current.add(rev);
      supabase
        .from("tournament_state")
        .upsert({ id: REMOTE_ID, data: { ...state, _rev: rev } })
        .then(
          ({ error }) => {
            pendingSelfRevs.current.delete(rev);
            if (!error) lastRev.current = Math.max(lastRev.current, rev);
          },
          () => {
            pendingSelfRevs.current.delete(rev);
          },
        );
    }, 300);
    return () => clearTimeout(timeout);
  }, [state]);

  // Mirror the shared row: fetch its current value once on mount, then
  // subscribe so every score/status change urusetia makes anywhere reaches
  // this device within moments, live. A phone's WebSocket is not reliable
  // enough to rely on alone, especially outdoors at a turf on shaky wifi/
  // data, or after the screen locks and the OS suspends the tab -- when it
  // resumes, the socket can be silently dead with no error ever surfacing,
  // leaving the page frozen on whatever match was live when it dropped. Two
  // extra safety nets on top of the subscription: a periodic re-fetch, and
  // an immediate re-fetch the moment the tab becomes visible again. Both
  // just call the same applyRemote the subscription uses, so a fetch that
  // turns out to be no newer than what's already here is a harmless no-op.
  useEffect(() => {
    let cancelled = false;

    const applyRemote = (remoteData) => {
      if (!remoteData) return;
      const { _rev, ...remoteState } = remoteData;
      if (typeof _rev === "number") {
        if (pendingSelfRevs.current.has(_rev)) {
          // Our own write, echoed back -- already applied locally, and
          // re-dispatching it would only feed the loop described above.
          pendingSelfRevs.current.delete(_rev);
          lastRev.current = Math.max(lastRev.current, _rev);
          return;
        }
        if (_rev <= lastRev.current) return; // stale/duplicate, ignore
        if (pendingFloor.current > 0 && _rev < pendingFloor.current) return; // predates a local edit still in flight
        lastRev.current = _rev;
      } else if (lastRev.current > 0) {
        // No _rev on this payload at all (e.g. a leftover/legacy row shape,
        // or another tab still running code from before _rev existed) --
        // once a real revision baseline is established, never let an
        // unversioned payload override it; that's exactly the kind of
        // stale overwrite that made a score tap look like it needed a
        // second press to "stick". Only accepted before any baseline
        // exists yet (the very first load).
        return;
      }
      dispatch({ type: "SYNC_REMOTE", state: remoteState });
    };

    const fetchNow = () => {
      supabase
        .from("tournament_state")
        .select("data")
        .eq("id", REMOTE_ID)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) applyRemote(data?.data);
        })
        .catch(() => {});
    };

    fetchNow();

    const channel = supabase
      .channel("tournament_state_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournament_state", filter: `id=eq.${REMOTE_ID}` },
        (payload) => applyRemote(payload.new?.data),
      )
      .subscribe();

    const pollInterval = setInterval(fetchNow, 10000);

    const onVisible = () => {
      if (!document.hidden) fetchNow();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

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
