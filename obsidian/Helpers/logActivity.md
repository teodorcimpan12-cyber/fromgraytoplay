---
tags: [helper, firebase]
symbol: logActivity
line: 585
---

# logActivity

`function logActivity(type, userName, courtId)` — `index.html:585`.
The single chokepoint for writing to `activity/`.

```js
db.ref("activity").push({
  type,
  userName: anonName(userName),     // privacy strip
  courtId: courtId || null,
  timestamp: Date.now()
});
```

## Call it after every meaningful write

| Caller | type |
|---|---|
| [[Pages/PetitionPage]] `doVote` | `"petition"` |
| [[Pages/CourtDetail]] `doCI` | `"check-in"` |
| [[Components/Modals]] ReportModal | `"report"` |
| BookingModal (should) | `"booking"` |
| Forum/Teams (should) | `"forum"` / `"game"` |

Forgetting this is the most common bug pattern — the feature works but
the [[Components/ActivityFeed]] stays silent. See [[Conventions]].
