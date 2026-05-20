---
tags: [topic, firebase, schema]
---

# Firebase Schema

Realtime Database at `fromgreytoplay-default-rtdb.firebaseio.com`.
Public, MVP-permissive rules. **Tighten before any press coverage.**

## Live schema (as actually written by the code)

> [!note] Wider than CLAUDE.md
> The shipped `index.html` writes to `leaderboard/` and `users/` too —
> these are **missing from `CLAUDE.md`'s schema block**. This note is the
> ground truth; reconcile `CLAUDE.md` when you next touch it.

```
fromgreytoplay-default-rtdb/
├── signups/
│   └── {pushId}: { name, email, choice: "flip"|"mural"|"both",
│                   volunteer: bool, date: ISOString }   ← field is `date`, not `timestamp`
├── votes/
│   ├── flip: number
│   ├── mural: number
│   └── both: number
├── activity/
│   └── {pushId}: { type, userName, courtId?, timestamp }
├── reports/
│   └── {pushId}: (note: written as a court via courts.push, see below)
├── courts/
│   └── {id}/
│       ├── (court fields: name, address, condition, status, progress,
│       │    accessibility{}, neighbourhood, lat, lng, category, ...)
│       └── checkins/
│           └── {uid}: { name, ts }     ← keyed by user id, auto-removed after 2h
├── bookings/
│   └── {pushId}: { courtId, date, hour, userName }
├── leaderboard/                          ← NOT in CLAUDE.md
│   └── {uid|sanitizedName}: { name, points }
└── users/                                ← NOT in CLAUDE.md (client-side "auth")
    └── {uid}: { id, name, email, points, badges[], reports[], volunteer }
```

### Field-name gotchas

| Path | CLAUDE.md says | Code actually uses |
|---|---|---|
| `signups/*` | `timestamp` | `date` (ISO string) |
| `courts/*/checkins/*` | `{userId, timestamp}` | `{name, ts}`, keyed by uid |
| reports | top-level `reports/` | pushed into `courts/` with `status:"degraded"` |

New courts reported via [[Components/Modals]] → ReportModal are pushed
straight into `courts/` (not a separate `reports/` collection), with
random jittered `lat/lng` near city center.

## Activity types

Written by [[Helpers/logActivity]]. The `type` strings are:

| Type | Triggered by |
|---|---|
| `"petition"` | Successful vote in [[Pages/PetitionPage]] |
| `"check-in"` | Check-in button on [[Pages/CourtDetail]] |
| `"report"` | Submit on [[Components/Modals]] → ReportModal |
| `"photo"` | (planned — photo wall #2.1) |
| `"game"` | (planned — pickup game finder #4) |
| `"booking"` | BookingModal submit |
| `"forum"` | Forum post in [[Pages/CommunityPage]] |

## Write conventions

```js
// Collection insert
db.ref("reports").push({
  courtId, issue, status: "open", timestamp: Date.now()
});

// Counter
db.ref("votes/flip").transaction(v => (v||0) + 1);

// Single record (overwrites)
db.ref(`courts/${id}/checkins/${pushId}`).set({ userId, timestamp });
```

After any meaningful write, **also** call:
```js
logActivity(type, userName, courtId)
```
so the activity feed reflects it.

## Read conventions

Use [[Helpers/useFirebase]] in components:

```js
const signups = useFirebase("signups");       // returns object or null
const votes   = useFirebase("votes");
```

The hook attaches `on('value', ...)` and cleans up on unmount.

## Security

- Read: anyone, currently.
- Write: anyone, currently.
- Admin panel is gated by a hardcoded `ADMIN_PW = "teodor2026"` in
  [[Helpers/ADMIN_PW]] — this is **client-side only** and does not
  protect data. Anyone can write to any path with the public Firebase
  config.

> [!warning] Pre-press hardening
> Before announcing the site publicly:
> 1. Tighten RTDB rules (rate-limit `checkins`, restrict `votes` writes).
> 2. Replace `ADMIN_PW` with Firebase Auth role check.
> 3. Run secrets/lint scan over the static file.
