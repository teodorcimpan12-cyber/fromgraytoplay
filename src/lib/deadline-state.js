/* Impact → ✉️: letters sent from the site (letters/: city, court, legal basis, date — no personal data),
   with the legal answer deadline counting down, and "City Hall replied" logging. */
/* Legal answer clock, shared by LettersTracker, RequestTracker and the court page.
   start = the date of a real registration/send; never a guess. */
export function deadlineState(startIso, days, answered, now) {
  const start = Date.parse(startIso); now = now || Date.now();
  if (!isFinite(start)) return null;
  const due = start + days * 864e5;
  return { start, due, left: Math.ceil((due - now) / 864e5), pct: Math.max(0, Math.min(100, (now - start) / (due - start) * 100)), st: answered ? "done" : now <= due ? "wait" : "late" };
}
