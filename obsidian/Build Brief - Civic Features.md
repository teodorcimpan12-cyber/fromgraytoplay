# Build Brief — Funcții civice (pentru adopție Primărie + utilizare reală)

> Document de sinteză pentru o sesiune nouă de build. Conține TOT ce trebuie ca să
> implementezi funcțiile care fac (A) Primăria să adopte aplicația și (B) cetățenii
> să o folosească. Citește întâi `CLAUDE.md` din rădăcină, apoi acest fișier.

---

## 0. Context & reguli de arhitectură (obligatoriu)

- **From Grey to Play** — PWA civic care documentează inegalitatea terenurilor sportive
  din Târgu Mureș. Live: https://fromgraytoplay.netlify.app/
- **Tot site-ul live = un singur fișier: `index.html`** la rădăcină. React 18 UMD +
  Firebase v9 compat + Leaflet, totul din CDN. JSX e pre-transpilat în
  `React.createElement(...)` într-un singur `<script>`. **Scrie cod nou în același stil.**
- **NU adăuga bundler / package.json / build la rădăcină.** Single-file e suprafața de deploy.
- `vite-next/` e parcat — **nu îl atinge** decât dacă taskul e explicit „migrate".
- 3D hero-ul e deja integrat pe Home (componentă `Hero3D` + `mountHero3D`), plus există
  `demos/hero3d-demo.html` (izolat) și `hero/index.html` (deploy standalone).
- Deploy: Netlify publică din branch-ul **`claude/start-building-BQQ1q`** (legat la GitHub).
  Orice push pe acel branch → redeploy automat.

### Design tokens (folosește exact aceste hexe)
`--green #10B981` · `--coral #F97316` · `--teal #0D9488` · `--red #DC2626`
· `--dark #1A1A2E` · `--darkCard #16213E`. Fonturi: Space Mono (titluri),
Libre Franklin (corp). Radius 12px. Temă light + dark via `[data-theme="dark"]`.

### i18n (obligatoriu la fiecare șir nou)
Dicționarele `T.ro`, `T.en`, `T.hu` la începutul scriptului. **Adaugă orice șir nou în toate trei.**
HU e draft — marchează proza HU nouă cu `// TODO: HU review`. Switch-ul ciclează ro→en→hu.

### Convenții
- Componente noi = funcții care întorc `React.createElement(...)`. Fără JSX fără transpile.
- Context: `useApp()` dă `{ t, lang, setLang, theme, setTheme, page, setPage, user, setUser, toast }`.
- Toast tranzitoriu: `useApp().toast("mesaj")`.
- Firebase citire: `useFirebase("path")`. Scriere: `db.ref(path).push({...})` sau
  `db.ref(path).transaction(v => (v||0)+1)` pentru contoare.
- La orice scriere în Firebase, **scrie și o intrare în `activity/`** ca să apară în feed.
- Folosește clasele existente `card`, `btn`, `badge`. Mobile-first; nav se pliază la 860px.
- Admin: parolă în `ADMIN_PW` (sus în script). Acces admin: Ctrl+Shift+A sau `#/admin`.

### Schema Firebase actuală (live)
```
fromgreytoplay-default-rtdb/
├── signups/{pushId}: {name, email, choice: flip|mural|both, volunteer, timestamp}
├── votes/{flip|mural|both}: number
├── activity/{pushId}: {type, userName, courtId?, timestamp}
├── reports/{pushId}: {courtId, issue, status, timestamp}
├── courts/{id}/checkins/{pushId}: {userId, timestamp}
├── bookings/{pushId}: {courtId, date, hour, userName}
└── gallery/{pushId}: {courtId, neighborhood, status, caption, dataUrl, timestamp}
```
Regulile sunt permisive (MVP). **Trebuie întărite înainte de presă/oficial** (vezi §4).

---

## 1. Obiective

