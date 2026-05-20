---
tags: [helper, admin, security]
symbol: ADMIN_PW
line: 817
---

# ADMIN_PW

`const ADMIN_PW = "teodor2026"` — `index.html:817`. The admin gate
password, checked client-side by [[Pages/AdminLogin]].

## ⚠ Not a security boundary

- It ships in the public JS bundle — anyone can read it.
- The Firebase config is public and rules are permissive, so the data is
  writable regardless of this gate.

Before any press / public launch: remove this, switch the admin area to
Firebase Auth with a role check, and tighten RTDB rules. See
[[Firebase Schema#Security]] and [[Roadmap]].
