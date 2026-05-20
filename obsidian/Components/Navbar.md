---
tags: [component, nav]
symbol: Navbar
line: 933
---

# Navbar

`function Navbar()` — `index.html:933`. Sticky top nav. Classes
`.navbar`, `.nav-inner`, `.nav-links`.

## Behavior

- Logo (green bar + wordmark) → home.
- Desktop link row; collapses to a hamburger + `.mobile-menu` below
  **860px** ([[Conventions#Mobile first]]).
- `NL` (line 967) is the inner nav-link component; active link gets the
  `active` class when `page === k`.
- Language button cycles via [[Helpers/nextLang]]; theme toggle flips
  dark/light.

## Data

- `useApp()` → `page`, `setPage`, `lang`, `setLang`, `theme`, `setTheme`,
  `user`.

## Notes

- Adding a page = add an entry here **and** a case in `App`'s page
  switch. See [[Files/index.html]].
