import { db, useApp } from "../../app/core.js";
import { RATE_DIMS } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { getVoterKey } from "../../lib/get-voter-key.js";
import { anonName } from "../../lib/next-lang.js";
import { useState } from "../../lib/react.js";
import { RadarChart } from "./RadarChart.js";

export function StarPicker({ value, onChange }) {
  return React.createElement("div", { className: "rate-stars" },
    [1, 2, 3, 4, 5].map(s => React.createElement("button", {
      key: s, type: "button",
      className: "rate-star" + (s <= value ? " on" : ""),
      onClick: () => onChange(s),
      "aria-label": s + " stars"
    }, s <= value ? "★" : "☆"))
  );
}
export function RatingSection({ court }) {
  const { t, toast, user } = useApp();
  const raw = useFirebase("ratings/" + court.id);
  const entries = raw ? Object.values(raw) : [];
  const vk = getVoterKey();
  const mine = raw && raw[vk];
  const [form, setForm] = useState(() => mine || { surface: 0, lighting: 0, equipment: 0, safety: 0 });
  const [open, setOpen] = useState(false);
  const labels = { surface: t.rateSurface, lighting: t.rateLighting, equipment: t.rateEquipment, safety: t.rateSafety };
  const avg = {};
  RATE_DIMS.forEach(k => { avg[k] = entries.length ? entries.reduce((s, e) => s + (e[k] || 0), 0) / entries.length : 0; });
  const overall = entries.length ? (RATE_DIMS.reduce((s, k) => s + avg[k], 0) / RATE_DIMS.length) : 0;
  const canSubmit = RATE_DIMS.every(k => form[k] > 0);
  const submit = () => {
    if (!canSubmit) return;
    db.ref("ratings/" + court.id + "/" + vk).set({ ...form, userName: anonName(user?.name || "Anonim"), ts: Date.now() });
    toast(t.rateThanks);
    setOpen(false);
  };
  return React.createElement("div", { className: "mt-2" },
    React.createElement("h4", { className: "mb-1 flex items-center", style: { gap: ".4rem" } },
      "⭐ ", t.ratings,
      entries.length > 0 && React.createElement("span", { className: "badge badge-coral" }, overall.toFixed(1), " · ", entries.length, " ", t.ratingCount)
    ),
    entries.length === 0
      ? React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)" } }, t.noRatings)
      : React.createElement("div", { style: { display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" } },
          React.createElement("div", { className: "radar-wrap" }, React.createElement(RadarChart, { values: avg, labels: labels, size: 200 })),
          React.createElement("div", { style: { flex: 1, minWidth: 160 } },
            RATE_DIMS.map(k => React.createElement("div", { key: k, className: "rate-row" },
              React.createElement("span", { className: "rate-label" }, labels[k]),
              React.createElement("div", { className: "rate-bar" }, React.createElement("div", { className: "rate-bar-fill", style: { width: (avg[k] / 5 * 100) + "%" } })),
              React.createElement("span", { className: "rate-num", style: { color: "var(--green)" } }, avg[k].toFixed(1))
            ))
          )
        ),
    React.createElement("button", {
      className: "btn btn-outline btn-sm mt-1",
      onClick: () => setOpen(v => !v)
    }, open ? "✕ " + t.cancel : (mine ? "✎ " : "⭐ ") + t.rateThis),
    open && React.createElement("div", { className: "card mt-1", style: { borderLeft: "3px solid var(--coral)" } },
      RATE_DIMS.map(k => React.createElement("div", { key: k, className: "rate-row" },
        React.createElement("span", { className: "rate-label" }, labels[k]),
        React.createElement(StarPicker, { value: form[k], onChange: v => setForm(f => ({ ...f, [k]: v })) })
      )),
      React.createElement("button", {
        className: "btn btn-green btn-block mt-1",
        onClick: submit, disabled: !canSubmit,
        style: { opacity: canSubmit ? 1 : .5, cursor: canSubmit ? "pointer" : "not-allowed" }
      }, t.rateSubmit)
    )
  );
}