- **A. Adopție Primărie:** instituția adoptă ceva dacă îi reduce munca, arată bine și e fără risc.
- **B. Utilizare reală:** oamenii revin doar dacă au utilitate reală + buclă de obicei (nu doar „semnează").

Strategie: implementăm întâi tot pe site, apoi mergem la Primărie cu pachetul gata făcut.

---

## 2. FUNCȚII — Bucket A (ca Primăria să adopte)

Fiecare funcție are: **Ce / De ce / Date / UI / Acceptare.**

### A1. Sesizare „ca 311" cu status public
- **Ce:** raportarea unui teren devine tichet structurat cu stadiu vizibil public:
  `Primit → În analiză → Planificat → Rezolvat`.
- **De ce:** transformă activismul în unealtă de administrare; e exact ce poate folosi Primăria.
- **Date:** extinde `reports/{pushId}`:
  `{courtId, neighborhood, category, description, photoDataUrl?, lat?, lng?, status, createdAt, updatedAt, official?: {by, note, at}}`.
  `category` ∈ {suprafață, coș/poartă, gard, iluminat, gunoi, siguranță, altele}.
- **UI:** formular rapid (vezi B1) + pagină „Sesizările mele/toate" cu timeline de status + filtre
  (cartier, status, categorie). Badge colorat de status. Scrie în `activity/`.
- **Acceptare:** poți crea o sesizare, vezi statusul; adminul poate schimba statusul + adăuga notă oficială;
  schimbarea apare în feed.

### A2. Tablou de transparență (dashboard public)
- **Ce:** pagină cu statistici agregate: nr. terenuri raportate, % rezolvate, timp mediu de rezolvare,
  defalcare pe cartier, comparație cu promisiunile SIDU.
- **De ce:** instrument de imagine pentru administrație + presiune pozitivă; arată responsabilitate.
- **Date:** derivat client-side din `reports`, `votes`, `courts`. Opțional `metrics/` editabil de admin
  pentru cifre SIDU (investiție planificată/cartier).
- **UI:** carduri cu numere mari (clasa `stat-number`), grafice simple (bare CSS), tabel pe cartiere.
- **Acceptare:** cifrele se calculează corect din date live; se actualizează când apar sesizări noi.

### A3. Export open-data / strat GIS
- **Ce:** buton care exportă terenurile + starea lor ca **GeoJSON** și **CSV**.
- **De ce:** devine „date oficiale" care intră în GIS/portalul de date al orașului, nu protest.
- **Date:** din `courts` (+ `reports` agregat). Generare 100% client-side, descărcare ca fișier (Blob).
- **UI:** în dashboard sau pagină „Date deschise": butoane „Descarcă GeoJSON / CSV".
- **Acceptare:** fișierele se descarcă valide (GeoJSON se deschide în geojson.io; CSV în Excel).

### A4. Buget participativ
- **Ce:** cetățenii propun și votează ce terenuri se renovează într-un buget dat.
- **De ce:** multe primării caută exact așa ceva (cf. Cluj/Sibiu).
- **Date:** `projects/{id}: {title, courtId, neighborhood, cost, description, votes, status}`;
  `projectVotes/{voterKey}/{projectId}: true` (anti-vot-dublu). Plafon buget = constantă config.
- **UI:** listă proiecte cu cost, buton vot, bară „buget consumat / rămas", status.
- **Acceptare:** un vot per proiect per utilizator; totalul costurilor votate nu depășește vizual plafonul.

### A5. Cont verificat „Primăria" + răspunsuri oficiale
- **Ce:** un cont oficial (via admin) poate răspunde public la sesizări/petiție.
- **De ce:** le dă voce și sentiment de proprietate → mai dispuși să adopte.
- **Date:** `reports/{id}/official: {by, note, at}` (vezi A1). Badge „Răspuns oficial".
- **UI:** în panoul admin, câmp de răspuns pe fiecare sesizare; afișare evidențiată public.
- **Acceptare:** răspunsul oficial apare distinct (badge verde „Primăria").

### A6. Rubrică obiectivă de evaluare a terenurilor
- **Ce:** fiecare teren primește scor pe criterii: suprafață, iluminat, gard, accesibilitate, siguranță.
- **De ce:** prioritizare defendabilă + dosare pentru granturi UE youth-sport.
- **Date:** extinde `courts/{id}`: `{criteria: {surface, lighting, fence, accessibility, safety} (0-5)}`.
  Scorul general derivă din criterii (înlocuiește/alimentează `condition` 1-5 existent + `getCourtWeather`).
- **UI:** în detaliul terenului, radar/listă criterii; admin le editează.
- **Acceptare:** scorul general se calculează din criterii; chip-ul de stare reflectă scorul.

---

## 3. FUNCȚII — Bucket B (ca oamenii să folosească)

### B1. Raport în 30 de secunde (fără cont)
- **Ce:** o atingere → foto + geolocație + categorie; trimite fără login.
- **De ce:** frecușul mic = mai multe sesizări.
- **Date:** scrie în `reports/` (vezi A1). Geolocație via `navigator.geolocation` (cu consimțământ).
  Foto comprimată client-side la dataURL (refolosește pipeline-ul din galerie/photo wall).
- **UI:** buton flotant „＋ Raportează" pe Home + pe hartă/teren. Formular minim, 3 atingeri.
- **Acceptare:** raport complet în <30s pe telefon; merge și fără geolocație (selectezi terenul manual).

### B2. „Joc acum" / pickup games  ⭐ (cel mai puternic motor de retenție)
- **Ce:** vezi cine merge la teren, propui un meci, te alături.
- **De ce:** rezolvă problema reală — „cu cine joc?" — și aduce oamenii înapoi.
- **Date:** `games/{id}: {courtId, sport: baschet|fotbal|altele, datetime, createdBy, note, players:{voterKey:true}}`.
  Scrie `activity/`.
- **UI:** pe detaliul terenului „Jocuri viitoare" + buton „Mă alătur" (contor jucători). Listă „Astăzi pe teren".
- **Acceptare:** creezi un joc, altcineva se alătură, vezi numărul de jucători live.

### B3. „Urmărește un teren" + notificări in-app
- **Ce:** urmărești un teren și primești alertă când i se schimbă starea sau apare un eveniment/joc.
- **De ce:** te face să revii.
- **Date:** `follows/{voterKey}/{courtId}: true`. Notificări = feed in-app derivat din `activity/` filtrat
  pe terenurile urmărite. (Push web = opțional, vezi §4.)
- **UI:** buton „🔔 Urmărește" pe teren; ecran „Notificările mele".
- **Acceptare:** urmărești un teren → o sesizare/joc nou pe el apare în notificările tale.

### B4. Mândrie de cartier / clasament
- **Ce:** Tudor vs. Auchan vs. Centru vs. Sportcomplex — cele mai multe probleme rezolvate, cei mai activi.
- **De ce:** gamificare cu sens civic.
- **Date:** derivat din `reports` (rezolvate/cartier) + `activity` (activitate/cartier).
- **UI:** clasament pe dashboard sau pagină proprie; bară de progres pe cartier.
- **Acceptare:** clasamentul se recalculează din date live.

### B5. Perete „înainte / după"
- **Ce:** pozele transformărilor terenurilor, pereche înainte↔după.
- **De ce:** emoțional, ușor de distribuit.
- **Date:** extinde `gallery/{id}` cu `status: before|after` + `courtId` (există deja câmpuri apropiate).
- **UI:** slider/comparație înainte-după pe detaliul terenului + galerie dedicată.
- **Acceptare:** pentru un teren cu poze before+after se vede comparația.

### B6. Evenimente comunitare
- **Ce:** turnee, zile de murale (Street Canvas), zile de voluntariat — calendar + RSVP.
- **Date:** `events/{id}: {title, courtId?, neighborhood?, datetime, type, description, rsvps:{voterKey:true}}`.
- **UI:** pagină „Evenimente" + RSVP; cele de pe un teren apar și în detaliul lui.
- **Acceptare:** creezi eveniment, dai RSVP, vezi contorul.

### B7. QR la teren (deep links)
- **Ce:** afiș fizic „Scanează → raportează / check-in" cu QR per teren.
- **De ce:** aduce userii exact unde sunt.
- **Date:** fără schemă nouă; deep link `?court=ID&action=report|checkin|game`.
- **UI:** generator QR în admin (per teren) + handler de query la pornirea aplicației (deschide direct ecranul).
- **Acceptare:** scanarea unui QR deschide aplicația direct pe acțiunea corectă pentru terenul corect.

### B8. Share + dovadă socială
- **Ce:** card de teren / progres petiție partajabil (Web Share API + fallback copy-link).
- **De ce:** distribuție pe canalele locale (WhatsApp/Facebook), social proof.
- **Date:** fără schemă nouă. Folosește `SITE` const + deep links.
- **UI:** buton „Distribuie"; text gen „Mai sunt X până la 1000 · Y semnături din cartierul tău".
- **Acceptare:** share-ul deschide foaia nativă pe telefon; linkul duce la conținutul corect.

### B9. Parteneriate (school/club) + onboarding cu poveste
- **Ce:** onboarding care spune povestea (eseul) → buy-in emoțional; hooks pentru școli/cluburi.
- **Date:** fără schemă nouă (folosește `ESSAY.{ro,en,hu}`).
- **Acceptare:** onboarding clar, scurt, trilingv.

---

## 4. Cerințe transversale (FUNDAȚIE — necesare pentru oficializare)

- **GDPR / confidențialitate:** pagină de politică de confidențialitate; consimțământ explicit
  pentru geolocație și poze; minimizarea datelor (nu cere date personale inutile); „operator de date";
  drept de ștergere. Banner de consimțământ.
- **Moderare + anti-spam:** panou admin pentru `reports` și `gallery` (aprobă/ascunde/șterge);
  buton „raportează abuz"; rate-limit / honeypot la formulare. Conținutul de la useri trebuie moderat
  ca să fie credibil pentru Primărie.
- **Reguli Firebase întărite:** acum sunt permisive; definește reguli de validare (shape, lungimi,
  doar câmpuri permise) + scriere limitată. **Obligatoriu înainte de presă/oficial.**
- **Accesibilitate (WCAG):** contrast, focus vizibil, navigare cu tastatura, `alt` la imagini, target-uri mari.
- **i18n complet:** toate șirurile noi în RO/EN/HU; revizuire HU reală (publicul include comunitatea maghiară).
- **Analytics privacy-friendly:** măsoară utilizarea fără cookies invazive (ex. Plausible) ca să poți
  arăta Primăriei cifre de adopție.
- **Notificări push (atenție):** PWA push pe iOS e limitat; planifică in-app feed ca primar, push ca bonus.
- **Identitate ușoară a userului:** `user` din `useApp()` (nume în localStorage) + un `voterKey` stabil
  (ex. UUID în localStorage) pentru anti-dublu la voturi/RSVP fără cont real.

---

## 5. Ordine de build (faze)

**Faza 1 — atrage cetățenii + închide bucla (quick wins):**
1. B1 Raport în 30s + A1 status public (merg împreună).
2. B2 „Joc acum" / pickup games.
3. B3 Urmărește teren + notificări in-app.
4. B8 Share + B7 QR la teren.

**Faza 2 — credibilitate / fundație:**
5. §4 GDPR + politică + consimțământ.
6. §4 Moderare/admin + reguli Firebase.
7. A6 Rubrică de evaluare.
8. A2 Tablou de transparență.

**Faza 3 — instituțional (pachetul pentru Primărie):**
9. A4 Buget participativ.
10. A3 Export open-data/GIS.
11. A5 Cont verificat + răspunsuri oficiale.
12. B4 Clasament cartiere · B5 Perete înainte/după · B6 Evenimente.

---

## 6. Livrabile pentru pitch-ul la Primărie

- **Tablou de transparență** (A2) live.
- **Export open-data** (A3) demonstrabil.
- **Propunere de o pagină** (RO + HU): problema (cu surse: SIDU, studii, Punctul.ro), soluția,
  ce primește Primăria (date, transparență, granturi), cost minim (single-file PWA, hosting ieftin),
  pași de preluare/co-mentenanță.

---

## 7. Cum începe sesiunea nouă (checklist)

1. Citește `CLAUDE.md` + acest fișier.
2. Lucrează în `index.html` la rădăcină, stil `React.createElement`. Fără build/bundler.
3. Pentru fiecare funcție: adaugă șiruri în `T.ro/T.en/T.hu`; scrie în Firebase + `activity/`;
   folosește `card/btn/badge`; mobile-first.
4. Testează pe Home/în browser real înainte de a zice „gata" (rulează aplicația, verifică fluxul).
5. Commit descriptiv → push pe branch-ul de deploy `claude/start-building-BQQ1q` (Netlify publică automat).
6. Ține cont de §4 (GDPR/moderare/reguli) — nu lansa public date personale fără ele.

> Prioritate recomandată de pornit: **Faza 1, punctul 1 (B1 + A1)** — raport rapid cu status public.
> E quick win care prinde și cetățenii, și Primăria.
