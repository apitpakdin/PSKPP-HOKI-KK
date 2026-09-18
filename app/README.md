# Liga Hoki Guru Perak 2026

Working app for Kejohanan Jemputan Liga Hoki Guru Perak 2026 (19–20 Sept 2026,
Turf USAS, Kuala Kangsar), implemented from the Claude Design mockup
`Hoki PSKPP Perak.dc.html` (variants **1a** dark mobile app and **1c**
committee dashboard).

## Run it

```bash
npm install
npm run dev
```

- `/#/app` — participant/official mobile view: Jadual, Kedudukan, Keputusan, Sijil, Info
- `/#/dashboard` — organising-committee scoreboard: live score entry, quarter/clock
  control, standings, the Peringkat XY draw, Tempat Ke-3/4, and the Final
- `/` — landing page linking to both

`npm run build` produces a static `dist/` you can host anywhere (e.g. GitHub
Pages, Netlify, Vercel, or an S3 bucket) — it's a client-only SPA using
`HashRouter`, so no server-side routing config is needed.

## How it works

Scores, match status, quarters, the XY draw, and tie-break results live in a
single React context (`src/state/TournamentContext.jsx`), persisted to the
browser's `localStorage` as before, but also mirrored to a single shared row
in Supabase (`tournament_state`, `id = 'main'`) so every open browser --
urusetia's dashboard and every participant's phone -- sees the same live
score/status the instant it changes anywhere, via Supabase Realtime. Row
Level Security means only a signed-in urusetia session's write actually
lands; a participant's browser only ever reads. `localStorage` remains as a
same-device fallback (e.g. briefly offline) and to survive a page reload
before the initial fetch completes.

Pasukan & pemain, Pengadil, and the live tournament state are all backed by
this same Supabase project (`src/lib/supabase.js`) so an Excel upload or a
score update from the secretariat is visible to every visitor, not just the
originating browser. See `supabase/schema.sql` for the table/RLS setup --
**running it (including the `tournament_state` table and its
`supabase_realtime` publication) is a required one-time step in the
Supabase SQL Editor**, it isn't applied automatically by deploying the app.
The `/dashboard` route requires signing in via Supabase Auth.

`src/state/standings.js` implements two procedures that both deliberately
require manual input for anything decided by a physical event, rather than
letting the app guess:

- **X/Y draw** (`buildXYDraw`) — johan teams are drawn into X1/Y1/Y2 first,
  naib johan of X1's group auto-fills Y3, and naib johan of Y1's/Y2's groups
  are drawn into X2/X3. The secretariat enters the actual draw result
  (Peringkat XY panel); the app never randomises this.
- **Group tie-breaks** (`computeStandings`) — follows Peraturan 9.2-9.7 of
  `Peraturan Jemputan Pskpp Hoki 2026.docx`: mata → bilangan kemenangan →
  beza gol → gol terbanyak → keputusan sesama sendiri (head-to-head, 2-way
  ties only) → shootout. Anything still tied after head-to-head needs a real
  shootout; the app flags it and takes the secretariat's recorded result
  rather than picking an order itself.

All match days, times, and pairings (`src/state/seed.js`) are taken verbatim
from the official "Jadual Perlawanan Jemputan Hoki PSKPP Guru Negeri Perak
2026" schedule, including the Tempat Ke-3/4 match (Naib Johan X vs Naib
Johan Y, 1:45 ptg, before the 2:20 ptg final) — its teams auto-fill the same
way the final's do, once both X and Y round robins finish.

**Known, deliberate deviation from Peraturan 8.2:** the written rules
describe the knockout stage as Suku Akhir → Separuh Akhir → Perlawanan
Tempat Ke-3/4 → Perlawanan Akhir, with all 6 group qualifiers (johan + naib
johan of A/B/C) advancing to the quarter-final. The official schedule (and
this app) instead run the "Peringkat XY" format: the 6 qualifiers split
into two round-robin groups (X/Y), whose winners meet in the final and
runners-up meet for 3rd/4th — no separate suku akhir/separuh akhir rounds.
This was a deliberate choice by the organizing committee (2026-09-10) to
keep running the X/Y format rather than rebuild to match Peraturan 8.2's
bracket — not an oversight, and now confirmed by the official schedule
itself.

