import { useApp } from "../app/core.js";
import { QuickReportModal } from "./QuickReportModal.js";
import { useEffect, useState } from "../lib/react.js";
import { reportDraft } from "../lib/report-draft.js";

export function QuickReportFAB() {
  const { t, firebaseUser } = useApp();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = e => setOpen({ courtId: (e.detail && e.detail.courtId) || "" });
    window.addEventListener("g2p:report", h);
    return () => window.removeEventListener("g2p:report", h);
  }, []);
  // Back from signing in with a draft waiting: reopen it.
  useEffect(() => { if (firebaseUser && reportDraft()) setOpen(o => o || {}); }, [firebaseUser && firebaseUser.uid]);
  return React.createElement(React.Fragment, null,
    React.createElement("button", { className: "fab", onClick: () => setOpen({}) }, "＋ ", t.reportFab),
    open && React.createElement(QuickReportModal, { courtId: open.courtId, onClose: () => setOpen(false) })
  );
}
