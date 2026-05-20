---
tags: [topic, design, tokens]
---

# Design System

## Color tokens

| Token | Value | Usage |
|---|---|---|
| `--dark` | `#1A1A2E` | App background (dark theme), hero base |
| `--darkCard` | `#16213E` | Card surface (dark theme) |
| `--green` | `#10B981` | **Primary.** Sign, sport, active, "play" |
| `--coral` | `#F97316` | Mural, in-progress, "warm" accent |
| `--teal` | `#0D9488` | "Both", secondary accent, link color |
| `--red` | `#DC2626` | Degraded, danger, broken |
| `--grey` | `#6B7280` | Secondary text |
| `--darkGrey` | `#374151` | Primary text on light bg |
| `--light` | `#F8FAFC` | App background (light theme) |
| `--lightGrey` | `#D1D5DB` | Borders, dividers |
| `--white` | `#FFFFFF` | Card surface (light theme) |

Theme is swapped via `[data-theme="dark"]` on `<html>` or `<body>`.

## Fonts

- **Headings**: Space Mono 700 (`font-family: 'Space Mono', monospace`).
- **Body**: Libre Franklin (300/400/500/600/700/900). Default size `1rem`,
  line-height `1.6`.
- Both loaded from Google Fonts via `<link>` in `<head>`.

## Spacing and radii

- Border radius standard: `12px` (`--radius`).
- Smaller (inputs, buttons): `6–10px`.
- Container width: `1100px` max, `1rem` horizontal padding.

## Class catalog (in `index.html`)

| Class | What it does |
|---|---|
| `.container` | Centered, max-width 1100px |
| `.btn` | Base button + size variants `.btn-sm`, `.btn-block` |
| `.btn-green` / `.btn-coral` / `.btn-outline` | Color variants |
| `.card` | Surface card with shadow + left border slot |
| `.card-accent` | `.card` with green left border |
| `.badge` | Pill label + color variants `.badge-{green,coral,red,teal}` |
| `.section` / `.section-title` / `.section-sub` | Section header pattern |
| `.grid` / `.grid-2` / `.grid-3` / `.grid-4` | Responsive grid templates |
| `.tabs` | Underline tab strip used in [[Pages/CommunityPage]] |
| `.modal-overlay` / `.modal` / `.modal-lg` | Modal scaffolding |
| `.toast` | Bottom-center transient message ([[Components/Toast]]) |
| `.progress-bar` / `.progress-fill` | Petition progress |
| `.stat-number` / `.stat-label` | Big numeric stats |
| `.petition-option` | The flip/mural/both selection chips |
| `.admin-*` | Dark admin panel theme |

## Petition color semantics

| Choice | Color | Where it comes from |
|---|---|---|
| `flip` | green `#10B981` | Renovation = our primary action |
| `mural` | coral `#F97316` | Painting = warm/creative |
| `both` | teal `#0D9488` | Combined = secondary blend |

Used in [[Pages/PetitionPage]]: the radio chips, the vote tallies, and
the result donut all share these.

## Weather palette (court condition)

Drives [[Helpers/getCourtWeather]]. Five buckets, with icons:

| Condition | Icon | Label | Color |
|---|---|---|---|
| ≥ 0.8 | ☀️ | Excellent | `#10B981` green |
| ≥ 0.6 | 🌤️ | Good | `#22C55E` green-2 |
| ≥ 0.4 | ⛅ | Okay | `#F59E0B` amber |
| ≥ 0.2 | 🌧️ | Poor | `#F97316` coral |
| < 0.2 | ⛈️ | Broken | `#DC2626` red |
