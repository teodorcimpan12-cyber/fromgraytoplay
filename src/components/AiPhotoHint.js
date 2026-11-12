import { DEMO_ON, g2pSfx, useApp } from "../app/core.js";
import { aiErrMsg, g2pAI } from "../lib/g2p-ai.js";
import { getVoterKey } from "../lib/get-voter-key.js";
import { useEffect, useState } from "../lib/react.js";

// "✨ AI citește poza": one call per photo; it only suggests, the person decides.
export function AiPhotoHint({ photo, onResult, extra }) {
  const { t, lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [st, setSt] = useState({ s: "idle" });
  useEffect(() => { setSt({ s: "idle" }); }, [photo]);
  const [ok, setOk] = useState(() => { try { return localStorage.getItem("g2p_ai_ok") === "1"; } catch (x) { return false; } });
  const [priv, setPriv] = useState(false);
  if (!photo) return null;
  const e = React.createElement;
  const agree = v => { setOk(v); try { if (v) localStorage.setItem("g2p_ai_ok", "1"); else localStorage.removeItem("g2p_ai_ok"); } catch (x) {} };
  const run = () => {
    if (!ok) return;
    setSt({ s: "busy" });
    g2pAI({ task: "photo", image: photo, lang, vk: getVoterKey(), demo: DEMO_ON ? 1 : undefined }).then(r => { setSt({ s: "done", r }); if (onResult) onResult(r); g2pSfx("chime"); })
      .catch(err => { setSt({ s: "err", code: err.code }); if (onResult) onResult(null); });
  };
  const condL = k => ({ good: t.conditionGood, degraded: t.conditionDegraded, abandoned: t.conditionAbandoned }[k] || L3("neclar", "unclear", "nem egyértelmű"));
  if (st.s === "idle") return e("div", null,
    // consent line + privacy note (docs/SPEC_6NOV.md §4); ticked once per device
    e("label", { className: "ai-consent" },
      e("input", { type: "checkbox", checked: ok, onChange: ev => agree(ev.target.checked) }),
      e("span", null, L3("Vreau o estimare AI a stării terenului din poză (opțional).", "I'd like an AI estimate of the court's condition from the photo (optional).", "AI-becslést kérek a pálya állapotáról a fotó alapján (nem kötelező)."), " ", // TODO: HU review
        e("a", { href: "#", onClick: ev => { ev.preventDefault(); setPriv(v => !v); } }, priv ? L3("ascunde", "hide", "elrejt") : L3("Detalii", "Details", "Részletek")))),
    priv && e("div", null, e("p", { className: "text-xs", style: { color: "var(--textSec)", margin: ".3rem 0" } }, L3("Trimit această poză pentru o estimare automată a stării terenului. Poza e procesată de un model AI extern (Anthropic) printr-o funcție a acestui site, fără datele de localizare din fișier. Nu fotografiez persoane.",
        "I'm sending this photo for an automatic estimate of the court's condition. It is processed by an external AI model (Anthropic) through this site's server function, without the file's location data. I'm not photographing people.",
        "Ezt a fotót a pálya állapotának automatikus becsléséhez küldöm. Egy külső AI-modell (Anthropic) dolgozza fel az oldal szerverfunkcióján keresztül, a fájl helyadatai nélkül. Nem fényképezek embereket.")), e("ol", { className: "ai-priv" },
      e("li", null, L3("Ce trimitem: poza (micșorată, fără EXIF/GPS), sportul și orașul terenului. Nimic despre tine.", "What we send: the photo (resized, no EXIF/GPS), the court's sport and city. Nothing about you.", "Amit küldünk: a fotó (kicsinyítve, EXIF/GPS nélkül), a pálya sportága és városa. Rólad semmit.")),
      e("li", null, L3("Cui: funcției Netlify a site-ului, care o trimite la API-ul Anthropic.", "To whom: the site's Netlify function, which sends it to the Anthropic API.", "Kinek: az oldal Netlify-funkciójának, amely az Anthropic API-nak továbbítja.")),
      e("li", null, L3("Ce păstrăm: doar dacă trimiți sesizarea — poza comprimată și diagnosticul, ca orice sesizare. Altfel, nimic.", "What we keep: only if you send the report — the compressed photo and the diagnosis, like any report. Otherwise nothing.", "Amit megőrzünk: csak ha elküldöd a bejelentést — a tömörített fotót és a diagnózist. Különben semmit.")),
      e("li", null, L3("Ștergere: scrie-ne din pagina Despre.", "Deletion: write to us from the About page.", "Törlés: írj nekünk a Rólunk oldalról.")))),
    e("div", { className: "ai-hint" },
      e("button", { type: "button", className: "ai-btn", onClick: run, disabled: !ok, title: ok ? "" : L3("Bifează mai întâi", "Tick the box first", "Előbb jelöld be") }, "🩺 ", L3("AI Court Doctor: citește poza", "AI Court Doctor: read the photo", "AI Court Doctor: fotó elemzése")),
      e("small", null, L3("Estimare AI — nu e o inspecție oficială. Tu decizi.", "AI estimate — not an official inspection. You decide.", "AI-becslés — nem hivatalos szemle. Te döntesz."))));
  if (st.s === "busy") return e("div", { className: "ai-hint ai-busy", role: "status" }, e("span", { className: "ai-spark", "aria-hidden": "true" }, "✨"), L3("AI-ul se uită la poză…", "The AI is looking at the photo…", "Az AI nézi a fotót…"));
  if (st.s === "err") return e("div", { className: "ai-hint ai-err", role: "status" },
    e("span", null, aiErrMsg(st.code, L3)),
    st.code !== "bad_image" && e("button", { type: "button", className: "ai-btn ai-btn-sm", onClick: run }, "↻ ", L3("Încearcă iar", "Try again", "Újra")));
  const r = st.r;
  if (!r.isCourt) return e("div", { className: "ai-card", role: "status" },
    e("div", { className: "ai-tag" }, "✨ ", L3("Estimare AI din poză", "AI estimate from the photo", "AI-becslés a fotóból")),
    e("p", null, L3("Nu văd un teren de sport în poza asta. ", "I can't see a sports court in this photo. ", "Nem látok sportpályát ezen a fotón. "), r.summary));
  const d = r.diag;
  const costL = { "<10k": L3("sub 10.000 lei", "under 10,000 lei", "10 000 lej alatt"), "10-50k": "10.000–50.000 lei", "50-200k": "50.000–200.000 lei", ">200k": L3("peste 200.000 lei", "over 200,000 lei", "200 000 lej felett") };
  return e("div", { className: "ai-card", role: "status" },
    e("div", { className: "ai-tag" }, "🩺 ", L3("AI Court Doctor", "AI Court Doctor", "AI Court Doctor"),
      e("b", { className: "ai-cond ai-c-" + r.condition }, condL(r.condition)),
      e("span", { className: "ai-conf" }, Math.round(r.confidence * 100) + "%")),
    d ? e("div", { className: "ai-diag" },
      e("div", { className: "ai-score" }, d.score, e("small", null, " / 5 · ", L3("estimare din poză", "estimate from the photo", "becslés a fotóból"))),
      r.summary && e("p", { style: { margin: 0 } }, r.summary),
      d.issues.length > 0 && e("div", null, d.issues.map((x, i) => e("div", { key: i, className: "ai-iss" },
        e("span", { className: "ai-sev s" + x.severity, title: L3("gravitate ", "severity ", "súlyosság ") + x.severity + "/3" }, "●".repeat(x.severity) + "○".repeat(3 - x.severity)), x.note))),
      d.fix && d.fix.items.length > 0 && e("div", { className: "ai-fix" }, e("b", null, "🔧 ", L3("Ce ar trebui reparat: ", "What needs fixing: ", "Mit kell javítani: ")), d.fix.items.join(" · "),
        d.fix.cost && e("span", null, " — ", L3("cost estimat ", "rough cost ", "becsült költség "), costL[d.fix.cost] || d.fix.cost))) // TODO: HU review
      : e(React.Fragment, null,
        r.summary && e("p", null, r.summary),
        r.issues && r.issues.length > 0 && e("ul", { className: "ai-issues" }, r.issues.map((x, i) => e("li", { key: i }, x)))),
    e("div", { className: "ai-off" }, L3("Estimare AI — nu e o inspecție oficială și nu schimbă starea terenului de pe hartă.", "AI estimate — not an official inspection; it never changes the court's status on the map.", "AI-becslés — nem hivatalos szemle, és nem módosítja a pálya állapotát a térképen.")),
    extra && extra(r));
}
