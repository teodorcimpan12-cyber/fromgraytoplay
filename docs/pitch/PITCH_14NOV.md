# Pitch From Grey to Play — 14 noiembrie 2026

Pregătit în noaptea de 13→14 nov. Cifrele **reverificate pe 14 nov., ora 02:00**, direct în baza de date și pe ecranul Impact al oglinzii github.io.
**Dimineață, recitiți-le pe Impact → „Rezultate până azi” și scrieți-le aici cu pixul.**

## 0. ATENȚIE: ce link deschideți

`fromgreytoplay.netlify.app` arată încă o versiune veche (din 6 nov.; Netlify nu mai publică de când s-au terminat creditele).
Versiunea curentă, cu răspunsul Primăriei TGM și „Rezultate până azi”, e pe oglinda GitHub Pages:

**https://teodorcimpan12-cyber.github.io/fromgraytoplay/**

- Demo pe proiector: `…github.io/fromgraytoplay/?demo=5&c=sibiu` (verificat azi-noapte: slide-ul „0” pornește).
- Telecomanda pe telefon: `…github.io/fromgraytoplay/?demo=remote`, logat cu adminul **prin email și parolă** (Google nu merge pe github.io decât dacă adăugați domeniul în Firebase → Authentication → Settings → Authorized domains). **Testați-o dimineață** (n-am putut testa logarea azi-noapte). Dacă nu merge: Gabriel apasă → pe laptop.
- Reverificat pe 14 nov., 02:00, pe github.io (Chrome headless, 1440×900): pașii 1–9 se încarcă în ordine (Problema → Limite + ce urmează), QR-ul apare la pasul 9, zero erori în consolă. Oglinda rulează versiunea curentă (cache `g2p-v15`); Netlify e tot la `g2p-v11`.
- QR-ul din demo duce la Netlify (versiunea veche, dar funcțională). E în regulă pentru juriu; nu-l schimbăm în ziua pitch-ului.

## 1. Cifrele (14 nov., 02:00) — exact ce arată ecranul Impact

| Ce | Cât | Cum o spunem |
|---|---|---|
| Voturi pe petiție | **183** | „183 de voturi” |
| Sesizări de la locuitori (fără teste) | **5** | Toate din 6 nov., o parte de la echipă și mentori. Nu le umflăm: „5 sesizări, toate din ziua hackathonului.” |
| Înregistrate la primărie / rezolvate | **Ecranul arată 1 / 0** | ⚠️ Vezi mai jos „Înainte de pitch”. Rezolvate: „zero, încă”. |
| Cereri oficiale (Legea 544) cu răspuns | Ecranul arată **1 / 2** (cererile către cele două primării) | „Două cereri către primării: Târgu Mureș a răspuns, Sibiu are termen 25 noiembrie.” Separat, au răspuns și CSM TGM și Serviciul Sport Sibiu (nu intră în acel 1/2). |
| Terenuri documentate | **65** (30 TGM + 35 Sibiu) | |
| Scrisori trimise prin site | **0** | Nu le pomenim. |
| TGM: degradate | **13 din 30**; 12 în cartiere; centru 11%, cartiere 57% | |

**⚠️ Înainte de pitch: „1 înregistrată la Primărie”.** Sesizarea e Sibiu, Teren fotbal Ștrand, iluminat (6 nov.). Data de înregistrare pusă pe ea (6 nov., 10:00) e *înaintea* creării sesizării (13:38), deci pare apăsată din Admin în timpul demo-ului de la Astra. Dacă n-ați depus-o efectiv la Primăria Sibiu: Admin → Sesizări → scoateți marcajul „trimisă la Primărie” (sau puneți-l doar dacă aveți număr de înregistrare). Dacă juriul întreabă și n-ați apucat: „Una e marcată; o verificăm, nu o numărăm ca rezultat.”

## 2. Ce e nou de la Astra Hack (de spus!)

Lecția de la Astra (locul 6 din 20): juriul n-a găsit greșeli, dar nu aveam dovada că funcționează în lumea reală. De atunci:

