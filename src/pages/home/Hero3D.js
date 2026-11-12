import { ACTIVE_CITY, g2pSfx, loadThree, soccerCells, useApp } from "../../app/core.js";
import { HERO_ICON } from "../../data/constants.js";
import { fxReduced } from "../../lib/fx-reduced.js";
import { animOff, motionOn } from "../../lib/g2p-egg.js";
import { useEffect, useRef, useState } from "../../lib/react.js";

/* Show-off: letter-by-letter text reveal. aria keeps the full word readable. */
export function LetterReveal({ text, base }) {
  return React.createElement("span", { className: "lr", role: "text", "aria-label": text },
    text.split("").map((ch, i) => React.createElement("span", {
      key: i, "aria-hidden": "true",
      style: { "--ld": ((base || 0) + i * 45) + "ms" }
    }, ch === " " ? " " : ch)));
}
/* === Home === */

/* ===== 3D hero (ported from demos/hero3d-demo.html; scene code unchanged, UI is React) ===== */
export function lerp(a, b, t) { return a + (b - a) * t; }
export function texFrom(canvas, rx, ry) {
  var t = new THREE.CanvasTexture(canvas);
  t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.anisotropy = 8;
  if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); }
  return t;
}
export function bballLines(cx, W, H, o) {
  cx.strokeStyle = o.color; cx.lineWidth = o.lw; cx.setLineDash(o.dash || []);
  var M = 64;
  cx.strokeRect(M, M, W - 2 * M, H - 2 * M);
  cx.beginPath(); cx.moveTo(W / 2, M); cx.lineTo(W / 2, H - M); cx.stroke();
  cx.beginPath(); cx.arc(W / 2, H / 2, 104, 0, Math.PI * 2); cx.stroke();
  var keyLen = 244, keyW = 200;
  [[M + 6, 1], [W - M - 6, -1]].forEach(function (e) {
    var bx = e[0], s = e[1];
    cx.strokeRect(s > 0 ? bx : bx - keyLen, H / 2 - keyW / 2, keyLen, keyW);
    cx.beginPath(); cx.arc(bx + s * keyLen, H / 2, 80, 0, Math.PI * 2); cx.stroke();
    var A3 = Math.PI / 2.25; cx.beginPath(); if (s > 0) cx.arc(bx + 34, H / 2, 290, -A3, A3, false); else cx.arc(bx - 34, H / 2, 290, Math.PI - A3, Math.PI + A3, false); cx.stroke();
  });
  cx.setLineDash([]);
}
/* worn, cracked asphalt — more detail + relief */
export function buildGrey(W, H) {
  var c = document.createElement("canvas"); c.width = W; c.height = H; var cx = c.getContext("2d");
  var g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#4b4f56"); g.addColorStop(1, "#34373d");
  cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  for (var i = 0; i < 7000; i++) { var v = (Math.random() * 58 - 29) | 0; cx.fillStyle = "rgb(" + (66 + v) + "," + (70 + v) + "," + (78 + v) + ")"; cx.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  // patched repairs (darker rectangles of fresher tarmac)
  for (var q = 0; q < 6; q++) { var rx = Math.random() * W, ry = Math.random() * H, rw = 70 + Math.random() * 160, rh = 60 + Math.random() * 130; cx.fillStyle = "rgba(28,30,34,.5)"; cx.fillRect(rx, ry, rw, rh); cx.strokeStyle = "rgba(10,10,12,.6)"; cx.lineWidth = 2; cx.strokeRect(rx, ry, rw, rh); }
  for (var s = 0; s < 9; s++) { var sx = Math.random() * W, sy = Math.random() * H, sr = 40 + Math.random() * 95; var rg = cx.createRadialGradient(sx, sy, 0, sx, sy, sr); rg.addColorStop(0, "rgba(10,10,13,.5)"); rg.addColorStop(1, "rgba(10,10,13,0)"); cx.fillStyle = rg; cx.beginPath(); cx.arc(sx, sy, sr, 0, Math.PI * 2); cx.fill(); }
  // oil / rust stains
  for (var o = 0; o < 7; o++) { var ox = Math.random() * W, oy = Math.random() * H, or2 = 30 + Math.random() * 60; var og = cx.createRadialGradient(ox, oy, 0, ox, oy, or2); og.addColorStop(0, "rgba(64,44,26,.38)"); og.addColorStop(1, "rgba(64,44,26,0)"); cx.fillStyle = og; cx.beginPath(); cx.arc(ox, oy, or2, 0, Math.PI * 2); cx.fill(); }
  bballLines(cx, W, H, { color: "rgba(214,208,184,.15)", lw: 6, dash: [24, 22] });
  // faded spray tag on the tarmac
  cx.save(); cx.translate(W * 0.68, H * 0.3); cx.rotate(-0.2); cx.globalAlpha = 0.16; cx.font = "bold italic 92px Impact, sans-serif"; cx.textAlign = "center"; cx.fillStyle = "#c0392b"; cx.fillText("ZONA 5", 0, 0); cx.restore();
  cx.lineCap = "round";
  for (var k = 0; k < 56; k++) { var x = Math.random() * W, y = Math.random() * H, n = 5 + (Math.random() * 7 | 0); cx.strokeStyle = "rgba(12,12,16,.62)"; cx.lineWidth = 1 + Math.random() * 2.8; cx.beginPath(); cx.moveTo(x, y); for (var j = 0; j < n; j++) { x += (Math.random() - 0.5) * 150; y += (Math.random() - 0.5) * 150; cx.lineTo(x, y); } cx.stroke(); }
  for (var p = 0; p < 16; p++) { var px = Math.random() * W, py = Math.random() * H, pr = 14 + Math.random() * 34; cx.fillStyle = "rgba(8,8,11,.82)"; cx.beginPath(); for (var a = 0; a < 11; a++) { var ang = a / 11 * Math.PI * 2, rr = pr * (0.66 + Math.random() * 0.55); var fx = px + Math.cos(ang) * rr, fy = py + Math.sin(ang) * rr; a ? cx.lineTo(fx, fy) : cx.moveTo(fx, fy); } cx.closePath(); cx.fill(); }
  for (var w = 0; w < 26; w++) { var wx = Math.random() * W, wy = Math.random() * H; cx.strokeStyle = "rgba(74,104,58," + (0.35 + Math.random() * 0.4) + ")"; cx.lineWidth = 1.6; for (var b = 0; b < 4; b++) { cx.beginPath(); cx.moveTo(wx, wy); cx.lineTo(wx + (Math.random() - 0.5) * 16, wy - 8 - Math.random() * 14); cx.stroke(); } }
  return c;
}
export function buildGreyBump(W, H) {
  var c = document.createElement("canvas"); c.width = W; c.height = H; var cx = c.getContext("2d");
  cx.fillStyle = "#808080"; cx.fillRect(0, 0, W, H);
  for (var i = 0; i < 9000; i++) { var v = (Math.random() * 120 - 60) | 0; cx.fillStyle = "rgb(" + (128 + v) + "," + (128 + v) + "," + (128 + v) + ")"; cx.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  cx.lineCap = "round";
  for (var k = 0; k < 56; k++) { var x = Math.random() * W, y = Math.random() * H, n = 5 + (Math.random() * 7 | 0); cx.strokeStyle = "#1a1a1a"; cx.lineWidth = 2 + Math.random() * 4; cx.beginPath(); cx.moveTo(x, y); for (var j = 0; j < n; j++) { x += (Math.random() - 0.5) * 150; y += (Math.random() - 0.5) * 150; cx.lineTo(x, y); } cx.stroke(); }
  for (var p = 0; p < 16; p++) { var px = Math.random() * W, py = Math.random() * H; cx.fillStyle = "#101010"; cx.beginPath(); cx.arc(px, py, 12 + Math.random() * 22, 0, Math.PI * 2); cx.fill(); }
  for (var q = 0; q < 6; q++) { cx.strokeStyle = "#3a3a3a"; cx.lineWidth = 3; cx.strokeRect(Math.random() * W, Math.random() * H, 80 + Math.random() * 150, 60 + Math.random() * 120); }
  return c;
}
/* freshly resurfaced acrylic court (placeholder — to be matched to your reference image) */
export function buildVibrant(W, H, noLines) {
  var c = document.createElement("canvas"); c.width = W; c.height = H; var cx = c.getContext("2d");
  var M = 64, cyc = H / 2;
  cx.fillStyle = "#0D9488"; cx.fillRect(0, 0, W, H);                  // teal surround (site --teal)
  cx.fillStyle = "#1A1A2E"; cx.fillRect(M, M, W - 2 * M, H - 2 * M); // dark court (site --dark)
  // concentric site-colour fans (3pt semicircle), clipped to the court so they never bleed onto the surround
  cx.save(); cx.beginPath(); cx.rect(M, M, W - 2 * M, H - 2 * M); cx.clip();
  [[M + 44, 1], [W - M - 44, -1]].forEach(function (e) {
    var hx = e[0], s = e[1];
    function fan(R, col) { cx.fillStyle = col; cx.beginPath(); cx.moveTo(hx, cyc); cx.arc(hx, cyc, R, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI / 2 : Math.PI * 1.5, false); cx.closePath(); cx.fill(); }
    fan(298, "#10B981"); fan(228, "#0D9488"); fan(162, "#F97316"); fan(92, "#1A1A2E");
  });
  cx.restore();
  // free-throw lanes (court colour) over the fans
  var keyLen = 244, keyW = 200;
  [[M + 6, 1], [W - M - 6, -1]].forEach(function (e) { cx.fillStyle = "#1A1A2E"; cx.fillRect(e[1] > 0 ? e[0] : e[0] - keyLen, H / 2 - keyW / 2, keyLen, keyW); });
  if (noLines) return c;   // fresh surface before the markings are painted (renovate cinematic)
  // white markings
  bballLines(cx, W, H, { color: "rgba(246,248,247,.96)", lw: 6 });
  // centre emblem + wordmark
  cx.save(); cx.translate(W / 2, cyc); cx.strokeStyle = "#fff"; cx.lineWidth = 7; cx.beginPath(); cx.arc(0, 0, 48, 0, Math.PI * 2); cx.stroke();
  cx.fillStyle = "#fff"; cx.font = "bold 44px 'Space Mono', monospace"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("G2P", 0, 2); cx.restore();
  cx.fillStyle = "rgba(255,255,255,.85)"; cx.font = "bold 26px 'Space Mono', monospace"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("FROM GREY TO PLAY", W / 2, M + 30);
  return c;
}
export function buildVibBump(W, H) {
  var c = document.createElement("canvas"); c.width = W; c.height = H; var cx = c.getContext("2d");
  cx.fillStyle = "#808080"; cx.fillRect(0, 0, W, H); bballLines(cx, W, H, { color: "#b0b0b0", lw: 6 }); return c;
}
export function buildGrass(W, H) {
  var c = document.createElement("canvas"); c.width = W; c.height = H; var cx = c.getContext("2d");
  cx.fillStyle = "#3c5a33"; cx.fillRect(0, 0, W, H);
  for (var i = 0; i < 9000; i++) { var v = (Math.random() * 38 - 19) | 0; cx.fillStyle = "rgb(" + (60 + v) + "," + (92 + v) + "," + (52 + v) + ")"; cx.fillRect(Math.random() * W, Math.random() * H, 3, 3); }
  return c;
}
export function buildAsphalt(W, H) {
  var c = document.createElement("canvas"); c.width = W; c.height = H; var cx = c.getContext("2d");
  cx.fillStyle = "#3b3e43"; cx.fillRect(0, 0, W, H);
  for (var i = 0; i < 7000; i++) { var v = (Math.random() * 40 - 20) | 0; cx.fillStyle = "rgb(" + (59 + v) + "," + (62 + v) + "," + (67 + v) + ")"; cx.fillRect(Math.random() * W, Math.random() * H, 3, 3); }
  for (var s = 0; s < 16; s++) { var sx = Math.random() * W, sy = Math.random() * H, sr = 30 + Math.random() * 70; var rg = cx.createRadialGradient(sx, sy, 0, sx, sy, sr); rg.addColorStop(0, "rgba(20,20,24,.3)"); rg.addColorStop(1, "rgba(20,20,24,0)"); cx.fillStyle = rg; cx.beginPath(); cx.arc(sx, sy, sr, 0, Math.PI * 2); cx.fill(); }
  return c;
}
/* Târgu-Mureș-style apartment block facade */
export function buildBloc(base, win) {
  var c = document.createElement("canvas"); c.width = 128; c.height = 256; var cx = c.getContext("2d");
  cx.fillStyle = base; cx.fillRect(0, 0, 128, 256);
  var floors = 8, fh = 256 / floors;
  for (var f = 0; f < floors; f++) {
    var fy = f * fh;
    cx.fillStyle = "rgba(0,0,0,.08)"; cx.fillRect(0, fy + fh - 4, 128, 4); // floor slab line
    for (var wcol = 0; wcol < 4; wcol++) {
      var wx = 10 + wcol * 29;
      cx.fillStyle = "rgba(0,0,0,.18)"; cx.fillRect(wx - 2, fy + 6, 22, fh - 14); // recess
      cx.fillStyle = win; cx.fillRect(wx, fy + 8, 18, fh - 18); // glass
      cx.fillStyle = "rgba(255,255,255,.10)"; cx.fillRect(wx, fy + 8, 18, 3); // sill highlight
    }
  }
  cx.fillStyle = "rgba(20,22,26,.55)"; cx.fillRect(0, 256 - fh, 128, fh); // ground floor (shops/entrance)
  for (var d = 0; d < 4; d++) { cx.fillStyle = "rgba(150,150,150,.18)"; cx.fillRect(12 + d * 29, 256 - fh + 8, 20, fh - 16); }
  return c;
}
/* Balls, PBR, drawn per pixel on the sphere's own UV layout (three.js SphereGeometry: u -> phi, v -> theta),
   so every seam is a real curve on the ball, not a guess on a flat map. Each ball gets an albedo, a height
   field (turned into a normal map) and a roughness map.
   Basketball: equator + one meridian (planes y=0, x=0) and two curved end seams around the ±X axis,
   like an official 8-panel ball. Football: a true truncated icosahedron, 12 black pentagons and 20 white
   hexagons, puffed panels with stitched grooves. */
export function ballDir(W, H, px, py) {
  var phi = (px + 0.5) / W * Math.PI * 2, th = (py + 0.5) / H * Math.PI;
  return [-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th)];
}
export function heightToNormal(src, strength) {
  var W = src.width, H = src.height, hd = src.getContext("2d").getImageData(0, 0, W, H).data;
  var c = document.createElement("canvas"); c.width = W; c.height = H; var cx = c.getContext("2d"), out = cx.createImageData(W, H), o = out.data;
  function h(x, y) { x = (x + W) % W; y = y < 0 ? 0 : y >= H ? H - 1 : y; return hd[(y * W + x) * 4] / 255; }
  for (var y = 0; y < H; y++) {
    // near the poles a pixel column is narrow on the sphere: scale the horizontal slope so bumps stay round
    var sx = strength / Math.max(0.15, Math.sin((y + 0.5) / H * Math.PI));
    for (var x = 0; x < W; x++) {
      var dx = (h(x + 1, y - 1) + 2 * h(x + 1, y) + h(x + 1, y + 1) - h(x - 1, y - 1) - 2 * h(x - 1, y) - h(x - 1, y + 1)) * sx;
      var dy = (h(x - 1, y + 1) + 2 * h(x, y + 1) + h(x + 1, y + 1) - h(x - 1, y - 1) - 2 * h(x, y - 1) - h(x + 1, y - 1)) * strength;
      var len = Math.sqrt(dx * dx + dy * dy + 1), k = (y * W + x) * 4;
      o[k] = (-dx / len * 0.5 + 0.5) * 255; o[k + 1] = (dy / len * 0.5 + 0.5) * 255; o[k + 2] = (1 / len * 0.5 + 0.5) * 255; o[k + 3] = 255;
    }
  }
  cx.putImageData(out, 0, 0); return c;
}
// fine pebbles (basketball) drawn into a height canvas; wider near the poles so they stay round on the ball
export function ballPebbles(cx, W, H, n, r0, fill) {
  cx.fillStyle = fill;
  for (var i = 0; i < n; i++) {
    var y = Math.random() * H, x = Math.random() * W, r = r0 * (0.75 + Math.random() * 0.5);
    var sx = Math.min(8, 1 / Math.max(0.12, Math.sin(y / H * Math.PI)));
    cx.beginPath(); cx.ellipse(x, y, r * sx, r, 0, 0, 6.2832); cx.fill();
  }
}
// angular distance (radians) from direction d to the nearest basketball seam
export function bballSeamDist(d) {
  var ax = Math.abs(d[0]), ay = Math.abs(d[1]);
  var eq = Math.asin(Math.min(1, ay)), mer = Math.asin(Math.min(1, ax));
  var alpha = (73 - 68 * ay * ay) * Math.PI / 180;       // the end seams bow toward the centre at the equator, smoothly
  var end = Math.abs(Math.acos(Math.min(1, ax)) - alpha);
  return Math.min(eq, mer, end);
}
export function buildBallMaps(kind) {
  // basketball pebbles need the finer map; the football is flat panels, half the size is enough (~150 ms total)
  var W = kind === "soccer" ? 512 : 1024, H = W / 2, cells = kind === "soccer" ? soccerCells() : null, BIAS = 4.38 * Math.PI / 180;
  var hc = document.createElement("canvas"); hc.width = W; hc.height = H; var hx = hc.getContext("2d", { willReadFrequently: true });
  hx.fillStyle = "rgb(150,150,150)"; hx.fillRect(0, 0, W, H);
  if (kind !== "soccer") { ballPebbles(hx, W, H, 42000, 0.95, "rgba(225,225,225,.5)"); ballPebbles(hx, W, H, 14000, 0.6, "rgba(95,95,95,.3)"); }
  var hImg = hx.getImageData(0, 0, W, H), hd = hImg.data;
  var ac = document.createElement("canvas"); ac.width = W; ac.height = H; var ax = ac.getContext("2d"), aImg = ax.createImageData(W, H), ad = aImg.data;
  var rc = document.createElement("canvas"); rc.width = W; rc.height = H; var rx = rc.getContext("2d"), rImg = rx.createImageData(W, H), rd = rImg.data;
  for (var py = 0; py < H; py++) for (var px = 0; px < W; px++) {
    var d = ballDir(W, H, px, py), k = (py * W + px) * 4, col, h = hd[k] / 255, rough, sd;
    if (kind === "soccer") {
      // nearest pentagon, nearest two hexagons by dot product (pentagons never touch), acos only for those three
      var bp = -2, bh = -2, bh2 = -2;
      for (var i = 0; i < cells.length; i++) {
        var cc = cells[i].c, dt = d[0] * cc[0] + d[1] * cc[1] + d[2] * cc[2];
        if (cells[i].pent) { if (dt > bp) bp = dt; } else if (dt > bh) { bh2 = bh; bh = dt; } else if (dt > bh2) bh2 = dt;
      }
      var aP = Math.acos(Math.min(1, bp)) + BIAS, aH = Math.acos(Math.min(1, bh)), aH2 = Math.acos(Math.min(1, bh2));
      var pentWins = aP < aH, a1 = pentWins ? aP : aH, a2 = pentWins ? aH : Math.min(aP, aH2), best = { pent: pentWins };
      sd = (a2 - a1) / 2;                                   // angular distance to the panel edge
      var puff = Math.min(1, sd / 0.11);                    // panels bulge, the stitched edge sinks
      h = 0.25 + 0.75 * Math.sqrt(puff);
      var base = best.pent ? [24, 24, 26] : [244, 244, 240];
      var edge = sd < 0.011 ? 0.5 : sd < 0.024 ? 0.86 : 1;   // dark stitch line, soft shadow beside it
      col = [base[0] * edge, base[1] * edge, base[2] * edge];
      rough = sd < 0.015 ? 0.75 : best.pent ? 0.32 : 0.26;  // glossy synthetic leather, matte stitches
    } else {
      sd = bballSeamDist(d);
      var seam = sd < 0.014, shoulder = sd < 0.03;
      if (seam) { h = 0.05; col = [22, 18, 16]; rough = 0.9; }
      else {
        h = h * (shoulder ? 0.55 + 0.45 * (sd - 0.014) / 0.016 : 1);
        var g = 0.93 + 0.12 * h;                              // pebble tops catch a little more light
        col = [226 * g, 104 * g, 42 * g]; rough = 0.62 + (1 - h) * 0.18;
      }
    }
    hd[k] = hd[k + 1] = hd[k + 2] = Math.max(0, Math.min(255, h * 255));
    ad[k] = col[0]; ad[k + 1] = col[1]; ad[k + 2] = col[2]; ad[k + 3] = 255;
    rd[k] = rd[k + 1] = rd[k + 2] = rough * 255; rd[k + 3] = 255;
  }
  hx.putImageData(hImg, 0, 0); ax.putImageData(aImg, 0, 0); rx.putImageData(rImg, 0, 0);
  return { map: ac, normal: heightToNormal(hc, kind === "soccer" ? 3.2 : 2.0), rough: rc };
}
export function ballMaterial(kind) {
  function lin(cv) { var t = new THREE.CanvasTexture(cv); t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; return t; }
  var m = buildBallMaps(kind);
  return new THREE.MeshStandardMaterial({
    map: lin(m.map), normalMap: lin(m.normal), normalScale: new THREE.Vector2(kind === "soccer" ? 0.7 : 0.45, kind === "soccer" ? 0.7 : 0.45),
    roughnessMap: lin(m.rough), roughness: 1, metalness: 0, emissive: new THREE.Color(0xff9a3c), emissiveIntensity: 0
  });
}
export function buildNet() {
  var c = document.createElement("canvas"); c.width = 128; c.height = 128; var cx = c.getContext("2d");
  cx.clearRect(0, 0, 128, 128); cx.strokeStyle = "rgba(245,245,245,.78)"; cx.lineWidth = 2;
  for (var i = -128; i < 128; i += 11) { cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + 128, 128); cx.stroke(); cx.beginPath(); cx.moveTo(i + 128, 0); cx.lineTo(i, 128); cx.stroke(); }
  return c;
}
export function buildMesh() {
  var c = document.createElement("canvas"); c.width = 128; c.height = 128; var cx = c.getContext("2d");
  cx.clearRect(0, 0, 128, 128); cx.strokeStyle = "rgba(38,42,48,.92)"; cx.lineWidth = 3;
  for (var x = 0; x <= 128; x += 13) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, 128); cx.stroke(); }
  for (var y = 0; y <= 128; y += 18) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(128, y); cx.stroke(); }
  return c;
}
export function buildBackboard() {
  var c = document.createElement("canvas"); c.width = 160; c.height = 110; var cx = c.getContext("2d");
  cx.fillStyle = "rgba(250,250,248,.96)"; cx.fillRect(0, 0, 160, 110);
  cx.strokeStyle = "#c2c6cc"; cx.lineWidth = 6; cx.strokeRect(3, 3, 154, 104);
  cx.strokeStyle = "#222"; cx.lineWidth = 5; cx.strokeRect(58, 44, 44, 40);
  return c;
}
export function buildPoster(title, sub, accent, icon) {
  var c = document.createElement("canvas"); c.width = 256; c.height = 340; var cx = c.getContext("2d");
  cx.fillStyle = "#16213E"; cx.fillRect(0, 0, 256, 340);
  cx.fillStyle = accent; cx.fillRect(0, 0, 256, 10);
  cx.fillStyle = accent; cx.font = "bold 17px 'Space Mono', monospace"; cx.textAlign = "center"; cx.textBaseline = "middle";
  cx.fillText("FROM GREY TO PLAY", 128, 36);
  cx.fillStyle = "#fff"; cx.font = "bold 30px 'Space Mono', monospace";
  var words = title.split(" "); cx.fillText(words[0], 128, 108); if (words[1]) cx.fillText(words.slice(1).join(" "), 128, 146);
  cx.font = "62px serif"; cx.fillText(icon, 128, 220);
  cx.fillStyle = "#C7CBD1"; cx.font = "14px 'Libre Franklin', sans-serif";
  var ww = sub.split(" "), line = "", y = 280;
  for (var i = 0; i < ww.length; i++) { var test = line + ww[i] + " "; if (cx.measureText(test).width > 224) { cx.fillText(line, 128, y); line = ww[i] + " "; y += 20; } else line = test; }
  cx.fillText(line, 128, y);
  return c;
}
export function buildWood() {
  var c = document.createElement("canvas"); c.width = 256; c.height = 64; var cx = c.getContext("2d");
  cx.fillStyle = "#6b4a2c"; cx.fillRect(0, 0, 256, 64);
  for (var i = 0; i < 40; i++) { var y = Math.random() * 64; cx.strokeStyle = "rgba(" + (60 + (Math.random() * 50 | 0)) + "," + (40 + (Math.random() * 36 | 0)) + "," + (20 + (Math.random() * 24 | 0)) + ",.5)"; cx.lineWidth = 0.5 + Math.random() * 1.5; cx.beginPath(); cx.moveTo(0, y); cx.bezierCurveTo(85, y + (Math.random() - 0.5) * 6, 170, y + (Math.random() - 0.5) * 6, 256, y + (Math.random() - 0.5) * 4); cx.stroke(); }
  return c;
}
/* crumbling concrete wall with faded graffiti (grey state only) */
export function buildGraffitiWall() {
  var c = document.createElement("canvas"); c.width = 512; c.height = 160; var cx = c.getContext("2d");
  cx.fillStyle = "#7a7974"; cx.fillRect(0, 0, 512, 160);
  for (var i = 0; i < 5000; i++) { var v = (Math.random() * 40 - 20) | 0; cx.fillStyle = "rgb(" + (116 + v) + "," + (115 + v) + "," + (109 + v) + ")"; cx.fillRect(Math.random() * 512, Math.random() * 160, 2, 2); }
  cx.strokeStyle = "rgba(40,40,40,.45)"; cx.lineWidth = 2;
  for (var j = 128; j < 512; j += 128) { cx.beginPath(); cx.moveTo(j, 0); cx.lineTo(j, 160); cx.stroke(); }
  var tags = [["RIP COȘ", "#c0392b", 92, 86, -0.1, 52], ["ADI+ANA", "#2e6fb0", 236, 60, 0.06, 32], ["2011", "#7d5ba6", 352, 108, -0.05, 48], ["SK8", "#e0a21a", 456, 64, 0.14, 34]];
  cx.textAlign = "center"; cx.textBaseline = "middle"; cx.lineJoin = "round";
  tags.forEach(function (tg) { cx.save(); cx.translate(tg[2], tg[3]); cx.rotate(tg[4]); cx.globalAlpha = 0.4; cx.font = "bold italic " + tg[5] + "px Impact, sans-serif"; cx.lineWidth = 7; cx.strokeStyle = "rgba(20,20,20,.7)"; cx.strokeText(tg[0], 0, 0); cx.fillStyle = tg[1]; cx.fillText(tg[0], 0, 0); cx.restore(); });
  for (var d = 0; d < 14; d++) { cx.fillStyle = "rgba(60,52,40,.22)"; cx.fillRect(Math.random() * 512, 0, 3 + Math.random() * 5, 30 + Math.random() * 110); }
  var mg = cx.createLinearGradient(0, 108, 0, 160); mg.addColorStop(0, "rgba(64,84,48,0)"); mg.addColorStop(1, "rgba(64,84,48,.7)"); cx.fillStyle = mg; cx.fillRect(0, 108, 512, 52);
  cx.strokeStyle = "rgba(25,25,25,.7)"; cx.lineWidth = 2;
  for (var k = 0; k < 7; k++) { var x = Math.random() * 512, y = Math.random() * 50; cx.beginPath(); cx.moveTo(x, y); for (var s = 0; s < 5; s++) { x += (Math.random() - 0.5) * 40; y += 12 + Math.random() * 16; cx.lineTo(x, y); } cx.stroke(); }
  return c;
}
/* Sibiu roof: red clay tiles with the town's "eye" dormers (u runs up the slope, v along the ridge) */
export function buildRoofEyes() {
  var c = document.createElement("canvas"); c.width = 256; c.height = 256; var cx = c.getContext("2d");
  cx.fillStyle = "#8f3820"; cx.fillRect(0, 0, 256, 256);
  for (var a = 0; a < 256; a += 12) for (var b = 0; b < 256; b += 10) { var v = (Math.random() * 40 - 20) | 0; cx.fillStyle = "rgb(" + (148 + v) + "," + (60 + (v * 0.6 | 0)) + "," + (36 + (v * 0.4 | 0)) + ")"; cx.fillRect(a, b + (a / 12 % 2) * 5, 10, 8); }
  [[150, 64], [150, 192], [70, 128]].forEach(function (e) {
    cx.save(); cx.translate(e[0], e[1]); cx.rotate(Math.PI / 2);
    cx.fillStyle = "#6a2412"; cx.beginPath(); cx.ellipse(0, 0, 30, 16, 0, Math.PI, 0); cx.closePath(); cx.fill();
    cx.fillStyle = "#120e0c"; cx.beginPath(); cx.moveTo(-22, 0); cx.quadraticCurveTo(0, -14, 22, 0); cx.quadraticCurveTo(0, 5, -22, 0); cx.fill();
    cx.restore();
  });
  return c;
}
/* glazed, patterned roof tiles (Palatul Culturii, Targu Mures) */
export function buildGlazedRoof() {
  var c = document.createElement("canvas"); c.width = 128; c.height = 128; var cx = c.getContext("2d");
  cx.fillStyle = "#2f6b4f"; cx.fillRect(0, 0, 128, 128);
  var cols = ["#d9a62a", "#2f6b4f", "#8a3b22", "#1f4a6b"];
  for (var y = 0; y < 128; y += 16) for (var x = 0; x < 128; x += 16) { cx.fillStyle = cols[((x + y) / 16) % 4]; cx.beginPath(); cx.moveTo(x + 8, y); cx.lineTo(x + 16, y + 8); cx.lineTo(x + 8, y + 16); cx.lineTo(x, y + 8); cx.closePath(); cx.fill(); }
  return c;
}
/* cream secession facade with arched windows */
export function buildFacade(base, rows, colsN) {
  var c = document.createElement("canvas"); c.width = 256; c.height = 128; var cx = c.getContext("2d");
  cx.fillStyle = base; cx.fillRect(0, 0, 256, 128);
  var cw = 256 / colsN, rh = 128 / rows;
  for (var r = 0; r < rows; r++) for (var k = 0; k < colsN; k++) {
    var x = k * cw + cw * 0.28, w = cw * 0.44, y = r * rh + rh * 0.22, h = rh * 0.6;
    cx.fillStyle = "#3a3f46"; cx.beginPath(); cx.moveTo(x, y + h); cx.lineTo(x, y + w / 2); cx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); cx.lineTo(x + w, y + h); cx.closePath(); cx.fill();
  }
  cx.fillStyle = "rgba(0,0,0,.12)"; for (var f = 1; f < rows; f++) cx.fillRect(0, f * rh - 2, 256, 3);
  return c;
}
/* night windows: same grid as buildBloc, ~30% lit warm, the rest black (used as emissiveMap) */
export function buildBlocLit() {
  var c = document.createElement("canvas"); c.width = 128; c.height = 256; var cx = c.getContext("2d");
  cx.fillStyle = "#000"; cx.fillRect(0, 0, 128, 256);
  var fh = 256 / 8;
  for (var f = 0; f < 7; f++) for (var wcol = 0; wcol < 4; wcol++) if (Math.random() < 0.3) { cx.fillStyle = Math.random() < 0.75 ? "#ffcf8a" : "#9fc2ff"; cx.fillRect(10 + wcol * 29, f * fh + 8, 18, fh - 18); }
  return c;
}
// vibrate only after a real tap (browsers block it otherwise and log a warning)
export function heroBuzz(pat) { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(pat); } catch (e) {} }
export function heroIsDay() { return document.documentElement.getAttribute("data-theme") !== "dark"; }
export function mountHero3D(host, opts) {
  opts = opts || {};
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(host.clientWidth || 1, host.clientHeight || 1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.touchAction = "none";
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x252b33, 8, 24);
  var camera = new THREE.PerspectiveCamera(52, (host.clientWidth || 1) / (host.clientHeight || 1), 0.1, 100);
  // lower, flatter view so the horizon and the city skyline show at the top
  var CAM = { y: 2.6, z: 4.5, ly: 0.69 };
  camera.position.set(0, CAM.y, CAM.z); camera.lookAt(0, CAM.ly, 0);

  var hemi = new THREE.HemisphereLight(0xaec6dc, 0x33302a, 0.62); scene.add(hemi);
  var amb = new THREE.AmbientLight(0xffffff, 0.3); scene.add(amb);
  var key = new THREE.DirectionalLight(0xfff2e0, 0.85); key.position.set(2.5, 5, 2.5); key.castShadow = true;
  var bigScreen = (window.innerWidth || 0) >= 900 && !(window.matchMedia && window.matchMedia("(pointer:coarse)").matches);
  key.shadow.mapSize.set(bigScreen ? 2048 : 1024, bigScreen ? 2048 : 1024); key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
  // wider shadow box: the low day sun throws long shadows past the court
  key.shadow.camera.left = -3.4; key.shadow.camera.right = 3.4; key.shadow.camera.top = 3.4; key.shadow.camera.bottom = -3.4; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.01; scene.add(key);
  var fill = new THREE.DirectionalLight(0x7e8ea0, 0.28); fill.position.set(-4, 3, -3); scene.add(fill);
  var fillWarm = new THREE.DirectionalLight(0xFFF0E0, 0.3); fillWarm.position.set(-3, 2, 4); scene.add(fillWarm);

  // everything lives in `world` (scaled to 70% — the whole scene 30% smaller)
  var S = 0.7;
  var world = new THREE.Group(); world.scale.setScalar(S); scene.add(world);
  var GY = -0.12;
  var cityGround = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ map: texFrom(buildAsphalt(512, 512), 26, 26), roughness: 1 }));
  cityGround.rotation.x = -Math.PI / 2; cityGround.position.y = GY - 0.012; cityGround.receiveShadow = true; world.add(cityGround);
  var luxLight = new THREE.PointLight(0xffe9c4, 0, 3.0); luxLight.position.set(0, 2.4, 0); world.add(luxLight);

  var group = new THREE.Group(); world.add(group);   // the whole little world — rotates
  var city = new THREE.Group(); group.add(city);     // surroundings rotate together with the court
  // grey base plate the whole world stands on (rotates with everything, so nothing floats)
  var basePlate = new THREE.Mesh(new THREE.CircleGeometry(7, 64), new THREE.MeshStandardMaterial({ map: texFrom(buildAsphalt(512, 512), 14, 14), roughness: 1 }));
  basePlate.rotation.x = -Math.PI / 2; basePlate.position.y = GY - 0.008; basePlate.receiveShadow = true; group.add(basePlate);

  var CX = 3.375, CZ = 1.856, CW = 1280, CH = 704;
  var greyImg = buildGrey(CW, CH), vibImg = buildVibrant(CW, CH), greyBump = buildGreyBump(CW, CH), vibBump = buildVibBump(CW, CH);
  var comp = document.createElement("canvas"); comp.width = CW; comp.height = CH; var compx = comp.getContext("2d");
  var bcomp = document.createElement("canvas"); bcomp.width = CW; bcomp.height = CH; var bcompx = bcomp.getContext("2d");
  var courtTex = texFrom(comp), bumpTex = texFrom(bcomp);
  var vibClean = buildVibrant(CW, CH, true);
  // p = new surface wiping over the cracks; lp (cinematic only) = the markings painting outward from the centre
  function drawCourt(p, lp) {
    var staged = lp != null;
    compx.clearRect(0, 0, CW, CH); compx.drawImage(greyImg, 0, 0);
    bcompx.clearRect(0, 0, CW, CH); bcompx.drawImage(greyBump, 0, 0);
    var split = p * CW;
    if (split > 1) {
      compx.save(); compx.beginPath(); compx.rect(0, 0, split, CH); compx.clip(); compx.drawImage(staged ? vibClean : vibImg, 0, 0); compx.restore();
      bcompx.save(); bcompx.beginPath(); bcompx.rect(0, 0, split, CH); bcompx.clip();
      if (staged) { bcompx.fillStyle = "#808080"; bcompx.fillRect(0, 0, split, CH); } else bcompx.drawImage(vibBump, 0, 0);
      bcompx.restore();
      if (p < 0.999) { var sg = compx.createLinearGradient(split - 70, 0, split + 14, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(1, "rgba(255,255,255,.55)"); compx.fillStyle = sg; compx.fillRect(split - 70, 0, 84, CH); }
    }
    if (staged && lp > 0.001) {
      var R = lp * Math.hypot(CW, CH) / 2;
      compx.save(); compx.beginPath(); compx.arc(CW / 2, CH / 2, R, 0, 6.2832); compx.clip(); compx.drawImage(vibImg, 0, 0); compx.restore();
      bcompx.save(); bcompx.beginPath(); bcompx.arc(CW / 2, CH / 2, R, 0, 6.2832); bcompx.clip(); bcompx.drawImage(vibBump, 0, 0); bcompx.restore();
      if (lp < 0.999) { compx.strokeStyle = "rgba(255,255,255,.35)"; compx.lineWidth = 10; compx.beginPath(); compx.arc(CW / 2, CH / 2, R, 0, 6.2832); compx.stroke(); }
    }
    courtTex.needsUpdate = true; bumpTex.needsUpdate = true;
  }
  var courtMat = new THREE.MeshStandardMaterial({ map: courtTex, bumpMap: bumpTex, bumpScale: 0.05, roughness: 0.74, metalness: 0 });
  var court = new THREE.Mesh(new THREE.PlaneGeometry(CX, CZ), courtMat);
  court.rotation.x = -Math.PI / 2; court.position.y = 0.001; court.receiveShadow = true; group.add(court); drawCourt(0);
  var slab = new THREE.Mesh(new THREE.BoxGeometry(CX + 0.22, 0.12, CZ + 0.22), new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.9 }));
  slab.position.y = -0.06; slab.receiveShadow = true; group.add(slab);

  // Court line markings — center circle + free-throw lines
  var lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  var centerCircle = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.012, 8, 32), lineMat);
  centerCircle.rotation.x = -Math.PI / 2; centerCircle.position.y = 0.003; group.add(centerCircle);
  var ftLineL = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.001, CZ * 0.58), lineMat.clone());
  ftLineL.position.set(-CX * 0.25, 0.003, 0); group.add(ftLineL);
  var ftLineR = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.001, CZ * 0.58), lineMat.clone());
  ftLineR.position.set(CX * 0.25, 0.003, 0); group.add(ftLineR);

  var netTex = texFrom(buildNet(), 1, 1), boardTex = texFrom(buildBackboard());
  var nets = [], hoops = [], lockerScreen = null, renovOnly = [], interactives = [];
  // Ball vs hoop sizing (court units). The basketball is 20% smaller than before (0.125 -> 0.10) and the
  // rim 15% bigger, so the ball clears the ring: 2 * BALL_R = 0.200 < inner diameter 2 * (RIM_R - RIM_T) = 0.223.
  var HOOP_S = 1.15, RIM_R = 0.11 * HOOP_S, RIM_T = 0.013 * HOOP_S, RIM_OFF = 0.015 + RIM_R + RIM_T + 0.012, BALL_R = 0.1;
  if (2 * BALL_R >= 2 * (RIM_R - RIM_T) && window.console) console.warn("hero3d: the basketball no longer fits through the rim");
  var steel = new THREE.MeshStandardMaterial({ color: 0xe8eaec, roughness: 0.4, metalness: 0.5 });
  function steelMesh(geo, x, y, z) { var m = new THREE.Mesh(geo, steel); m.position.set(x, y, z); m.castShadow = true; return m; }

  // combined goal + basketball end unit. Damaged (grey) -> pristine (renovated):
  // the whole frame leans, the backboard hangs crooked, the rim is bent and rusty.
  var endUnits = [];
  var rimClean = new THREE.Color(0xE2552B), rimRust = new THREE.Color(0x7c4a32);
  var boardClean = new THREE.Color(0xffffff), boardGrime = new THREE.Color(0x9a978c);
  var steelClean = new THREE.Color(0xe8eaec), steelRust = new THREE.Color(0x6f6052);
  function endUnit(sign) {
    var u = new THREE.Group(); group.add(u);
    var baseX = sign * (CX / 2 + 0.02), gw = 0.82, gh = 0.42, r = 0.022, postTop = gh + 0.36;
    // frame anchored at the goal base so it can lean about its feet (no floating/sinking)
    var frame = new THREE.Group(); frame.position.set(baseX, 0, 0); u.add(frame);
    frame.add(steelMesh(new THREE.CylinderGeometry(r, r, postTop, 10), 0, postTop / 2, -gw / 2));
    frame.add(steelMesh(new THREE.CylinderGeometry(r, r, postTop, 10), 0, postTop / 2, gw / 2));
    var bar = steelMesh(new THREE.CylinderGeometry(r, r, gw, 10), 0, gh, 0); bar.rotation.x = Math.PI / 2; frame.add(bar);
    var topbar = steelMesh(new THREE.CylinderGeometry(r * 0.8, r * 0.8, gw, 10), 0, postTop, 0); topbar.rotation.x = Math.PI / 2; frame.add(topbar);
    function netQuad(w, len, x, y, z, ex, ey) {
      ex = ex.clone().normalize(); ey = ey.clone().normalize(); var ez = new THREE.Vector3().crossVectors(ex, ey).normalize();
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshBasicMaterial({ map: netTex.clone(), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      m.material.map.repeat.set(w * 7, len * 7); m.material.map.wrapS = m.material.map.wrapT = THREE.RepeatWrapping; m.material.map.needsUpdate = true;
      m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(ex, ey, ez)); m.position.set(x, y, z); u.add(m); nets.push(m); return m;
    }
    // goal net stays inside the mouth (back wall + sloped top), behind the baseline and below the crossbar
    var depth = 0.28, backH = gh * 0.5;
    netQuad(gw, backH, baseX + sign * depth, backH / 2, 0, new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0));
    var lx = sign * depth, ly = backH - gh, len = Math.hypot(lx, ly);
    netQuad(gw, len, baseX + sign * depth / 2, (gh + backH) / 2, 0, new THREE.Vector3(0, 0, 1), new THREE.Vector3(lx, ly, 0));
    function netSide(zs) {
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([baseX, 0, zs, baseX, gh, zs, baseX + sign * depth, backH, zs, baseX, 0, zs, baseX + sign * depth, backH, zs, baseX + sign * depth, 0, zs]), 3));
      geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0]), 2));
      geo.computeVertexNormals();
      var t = netTex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.needsUpdate = true;
      var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); u.add(m); nets.push(m);
    }
    netSide(-gw / 2); netSide(gw / 2);
    // backboard + rim grouped at the mount so they can hang crooked when damaged
    var boardY = gh + 0.2;
    var hoop = new THREE.Group(); hoop.position.set(0, boardY, 0); frame.add(hoop);
    var boardMat = new THREE.MeshStandardMaterial({ map: boardTex, transparent: true, side: THREE.DoubleSide });
    var board = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.32), boardMat); board.position.set(-sign * 0.015, 0, 0); board.rotation.y = -sign * Math.PI / 2; board.castShadow = true; hoop.add(board);
    var rimMat = new THREE.MeshStandardMaterial({ color: 0xE2552B, roughness: 0.45 });
    var rim = new THREE.Mesh(new THREE.TorusGeometry(RIM_R, RIM_T, 16, 40), rimMat); rim.position.set(-sign * RIM_OFF, -0.07, 0); rim.rotation.x = Math.PI / 2; rim.castShadow = true; hoop.add(rim);
    var brW = RIM_OFF - RIM_R - 0.015;   // short bracket: the bigger ring sits clear of the board
    hoop.add(steelMesh(new THREE.BoxGeometry(brW, 0.012, 0.05), -sign * (0.015 + brW / 2), -0.07, 0));
    var bnet = new THREE.Mesh(new THREE.CylinderGeometry(RIM_R - RIM_T * 0.5, 0.06 * HOOP_S, 0.17 * HOOP_S, 16, 1, true), new THREE.MeshBasicMaterial({ map: netTex.clone(), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); bnet.position.set(-sign * RIM_OFF, -0.07 - 0.085 * HOOP_S, 0); hoop.add(bnet); nets.push(bnet);
    // collider data (court-local): ring centre, centre-line radius, tube radius, backboard plane
    hoops.push({ x: baseX - sign * RIM_OFF, y: boardY - 0.07, z: 0, r: RIM_R, t: RIM_T, sign: sign, boardX: baseX - sign * 0.015, boardY: boardY, net: bnet, pulse: 0 });
    endUnits.push({ frame: frame, hoop: hoop, rim: rim, rimMat: rimMat, boardMat: boardMat, sign: sign, lean: sign > 0 ? -0.1 : 0.08 });
  }
  endUnit(-1); endUnit(1);
  // d = 1 fully damaged (grey), 0 pristine (renovated)
  function applyGoalDamage(d) {
    var dc = Math.max(0, Math.min(1, d));   // d < 0 = the springy overshoot while the hoop straightens
    for (var i = 0; i < endUnits.length; i++) {
      var eu = endUnits[i];
      eu.frame.rotation.z = d * eu.lean;
      eu.hoop.rotation.z = d * 0.18 * eu.sign;
      eu.rim.rotation.x = Math.PI / 2 + d * 0.5;
      eu.rim.rotation.z = d * 0.32;
      eu.rim.position.y = -0.07 - d * 0.03;
      eu.rimMat.color.copy(rimClean).lerp(rimRust, dc);
      eu.boardMat.color.copy(boardClean).lerp(boardGrime, dc);
    }
    steel.color.copy(steelClean).lerp(steelRust, dc);
  }

  // modern anthracite fence (posts + rails + welded mesh + kickboard) on all sides, gate gap at the back
  var meshTex = buildMesh();
  var anth = new THREE.MeshStandardMaterial({ color: 0x2c3037, roughness: 0.7, metalness: 0.3 });
  var meshMatBase = { color: 0x2c3037, fenceColG: new THREE.Color(0x2c3037), fenceColV: new THREE.Color(0x3a4750) };
  var fenceMeshMat = new THREE.MeshStandardMaterial({ map: texFrom(meshTex, 1, 1), transparent: true, opacity: 0.55, side: THREE.DoubleSide, roughness: 0.8, color: 0x2c3037 });
  var fH = 0.52;
  // fence is part of the renovation: it appears (with posters + locker) only once renovated
  var fenceGroup = new THREE.Group(); city.add(fenceGroup);
  var fencePanels = [];
  function fenceSide(len, cx, cz, horiz, gate) {
    // kickboard (solid rebound board)
    var kb = new THREE.Mesh(horiz ? new THREE.BoxGeometry(len, 0.1, 0.03) : new THREE.BoxGeometry(0.03, 0.1, len), anth); kb.position.set(cx, GY + 0.05, cz); kb.castShadow = true; fenceGroup.add(kb);
    // top rail
    var tr = new THREE.Mesh(horiz ? new THREE.BoxGeometry(len, 0.035, 0.05) : new THREE.BoxGeometry(0.05, 0.035, len), anth); tr.position.set(cx, GY + fH, cz); fenceGroup.add(tr);
    // welded mesh panel
    var mt = fenceMeshMat.clone(); mt.map = mt.map.clone(); mt.map.wrapS = mt.map.wrapT = THREE.RepeatWrapping; mt.map.repeat.set(len * 5, 3); mt.map.needsUpdate = true;
    var panel = new THREE.Mesh(new THREE.PlaneGeometry(len, fH - 0.12), mt); panel.position.set(cx, GY + 0.1 + (fH - 0.12) / 2, cz); if (!horiz) panel.rotation.y = Math.PI / 2; fenceGroup.add(panel); fencePanels.push(mt);
    // posts
    var n = Math.max(2, Math.round(len / 0.55));
    for (var i = 0; i <= n; i++) { var f = i / n - 0.5; var p = new THREE.Mesh(new THREE.BoxGeometry(0.05, fH + 0.12, 0.05), anth); p.position.set(horiz ? cx + f * len : cx, GY + (fH + 0.12) / 2, horiz ? cz : cz + f * len); p.castShadow = true; fenceGroup.add(p); }
  }
  fenceSide(CX + 0.86, 0, -(CZ / 2 + 0.4), true);     // back side (full)
  fenceSide(CZ + 0.7, -(CX / 2 + 0.43), 0, false);    // left
  fenceSide(CZ + 0.7, (CX / 2 + 0.43), 0, false);     // right
  // front side: two short panels leaving a central gate gap
  fenceSide((CX + 0.86) / 2 - 0.25, -(CX + 0.86) / 4 - 0.125, (CZ / 2 + 0.4), true);
  fenceSide((CX + 0.86) / 2 - 0.25, (CX + 0.86) / 4 + 0.125, (CZ / 2 + 0.4), true);
  fenceGroup.userData.rise = true; renovOnly.push(fenceGroup);

  // realistic floodlight masts: pole + bracket + multi-lamp head, aimed at the court
  var lampMat = new THREE.MeshStandardMaterial({ color: 0x2a2c30, emissive: new THREE.Color(0xffeccd), emissiveIntensity: 0 });
  var lampFrame = new THREE.MeshStandardMaterial({ color: 0x202329, roughness: 0.7, metalness: 0.4 });
  function floodlight(px, pz) {
    var g = new THREE.Group();
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.95, 10), anth); pole.position.y = GY + 0.975; pole.castShadow = true; g.add(pole);
    var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.3), lampFrame); bracket.position.y = GY + 1.95; g.add(bracket);
    var frame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.25, 0.05), lampFrame); frame.position.set(0, GY + 2.0, 0.17); g.add(frame);
    for (var lx = -1; lx <= 1; lx++) for (var ly = 0; ly < 2; ly++) { var lamp = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.1, 0.04), lampMat); lamp.position.set(lx * 0.13, GY + 1.95 + ly * 0.105, 0.2); g.add(lamp); }
    g.position.set(px, 0, pz); g.rotation.y = Math.atan2(-px, -pz); g.userData.rise = true; group.add(g); renovOnly.push(g);
  }
  floodlight(-(CX / 2 - 0.2), -(CZ / 2 + 0.5)); floodlight(CX / 2 - 0.2, -(CZ / 2 + 0.5)); floodlight(-(CX / 2 - 0.2), CZ / 2 + 0.5); floodlight(CX / 2 - 0.2, CZ / 2 + 0.5);
  // real light from two diagonal masts — only at night, only once renovated (intensity set in applyLook)
  var floodSpots = [];
  [[-(CX / 2 - 0.2), -(CZ / 2 + 0.5)], [CX / 2 - 0.2, CZ / 2 + 0.5]].forEach(function (q) {
    var sp = new THREE.SpotLight(0xfff1d6, 0, 8, 0.95, 0.65, 1.1); sp.position.set(q[0], GY + 2.0, q[1]);
    sp.target.position.set(-q[0] * 0.25, 0, -q[1] * 0.25); group.add(sp); group.add(sp.target); floodSpots.push(sp);
  });

  // smart equipment locker (Flip-the-Court app-unlocked gear cabinet) — modern, human scale, appears only when renovated
  (function locker() {
    var g = new THREE.Group();
    var Wl = 0.42, Hl = 0.52, Dl = 0.24;
    var bodyMat = new THREE.MeshStandardMaterial({ color: 0x33383f, roughness: 0.4, metalness: 0.5 });
    var doorMat = new THREE.MeshStandardMaterial({ color: 0x3d444c, roughness: 0.5, metalness: 0.45 });
    var accent = new THREE.MeshStandardMaterial({ color: 0x10B981, emissive: new THREE.Color(0x10B981), emissiveIntensity: 0.35, roughness: 0.5 });
    var base = new THREE.Mesh(new THREE.BoxGeometry(Wl + 0.04, 0.05, Dl + 0.04), new THREE.MeshStandardMaterial({ color: 0x202327, roughness: 0.7 })); base.position.y = GY + 0.025; g.add(base);
    var body = new THREE.Mesh(new THREE.BoxGeometry(Wl, Hl, Dl), bodyMat); body.position.y = GY + 0.05 + Hl / 2; body.castShadow = true; g.add(body);
    var cap = new THREE.Mesh(new THREE.BoxGeometry(Wl + 0.05, 0.04, Dl + 0.05), bodyMat); cap.position.y = GY + 0.05 + Hl + 0.02; cap.castShadow = true; g.add(cap);
    var top = GY + 0.05 + Hl;
    var header = new THREE.Mesh(new THREE.BoxGeometry(Wl, 0.1, 0.006), accent); header.position.set(0, top - 0.08, Dl / 2 + 0.002); g.add(header);
    var scr = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.07), new THREE.MeshStandardMaterial({ color: 0x06140e, emissive: new THREE.Color(0x10B981), emissiveIntensity: 0, roughness: 0.15, metalness: 0.4 })); scr.position.set(0, top - 0.08, Dl / 2 + 0.006); g.add(scr); lockerScreen = scr.material;
    for (var dx = 0; dx < 2; dx++) for (var dy = 0; dy < 2; dy++) {
      var px2 = -0.105 + dx * 0.21, py2 = GY + 0.17 + dy * 0.17;
      var d = new THREE.Mesh(new THREE.BoxGeometry(0.185, 0.15, 0.014), doorMat); d.position.set(px2, py2, Dl / 2); g.add(d);
      var hnd = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 6), new THREE.MeshStandardMaterial({ color: 0xcfd3d6, metalness: 0.7, roughness: 0.3 })); hnd.rotation.z = Math.PI / 2; hnd.position.set(px2 + 0.05, py2, Dl / 2 + 0.012); g.add(hnd);
    }
    var lhit = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.8, 0.52), new THREE.MeshBasicMaterial({ visible: false })); lhit.position.y = GY + 0.34; g.add(lhit); // enlarged tap target
    g.position.set(-1.12, 0, -(CZ / 2 + 0.14)); g.userData.brief = "locker"; interactives.push(g);
    group.add(g); renovOnly.push(g);
  })();

  // ===== grey city (rotates with the world; never changes colour when renovated) =====
  var RX = CX / 2 + 1.4, RZ = CZ / 2 + 1.4;                 // park grass radius (large, so poles/bench/trees sit on grass)
  var park = new THREE.Mesh(new THREE.CircleGeometry(1, 46), new THREE.MeshStandardMaterial({ map: texFrom(buildGrass(512, 512), 5, 5), roughness: 1 }));
  park.rotation.x = -Math.PI / 2; park.scale.set(RX, RZ, 1); park.position.y = GY + 0.003; park.receiveShadow = true; city.add(park);
  var road = new THREE.Mesh(new THREE.TorusGeometry(1, 0.16, 2, 80), new THREE.MeshStandardMaterial({ color: 0x303338, roughness: 1 }));
  road.rotation.x = -Math.PI / 2; road.scale.set(RX + 0.55, RZ + 0.55, 1); road.position.y = GY + 0.006; city.add(road);
  // Târgu-Mureș apartment blocks, placed well outside the ring road so traffic never clips them
  var blocPal = [["#8c8f8a", "#3a4046"], ["#a89c86", "#43474b"], ["#94a0a4", "#363b41"], ["#b0a596", "#40444a"], ["#8a8d92", "#34383d"]];
  var blocTex = blocPal.map(function (pp) { return buildBloc(pp[0], pp[1]); });
  var blocLit = texFrom(buildBlocLit()), blocMats = [];   // night: random windows light up
  function bldg(x, z) {
    var h = 0.8 + Math.random() * 1.25, w = 0.7 + Math.random() * 0.7, d = 0.55 + Math.random() * 0.45;
    var tx = texFrom(blocTex[(Math.random() * blocTex.length) | 0]); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(Math.max(1, Math.round(w * 2.2)), Math.max(2, Math.round(h * 3)));
    var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ map: tx, roughness: 1, emissive: new THREE.Color(0xffd29a), emissiveMap: blocLit, emissiveIntensity: 0 })); b.position.set(x, GY + h / 2, z); city.add(b); blocMats.push(b.material);
    var roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.05, d + 0.04), new THREE.MeshStandardMaterial({ color: 0x2e3136, roughness: 1 })); roof.position.set(x, GY + h + 0.02, z); city.add(roof);
  }
  var sideX = RX + 1.85, frontZ = RZ + 1.7;
  for (var gx = -sideX; gx <= sideX; gx += 0.96) { bldg(gx + (Math.random() - 0.5) * 0.2, -(frontZ + Math.random() * 0.6)); bldg(gx + (Math.random() - 0.5) * 0.2, frontZ + Math.random() * 0.6); }
  for (var gz = -(frontZ - 0.8); gz <= frontZ - 0.8; gz += 0.9) { bldg(-(sideX + Math.random() * 0.5), gz); bldg(sideX + Math.random() * 0.5, gz); }

  // ===== city skyline far behind, drawn with ink edges (static, so the landmark stays in view):
  // TGM = blocks + Palatul Culturii; Sibiu = roofs with "eyes" + Turnul Sfatului
  var skyline = new THREE.Group(); world.add(skyline);
  (function buildSkyline() {
    var cityK = opts.city || (typeof ACTIVE_CITY !== "undefined" ? ACTIVE_CITY : "tgm");
    var ink = new THREE.LineBasicMaterial({ color: 0x1d2229, transparent: true, opacity: 0.5 });
    function sk(m) { m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 20), ink)); skyline.add(m); return m; }
    function mat(col, map) { return new THREE.MeshStandardMaterial({ color: col, map: map || null, roughness: 0.95 }); }
    function box(w, h, d, m, x, y, z) { var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, GY + y + h / 2, z); return sk(b); }
    function gable(w, h, d, m, x, y, z) {
      var s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.closePath();
      var g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2);
      var r = new THREE.Mesh(g, m); r.rotation.y = Math.PI / 2; r.position.set(x, GY + y, z); return sk(r);
    }
    function pyr(wd, h, m, x, y, z) { var p = new THREE.Mesh(new THREE.ConeGeometry(wd * 0.74, h, 4), m); p.rotation.y = Math.PI / 4; p.position.set(x, GY + y + h / 2, z); return sk(p); }
    var Z = -9.6;
    if (cityK === "sibiu") {
      var eyeTex = texFrom(buildRoofEyes(), 1, 1), roofM = mat(0xffffff, eyeTex);
      var walls = [0xe7cf9b, 0xd98b6a, 0xc9d6c0, 0xefe1c4, 0xb7c9d8, 0xe2b48e];
      [-4.6, -3.7, -2.8, -1.9, 1.0, 1.9, 2.8, 3.7, 4.6].forEach(function (hx, i) {
        var hw = 0.8 + Math.random() * 0.12, hh = 0.85 + Math.random() * 0.3, hz = Z + 0.9 + (i % 2) * 0.35;
        box(hw, hh, 0.75, mat(walls[i % walls.length]), hx, 0, hz);
        gable(hw + 0.06, 1.0 + Math.random() * 0.25, 0.85, roofM, hx, hh, hz);
      });
      // Turnul Sfatului: tall ochre tower, gate arch, steep roof with four corner turrets
      var tw = 0.62, th2 = 3.1, stone = mat(0xd8b886), dark = mat(0x6b3020);
      box(tw, th2, tw, stone, -0.45, 0, Z);
      box(0.24, 0.38, 0.02, mat(0x241c18), -0.45, 0, Z + tw / 2 + 0.01);
      box(tw + 0.06, 0.07, tw + 0.06, stone, -0.45, th2 - 0.5, Z);
      pyr(tw, 1.05, dark, -0.45, th2, Z);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { pyr(0.12, 0.34, dark, -0.45 + q[0] * tw / 2, th2, Z + q[1] * tw / 2); });
      pyr(0.06, 0.5, dark, -0.45, th2 + 1.0, Z);
    } else {
      var blocM = mat(0xffffff, (function () { var t3 = texFrom(buildBloc("#9a9c98", "#3d434a")); t3.wrapS = t3.wrapT = THREE.RepeatWrapping; t3.repeat.set(2, 4); return t3; })());
      [[-4.7, 2.4], [-3.6, 1.9], [3.5, 2.2], [4.6, 2.6], [-2.5, 1.6], [2.6, 1.7]].forEach(function (b) { box(0.9, b[1], 0.6, blocM, b[0], 0, Z + 0.6); });
      // Palatul Culturii: secession palace, glazed tile roofs, tall central tower
      var facade = texFrom(buildFacade("#d9c8a0", 3, 9)), cream = mat(0xffffff, facade), glazed = mat(0xffffff, texFrom(buildGlazedRoof(), 3, 3));
      box(2.7, 1.25, 0.9, cream, 0.3, 0, Z);
      gable(2.7, 0.55, 0.92, glazed, 0.3, 1.25, Z);
      box(0.56, 2.55, 0.56, mat(0xd9c8a0), 0.3, 0, Z + 0.32);
      pyr(0.62, 0.85, glazed, 0.3, 2.55, Z + 0.32);
      pyr(0.05, 0.4, mat(0x6b5a3a), 0.3, 3.38, Z + 0.32);
      [-1.0, 1.6].forEach(function (sx) { box(0.42, 1.65, 0.42, mat(0xd9c8a0), sx, 0, Z + 0.3); pyr(0.46, 0.5, glazed, sx, 1.65, Z + 0.3); });
    }
  })();

  // trees in the corner gaps (between road and blocks) + a bench on the grass
  var folMats = [0x2c5226, 0x386b30, 0x46823c].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 1 }); });
  function tree(x, z) {
    var g = new THREE.Group();
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.075, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 })); trunk.position.y = GY + 0.3; trunk.castShadow = true; g.add(trunk);
    // layered, slightly irregular oval crown (taller than wide) with light/dark greens for depth
    [[0, 0.66, 0, 0.26, 0], [0.17, 0.6, 0.05, 0.19, 0], [-0.15, 0.62, -0.06, 0.2, 0], [0.04, 0.82, -0.02, 0.22, 2], [-0.09, 0.78, 0.1, 0.17, 1], [0.13, 0.76, -0.1, 0.16, 2], [0, 0.96, 0.02, 0.15, 2]].forEach(function (f) { var s = new THREE.Mesh(new THREE.SphereGeometry(f[3], 12, 10), folMats[f[4]]); s.position.set(f[0], GY + f[1], f[2]); s.castShadow = true; g.add(s); });
    g.position.set(x, 0, z); city.add(g);
  }
  // trees behind the goals + one at the back — none in front of the entrance
  tree(RX - 0.5, 0); tree(-(RX - 0.5), 0); tree(0, -(RZ - 0.45));
  (function bench() {
    var g = new THREE.Group();
    var wood = new THREE.MeshStandardMaterial({ map: texFrom(buildWood(), 1, 1), roughness: 0.85 });
    var metal = new THREE.MeshStandardMaterial({ color: 0x33373d, roughness: 0.5, metalness: 0.6 });
    for (var s = 0; s < 3; s++) { var pl = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.025, 0.07), wood); pl.position.set(0, GY + 0.2, -0.08 + s * 0.08); pl.castShadow = true; g.add(pl); }
    for (var b2 = 0; b2 < 3; b2++) { var bs = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.045, 0.02), wood); bs.position.set(0, GY + 0.29 + b2 * 0.06, -0.1); bs.castShadow = true; g.add(bs); }
    [-0.26, 0.26].forEach(function (lx) {
      var front = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.03), metal); front.position.set(lx, GY + 0.1, 0.08); front.castShadow = true; g.add(front);
      var back = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.32, 0.03), metal); back.position.set(lx, GY + 0.16, -0.1); back.castShadow = true; g.add(back);
      var foot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.24), metal); foot.position.set(lx, GY + 0.01, -0.01); g.add(foot);
    });
    g.position.set(1.0, 0, RZ - 0.42); g.rotation.y = Math.PI; city.add(g);
  })();

  // ===== grey-only decay: puddles, trash, weeds in the cracks, a graffiti wall, dead street lamps =====
  var greyGroup = new THREE.Group(); group.add(greyGroup);
  var detailOnly = [];          // first thing dropped on slow phones
  var deadBulb = null;
  // trash a ball (or a tap) can send flying; `perch` = standing on the wall until the wall is shaken
  var knock = [], wallParts = [];
  function kn(o, r, kind, lieY, perch) { var k = { o: o, r: r, kind: kind, lieY: lieY, perch: !!perch, vx: 0, vy: 0, vz: 0, air: false, sp: 0 }; o.userData.kn = k; knock.push(k); return k; }
  (function decay() {
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function add(m, x, y, z) { m.position.set(x, y, z); m.castShadow = true; greyGroup.add(m); return m; }
    // puddles: dark, glossy, ragged edges
    var pudMat = new THREE.MeshStandardMaterial({ color: 0x1a2026, roughness: 0.05, metalness: 0.75, transparent: true, opacity: 0.86 });
    [[-0.9, 0.35, 0.34, 0.2], [0.55, -0.42, 0.26, 0.15], [1.2, 0.5, 0.2, 0.13], [-0.25, -0.6, 0.18, 0.1]].forEach(function (q) {
      var cg = new THREE.CircleGeometry(1, 22), pa = cg.attributes.position;
      for (var i = 1; i < pa.count; i++) { var f = rnd(0.72, 1.15); pa.setXY(i, pa.getX(i) * f, pa.getY(i) * f); }
      var m = new THREE.Mesh(cg, pudMat); m.rotation.x = -Math.PI / 2; m.rotation.z = rnd(0, 3); m.scale.set(q[2], q[3], 1); m.position.set(q[0], 0.004, q[1]); m.receiveShadow = true; m.userData.flat = true; greyGroup.add(m);
    });
    // knocked-over bin + spilled bags
    var bin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.062, 0.2, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0x3e5a46, roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide }));
    bin.rotation.set(0, 0.6, Math.PI / 2); add(bin, -1.42, 0.072, -0.55); kn(bin, 0.1, "bin", 0.072);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.012, 14), bin.material), -1.18, 0.006, -0.36).rotation.z = 0.08;
    var bin2 = new THREE.Mesh(bin.geometry, bin.material); add(bin2, 1.3, 0.1, 0.66); kn(bin2, 0.1, "bin", 0.072);   // still standing, for now
    var bagM = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.35, metalness: 0.1 });
    [[-1.26, -0.7, 0.06], [-1.15, -0.6, 0.045], [-1.32, -0.42, 0.04]].forEach(function (q) { add(new THREE.Mesh(new THREE.SphereGeometry(q[2], 10, 8), bagM), q[0], q[2] * 0.55, q[1]).scale.set(1.2, 0.6, 1); });
    // bottles (glass), cans, crumpled paper
    var glassG = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.82 });
    var glassB = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.82 });
    function bottle(x, z, m, y) { var g = new THREE.Group(); var b = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.07, 10), m); b.castShadow = true; g.add(b); var n = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.012, 0.035, 8), m); n.position.y = 0.05; g.add(n); g.rotation.set(0, rnd(0, 6), y == null ? Math.PI / 2 : 0); g.position.set(x, y == null ? 0.016 : y, z); greyGroup.add(g); kn(g, 0.05, "glass", 0.016, y != null); }
    [[0.3, 0.6, glassG], [0.42, 0.66, glassB], [-0.6, -0.2, glassG], [1.4, -0.3, glassB], [-1.5, 0.6, glassG], [0.9, 0.1, glassB], [-0.1, 0.75, glassG]].forEach(function (q) { bottle(q[0], q[1], q[2]); });
    // empties lined up on top of the crumbling wall: shake the wall (tap it, or slam a ball into the back line) and they fall
    [-1.2, -0.85, -0.3, 0.05].forEach(function (x, i) { bottle(x, -(CZ / 2 + 0.42), i % 2 ? glassB : glassG, GY + 0.46 + 0.035); });
    var shard = new THREE.TetrahedronGeometry(0.012);
    for (var s = 0; s < 9; s++) { var sh = new THREE.Mesh(shard, glassG); sh.position.set(0.36 + rnd(-0.08, 0.08), 0.004, 0.55 + rnd(-0.06, 0.06)); sh.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3)); greyGroup.add(sh); }
    var canMs = [new THREE.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.35, metalness: 0.7 }), new THREE.MeshStandardMaterial({ color: 0xc9ccd0, roughness: 0.3, metalness: 0.8 })];
    [[-0.4, 0.2], [0.75, -0.62], [1.55, 0.7], [-1.1, 0.1]].forEach(function (q, i) { var cn = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.038, 10), canMs[i % 2]); cn.rotation.set(rnd(0, 3), 0, Math.PI / 2); add(cn, q[0], 0.013, q[1]); kn(cn, 0.035, "can", 0.013); });
    var paperM = new THREE.MeshStandardMaterial({ color: 0xd8d4c8, roughness: 1, flatShading: true });
    for (var pp = 0; pp < 9; pp++) { var pm = new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(0.014, 0.024), 0), paperM); pm.rotation.set(rnd(0, 3), rnd(0, 3), 0); add(pm, rnd(-CX / 2, CX / 2), 0.012, rnd(-CZ / 2, CZ / 2)); kn(pm, 0.035, "paper", 0.012); }
    var tyre = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.03, 10, 22), new THREE.MeshStandardMaterial({ color: 0x18191b, roughness: 0.9 }));
    tyre.rotation.set(-0.35, 0.3, 0); add(tyre, 0.95, 0.1, -(CZ / 2 + 0.33));
    // weeds pushing through the cracks (instanced: one draw call)
    var blade = new THREE.ConeGeometry(0.008, 0.075, 4); blade.translate(0, 0.0375, 0);
    var weeds = new THREE.InstancedMesh(blade, new THREE.MeshStandardMaterial({ color: 0x5b7a3a, roughness: 1 }), 180);
    var dm = new THREE.Object3D(), wk = 0;
    for (var cl = 0; cl < 36; cl++) {
      var wx = rnd(-CX / 2, CX / 2), wz = cl < 14 ? (cl % 2 ? 1 : -1) * rnd(CZ / 2 - 0.12, CZ / 2) : rnd(-CZ / 2, CZ / 2);
      for (var bl2 = 0; bl2 < 5; bl2++) { dm.position.set(wx + rnd(-0.03, 0.03), 0, wz + rnd(-0.03, 0.03)); dm.rotation.set(rnd(-0.5, 0.5), rnd(0, 3), rnd(-0.5, 0.5)); dm.scale.setScalar(rnd(0.6, 1.7)); dm.updateMatrix(); weeds.setMatrixAt(wk++, dm.matrix); }
    }
    weeds.instanceMatrix.needsUpdate = true; weeds.userData.weeds = true; greyGroup.add(weeds); detailOnly.push(weeds);
    // crumbling graffiti wall where the new fence will stand (two pieces, a gap, rubble)
    var wallM = new THREE.MeshStandardMaterial({ map: texFrom(buildGraffitiWall()), roughness: 0.95 });
    var w1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.46, 0.07), wallM); w1.receiveShadow = true; add(w1, -0.55, GY + 0.23, -(CZ / 2 + 0.42)); w1.userData.sink = true; wallParts.push(w1);
    var w2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.34, 0.07), wallM); w2.rotation.z = 0.05; w2.receiveShadow = true; add(w2, 1.25, GY + 0.17, -(CZ / 2 + 0.42)); w2.userData.sink = true; wallParts.push(w2);
    var rubM = new THREE.MeshStandardMaterial({ color: 0x77766f, roughness: 1, flatShading: true });
    for (var rb = 0; rb < 7; rb++) { var rbm = add(new THREE.Mesh(new THREE.DodecahedronGeometry(rnd(0.025, 0.05), 0), rubM), rnd(0.5, 0.85), GY + 0.03, -(CZ / 2 + 0.42) + rnd(-0.05, 0.12)); rbm.rotation.set(rnd(0, 3), rnd(0, 3), 0); rbm.userData.sink = true; }
    // two old street lamps: one leaning and dead, one that flickers at night
    var poleM = new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 0.8, metalness: 0.4 });
    deadBulb = new THREE.MeshStandardMaterial({ color: 0x2b2a26, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0, roughness: 0.4 });
    var dead = new THREE.MeshStandardMaterial({ color: 0x23221f, roughness: 0.5 });
    function oldLamp(x, z, lean, ry, bulbM) {
      var g = new THREE.Group();
      var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 1.5, 8), poleM); pole.position.y = GY + 0.75; pole.castShadow = true; g.add(pole);
      var arm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.02), poleM); arm.position.set(0.15, GY + 1.5, 0); g.add(arm);
      var head = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.07), poleM); head.position.set(0.3, GY + 1.48, 0); head.castShadow = true; g.add(head);
      var bulb = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.05), bulbM); bulb.position.set(0.3, GY + 1.455, 0); g.add(bulb);
      g.rotation.set(0, ry, lean); g.position.set(x, 0, z); g.userData.sink = true; greyGroup.add(g);
    }
    oldLamp(-(CX / 2 + 0.3), CZ / 2 + 0.3, 0.13, -0.6, dead);
    oldLamp(CX / 2 + 0.35, -(CZ / 2 + 0.25), -0.04, 2.4, deadBulb);
    greyGroup.children.forEach(function (c) { c.userData.o0 = { p: c.position.clone(), r: c.rotation.clone(), s: c.scale.clone() }; });
  })();
  var greyDirty = false, sfxT = 0;
  function clink(kind) {
    if (sfxT > 0 || typeof g2pSfx !== "function") return; sfxT = 0.09;
    g2pSfx(kind === "glass" ? "click" : kind === "can" ? "clack" : kind === "bin" ? "bounce" : "flip");
  }
  function kick(k, nx, nz, power) {
    k.vx = nx * power; k.vz = nz * power; k.vy = (k.kind === "bin" ? 0.45 : 0.75) + Math.random() * 0.5;
    k.air = true; k.perch = false; k.sp = (Math.random() - 0.5) * 14; greyDirty = true; clink(k.kind);
  }
  function shakeWall() {
    for (var i = 0; i < knock.length; i++) { var k = knock[i]; if (k.perch) { k.perch = false; k.air = true; k.vx = (Math.random() - 0.5) * 0.2; k.vz = 0.25 + Math.random() * 0.35; k.vy = 0.15 + Math.random() * 0.2; k.sp = (Math.random() - 0.5) * 8; } }
    greyDirty = true; if (typeof g2pSfx === "function") g2pSfx("crack");
  }
  // balls bowl the trash over; it flies, tumbles, lands lying down and slides to a stop
  function updKnock(dt) {
    if (sfxT > 0) sfxT -= dt;
    for (var b = 0; b < balls.length; b++) {
      var bl = balls[b], bp = bl.mesh.position;
      if (bl.carried) continue;
      var bvx = bl.physics ? bl.vx : bl.vx * 60, bvz = bl.physics ? bl.vz : bl.vz * 60;
      for (var i = 0; i < knock.length; i++) {
        var k = knock[i]; if (k.perch) continue;
        var kp = k.o.position, dx = kp.x - bp.x, dz = kp.z - bp.z, rr = k.r + bl.rad;
        if (dx * dx + dz * dz < rr * rr && bp.y < kp.y + bl.rad + 0.06) {
          var d = Math.sqrt(dx * dx + dz * dz) || 0.001, nx = dx / d, nz = dz / d, sp = Math.hypot(bvx, bvz);
          kick(k, nx, nz, (0.45 + sp * 0.6) * (k.kind === "paper" ? 1.4 : k.kind === "bin" ? 0.55 : 1));
          k.vx += bvx * 0.3; k.vz += bvz * 0.3; kp.x = bp.x + nx * rr; kp.z = bp.z + nz * rr;
          if (bl.physics) { bl.vx *= 0.85; bl.vz *= 0.85; }
        }
      }
    }
    for (var j = 0; j < knock.length; j++) {
      var q = knock[j], o = q.o, P = o.position;
      if (q.perch) continue;
      if (q.air) {
        q.vy -= 3.2 * dt; P.x += q.vx * dt; P.y += q.vy * dt; P.z += q.vz * dt;
        o.rotation.x += q.sp * dt; o.rotation.y += q.sp * 0.6 * dt;
        if (P.y <= q.lieY && q.vy < 0) {
          P.y = q.lieY;
          if (q.vy < -0.7) { q.vy = -q.vy * 0.32; clink(q.kind); }
          else { q.vy = 0; q.air = false; o.rotation.set(0, o.rotation.y, q.kind === "paper" ? o.rotation.z : Math.PI / 2); }
        }
      } else if (q.vx || q.vz) {
        var fr = Math.pow(0.06, dt); q.vx *= fr; q.vz *= fr; P.x += q.vx * dt; P.z += q.vz * dt; o.rotation.y += (q.vx + q.vz) * dt * 2;
        if (Math.abs(q.vx) + Math.abs(q.vz) < 0.02) { q.vx = 0; q.vz = 0; }
      }
      var rad = Math.hypot(P.x, P.z); if (rad > 3.2) { P.x *= 3.2 / rad; P.z *= 3.2 / rad; q.vx = q.vz = 0; }
    }
  }
  // cinematic: snapshot where everything lies now, then fly it off / dry it up / sink it
  function snapshotGrey() {
    greyGroup.children.forEach(function (c) {
      var a = Math.atan2(c.position.z, c.position.x) + (Math.random() - 0.5) * 0.8;
      c.userData.f = { p: c.position.clone(), r: c.rotation.clone(), s: c.scale.clone(), d: Math.random() * 0.35, dx: Math.cos(a), dz: Math.sin(a), sp: (Math.random() - 0.5) * 12 };
    });
    greyDirty = true;
  }
  function trashFly(k) {
    var cs = greyGroup.children;
    for (var i = 0; i < cs.length; i++) {
      var c = cs[i], f = c.userData.f; if (!f) continue;
      var ki = Math.max(0, Math.min(1, (k - f.d) / 0.65)), e = ki * ki;
      if (c.userData.weeds) c.scale.set(f.s.x, Math.max(0.0001, f.s.y * (1 - ki)), f.s.z);
      else if (c.userData.flat) c.scale.copy(f.s).multiplyScalar(Math.max(0.0001, 1 - ki));
      else if (c.userData.sink) c.position.y = f.p.y - e * 1.9;
      else {
        c.position.set(f.p.x + f.dx * e * 4, f.p.y + ki * 1.3 + e * 1.2, f.p.z + f.dz * e * 4);
        c.rotation.set(f.r.x + ki * f.sp, f.r.y + ki * f.sp * 0.5, f.r.z);
        c.scale.copy(f.s).multiplyScalar(Math.max(0.0001, 1 - e * e));
      }
    }
  }
  function restoreGrey() {
    greyGroup.children.forEach(function (c) { var o = c.userData.o0; if (o) { c.position.copy(o.p); c.rotation.copy(o.r); c.scale.copy(o.s); } });
    for (var i = 0; i < knock.length; i++) { var k = knock[i]; k.vx = k.vy = k.vz = 0; k.air = false; k.perch = k.o.userData.o0.p.y > 0.2; }
    greyDirty = false;
  }

  // campaign posters hung on the back fence — appear only after renovation
  function posterOnFence(x, z, tex, key) {
    var g = new THREE.Group();
    var board = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.44), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.85 })); g.add(board);
    var frame = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.47, 0.012), new THREE.MeshStandardMaterial({ color: 0x222831, roughness: 0.6, metalness: 0.4 })); frame.position.z = -0.009; g.add(frame);
    var hit = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.22), new THREE.MeshBasicMaterial({ visible: false })); hit.position.z = 0.08; g.add(hit); // enlarged tap target
    g.position.set(x, GY + 0.31, z); g.userData.brief = key; interactives.push(g); group.add(g); renovOnly.push(g);
  }
  posterOnFence(-0.55, -(CZ / 2 + 0.33), texFrom(buildPoster("FLIP THE COURT", "Renovăm terenurile existente din cartierele periferice.", "#10B981", "🏀")), "flip");
  posterOnFence(0.55, -(CZ / 2 + 0.33), texFrom(buildPoster("STREET CANVAS", "Murale comunitare alese de localnici prin vot.", "#F97316", "🎨")), "canvas");

  // detailed cars on the ring road
  var carCols = [0x9498a0, 0x7a323c, 0x2f3b54, 0xb8b4aa, 0x39473d, 0xd0cfca, 0x4a4d52];
  function makeCar(col) {
    var g = new THREE.Group();
    var bm = new THREE.MeshStandardMaterial({ color: col, roughness: 0.42, metalness: 0.4 });
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.16), bm)).position.y = 0.06;
    var cab = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.075, 0.145), bm); cab.position.set(-0.015, 0.12, 0); g.add(cab);
    var glass = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.15), new THREE.MeshStandardMaterial({ color: 0x0f1318, roughness: 0.2, metalness: 0.6 })); glass.position.set(-0.015, 0.12, 0); g.add(glass);
    var hl = new THREE.MeshStandardMaterial({ color: 0xfff6da, emissive: 0xfff0c0, emissiveIntensity: 0.7 });
    [-0.05, 0.05].forEach(function (zz) { var h = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.025), hl); h.position.set(0.172, 0.06, zz); g.add(h); });
    var tl = new THREE.MeshStandardMaterial({ color: 0x661414, emissive: 0xcc2222, emissiveIntensity: 0.5 });
    [-0.05, 0.05].forEach(function (zz) { var h = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.025), tl); h.position.set(-0.172, 0.06, zz); g.add(h); });
    var wm = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.85 }), hub = new THREE.MeshStandardMaterial({ color: 0xb8bcc0, roughness: 0.4, metalness: 0.6 });
    [[-0.1, -0.085], [0.1, -0.085], [-0.1, 0.085], [0.1, 0.085]].forEach(function (p) { var w = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.04, 12), wm); w.rotation.x = Math.PI / 2; w.position.set(p[0], 0.038, p[1]); g.add(w); var hc = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.042, 8), hub); hc.rotation.x = Math.PI / 2; hc.position.set(p[0], 0.038, p[1]); g.add(hc); });
    city.add(g); return g;
  }
  var cars = [], NCARS = 6;
  for (var c3 = 0; c3 < NCARS; c3++) { var car = makeCar(carCols[c3 % carCols.length]); car.userData = { th: c3 / NCARS * 6.28, spd: 0.32 * (c3 % 2 ? 1 : -1), lane: c3 % 2 ? 0.13 : -0.05 }; cars.push(car); }

  // two balls — big, with an invisible larger grab target, and a soft glow until the visitor first grabs one
  var touched = false; try { touched = localStorage.getItem("g2p_hero_ball") === "1"; } catch (e) {}
  var haloTex = (function () { var c = document.createElement("canvas"); c.width = c.height = 64; var x = c.getContext("2d"); var g = x.createRadialGradient(32, 32, 4, 32, 32, 32); g.addColorStop(0, "rgba(255,206,130,.95)"); g.addColorStop(1, "rgba(255,150,50,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  var HIT_MIN = 0.24, HIT_PX = 30;   // grab radius: never under the old 0.24 court units, never under 30 CSS px on screen
  function makeBall(mat, rad) {
    var b = new THREE.Mesh(new THREE.SphereGeometry(rad, 48, 32), mat); b.castShadow = true; b.position.y = rad; group.add(b);
    var hit = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ visible: false })); hit.scale.setScalar(Math.max(rad * 1.9, HIT_MIN)); b.add(hit);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); halo.visible = !touched; group.add(halo);
    return { mesh: b, hit: hit, halo: halo, rad: rad, x: 0, y: rad, z: 0, vx: 0, vy: 0, vz: 0, physics: false, grabbed: false, carried: null, claim: null, fromPass: false, rest: 0, ph: 0, fr: 2, hgt: 0.4 };
  }
  var basket = makeBall(ballMaterial("basket"), BALL_R); basket.x = -0.6; basket.z = 0.2; basket.vx = 0.009; basket.vz = 0.006; basket.fr = 2.4; basket.hgt = 0.5;
  var soccer = makeBall(ballMaterial("soccer"), 0.118); soccer.x = 0.5; soccer.z = -0.25; soccer.vx = -0.008; soccer.vz = 0.01; soccer.ph = 1.4; soccer.fr = 2.0; soccer.hgt = 0.42;
  var balls = [basket, soccer], ballHits = [basket.hit, soccer.hit];
  function markTouched() { if (touched) return; touched = true; try { localStorage.setItem("g2p_hero_ball", "1"); } catch (e) {} }

  // stylized low-poly players (flat-shaded): run, jump, chase a ball you threw and pass it back to you
  var skins = [0xE8B98C, 0xC68642, 0xF1C9A5, 0x8D5524];
  var hairs = [0x2a1c10, 0x3a2a1c, 0x111111, 0x6b4a2b];
  var PS = 1.45;   // player scale
  function makePlayer(skin, shirt, shorts, hair, band) {
    function M(c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, flatShading: true }); }
    var g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    var sk = M(skin), sh = M(shirt), so = M(shorts), shoeM = M(0x24262b);
    var head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), sk); head.position.y = 0.31; head.castShadow = true; body.add(head);
    var hairM = new THREE.Mesh(new THREE.IcosahedronGeometry(0.053, 1), M(hair)); hairM.scale.set(1, 0.62, 1.04); hairM.position.set(0, 0.333, -0.006); body.add(hairM);
    var hb = new THREE.Mesh(new THREE.TorusGeometry(0.051, 0.008, 4, 10), M(band)); hb.rotation.x = Math.PI / 2; hb.position.y = 0.322; body.add(hb);
    var eyeM = M(0x15161a); [-0.019, 0.019].forEach(function (ex) { var ey = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.013, 0.006), eyeM); ey.position.set(ex, 0.31, 0.047); body.add(ey); });
    var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.043, 0.13, 6), sh); torso.position.y = 0.205; torso.castShadow = true; body.add(torso);
    var hip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.047, 0.045, 6), so); hip.position.y = 0.128; body.add(hip);
    // two-joint limbs: `a` swings at the hip/shoulder, `b` bends at the knee/elbow
    function limb(x, y, l1, l2, r, m1, m2, foot) {
      var a = new THREE.Group(); a.position.set(x, y, 0); body.add(a);
      var u = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.88, l1, 5), m1); u.position.y = -l1 / 2; u.castShadow = true; a.add(u);
      var b = new THREE.Group(); b.position.y = -l1; a.add(b);
      var lo = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r * 0.7, l2, 5), m2); lo.position.y = -l2 / 2; lo.castShadow = true; b.add(lo);
      if (foot) { var f = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.022, 0.054), shoeM); f.position.set(0, -l2 - 0.006, 0.012); b.add(f); }
      else { var hd = new THREE.Mesh(new THREE.IcosahedronGeometry(0.016, 0), sk); hd.position.y = -l2 - 0.008; b.add(hd); }
      return { a: a, b: b };
    }
    var u = { body: body, ll: limb(-0.025, 0.112, 0.06, 0.06, 0.019, so, sk, true), lr: limb(0.025, 0.112, 0.06, 0.06, 0.019, so, sk, true), al: limb(-0.064, 0.262, 0.065, 0.06, 0.015, sh, sk, false), ar: limb(0.064, 0.262, 0.065, 0.06, 0.015, sh, sk, false) };
    u.al.a.rotation.z = -0.12; u.ar.a.rotation.z = 0.12;
    g.userData = u; g.scale.setScalar(0.0001); g.visible = false; group.add(g); return g;
  }
  var shirtCols = [0x10B981, 0xF97316, 0x2E6FB0, 0xE0A21A], shortCols = [0x1A1A2E, 0x333333, 0x16213E, 0x244a3a], bandCols = [0xffffff, 0x0D9488, 0xF97316, 0x10B981];
  var players = [];
  for (var pi = 0; pi < 4; pi++) {
    var pl = makePlayer(skins[pi % skins.length], shirtCols[pi], shortCols[pi], hairs[pi % hairs.length], bandCols[pi]);
    Object.assign(pl.userData, { x: 0, z: 0, face: 0, st: "roam", tx: 0, tz: 0, wait: 0, ph: Math.random() * 6, jt: -1, jd: 0, pt: 0, ball: null, vis: 0, visT: 0, spd: 0 });
    players.push(pl);
  }
  var PX = CX / 2 - 0.25, PZ = CZ / 2 - 0.16;
  function pickSpot(u) { u.tx = (Math.random() * 2 - 1) * PX; u.tz = (Math.random() * 2 - 1) * PZ; }
  function playersEnter() {   // they run in through the gate in the front fence
    players.forEach(function (p, i) { var u = p.userData; u.x = (i - 1.5) * 0.14; u.z = CZ / 2 + 0.55 + (i % 2) * 0.12; u.face = Math.PI; u.st = "roam"; u.wait = 0; u.ball = null; pickSpot(u); u.visT = 1; });
  }
  function playersPlace() {
    players.forEach(function (p) { var u = p.userData; pickSpot(u); u.x = u.tx; u.z = u.tz; pickSpot(u); u.st = "roam"; u.wait = Math.random() * 1.5; u.ball = null; u.visT = 1; u.vis = 1; });
  }
  function playersLeave() {
    players.forEach(function (p) { var u = p.userData; u.visT = 0; if (u.ball) { u.ball.carried = null; u.ball.claim = null; u.ball.physics = true; u.ball.vy = 0; u.ball = null; } u.st = "roam"; });
    balls.forEach(function (b) { b.claim = null; });
  }
  function cheer() { players.forEach(function (p) { var u = p.userData; if (u.st === "roam" && u.jt < 0) u.jd = 0.01 + Math.random() * 0.25; }); }
  // the point in front of the camera, in court coordinates (the court spins, the visitor doesn't)
  var passPt = new THREE.Vector3();
  function frontSpot() {
    passPt.set((Math.random() - 0.5) * 0.7, 0, 0.55); group.worldToLocal(passPt);
    passPt.x = Math.max(-PX, Math.min(PX, passPt.x)); passPt.z = Math.max(-PZ, Math.min(PZ, passPt.z)); return passPt;
  }
  function updPlayers(dt, t) {
    for (var i = 0; i < players.length; i++) {
      var p = players[i], u = p.userData;
      u.vis += (u.visT - u.vis) * Math.min(1, dt * 5);
      p.visible = u.vis > 0.02; p.scale.setScalar(Math.max(0.0001, u.vis * PS));
      if (!p.visible) continue;
      var run = 0;
      if (u.st === "chase") {
        var bl = u.ball;
        if (!bl || bl.grabbed || !bl.physics) { u.st = "roam"; u.ball = null; if (bl) bl.claim = null; }
        else { u.tx = bl.x; u.tz = bl.z; }
      }
      if (u.st === "roam" || u.st === "chase") {
        var dx = u.tx - u.x, dz = u.tz - u.z, d = Math.hypot(dx, dz), reach = u.st === "chase" ? 0.1 + u.ball.rad : 0.05;
        if (d > reach) {
          var sp = u.st === "chase" ? 1.15 : 0.7; if (u.wait > 0 && u.st === "roam") { u.wait -= dt; sp = 0; }
          if (sp) { var st = Math.min(d, sp * dt); u.x += dx / d * st; u.z += dz / d * st; run = sp; var want = Math.atan2(dx, dz), da = Math.atan2(Math.sin(want - u.face), Math.cos(want - u.face)); u.face += da * Math.min(1, dt * 9); }
        } else if (u.st === "chase") {
          u.st = "pass"; u.pt = 0; var b2 = u.ball; b2.carried = p; b2.physics = true; b2.vx = b2.vy = b2.vz = 0; frontSpot(); u.tx = passPt.x; u.tz = passPt.z;
        } else { u.wait = 0.5 + Math.random() * 1.8; pickSpot(u); if (Math.random() < 0.25 && u.jt < 0) u.jt = 0; }
      }
      if (u.st === "pass") {
        u.pt += dt; var want2 = Math.atan2(u.tx - u.x, u.tz - u.z), da2 = Math.atan2(Math.sin(want2 - u.face), Math.cos(want2 - u.face)); u.face += da2 * Math.min(1, dt * 10);
        var bb = u.ball;
        if (u.pt < 0.42) {   // lift it overhead
          var lift = Math.min(1, u.pt / 0.3);
          bb.x = u.x + Math.sin(u.face) * 0.05; bb.z = u.z + Math.cos(u.face) * 0.05; bb.y = (0.18 + lift * 0.3) * PS * 0.9;
        } else {             // release: a lob that lands in front of the visitor
          var T2 = 0.95, ddx = u.tx - bb.x, ddz = u.tz - bb.z;
          bb.vx = ddx / T2; bb.vz = ddz / T2; bb.vy = 3.2 * T2 / 2 - (bb.y - bb.rad) / T2;
          bb.carried = null; bb.claim = null; bb.fromPass = true; bb.rest = 0; u.ball = null; u.st = "roam"; u.wait = 0.4; pickSpot(u);
          if (typeof g2pSfx === "function") g2pSfx("bounce");
        }
      }
      // pose
      var L = u.body, jump = 0;
      if (u.jd > 0) { u.jd -= dt; if (u.jd <= 0) u.jt = 0; }
      if (u.jt >= 0) { u.jt += dt; var jk = u.jt / 0.6; if (jk >= 1) u.jt = -1; else jump = Math.sin(jk * Math.PI); }
      if (run) {
        u.ph += dt * (run > 1 ? 15 : 12); var s1 = Math.sin(u.ph), lean = run > 1 ? 0.24 : 0.15;
        u.ll.a.rotation.x = -s1 * 0.85; u.lr.a.rotation.x = s1 * 0.85;
        u.ll.b.rotation.x = Math.max(0, Math.sin(u.ph + 1.3)) * 1.2; u.lr.b.rotation.x = Math.max(0, -Math.sin(u.ph + 1.3)) * 1.2;
        u.al.a.rotation.x = s1 * 0.8; u.ar.a.rotation.x = -s1 * 0.8; u.al.b.rotation.x = u.ar.b.rotation.x = -1.0;
        L.position.y = Math.abs(Math.cos(u.ph)) * 0.022; L.rotation.x = lean;
      } else {
        var br = Math.sin(t * 2 + i) * 0.03;
        u.ll.a.rotation.x *= 0.8; u.lr.a.rotation.x *= 0.8; u.ll.b.rotation.x *= 0.8; u.lr.b.rotation.x *= 0.8;
        u.al.a.rotation.x = br; u.ar.a.rotation.x = -br; u.al.b.rotation.x = u.ar.b.rotation.x = -0.3;
        L.position.y = 0; L.rotation.x *= 0.85;
      }
      if (u.st === "pass") {   // both arms up, the ball overhead
        var up = Math.min(1, u.pt / 0.25); u.al.a.rotation.x = u.ar.a.rotation.x = -2.7 * up; u.al.b.rotation.x = u.ar.b.rotation.x = -0.3; L.rotation.x = -0.1 * up;
        jump = Math.max(jump, u.pt > 0.25 ? Math.sin(Math.min(1, (u.pt - 0.25) / 0.3) * Math.PI) * 0.6 : 0);
      }
      if (jump > 0) {
        L.position.y = jump * 0.16; u.ll.a.rotation.x = u.lr.a.rotation.x = -0.6 * jump; u.ll.b.rotation.x = u.lr.b.rotation.x = 1.1 * jump;
        if (u.st !== "pass") { u.al.a.rotation.x = u.ar.a.rotation.x = -2.6 * jump; }
      }
      p.position.set(u.x, 0, u.z); p.rotation.y = u.face;
    }
  }

  // confetti
  var confCols = [0xE63946, 0xF4A261, 0xE9C46A, 0x4CAF50, 0xffffff, 0xEC6FA0];
  var cgeo = new THREE.PlaneGeometry(0.05, 0.05), confetti = [];
  function burst() { for (var i = 0; i < 42; i++) { var m = new THREE.Mesh(cgeo, new THREE.MeshBasicMaterial({ color: confCols[i % confCols.length], side: THREE.DoubleSide, transparent: true })); m.position.set((Math.random() - 0.5) * 1.4, 1.3, (Math.random() - 0.5) * 1.0); m.userData = { vx: (Math.random() - 0.5) * 0.05, vy: 0.04 + Math.random() * 0.06, vz: (Math.random() - 0.5) * 0.05, life: 1 }; group.add(m); confetti.push(m); } }

  // ---- interaction: rotate the court, OR grab & flick a ball ----
  var rot = 0, rotVel = 0, dragging = false, lastX = 0, autoSpin = 0.0013;
  var hint = opts.hintEl || null, el = renderer.domElement;
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), gplane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), gpt = new THREE.Vector3(), wtmp = new THREE.Vector3();
  var grabbed = null, gvx = 0, gvz = 0;
  // Secret: tap a hoop 5 times quickly and its rim catches fire for a few seconds.
  var hoopObjs = endUnits.map(function (u) { return u.hoop; }), hoopTaps = [], fireT = 0, flames = [], fireGeo = new THREE.SphereGeometry(0.034, 6, 4), fpos = new THREE.Vector3();
  function updFire(dt) {
    fireT -= dt;
    for (var i = 0; i < endUnits.length; i++) {
      var eu = endUnits[i];
      eu.rimMat.emissive.setRGB(1, 0.3 + Math.random() * 0.25, 0);
      eu.rimMat.emissiveIntensity = fireT > 0 ? 0.6 + Math.random() * 0.7 : 0;
      if (fireT > 0.6 && Math.random() < 0.75) {
        eu.rim.getWorldPosition(fpos); group.worldToLocal(fpos);
        var f = new THREE.Mesh(fireGeo, new THREE.MeshBasicMaterial({ color: Math.random() < 0.5 ? 0xFF7A1A : 0xFFD24A, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        f.position.set(fpos.x + (Math.random() - 0.5) * 0.2, fpos.y, fpos.z + (Math.random() - 0.5) * 0.2);
        f.userData = { v: 0.3 + Math.random() * 0.35, life: 1 };
        group.add(f); flames.push(f);
      }
    }
    for (var j = flames.length - 1; j >= 0; j--) {
      var fl = flames[j]; fl.userData.life -= dt * 1.5;
      fl.position.y += fl.userData.v * dt; fl.position.x += (Math.random() - 0.5) * 0.006;
      fl.scale.setScalar(Math.max(0.01, fl.userData.life * 1.4)); fl.material.opacity = Math.max(0, fl.userData.life);
      if (fl.userData.life <= 0) { group.remove(fl); fl.material.dispose(); flames.splice(j, 1); }
    }
  }
  function setNDC(e) { var r = el.getBoundingClientRect(); ndc.x = (e.clientX - r.left) / r.width * 2 - 1; ndc.y = -((e.clientY - r.top) / r.height * 2 - 1); }
  var firstTouch = false, handEl = opts.handEl || null, handOn = false;
  function ballOf(o) { for (var b = 0; b < balls.length; b++) if (balls[b].hit === o || balls[b].mesh === o) return balls[b]; return null; }
  el.addEventListener("pointerdown", function (e) {
    if (hint) hint.style.opacity = "0"; firstTouch = true;
    if (renov.active) { finishCine(false); return; }   // tap to skip the renovation cinematic
    setNDC(e); ray.setFromCamera(ndc, camera);
    if (renovated) {
      var ih = ray.intersectObjects(interactives, true);
      if (ih.length) { var o = ih[0].object; while (o && !(o.userData && o.userData.brief)) o = o.parent; if (o) { if (opts.onBrief) opts.onBrief(o.userData.brief); return; } }
    }
    if (ray.intersectObjects(hoopObjs, true).length) {
      var tn = performance.now();
      hoopTaps = hoopTaps.filter(function (x) { return tn - x < 4000; }); hoopTaps.push(tn);
      if (hoopTaps.length >= 5) {
        hoopTaps = []; fireT = 5;
        if (typeof g2pSfx === "function") g2pSfx("fire");
        try { window.dispatchEvent(new CustomEvent("g2p:egg", { detail: { id: "hoopfire" } })); } catch (x) {}
      }
    }
    var hit = ray.intersectObjects(ballHits, false), gb = hit.length ? ballOf(hit[0].object) : null;
    if (gb && gb.carried) gb = null;   // a player is mid-pass: let them throw it
    if (gb) {
      grabbed = gb; markTouched(); el.style.cursor = "grabbing";
      if (grabbed.claim) { grabbed.claim.userData.st = "roam"; grabbed.claim.userData.ball = null; grabbed.claim = null; }
      // surprise: catch a player's pass while it is still in the air
      if (grabbed.fromPass && grabbed.physics && grabbed.y > grabbed.rad + 0.08) { cheer(); if (typeof g2pSfx === "function") g2pSfx("chime"); if (opts.onScore) opts.onScore("catch"); }
      grabbed.fromPass = false; grabbed.physics = true; grabbed.grabbed = true; grabbed.vx = grabbed.vy = grabbed.vz = 0; grabbed.rest = 0; gvx = 0; gvz = 0;
      grabbed.mesh.getWorldPosition(wtmp); gplane.constant = -wtmp.y;
    } else {
      // grey court: tap the wall to shake the bottles off it, tap a piece of trash to kick it
      if (greyGroup.visible && prog < 0.5) {
        var wh = ray.intersectObjects(wallParts, false);
        if (wh.length) shakeWall();
        else {
          var th2 = ray.intersectObjects(knock.map(function (k) { return k.o; }), true);
          if (th2.length) { var o2 = th2[0].object; while (o2 && !(o2.userData && o2.userData.kn)) o2 = o2.parent; if (o2 && !o2.userData.kn.perch) kick(o2.userData.kn, Math.random() - 0.5, Math.random() - 0.5, 0.5); }
        }
      }
      dragging = true; lastX = e.clientX; rotVel = 0;
    }
    if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (x) {} }
  });
  el.addEventListener("pointermove", function (e) {
    if (!grabbed && !dragging && e.pointerType === "mouse") {   // desktop: open hand over a ball, pointer over a poster
      setNDC(e); ray.setFromCamera(ndc, camera);
      el.style.cursor = ray.intersectObjects(ballHits, false).length ? "grab" : (renovated && ray.intersectObjects(interactives, true).length ? "pointer" : "");
    }
    if (grabbed) {
      setNDC(e); ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(gplane, gpt)) {
        group.worldToLocal(gpt);
        var nx = Math.max(-CX / 2 + grabbed.rad, Math.min(CX / 2 - grabbed.rad, gpt.x));
        var nz = Math.max(-CZ / 2 + grabbed.rad, Math.min(CZ / 2 - grabbed.rad, gpt.z));
        gvx = nx - grabbed.x; gvz = nz - grabbed.z; grabbed.x = nx; grabbed.z = nz;
      }
      return;
    }
    if (!dragging) return;
    var d = (e.clientX - lastX) / (el.getBoundingClientRect().width || 1) * 2.0; lastX = e.clientX; rot += d; rotVel = d;
  });
  function endDrag() {
    if (grabbed) {
      grabbed.vx = Math.max(-4, Math.min(4, gvx * 24)); grabbed.vz = Math.max(-4, Math.min(4, gvz * 24));
      grabbed.vy = 0.5 + Math.min(2.4, (Math.abs(grabbed.vx) + Math.abs(grabbed.vz)) * 0.45);
      grabbed.grabbed = false; grabbed = null; el.style.cursor = "grab";
    }
    dragging = false;
  }
  el.addEventListener("pointerup", endDrag); el.addEventListener("pointercancel", endDrag); el.addEventListener("pointerleave", endDrag);
  setTimeout(function () { if (hint) hint.style.opacity = "0"; }, touched ? 4500 : 2000);   // the hand demo takes over at 2 s

  // renovate + briefing state (UI is React; the scene exposes setRenov + callbacks)
  var prog = 0, progTarget = 0, renovated = false;
  var flashEl = opts.flashEl || null;
  var renov = { active: false, t: 0, done: {} }, CINE = 6.0;
  var reduced = (typeof fxReduced === "function" && fxReduced()) || (typeof animOff === "function" && animOff());
  var fogG = new THREE.Color(0x252b33), fogV = new THREE.Color(0x2b333d);
  // ---- light follows the site theme: day = low sun + long shadows (overcast while grey, golden once renovated);
  // night = moonlight, floodlights dead in grey and lit after renovation
  var th = heroIsDay() ? 1 : 0, thT = th, lookP = 0;
  var LK = {
    sunG: new THREE.Color(0xd3d9e0), sunV: new THREE.Color(0xffd9a6), moon: new THREE.Color(0x8ea4d8),
    skyD: new THREE.Color(0xbcd3ea), skyN: new THREE.Color(0x2a3550), gndD: new THREE.Color(0x4c4636), gndN: new THREE.Color(0x0e1014),
    fogDG: new THREE.Color(0xa3abb1), fogDV: new THREE.Color(0xbccfdb)
  };
  var sunDay = new THREE.Vector3(5.6, 2.2, 2.6), sunNight = new THREE.Vector3(-2.5, 6, -1.5), lc1 = new THREE.Color(), lc2 = new THREE.Color();
  function applyLook() {
    var d = th, p = lookP, nt = 1 - d;
    key.position.copy(sunNight).lerp(sunDay, d);
    lc1.copy(LK.sunG).lerp(LK.sunV, p); key.color.copy(LK.moon).lerp(lc1, d);
    key.intensity = lerp(0.45, lerp(0.75, 1.3, p), d);
    hemi.color.copy(LK.skyN).lerp(LK.skyD, d); hemi.groundColor.copy(LK.gndN).lerp(LK.gndD, d); hemi.intensity = lerp(0.6, lerp(0.5, 0.62, p), d);
    amb.intensity = lerp(0.22, 0.26, d); fill.intensity = lerp(0.12, 0.28, d); fillWarm.intensity = lerp(0.08, 0.3, d);
    lc1.copy(fogG).lerp(fogV, p); lc2.copy(LK.fogDG).lerp(LK.fogDV, p); scene.fog.color.copy(lc1).lerp(lc2, d);
    var lit = p * nt;
    lampMat.emissiveIntensity = lit * 1.6; luxLight.intensity = lit * 1.1;
    for (var s = 0; s < floodSpots.length; s++) floodSpots[s].intensity = lit * 1.6;
    for (var bm = 0; bm < blocMats.length; bm++) blocMats[bm].emissiveIntensity = nt * 0.95;
  }
  function setTheme(day) { thT = day ? 1 : 0; }
  // every part of the renovation has its own 0..1, so the cinematic can stage them one after another
  function applyStage(S) {
    for (var n = 0; n < nets.length; n++) nets[n].material.opacity = S.nets * 0.9;
    for (var fp = 0; fp < fencePanels.length; fp++) fencePanels[fp].color.copy(meshMatBase.fenceColG).lerp(meshMatBase.fenceColV, S.build);
    courtMat.roughness = lerp(0.74, 0.58, S.surf);
    applyGoalDamage(1 - S.hoop);
    if (lockerScreen) lockerScreen.emissiveIntensity = S.lights * 0.9;
    var nR = renovOnly.length, stg = 0.05;
    for (var ro = 0; ro < nR; ro++) {
      var o = renovOnly[ro], b = Math.max(0, Math.min(1, (S.build - ro * stg) / (1 - stg * (nR - 1)))), sc = b < 0.02 ? 0.0001 : b;
      o.visible = b > 0.02; if (o.userData.rise) o.scale.set(1, sc, 1); else o.scale.setScalar(sc);
    }
    lookP = S.lights; applyLook();
  }
  function applyRenovState(p) {
    applyStage({ surf: p, hoop: p, nets: p, build: p, lights: p });
    if (p < 0.5 && greyDirty) restoreGrey();
    greyGroup.visible = p < 0.5;
  }
  // ---- the ~6 s renovation cinematic: trash flies off, cracks close, lines paint, hoop straightens, net, fence, lights
  function seg(T, a, b) { return Math.max(0, Math.min(1, (T - a) / (b - a))); }
  function smooth(x) { return x * x * (3 - 2 * x); }
  function backOut(x) { var c = 1.9; x -= 1; return 1 + (c + 1) * x * x * x + c * x * x; }
  function cue(T, at, name) { if (T >= at && !renov.done[name + at]) { renov.done[name + at] = 1; if (typeof g2pSfx === "function") g2pSfx(name); return true; } return false; }
  function cineFrame(T) {
    var tr = seg(T, 0, 1.4); trashFly(tr); if (tr >= 1) greyGroup.visible = false;
    drawCourt(smooth(seg(T, 1.0, 2.6)), smooth(seg(T, 2.6, 3.6)));
    var hk = seg(T, 3.4, 4.4), lk = seg(T, 4.9, 5.7);
    // floodlights stutter on, then hold
    var lights = lk <= 0 ? 0 : (lk < 0.55 ? (Math.random() < 0.45 + lk ? Math.min(1, lk * 1.6) : 0.04) : smooth(lk));
    applyStage({ surf: smooth(seg(T, 1.0, 2.6)), hoop: hk > 0 ? backOut(hk) : 0, nets: smooth(seg(T, 4.1, 4.8)), build: seg(T, 3.9, 5.0), lights: lights });
    cue(T, 0.05, "swish"); cue(T, 1.0, "spray"); cue(T, 2.6, "spray"); cue(T, 3.45, "clack"); cue(T, 4.15, "swish");
    cue(T, 4.95, "clack"); cue(T, 5.15, "clack"); cue(T, 5.35, "clack"); cue(T, 5.6, "whistle");
    if (T >= 5.0 && !renov.done.players) { renov.done.players = 1; playersEnter(); }
    if (T >= 5.55 && !renov.done.burst) { renov.done.burst = 1; burst(); heroBuzz([30, 40, 30]); }
    if (flashEl) flashEl.style.opacity = T > 5.55 && T < 6 ? (1 - (T - 5.55) / 0.45) * 0.35 : 0;
    if (T >= CINE) finishCine(false);
  }
  function finishCine(silent) {
    var wasActive = renov.active;
    renov.active = false; prog = 1; progTarget = 1; greyDirty = true;
    drawCourt(1); applyRenovState(1);
    if (!renov.done.players) { renov.done.players = 1; if (silent) playersPlace(); else playersEnter(); }
    if (!silent && !renov.done.burst) { renov.done.burst = 1; burst(); }
    if (flashEl) flashEl.style.opacity = 0;
    if (wasActive && opts.onCine) opts.onCine(false);
    if (!silent) setTimeout(function () { if (renovated && opts.onRenovComplete) opts.onRenovComplete(); }, 700);
  }

  // parallax: the camera leans a little toward the mouse (desktop) or the phone's tilt
  var parX = 0, parY = 0, parTX = 0, parTY = 0, parOn = !(typeof fxReduced === "function" && fxReduced()), tiltOn = false;
  function onParMove(e) { if (e.pointerType === "touch") return; parTX = e.clientX / (window.innerWidth || 1) * 2 - 1; parTY = e.clientY / (window.innerHeight || 1) * 2 - 1; }
  function onTilt(e) { if (e.gamma == null || e.beta == null) return; parTX = Math.max(-1, Math.min(1, e.gamma / 25)); parTY = Math.max(-1, Math.min(1, (e.beta - 50) / 25)); }
  if (parOn) {
    window.addEventListener("pointermove", onParMove, { passive: true });
    if (typeof motionOn === "function" && motionOn() && "DeviceOrientationEvent" in window) { tiltOn = true; window.addEventListener("deviceorientation", onTilt); }
  }

  // auto quality: measure fps for a few seconds; slow device -> drop shadows + small details, then resolution
  var qS = { t: 0, n: 0, done: false, lvl: 0 };
  function lowerQuality(level) {
    qS.lvl = level;
    if (level >= 1) {
      renderer.shadowMap.enabled = false; key.castShadow = false;
      scene.traverse(function (o) { if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.needsUpdate = true; }); } });
      for (var i = 0; i < detailOnly.length; i++) detailOnly[i].visible = false;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    }
    if (level >= 2) renderer.setPixelRatio(0.8);
    onResize();
  }
  var scoreCD = 0, windT = 18;
  /* Renovated hoop collider. The ring is a torus (centre-line radius r, tube t): the ball collides with the
     nearest point of the ring's centre circle at distance BALL + t. The step is swept in sub-steps no longer
     than the tube radius, so a fast throw cannot tunnel through the 3 cm rim. One positional push-out per
     contact plus a velocity reflection (restitution 0.45, 10% tangential loss) = no jitter; a ball that comes
     to rest on the ring is rolled off it. The backboard is a plane on the court side of the board. */
  function hoopPhysics(bl, Hp, px0, py0, pz0, dt) {
    var R = Hp.r, T = Hp.t, minD = bl.rad + T, inner = R - T;
    // gentle funnel: a descending ball just above the ring drifts toward its centre (the throw is flicked on a phone)
    var fx = Hp.x - bl.x, fz = Hp.z - bl.z, fh = Math.hypot(fx, fz), above = bl.y - Hp.y;
    if (bl.vy < 0 && above > 0 && above < 0.35 && fh < R + bl.rad * 1.4 && fh > 1e-4 && bl.rad < inner) { var pull = 1.6 * dt; bl.vx += fx / fh * pull; bl.vz += fz / fh * pull; }
    var sx = bl.x - px0, sy = bl.y - py0, sz = bl.z - pz0, steps = Math.min(10, Math.max(1, Math.ceil(Math.hypot(sx, sy, sz) / T)));
    for (var k = 1; k <= steps; k++) {
      var f = k / steps, x = px0 + sx * f, y = py0 + sy * f, z = pz0 + sz * f;
      var dx = x - Hp.x, dz = z - Hp.z, h = Math.hypot(dx, dz);
      if (h < 1e-5) { dx = 1; dz = 0; h = 1; }
      var cxp = Hp.x + dx / h * R, czp = Hp.z + dz / h * R, nx = x - cxp, ny = y - Hp.y, nz = z - czp, d = Math.hypot(nx, ny, nz);
      if (d < minD && d > 1e-6) {
        nx /= d; ny /= d; nz /= d;
        bl.x = cxp + nx * minD; bl.y = Hp.y + ny * minD; bl.z = czp + nz * minD;
        var vn = bl.vx * nx + bl.vy * ny + bl.vz * nz;
        if (vn < 0) {
          bl.vx -= 1.45 * vn * nx; bl.vy -= 1.45 * vn * ny; bl.vz -= 1.45 * vn * nz;
          bl.vx *= 0.9; bl.vz *= 0.9;
          if (vn < -0.4 && typeof g2pSfx === "function") g2pSfx("clack");
        }
        // resting on top of the ring: roll it off (inward if its centre is inside the ring, else outward)
        if (ny > 0.6 && Math.hypot(bl.vx, bl.vy, bl.vz) < 0.25) { var out = h < R ? -1 : 1; bl.vx += dx / h * out * 0.35; bl.vz += dz / h * out * 0.35; }
        break;
      }
    }
    // backboard: a plane facing the court, 0.52 x 0.32, on the court side of the board
    var by = bl.y - Hp.boardY, bz = bl.z - Hp.z;
    if (Math.abs(by) < 0.16 + bl.rad * 0.5 && Math.abs(bz) < 0.26 + bl.rad * 0.5) {
      var face = Hp.boardX - Hp.sign * bl.rad;
      if (Hp.sign * (bl.x - face) > 0 && Hp.sign * (px0 - Hp.boardX) < 0) { bl.x = face; if (Hp.sign * bl.vx > 0) { bl.vx = -bl.vx * 0.55; if (typeof g2pSfx === "function") g2pSfx("clack"); } }
    }
    // a basket = the ball's centre crosses the ring plane downward inside the clear opening
    if (py0 > Hp.y && bl.y <= Hp.y) {
      var f2 = (py0 - Hp.y) / Math.max(1e-6, py0 - bl.y), cx2 = px0 + (bl.x - px0) * f2 - Hp.x, cz2 = pz0 + (bl.z - pz0) * f2 - Hp.z;
      if (Math.hypot(cx2, cz2) < inner) { Hp.pulse = 1; score("basket"); }
    }
  }
  // Keep the invisible grab sphere comfortably big on screen while the visible ball is small.
  var hitW = new THREE.Vector3(), hitS = new THREE.Vector3();
  function fitHits() {
    var hpx = el.clientHeight || 1, tanF = Math.tan(camera.fov * Math.PI / 360);
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i]; b.mesh.getWorldPosition(hitW); b.mesh.getWorldScale(hitS);
      var ppu = hpx / 2 / (camera.position.distanceTo(hitW) * tanF);   // CSS px per world unit at the ball
      b.hit.scale.setScalar(Math.max(b.rad * 1.9, HIT_MIN, HIT_PX / ppu / (hitS.x || 1)));
    }
  }
  function updNets(dt) {
    for (var i = 0; i < hoops.length; i++) {
      var Hp = hoops[i]; if (Hp.pulse <= 0 && Hp.net.scale.y === 1) continue;
      Hp.pulse = Math.max(0, Hp.pulse - dt * 2.2);
      var w = Math.sin(Hp.pulse * Math.PI);   // the net stretches round the ball, then settles
      Hp.net.scale.set(1 + w * 0.45, 1 + w * 0.2, 1 + w * 0.45);
      if (Hp.pulse === 0) Hp.net.scale.set(1, 1, 1);
    }
  }
  function score(kind) {
    if (scoreCD > 0) return; scoreCD = 1.2;
    if (opts.onScore) opts.onScore(kind);
    if (typeof g2pSfx === "function") g2pSfx(kind === "basket" ? "swish" : "whistle");
    cheer();
  }
  // instant = no cinematic (returning visitor whose court stays renovated, or reduced motion)
  function setRenov(v, instant) {
    if (v && !renovated) {
      renovated = true; renov.done = {};
      if (instant || reduced) { finishCine(!!instant); }
      else { snapshotGrey(); renov.active = true; renov.t = 0; if (opts.onCine) opts.onCine(true); }
    } else if (!v && renovated) {
      if (renov.active) { renov.active = false; if (flashEl) flashEl.style.opacity = 0; if (opts.onCine) opts.onCine(false); prog = 1; }
      renovated = false; progTarget = 0; playersLeave();
    }
  }
  applyRenovState(0);

  var rafId = null, paused = false;
  var t0 = performance.now(), prevN = t0;
  function animate(now) {
    var t = (now - t0) / 1000, dt = Math.min(0.05, (now - prevN) / 1000); prevN = now;
    if (scoreCD > 0) scoreCD -= dt;
    if (fireT > 0 || flames.length) updFire(dt);
    if (!qS.done && t > 0.8) { qS.t += dt; qS.n++; if (qS.t > 2.5) { qS.done = true; var fps = qS.n / qS.t; if (fps < 24) lowerQuality(2); else if (fps < 40) lowerQuality(1); } }
    if (Math.abs(th - thT) > 0.002) { th += (thT - th) * Math.min(1, dt * 2.5); if (Math.abs(th - thT) <= 0.002) th = thT; applyLook(); }
    // the one lamp that still has a bulb stutters at night (grey state only)
    if (deadBulb) { var nf = (1 - lookP) * (1 - th); deadBulb.emissiveIntensity = nf > 0.01 && Math.sin(t * 23) * Math.sin(t * 2.7) > 0.5 ? nf * 1.2 : 0; }
    if (parOn) { parX += (parTX - parX) * 0.05; parY += (parTY - parY) * 0.05; camera.position.set(parX * 0.38, CAM.y - parY * 0.22, CAM.z); camera.lookAt(0, CAM.ly, 0); }
    fitHits(); updNets(dt);
    var hasPlayers = renovated && !renov.active;
    for (var i = 0; i < balls.length; i++) {
      var bl = balls[i];
      if (bl.carried) { bl.mesh.position.set(bl.x, bl.y, bl.z); }
      else if (bl.physics) {
        if (bl.grabbed) { bl.y = bl.rad + 0.03; }
        else {
          var px0 = bl.x, py0 = bl.y, pz0 = bl.z;
          bl.vy -= 3.2 * dt; bl.x += bl.vx * dt; bl.z += bl.vz * dt; bl.y += bl.vy * dt;
          if (bl.y <= bl.rad) { bl.y = bl.rad; if (bl.vy < 0) { bl.vy = -bl.vy * 0.6; bl.vx *= 0.84; bl.vz *= 0.84; if (Math.abs(bl.vy) < 0.3) bl.vy = 0; } }
          var bxx = CX / 2 - bl.rad, bzz = CZ / 2 - bl.rad;
          if (bl.z > bzz) { bl.z = bzz; bl.vz = -bl.vz * 0.6; } else if (bl.z < -bzz) { if (bl.vz < -1.1 && prog < 0.5) shakeWall(); bl.z = -bzz; bl.vz = -bl.vz * 0.6; }
          var inMouth = Math.abs(bl.z) < 0.32 && bl.y < 0.4; // between the posts, under the bar
          if (bl.x > bxx) { if (inMouth) { if (bl.x > CX / 2 + 0.14) { bl.x = CX / 2 + 0.14; bl.vx = 0; bl.vz *= 0.4; score("goal"); } } else { bl.x = bxx; bl.vx = -bl.vx * 0.6; } }
          else if (bl.x < -bxx) { if (inMouth) { if (bl.x < -(CX / 2 + 0.14)) { bl.x = -(CX / 2 + 0.14); bl.vx = 0; bl.vz *= 0.4; score("goal"); } } else { bl.x = -bxx; bl.vx = -bl.vx * 0.6; } }
          bl.vx *= 0.995; bl.vz *= 0.995;
          for (var hh = 0; hh < hoops.length; hh++) {
            var Hp = hoops[hh];
            if (prog > 0.5) { hoopPhysics(bl, Hp, px0, py0, pz0, dt); continue; }
            var ddx = bl.x - Hp.x, ddz = bl.z - Hp.z;
            if (ddx * ddx + ddz * ddz < Hp.r * Hp.r * 0.9 && bl.vy < 0 && bl.y < Hp.y + 0.05 && bl.y > Hp.y - 0.14) {
              bl.vy = Math.abs(bl.vy) * 0.55 + 0.5; bl.vx = -bl.vx * 0.5 + (Math.random() - 0.5) * 0.8; bl.vz += (Math.random() - 0.5) * 0.8; if (typeof g2pSfx === "function") g2pSfx("clack");   // the bent grey rim spits it out
            }
          }
          var onGround = bl.y <= bl.rad + 0.001 && bl.vy === 0, slow = Math.abs(bl.vx) + Math.abs(bl.vz);
          // a player runs for a ball you threw once it has nearly stopped (not one they just passed you)
          if (hasPlayers && onGround && slow < 0.5 && !bl.claim && !bl.fromPass) {
            var best = null, bd = 1e9;
            for (var pj = 0; pj < players.length; pj++) { var pu = players[pj].userData; if (pu.st !== "roam" || pu.vis < 0.5) continue; var pd = Math.hypot(pu.x - bl.x, pu.z - bl.z); if (pd < bd) { bd = pd; best = players[pj]; } }
            if (best) { bl.claim = best; best.userData.st = "chase"; best.userData.ball = bl; best.userData.wait = 0; }
          }
          // come to rest -> resume idle bounce
          if (onGround && slow < 0.06 && !bl.claim) { bl.rest += dt; if (bl.rest > 0.7) { bl.physics = false; bl.fromPass = false; bl.ph = -t * bl.fr; bl.vx = (Math.random() < 0.5 ? 1 : -1) * 0.007; bl.vz = (Math.random() < 0.5 ? 1 : -1) * 0.006; bl.rest = 0; } } else bl.rest = 0;
        }
        bl.mesh.position.set(bl.x, bl.y, bl.z); bl.mesh.rotation.x += bl.vz * dt / bl.rad; bl.mesh.rotation.z -= bl.vx * dt / bl.rad;
      } else {
        bl.x += bl.vx; bl.z += bl.vz;
        if (Math.abs(bl.x) > CX / 2 - 0.2) bl.vx = -bl.vx; if (Math.abs(bl.z) > CZ / 2 - 0.15) bl.vz = -bl.vz;
        var by = bl.rad + Math.abs(Math.sin(t * bl.fr + bl.ph)) * bl.hgt;
        bl.mesh.position.set(bl.x, by, bl.z); bl.mesh.rotation.x += bl.vz * 3; bl.mesh.rotation.z -= bl.vx * 3;
      }
      if (bl.halo.visible) {
        var gk = touched ? Math.max(0, bl.halo.material.opacity - dt * 1.5) : 0.55 + Math.sin(t * 3.2 + i) * 0.3;
        bl.halo.material.opacity = gk; bl.mesh.material.emissiveIntensity = gk * 0.45;
        bl.halo.position.copy(bl.mesh.position); bl.halo.scale.setScalar(bl.rad * (4.2 + Math.sin(t * 3.2 + i) * 0.5));
        if (touched && gk <= 0) { bl.halo.visible = false; bl.mesh.material.emissiveIntensity = 0; }
      }
    }
    if (greyGroup.visible && !renov.active) {
      updKnock(dt);
      // now and then the wind finishes the job: a bottle drops off the wall on its own
      windT -= dt; if (windT <= 0) { windT = 14 + Math.random() * 12; for (var wk2 = 0; wk2 < knock.length; wk2++) if (knock[wk2].perch) { var kq = knock[wk2]; kq.perch = false; kq.air = true; kq.vz = 0.3; kq.vy = 0.1; kq.vx = 0; kq.sp = 4; greyDirty = true; break; } }
    }
    var spinBoost = 0;
    if (renov.active) {
      renov.t += dt; var T = renov.t;
      // a slow, steady turn so every corner of the transformation passes the camera
      spinBoost = 0.006 * Math.min(1, T / 0.6) * Math.max(0, Math.min(1, (CINE - T) / 0.8));
      cineFrame(T);
    }
    if (!dragging) { rot += rotVel; rotVel *= 0.93; if (Math.abs(rotVel) < 0.0003) { rotVel = 0; rot += autoSpin; } }
    rot += spinBoost; group.rotation.y = rot;
    if (!renov.active && Math.abs(prog - progTarget) > 0.001) { prog += (progTarget - prog) * 0.06; drawCourt(prog); applyRenovState(prog); }
    for (var ci = confetti.length - 1; ci >= 0; ci--) {
      var cm = confetti[ci]; cm.userData.vy -= 0.0022; cm.position.x += cm.userData.vx; cm.position.y += cm.userData.vy; cm.position.z += cm.userData.vz;
      cm.userData.life -= 0.011; cm.material.opacity = Math.max(0, cm.userData.life); cm.rotation.x += 0.25; cm.rotation.y += 0.2;
      if (cm.userData.life <= 0 || cm.position.y < 0.02) { group.remove(cm); cm.material.dispose(); confetti.splice(ci, 1); }
    }
    updPlayers(dt, t);
    // the hand demo sits on the basketball until the first touch
    if (handEl) {
      var showH = !firstTouch && !touched && t > 2 && !renov.active;
      if (showH) {
        wtmp.set(basket.x, basket.rad, basket.z); group.localToWorld(wtmp); wtmp.project(camera);
        var hw = host.clientWidth || 1, hh2 = host.clientHeight || 1, hx = Math.max(110, Math.min(hw - 110, (wtmp.x + 1) / 2 * hw)), hy = Math.max(40, Math.min(hh2 * 0.62, (1 - wtmp.y) / 2 * hh2));
        handEl.style.transform = "translate(" + hx.toFixed(1) + "px," + hy.toFixed(1) + "px)";
      }
      if (showH !== handOn) { handOn = showH; handEl.classList.toggle("on", showH); }
    }
    for (var cr = 0; cr < cars.length; cr++) {
      var car = cars[cr], cu = car.userData; cu.th += cu.spd * dt;
      var ax = (RX + 0.55) + cu.lane, az = (RZ + 0.55) + cu.lane, sgn = cu.spd > 0 ? 1 : -1;
      car.position.set(Math.cos(cu.th) * ax, GY, Math.sin(cu.th) * az);
      var vx = -Math.sin(cu.th) * ax * sgn, vz = Math.cos(cu.th) * az * sgn;
      car.rotation.y = Math.atan2(-vz, vx);
    }
    renderer.render(scene, camera);
    if (!paused) rafId = requestAnimationFrame(animate);
  }
  function onResize() {
    var w = host.clientWidth || 1, h = host.clientHeight || 1, portrait = w / h < 0.85;
    // phones (portrait): wider lens, a bit higher, so the court sits mid-frame and the skyline still peeks over the blocks
    CAM.y = portrait ? 2.9 : 2.6; CAM.z = portrait ? 4.6 : 4.5; CAM.ly = portrait ? 0.05 : 0.69;
    camera.fov = portrait ? 60 : 52; camera.aspect = w / h; camera.updateProjectionMatrix();
    camera.position.set(parX * 0.38, CAM.y - parY * 0.22, CAM.z); camera.lookAt(0, CAM.ly, 0);
    renderer.setSize(w, h);
  }
  var resizeObs = ("ResizeObserver" in window) ? new ResizeObserver(onResize) : null;
  if (resizeObs) { resizeObs.observe(host); } else { window.addEventListener("resize", onResize); }
  onResize();
  rafId = requestAnimationFrame(animate);
  return {
    setRenov: setRenov,
    setTheme: setTheme,
    info: function () { return { quality: qS.lvl, measured: qS.done, fps: qS.done ? Math.round(qS.n / qS.t) : null, day: thT === 1, tilt: tiltOn, renovated: renovated, cine: renov.active, prog: prog, players: players.map(function (p) { return p.userData.st + (p.visible ? "" : "-hidden"); }), knocked: knock.filter(function (k) { return k.air || k.vx || k.vz; }).length, perched: knock.filter(function (k) { return k.perch; }).length, hand: handOn }; },
    skip: function () { if (renov.active) finishCine(false); },
    // probes: throw a ball / shake the wall from the console
    _throw: function (i, vx, vy, vz) { var b = balls[i || 0]; markTouched(); b.physics = true; b.grabbed = false; b.claim = null; b.fromPass = false; b.y = b.rad + 0.05; b.vx = vx; b.vy = vy; b.vz = vz; },
    _shake: shakeWall,
    _ball: function (i) { return balls[i || 0]; }, _hoops: hoops, _hitR: function (i) { return balls[i || 0].hit.scale.x; },
    _screen: function (i) { var b = balls[i || 0], v = new THREE.Vector3(); b.mesh.getWorldPosition(v); v.project(camera); var r = el.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, air: b.y > b.rad + 0.08, fromPass: b.fromPass }; },
    pause: function () { paused = true; if (rafId) cancelAnimationFrame(rafId); rafId = null; },
    resume: function () { if (paused) { paused = false; prevN = performance.now(); rafId = requestAnimationFrame(animate); } },
    dispose: function () {
      paused = true; if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onParMove);
      if (tiltOn) window.removeEventListener("deviceorientation", onTilt);
      if (resizeObs) { resizeObs.disconnect(); } else { window.removeEventListener("resize", onResize); }
      try { renderer.dispose(); } catch (e) {}
      if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
