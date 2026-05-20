---
tags: [helper, i18n]
symbol: T
line: 184
---

# T dictionary

`const T = { ro: {...}, en: {...}, hu: {...} }` — `index.html:184`.

Flat string maps per language. Accessed as `T[lang].key`; `useApp()`
exposes the resolved `t = T[lang]` so components write `t.courts`,
`t.success`, etc.

See the full discussion in [[i18n]]. Key rules:

- Add every new key to **all three** languages.
- Mark uncertain HU with `// TODO: HU review`.
- Long prose goes in `ESSAY` / `TIMELINE`, not here.

## Watch out

Several components bypass `T` with inline `lang === "ro" ? ... : ...`
ternaries (e.g. [[Pages/HomePage]], [[Pages/PetitionPage]]) — these are
**ro/en only** and silently fall back to English-ish for `hu`. Migrating
them into `T` is low-effort, high-value cleanup.