1. **Primăria Târgu Mureș a răspuns** (nr. 51941/11.11.2026, semnat de primar): are în lucru documentații (DALI) pentru **trei terenuri de cartier**: str. Busuiocului, str. Budai Nagy Antal, str. Plopilor. **Două au fost amânate pe 24 septembrie de Consiliul Local, pentru că erau prea scumpe.** Plopilor e în curs. Bugetul compartimentului de sport pe 2026: 5.915.289 lei (premii, concursuri de proiecte, parteneriate).
2. **CSM** (nr. 2692/03.11.2026): 1,86 mil. lei pe baze sportive în 4 ani, 49,5% pe omologarea Liga 3 și o platformă pietonală. Buget CSM +70%, cheltuieli pe terenuri −65% (2022→2025).
3. **Sibiu** (nr. 4541/03.11.2026): investiții 2022–2026 doar la Păltiniș, Stadionul Municipal, Obor, Lacul lui Binder. Niciun teren de cartier.
4. Asociația: dosarul de constituire e în lucru (`docs/asociatie/`), nu e depus. Am cerut aderarea la Sibiu IT Cluster (10 nov., fără răspuns încă).

**Fraza-cheie nouă:** „Primăria are deja trei terenuri de cartier pe masă. Două au fost amânate ca prea scumpe. Noi aducem dovezile care arată care teren contează mai mult.”

## 3. Pitch de 3 minute (un vorbitor sau trei)

| Timp | Cine | Ecran | Ce spunem |
|---|---|---|---|
| 0:00–0:25 | Teo | Home (terenul desenat) | „În Târgu Mureș, 13 din cele 30 de terenuri publice sunt degradate. 12 sunt în cartiere. În centru, 11% sunt degradate; în cartiere, 57%. Unde locuiești decide dacă ai unde să joci.” |
| 0:25–0:55 | Teo | Impact → Buget | „Am cerut oficial datele. Clubul orașului a cheltuit 1,86 milioane de lei în patru ani; aproape jumătate pe omologarea pentru Liga 3 și o platformă pietonală. Iar acum două zile, Primăria ne-a răspuns: are trei terenuri de cartier în proiect. Două au fost amânate în septembrie, ca prea scumpe.” |
| 0:55–1:35 | Gabriel | Demo: un teren | „From Grey to Play arată starea fiecărui teren, cu dovezi datate. Un singur drum: găsesc terenul, văd istoricul din satelit, fac o poză, AI-ul estimează starea și scrie clar «estimare, nu inspecție», apoi trimit o cerere oficială cu termenul legal la vedere.” |
| 1:35–2:05 | Gabriel | Impact → Rezultate până azi | „Cifre vii, nu estimări: 183 de voturi, 65 de terenuri în două orașe, iar Primăria Târgu Mureș ne-a răspuns oficial. Sibiu are termen pe 25 noiembrie. Sesizări: 5, toate din ziua hackathonului. Știm că asta e partea slabă și o spunem.” |
| 2:05–2:35 | Matei | Asociația | „Costul de funcționare e aproape zero. Suntem trei studenți în anul întâi și înființăm o asociație, ca banii să treacă doar printr-o entitate cu rapoarte publice. După înregistrare: firme care adoptă un teren, 3,5% din impozit, finanțări locale. Nicio sursă peste 40%.” |
| 2:35–3:00 | Matei | QR | „Limita noastră: starea de azi depinde de oameni care verifică. De aceea cerem [CEREREA]. În șase luni: asociația înregistrată, 10 terenuri verificate de locuitori și dosarul de dovezi pentru cele trei terenuri din răspunsul Primăriei. Scanați și verificați un teren de lângă voi. Din gri, în joc.” |

**[CEREREA]** — alegeți una, după concurs: „trei luni de mentorat juridic și financiar” (implicit) · „finanțare pentru materialele primului teren, cu acordul administratorului” · „un oraș pilot”.

Dacă formatul e de 5 minute: folosiți demo-ul de 9 pași (`?demo=5&c=sibiu`) și scenariul din `docs/PITCH_FINAL.md`, plus la pasul 9 fraza-cheie nouă din secțiunea 2.

## 4. Pitch de 60 de secunde (pentru prezentări rapide sau networking)

**RO:** „În Târgu Mureș, 57% din terenurile de sport din cartiere sunt degradate; în centru, 11%. From Grey to Play arată public starea fiecărui teren și transformă o poză într-o cerere oficială către primărie, cu termen legal la vedere. Am cerut deja datele pe Legea 544: Primăria are trei terenuri de cartier în proiect, două amânate ca prea scumpe. Noi aducem dovezile care decid prioritatea. Suntem trei studenți, costul e aproape zero, iar asociația e în constituire.”

