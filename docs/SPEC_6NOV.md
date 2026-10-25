# Spec — features to build live at Astra Hack (6–7 Nov)

Spec only. Nothing here is implemented yet. Both features must work for `tgm` and `sibiu`.

---

## 1. AI Court Doctor

**Goal:** a citizen uploads a photo of a court and gets a structured diagnosis that becomes a
report and fills the missing `condition` for unverified (Sibiu) courts.

### Flow
1. Court detail → **🩺 Court Doctor** → camera / file picker (reuse `compressImage`, max ~150 KB).
2. Image + court metadata (sport, surface, city) → serverless function (Netlify Function) → vision model.
3. Model returns strict JSON:
   ```json
   {
     "condition": 1-5,
     "issues": [{ "type": "cracks|rim|net|lines|lighting|drainage|graffiti|other", "severity": 1-3, "note": "string ≤ 120 chars" }],
     "estimated_fix": { "items": ["string"], "cost_band_lei": "<10k|10-50k|50-200k|>200k" },
     "confidence": 0-1,
     "is_sports_court": true
   }
   ```
4. UI shows the diagnosis card; user confirms → `reports/` push with `source: "court-doctor"`,
   `diagnosis` object, `photoDataUrl`, `city`. Activity entry `type: "diagnosis"`.
5. If `confidence ≥ 0.7` and the court is `unverified`, admin/sherif gets a one-click
   “accept condition” in the Reports tab → writes `courts/{id}/condition` (privileged only).

### Constraints
- API key only in Netlify env vars; never in `index.html`.
- Reject when `is_sports_court` is false (no report created).
- Rate limit: 3 diagnoses / voterKey / hour (checked in the function).
- Strip EXIF/GPS from the photo before sending; keep the user's opt-in GPS separately.
- Rules: `reports/$id.diagnosis` validated (condition number 1–5, issues ≤ 10).
- Labels everywhere: “AI estimate — not an official inspection”.

### Acceptance
- Photo of a cracked court → condition ≤ 2, ≥ 1 issue, report created.
- Photo of a cat → rejected, nothing written.
- Works offline-first UI: shows “needs connection” instead of hanging.

---

## 2. Letter generator v2

**Goal:** the letter is specific to the court, the city and real numbers, and can be filed
officially.

### Changes over current `LetterModal`
- **Recipient by city** from `CITY_HALL` (done) + selectable legal basis:
  OG 27/2002 petition (30 days) or Law 544/2001 information request (10 days).
- **Evidence block** auto-filled from live data for the chosen court: open reports count,
  latest report date, health score or “unverified”, number of petition signatures for that city.
- **Attachments:** include up to 3 photos from `gallery/` for the court in the PDF.
- **Tracking:** `letters/{id}: { city, courtId, basis, sentAt }` (no personal data) so the
  Impact page can show “letters sent per court” and a 30-day response countdown.
- **Reply logging:** citizen can mark “City Hall replied” + paste the reply number → activity entry.

### Constraints
- Never include TGM-specific claims in another city's letter (unit test on generated text).
- Name/address stay on the device; only aggregates go to Firebase.

### Acceptance
- `?c=sibiu` → PDF addressed to Primăria Sibiu, Str. Samuel Brukenthal nr. 2, with that court's data.
- Countdown visible on Impact for letters sent.

---

## 3. Plan de rezervă pentru cele 24 de ore (adăugat 25 oct., după verdictul /court)

| Ora | Verificare | Dacă nu |
|---|---|---|
| 0–2 | Spec recitit; cheia API e în variabilele Netlify; testul din `tools/vision_spike.mjs` a mers înainte de eveniment | Fără cheie → doar Scrisoarea v2 |
| 6 | Court Doctor cap-coadă pe **un** teren: poză → JSON → card → raport | Oprim Court Doctor, trecem pe Scrisoarea v2 |
| 12 | Scrisoarea v2 generează PDF cu dovezi pentru un teren din Sibiu | Rămânem pe Scrisoarea v1 (merge deja) |
| 18 | **Înghețare.** Doar reparații. Demo repetat de 3 ori, video de rezervă înregistrat | — |

Demo-ul funcționează și **cu zero funcții noi**: harta Sibiului cu terenurile verificate pe teren + scrisoarea v1.

## 4. Consimțământ și confidențialitate pentru Court Doctor

Spec-ul are deja: EXIF/GPS șters din poză înainte de trimitere, cheia doar pe server, limită 3/oră, eticheta
„Estimare AI — nu e o inspecție oficială”. Mai lipsea:

**Linia de consimțământ** (bifă obligatorie înainte de încărcare):
- RO: „Trimit această poză pentru o estimare automată a stării terenului. Poza e procesată de un model AI extern
  (Anthropic) printr-o funcție a acestui site, fără datele de localizare din fișier. Nu fotografiez persoane.”
- EN: "I'm sending this photo for an automatic estimate of the court's condition. It is processed by an external AI
  model (Anthropic) through this site's server function, without the file's location data. I'm not photographing people."
- HU: `// TODO: HU review` — de tradus de un vorbitor nativ.

**Notă de confidențialitate** (link lângă bifă, 4 rânduri):
1. Ce trimitem: poza (fără EXIF/GPS), sportul, suprafața și orașul terenului. Nimic despre tine.
2. Cui: funcției Netlify a site-ului, care o trimite la API-ul Anthropic; poza nu e folosită la antrenarea modelelor.
   *(De verificat de Boss în termenii Anthropic înainte de a o afirma pe site.)*
3. Ce păstrăm: dacă confirmi raportul — poza comprimată și diagnosticul, în `reports/`, ca orice sesizare. Dacă nu confirmi — nimic.
4. Ștergere: scrie la adresa din pagina de confidențialitate.

**Scorurile AI rămân separate de cele verificate:**
- Diagnosticul se scrie în `reports/{id}.diagnosis`, **niciodată** în `condition` (care rămâne doar pentru vizite pe teren — `status: "verified"`).
- Pe hartă și în grafic, un teren cu doar estimare AI rămâne „Neverificat”, cu o insignă separată „Estimare AI: N/5”.
- Exportul de date deschise (JSON/CSV) are coloana `condition_source`: `field` sau `ai_estimate`.
- Pasul 5 din fluxul de mai sus („accept condition” de admin) se schimbă: adminul poate **programa o vizită**, nu poate transforma o estimare AI în condiție verificată.
