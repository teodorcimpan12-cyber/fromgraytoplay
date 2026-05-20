---
tags: [page, admin]
symbol: AdminPanel
line: 3591
---

# AdminPanel

`function AdminPanel({ ... })` — `index.html:3591`. Dark-themed dashboard
behind [[Pages/AdminLogin]]. Uses the `.admin-*` classes ([[Design System]]).

## What it does

- Sidebar nav across data sections (signups, courts, reports, events,
  leaderboard, etc.).
- Stat tiles (`.a-stat`) + tables (`.a-table`) of Firebase records.
- CRUD-ish actions per row (approve/delete) writing back to Firebase.
- **CSV export**: `csv(rows, fn)` (line 3630) serializes a dataset to a
  downloadable CSV. This is the seed of the open-data export (#2.4) and
  the dossier export (#2.3).
- `saveEv` (line 3651) creates/updates events.

## Data

- Reads most top-level paths via [[Helpers/useFirebase]].
- Writes approvals/deletions directly.

## Notes

- The CSV helper is reusable — point the dossier/open-data features at it
  rather than re-implementing serialization.
- Everything here is exposed to anyone who knows the password string;
  see [[Pages/AdminLogin]] security caveat.
