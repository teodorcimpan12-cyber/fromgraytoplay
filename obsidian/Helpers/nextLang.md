---
tags: [helper, i18n]
symbol: nextLang
line: 571
---

# nextLang

`function nextLang(l)` — `index.html:571`. Cycles language.

```js
function nextLang(l) {
  return l === "ro" ? "en" : l === "en" ? "hu" : "ro";
}
```

Cycle: `ro → en → hu → ro`. Called from the [[Components/Navbar]]
language button. The button label shows the **next** language code. See
[[i18n]].
