# 24h ATTACK PLAN — From Grey to Play @ Astra Hack

## Context
Mai sunt ~10 h până la pitch. Arena (10 planuri, 3 jurați) + Council (verdict: aprobat cu condiții) au ales: totul se construiește în jurul momentului demo — juriul scanează QR-ul de pe slide 1, ajunge DIRECT în sesizare, trimite în ~30 s FĂRĂ cont, vede fișa terenului cu responsabil + ceas de 30 de zile. Verificat în cod: `QuickReportModal` (index.html ~l.15621) există deja (7 categorii, poză, GPS, ciornă), dar cere login la trimitere (`if (!firebaseUser) { login(); return; }`); regulile Firebase permit deja crearea fără cont în `reports/` și `activity/`. Destinatarul email din `LetterModal` e gol pentru TGM (~l.11375). Plan complet: `docs/PLAN_ASTRA_HACK.md`. Teste pe stradă: artifact https://claude.ai/artifact/VHuaYmK1WtMKuLTf6Mrh34 (`docs/teste-f2g.html`).

Munca se împarte în **2 sesiuni Claude simultane**, pe zone separate din `index.html`, ca să nu se calce.

## Priorități (P0 nu se taie niciodată)
| P | Ce | Sesiune |
|---|---|---|
| P0 | Sesizare fără cont + anti-spam + `#raporteaza` deschide sesizarea | A |
| P0 | Onboarding sărit pe `#raporteaza`; efecte grele oprite pe telefon | B |
| P1 | Teren cel mai apropiat preselectat; text AI pliat; ecran final + link WhatsApp | A |
| P1 | Buton mare „Raportează” pe primul ecran; hamburger 44 px + aria-label; contrast hero | B |
| P2 | Fișa terenului: Administrator + ceas 30 zile + istoric + „fără răspuns înregistrat” | A |
| P2 | Email oficial: destinatar reparat, text cu link spre fișă | A |
| P3 (se taie primul) | Bara de jos (Hartă · Raportează · Terenuri · Eu) + ghid „Adaugă pe ecran” | B |

## Orar (H0 = acum)
| Ora | Sesiunea A (flux) | Sesiunea B (coajă mobilă) | Oameni | Merge (Teo) |
|---|---|---|---|---|
| H0–1 | P0 A | P0 B | 15 teste pe stradă (artifact), 5 fiecare | B la ~H1 |
| H1–2 | P1 A | P1 B | teste continuă | A la ~H2 |
| H2–4:30 | P2 fișa | P3 bara de jos | Teo trimite 3 rânduri după fiecare rundă | B la ~H4 |
| H4:30–6 | P2 email | reparații din teste | Teo: o sesizare reală trimisă azi + captură; Drăgan: 5 emailuri sponsori | A la ~H6 |
| H6–7:30 | reparații din teste | reparații din teste | slide-uri, video rezervă 40 s | ultimul la H7:30 |
| H8:15 | — | — | spam-test (3 la rând) + QR pe 3 telefoane străine | — |
| **H8:30** | **ÎNGHEȚARE** | **ÎNGHEȚARE** | repetiții | nimic după |

## Reguli comune pentru ambele sesiuni
- Branch-uri separate, din `claude/stoic-bohr-tf5z2q`; PR draft către `claude/start-building-BQQ1q` (branch-ul live). Teo apasă Merge. Fără push direct pe branch-ul live.
- Înainte de fiecare PR: `node tools/predeploy-check.mjs` + `node tools/smoke.mjs` verzi. Niciodată `--no-verify`, niciodată ghilimele tipografice în JS.
- Stil: `React.createElement`, fără JSX. Stringuri noi în `T.ro`, `T.en`, `T.hu` (HU cu `// TODO: HU review`).
- NU editați `CLAUDE.md` (conflicte). Fiecare sesiune își scrie jurnalul în `docs/PROGRESS_A.md` / `docs/PROGRESS_B.md`.
- Doar sesiunea B schimbă `sw.js` (cache → `g2p-v12`). Fără reguli Firebase noi.
- Contractul dintre sesiuni: **`location.hash = "raporteaza"`** = „deschide sesizarea”. A ascultă hash-ul și deschide `QuickReportModal`; B doar setează hash-ul din buton/bara de jos și nu arată onboarding când hash-ul e `#raporteaza`.

## Verificare finală (H8:15)
1. Telefon curat (fereastră privată), scanezi QR → `fromgreytoplay.netlify.app/#raporteaza` → formular, fără onboarding, fără login.
2. Sesizare trimisă în < 30 s; ecran final cu „Termen legal: 30 de zile” + share.
3. 3 sesizări la rând → a treia blocată de limită; niciuna în ticker (`demo:true`).
4. Fișa terenului: Administrator, ceas, istoric. Email: destinatar corect.
5. iPhone + Android ieftin pe date mobile. `smoke.mjs` verde pe live.

---

## HANDOFF A — „Fluxul sesizării” (lipește în sesiunea 1)

