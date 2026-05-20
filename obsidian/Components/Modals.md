---
tags: [component, modal]
symbols: [ReportModal, BookingModal, LetterModal]
---

# Modals

Three modal components, all using `.modal-overlay` / `.modal` ([[Design System]]).

## ReportModal — `index.html:1489`

`function ReportModal({ onClose })`. Lets a resident report a court.

- Fields: `name, address, condition (1–5 slider), description, category`
  (default `basketball`).
- `sub()` (1503) validates name+address, then **pushes a new court**:
  ```js
  db.ref("courts").push({ ...f, status:"degraded", occupancy:"empty",
    progress:0, date, lat: 46.545+rand, lng: 24.555+rand, reports:1 });
  ```
- `gps()` (1527) tries `navigator.geolocation` to set real coords.
- Note: reports become **courts**, not a separate `reports/` path
  ([[Firebase Schema]]).

## BookingModal — `index.html:1613`

`function BookingModal({ ... })`. Reserve a court slot.

- `book()` (1634) writes to `bookings/`:
  `{ courtId, date, hour, userName }`.
- Should `logActivity("booking", ...)` per [[Conventions]].

## LetterModal — `index.html:2017`

`function LetterModal({ ... })`. Generate a letter to the council —
seed of roadmap **#2.2**.

- `dl()` (2027) downloads the composed letter.
- Currently text-based. The roadmap wants jsPDF output + a `mailto:`
  prefill citing signature count + nearest court. See [[Roadmap]].

## Shared pattern

All three: click overlay to close, `stopPropagation` on the inner modal,
toast on success/validation error.
