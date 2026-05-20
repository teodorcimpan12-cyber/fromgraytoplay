---
tags: [page]
symbol: HelpPage
line: 2964
---

# HelpPage

`function HelpPage()` — `index.html:2964`. Route: `help`.

## What it does

- Ways to contribute: sign, report, volunteer.
- Volunteer sign-up form; `subVol` (line 2976) writes the volunteer
  record to Firebase and toasts success.

## Data

- Writes a volunteer entry (to `signups` / `volunteers`-style path) on
  submit. Confirm exact path before relying on it — see code at 2976.
- Should also `logActivity(...)` per [[Conventions]] if it doesn't yet.

## Notes

- Quick-action card on [[Pages/HomePage]] deep-links here.