```
Sunt Teo. Tu ești Claudiu. Lucrăm la From Grey to Play (F2G), repo teodorcimpan12-cyber/fromgraytoplay.
Mai sunt ~10 ore până la pitch la Astra Hack. Altă sesiune Claude (B) lucrează în paralel la coaja mobilă.
Citește întâi: CLAUDE.md, docs/PLAN_ASTRA_HACK.md și secțiunea „Reguli comune” de mai jos.

Branch: claude/astra-flux, pornit din origin/claude/stoic-bohr-tf5z2q.
PR draft către claude/start-building-BQQ1q după fiecare bloc. Eu apăs Merge.

ZONA TA în index.html (nu atinge altceva): QuickReportModal (~l.15621) și REPORT_CATS (~l.15603),
listener nou pentru hash-ul #raporteaza (lângă handler-ele de hash ~l.18142–18379, doar adaugi),
filtrul demo din ActivityTicker / feed-ul activity/, CourtDetail (~l.10124) — doar un bloc nou,
LetterModal (~l.11296), LettersTracker (~l.12690) / CITY_REQUESTS (~l.16750) doar refolosite.
NU atinge: navbar, Onboarding, Home/Hero3D, CSS-ul de layout, sw.js (le face sesiunea B).

P0 (H0–H1, apoi PR #1):
1. Scoate condiția de login la trimitere în QuickReportModal (`if (!firebaseUser) { login(); return; }`).
   Regulile Firebase permit deja crearea fără cont în reports/ și activity/ — NU publica reguli noi.
   Fără cont: uid lipsește, userName = anonName(""). Contul se oferă DUPĂ trimitere („salvează-ți sesizările”).
2. Anti-spam în client: max 2 sesizări / 10 min / telefon (localStorage, getVoterKey()), mesaj clar când e blocat.
3. Sesizările venite din #raporteaza primesc `demo: true` (și în activity/). ActivityTicker și feed-ul NU arată `demo:true`.
4. `#raporteaza` deschide QuickReportModal (din orice pagină). Asta e contractul cu sesiunea B.
   Atenție (verificat): openReport() (~l.15605) merge doar unde e montat QuickReportFAB (Home l.9792, Reports l.16891).
   Fă un component nou ReportHashListener (definit în zona ta) și montează-l cu O SINGURĂ linie în App,
   lângă AmbientLight (~l.18496) — e singura linie din App pe care o atingi. În pageFromHash (~l.2873)
   mapează "raporteaza" → "home". După deschidere curăță hash-ul cu history.replaceState.
   Filtrul demo: helper realActivity(a) lângă activityCity (~l.2840), aplicat în ActivityTicker (~l.9046,
   o singură linie) și ActivityFeed (~l.11434).
