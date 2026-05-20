---
tags: [component]
symbol: Onboarding
line: 834
---

# Onboarding

`function Onboarding({ ... })` — `index.html:834`. Full-screen first-run
intro. Class `.onboarding` + dot indicators `.ob-dots`.

## Behavior

- Multi-step slides (dots show progress).
- Shown on first visit; dismissal persisted to `localStorage` so it
  doesn't reappear.
- Sits above everything (`z-index:500`).

## Notes

- Keep copy trilingual via [[Helpers/T dictionary]] when editing.
- If you add steps, update the `.ob-dots` count.
