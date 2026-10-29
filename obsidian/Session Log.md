---
tags: [topic, log, sessions]
---

# Session Log

A running ledger of what each Claude session shipped. Newest first.

## Session — 29 oct. 2026: stadioane, numere live, minge PBR, spec-ul Astra construit

> Branch `claude/cool-babbage-lacz7g`, PR #19 (draft, nu e live).

- Stadionul Ladislau Bölöni (c30, Str. Insulei): închis din anii 2010, „Degradat”, cu sursă. `stadium: true` pe c11/c29/c30 + sb8/sb21.
- Toate cifrele „35” / „34 din 35” calculate din date (`courtsPhrase`, `NBH_N`, `STADIUM_N`, `SAT_RECENT`).
- Hero 3D: `basketballMaterial()` (albedo + normal map din câmp de înălțime + roughness map), minge 0.10, inel ×1.15,
  `hoopPhysics()` (torus + panou, sub-pași, fără tunelare), `fitHits()` (zonă de prindere ≥ 30 px), plasă care se întinde.
- Demo: `SignupNudge` oprit în `?demo=`, mascota ridicată deasupra barei, `.action-card` lizibil în tema deschisă.
- [[Components/AiPhotoHint]] = AI Court Doctor: consimțământ, scor 1–5, probleme cu gravitate, reparații + cost; poze fără teren blochează trimiterea; 3/oră/dispozitiv.
- Scrisoarea v2 (`AiLetterModal`): OG 27/2002 sau Legea 544/2001, dovezi, poze în PDF, `letters/` + `LettersTracker` pe Impact.
- `VerifyFlow`, `verifyConsensus`, `sibiuMissions`, `CourtSourcesCard`: verificare în 60 s, consens din 2 dispozitive, misiuni din satelit.
- Open data: `condition_source` + `ai_score`.
- TODO: deploy reguli Firebase; eticheta comunității pe hartă (pop-up) încă nu; cifrele de registru per teren nu există încă.

## Session 3 — Vault generation

- Created this Obsidian vault under `obsidian/`.
- Documented every page, component, helper, and file in
  the live `index.html` plus the Vite scaffold.
- Applied [Context Engineering skill](https://github.com/addyosmani/agent-skills/tree/main/skills/context-engineering)
  guidance — hierarchical project map + per-file notes + wikilinks.

## Session 2 — HU + weather + activity feed

> Commits `1033b54` and `832c966`.

- Added `T.hu` dictionary alongside `T.ro` / `T.en`.
- Language cycle `ro → en → hu → ro`.
- Added [[Helpers/getCourtWeather]] helper.
- Added weather chip to court cards.
- Added [[Components/ActivityFeed]] to [[Pages/CommunityPage]].
- Wired activity writes from petition vote + court check-in.

## Session 1 — Vite scaffold

> Commit `3fdc1f1`.

- Initialized a Vite + React + TypeScript scaffold under (now) `vite-next/`.
- Mirrors live site structure: Home, Courts, CourtDetail, Petition,
  Community, Impact, Help, About.
- Firebase wired via env vars with offline fallback.
- Plain CSS with design tokens; no Tailwind.
- HU translations as JSON; flagged as draft.
- **Parked** — not the deploy surface. See [[Architecture#Why both code paths exist]].

## Conventions for new entries

When you finish a session, append a new heading at the top:

```markdown
## Session N — One-line summary

> Commits `abc1234`, `def5678` (if any).

- Bullet what shipped.
- Link to [[Pages/...]] / [[Components/...]] notes for anything new.
- Note any TODOs you punted on.
```

## 2026-10-29 (seara) — buton Rezervă mai aproape

- `CourtDetail`: butonul 📅 Rezervă a urcat lângă scorul de sănătate (clasa `.cd-book`, contur verde discret, se umple la hover); a fost scos din grila de acțiuni de jos, deci ecranul nu primește un element în plus. Tot sub flag-ul `settings/flags/booking`.
