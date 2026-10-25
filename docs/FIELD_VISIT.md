# Vizite pe teren — Sibiu (până pe 1 noiembrie 2026)

> **Actualizare 25 oct.: echipa nu face vizite pe teren.** Verificarea se face de la distanță — vezi
> `docs/REMOTE_VERIFICATION.md`. Protocolul de mai jos rămâne valabil pentru **sibienii** care vor să trimită poze
> și o notă pentru un teren de lângă ei (aceeași scară 1–5, aceleași reguli: fără fețe, doar ce vezi).

Scop: dovada **reală** a diferenței dintre terenurile din centru și cele din cartiere, la Sibiu.
Nu trebuie vizitate toate cele 35. Trebuie **minimum 10**, din ambele grupe (centru și cartiere),
ca graficul de inegalitate să se aprindă cu date adevărate.

Distanțele sunt măsurate de la Piața Mare (45.7972, 24.1520) pe coordonatele din OpenStreetMap.
„Centru” = sub 1 km; „cartier” = peste 1,5 km. Nimic din tabel nu e verificat încă.

## Reguli (citește înainte să pleci)

1. **Fără fețe.** Fotografiază când terenul e gol sau din unghi în care nu se recunoaște nimeni. Niciodată copii.
2. **3 poze per teren:** (1) de ansamblu, (2) suprafața de aproape, (3) coșul / poarta / fileul.
   Nume fișiere: `sb18_1.jpg`, `sb18_2.jpg`, `sb18_3.jpg`. Lasă GPS-ul pornit la cameră.
3. **Notează doar ce vezi.** Dacă nu știi cine administrează terenul, scrie gol, nu ghici.
4. **Dacă terenul e privat, închis sau nu există**, scrie asta (`acces`) — e tot un rezultat valid.
5. **Arată aplicația cuiva de acolo** (vezi `docs/VALIDATION.md`) și notează ce a zis.

## Nota de stare 1–5 (aceeași scară ca la Târgu Mureș)

| Notă | Ce înseamnă |
|---|---|
| 5 | Ca nou: suprafață întreagă, echipament complet, marcaje vizibile |
| 4 | Bun: uzură mică, totul funcționează |
| 3 | Folosibil: fisuri, marcaje șterse, un element lipsă sau stricat |
| 2 | Degradat: fisuri mari / denivelări, echipament îndoit sau lipsă, periculos pe alocuri |
| 1 | Nefolosibil: distrus, fără echipament, închis de fapt |

## Traseul A — vest / sud (echipa A)

| Oprire | ID | Zonă | Dist. | Sport (OSM) | Adresă aprox. | Coordonate |
|---|---|---|---|---|---|---|
| 1 | sb18 | Centrul Istoric | 0,2 km | baschet | Str. Gheorghe Lazăr | 45.796312, 24.154152 |
| 2 | sb16 | Centrul Istoric | 0,4 km | baschet | Str. Parcul Tineretului | 45.796556, 24.156810 |
| 3 | sb9 + sb29 | Centrul Civic | 1,0 km | multisport + baschet | Str. Dr. Ștefan Stâncă | 45.788798, 24.146726 |
| 4 | sb1 + sb20 + sb19 | Ștrand | 1,7 km | baschet ×2 + volei | Str. Doljului | 45.788873, 24.133839 |
| 5 | sb8 | Ștrand | 1,6 km | fotbal | Str. Maramureșului | 45.792066, 24.132525 |
| 6 | sb35 | Valea Aurie | 3,4 km | fotbal | Aleea Călăreților | 45.770167, 24.132835 |
| 7 | sb22 | Tilișca | 3,9 km | multisport | Str. Săcel | 45.772906, 24.115548 |

## Traseul B — nord / est (echipa B)

| Oprire | ID | Zonă | Dist. | Sport (OSM) | Adresă aprox. | Coordonate |
|---|---|---|---|---|---|---|
| 1 | sb4 | Centrul Istoric | 0,6 km | fotbal | Str. Bastionului — **verifică dacă e public** | 45.794313, 24.145537 |
| 2 | sb26 + sb27 | Terezian | 1,2 km | fotbal + baschet | Aleea Târgul Cailor / Str. Lungă | 45.806854, 24.145861 |
| 3 | sb34 | Reșița | 1,3 km | baschet | Str. Ana Ipătescu | 45.803389, 24.165488 |
| 4 | sb30 + sb31 | Lazaret | 1,5 km | baschet ×2 | Str. Lazaret / Str. Macaralei | 45.801139, 24.170713 |
| 5 | sb13 | Vasile Aaron | 2,0 km | multisport | Str. Iezer | 45.786603, 24.173303 |
| 6 | sb12 | Hipodrom | 2,0 km | multisport | Aleea Geniștilor | 45.780303, 24.159190 |
| 7 | sb32 | Doamna Stanca | 2,6 km | baschet | Șoseaua Sibiului | 45.777000, 24.169136 |

În plus, dacă aveți timp: **Baza sportivă Obor** (Calea Șurii Mari, deschisă 9 mai 2024, după presă) — nu am
găsit-o încă în lista OSM. Notați coordonatele exacte de pe telefon; nu le ghicim.

Linkuri rapide: `https://www.openstreetmap.org/?mlat=LAT&mlon=LNG#map=19/LAT/LNG` (înlocuiți LAT, LNG).

## Ce aduceți înapoi

1. Pozele, într-un singur dosar → le pune Boss în `img/sibiu/`.
2. Câte un rând per teren în `tools/data/field_sibiu.csv` (deschide-l în Excel / Google Sheets):

| Coloană | Exemplu | Obligatoriu |
|---|---|---|
| `id` | `sb18` | da |
| `visited_on` | `2026-10-27` | da |
| `visited_by` | inițiale, ex. `TC` | da |
| `condition` | `1`–`5`, gol dacă nu se poate evalua | da |
| `access` | `public` / `privat` / `închis` / `nu există` | da |
| `surface` | `asfalt`, `tartan`, `gazon sintetic`… | nu |
| `lighting` | `da` / `nu` / `nu știu` | nu |
| `equipment` | ex. `2 coșuri, unul fără plasă` | nu |
| `issues` | ex. `fisuri mari sub coșul de est` | nu |
| `maintainer` | doar dacă scrie pe un panou | nu |
| `photos` | `sb18_1.jpg;sb18_2.jpg;sb18_3.jpg` | nu |
| `notes` | orice altceva | nu |

Apoi: `node tools/import_field.mjs` (verifică rândurile și pozele) → `node tools/inject_sibiu.mjs`.
