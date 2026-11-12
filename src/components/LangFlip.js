import { g2pSfx, useApp } from "../app/core.js";
import { FlagIcon } from "./FlagIcon.js";
import { LANG_NAMES } from "../data/constants.js";
import { fxReduced } from "../lib/fx-reduced.js";
import { nextLang } from "../lib/next-lang.js";
import { useRef, useState } from "../lib/react.js";

/* Language button: shows the current flag; a click flips it in 3D to the next language and
   the page cross-fades into the new text. */
export function LangFlip({ big }) {
  const { lang, setLang } = useApp();
  const [flip, setFlip] = useState(false);
  const busy = useRef(false);
  const next = nextLang(lang);
  const go = () => {
    if (busy.current) return;
    if (fxReduced()) { setLang(next); return; }
    busy.current = true; setFlip(true); g2pSfx("flip");
    setTimeout(() => {
      const swap = () => setLang(next);
      if (document.startViewTransition && ReactDOM.flushSync) document.startViewTransition(() => ReactDOM.flushSync(swap));
      else swap();
    }, 190);
    setTimeout(() => { setFlip(false); busy.current = false; }, 420);
  };
  return React.createElement("button", {
    className: "lang-flip" + (big ? " big" : "") + (flip ? " flipping" : ""),
    onClick: go, title: LANG_NAMES[next],
    "aria-label": LANG_NAMES[lang] + " → " + LANG_NAMES[next]
  },
    React.createElement("span", { className: "lf-card" }, React.createElement(FlagIcon, { code: lang })),
    React.createElement("span", { className: "lf-code" }, lang.toUpperCase()));
}
