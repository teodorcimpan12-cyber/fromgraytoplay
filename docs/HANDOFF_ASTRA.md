# Mini handoff: what's left for Astra Hack (6–7 Nov 2026)

Written by Claudiu, 6 Nov evening. Details: /arena verdict in `docs/HANDOFF_BUSINESS_PLAN.md`.

## Must do before the pitch
1. **Merge PR #31** (say "merge") — honesty fixes on court pages, Stadionul Independența, onboarding skip on QR links.
   After merging, no more deploys within 2 h of the pitch.
2. **Ask the organizers in person**: are pre-built projects allowed? Pitch length and time? Judging criteria?
3. **Validation**: 5–10 people outside the team (Sibiu ideally) try the report flow on their phone.
   Write what they said, word for word, in `docs/VALIDATION.md` (currently 0 rows).
4. **Fix the pitch (`docs/PITCH.md`)**:
   - remove "5.000.000 lei promiși" (no source — it's a widget default), "Ana, 15" (invented), "doi dintre noi" (it was 4 raters);
   - open with the SPSA Sibiu reply nr. 4541: investments only at 4 big bases, no amounts, no court condition, no neighbourhood court;
   - TGM numbers said as TGM: 13/30 degraded, centre 11% vs neighbourhoods 57%;
   - say it honestly: built in Târgu Mureș over ~2 months with AI; these 24 h were about Sibiu;
   - satellite story as "what we learned": 4 raters, weak agreement, images only to 2022 → residents verify;
   - Sibiu now has **36** courts on the map.
5. **`docs/PROGRESS.md`**: honest "before" vs "in 24 h" log. Fix `docs/SPEC_6NOV.md` (says "nothing implemented", but those features went live on 29 Oct).
6. **Demo**: one path only — map → court → Raportează / Verifică → letter. Turn effects off in admin. No live AI Court Doctor (up to 40 s). No Mayor Mode, no hoop game.
   Record a backup video, test on venue Wi-Fi and on a phone hotspot.
7. **Q&A sheet**: pre-built? AI? who pays ("not known yet, testing")? Obor 12.7M lei? who owns the courts? kappa? photos of minors?

## Nice to have
- 2–3 Sibiu courts near the venue verified with photos through the app (before dark, ~17:00).
- Ask 2–3 mentors "who would pay for this?" and quote them.

## Don't
- Build new features, use unsourced numbers (5M lei, Cluj 26.5M), say "City Hall will pay" or "Sibiu neglects courts", push with `--no-verify`.
