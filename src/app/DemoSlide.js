import { ACTIVE_CITY } from "./core.js";
import { SITE } from "../data/constants.js";

export function DemoSlide({ sl, kicker, onClose }) {
  const e = React.createElement;
  return ReactDOM.createPortal(e("div", { className: "demo-slide", onClick: onClose },
    e("div", { className: "demo-slide-in", onClick: ev => ev.stopPropagation() },
      e("p", { className: "demo-slide-k" }, kicker || sl.k || ""),
      sl.big != null && e("div", { className: "demo-slide-big" }, e("b", null, sl.big), e("span", null, sl.bigL)),
      sl.title && e("h2", { className: "demo-slide-h" }, sl.title),
      sl.cols ? e("div", { className: "demo-slide-cols" }, sl.cols.map((c, i) => e("div", { key: i, className: "demo-slide-col" },
        e("h3", null, c[0]), e("ul", null, c.slice(1).map((x, j) => e("li", { key: j }, x)))))) :
      e("div", { className: "demo-slide-row" },
        e("ul", { className: "demo-slide-ul" }, (sl.lines || []).map((x, j) => e("li", { key: j, style: { "--d": j } }, x))),
        sl.qr && e("div", { className: "demo-slide-qr" },
          e("img", { src: "/icons/qr-" + ACTIVE_CITY + ".svg", alt: SITE + "/?c=" + ACTIVE_CITY, width: 260, height: 260 }),
          e("p", null, SITE.replace("https://", "") + "/?c=" + ACTIVE_CITY))),
      sl.src && e("p", { className: "demo-slide-src" }, "Sursă: " + sl.src))), document.body);
}
