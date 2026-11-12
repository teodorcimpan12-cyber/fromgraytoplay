import { ACTIVE_CITY, db, useApp } from "../../app/core.js";
import { useEffect, useState } from "../../lib/react.js";

/* === Report Modal === */
export function ReportModal({
  onClose
}) {
  const {
    t,
    toast
  } = useApp();
  const DRAFT_KEY = "g2p_draft_report";
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (d.ts && Date.now() - d.ts < 48 * 3600000) return d.form;
    } catch (e) {}
    return null;
  };
  const initDraft = loadDraft();
  const [f, setF] = useState(initDraft || {
    name: "",
    address: "",
    condition: 3,
    description: "",
    category: "basketball"
  });
  useEffect(() => { if (initDraft) toast(t.draftRestored || "Ciornă restaurată"); }, []);
  const updateF = (patch) => {
    const nf = { ...f, ...patch };
    setF(nf);
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ form: nf, ts: Date.now() })); } catch (e) {}
  };
  const sub = () => {
    if (!f.name || !f.address) {
      toast(t.error);
      return;
    }
    // Coordinates only from the reporter's GPS — a court without them is listed, never placed at a guessed spot.
    // The citizen's 1–5 estimate is kept as reportedCondition; `condition` is reserved for verified scores.
    const { condition: reportedCondition, lat, lng, ...rest } = f;
    db.ref("courts").push({
      ...rest,
      city: ACTIVE_CITY,
      status: "unverified",
      condition: null,
      reportedCondition,
      occupancy: "empty",
      progress: 0,
      date: new Date().toISOString(),
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      reports: 1,
      accessibility: {
        wheelchair: false,
        lighting: false,
        parking: false,
        flatSurface: false
      }
    });
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    toast(t.success);
    onClose();
  };
  const gps = () => {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => updateF({
      address: `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`,
      lat: +p.coords.latitude.toFixed(5),
      lng: +p.coords.longitude.toFixed(5)
    }));
  };
  const cancelAndClear = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    onClose();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: cancelAndClear
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h2", {
    className: "mb-2"
  }, t.reportCourt), /*#__PURE__*/React.createElement("input", {
    placeholder: t.courtName,
    value: f.name,
    onChange: e => updateF({ name: e.target.value }),
    className: "mb-1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1 mb-1"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: t.address,
    value: f.address,
    onChange: e => updateF({ address: e.target.value })
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-outline",
    onClick: gps,
    type: "button"
  }, "\uD83D\uDCCD")), /*#__PURE__*/React.createElement("select", {
    value: f.category,
    onChange: e => updateF({ category: e.target.value }),
    className: "mb-1"
  }, /*#__PURE__*/React.createElement("option", {
    value: "basketball"
  }, t.basketball), /*#__PURE__*/React.createElement("option", {
    value: "football"
  }, t.football), /*#__PURE__*/React.createElement("option", {
    value: "handball"
  }, t.handball), /*#__PURE__*/React.createElement("option", {
    value: "tennis"
  }, t.tennis), /*#__PURE__*/React.createElement("option", {
    value: "multiuse"
  }, t.multiuse)), /*#__PURE__*/React.createElement("div", {
    className: "mb-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-sm"
  }, t.condition, ": ", f.condition, "/5"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: "5",
    value: f.condition,
    onChange: e => updateF({ condition: +e.target.value })
  })), /*#__PURE__*/React.createElement("textarea", {
    placeholder: t.description,
    value: f.description,
    onChange: e => updateF({ description: e.target.value }),
    rows: 3,
    className: "mb-1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-block",
    onClick: sub
  }, t.submit), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline",
    onClick: cancelAndClear
  }, t.cancel))));
}
