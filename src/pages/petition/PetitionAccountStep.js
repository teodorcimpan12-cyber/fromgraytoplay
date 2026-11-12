import { useApp } from "../../app/core.js";

export function PetitionAccountStep({ onSignup, onLogin, onSkip }) {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  return React.createElement("div", { className: "card pet-acct" },
    React.createElement("h3", null, "👤 " + L3("Întâi, un cont", "First, an account", "Először egy fiók")),
    React.createElement("p", null, L3("Cu un cont, semnătura ta e a unei persoane reale, nu un clic anonim, iar data viitoare nu mai scrii nimic din nou.",
      "With an account your signature belongs to a real person, not an anonymous click, and next time you don't type anything again.",
      "Fiókkal az aláírásod egy valódi emberé, nem névtelen kattintás.")),
    React.createElement("div", { className: "pet-acct-row" },
      React.createElement("button", { className: "btn btn-green btn-lg", onClick: onSignup }, L3("Creează cont", "Create account", "Fiók létrehozása")),
      React.createElement("button", { className: "btn btn-outline btn-lg", onClick: onLogin }, L3("Am deja cont", "I already have one", "Már van fiókom"))),
    React.createElement("button", { className: "pet-skip", onClick: onSkip }, L3("Nu pot face cont acum — semnez doar cu nume și email", "I can't make an account now — sign with name and email only", "Most nem tudok fiókot — csak névvel és e-maillel")));
}
