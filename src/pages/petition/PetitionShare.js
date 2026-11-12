import { ACTIVE_CITY, useApp } from "../../app/core.js";
import { SITE } from "../../data/constants.js";
import { cityName } from "../../lib/city-name.js";

/* After voting: one big "please share" block with the platforms people actually use. */
export function PetitionShare({ total, onShared }) {
  const { lang, toast } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const url = SITE + "/?c=" + ACTIVE_CITY + "#petition";
  const msg = L3("Am semnat petiția pentru terenuri de sport mai bune în " + cityName(lang) + ". Semnează și tu, durează un minut:",
    "I signed the petition for better sports courts in " + cityName(lang) + ". Sign it too, it takes a minute:",
    "Aláírtam a petíciót jobb sportpályákért (" + cityName(lang) + "). Írd alá te is:");
  const e = encodeURIComponent;
  const hit = () => onShared();
  const native = () => {
    if (navigator.share) navigator.share({ title: "From Grey to Play", text: msg, url }).then(hit).catch(() => {});
  };
  const copy = () => {
    const done = () => { hit(); toast("🔗 " + L3("Link copiat", "Link copied", "Link másolva")); };
    if (navigator.clipboard) navigator.clipboard.writeText(msg + " " + url).then(done).catch(() => {});
  };
  const P = [
    ["WhatsApp", "💬", "https://wa.me/?text=" + e(msg + " " + url), "#25D366"],
    ["Facebook", "📘", "https://www.facebook.com/sharer/sharer.php?u=" + e(url), "#1877F2"],
    ["Telegram", "✈️", "https://t.me/share/url?url=" + e(url) + "&text=" + e(msg), "#229ED9"],
    ["X", "𝕏", "https://twitter.com/intent/tweet?text=" + e(msg) + "&url=" + e(url), "#111827"],
    ["Email", "✉️", "mailto:?subject=" + e(L3("Semnează petiția From Grey to Play", "Sign the From Grey to Play petition", "Petíció")) + "&body=" + e(msg + "\n\n" + url), "#6B7280"]
  ];
  return React.createElement("div", { className: "card pet-share" },
    React.createElement("div", { className: "pet-share-hd" }, "🎉"),
    React.createElement("h3", null, L3("Mulțumim! Acum te rugăm: distribuie petiția", "Thank you! Now please: share the petition", "Köszönjük! Most kérlek, oszd meg")),
    React.createElement("p", null, L3("O petiție cu " + total + " de semnături e ușor de ignorat. Fiecare om căruia i-o trimiți o face mai greu de ignorat.",
      "A petition with " + total + " signatures is easy to ignore. Everyone you send it to makes it harder to ignore.",
      "Egy " + total + " aláírásos petíciót könnyű figyelmen kívül hagyni. Minden megosztás nehezebbé teszi.")),
    navigator.share && React.createElement("button", { className: "btn btn-green btn-lg btn-block", onClick: native }, "📣 " + L3("Distribuie petiția", "Share the petition", "Petíció megosztása")),
    React.createElement("div", { className: "pet-share-grid" },
      P.map(([n, ic, href, col]) => React.createElement("a", { key: n, className: "pet-share-btn", href, target: "_blank", rel: "noopener", onClick: hit, style: { "--pc": col } },
        React.createElement("span", { "aria-hidden": "true" }, ic), n)),
      React.createElement("button", { className: "pet-share-btn", onClick: copy, style: { "--pc": "var(--teal)" } }, React.createElement("span", { "aria-hidden": "true" }, "🔗"), L3("Copiază link", "Copy link", "Link másolása"))));
}
