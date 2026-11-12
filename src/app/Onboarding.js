import { CITY_CFG } from "../data/constants.js";
import { useState } from "../lib/react.js";

export function bothCities(lang) {
  const names = Object.keys(CITY_CFG).map(k => { const c = CITY_CFG[k]; return lang === "hu" ? c.nameHu : lang === "en" ? c.nameEn.split(" / ")[0] : c.nameRo; });
  return names.join(lang === "ro" ? " și " : lang === "hu" ? " és " : " and ");
}
/* === Onboarding === */
export function Onboarding({
  onDone,
  lang
}) {
  const [s, setS] = useState(0);
  const screens = [{
    emoji: "🏀",
    title: "FROM GREY TO PLAY",
    // Both cities the site covers, not only the active one.
    sub: lang === "ro" ? "Documentăm inegalitatea infrastructurii sportive din " + bothCities("ro") : "Documenting sports infrastructure inequality in " + bothCities(lang),
    bg: "linear-gradient(135deg,#1A1A2E,#16213E)"
  }, {
    emoji: "🏚️ ↔ 🏟️",
    title: lang === "ro" ? "Același oraș, două realități" : "Same city, two worlds",
    sub: lang === "ro" ? "Centrul strălucește. Cartierele periferice se degradează." : "The centre shines. Peripheral neighbourhoods crumble.",
    bg: "linear-gradient(135deg,#374151,#1A1A2E)"
  }, {
    emoji: "✊",
    title: lang === "ro" ? "Ajută-ne să schimbăm asta" : "Help us change this",
    sub: lang === "ro" ? "Semnează, raportează, participă." : "Sign, report, participate.",
    bg: "linear-gradient(135deg,#10B981,#0D9488)"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "onboarding",
    style: {
      background: screens[s].bg,
      transition: "background .4s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "3.5rem",
      marginBottom: "1rem",
      animation: "pulse 2s infinite"
    }
  }, screens[s].emoji), /*#__PURE__*/React.createElement("h1", null, screens[s].title), /*#__PURE__*/React.createElement("p", null, screens[s].sub), /*#__PURE__*/React.createElement("div", {
    className: "ob-dots"
  }, screens.map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: i === s ? "active" : ""
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline",
    onClick: onDone
  }, lang === "ro" ? "Treci peste" : "Skip"), s < 2 ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green",
    onClick: () => setS(s + 1)
  }, lang === "ro" ? "Următorul" : "Next") : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green",
    onClick: onDone
  }, lang === "ro" ? "Începe" : "Start", " \u2192")));
}
