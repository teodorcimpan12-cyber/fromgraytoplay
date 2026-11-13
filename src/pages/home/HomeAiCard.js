import { useApp } from "../../app/core.js";
import { CourtConditionQuick } from "../../components/CourtConditionQuick.js";
import { useState } from "../../lib/react.js";

/* Home: tells visitors the AI helpers exist and opens the photo check (court picked inside). */
export function HomeAiCard() {
  const { lang, setPage } = useApp();
  const [open, setOpen] = useState(false);
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const e = React.createElement;
  return e("div", { className: "ai-card", "data-demo": "ai", style: { marginBottom: "1rem" } },
    e("div", { className: "ai-card-h" }, e("span", { className: "ai-card-pill" }, "✨ ", L3("NOU · AI", "NEW · AI", "ÚJ · AI")), L3("Fă o poză unui teren. AI-ul îți spune în ce stare e.", "Take a photo of a court. The AI tells you its condition.", "Fotózz le egy pályát. Az AI megmondja, milyen állapotban van.")),
    e("p", { className: "text-sm", style: { color: "var(--textSec)", margin: "0 0 .7rem" } }, L3("Apoi, din pagina terenului, AI-ul scrie scrisoarea către Primărie. Tu doar o citești și o trimiți.", "Then, from the court page, the AI writes the letter to City Hall. You read it and send it.", "Aztán a pálya oldalán az AI megírja a levelet a Városházának. Te csak elolvasod és elküldöd.")),
    e("div", { className: "ai-card-b" },
      e("button", { className: "btn btn-green", onClick: () => setOpen(true) }, "", L3("Încearcă acum", "Try it now", "Próbáld ki")),
      e("button", { className: "btn btn-outline", onClick: () => setPage("courts") }, "", L3("Alege un teren pentru scrisoare", "Pick a court for the letter", "Válassz pályát a levélhez"))),
    open && ReactDOM.createPortal(e(CourtConditionQuick, { onClose: () => setOpen(false) }), document.body));
}
