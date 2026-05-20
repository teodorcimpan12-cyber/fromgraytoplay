---
tags: [helper, data, i18n]
symbol: TIMELINE
line: 786
---

# TIMELINE

`const TIMELINE = [ {...}, ... ]` — `index.html:786`. Trilingual
historical beats rendered by `TimelineSec` ([[Components/Impact Calculators]]).

## Shape

```
[{ ro: { ... }, en: { ... }, hu: { ... } }, ...]
```

Each entry carries its own localized strings (date/title/body) so the
timeline renders fully in the active language. See [[i18n]].

## Notes

- HU entries are draft like the rest — flag uncertain ones.
- Long-form prose belongs here (and in `ESSAY`), not in
  [[Helpers/T dictionary]].
