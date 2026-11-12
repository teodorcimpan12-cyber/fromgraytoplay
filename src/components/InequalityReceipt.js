import { ACTIVE_CITY, useApp } from "../app/core.js";
import { CityDataPending } from "./CityDataPending.js";
import { SITE } from "../data/constants.js";
import { useFirebase } from "../hooks/useFirebase.js";
import { cityName } from "../lib/city-name.js";
import { hoodName } from "../lib/next-lang.js";
import { useEffect, useRef } from "../lib/react.js";
import { gapReady, scoredCourts } from "../lib/scored-courts.js";

export function InequalityReceipt() {
  if (!gapReady()) return React.createElement(CityDataPending, null);
  var app = useApp();
  var t = app.t, lang = app.lang, toast = app.toast;
  var votes = useFirebase("votes");
  var total = votes ? (votes.flip || 0) + (votes.mural || 0) + (votes.both || 0) : 0;
  var cvRef = useRef(null);
  useEffect(function () {
    var cv = cvRef.current;
    if (!cv) return;
    var W = 560, H = 740;
    cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    // Receipt body with a jagged (torn) bottom edge.
    var zig = 14, zw = 20;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H - zig);
    for (var zx = W; zx > 0; zx -= zw) { ctx.lineTo(zx - zw / 2, H); ctx.lineTo(zx - zw, H - zig); }
    ctx.closePath();
    ctx.fillStyle = "#FBFBF8";
    ctx.fill();
    var ink = "#1A1A2E";
    var dash = function (y) {
      ctx.strokeStyle = "#9CA3AF"; ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 6]);
      ctx.beginPath(); ctx.moveTo(32, y); ctx.lineTo(W - 32, y); ctx.stroke();
      ctx.setLineDash([]);
    };
    ctx.textAlign = "center";
    ctx.fillStyle = ink;
    ctx.font = "bold 27px 'Space Mono',monospace";
    ctx.fillText("FROM GREY TO PLAY", W / 2, 58);
    ctx.font = "13px 'Space Mono',monospace";
    ctx.fillStyle = "#6B7280";
    ctx.fillText(cityName(lang).toUpperCase() + " · " + new Date().toLocaleDateString(lang === "ro" ? "ro-RO" : lang === "hu" ? "hu-HU" : "en-GB"), W / 2, 84);
    ctx.fillStyle = ink;
    ctx.font = "bold 16px 'Space Mono',monospace";
    ctx.fillText(t.receiptTitle.toUpperCase(), W / 2, 116);
    dash(138);
    // Per-neighbourhood line items from the hardcoded COURTS dataset.
    var scored = scoredCourts();
    var hoodKeys = ACTIVE_CITY === "tgm" ? ["center", "tudor", "mureseni", "auchan", "pandurilor", "libertate", "unirii", "dambu", "cornesti"]
      : scored.map(function (c) { return c.neighbourhood; }).filter(function (h, i, a) { return a.indexOf(h) === i; });
    var y = 174;
    ctx.font = "15px 'Space Mono',monospace";
    hoodKeys.forEach(function (hk) {
      var cs = scored.filter(function (c) { return c.neighbourhood === hk; });
      if (!cs.length) return;
      var avg = Math.round(cs.reduce(function (s, c) { return s + c.condition; }, 0) / cs.length);
      var mark = avg >= 4 ? "✓" : avg >= 3 ? "~" : "✗";
      var markCol = avg >= 4 ? "#10B981" : avg >= 3 ? "#F97316" : "#DC2626";
      ctx.textAlign = "left";
      ctx.fillStyle = ink;
      ctx.fillText(String(ACTIVE_CITY === "tgm" ? (t[hk] || hk) : hoodName(hk, lang)).toUpperCase(), 36, y);
      ctx.fillText(cs.length + " " + (cs.length === 1 ? t.receiptCourt1 : t.receiptCourtN), 270, y);
      ctx.fillText(avg + "/5", 448, y);
      ctx.fillStyle = markCol;
      ctx.font = "bold 17px 'Space Mono',monospace";
      ctx.fillText(mark, 510, y);
      ctx.font = "15px 'Space Mono',monospace";
      y += 36;
    });
    dash(y - 8);
    y += 26;
    var row = function (l, v, big, vCol) {
      ctx.font = (big ? "bold 20px" : "bold 15px") + " 'Space Mono',monospace";
      ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText(l + ":", 36, y);
      ctx.textAlign = "right"; ctx.fillStyle = vCol || ink;
      ctx.fillText(v, W - 36, y);
      y += big ? 42 : 34;
    };
    row(t.receiptTaxes, t.receiptSame);
    row(t.receiptInvest, t.receiptUnequal);
    dash(y - 12);
    y += 20;
    row(t.receiptTotal, t.receiptFix, true, "#10B981");
    dash(y - 14);
    y += 18;
    row(t.receiptSupporters, String(total));
    // Fake barcode.
    var bx = 120;
    ctx.fillStyle = ink;
    while (bx < 440) {
      var bw = 2 + Math.random() * 6;
      ctx.fillRect(bx, y - 4, bw, 54);
      bx += bw + 2 + Math.random() * 6;
    }
    y += 76;
    ctx.textAlign = "center";
    ctx.fillStyle = "#6B7280";
    ctx.font = "13px 'Space Mono',monospace";
    ctx.fillText("fromgreytoplay.netlify.app", W / 2, y);
  }, [total, lang, t]);
  var download = function () {
    var cv = cvRef.current;
    if (!cv) return;
    var a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = "g2p-inequality-receipt.png";
    a.click();
  };
  var share = function () {
    var cv = cvRef.current;
    if (!cv) return;
    cv.toBlob(function (blob) {
      var file = blob && typeof File !== "undefined" ? new File([blob], "g2p-receipt.png", { type: "image/png" }) : null;
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: "From Grey to Play", url: SITE }).catch(function () {});
      } else if (navigator.share) {
        navigator.share({ title: "From Grey to Play", text: t.receiptTitle, url: SITE }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(SITE).then(function () { toast(t.copiedLink); }).catch(function () {});
      }
    });
  };
  return React.createElement("div", { className: "card mt-2", style: { borderLeft: "3px solid var(--red)" } },
    React.createElement("h3", { className: "mb-1", style: { fontSize: ".95rem" } }, t.receiptTitle),
    React.createElement("p", { className: "text-xs mb-2", style: { color: "var(--textSec)" } }, t.receiptSub),
    React.createElement("canvas", { ref: cvRef, className: "receipt-canvas" }),
    React.createElement("div", { className: "flex gap-1", style: { justifyContent: "center" } },
      React.createElement("button", { className: "btn btn-green btn-sm", onClick: download }, "⬇️ PNG"),
      React.createElement("button", { className: "btn btn-outline btn-sm", onClick: share }, "📤 " + t.share)
    )
  );
}
