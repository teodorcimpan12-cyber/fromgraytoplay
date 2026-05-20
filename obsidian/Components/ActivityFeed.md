---
tags: [component, firebase]
symbol: ActivityFeed
line: 2068
---

# ActivityFeed

`function ActivityFeed()` — `index.html:2068`. Live ticker of recent
actions. Rendered inside [[Pages/CommunityPage]].

## Behavior

- `useFirebase("activity")` → newest entries first.
- Each entry: icon by `type`, message built from `userName` + optional
  `courtName`, relative time.
- Entries are written by [[Helpers/logActivity]] from across the app.

## Activity entry shape

```
{ type, userName, courtId?, timestamp }
```

`type` ∈ `check-in | petition | report | photo | game | booking | forum`
(see [[Firebase Schema#Activity types]]).

## Notes

- Names are already anonymized at write time by [[Helpers/anonName]].
- The `activity/` path should be capped (~50). It is **display only** —
  never count it for totals; use `votes` etc. ([[Conventions]]).
- Shipped in session 2 ([[Session Log]]).
