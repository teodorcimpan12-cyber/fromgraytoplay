import { loadJsPDF } from "../../lib/load-jspdf.js";
import { COURTS, useApp } from "../../app/core.js";
import { SITE } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { courtStatusView } from "../../lib/court-status-view.js";
import { useState } from "../../lib/react.js";

/* === Impact === */
/* === Auto-dossier PDF generator (#2.3) === */
export function DossierButton() {
  const { t, lang, toast } = useApp();
  const votes = useFirebase("votes");
  const signups = useFirebase("signupStats");
  const reports = useFirebase("reports");
  const gallery = useFirebase("gallery");
  const ratings = useFirebase("ratings");
  const [busy, setBusy] = useState(false);
  const generate = async () => {
    const JsPDF = await loadJsPDF().catch(() => null);
    if (!JsPDF) { toast(t.error); return; }
    setBusy(true);
    toast(t.dossierGenerating);
    try {
      const doc = new JsPDF({ unit: "mm", format: "a4" });
      const W = 210, H = 297, M = 18, maxW = W - M * 2;
      const green = [16, 185, 129], coral = [249, 115, 22], dark = [26, 26, 46];
      const tv = votes ? (votes.flip || 0) + (votes.mural || 0) + (votes.both || 0) : 0;
      const sCount = signups ? Object.keys(signups).length : 0;
      const vCount = signups ? Object.values(signups).filter(s => s.volunteer).length : 0;
      const repList = reports ? Object.values(reports) : [];
      const resolved = repList.filter(r => r.status === "resolved").length;
      const photos = gallery ? Object.values(gallery) : [];
      // ---- Cover page ----
      doc.setFillColor(...dark); doc.rect(0, 0, W, H, "F");
      doc.setFillColor(...green); doc.rect(0, 110, W, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text("FROM GREY TO PLAY", M, 30);
      doc.setFontSize(34); doc.setTextColor(...green);
      doc.text(t.dossierTitle, M, 95);
      doc.setTextColor(200, 200, 210); doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      doc.splitTextToSize(t.dossierForCouncil, maxW).forEach((l, i) => doc.text(l, M, 126 + i * 6));
      doc.setFontSize(9); doc.setTextColor(150, 150, 160);
      doc.text(new Date().toLocaleDateString("ro-RO") + " · " + SITE.replace("https://", ""), M, H - 20);
      // ---- Stats page ----
      doc.addPage();
      let y = 24;
      const heading = (txt) => { doc.setFillColor(...green); doc.rect(M, y - 5, 3, 7, "F"); doc.setTextColor(...dark); doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.text(txt, M + 6, y); y += 11; };
      heading(lang === "ro" ? "Sumar executiv" : lang === "hu" ? "Vezetői összefoglaló" : "Executive summary");
      const stats = [
        [String(COURTS.length), t.courtsReported],
        [String(tv), t.petitionVotes],
        [String(sCount), lang === "ro" ? "Semnături" : "Signatures"],
        [String(vCount), t.volunteers],
        [String(repList.length), lang === "ro" ? "Sesizări" : "Reports"],
        [String(resolved), t.statusResolved || "Resolved"]
      ];
      const cardW = (maxW - 10) / 3;
      stats.forEach((s, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = M + col * (cardW + 5), cy = y + row * 26;
        doc.setFillColor(245, 247, 250); doc.roundedRect(x, cy, cardW, 22, 2, 2, "F");
        doc.setTextColor(...green); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
        doc.text(s[0], x + 4, cy + 10);
        doc.setTextColor(90, 90, 100); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.splitTextToSize(s[1], cardW - 6).forEach((l, j) => doc.text(l, x + 4, cy + 16 + j * 4));
      });
      y += 26 * Math.ceil(stats.length / 3) + 8;
      // ---- Courts list ----
      heading(lang === "ro" ? "Terenuri documentate" : lang === "hu" ? "Dokumentált pályák" : "Documented courts");
      doc.setFontSize(9.5);
      COURTS.forEach(c => {
        if (y > 275) { doc.addPage(); y = 24; }
        const sc = courtStatusView(c, t).bad ? coral : green;
        doc.setFillColor(...sc); doc.circle(M + 1.5, y - 1.5, 1.5, "F");
        doc.setTextColor(40, 40, 50); doc.setFont("helvetica", "bold");
        doc.text(c.name, M + 6, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(120, 120, 130); doc.setFontSize(8);
        const sLabel = courtStatusView(c, t).label;
        doc.text(sLabel + " · " + (c.address || ""), M + 6, y + 4);
        doc.setFontSize(9.5);
        y += 9;
      });
      y += 4;
      // ---- Reports summary ----
      if (repList.length) {
        if (y > 250) { doc.addPage(); y = 24; }
        heading(lang === "ro" ? "Sesizări recente" : lang === "hu" ? "Friss bejelentések" : "Recent reports");
        doc.setFontSize(9);
        repList.slice(0, 12).forEach(r => {
          if (y > 278) { doc.addPage(); y = 24; }
          doc.setTextColor(60, 60, 70); doc.setFont("helvetica", "bold");
          doc.text("• " + (r.courtName || r.courtId || "?"), M, y);
          doc.setFont("helvetica", "normal"); doc.setTextColor(120, 120, 130);
          const desc = doc.splitTextToSize((r.description || "").slice(0, 120), maxW - 4);
          doc.text(desc[0] || "", M + 4, y + 4);
          y += 9;
        });
        y += 4;
      }
      // ---- Evidence photos ----
      const evidencePhotos = photos.filter(p => p.img).slice(0, 6);
      if (evidencePhotos.length) {
        doc.addPage(); y = 24;
        heading(lang === "ro" ? "Dovezi fotografice" : lang === "hu" ? "Fotóbizonyítékok" : "Photo evidence");
        const pw = (maxW - 6) / 2, ph = 40;
        for (let i = 0; i < evidencePhotos.length; i++) {
          const col = i % 2, row = Math.floor(i / 2);
          const x = M + col * (pw + 6), cy = y + row * (ph + 12);
          if (cy + ph > 280) break;
          try {
            const fmt = evidencePhotos[i].img.includes("png") ? "PNG" : "JPEG";
            doc.addImage(evidencePhotos[i].img, fmt, x, cy, pw, ph, undefined, "FAST");
          } catch (e) { /* skip bad image */ }
          const cap = evidencePhotos[i].caption || evidencePhotos[i].courtName || "";
          if (cap) { doc.setFontSize(7.5); doc.setTextColor(120, 120, 130); doc.text(doc.splitTextToSize(cap, pw)[0] || "", x, cy + ph + 4); }
        }
      }
      // ---- Footer on all pages ----
      const pages = doc.getNumberOfPages();
      for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        if (p === 1) continue;
        doc.setDrawColor(225, 225, 230); doc.line(M, H - 12, W - M, H - 12);
        doc.setFontSize(7); doc.setTextColor(150, 150, 160);
        doc.text("From Grey to Play · " + SITE.replace("https://", ""), M, H - 8);
        doc.text(p + " / " + pages, W - M, H - 8, { align: "right" });
      }
      doc.save("dosar_civic_g2p.pdf");
      toast(t.dossierReady);
    } catch (e) {
      toast(t.error);
    }
    setBusy(false);
  };
  return React.createElement("div", { className: "card mb-2", style: { borderLeft: "4px solid var(--green)" } },
    React.createElement("div", { className: "flex justify-between items-center", style: { gap: "1rem", flexWrap: "wrap" } },
      React.createElement("div", { style: { flex: 1, minWidth: 180 } },
        React.createElement("h3", { className: "barlow", style: { fontSize: "1.15rem", marginBottom: ".25rem" } }, t.dossier),
        React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)" } }, t.dossierSub)
      ),
      React.createElement("button", {
        className: "btn btn-dossier",
        onClick: generate, disabled: busy,
        style: { opacity: busy ? .7 : 1, whiteSpace: "nowrap" }
      }, busy ? t.dossierGenerating : "📥 " + t.dossier)
    )
  );
}
