---
tags: [helper, privacy]
symbol: anonName
line: 577
---

# anonName

`function anonName(s)` — `index.html:577`. Privacy strip for display
names → "Andrei P." form (first name + last initial).

## Used by

[[Helpers/logActivity]] before writing to `activity/`, so the
[[Components/ActivityFeed]] never shows full names or emails.

## Convention

Any new feature that surfaces a user's name publicly should run it
through `anonName` first ([[Conventions#Privacy patterns]]).
