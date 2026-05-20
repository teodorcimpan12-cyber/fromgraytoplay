---
tags: [page]
symbol: PetitionPage
line: 1745
---

# PetitionPage

`function PetitionPage()` — `index.html:1745`. Route: `petition`.
The core civic action.

## Flow

1. User picks one of three options ([[Design System#Petition color semantics]]):
   - 🏀 `flip` · 🎨 `mural` · ✨ `both`
2. Enters name + email, optional volunteer checkbox.
3. Submit (`doVote`) is enabled only when
   `name ≥ 2 chars && email includes "@" && choice !== ""`.
4. After voting, results view shows the three tallies as bars
   (normalized to `max`).

## `doVote` writes

```js
db.ref("votes/" + choice).transaction(v => (v||0)+1);     // counter
db.ref("signups").push({ name, email, choice, volunteer,
                         date: new Date().toISOString() });
logActivity("petition", name);                            // feed
db.ref("leaderboard/" + lbKey).transaction(...);          // +10 points
localStorage.setItem("g2p_voted", "1");                   // dedupe
```

- `lbKey` = `user.id` or sanitized name.
- Awards **+10 points** to the [[Pages/AdminPanel|leaderboard]].
- Dedupe is **localStorage-only** (`g2p_voted`) — clears if storage is
  wiped; not enforced server-side.

## Letter to council

Opens [[Components/Modals]] LetterModal via `showLetter`. This is the
seed of roadmap feature #2.2 (letter-to-council generator).

## ⚠ Same stale share URL

```js
const url = "https://animated-swan-5a568b.netlify.app/";
```

Same dead domain as the [[Pages/CourtDetail]] QR bug. Fix together.

## Notes

- Several strings are inline ro/en ternaries — **no hu**. Move to
  [[Helpers/T dictionary]]. See [[i18n]].
