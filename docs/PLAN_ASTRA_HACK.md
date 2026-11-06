# Planul F2G pentru Astra Hack (câștigător Arena + idei grefate)

H0 = momentul în care Teo spune „da”. H10 = pitch. Claude scrie tot codul. Teo apasă Merge.

## Principiu
Construim pornind de la momentul demo: juriul scanează QR-ul de pe slide 1, ajunge direct în formularul de sesizare și face o sesizare în ~30 s pe telefonul lui. Apoi vede fișa publică a terenului: cine răspunde, ceasul de 30 de zile, istoricul. Tot ce nu servește acest moment trece pe plan secund.

## Ce există deja în cod (verificat)
- `QuickReportModal` (index.html l.15621): sesizare cu teren, 7 categorii (`REPORT_CATS`), poză comprimată, GPS, ciornă, scrie în `reports/` și în `activity/`. Nu reconstruim, îl lustruim.
- Numărătoarea de 30 de zile și starea „întârziat” există în `LettersTracker` (l.12690) și în `CITY_REQUESTS` (l.16750). Le refolosim pe fișă.
- `LetterModal` (mailto): destinatarul e GOL pentru Târgu Mureș. Trebuie reparat.
- Nu există: bara de jos, deep link `#raporteaza`, adrese de școli, câmpul „Administrator”.

## Verdictul Council (aprobat cu condiții) — modificări față de varianta Arena
1. **Sesizarea cere cont acum** (`QuickReportModal`: `if (!firebaseUser) { login(); return; }`). Juriul ar da de login și ar renunța. Scoatem condiția din aplicație; regulile Firebase permit deja crearea fără cont, deci nu publicăm reguli noi.
2. **Anti-spam fără cont:** cel mult 2 sesizări la 10 minute pe telefon (localStorage), `demo:true` pe sesizările din QR, ticker-ul nu le arată, Moderarea le șterge. Test cu 3 sesizări la rând înainte de înghețare.
3. **Pasul 0 se împarte în două merge-uri** (0a: deep link + fără login + efecte oprite pe telefon; 0b: hamburger + contrast), ca să nu stricăm mai multe zone deodată.
4. **Terenul cel mai apropiat e ales automat**, „nu e aici” deschide harta, textul despre AI se pliază sub „detalii”, ecranul final are link de WhatsApp.
5. **Validare:** 15 testeri, cel puțin 5 din Sibiu, plus 5 de rezervă; cel puțin 10 rânduri în VALIDATION.md până la H7; o pereche „au spus X, am schimbat Y”.
6. **Un caz real până la capăt:** Teo trimite azi o sesizare reală la adresa oficială verificată și face captură cu dovada.
7. **Un test de business pornit azi:** Drăgan trimite 5 emailuri către sponsori de echipament.
8. Fraza pentru juriu: „Am testat cu [N] oameni, [X]% au trimis o sesizare în sub 30 de secunde. Azi am trimis una reală la primărie. Dacă nu răspunde în 30 de zile, o publicăm cu data și o ducem la prefectură și la presă. Pe 25.11 aflăm răspunsul la cererea 51941.”

Orarul de mai jos se aplică cu aceste modificări: Merge 0a la H1 (înaintea oricărui test), 0b + Pas 1 la ~H2.

## Sprintul de 10 ore
| Ora | Claude construiește | Oamenii fac în paralel | Merge |
|---|---|---|---|
| H0–1:15 | **Pas 0, calea demo:** `#raporteaza` deschide direct sesizarea, sare peste onboarding; pe telefon se opresc 3D, particule, aurora, blur; buton mare „Raportează” pe primul ecran; hamburger 44 px + aria-label; contrast hero. Camera și GPS se cer la folosire; GPS refuzat → aleg pe hartă. | Teo alege 5–10 oameni de test (din afara echipei). Trofin pregătește tabelul din `docs/VALIDATION.md`: vârstă, telefon, secunde până la sesizare, a terminat da/nu, citat. Drăgan scrie scriptul pitch-ului de 3 minute, doar cu cifre din surse. | — |
| H1:15–2 | **Pas 1:** lustruirea `QuickReportModal` pe 375 px (o mână, degetul mare), ecran final „Sesizare creată. Termen legal: 30 de zile.”, etichetă „demo” + text limitat pe sesizările din QR. | Primul test pe telefonul unui om din afară, cu versiunea veche (ca să avem „înainte”). | **Merge 1 (~H2)** |
| H2–4 | **Pas 2: fișa publică a terenului.** Responsabil (câmp „Administrator”: Primărie / Școală / Privat / Necunoscut), ceasul de 30 de zile care pornește DOAR la trimiterea reală, istoric, formularea „fără răspuns înregistrat” în loc de „vinovat”. Exemplele de „întârziat” poartă eticheta EXEMPLU. Pe fișele din Sibiu și TGM apar cererile reale 89234 / 51941 cu termen 25.11.2026. | Runda 1 de teste (5 oameni). După rundă, Teo îmi trimite 3 rânduri: unde s-au blocat, ce au întrebat, ce au lăudat. | **Merge 2 (~H4:30)** |
| H4:30–5:30 | **Pas 3: trimiterea oficială.** Email precompletat cu dovezi (link spre fișă, poză, categorie); destinatar verificat de oameni; în demo merge la adresa echipei, nu la registratură. Reparăm destinatarul gol din TGM. | Teo verifică adresele (TGM: o singură adresă oficială; Sibiu). Runda 2 de teste, pe fluxul complet. | **Merge 3 (~H6)** |
| H5:30–7 | **Pas 4: bara de jos** (Hartă · Raportează · Terenuri · Eu), cu safe-area; ghid „Adaugă pe ecran” doar dacă e timp. Se taie primul. Plus reparații din runda 2. | Slide-uri: QR pe slide 1, cifrele din VALIDATION.md, „ce am schimbat după teste”. Video de rezervă de 40 s al fluxului. | **Merge 4 (cel târziu H7:30)** |
| H7:30–8:30 | Doar bug-uri din teste. Nimic nou. | Repetiția 1, cu cronometru. | — |
| **H8:30** | **ÎNGHEȚARE.** Nimic după. | Test QR pe 3 telefoane străine (iPhone + Android ieftin, pe date mobile). Hotspot de rezervă. | — |
| H8:30–10 | Doar urgențe, la cererea lui Teo. | Repetițiile 2 și 3. Pitch. | — |

