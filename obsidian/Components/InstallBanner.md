---
tags: [component, pwa]
symbol: InstallBanner
line: 887
---

# InstallBanner

`function InstallBanner({ ... })` — `index.html:887`. Promotes PWA
install. Class `.install-banner`.

## Behavior

- Listens for the `beforeinstallprompt` event, stashes it, and shows a
  banner with an install button.
- `dismiss()` (line 916) hides it and persists dismissal to
  `localStorage` so it doesn't nag.

## Related

- [[Files/manifest.json]] defines what gets installed.
- [[Components/Onboarding]] is the other first-run surface.
