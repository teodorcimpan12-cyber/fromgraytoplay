import { useApp } from "../app/core.js";
import { EGGS } from "../data/eggs.js";
import { eggCount, eggL, eggsFound } from "../lib/g2p-egg.js";
import { useEffect, useState } from "../lib/react.js";

// "Secrets found n/N": silhouettes with a hint for what is left.
export function EggCollection({ inline, onClose }) {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [, force] = useState(0);
  useEffect(() => { const h = () => force(x => x + 1); window.addEventListener("g2p:eggs", h); return () => window.removeEventListener("g2p:eggs", h); }, []);
  useEffect(() => {
    if (inline) return;
    const k = ev => { if (ev.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [inline]);
  const f = eggsFound(), n = eggCount(), all = n >= EGGS.length;
  const e = React.createElement;
  const date = ts => new Date(ts).toLocaleDateString(lang === "en" ? "en-GB" : lang === "hu" ? "hu-HU" : "ro-RO", { day: "numeric", month: "short" });
  const body = e("div", null,
    e("div", { className: "flex justify-between items-center" },
      e("h4", { style: { fontSize: inline ? ".88rem" : "1.05rem", fontWeight: 700, margin: 0 } }, L3("Secrete găsite", "Secrets found", "Megtalált titkok")),
      e("span", { className: "badge badge-green", style: { fontSize: ".72rem" } }, n + "/" + EGGS.length)),
    e("div", { className: "egg-bar" }, e("i", { style: { width: (n / EGGS.length * 100) + "%" } })),
    e("div", { className: "egg-grid" }, EGGS.map(x => {
      const got = !!f[x.id];
      return e("div", { key: x.id, className: "egg-slot " + (got ? "found" : "locked") },
        e("span", { className: "es-ic", "aria-hidden": "true" }, x.ic),
        e("span", { className: "es-n" }, got ? eggL(x.n, lang) : "???"),
        e("span", { className: "es-h" }, got ? "✓ " + date(f[x.id]) : eggL(x.h, lang)),
        !got && e("span", { className: "es-d", "aria-label": L3("dificultate", "difficulty", "nehézség") + " " + x.d + "/3" }, "●".repeat(x.d) + "○".repeat(3 - x.d)));
    })),
    e("p", { className: "text-xs", style: { color: "var(--textSec)", marginTop: ".8rem" } }, all
      ? L3("👑 Le-ai găsit pe toate. Mingea-mascotă e acum de aur.", "👑 You found them all. The mascot ball is gold now.", "👑 Mindet megtaláltad. A kabalalabda most arany.")
      : L3("Găsește-le pe toate. La final te așteaptă o surpriză. Mingea din colț mai scapă câte un indiciu.", "Find them all, there's a surprise at the end. The corner ball drops a hint now and then.", "Találd meg mindet, a végén meglepetés vár. A sarokban lévő labda néha elárul egy tippet.")));
  if (inline) return body;
  return e("div", { className: "modal-overlay", onClick: onClose },
    e("div", { className: "modal modal-lg", onClick: ev => ev.stopPropagation(), role: "dialog", "aria-modal": "true" },
      e("div", { className: "flex justify-between items-center mb-1" },
        e("span", null),
        e("button", { className: "btn btn-sm btn-outline", onClick: onClose, "aria-label": L3("Închide", "Close", "Bezárás") }, "✕")),
      body));
}
