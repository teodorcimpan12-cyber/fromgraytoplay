---
tags: [page]
symbol: CommunityPage
line: 2111
---

# CommunityPage

`function CommunityPage()` — `index.html:2111`. Route: `community`.
A tabbed hub. Tab strip uses the `.tabs` class ([[Design System]]).

## Tabs

| Tab | Symbol | Line | Purpose |
|---|---|---|---|
| Activity | (inline) | — | Renders [[Components/ActivityFeed]] |
| Forum | `ForumTab` | 2132 | Post + upvote/downvote threads |
| Events | `EventsTab` | 2337 | Community events list |
| Gallery | `GalleryTab` | 2401 | Photo grid |
| Teams | `TeamsTab` | 2456 | Create / join pickup teams |
| Leaderboard | `LBTab` | 2529 | Points ranking from `leaderboard/` |

All five tab components are documented together in
[[Components/Community Tabs]].

## Data

- `ForumTab` reads/writes `useFirebase("forum")`, votes adjust score.
- `TeamsTab` writes to `teams/` on create.
- `LBTab` reads `leaderboard/` (populated by [[Pages/PetitionPage]] +10
  per vote).

## Notes

- This page is the "ongoing community infrastructure" angle from the
  brief — forum/teams/events keep the project alive between petition
  pushes.
- Pickup-game finder (#4 in brief) would slot in as a new tab here or
  fold into `TeamsTab`/`EventsTab`.
