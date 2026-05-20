---
tags: [component, dataviz]
symbols: [ImpactCalc, CityComp, BudgetViz, CarbonCalc, HealthCalc, MentalSec, TimelineSec]
---

# Impact Calculators

The data-viz sections rendered by [[Pages/ImpactPage]].

| Symbol | Line | What |
|---|---|---|
| `ImpactCalc` | 2619 | Headline impact numbers / interactive estimate |
| `CityComp` | 2672 | Târgu Mureș vs peer cities comparison |
| `BudgetViz` | 2695 | Renovation budget breakdown |
| `CarbonCalc` | 2768 | Carbon / travel savings |
| `HealthCalc` | 2821 | Physical-activity health benefit |
| `MentalSec` | 2874 | Mental-health / social cohesion section |
| `TimelineSec` | 2923 | Renders the trilingual [[Helpers/TIMELINE]] |

## Notes

- Mostly self-contained presentational components with local `useState`
  for slider inputs.
- These numbers are the raw material for the **auto-dossier PDF (#2.3)**
  — wire them into that export rather than recomputing.
- `TimelineSec` depends on `TIMELINE[i].{ro,en,hu}` ([[i18n]]).
