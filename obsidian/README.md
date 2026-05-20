---
tags: [vault, readme]
---

# From Grey to Play — Project Vault

This is an Obsidian-friendly **project map** for `fromgraytoplay`. Open this
folder (`obsidian/`) as a vault.

Built using the [Context Engineering skill](https://github.com/addyosmani/agent-skills/tree/main/skills/context-engineering)
guidance: a hierarchical project summary that any agent (or human) can
read fast to orient themselves before editing code.

## How to read this vault

- **Start at [[00 Index]]** — top-down view of the project.
- **Tech rules and conventions** are in [[Architecture]], [[Conventions]],
  [[Design System]], [[Firebase Schema]], [[i18n]].
- **Per-file notes** live under `Files/`, `Pages/`, `Components/`,
  `Helpers/`, and `vite-next/`.
- **Wikilinks** (`[[Name]]`) connect notes. Hold Ctrl/Cmd and click in
  Obsidian to jump.
- **Tags** like `#page`, `#component`, `#helper`, `#firebase` let you
  filter from the search bar.

## Update discipline

When the codebase changes:

1. If a new file appears → add a note under the right subfolder.
2. If a file's responsibility changes → edit its note; don't append.
3. If a new top-level area appears → add a new section in [[00 Index]].

The vault is supposed to drift *less* than the code, not be a 1:1 copy.
Treat it like the rules file the context-engineering skill describes —
high-leverage context that lives longer than any single session.
