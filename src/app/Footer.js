import { FunPanel } from "./FunPanel.js";
import { ACTIVE_CITY, COURTS, useApp } from "./core.js";
import { PrivacyPolicyModal } from "../components/PrivacyPolicyModal.js";
import { SRC_KIND_IC } from "../data/constants.js";
import { cityName } from "../lib/city-name.js";
import { useState } from "../lib/react.js";
import { srcList } from "../lib/src-by-id.js";

/* === Footer === */
/* Footer source links follow the selected city: one map/data source, the city's own news and city-hall source, one study. */
export function footerSources() {
  var picked = [], list = srcList().filter(function (s) { return s.url; });
  [["map", "data"], ["news"], ["gov"], ["study"]].forEach(function (kinds) {
    var hit = list.find(function (s) { return kinds.indexOf(s.kind) >= 0 && (s.kind === "study" || s.city === ACTIVE_CITY); });
    if (hit) picked.push(hit);
  });
  return picked;
}
export function footerSrcLabel(s) {
  if (s.id === "sidu") return "SIDU";
  if (s.id === "mymaps") return "Maps";
  return String(s.pub).split(" · ")[0].replace(/ \(ODbL\)$/, "");
}
export function Footer() {
  const { t, lang, setPage } = useApp();
  const [showPrivacy, setShowPrivacy] = useState(false);
  return React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("footer", {
      className: "footer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "container"
    }, /*#__PURE__*/React.createElement("p", { className: "footer-credit" }, t.madeBy, " ", t.owner, " · ", cityName(lang), lang === "en" ? ", Romania" : lang === "hu" ? ", Románia" : ", România"), React.createElement(FunPanel, null), /*#__PURE__*/React.createElement("p", {
      className: "mt-1"
    }, footerSources().map(function (s) {
      return React.createElement(React.Fragment, { key: s.id }, React.createElement("a", { href: s.url, target: "_blank", rel: "noopener" }, (SRC_KIND_IC[s.kind] || "🔗") + " " + footerSrcLabel(s)), " · ");
    }), React.createElement("a", {
      href: "#",
      onClick: function(e) { e.preventDefault(); setShowPrivacy(true); },
      style: { color: "var(--green)" }
    }, "🔒 ", t.privacyPolicy || "Politică de Confidențialitate"), " · ", React.createElement("a", {
      href: "/press",
      onClick: function(e) { e.preventDefault(); setPage("press"); window.scrollTo(0, 0); }
    }, "📰 ", lang === "en" ? "Press" : lang === "hu" ? "Sajtó" : "Presă"), " · ", React.createElement("a", {
      href: "/promo"
    }, "🎬 Promo")), /*#__PURE__*/React.createElement("p", {
      className: "mt-1"
    }, t.copyright), React.createElement("p", { className: "text-xs", style: { color: "var(--textSec)", marginTop: ".3rem" } },
      "Sursă hărți și terenuri Sibiu: © ", React.createElement("a", { href: "https://www.openstreetmap.org/copyright", target: "_blank", rel: "noopener", style: { color: "var(--green)" } }, "OpenStreetMap contributors"), " (ODbL)"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 mt-2",
      style: { justifyContent: "center", flexWrap: "wrap" }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#courts",
      style: { fontSize: ".78rem", color: "var(--textSec)", display: "flex", alignItems: "center", gap: ".3rem" }
    }, /*#__PURE__*/React.createElement("span", null, "🏀"), /*#__PURE__*/React.createElement("span", null, "Cele " + COURTS.length + " de terenuri pe hartă"))), React.createElement("span", { className: "footer-tell", "aria-hidden": "true" }, "· · ·"))),
    showPrivacy && React.createElement(PrivacyPolicyModal, { onClose: function() { setShowPrivacy(false); } })
  );
}
