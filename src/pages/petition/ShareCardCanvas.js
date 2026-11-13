import { useApp } from "../../app/core.js";
import { T } from "../../i18n/strings.js";
import { courtStatusView } from "../../lib/court-status-view.js";
import { useEffect, useRef, useState } from "../../lib/react.js";
import { scoredCourts } from "../../lib/scored-courts.js";

export function ShareCardCanvas({ total }) {
  var app = useApp();
  var lang = app.lang;
  var canvasRef = useRef(null);
  var readySt = useState(false);
  var ready = readySt[0], setReady = readySt[1];

  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var W = 1200, H = 630;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#060B15"; ctx.fillRect(0, 0, W, H);
    // Subtle grid
    ctx.strokeStyle = "rgba(255,255,255,.018)"; ctx.lineWidth = 1;
    for (var gxi = 0; gxi <= W; gxi += 48) { ctx.beginPath(); ctx.moveTo(gxi,0); ctx.lineTo(gxi,H); ctx.stroke(); }
    for (var gyi = 0; gyi <= H; gyi += 48) { ctx.beginPath(); ctx.moveTo(0,gyi); ctx.lineTo(W,gyi); ctx.stroke(); }
    // Glow blobs
    var g1 = ctx.createRadialGradient(180, 150, 0, 180, 150, 480);
    g1.addColorStop(0, "rgba(16,185,129,.28)"); g1.addColorStop(1, "transparent");
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    var g2 = ctx.createRadialGradient(1060, 510, 0, 1060, 510, 360);
    g2.addColorStop(0, "rgba(249,115,22,.22)"); g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
    var g3 = ctx.createRadialGradient(880, 190, 0, 880, 190, 280);
    g3.addColorStop(0, "rgba(13,148,136,.14)"); g3.addColorStop(1, "transparent");
    ctx.fillStyle = g3; ctx.fillRect(0, 0, W, H);
    // Left gradient bar
    var barGrad = ctx.createLinearGradient(0, 0, 0, H);
    barGrad.addColorStop(0, "#10B981"); barGrad.addColorStop(0.5, "#0D9488"); barGrad.addColorStop(1, "#10B981");
    ctx.fillStyle = barGrad; ctx.fillRect(0, 0, 6, H);

    // City pill — auto-sized
    var pillText = "CIVIC INITIATIVE  ·  TÂRGU MUREȘ  ·  SIBIU";
    ctx.font = "bold 13px monospace";
    var pillW = ctx.measureText(pillText).width + 36;
    var pillX = 80, pillY = 52, pillH = 34;
    ctx.fillStyle = "rgba(16,185,129,.11)";
    ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, 17); ctx.fill();
    var pStroke = ctx.createLinearGradient(pillX, 0, pillX+pillW, 0);
    pStroke.addColorStop(0, "rgba(16,185,129,.55)"); pStroke.addColorStop(0.6, "rgba(13,148,136,.35)"); pStroke.addColorStop(1, "rgba(249,115,22,.25)");
    ctx.strokeStyle = pStroke; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, 17); ctx.stroke();
    ctx.fillStyle = "#10B981"; ctx.font = "bold 13px monospace"; ctx.textBaseline = "middle";
    ctx.fillText(pillText, pillX + 18, pillY + pillH/2); ctx.textBaseline = "alphabetic";

    // Title
    ctx.fillStyle = "#FFFFFF"; ctx.font = "bold 70px monospace";
    ctx.fillText("FROM GREY", 80, 168);
    var titleG = ctx.createLinearGradient(80, 0, 520, 0);
    titleG.addColorStop(0, "#10B981"); titleG.addColorStop(0.55, "#0D9488"); titleG.addColorStop(1, "#F97316");
    ctx.fillStyle = titleG; ctx.font = "bold 70px monospace";
    ctx.fillText("TO PLAY", 80, 248);
    ctx.fillStyle = "#6B7280"; ctx.font = "21px sans-serif";
    ctx.fillText("Documentăm inegalitatea infrastructurii sportive", 80, 284);

    // Divider
    var div = ctx.createLinearGradient(80, 0, 1120, 0);
    div.addColorStop(0, "rgba(16,185,129,.45)"); div.addColorStop(0.5, "rgba(255,255,255,.09)"); div.addColorStop(1, "rgba(249,115,22,.25)");
    ctx.strokeStyle = div; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(80, 312); ctx.lineTo(1120, 312); ctx.stroke();

    // Stat 1 — signatures
    ctx.fillStyle = "#F97316"; ctx.font = "bold 100px monospace";
    ctx.fillText(String(total || 0), 80, 430);
    ctx.fillStyle = "#9CA3AF"; ctx.font = "bold 17px monospace";
    ctx.fillText(lang === "ro" ? "SEMNĂTURI PE PETIȚIE" : "PETITION SIGNATURES", 80, 458);

    // Vertical separator
    ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(680, 325); ctx.lineTo(680, 475); ctx.stroke();

    // Stat 2 — degraded courts
    // Only scored courts count (all of TGM; field-verified elsewhere) — "0/35 degraded" for an unvisited city would be false.
    var scoredN = scoredCourts();
    var deg = scoredN.filter(function(c) { return courtStatusView(c, T[lang] || T.ro).bad; }).length;
    ctx.fillStyle = "#10B981"; ctx.font = "bold 100px monospace";
    ctx.fillText(scoredN.length ? deg + "/" + scoredN.length : "—", 720, 430);
    ctx.fillStyle = "#9CA3AF"; ctx.font = "bold 17px monospace";
    ctx.fillText(lang === "ro" ? "TERENURI DEGRADATE" : "DEGRADED COURTS", 720, 458);

    // Footer
    var footG = ctx.createLinearGradient(80, 0, 1120, 0);
    footG.addColorStop(0, "rgba(16,185,129,.35)"); footG.addColorStop(1, "rgba(255,255,255,.04)");
    ctx.strokeStyle = footG; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(80, 505); ctx.lineTo(1120, 505); ctx.stroke();
    ctx.fillStyle = "#374151"; ctx.font = "bold 16px monospace";
    ctx.fillText("fromgreytoplay.netlify.app", 80, 535);
    var dateStr = new Date().toLocaleDateString(lang === "ro" ? "ro-RO" : "en-GB");
    ctx.fillStyle = "#4B5563"; ctx.font = "16px monospace";
    ctx.fillText(dateStr, 1120 - ctx.measureText(dateStr).width, 535);

    setReady(true);
  }, [total, lang]);

  function download() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "fromgraytoplay-" + (total || 0) + "-signatures.png";
    a.click();
  }

  return React.createElement("div", { className: "card mt-2" },
    React.createElement("h3", { className: "mb-1", style: { fontSize: ".9rem" } },
      lang === "ro" ? "Card partajare" : lang === "hu" ? "Megosztási kártya" : "Share card"
    ),
    React.createElement("p", { className: "text-xs mb-2", style: { color: "var(--textSec)" } },
      lang === "ro" ? "Imagine 1200×630 gata de postat pe rețele sociale."
      : "1200×630 image ready to post on social media."
    ),
    React.createElement("canvas", { ref: canvasRef, className: "share-canvas" }),
    ready && React.createElement("button", {
      className: "btn btn-green btn-block mt-2", onClick: download
    }, (lang === "ro" ? "Descarcă PNG" : lang === "hu" ? "PNG letöltése" : "Download PNG"))
  );
}
