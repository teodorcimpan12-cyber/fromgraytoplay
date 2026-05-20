---
tags: [page]
symbol: AboutPage
line: 3130
---

# AboutPage

`function AboutPage()` — `index.html:3130`. Route: `about`.

## What it does

- Project story / mission, author credit (Cîmpan Teodor, Târgu Mureș).
- Likely renders the `ESSAY` trilingual prose ([[i18n]]).
- Partner sign-up: `subPartner` (line 3142) writes a partner/contact
  record to Firebase.

## Notes

- Long-form prose belongs in `ESSAY.{ro,en,hu}`, not inline ternaries —
  verify when editing. See [[i18n]].
- Press-kit content (#2.6 in roadmap) could live here or as a new route.
