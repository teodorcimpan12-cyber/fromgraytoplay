# Pitch final — Astra Hack, 7 nov. 2026 (5 minute, 3 vorbitori)

Pornire: laptop pe proiector `fromgreytoplay.netlify.app/?demo=5&c=sibiu` · telefon `/?demo=remote`, logat cu contul de admin.
Telecomanda: Teo (avansează pașii). Laptopul în demo: Gabriel. Taste pe laptop: → înainte, ← înapoi, 1–9 salt, H ascunde bara, Esc închide o carte de întrebare.

Regulă: numerele de pe ecran le citim de pe ecran (contorul e live), nu din memorie.

| # | Timp | Cine | Ecran | Ce spune (aproape cuvânt cu cuvânt) |
|---|---|---|---|---|
| 1 | 0:00–0:30 | Teo | Slide „0” | „Ana are 16 ani și stă în Vasile Aaron — e un exemplu, dar terenul e real. Între blocuri, e gri. Am întrebat oficial Primăria Sibiu unde a investit în sport între 2022 și 2026. Răspunsul, nr. 4541 din 3 noiembrie: Păltiniș, Stadionul Municipal, Obor, Lacul lui Binder. Niciun teren de cartier. Pe hartă sunt 35. Starea lor nu o publică nimeni.” |
| 2 | 0:30–0:55 | Teo | Home, „Renovează” | „From Grey to Play arată starea fiecărui teren public, cu dovezi datate, și transformă o poză într-o cerere oficială către primărie. AI pentru dovezi, securitate pentru date, sustenabilitate pentru oraș.” |
| 3 | 0:55–1:15 | Gabriel | Slide „flux” | „Vă arăt un singur drum, cap-coadă: Ana găsește terenul, vede istoricul, îl verifică, face o poză, apoi trimite scrisoarea.” |
| 4 | 1:15–1:45 | Gabriel | Terenuri + satelit | „Satelitul ne arată ce a văzut la data aceea — nu starea de azi. Patru colegi au evaluat orb toate cele 35 de terenuri; publicăm și unde n-am fost de acord.” |
| 5 | 1:45–2:15 | Gabriel | Verificare live | „Starea de azi o dau locuitorii: trei întrebări, până la trei poze, iar un teren se schimbă doar când două dispozitive sunt de acord.” |
| 6 | 2:15–2:50 | Gabriel | AI + scrisoare | „AI-ul doar sugerează: scor, probleme, cost estimativ — scrie clar «estimare, nu inspecție». Apoi scrisoarea: petiție cu 30 de zile termen sau cerere 544 cu 10 zile, cu dovezile terenului, gata de trimis.” |
| 7 | 2:50–3:40 | Matei | Slide „bani” | „Azi, o sesizare la registratură nu e publică, iar o postare pe Facebook se pierde. La noi totul e public, datat, cu termenul legal la vedere — exact dovezile de care primăria are nevoie ca să prioritizeze. Cetățenii nu plătesc nimic. Costul nostru de rulare e aproape zero. Azi nu încasăm nimic: asociația e în constituire. După înregistrare: Adoptă un teren cu sponsori locali, 3,5% prin Formularul 230, granturi, și un comision mic doar pe rezervările care se plătesc deja.” |
| 8 | 3:40–4:20 | Teo | Slide „cum am construit” | „Aplicație web care merge offline pe telefon, Firebase cu reguli publice, AI doar pe server — cheia nu e în cod. Cinstit: harta, auditul din satelit, AI Court Doctor și Scrisoarea existau înainte. În 24 de ore am făcut: sesizarea fără cont cu anti-spam, pagina Asociației și Formularul 230, fișa nouă a terenului, heatmap-ul și acest mod demo. Claude a fost asistentul nostru de cod; datele și deciziile sunt ale noastre.” |
| 9 | 4:20–4:50 | Matei | Slide QR | „Limita: starea de azi depinde de oameni care verifică. Următorul test: pe 25 noiembrie vin răspunsurile oficiale, iar noi vrem 10 terenuri verificate. Cerem primăriei să publice starea terenurilor ei, și vouă — trei luni de mentorat. Scanați codul și verificați un teren de lângă voi. Din gri, în joc.” |

## ATENȚIE: site-ul live e înghețat (verificat 10 nov. 2026)

Netlify a oprit deploy-urile de producție pe 6 nov., 23:04 (creditele echipei s-au terminat; se resetează pe 23 nov. sau după un top-up de la 10 $). De atunci `fromgreytoplay.netlify.app` servește o versiune veche (`sw.js` g2p-v11): **fără** modul demo v2, „Cine răspunde”, HeroLite pe telefon, fixul telecomenzii, iar `docs/pitch/demo-rezerva.mp4` dă 404.

Codul curent (identic, byte cu byte, cu `main`) e servit de branch deploy-ul care încă merge:

