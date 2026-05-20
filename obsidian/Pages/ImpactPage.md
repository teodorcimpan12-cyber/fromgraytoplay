---
tags: [page]
symbol: ImpactPage
line: 2580
---

# ImpactPage

`function ImpactPage()` — `index.html:2580`. Route: `impact`.
A scroll of data-viz / calculator sections making the civic argument.

## Sections (all in [[Components/Impact Calculators]])

| Symbol | Line | What it does |
|---|---|---|
| `ImpactCalc` | 2619 | Headline impact numbers |
| `CityComp` | 2672 | Compares Târgu Mureș to peer cities |
| `BudgetViz` | 2695 | Renovation budget breakdown viz |
| `CarbonCalc` | 2768 | Carbon / travel savings estimate |
| `HealthCalc` | 2821 | Physical-activity health benefit |
| `MentalSec` | 2874 | Mental-health / social benefit section |
| `TimelineSec` | 2923 | Renders [[Helpers/TIMELINE]] beats |

## Notes

- These are persuasion tools for the dossier — the brief calls this
  turning the petition into "a civic dataset."
- `TimelineSec` consumes the trilingual `TIMELINE` array ([[i18n]]).
- Good candidate to feed the auto-dossier PDF export (#2.3) — most of
  the numbers a council packet needs are already computed here.
