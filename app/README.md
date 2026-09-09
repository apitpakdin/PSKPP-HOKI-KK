# PSKPP Hoki Guru Perak 2026

Working app for Kejohanan Jemputan PSKPP Hoki Guru Perak 2026 (19–20 Sept 2026,
Turf USAS, Kuala Kangsar), implemented from the Claude Design mockup
`Hoki PSKPP Perak.dc.html` (variants **1a** dark mobile app and **1c**
committee dashboard).

## Run it

```bash
npm install
npm run dev
```

- `/#/app` — participant/official mobile view: Jadual, Kedudukan, Keputusan, Info
- `/#/dashboard` — organising-committee scoreboard: live score entry, quarter/clock
  control, standings, and the Peringkat XY draw + Final flow
- `/` — landing page linking to both

`npm run build` produces a static `dist/` you can host anywhere (e.g. GitHub
Pages, Netlify, Vercel, or an S3 bucket) — it's a client-only SPA using
`HashRouter`, so no server-side routing config is needed.

## How it works

All tournament state (scores, match status, quarters, the XY draw) lives in a
single React context (`src/state/TournamentContext.jsx`) and is persisted to
the browser's `localStorage`. There is **no backend** — this is a single
shared instance meant to run on one device (or one Wi-Fi-connected laptop)
that the urusetia controls at the turf; the mobile screens and dashboard
sync only because they're the same web app reading the same local storage.

The X/Y draw (`src/state/standings.js` → `drawXY`) implements the exact
procedure from the reference slide: johan teams are drawn into X1/Y1/Y2
first, naib johan of X1's group auto-fills Y3, and naib johan of Y1's/Y2's
groups are drawn into X2/X3.

## Known gaps to fill in before the real event

- **"HUBUNGI URUSETIA"** on the Info tab has no phone number/link yet — no
  contact info was in the source design. Wire it up in
  `src/components/mobile/InfoTab.jsx`.
- No real multi-device sync — if you need the dashboard and mobile app to
  work live from separate phones/devices, that requires an actual backend
  (not built here, since it wasn't requested).
- Sidebar items other than "Papan skor" (Jadual perlawanan, Kedudukan,
  Peringkat XY, Pasukan & pemain, Pengadil) are static placeholders — only
  Papan Skor was in the source design's 1c mockup.