Fiecare merge: `predeploy-check` + `smoke` verzi înainte, PR draft, Teo apasă Merge. Fără `--no-verify`. Fără reguli Firebase noi în timpul sprintului.

## Linii de tăiere (în ordine)
1. Bara de jos → rămâne butonul mare „Raportează” (dă cea mai mare parte din valoare).
2. Ghidul de instalare PWA → după concurs.
3. Email complet → buton „Copiază textul” + „Deschide emailul”.
4. Istoricul pe fișă → rămân ceasul și responsabilul.
Nu se taie niciodată: calea demo (Pas 0), sesizarea, ceasul.

## Estimările mele (timpul lui Claude)
Pas 0: 1 h 15 · Pas 1: 45 min · Pas 2: 2 h · Pas 3: 1 h · Pas 4: 1 h 30 · verificări și PR-uri: incluse. Total ~6,5 h de cod în 8,5 h până la înghețare. Sunt estimări, nu măsurători.

## Toate ideile, în ordine cronologică
| Când | Idee (sursa) |
|---|---|
| Azi, în sprint | Calea demo + QR (Teo) · sesizare 30 s (doc pas 1) · fișă cu responsabil, termen, istoric (doc pașii 3–4) · trimitere oficială (doc pas 3) · bara de jos + PWA (Teo) · teste reale (juriu) |
| Azi, doar în pitch | Modelul în 6 pași și standardul de 6 luni („standard măsurat, nu promisiune”) · KPI-urile · protocolul cu administrațiile |
| Săpt. 1–2 | Comparația cu Sibiu City App / bazesportive.sibiu.ro (neverificată încă) · Declic (așteptăm răspunsul) · răspunsurile din 25.11 intră pe fișe |
| Luna 1–3 | Verificarea pe teren a terenurilor din Sibiu · detectarea dublurilor și clasificarea (doc pas 2) · un serviciu de sport ca partener de date (întâlnire de 20 min după 25.11) · forma legală (unii sunt minori: un adult sau un ONG gazdă) |
| Luna 3–6 | Stadiul „Reabilitat” cu dovezi încărcate de administrator și confirmare din comunitate (doc pas 6) · KPI publici lunar · sponsori de echipament (5 emailuri) |
| Luna 6–12 | Finanțare și sponsori centralizați (doc pas 5; GAL: solicită primăria, nu noi) · nocturnă cu logo · lockere/easybox · terenuri private · ONG/donații (după entitate) · App Store (după ce PWA are utilizatori care revin) |

## Cine plătește (ipoteze, fiecare cu test și prag fixat înainte)
| Ipoteză | Test ieftin | Trece dacă |
|---|---|---|
| Serviciul de sport e partener de date (nu client) | Cerere de întâlnire după 25.11 | Numește o persoană responsabilă |
| Sponsor de echipament plătește vizibilitate pe un teren reabilitat | 5 emailuri cu o pagină | Măcar un răspuns cu interes scris |
| Nocturnă cu logo | O discuție cu un administrator de teren | Cere o ofertă |
| Teren privat | 3 discuții cu proprietari | Unul acceptă listarea gratuită |
| Lockere/easybox | O întrebare în sondajul de teren | 3 din 5 spun „da” |
| ONG/donații | Pagină de interes fără plăți („fake door”) | Prag fixat înainte de test |
Fără entitate legală nu încasăm nimic. Spunem asta juriului.

## Conflictul cu primăria
Nu vindem primăriei. Serviciul de sport primește gratuit sesizări ordonate, cu poză și locație. Afișăm termenul din lege și data trimiterii, nu vinovați. Cine răspunde la timp apare „răspuns în termen”.

## Cifre permise în pitch (doar cu sursă)
CSM TGM nr. 2692/03.11.2026: 1,86 mil. lei în 4 ani; 49,5% la omologarea Liga 3 + platforma Sălii Polivalente; buget CSM +70%, terenuri −65% (2022→2025). Sibiu nr. 4541/03.11.2026: doar 4 baze mari, fără sume, fără starea terenurilor. Cereri prelungite: TGM 51941, Sibiu 89234, răspuns până la 25.11.2026. Doar TGM: 12 din 15 vecini; 131 voturi, 111 semnături. Sibiu: 36 de terenuri, niciunul verificat pe teren; audit din satelit, 4 evaluatori, acord slab.
Interzise: „5.000.000 lei promiși”, „Cluj 26,5 mil.”, „doi dintre noi au evaluat”.

## Riscuri
Wi-Fi-ul sălii cade → video + hotspot. Juriul spamează → text limitat, etichetă demo, ștergere din Moderare. GPS refuzat → hartă. Bug pe live → porțile de siguranță țin ultima versiune bună; ultimul merge cu ≥ 90 min înainte de pitch.
