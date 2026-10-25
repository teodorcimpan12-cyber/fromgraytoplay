# Sibiu fără vizite pe teren — cum verificăm de la distanță

Echipa nu merge pe teren. Asta nu e o scuză în pitch, e **metoda**: un oraș nu poate trimite pe cineva la fiecare
teren în fiecare an, dar poate folosi ce există deja online — imagini din satelit, registre publice și oamenii
care joacă acolo. From Grey to Play le pune cap la cap, cu sursa și data la fiecare dovadă.

## Cele 4 straturi de dovezi (fiecare cu data lui)

| Strat | Ce arată | Perioadă | Cine | Unealtă |
|---|---|---|---|---|
| 🛰️ **Satelit** | Dacă terenul există și ce s-a schimbat (construit, refăcut, dispărut) — **nu** starea de azi | 2011 → 2022 (2025 pentru un teren) | Matei + Mihai, orb, independent | `tools/sat-review.html` |
| 🤖 **AI ca evaluator în plus** | Aceleași întrebări, aceleași imagini — măsurăm cât de des e de acord cu oamenii | idem | Claude (după ce verificăm termenii Esri) | `tools/sat_ai_review.mjs` |
| 📄 **Registre publice** | Unde a investit primăria în sport, cât și când (cu link la sursă) | 2020 → 2026 | Ilie | `docs/INVESTITII_SIBIU.md` + cererea 544 |
| 🙋 **Sibienii** | Cum arată terenul **azi**: poze și răspunsuri de la oameni care joacă acolo | acum | Ionuț aduce oamenii; aplicația adună | „Raportează” din aplicație |

Regula: fiecare strat apare în aplicație cu eticheta lui („din satelit, aug. 2022”, „sursă: Turnul Sfatului, 2024”,
„raportat de un sibian, nov. 2026”). Niciun strat nu se dă drept altul. Niciun teren nu primește o notă 1–5 din satelit.

## Ce a arătat deja un test pe 4 terenuri (pilot AI, 25 oct. — de confirmat de evaluatori)

Claude a privit cronologia din satelit pentru 4 terenuri, ca test al metodei. **Nu sunt rezultate**, sunt motivul
pentru care merită făcută evaluarea completă:

| Teren | Ce se vede 2011 → 2022 |
|---|---|
| sb9 (Centrul Civic) | Teren pavat, neschimbat în toate imaginile; clădirea de lângă a fost demolată și refăcută în 2018–2019 |
| sb13 (Vasile Aaron, Str. Iezer) | Teren mare pavat vizibil 2011–2020; în **aug. 2022 locul e șantier** (pământ, clădire nouă alături) |
| sb18 (Centrul Istoric) | Curte pavată, neschimbată; marcajele nu se disting la această rezoluție |
| sb22 (Tilișca, Str. Săcel) | **Niciun teren vizibil în nicio imagine 2011–2021** (iarbă, săpătură în 2018, vegetație). Ori a fost construit după 2021, ori e o eroare în OpenStreetMap |

Dacă evaluarea completă confirmă tipare ca acestea, harta „celor 35 de terenuri publice” nu e harta reală a Sibiului —
iar asta e exact genul de lucru pe care o primărie nu-l vede fără un instrument ca acesta.

## Cine ce face (totul online)

| Cine | Rol | Ce livrează | Până când |
|---|---|---|---|
| **Trofin Matei** | Evaluator satelit A | Toate cele 35 de terenuri în `tools/sat-review.html`, apoi **Exportă** → fișierul la Teodor | mier. 28 oct. |
| **Țurcanu Mihai** | Evaluator satelit B | La fel, **fără să vorbească cu Matei** despre terenuri până nu termină amândoi | mier. 28 oct. |
| **Drăgan Ilie** | Registre publice + al treilea evaluator | `docs/INVESTITII_SIBIU.md` completat; reevaluează doar terenurile unde Matei și Mihai nu sunt de acord | vin. 30 oct. |
| **Cernescu Ionuț** | Comunitate | Sibieni care trimit o poză + o sesizare pentru un teren de lângă ei; fiecare persoană în `docs/VALIDATION.md` | mar. 3 nov. |
| **Cîmpan Teodor** | Cod, integrare, pitch | Rezultatele în aplicație, demo, cererea 544, emailul către organizatori | continuu |

De ce așa: doi evaluatori care nu se influențează dau un **acord măsurabil** (Cohen's kappa, calculat de
`tools/sat_merge.mjs`). Un juriu de ingineri va întreba „de unde știți?” — răspunsul e un număr, nu o părere.
Teodor nu evaluează: a văzut deja pilotul de mai sus și ar fi influențat.

## Pașii exacți pentru evaluatori (Matei, Mihai, Ilie)

1. Deschide `https://fromgreytoplay.netlify.app/tools/sat-review.html` pe laptop (pe telefon merge, dar e mic).
2. Alege-ți numele. Citește caseta portocalie.
3. Pentru fiecare teren: sub **fiecare** imagine alegi „se vede teren / nu e teren / nu se poate spune”, apoi cele 5 întrebări.
4. Durează ~3 minute pe teren, ~2 ore în total. Poți face pauză: se salvează singur în browser (același browser!).
5. La final: **Exportă** → trimite fișierul `.json` lui Teodor (WhatsApp/email). Teodor îl pune în `tools/data/sat_reviews/`.

## Pașii pentru Ionuț (comunitate)

Unde: consiliile elevilor din liceele din Sibiu (pagini de Instagram), grupurile de Facebook ale cartierelor
(Vasile Aaron, Hipodrom, Ștrand, Terezian, Tilișca, Valea Aurie), r/sibiu, prieteni din Sibiu.
Mesaj (adaptează-l, dar păstrează ce cerem și ce nu):

> Salut! Suntem o echipă de liceeni care facem o hartă a terenurilor de sport publice din Sibiu
> (https://fromgreytoplay.netlify.app/?c=sibiu), pentru Astra Hack. Din satelit vedem doar până în 2022 —
> ne ajuți să aflăm cum arată azi terenul de lângă tine? Intră pe hartă, apasă pe teren → „Raportează”, pune o
> poză **fără oameni în ea** și scrie ce ai văzut. Durează un minut. Mulțumim!

Reguli: fără poze cu persoane (mai ales copii), fără date personale în `VALIDATION.md`, nu promitem nimic în numele
primăriei. Prioritate: terenurile marcate „de verificat” după evaluarea din satelit (ex. sb13, sb22).

## Ce **nu** spunem în pitch

- Că am verificat starea terenurilor din satelit (nu se poate la 0,3–0,5 m/pixel).
- Că AI-ul a „inspectat” ceva — AI-ul e un evaluator în plus, comparat cu oamenii.
- Cifre din registre fără link la sursă.
