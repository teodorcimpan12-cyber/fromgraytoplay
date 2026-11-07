# Handoff: planul de business pentru From Grey to Play

Scris de Claudiu pe 6 noiembrie 2026, la cererea lui Teodor Cîmpan, ca sesiunea următoare să înceapă direct cu planificarea.
**Prima regulă: Teodor își aduce ideile. Sesiunea începe ascultându-l, nu cu un plan gata scris.**

## Ce se cere

Un plan de business pentru proiect, construit pornind de la ideile lui Teodor. În sesiunea următoare:
1. Teodor își spune ideile. Le notăm întâi, așa cum le spune, fără să le judecăm (secțiunea „Ideile lui Teodor” de mai jos).
2. Le punem în structura de mai jos și marcăm ce e **fapt** (cu sursă), ce e **ipoteză** și ce **nu știm încă**.
3. Pentru fiecare ipoteză alegem un test ieftin și rapid: cu cine vorbim, ce întrebăm, până când.

Unde trăiește planul: un document pe care Teodor îl poate edita și trimite (Claude Docs sau Google Docs, să aleagă el), plus un rezumat aici, în repo.

## Reguli (din proiect, valabile și aici)

- **Fără cifre inventate.** Fiecare număr are sursa lângă el. Unde nu știm, scriem „nu știm” și cum aflăm.
- Datele din Târgu Mureș nu se atribuie Sibiului, și invers.
- Datele din satelit nu arată starea de azi. O estimare AI nu e o inspecție.
- Teodor scrie în română. Răspunsurile tot în română. Asistentul se numește Claudiu.

## Ce avem deja (de citit la început)

| Fișier | Ce conține |
|---|---|
| `docs/03-business.md` | Fișa de business din kitul Astra: utilizator, cine câștigă, „cine plătește: încă nu știm”, alternative, de ce acum, o singură metrică de impact |
| `docs/PITCH.md` | Pitch-ul de 60 de secunde (Sibiu) și cel de 3 minute (TGM). Atenție la cifrele fără sursă de mai jos. |
| `docs/VALIDATION.md` | Tabelul cu oamenii din afara echipei care au văzut aplicația. **La 6 noiembrie: 0 rânduri.** |
| `docs/INVESTITII_SIBIU.md` | Ce investește Sibiul în sport (Baza Obor 12,7 mil. lei, terenul Onisifor Ghibu 565.000 lei, licitația Radu Selejan) |
| `CITY_HALL_BRIEF.md`, `docs/SIBIU_BRIEF.md` | Cine decide în primării, contacte, legi utile |
| `CLAUDE.md` → „Owner's backlog” | Entitatea juridică și redesignul mobile-first, amânate până după Astra Hack |

**Date oficiale (Legea 544/2001):**
- **CSM Târgu Mureș** (răspuns nr. 2692/03.11.2026): 1,86 mil. lei pe baze sportive în 4 ani. 49,5% din sumă a mers la omologarea pentru Liga 3 și la platforma pietonală de la Sala Polivalentă. Bugetul CSM a crescut cu 70%, cheltuielile pe baze au scăzut cu 65% (2022 → 2025).
- **Serviciul Public Sport și Agrement Sibiu** (nr. 4541/03.11.2026): a investit 2022–2026 doar în 4 baze mari (Păltiniș, Stadionul Municipal, Obor, Lacul lui Binder). Răspunsul nu dă sume, nici starea terenurilor, și nu pomenește niciun teren de cartier.
- **Primăriile TGM** (nr. 51941/04.11.2026) **și Sibiu** (nr. 89234/03.11.2026) au prelungit termenul. Răspunsurile vin până pe **25.11.2026**.

**Tracțiune până acum (date TGM):** sondaj în care 12 din 15 vecini nu-și folosesc terenul cel mai apropiat, plus contorul global de voturi pentru petiție.

**Sibiu:** 36 de terenuri pe hartă: 35 din OpenStreetMap plus Stadionul Independența, adăugat pe 6 noiembrie. Niciunul nu e verificat pe teren. Auditul din satelit a fost făcut orb de 4 evaluatori; acordul între ei e slab (kappa mai ales între 0 și 0,5).

## Ce a găsit analiza /arena (6 noiembrie, 6 analiști și 3 jurați)

**Șanse estimate la Astra Hack:**
- **Fără schimbări:** locul 1 ~5–10%, podium ~20–30%.
- **Cu validare reală în Sibiu:** locul 1 ~10–15%, podium ~30–40%.
- Juriul (The Product Chapter) votează echipa care a testat cu oameni reali.

**Golurile pe care planul de business trebuie să le închidă:**
1. **Nimeni nu plătește încă.** Ipoteze netestate: licență pentru primărie, sponsor local, granturi civice.
   - **Atenție, conflict de canal:** cumpărătorul ipotetic (primăria) e chiar instituția pe care aplicația o presează. Varianta mai sigură e să prezentăm Serviciul Sport și Agrement ca **partener de date**, nu ca client.
2. **Validare zero.** Nicio persoană din Sibiu care să fi folosit aplicația, notată. Ciclul The Product Chapter (pitch → idee → prototip → test → învățare → startup) cere exact asta.
3. **Fără entitate juridică.** Nu puteți primi bani. Vezi backlogul din `CLAUDE.md`. Fiecare detaliu juridic se verifică la sursă. Întrebare deschisă: cine poate fi fondator dacă unii din echipă sunt minori?
4. **Cifre fără sursă de scos:** „5.000.000 de lei promiși” din pitch e doar valoarea implicită a unui widget (`index.html`). „Cluj 26,5 mil. lei după o petiție” nu are link. „Doi dintre noi au evaluat” e greșit: au fost 4 evaluatori.
5. **Întrebări pe care le pune un investitor:** „De ce ar plăti primăria pentru un instrument care o critică?” „Ce face asta în plus față de Sibiu City App sau de bazesportive.sibiu.ro?” (niciuna nu e verificată încă).

## Structura propusă (de ajustat cu Teodor)

1. Problema, cu dovezi și surse, separat pe oraș
2. Utilizatorul (tinerii din cartiere) și cine câștigă (cetățeni, primării, școli, cluburi)
3. Soluția: ce există deja, live, și ce urmează
4. Alternative și concurență
5. **Modelul de venit:** cine plătește, pentru ce, cât. La început, toate sunt ipoteze, fiecare cu un test.
6. Entitatea juridică și cum primiți bani (donații, formularul 230, sponsorizări, granturi, premii)
7. Costuri reale: Netlify, Firebase, API-ul AI, domeniu, timp. Doar cifre verificate.
8. Echipă și roluri
9. Metrici: una principală, de exemplu terenuri verificate de comunitate sau sesizări cu răspuns oficial
10. Plan pe 3, 6 și 12 luni, cu riscuri

## Ideile lui Teodor

_(de completat la începutul sesiunii următoare, cuvânt cu cuvânt)_

-

## De unde pornește sesiunea următoare

1. Citește `CLAUDE.md`, acest fișier și `docs/03-business.md`.
2. Întreabă-l pe Teodor care sunt ideile lui și notează-le mai sus.
3. Abia apoi propune cum le așezăm în structură. Nu scrie planul înainte să-l asculți.
