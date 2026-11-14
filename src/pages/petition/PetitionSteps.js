import { useApp } from "../../app/core.js";

/* Petition step bar: 1 account · 2 name + email · 3 vote · 4 share. Big type on purpose (older visitors). */
export function PetitionSteps({ step }) {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const steps = [
    ["👤", L3("Fă-ți cont", "Create an account", "Fiók")],
    ["✍️", L3("Nume și email", "Name and email", "Név és e-mail")],
    ["✊", L3("Votează", "Vote", "Szavazz")],
    ["📣", L3("Distribuie", "Share", "Oszd meg")]
  ];
  const now = [
    L3("Pasul 1: fă-ți un cont (durează 30 de secunde).", "Step 1: create an account (takes 30 seconds).", "1. lépés: hozz létre fiókot."),
    L3("Pasul 2: scrie-ți numele și emailul mai jos.", "Step 2: type your name and email below.", "2. lépés: írd be a neved és e-mailed."),
    L3("Pasul 3: alege o variantă, bifează acordul și apasă butonul verde.", "Step 3: pick an option, tick the consent box and press the green button.", "3. lépés: válassz, jelöld be és nyomd meg a zöld gombot."),
    L3("Ultimul pas: trimite petiția la prieteni și familie.", "Last step: send the petition to friends and family.", "Utolsó lépés: küldd el barátaidnak."),
    L3("Gata! Mulțumim — fiecare distribuire aduce alți oameni.", "Done! Thank you — every share brings more people.", "Kész! Köszönjük!")
  ][step - 1];
  return React.createElement("div", { className: "pet-steps", "aria-label": now },
    React.createElement("ol", null, steps.map((st, i) => React.createElement("li", {
      key: i, className: i + 1 < step ? "done" : i + 1 === step ? "now" : ""
    }, React.createElement("span", { className: "ps-n" }, i + 1 < step ? "✓" : i + 1), React.createElement("span", { className: "ps-l" }, st[1])))),
    React.createElement("p", { className: "ps-now" }, now));
}
