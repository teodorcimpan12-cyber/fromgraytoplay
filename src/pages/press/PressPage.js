import { COURTS, PRESS_URL, g2pSfx, useApp } from "../../app/core.js";
import { PressQR } from "../../components/PressQR.js";
import { Reveal } from "../../components/Reveal.js";
import { SatSwipe } from "../../components/SatSwipe.js";
import { SrcRef } from "../../components/SrcRef.js";
import { G2P_EMAIL, SITE } from "../../data/constants.js";
import { usePressData } from "../../hooks/usePressData.js";
import { cityName } from "../../lib/city-name.js";
import { buildPressPdf, pressNumbers, pressRelease } from "../../lib/press-numbers.js";
import { useState } from "../../lib/react.js";
import { copyText, srcById } from "../../lib/src-by-id.js";

export function PressPage() {
  const { lang, toast, setPage } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const d = usePressData();
  const [rl, setRl] = useState(lang === "en" ? "en" : "ro");
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState(false);
  const nums = pressNumbers(lang, d);
  const rel = pressRelease(rl, d);
  const pdf = () => {
    if (busy) return;
    setBusy(true);
    buildPressPdf(lang, d).then(() => { setBusy(false); g2pSfx("chime"); }, () => { setBusy(false); toast(L3("PDF-ul nu s-a putut face. Reîncearcă.", "Couldn't build the PDF. Try again.", "Nem sikerült a PDF. Próbáld újra.")); });
  };
  const copyNum = k => {
    const s = k.src && srcById(k.src);
    copyText(k.n + " " + k.l + " (" + (s ? s.pub + (s.d ? ", " + s.d : "") + (s.url ? ", " + s.url : "") : k.live + ", " + SITE) + ")").then(ok => ok && toast(L3("Copiat ✓", "Copied ✓", "Másolva ✓")));
  };
  return React.createElement("div", { className: "animate-in press" },
    React.createElement("section", { className: "section press-hero" },
      React.createElement("div", { className: "container" },
        React.createElement("span", { className: "press-kicker" }, "📰 " + L3("Kit de presă", "Press kit", "Sajtócsomag") + " · " + cityName(lang)),
        React.createElement("h1", { className: "press-h1" }, L3("Tot ce vă trebuie pentru un articol, cu sursă.", "Everything you need for a story, with sources.", "Minden, ami egy cikkhez kell, forrással.")),
        React.createElement("p", { className: "press-sub" }, L3("Cifrele sunt live. Fiecare are o sursă publică pe care o puteți verifica.", "The numbers are live. Each has a public source you can check.", "A számok élők. Mindegyiknek ellenőrizhető nyilvános forrása van.")),
        React.createElement("div", { className: "press-cta" },
          React.createElement("button", { className: "btn btn-green", onClick: pdf, disabled: busy }, busy ? "⏳ " + L3("Se face PDF-ul…", "Building the PDF…", "PDF készül…") : "📥 " + L3("Descarcă PDF-ul complet", "Download the full PDF", "Teljes PDF letöltése")),
          React.createElement("button", { className: "btn", onClick: () => setQr(true) }, "📱 " + L3("Arată QR", "Show QR", "QR mutatása")),
          React.createElement("button", { className: "btn btn-ghost", onClick: () => copyText(PRESS_URL).then(ok => ok && toast(L3("Link copiat ✓", "Link copied ✓", "Link másolva ✓"))) }, "🔗 " + L3("Copiază linkul", "Copy link", "Link másolása"))))),
    React.createElement("section", { className: "section" },
      React.createElement("div", { className: "container" },
        React.createElement("h2", { className: "section-title" }, "📊 " + L3("Cifre cheie", "Key numbers", "Kulcsszámok")),
        React.createElement("div", { className: "press-nums" }, nums.map((k, i) => React.createElement(Reveal, { key: i, d: i * 50, className: "press-num" },
          React.createElement("div", { className: "press-num-n" }, k.n, k.src && React.createElement(SrcRef, { id: k.src }), k.live && React.createElement("span", { className: "press-live" }, "● live")),
          React.createElement("div", { className: "press-num-l" }, k.l),
          React.createElement("button", { className: "press-copy", onClick: () => copyNum(k), "aria-label": L3("Copiază", "Copy", "Másolás") + ": " + k.n }, "📋 " + L3("Copiază cu sursa", "Copy with source", "Másolás forrással"))))),
        React.createElement("h2", { className: "section-title mt-3" }, "✍️ " + L3("Comunicat de presă", "Press release", "Sajtóközlemény")),
        React.createElement("div", { className: "card press-rel" },
          React.createElement("div", { className: "press-rel-top" },
            React.createElement("div", { className: "src-filter", role: "group", style: { margin: 0 } },
              ["ro", "en"].map(x => React.createElement("button", { key: x, className: "g2chip" + (rl === x ? " g2chip-on" : ""), "aria-pressed": rl === x, onClick: () => setRl(x) }, x.toUpperCase()))),
            React.createElement("button", { className: "btn btn-sm", onClick: () => copyText(rel.join("\n\n")).then(ok => ok && toast(L3("Comunicat copiat ✓", "Release copied ✓", "Közlemény másolva ✓"))) }, "📋 " + L3("Copiază textul", "Copy text", "Szöveg másolása"))),
          rel.map((p, i) => React.createElement("p", { key: i, className: i === 0 ? "press-lead" : "" }, p)),
          React.createElement("p", { className: "text-xs", style: { color: "var(--textSec)" } }, L3("Generat acum din datele live ale site-ului.", "Generated just now from the site's live data.", "Most készült az oldal élő adataiból."))),
        React.createElement("h2", { className: "section-title mt-3" }, "🖼️ " + L3("Imagini", "Images", "Képek")),
        React.createElement("p", { className: "section-sub" }, L3("Doar imagini reale, cu sursa sub fiecare.", "Only real images, with the source under each one.", "Csak valódi képek, mindegyik alatt a forrással.")),
        React.createElement(SatSwipe, null),
        d.photos.length > 0 && React.createElement("div", { className: "press-photos" }, d.photos.map((r, i) => {
          const c = COURTS.find(cc => cc.id === r.courtId);
          return React.createElement("figure", { key: i, className: "press-photo" },
            React.createElement("img", { src: r.photoDataUrl, alt: c ? c.name : "", loading: "lazy" }),
            React.createElement("figcaption", null, (c ? c.name + " · " : "") + L3("poză trimisă de un vizitator", "photo sent by a visitor", "látogató fotója") + (r.timestamp ? " · " + new Date(r.timestamp).toLocaleDateString("ro-RO") : "")));
        })),
        React.createElement("div", { className: "press-logo card mt-2" },
          React.createElement("img", { src: "/icons/icon-192.png", alt: "From Grey to Play logo", width: 72, height: 72 }),
          React.createElement("div", null, React.createElement("strong", null, "Logo · PNG 512×512"), React.createElement("p", { className: "text-xs", style: { color: "var(--textSec)", margin: ".2rem 0 .5rem" } }, L3("Liber de folosit în articole despre proiect.", "Free to use in articles about the project.", "Szabadon használható a projektről szóló cikkekben."))),
          React.createElement("a", { className: "btn btn-sm", href: "/icons/icon-512.png", download: "from-grey-to-play-logo.png" }, "📥 PNG")),
        React.createElement("h2", { className: "section-title mt-3" }, "✉️ " + L3("Contact", "Contact", "Kapcsolat")),
        React.createElement("div", { className: "card press-contact" },
          React.createElement("a", { className: "press-mail", href: "mailto:" + G2P_EMAIL + "?subject=" + encodeURIComponent("From Grey to Play — presă") }, G2P_EMAIL),
          React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)", margin: ".4rem 0 0" } }, L3("Numărul de telefon este în PDF.", "The phone number is in the PDF.", "A telefonszám a PDF-ben van.")),
          React.createElement("button", { className: "btn btn-sm mt-1", onClick: () => { sessionStorage.setItem("g2p_about_tab", "sources"); setPage("about"); window.scrollTo(0, 0); } }, "📚 " + L3("Toate sursele", "All sources", "Összes forrás"))))),
    qr && React.createElement(PressQR, { onClose: () => setQr(false) }));
}
