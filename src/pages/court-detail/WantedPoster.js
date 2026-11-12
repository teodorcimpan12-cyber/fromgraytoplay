import { useApp } from "../../app/core.js";
import { SITE } from "../../data/constants.js";
import { courtStatusView } from "../../lib/court-status-view.js";
import { hoodName } from "../../lib/next-lang.js";

/* === S4-F4: Wanted Poster ===
   Canvas 1:1.78 portrait; cracked-asphalt bg, "CĂUTAT" banner, court stats, PNG download + share.
   Shown in CourtDetail for non-gym courts. */
export function _wrapText(ctx, text, maxW) {
  var words = text.split(" "), lines = [], cur = "";
  words.forEach(function(w) {
    var test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxW) { if (cur) lines.push(cur); cur = w; }
    else cur = test;
  });
  if (cur) lines.push(cur);
  return lines;
}
export function _rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
export function WantedPoster({ court, onClose }) {
  var _ref = useApp(), t = _ref.t, lang = _ref.lang, toast = _ref.toast;
  var canvasRef = React.useRef(null);
  React.useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var W = 540, H = 960;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    /* background */
    ctx.fillStyle = "#111118"; ctx.fillRect(0, 0, W, H);
    /* cracks */
    ctx.save(); ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 1;
    for (var ci = 0; ci < 14; ci++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * W, Math.random() * H);
      for (var cj = 0; cj < 3; cj++) ctx.lineTo(Math.random() * W, Math.random() * H);
      ctx.stroke();
    }
    ctx.restore();
    /* top banner */
    ctx.fillStyle = "#c8a84b"; ctx.fillRect(0, 0, W, 130);
    ctx.fillStyle = "#111"; ctx.font = "bold 72px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(t.wantedTitle || "CĂUTAT", W / 2, 65);
    /* sub label */
    ctx.fillStyle = "#c8a84b44"; ctx.fillRect(0, 130, W, 46);
    ctx.fillStyle = "#c8a84b"; ctx.font = "bold 13px 'Space Mono',monospace";
    ctx.fillText(t.wantedSub || "UN VIITOR PENTRU ACEST TEREN", W / 2, 153);
    /* court name */
    ctx.fillStyle = "#fff"; ctx.font = "bold 24px 'Space Mono',monospace";
    var nameLines = _wrapText(ctx, court.name, W - 60);
    nameLines.forEach(function(ln, i) { ctx.fillText(ln, W / 2, 210 + i * 32); });
    /* status badge */
    var sview = courtStatusView(court, t), scol = sview.color, slbl = sview.label;
    ctx.fillStyle = scol; _rrect(ctx, W / 2 - 88, 268, 176, 38, 9); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 15px 'Space Mono',monospace";
    ctx.fillText(slbl, W / 2, 291);
    /* divider */
    ctx.strokeStyle = "#c8a84b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, 326); ctx.lineTo(W - 30, 326); ctx.stroke();
    /* stats */
    ctx.fillStyle = "#999"; ctx.font = "12px 'Space Mono',monospace"; ctx.textAlign = "left";
    [
      "📍 " + court.address,
      "📊 " + (t.condition || "Stare") + ": " + (court.condition == null ? (t.unverified || "?") : court.condition + "/5"),
      "📋 " + (t.reports || "Rapoarte") + ": " + (court.reports || 0),
      "🏘 " + (t.neighbourhood || "Cartier") + ": " + (court.neighbourhood ? hoodName(court.neighbourhood, lang) : "—")
    ].forEach(function(s, i) { ctx.fillText(s, 40, 370 + i * 42); });
    /* CTA */
    ctx.fillStyle = "#10B981"; _rrect(ctx, 40, H - 200, W - 80, 62, 14); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 17px 'Space Mono',monospace"; ctx.textAlign = "center";
    ctx.fillText(t.wantedSignCta || "SEMNEAZĂ PETIȚIA", W / 2, H - 163);
    /* URL */
    ctx.fillStyle = "#aaa"; ctx.font = "11px 'Space Mono',monospace";
    ctx.fillText(SITE, W / 2, H - 90);
    /* branding */
    ctx.fillStyle = "#10B98166"; ctx.font = "bold 10px 'Space Mono',monospace";
    ctx.fillText("FROM GREY TO PLAY", W / 2, H - 40);
    ctx.textBaseline = "alphabetic";
  }, []);
  var dl = function() {
    var canvas = canvasRef.current; if (!canvas) return;
    var a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "g2p_wanted_" + court.id + ".png"; a.click();
  };
  var share = function() {
    var canvas = canvasRef.current; if (!canvas) return;
    canvas.toBlob(function(blob) {
      if (!navigator.share) { toast(t.shareUnsupported || "Link copiat"); return; }
      navigator.share({ files: [new File([blob], "g2p_wanted.png", { type: "image/png" })], title: "From Grey to Play — " + court.name, url: SITE });
    });
  };
  return React.createElement("div", { className: "modal-overlay", onClick: onClose },
    React.createElement("div", { className: "modal", onClick: function(e) { e.stopPropagation(); } },
      React.createElement("div", { className: "flex justify-between items-center mb-2" },
        React.createElement("h2", null, "🪧 ", t.wantedPoster || "Afiș CĂUTAT"),
        React.createElement("button", { onClick: onClose, style: { background: "none", border: "none", fontSize: "1.4rem", color: "var(--text)" } }, "✕")
      ),
      React.createElement("canvas", { ref: canvasRef, style: { width: "100%", maxWidth: 320, display: "block", margin: "0 auto", borderRadius: 8, background: "#111" } }),
      React.createElement("div", { className: "flex gap-1 mt-2" },
        React.createElement("button", { className: "btn btn-green", onClick: dl }, "⬇️ PNG"),
        React.createElement("button", { className: "btn btn-outline", onClick: share }, "📤 Share")
      )
    )
  );
}
