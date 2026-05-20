---
tags: [file, root, pwa]
file: manifest.json
---

# `manifest.json`

PWA web app manifest. Linked from `index.html` `<head>` via
`<link rel="manifest" href="/manifest.json">`.

## Key fields

- `name`: "From Grey to Play"
- `short_name`: "Grey2Play"
- `display`: `standalone` — installs without browser chrome
- `theme_color`: `#10B981` (green primary — see [[Design System]])
- `background_color`: `#1A1A2E` (dark)
- `lang`: `ro`
- `orientation`: `portrait-primary`
- `start_url`: `/`
- `categories`: `sports, social, government, lifestyle`

## Icons

References `/icons/icon-{72,96,128,144,152,192,384,512}.png`.
192 and 512 are duplicated with `purpose: "maskable"` for Android
adaptive icons. The actual PNGs must live at `/icons/*` on the
deployed server — they are not in this Git repo.

## Shortcuts

App icon long-press surfaces two quick actions:

| Shortcut | URL | Purpose |
|---|---|---|
| Votează petiția | `/#petition` | Jump to [[Pages/PetitionPage]] |
| Raportează teren | `/#courts` | Jump to [[Pages/CourtsPage]] |

When [[Components/Onboarding]] or [[Components/InstallBanner]] changes,
sanity-check the shortcut URLs still resolve to a visible page.

## When to edit

- New icon size required by a target platform.
- Renaming the project / `short_name`.
- Switching theme color (also update `<meta name="theme-color">` in
  `index.html`).