P1 (H1–H2, PR #2):
5. Terenul cel mai apropiat e preselectat automat (GPS cerut la deschidere, refuzat → lista/harta ca acum).
6. Textul lung despre AI / Court Doctor se pliază sub „Detalii”.
7. Ecran final (nu doar toast): „Sesizare creată. Termen legal de răspuns: 30 de zile.” + buton Share
   (navigator.share, fallback copiere link `#court-{id}`) + „Vezi fișa terenului”.
P2 (H2–H6, PR #3 și #4):
8. Fișa terenului în CourtDetail, bloc nou „Cine răspunde”: Administrator (Primărie / Școală / Privat / Necunoscut;
   implicit Necunoscut, nu inventa), ceasul de 30 de zile refolosind logica din LettersTracker/CITY_REQUESTS,
   pornit DOAR de la o trimitere reală (reports/*/cityHall.sentAt), istoricul sesizărilor terenului,
   formularea „fără răspuns înregistrat” (nu „vinovat”). Orice exemplu de „întârziat” = eticheta EXEMPLU.
   Pe fișe: cererile reale TGM 51941/04.11.2026 și Sibiu 89234/03.11.2026, răspuns până la 25.11.2026.
9. LetterModal: destinatarul e gol pentru TGM (~l.11375). Folosește O SINGURĂ adresă; există două în cod
   (de fapt trei: CITY_HALL.mail = primaria@tirgumures.ro, CITY_HALL_EMAIL = infopublic@tirgumures.ro,
   HelpPage l.13953 = primar@tirgumures.ro) — întreabă-mă care, nu ghici, și unifică-le.
   Șablonul TGM din buildLetter() (~l.11309) conține cifre interzise („5.000.000 lei”) — scoate-le,
   folosește doar cifrele cu sursă din docs/PLAN_ASTRA_HACK.md.
   Emailul conține link spre fișă, categoria, data, poza dacă există. Fallback: „Copiază textul”.

Reguli: React.createElement, fără JSX; stringuri în T.ro/T.en/T.hu (HU cu // TODO: HU review);
node tools/predeploy-check.mjs + node tools/smoke.mjs verzi înainte de fiecare PR; niciodată --no-verify;
fără ghilimele tipografice în JS; nu edita CLAUDE.md (jurnal în docs/PROGRESS_A.md); nu atinge sw.js.
Fără cifre inventate. Înghețare la H8:30. Pune-mi 5 întrebări cu bife (AskUserQuestion) înainte să începi, nu 20 — n-avem timp.
```

## HANDOFF B — „Coaja mobilă” (lipește în sesiunea 2)

```
Sunt Teo. Tu ești Claudiu. Lucrăm la From Grey to Play (F2G), repo teodorcimpan12-cyber/fromgraytoplay.
Mai sunt ~10 ore până la pitch la Astra Hack. 90% din utilizatori sunt pe telefon. Juriul scanează un QR
și trebuie să ajungă direct în sesizare. Altă sesiune Claude (A) lucrează în paralel la fluxul sesizării.
Citește întâi: CLAUDE.md, docs/PLAN_ASTRA_HACK.md. Folosește skill-urile mobile-native, choreograph, web-design-guidelines.

Branch: claude/astra-shell, pornit din origin/claude/stoic-bohr-tf5z2q.
PR draft către claude/start-building-BQQ1q după fiecare bloc. Eu apăs Merge. PR-ul tău P0 intră PRIMUL.

ZONA TA în index.html (nu atinge altceva): Onboarding (~l.6867), navbar + hamburger (~l.7300–7400),
Home/Hero3D/LetterReveal/particule/aurora/ActivityTicker (~l.9000–9800, doar gating + layout),
layout-ul App (unde se randează nav/main/footer), un bloc CSS NOU la finalul <style>-ului principal
numit „Astra mobile shell”, sw.js (cache → g2p-v12). Noile :hover doar în @media(hover:hover) and (pointer:fine).
NU atinge: QuickReportModal, CourtDetail, LetterModal, LettersTracker (le face sesiunea A).

Contract cu sesiunea A: `location.hash = "raporteaza"` deschide sesizarea (A implementează listener-ul).
Tu doar setezi hash-ul din butoane.

P0 (H0–H1, PR #1, intră primul):
1. Onboarding NU apare când location.hash === "#raporteaza" (și nici nu se marchează ca văzut).
   Verificat: App îl arată ÎNAINTEA oricărei pagini (state ~l.18154 din localStorage g2p_ob, return ~l.18441).
   Nu atinge linia cu ReportHashListener din App (~l.18496, o adaugă sesiunea A) și nici ActivityTicker
   l.9046 (filtrul demo e al lui A); tu doar oprești animația ticker-ului din CSS.
   Nu există helper de telefon: fă unul mic (ex. isPhone() = matchMedia("(max-width:600px), (pointer:coarse)")).
   Hero3D (~l.8927, montat în HomePage ~l.9754) încarcă three.js mereu: pe telefon nu-l mai monta deloc.
   smoke.mjs dă click pe „Treci peste/Skip” la onboarding (~l.99): nu schimba textul butonului.
2. Pe telefon (≤600px sau pointer:coarse) se opresc: Hero3D (canvas 3D), particulele, aurora (blur 70px),
   ticker-ul infinit (sau pauză la atingere). Fallback static curat. Respectă prefers-reduced-motion și flags.effects.
P1 (H1–H2, PR #2):
3. Buton mare „Raportează o problemă” pe primul ecran al Home, vizibil fără scroll pe 375 px → location.hash = "raporteaza".
4. Hamburger: aria-label + țintă 44 px. Butonul admin (scut) ascuns pe mobil pentru non-admin.
5. Contrastul textului din hero (#9CA3AF pe fundal închis → mai deschis, ex. #C7CBD1).
P3 (H2–H5, PR #3 — se taie primul dacă întârzie):
6. Bara de jos ≤860px: Hartă · Raportează · Terenuri · Eu, cu env(safe-area-inset-bottom), ținte ≥44 px,
   activă după pagina curentă; „Raportează” setează hash-ul. Conținutul paginii nu e acoperit de bară.
7. Ghid scurt „Adaugă pe ecranul principal” (iOS Safari: Share → Add to Home Screen; Android: prompt nativ) — doar dacă e timp.
Apoi: reparații din testele pe stradă (Teo îți trimite 3 rânduri după fiecare rundă).

Reguli: React.createElement, fără JSX; stringuri în T.ro/T.en/T.hu (HU cu // TODO: HU review);
node tools/predeploy-check.mjs + node tools/smoke.mjs verzi înainte de fiecare PR; niciodată --no-verify;
fără ghilimele tipografice în JS; nu edita CLAUDE.md (jurnal în docs/PROGRESS_B.md).
Testează pe 375 px cu Playwright (devices['iPhone 13'] și un Android) și arată-mi capturi.
Înghețare la H8:30. Pune-mi 5 întrebări cu bife (AskUserQuestion) înainte să începi, nu 20 — n-avem timp.
```

## După aprobare (în sesiunea asta)
1. Commit + push pe `claude/stoic-bohr-tf5z2q`: `docs/teste-f2g.html`, `docs/PLAN_ASTRA_HACK.md`, plus planul acesta ca `docs/ATTACK_PLAN_24H.md`, ca sesiunile A și B să le găsească.
2. PR draft pentru branch (skill-uri + documente), abonare la activitatea PR-ului.
3. Sesiunea asta rămâne „dispecer”: citește rezultatele din artifactul de teste și le trimite ca 3 rânduri sesiunilor A/B.
