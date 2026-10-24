# Paritate TGM vs Sibiu (P5)

Verificat: 2026-10-24, local (`?c=tgm` / `?c=sibiu`), Chrome desktop, RO. Fără erori în consolă pe nicio pagină/tab.

| Funcție | TGM | Sibiu | Note Sibiu |
|---|---|---|---|
| Hartă terenuri | ✅ 28 | ✅ 35 | Centrată pe Sibiu, pini gri „Neverificat”, atribuire OSM (ODbL) |
| Filtru cartier (Terenuri, Sesizări, Forum) | ✅ | ✅ | 14 cartiere din OSM; filtrul Forum era mort, acum funcționează |
| Detaliu teren | ✅ | ✅ | Adresă Nominatim, descriere RO/EN/HU, link OSM |
| Insignă stare | ✅ | ✅ | „Neverificat” gri (înainte apărea greșit „Renovat”) |
| „Vremea” terenului | ✅ | ✅ | ❔ Neverificat (înainte: ⛈️ „Distrus” pentru condiție lipsă) |
| Scor sănătate | ✅ | ✅ | „Scor indisponibil — teren neverificat” până la prima evaluare |
| QR / Satelit / Sunet / Evaluări / Check-in | ✅ | ✅ | Identic |
| Sesizări (raportare + listă) | ✅ | ✅ | Etichetate cu `city` |
| Petiție + voturi | ✅ | ✅ | Comună ambelor orașe; fiecare semnătură are `city` |
| Scrisoare către consiliu | ✅ | ✅ | Adresată Primăriei Sibiu; fără argumentele specifice TGM (sondaj 12/15, 5 mil. lei, SIDU) |
| Ghid Primărie (Cum ajuți → Contact) | ✅ | ✅ | Doar date verificate: registratură + cereri 544/2001 și OG 27/2002 → pms@sibiu.ro |
| Cursa cartierelor | ✅ | ✅ | Hartă cartier→terenuri derivată din date |
| Bon inegalitate / Grafic cartiere | ✅ | ⏳ | Mesaj „date în curs de verificare” — depind de condiția 1–5 |
| Cifre civice (buget, populație) | ✅ | ➖ | Ascuns — cifrele sunt doar pentru TGM |
| Cronologie / Eseu / Despre | ✅ | ➖ | Rămân povestea originală TGM (intenționat) |
| Pulsul orașului, Mayor mode, Pixel, Pledge, Clasament | ✅ | ✅ | Identic |
| Admin | ✅ | ✅ | Admin vede toate terenurile (`COURTS_ALL`) |

## Rămâne de făcut (necesită Boss)
- Vizite pe teren → condiție 1–5 pentru terenurile Sibiu (activează bonul și graficul).
- Review coloană „Cartier” din `tools/REPORT.md` (atribuire aproximativă).
- Review stringuri HU marcate `// TODO: HU review`.
- Test pe telefon real (P8).
