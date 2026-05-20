---
tags: [page, auth]
symbol: ProfilePage
line: 3351
---

# ProfilePage

`function ProfilePage()` — `index.html:3351`. Route: `profile`.

## What it does

- If **not** logged in: shows a login/register form (`auth`, line 3368).
- If logged in: shows points, badges, settings (theme + language
  toggles), logout, and a **certificate** download.

## "Auth" is client-side only

```js
auth():
  uid = "u_" + Date.now()
  user = { id, name, email, points:0, badges:["🌱"], reports:[], volunteer:false }
  db.ref("users/" + uid).set(user)
  db.ref("leaderboard/" + uid).set({ name, points:0 })
  localStorage.setItem("g2p_user", JSON.stringify(user))
```

- No password verification, no Firebase Auth — just a generated id
  persisted to `localStorage.g2p_user`.
- `logout()` clears state + localStorage.
- This is **not** a security boundary. See [[Firebase Schema#Security]].

## Certificate

`cert()` builds a plain-text volunteer certificate (ASCII border, name,
points, date) and triggers a `.txt` download via a Blob URL. Filename
`certificat_g2p.txt`.

## Settings exposed

- Theme toggle (`setTheme`) — persists to `localStorage.fgtp_theme`.
- Language (`setLang`) — see [[i18n]].

## Notes

- The fake auth seeds `users/` and `leaderboard/` ([[Firebase Schema]]).
- A real migration should swap this for Firebase Auth before any data
  hardening.
