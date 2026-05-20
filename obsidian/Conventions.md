---
tags: [topic, conventions, style]
---

# Conventions

## JSX is not allowed at root

The shipped `index.html` is the build output. New code must be written
as `React.createElement(tag, props, ...children)` calls — there is no
Babel or TS pipeline.

```js
// ✅ Yes
React.createElement("div", { className: "card" },
  React.createElement("h3", null, "Title"),
  React.createElement("p",  null, "Body")
);

// ❌ No (would not run)
<div className="card"><h3>Title</h3><p>Body</p></div>
```

If you really want to write JSX, draft it in a sketch file, transpile
locally (`npx esbuild --loader=jsx`), and paste the output.

## Component shape

```js
function MyThing() {
  const { lang, toast } = useApp();
  const data = useFirebase("path");
  // returns React.createElement(...)
}
```

- Functions, not classes.
- Read shared state via `useApp()`.
- Read Firebase via [[Helpers/useFirebase]].
- Show transient success/error via `useApp().toast("message")`.

## Style hooks

Prefer existing classes from [[Design System]]: `card`, `btn`, `badge`,
`grid`, `tabs`, `modal`, `progress-bar`. Avoid inline styles for
anything beyond one-off positioning.

## Mobile first

Layout breakpoint is **860px** — nav collapses below it. Components
should look right at 360px width minimum.

## Writes always log activity

If a write changes user-visible state, also call:
```js
logActivity("type", userName, courtId)
```
so [[Components/ActivityFeed]] picks it up. Failing to do this is the
most common bug pattern in this codebase.

## Don't touch `vite-next/`

Unless the user says "migrate." [[Architecture#Why both code paths exist]].

## Don't add bundlers at root

No `package.json`, `node_modules`, or build step at the repo root. The
deploy surface is a single file.

## Translation discipline

Per [[i18n]]:
1. New string → add to `T.ro`, `T.en`, `T.hu`.
2. Uncertain HU? `// TODO: HU review` next to it.
3. Long-form prose → `ESSAY` / `TIMELINE`, not `T`.

## Privacy patterns

- Names shown in [[Components/ActivityFeed]] are anonymized via
  [[Helpers/anonName]] → "Andrei P.".
- Don't write the raw email to `activity/` — only to `signups/`.

## Activity vs. raw data

`activity/` is **append-only display**. It should be capped (~50 entries)
and not relied on as the source of truth for counts. Always use
`useFirebase("votes")` for totals, not by counting activity events.
