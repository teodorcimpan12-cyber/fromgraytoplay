---
tags: [component]
symbols: [ForumTab, EventsTab, GalleryTab, TeamsTab, LBTab]
---

# Community Tabs

The five tab bodies inside [[Pages/CommunityPage]].

## ForumTab — `index.html:2132`

- `submit()` (2153) posts a thread to `forum/`.
- `vote(id, d)` (2177) adjusts a thread's score by `d` (+1 / −1).
- Reads `useFirebase("forum")`, sorts by score/recency.

## EventsTab — `index.html:2337`

- Lists community events (created by admins via [[Pages/AdminPanel]]
  `saveEv`). Read-only for normal users.

## GalleryTab — `index.html:2401`

- Photo grid. Precursor to the **photo evidence wall (#2.1)** — but that
  feature wants GPS + court id + approval workflow + Firebase Storage,
  which this simple gallery likely lacks. See [[Roadmap]].

## TeamsTab — `index.html:2456`

- `create()` (2466) makes a team in `teams/`; others can join.
- Closest existing thing to the **pickup-game finder (#4)**.

## LBTab (Leaderboard) — `index.html:2529`

- Reads `leaderboard/` (points awarded +10 per petition vote, see
  [[Pages/PetitionPage]]). Ranks by points.

## Notes

- All write paths should also `logActivity(...)` so the
  [[Components/ActivityFeed]] reflects them ([[Conventions]]).
