---
name: SANTI HARMONY Project
description: Seminar game web app — stage/mobile/settings views, Thai NVC conflict resolution game
type: project
---

Main file: `index.html` (single-file app, all screens)
Server: `server.js` (Node.js, port 3000)
Design system: DESIGN.md — teal primary (#00464a), orange tertiary (#653011), no-border rule, glassmorphism

**Game flow:**
lobby → teams → category → cards → detail → discussion (A then B) → summary

**URL routing:**
- `?view=stage` — projector/facilitator (default)
- `?view=mobile` — player phone
- `?view=settings` — facilitator controls

**Sync architecture:**
- Same device/browser: localStorage + BroadcastChannel
- Cross-device (seminar): `node server.js` → `/api/state` POST/GET + `/api/events` SSE
- IS_SERVER flag auto-detects http vs file:// protocol
- Mobile subscribes to SSE; stage POSTs state on every change

**Why:** localStorage is per-device so QR scan on phone gets empty state → different room code. Server fixes this by being the single source of truth.

**To run cross-device:**
```
cd "C:\Users\Oyeon\Downloads\stitch (1)\stitch"
node server.js
```
Then open `http://LOCAL_IP:3000` on projector, players scan QR.

**Content:** 6 categories × 1-2 scenarios each (Thai NVC themes: land/water/labor/community/urban/rights)
