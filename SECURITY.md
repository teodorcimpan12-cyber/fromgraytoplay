# Security

## Admin authentication

Admin access uses Firebase Authentication (email + password).
No passwords are stored in source code or in this repository.

The admin form (`AdminLogin`) calls `firebase.auth().signInWithEmailAndPassword`
directly. Access to the admin panel requires a successful Firebase Auth response
**and** that the authenticated user's UID matches the configured admin UID.

## Burned credential

`ADMIN_PW = "teodor2026"` was present in the repository until commit [see git log].
It is now removed. **If you used `teodor2026` as a password anywhere else, rotate it.**

Firebase Auth password for the admin account should be changed in the Firebase Console
if it was ever set to the same value.

## Firebase RTDB rules

Rules are in `database.rules.json`. Deploy with:

```
firebase deploy --only database
```

Key constraints:
- `settings/` — admin-only read and write (Firebase Auth UID check)
- `signups/` — append-only, admin-only read, validated fields
- `reports/` — append-only, admin-only read, max 500 chars, city validated
- `pixels/` — append-only, hex color regex validated
- `votes/` — public read/write, numeric only
- `activity/`, `pledges/`, `checkins/`, `bookings/` — append-only, city field validated

## GDPR

- No identifiable faces in photos (especially minors).
- Email addresses stored in `signups/` are readable only by admin.

## What this repo does NOT contain

- Firebase admin SDK service account keys
- Mapillary API tokens (use `.env` locally, never commit)
- Any hardcoded passwords