**EN:** "In Târgu Mureș, 57% of neighbourhood sports courts are run down; in the centre, 11%. From Grey to Play shows the condition of every public court and turns a phone photo into an official request to City Hall, with the legal deadline in public. We already used the freedom-of-information law: City Hall has three neighbourhood courts in design, and two were postponed as too expensive. We bring the evidence that decides which court comes first. We are three first-year students, running costs are close to zero, and our association is being set up."

## 5. Întrebări noi (pe lângă cele 21 din fișa veche)

| Întrebare | Răspuns (max. 2 fraze) | Cine |
|---|---|---|
| Ce s-a schimbat de la ultimul concurs? | Primăria TGM ne-a răspuns oficial: trei terenuri de cartier în proiect, două amânate pe cost. Acum lucrăm la dovezile pentru ele. | Teo |
| Doar 5 sesizări? | Da, și le numărăm cinstit, fără teste. Ținta pe care o măsurăm public e 10 terenuri verificate de locuitori. | Teo |
| De ce v-ar asculta primăria? | Pentru că deja ne-a răspuns, în scris, semnat de primar. Cererile au bază legală și termen. | Gabriel |
| Ce faceți cu proiectele amânate? | Strângem pentru ele dovezi datate și voturile vecinilor, ca la următoarea ședință consilierii să vadă cererea reală. Nu promitem rezultatul. | Gabriel |
| Bani? | Azi nu strângem bani. Asociația e în constituire; după înregistrare: Adoptă un teren, 3,5%, finanțări locale. | Matei |
| Ce faceți cu premiul? | O singură destinație: [de completat; implicit: taxele și actele de înregistrare ale asociației, apoi materiale pentru un teren cu acordul administratorului]. | Matei |

Regula rămâne: dacă nu știm, „Nu știm încă. Iată cum aflăm.” Niciodată un număr inventat.

## 6. Dimineața, în ordinea asta

1. Recitiți cifrele vii (Impact → Rezultate până azi) și corectați tabelul 1.
2. Laptop: Chrome, zoom 100%, F11, notificări oprite, încărcător. Deschideți **linkul github.io** de mai sus cu `?demo=5&c=sibiu`, apăsați `1`.
3. Descărcați pe laptop `demo-rezerva.mp4` (plan B fără internet): https://teodorcimpan12-cyber.github.io/fromgraytoplay/docs/pitch/demo-rezerva.mp4
4. Telefonul lui Teo: `?demo=remote` pe github.io, logat. Testați un pas. Dacă logarea nu merge, plan: Gabriel apasă →.
5. Hotspot pregătit pe al doilea telefon.
6. Repetiție cu cronometru: 3:00 (sau 4:50 pentru formatul de 5 minute). Completați [CEREREA] și „ce faceți cu premiul”.
7. Nu modificați cod în ziua pitch-ului. Nu dați merge la nimic.

## 7. Dacă ceva nu merge pe scenă

| Problemă | Ce faceți (fără pauză) |
|---|---|
| Internetul pică | Porniți `demo-rezerva.mp4` (descărcat dimineață) și vorbiți peste el. Hotspot pe al doilea telefon. |
| Pagina rămâne albă | `Ctrl+Shift+R`. Dacă tot nu: Netlify (`fromgreytoplay.netlify.app/?demo=5&c=sibiu`: versiune veche, demo de 5 pași, fără slide-urile cu răspunsurile oficiale; verificat că pornește) sau video. |
| Apare ecranul de bun venit („Treci peste”) | Apăsați „Treci peste”, apoi `1`. Deschideți linkul o dată dimineață pe laptopul de pitch, ca să nu mai apară. |
| Telecomanda nu se loghează | Gabriel apasă `→` pe laptop. Nu depanați pe scenă. |
| Satelitul nu încarcă | Spuneți fraza și treceți mai departe; pagina se ascunde singură după erori. |
| Depășiți timpul | Săriți pasul 8 („Cum am construit”). Finalul (pasul 9 + cererea) nu se taie niciodată. |

## 8. Ce nu spunem

- Că asociația există juridic, că avem cont bancar sau CIF.
- Că Primăria a promis ceva sau că proiectele se vor face datorită nouă.
- Că sesizările au venit de la „locuitori” fără să precizăm că sunt puține și din ziua hackathonului.
- Orice cifră care nu e pe ecran sau în tabelul de mai sus.
