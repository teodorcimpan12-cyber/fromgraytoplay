# PROGRESS A — fluxul sesizării (branch claude/astra-flux)

## PR #1 — P0 calea demo
- `#raporteaza` deschide QuickReportModal din orice pagină: `ReportHashListener` montat în App lângă AmbientLight; hash-ul se curăță cu `history.replaceState`. `pageFromHash("raporteaza")` → home.
- Fără login obligatoriu la trimitere. Fără cont: fără `uid`, `userName = anonName("")`.
- Anti-spam client: max 2 sesizări / 10 min / dispozitiv (`localStorage g2p_rq_ts`, legat de `getVoterKey()`), toast cu minutele rămase.
- Sesizările din `#raporteaza` primesc `demo:true` în `reports/` și `activity/`; `realActivity()` le scoate din ActivityTicker și ActivityFeed.
- Decizii Teo: adresa TGM unică = primaria@tirgumures.ro; emailul demo merge tot la adresa oficială (mailto, omul apasă Send); demo:true doar pe #raporteaza; P1+P2 într-un PR.
- Verificat: predeploy-check ✅, smoke ✅, test headless: `#about` → `#raporteaza` deschide `.rq`, hash gol.

## PR #2 — P1 + P2
- QuickReportModal: GPS cerut la deschidere; terenul cel mai apropiat (≤ 2 km) e preselectat și sare la pasul 2, cu „nu e ăsta?”. GPS refuzat → lista ca înainte, fără toast.
- Ecran final: „Sesizare creată. Termen legal de răspuns: 30 de zile.” + Share (`navigator.share`, fallback copiere link `#court-{id}`) + „Vezi fișa terenului” + „Salvează-ți sesizările (cont)” (doar fără cont).
- AiPhotoHint: textul lung de consimțământ e sub „Detalii”.
- CourtDetail → `CourtResponder` („Cine răspunde”) după CourtSourcesCard: Administrator (`c.admin`: cityhall/school/private, altfel Necunoscut), ceas 30 zile DOAR din `reports/*/cityHall.sentAt`, „fără răspuns înregistrat” după termen, cererile 544 reale (TGM 51941/04.11.2026, Sibiu 89234/03.11.2026, răspuns până la 25.11.2026), istoric sesizări (etichetă „demo”).
- `deadlineState()` comun pentru LettersTracker, RequestTracker și fișă.
- LetterModal: destinatar `CITY_HALL.mail`; scoase „5.000.000 lei”, „0% renovate”, SIDU; puse cifrele CSM 2692/03.11.2026 + link spre fișă; buton „Copiază textul”.
- Adresa TGM unificată (CITY_HALL_EMAIL, HelpPage, mailto 544) → primaria@tirgumures.ro.
- Verificat: predeploy ✅, smoke ✅, headless: fișa c1 „Administrator: Necunoscut”; GPS lângă c1 → c1 preselectat; ecranul final apare (Firebase stubuit, nimic scris live).
- În afara zonei mele: Home ~l.9137 încă are „5.000.000 lei promise. Zero renovate.” (cifră interzisă în plan).
