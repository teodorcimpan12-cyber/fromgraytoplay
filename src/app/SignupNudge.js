import { DEMO_ON, DEMO_REMOTE, useApp } from "./core.js";
import { useEffect, useRef, useState } from "../lib/react.js";

/* First-visit invitation to create an account: appears once after ~25 s of real browsing, never during onboarding,
   never for signed-in users; "later" hides it for 14 days. Bottom card, no backdrop, so it never blocks the page. */
export function SignupNudge({ onSignup }) {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const KEY = "g2p_nudge";
  const [show, setShow] = useState(false);
  const shownRef = useRef(false);
  useEffect(() => {
    if (DEMO_ON || DEMO_REMOTE) return;   // never pops up over a live pitch
    let last = 0; try { last = +localStorage.getItem(KEY) || 0; } catch (e) {}
    if (Date.now() - last < 14 * 864e5) return;
    // Needs 25 s on the site AND one real interaction (scroll or page change), and waits while the install banner is up.
    let engaged = false, timeUp = false;
    const tryShow = () => { if (engaged && timeUp && !shownRef.current && !document.querySelector(".install-banner")) { shownRef.current = true; clearInterval(poll); setShow(true); } };
    const engage = () => { engaged = true; tryShow(); };
    const id = setTimeout(() => { timeUp = true; tryShow(); }, 25000);
    const poll = setInterval(tryShow, 5000);
    window.addEventListener("scroll", engage, { passive: true, once: true });
    window.addEventListener("hashchange", engage, { once: true });
    window.addEventListener("popstate", engage, { once: true });
    return () => { clearTimeout(id); clearInterval(poll); window.removeEventListener("scroll", engage); window.removeEventListener("hashchange", engage); window.removeEventListener("popstate", engage); };
  }, []);
  const hide = () => { setShow(false); try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} };
  if (!show) return null;
  return ReactDOM.createPortal(React.createElement("div", { className: "g2p-nudge", role: "dialog", "aria-label": L3("Creează un cont", "Create an account", "Fiók létrehozása") },
    React.createElement("button", { className: "g2p-nudge-x", "aria-label": L3("Închide", "Close", "Bezárás"), onClick: hide }, "×"),
    React.createElement("div", { className: "g2p-nudge-ic" }, "🏀"),
    React.createElement("h3", null, L3("Primăria repară după dovezi, nu după like-uri.", "City Hall fixes things on evidence, not likes.", "A városháza bizonyítékra javít, nem lájkokra.")),
    React.createElement("p", null, L3(
      "Fiecare semnătură, sesizare și teren verificat intră în dosarul pe care îl ducem la Primărie. Cu un cont, ale tale poartă numele tău, le urmărești până se rezolvă și cântăresc mai mult decât un clic anonim.",
      "Every signature, report and verified court goes into the file we take to City Hall. With an account, yours carry your name, you can follow them until they're fixed, and they weigh more than an anonymous click.",
      "Minden aláírás, bejelentés és ellenőrzött pálya bekerül a városházának vitt dossziéba. Fiókkal a tieid a neveddel szerepelnek, követheted őket a megoldásig.")),
    React.createElement("div", { className: "g2p-nudge-row" },
      React.createElement("button", { className: "btn btn-green", onClick: () => { hide(); onSignup(); } }, L3("Creează cont", "Create account", "Fiók létrehozása")),
      React.createElement("button", { className: "btn btn-outline", onClick: hide }, L3("Mai târziu", "Later", "Később")))), document.body);
}
