---
tags: [topic, roadmap]
---

# Roadmap

The full source: `FROM_GREY_TO_PLAY_ROADMAP.md` and `FROM_GREY_TO_PLAY_BUILD_BRIEF.md`
in the uploads folder.

## Currently shipped

- Trilingual i18n (ro/en/hu) — see [[i18n]]
- Petition with `flip / mural / both` vote — [[Pages/PetitionPage]]
- 8 documented courts with map — [[Pages/CourtsPage]]
- Check-in flow — [[Pages/CourtDetail]]
- Report modal — [[Components/Modals]]
- Booking modal — [[Components/Modals]]
- Letter to council modal — [[Components/Modals]] ⚠ partial
- Community: forum, events, gallery, teams, leaderboard tabs — [[Pages/CommunityPage]]
- Impact calculators — [[Pages/ImpactPage]]
- Profile + cert generation — [[Pages/ProfilePage]]
- Admin panel — [[Pages/AdminPanel]]
- Court weather chip — [[Helpers/getCourtWeather]]
- Live activity feed — [[Components/ActivityFeed]]
- PWA install banner — [[Components/InstallBanner]]
- Onboarding flow — [[Components/Onboarding]]
- Dark/light theme — [[Design System]]

## Next, highest civic-value

Per the brief, priority order for the contest dossier:

1. **Photo evidence wall** (#2.1, M, civic) — Firebase Storage, GPS stamps.
   Turn 4 photos into 80 photos from 30 residents.
2. **Letter-to-council generator** (#2.2, S, civic) — already partially
   in `LetterModal`. Polish, add PDF export with jsPDF, prefill mailto.
3. **Auto-dossier export** (#2.3, M) — jsPDF + html2canvas of the live
   map. One-button hand-off to the mayor.
4. **3D hero scene** (#4.1, L, wow) — Three.js court that transitions
   grey → painted on scroll. Build in CodePen first.
5. **Hungarian native-speaker review** (#2.5, S) — strings are drafts.

## Mid-term

- **Background sync queue** (#5.5) — offline petition submits.
- **Court ratings** (#3.1) — surface/lighting/equipment/safety,
  radar chart on detail page.
- **Adopt-a-court** (#3.3) — weekly check-in commitment.
- **Open data export** (#2.4) — GeoJSON + CSV public endpoint.

## Long-term

- **Vite migration** (#5.6) — only after Tier 2 features stabilize.
  Scaffold is parked in `vite-next/`.
- **Lighthouse 100 audit** (#5.3).
- **AR court scanner** (#7) — GPS + camera overlay.

## Don't yet

- Mass push notifications.
- Heavy 3D on mobile until perf budget is validated.
- Auth gating before tightening RTDB rules ([[Firebase Schema]]).

## Decision points to revisit

- Stay single-file vs migrate? Stay until Tier 2 is done.
- Three.js vs SVG morph for the "grey to play" hero? SVG is the safe
  fallback (#4.4).
- Photo uploads: Firebase Storage vs a third-party? Storage costs
  vs free quota — measure with first 100 photos.
