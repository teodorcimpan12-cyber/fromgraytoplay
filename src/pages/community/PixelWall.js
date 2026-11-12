import { db, useApp } from "../../app/core.js";
import { PX_COLORS, PX_COOLDOWN_MS, PX_GRID } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { logActivity } from "../../lib/log-activity.js";
import { useEffect, useRef, useState } from "../../lib/react.js";

export function PixelWall() {
  var app = useApp();
  var t = app.t, toast = app.toast, user = app.user, theme = app.theme;
  var data = useFirebase("pixels");
  var cvRef = useRef(null);
  var colSt = useState(PX_COLORS[0]);
  var col = colSt[0], setCol = colSt[1];
  var leftSt = useState(function () {
    return Math.max(0, (+(localStorage.getItem("g2p_px_ts") || 0)) + PX_COOLDOWN_MS - Date.now());
  });
  var left = leftSt[0], setLeft = leftSt[1];
  useEffect(function () {
    var iv = setInterval(function () {
      setLeft(Math.max(0, (+(localStorage.getItem("g2p_px_ts") || 0)) + PX_COOLDOWN_MS - Date.now()));
    }, 1000);
    return function () { clearInterval(iv); };
  }, []);
  useEffect(function () {
    var cv = cvRef.current;
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var cell = 480 / PX_GRID;
    var checker = theme === "dark" ? ["#1E2235", "#181C2E"] : ["#E9ECF1", "#F3F5F9"];
    for (var y = 0; y < PX_GRID; y++) {
      for (var x = 0; x < PX_GRID; x++) {
        ctx.fillStyle = checker[(x + y) % 2];
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    if (data) Object.keys(data).forEach(function (k) {
      var p = k.split("_");
      var px = +p[0], py = +p[1];
      if (isNaN(px) || isNaN(py) || px < 0 || py < 0 || px >= PX_GRID || py >= PX_GRID) return;
      if (typeof data[k] !== "string") return;
      ctx.fillStyle = data[k];
      ctx.fillRect(px * cell, py * cell, cell, cell);
    });
  }, [data, theme]);
  var place = function (e) {
    var cv = cvRef.current;
    if (!cv || left > 0) return;
    var r = cv.getBoundingClientRect();
    var x = Math.floor((e.clientX - r.left) / r.width * PX_GRID);
    var y = Math.floor((e.clientY - r.top) / r.height * PX_GRID);
    if (x < 0 || y < 0 || x >= PX_GRID || y >= PX_GRID) return;
    db.ref("pixels/" + x + "_" + y).set(col);
    localStorage.setItem("g2p_px_ts", String(Date.now()));
    setLeft(PX_COOLDOWN_MS);
    toast(t.pixelPlaced);
    logActivity("pixel", (user && user.name) || "Anonim");
  };
  var exportPng = function () {
    var cv = cvRef.current;
    if (!cv) return;
    var a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = "g2p-mural.png";
    a.click();
  };
  var count = data ? Object.keys(data).length : 0;
  var mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
  var fmt = mm + ":" + String(ss).padStart(2, "0");
  return React.createElement("div", null,
    React.createElement("div", { className: "flex justify-between items-center mb-1", style: { flexWrap: "wrap", gap: ".5rem" } },
      React.createElement("h3", { style: { fontSize: "1rem" } }, "🎨 ", t.pixelTitle),
      React.createElement("span", { className: "badge badge-green" }, count + "/" + (PX_GRID * PX_GRID) + " " + t.pixelPainted)
    ),
    React.createElement("p", { className: "text-sm mb-2", style: { color: "var(--textSec)" } }, t.pixelSub),
    React.createElement("div", { className: "card" },
      React.createElement("canvas", { ref: cvRef, className: "px-canvas", width: 480, height: 480, onClick: place }),
      left > 0
        ? React.createElement("div", { style: { textAlign: "center", margin: ".8rem 0" } },
            React.createElement("span", { className: "px-cool" }, "⏳ " + t.pixelWait + " " + fmt))
        : React.createElement("div", { className: "px-palette" },
            PX_COLORS.map(function (c) {
              return React.createElement("button", {
                key: c,
                className: "px-swatch" + (col === c ? " on" : ""),
                style: { background: c },
                onClick: function () { setCol(c); },
                "aria-label": c,
                "aria-pressed": col === c
              });
            })),
      React.createElement("div", { style: { textAlign: "center" } },
        React.createElement("button", { className: "btn btn-outline btn-sm", onClick: exportPng }, "⬇️ PNG"))
    )
  );
}