- Laptop/proiector: `https://claude-fix-remote-blank--fromgreytoplay.netlify.app/?demo=5&c=sibiu`, apoi tasta `1`
- Telefon/telecomandă: `https://claude-fix-remote-blank--fromgreytoplay.netlify.app/?demo=remote` (login cu email + parolă; Google login poate să nu meargă pe acest domeniu)
- Video de rezervă: `https://claude-fix-remote-blank--fromgreytoplay.netlify.app/docs/pitch/demo-rezerva.mp4`

Verificat pe 10 nov.: slide-ul 1 se încarcă fără erori, telecomanda cere login de admin, `predeploy-check` și `smoke` sunt verzi. QR-ul de pe slide 9 duce tot pe site-ul live (cel vechi), care merge, dar fără noutățile de mai sus.
Fix definitiv: top-up Netlify (Billing) sau așteptarea resetării din 23 nov., apoi redeploy din `main`. Dacă se termină și creditele operaționale, Netlify suspendă și site-ul live.

## Întrebări

Toate cele 21, cu răspuns scurt și cine răspunde, sunt în telecomandă (tab „Întrebări”). Cele cu buton „Arată pe ecran” pun o carte pe proiector.
Cine răspunde: bani / asociație / concurență → Matei · restaurare / primărie / teren → Gabriel · AI / date / securitate / tehnic → Teo.
Dacă nu știm: „Nu știm încă. Iată cum aflăm: …” — niciodată un număr inventat.

## Materiale gata de folosit (`docs/pitch/`)

- `fisa-pitch.pdf` — scenariul + toate cele 21 de întrebări, grupate pe cine răspunde. Printați 3 exemplare (câte unul de vorbitor).
- `demo-rezerva.mp4` — 1:50, fără sunet, cei 9 pași pe proiector (inclusiv „Renovează” și glisorul din satelit). Se deschide și de pe site: `fromgreytoplay.netlify.app/docs/pitch/demo-rezerva.mp4`. **Descărcați-l pe laptop înainte**, nu depindeți de Wi-Fi.
- `fisa-pitch.html` — aceeași fișă, de deschis pe telefon.

## Dimineața pitch-ului — în ordinea asta

1. **Merge PR-ul cu modul demo** (vezi mai jos) cu cel puțin 90 de minute înainte de pitch. Verificați apoi pe live că `?demo=5&c=sibiu` arată slide-ul „0”.
2. Laptop: Chrome, zoom 100%, fereastră pe tot ecranul (F11), notificări oprite, încărcător în priză. Deschideți `?demo=5&c=sibiu`, apăsați `1`.
3. Telefonul lui Teo: `?demo=remote`, logat cu adminul. Apăsați un pas și verificați că laptopul îl urmează. Luminozitate maximă, „Nu deranja”.
4. Hotspot pe un al doilea telefon, pregătit. Dacă sala are Wi-Fi slab, treceți laptopul pe hotspot **înainte** să urcați pe scenă.
5. Test QR: scanați slide-ul 9 de pe un telefon care n-a deschis niciodată site-ul (fereastră privată).
6. Repetiție cu cronometru: 4:50 țintă, maxim 5:00. Cine depășește pe pasul lui, sare la fraza-cheie și dă mai departe.
7. Nu modificați nimic în cod în ziua pitch-ului.

## Plan B, pe scurt

| Ce pică | Ce facem |
|---|---|
| Internetul | Pornim `demo-rezerva.mp4` pe laptop, vorbim peste el în aceeași ordine. Slide-urile 1, 3, 7, 8, 9 sunt și în video. |
| Telecomanda | Gabriel apasă → pe laptop la semnalul lui Teo. |
| Un pas din aplicație nu se încarcă | Apăsați cifra pasului următor (1–9) și continuați. Nu depanăm pe scenă. |
| Juriul trimite sesizări de test | Sunt marcate `demo`, nu apar în feed; se șterg din Admin → Moderare. |

## Ce s-a schimbat în noaptea dinaintea pitch-ului (7 nov., 00:00–03:00)

- Pasul 2 („Soluția”) aterizează direct pe orașul 3D, cu butonul „Renovează terenul” pe ecran (înainte rămânea sus, pe deschidere, și butonul nu se vedea).
- Au intrat în același PR două lucrări din sprint care rămăseseră nemerge-uite (#35 și #33): pe fișa terenului apare „Cine răspunde” (administrator, ceasul de 30 de zile pornit doar de o trimitere reală, cererile 544 cu termen 25.11.2026, istoricul sesizărilor); după trimitere, ecranul „Sesizare creată. Termen legal de răspuns: 30 de zile.”; terenul cel mai apropiat se alege singur; adresa oficială TGM unificată; scrisoarea TGM fără cifrele interzise („5.000.000 lei”, „0%”). Pe telefon: fără onboarding pe `#raporteaza`, hamburger 44 px, fără aurora și ticker animat.
- Un link spre un teren (`#court-…`) nu mai e acoperit de onboarding la prima vizită.
