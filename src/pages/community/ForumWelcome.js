import { useApp } from "../../app/core.js";

// Always on top of the forum: a short note from the team (rendered, not stored).
export function ForumWelcome() {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  return React.createElement("div", { className: "card mb-1 cm-welcome" },
    React.createElement("div", { className: "flex justify-between items-center" },
      React.createElement("span", { className: "badge badge-green" }, "📌 " + L3("fixat", "pinned", "kitűzve")),
      React.createElement("span", { className: "text-xs", style: { color: "var(--textSec)" } }, L3("Echipa G2P", "G2P team", "G2P csapat"))),
    React.createElement("h4", { className: "mt-1" }, "👋 " + L3("Bun venit pe forum!", "Welcome to the forum!", "Üdv a fórumon!")),
    React.createElement("p", { className: "text-sm mt-1" }, L3(
      "Aici vorbim despre terenurile din cartierul tău: ce e stricat, ce idei ai, cu cine joci. Scrie scurt și concret, votează postările bune și fără atacuri la persoană. O problemă de pe teren ajunge mai repede la Primărie din Sesizări.",
      "This is where we talk about the courts in your area: what is broken, what you would change, who you play with. Keep it short and concrete, vote up the good posts, no personal attacks. A problem on a court reaches City Hall faster through Reports.",
      "Itt a környékbeli pályákról beszélünk: mi romlott el, milyen ötleteid vannak, kivel játszol. Írj röviden és konkrétan, szavazz a jó bejegyzésekre, személyeskedés nélkül. A pályán látott gond a Bejelentéseken át gyorsabban jut el a Városházára.")),
    React.createElement("p", { className: "text-xs", style: { color: "var(--textSec)" } }, "— " + L3("Echipa G2P", "The G2P team", "A G2P csapat")));
}