export function Hero3D() {
  var app = useApp(), t = app.t, setPage = app.setPage, toast = app.toast;
  var mountRef = useRef(null), flashRef = useRef(null), hintRef = useRef(null), apiRef = useRef(null), tRef = useRef(t);
  var rs = useState(false), ready = rs[0], setReady = rs[1];
  var fset = useState(false), failed = fset[0], setFailed = fset[1];
  var rv = useState(false), renovated = rv[0], setRenovated = rv[1];
  var bs = useState(null), brief = bs[0], setBrief = bs[1];
  var cs = useState(false), cine = cs[0], setCine = cs[1];
  var handRef = useRef(null);
  // the Renovate button breathes and hops until it has been pressed once (ever)
  var ns = useState(function () { try { return localStorage.getItem("g2p_hero_pressed") !== "1"; } catch (e) { return true; } }), nudge = ns[0], setNudge = ns[1];
  tRef.current = t;
  useEffect(function () {
    if (!nudge || renovated || fxReduced() || (typeof animOff === "function" && animOff())) return;
    var n = 0, coarse = window.matchMedia && window.matchMedia("(pointer:coarse)").matches;
    // a short buzz with the hop, phones only, only once the visitor has touched the page, at most 3 times
    var iv = setInterval(function () {
      var act = navigator.userActivation ? navigator.userActivation.hasBeenActive : false;
      if (coarse && act && n < 3) { n++; heroBuzz(18); }
    }, 4000);
    return function () { clearInterval(iv); };
  }, [nudge, renovated]);
  useEffect(function () {
    var api = null, obs = null, vis = null, themeObs = null, killed = false, onscreen = true;
    function update() { if (!api) return; (onscreen && !document.hidden) ? api.resume() : api.pause(); }
    loadThree().then(function () {
      if (killed || !mountRef.current) return;
      api = mountHero3D(mountRef.current, {
        flashEl: flashRef.current,
        hintEl: hintRef.current,
        onScore: function (kind) { toast(kind === "basket" ? tRef.current.heroBasket : kind === "catch" ? tRef.current.heroCatch : tRef.current.heroGoal); },
        handEl: handRef.current,
        onBrief: function (k) { setBrief(k); },
        onCine: function (on) { setCine(on); },
        onRenovComplete: function () { toast(tRef.current.heroTTap); }
      });
      apiRef.current = api; window.__g2pHero = api;
      // the court stays renovated on the next visit
      var keep = false; try { keep = localStorage.getItem("g2p_hero_renov") === "1"; } catch (e) {}
      if (keep) { api.setRenov(true, true); setRenovated(true); }
      setReady(true);
      if ("MutationObserver" in window) {
        themeObs = new MutationObserver(function () { if (api) api.setTheme(heroIsDay()); });
        themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      }
      if ("IntersectionObserver" in window) {
        obs = new IntersectionObserver(function (es) { onscreen = es[0].isIntersecting; update(); }, { threshold: 0.05 });
        obs.observe(mountRef.current);
      }
      vis = update;
      document.addEventListener("visibilitychange", vis);
    }).catch(function () { if (!killed) setFailed(true); });
    return function () {
      killed = true;
      if (obs) obs.disconnect();
      if (themeObs) themeObs.disconnect();
      if (vis) document.removeEventListener("visibilitychange", vis);
      if (api) { api.dispose(); if (window.__g2pHero === api) window.__g2pHero = null; }
    };
  }, []);
  function toggle() {
    var nv = !renovated; setRenovated(nv);
    if (apiRef.current) apiRef.current.setRenov(nv);
    try { if (nv) localStorage.setItem("g2p_hero_renov", "1"); else localStorage.removeItem("g2p_hero_renov"); } catch (e) {}
    if (nudge) { setNudge(false); try { localStorage.setItem("g2p_hero_pressed", "1"); } catch (e) {} }
    if (nv) heroBuzz(20);
    toast(nv ? t.heroTRenov : t.heroTGrey);
  }
  // Show-off: floating brand-color particles, generated once.
  const particles = React.useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    left: (3 + Math.random() * 94) + "%",
    size: 3 + Math.random() * 6,
    color: ["#10B981", "#F97316", "#0D9488", "#ffffff"][i % 4],
    dur: (7 + Math.random() * 9).toFixed(1) + "s",
    delay: (Math.random() * 9).toFixed(1) + "s",
    sway: ((Math.random() - 0.5) * 90).toFixed(0) + "px"
  })), []);
  return React.createElement("section", { className: "h3d-hero" + (renovated ? " h3d-renov" : "") },
    React.createElement("div", { className: "h3d-sky", "aria-hidden": "true" }),
    React.createElement("div", { className: "h3d-canvas", ref: mountRef }),
    React.createElement("div", { className: "h3d-gutter l", "aria-hidden": "true" }),
    React.createElement("div", { className: "h3d-gutter r", "aria-hidden": "true" }),
    React.createElement("div", { className: "h3d-scrim-top" }),
    React.createElement("div", { className: "h3d-scrim" }),
    React.createElement("div", { className: "h3d-particles", "aria-hidden": "true" },
      particles.map((p, i) => React.createElement("span", {
        key: i, className: "h3d-particle",
        style: { left: p.left, width: p.size, height: p.size, background: p.color, animationDuration: p.dur, animationDelay: p.delay, "--sway": p.sway }
      }))),
    failed ? React.createElement("div", { className: "h3d-loading" }, "\u26A0\uFE0F 3D") : (!ready ? React.createElement("div", { className: "h3d-loading" }, "\u00B7\u00B7\u00B7") : null),
    React.createElement("div", { className: "h3d-hint", ref: hintRef }, t.heroHint),
    React.createElement("div", { className: "h3d-hand", ref: handRef, "aria-hidden": "true" },
      React.createElement("span", { className: "h3d-hand-ic" }, "\uD83D\uDC46"),
      React.createElement("span", { className: "h3d-hand-tx" }, t.heroGrab)),
    cine ? React.createElement("button", { className: "h3d-skip", onClick: function () { if (apiRef.current) apiRef.current.skip(); } }, t.heroSkip) : null,
    React.createElement("div", { className: "h3d-overlay" },
      React.createElement("div", { className: "h3d-title" }, React.createElement("span", { className: "g" }, React.createElement(LetterReveal, { text: "From Grey" })), React.createElement("br", null), React.createElement(LetterReveal, { text: "to ", base: 420 }), React.createElement("span", { className: "p" }, "Play")),
      React.createElement("p", { className: "h3d-sub" }, t.heroSub),
      React.createElement("div", { className: "h3d-cta" },
        React.createElement("button", { className: "h3d-btn h3d-btn-green" + (nudge && !renovated ? " h3d-nudge" : ""), onClick: toggle }, renovated ? t.heroSeeOld : t.heroRenovate),
        React.createElement("button", { className: "h3d-btn h3d-btn-ghost", onClick: function () { setPage("petition"); } }, t.heroSign))),
    React.createElement("div", { className: "h3d-flash", ref: flashRef }),
    brief ? React.createElement("div", { className: "h3d-modal", onClick: function () { setBrief(null); } },
      React.createElement("div", { className: "h3d-sheet", onClick: function (e) { e.stopPropagation(); } },
        React.createElement("button", { className: "h3d-x", onClick: function () { setBrief(null); } }, "\u2715"),
        React.createElement("div", { className: "h3d-ic" }, HERO_ICON[brief]),
        React.createElement("div", { className: "h3d-tag" }, "From Grey to Play"),
        React.createElement("h3", { className: "h3d-mtitle" }, t.heroBriefs[brief].title),
        React.createElement("p", { className: "h3d-mbody" }, t.heroBriefs[brief].body),
        React.createElement("button", { className: "h3d-btn h3d-btn-green", onClick: function () { setBrief(null); setPage("petition"); } }, t.heroSign))) : null
  );
}
