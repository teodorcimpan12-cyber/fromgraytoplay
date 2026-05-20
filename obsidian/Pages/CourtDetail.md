---
tags: [page, modal]
symbol: CourtDetail
line: 1377
---

# CourtDetail

`function CourtDetail({ court, onClose, onBook })` — `index.html:1377`.
Rendered as a modal from [[Pages/CourtsPage]].

## What it shows

- Court name + address.
- Three badges: **weather** ([[Helpers/getCourtWeather]]), **status**
  (degraded/inProgress/renovated), **occupancy** (empty/active/full from
  live check-in count).
- **Progress bar** (`c.progress` %).
- **Accessibility** chips from `c.accessibility` map (✓/✗).
- **QR code** image.
- Buttons: **Book** (→ `onBook`, opens BookingModal), **Check in / Check out**.

## Check-in logic

```js
doCI: db.ref(`courts/${id}/checkins/${uid}`).set({ name, ts: Date.now() })
      → logActivity("check-in", name, id)
      → auto-remove after 7,200,000 ms (2h)
doCO: db.ref(`courts/${id}/checkins/${uid}`).remove()
```

Occupancy from live count: `0 → empty`, `<5 → active`, `≥5 → full`.

## ⚠ Known bug — QR points to a stale domain

```js
const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${
  encodeURIComponent("https://animated-swan-5a568b.netlify.app/#court-" + c.id)}`;
```

The QR encodes **`animated-swan-5a568b.netlify.app`**, an old deploy
URL — not the live `fromgraytoplay.netlify.app`. Scanning it sends users
to the wrong/dead site. This is the QR issue flagged in roadmap §1.1.
The same stale URL appears in [[Pages/PetitionPage]]'s share link.

**Fix:** hoist the canonical site URL to a constant (e.g.
`const SITE = "https://fromgraytoplay.netlify.app"`) and use it for both
the QR payload and the share string. See [[Roadmap]].

## Data

- `useFirebase("courts/" + c.id + "/checkins")` for live occupancy.
- `useApp()` → `t`, `lang`, `toast`, `user`.
