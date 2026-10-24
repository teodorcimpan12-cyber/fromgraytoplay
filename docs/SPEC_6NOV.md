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
