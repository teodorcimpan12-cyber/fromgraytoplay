---
tags: [page, admin]
symbol: AdminLogin
line: 3549
---

# AdminLogin

`function AdminLogin({ ... })` — `index.html:3549`. Gate in front of
[[Pages/AdminPanel]].

## What it does

- Password box; `go()` (line 3555) compares input against
  [[Helpers/ADMIN_PW]] (`"teodor2026"`).
- On match, reveals the admin panel (state flips in `App`).

## ⚠ Security

This is a **client-side** check only. The password lives in the shipped
JS and the Firebase config is public, so anyone can read/write data
regardless. Treat the admin gate as cosmetic. See
[[Firebase Schema#Security]].

Before press: replace with Firebase Auth + a role/claim check, and
tighten RTDB rules.
