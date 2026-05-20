---
tags: [file, root, rules]
file: CLAUDE.md
---

# `CLAUDE.md`

Project rules loaded into every Claude session. Anchors the agent's
context per the [[00 Index|context-engineering principle]] that a
high-leverage rules file beats trying to re-explain conventions every
session.

## Sections

1. **Architecture** — single-file deploy, no bundler at root,
   Vite scaffold under `vite-next/`. See [[Architecture]].
2. **Tech baseline** — React 18 UMD, Firebase v9 compat, Leaflet 1.9.4.
3. **Design tokens** — `--dark`, `--green`, `--coral`, `--teal`, `--red`.
   See [[Design System]].
4. **Firebase schema** — paths and field shapes. See [[Firebase Schema]].
5. **Languages** — `T.ro / T.en / T.hu`, cycle order, HU draft warning.
   See [[i18n]].
6. **Conventions** — `React.createElement`, toast pattern,
   `useFirebase("path")`, don't touch `vite-next/`. See [[Conventions]].
7. **Adding a feature — checklist** — i18n, activity, classes, mobile.
8. **What we've shipped this session** — running ledger; mirror in
   [[Session Log]] when committing.
9. **Roadmap priorities** — photo wall, letter generator, 3D hero.
   See [[Roadmap]].

## When to edit this file

- A new convention emerges that's not yet documented.
- The tech stack changes (e.g. when the [[Architecture#Why both code paths exist|Vite migration]] starts).
- A schema or token changes — keep this file in sync with the topic
  notes here.

Do **not** stuff one-off task descriptions or session-specific TODOs
into `CLAUDE.md`. Those belong in [[Session Log]] or in the brief.
