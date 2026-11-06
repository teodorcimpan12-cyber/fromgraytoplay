# PROGRESS A — fluxul sesizării (branch claude/astra-flux)

## PR #1 — P0 calea demo
- `#raporteaza` deschide QuickReportModal din orice pagină: `ReportHashListener` montat în App lângă AmbientLight; hash-ul se curăță cu `history.replaceState`. `pageFromHash("raporteaza")` → home.
- Fără login obligatoriu la trimitere. Fără cont: fără `uid`, `userName = anonName("")`.
- Anti-spam client: max 2 sesizări / 10 min / dispozitiv (`localStorage g2p_rq_ts`, legat de `getVoterKey()`), toast cu minutele rămase.
- Sesizările din `#raporteaza` primesc `demo:true` în `reports/` și `activity/`; `realActivity()` le scoate din ActivityTicker și ActivityFeed.
- Decizii Teo: adresa TGM unică = primaria@tirgumures.ro; emailul demo merge tot la adresa oficială (mailto, omul apasă Send); demo:true doar pe #raporteaza; P1+P2 într-un PR.
- Verificat: predeploy-check ✅, smoke ✅, test headless: `#about` → `#raporteaza` deschide `.rq`, hash gol.
