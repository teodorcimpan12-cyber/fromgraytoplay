---
tags: [component]
symbol: Toast
line: 820
---

# Toast

`function Toast({ ... })` — `index.html:820`. Bottom-center transient
message. Class `.toast` ([[Design System]]).

## Usage

Don't render directly — call the helper from context:

```js
const { toast } = useApp();
toast("Saved!");      // or toast(t.success)
```

`App` owns the toast state and renders one `Toast` at a time; the helper
sets the message and auto-clears after a short delay.

## Convention

Use for **transient** success/error only ([[Conventions]]). For
persistent state (e.g. "you already voted"), use inline UI, not a toast.
