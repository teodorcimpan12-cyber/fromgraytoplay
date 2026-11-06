# Security

## Admin authentication

Admin access uses Firebase Authentication (email + password).
No passwords are stored in source code or in this repository.

The admin form (`AdminLogin`) calls `firebase.auth().signInWithEmailAndPassword`
directly. Access to the admin panel requires a successful Firebase Auth response
**and** that the authenticated user's UID matches the configured admin UID.

## Burned credential

`ADMIN_PW = "teodor2026"` was present in the repository (see `git log -S teodor2026`).
It is removed from the code but remains in git history. **If you used `teodor2026` as a password anywhere else, rotate it.**

Firebase Auth password for the admin account should be changed in the Firebase Console
if it was ever set to the same value.

## Firebase RTDB rules

Rules are in `database.rules.json`. Deploy with:

```
firebase deploy --only database
```

Rules are tested against the Firebase emulator (see `tests/rules.test.mjs`, header explains how to run).
What they enforce today (`database.rules.json`):

- Root read/write: admin UID only. Everything below is an explicit exception.
- `settings/` — public read, write only by admin / `settings/sherifs/{uid}`.
- `signups/`, `partnerRequests/` — create-only (no overwrite), no public read, validated fields.
- `votes/` — public read, write only "+1" per write, choice limited to flip/mural/both.
- `reports/`, `activity/`, `pledges/`, `forum/`, `teams/`, `verifications/`, `letters/` — public read,
  create-only per entry (overwrite/delete only by sherifs), size/type validated.
- `gallery/` — create-only per entry, `img` must be a `data:image/` URL up to ~450 KB (no external URLs),
  `votes` can only grow by 1 per write. Wiping the node is not possible.
- `pixels/` — key `x_y` (0-99), value `#RRGGBB` only.
- `leaderboard/`, `forum/*/upvotes|downvotes`, `events/*/attendeeCount`, `letterCount/total`, `games/*/playerCount`
  — numeric counters, at most +1 (leaderboard points: +50) per write.
- `bookings/`, `adoptions/`, `tasks/*/volunteers/`, `games/` — per-entry create/delete, shape and length validated.
- `presence/`, `achievements/`, `ratings/`, `follows/` — per-key writes with length/type validation.

Known limits (be honest before press):
- Rate limiting is client-side only (localStorage). A script can still push many valid entries.
  Mitigation to add: Firebase App Check + anonymous Auth, then require `auth != null` and a per-uid `lastWrite` node.
- `voterKey` is chosen by the client, so per-device limits and the 2-device verification consensus can be gamed.
- Public-read nodes (`reports`, `gallery`, `verifications`) can contain `voterKey`, `uid`, `gps`, `photoDataUrl`.
  The open-data export strips them; direct reads of the REST API do not. Moving them to a private node is a TODO.
- `settings/sherifs/` is public-readable (uid + name of moderators).
- CSP is Report-Only (`netlify.toml`).

## GDPR

- No identifiable faces in photos (especially minors).
- Email addresses stored in `signups/` are readable only by admin.

## What this repo does NOT contain

- Firebase admin SDK service account keys
- Mapillary API tokens (use `.env` locally, never commit)
- Any hardcoded passwords
