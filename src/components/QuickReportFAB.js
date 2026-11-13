import { useApp } from "../app/core.js";
import { QuickReportModal } from "./QuickReportModal.js";
import { useEffect, useState } from "../lib/react.js";
import { reportDraft } from "../lib/report-draft.js";

export function QuickReportFAB() {
  const { t, firebaseUser } = useApp();
  const [open, setOpen] = useState(false);
  // Home opener already has its own "Raportează" button: hide the duplicate while it is on screen.
  const [dup, setDup] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => { raf = 0; const el = document.querySelector(".ao-cta"); if (!el) { setDup(false); return; } const r = el.getBoundingClientRect(); setDup(r.bottom > 0 && r.top < innerHeight); };
    const q = () => { if (!raf) raf = requestAnimationFrame(check); };
    const t = setTimeout(q, 300);
    addEventListener("scroll", q, { passive: true }); addEventListener("resize", q); addEventListener("hashchange", () => setTimeout(q, 300));
    return () => { clearTimeout(t); removeEventListener("scroll", q); removeEventListener("resize", q); if (raf) cancelAnimationFrame(raf); };
  }, []);
  useEffect(() => {
    const h = e => setOpen({ courtId: (e.detail && e.detail.courtId) || "" });
    window.addEventListener("g2p:report", h);
    return () => window.removeEventListener("g2p:report", h);
  }, []);
  // Back from signing in with a draft waiting: reopen it.
  useEffect(() => { if (firebaseUser && reportDraft()) setOpen(o => o || {}); }, [firebaseUser && firebaseUser.uid]);
  return React.createElement(React.Fragment, null,
    React.createElement("button", { className: "fab" + (dup ? " fab-dup" : ""), "aria-hidden": dup || undefined, tabIndex: dup ? -1 : undefined, onClick: () => setOpen({}) }, "＋ ", t.reportFab),
    open && React.createElement(QuickReportModal, { courtId: open.courtId, onClose: () => setOpen(false) })
  );
}
