import { ACTIVE_CITY, useApp } from "../app/core.js";
import { CITY_REQUESTS } from "../data/city-requests.js";
import { deadlineState } from "../lib/deadline-state.js";

export function RequestTracker() {
  const { lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const list = CITY_REQUESTS.filter(r => r.city === ACTIVE_CITY);
  if (!list.length) return null;
  const DAY = 864e5, now = Date.now();
  const fmt = ms => new Date(ms).toLocaleDateString(lang === "en" ? "en-GB" : lang === "hu" ? "hu-HU" : "ro-RO", { day: "numeric", month: "short" });
  return React.createElement("div", { className: "rq-wrap" }, list.map(r => {
    const ds = deadlineState(r.reg + "T00:00:00", 10, !!r.answeredAt, now);
    const reg = ds.start, due = ds.due, max = reg + 30 * DAY, left = ds.left, pct = ds.pct;
    const st = r.answeredAt ? "done" : now <= due ? "wait" : now <= max ? "late" : "over";
    const stLabel = { done: L3("Răspuns primit", "Answer received", "Válasz megérkezett"), wait: L3("Așteptăm răspunsul", "Waiting for the answer", "Várjuk a választ"), late: L3("Au trecut cele 10 zile — așteptăm, revenim", "The 10 days have passed — we're following up", "Letelt a 10 nap — újra írunk"), over: L3("Nici termenul maxim n-a fost respectat", "Even the maximum deadline was missed", "A végső határidő is lejárt") }[st];
    return React.createElement("article", { key: r.regNo, className: "card rq rq-" + st },
      React.createElement("div", { className: "rq-top" },
        React.createElement("span", { className: "rq-k" }, "🏛️ " + L3("Cerere oficială · Legea 544/2001", "Official request · Law 544/2001", "Hivatalos kérelem · 544/2001-es törvény")),
        React.createElement("span", { className: "rq-st" }, stLabel)),
      React.createElement("h3", { className: "rq-h" }, L3("Am cerut datele direct de la ", "We asked for the data straight from ", "Az adatokat közvetlenül kértük: ") + r.to),
      React.createElement("div", { className: "rq-meta" },
        React.createElement("span", null, L3("Nr. înregistrare ", "Registration no. ", "Iktatószám "), React.createElement("b", null, r.regNo + " / " + new Date(reg).toLocaleDateString("ro-RO"))),
        React.createElement("span", null, L3("Termen legal: ", "Legal deadline: ", "Törvényes határidő: "), React.createElement("b", null, fmt(due)), " · " + L3("cu prelungire, max. ", "with extension, max. ", "hosszabbítással max. ") + fmt(max))),
      st === "wait" && React.createElement("div", { className: "rq-bar", role: "progressbar", "aria-valuenow": Math.round(pct), "aria-valuemin": 0, "aria-valuemax": 100 },
        React.createElement("i", { style: { width: pct + "%" } }),
        React.createElement("span", null, left <= 0 ? L3("azi e ultima zi", "today is the last day", "ma az utolsó nap") : L3("mai sunt " + left + (left === 1 ? " zi" : " zile"), left + (left === 1 ? " day" : " days") + " left", "még " + left + " nap"))),
      React.createElement("ul", { className: "rq-list" }, (r.asked[lang] || r.asked.ro).map((x, i) => React.createElement("li", { key: i }, x))),
      React.createElement("p", { className: "rq-foot" }, r.answeredAt ? L3("Ce scrie în răspuns e acum la Surse, cu link.", "What the answer says is now under Sources, with a link.", "A válasz tartalma most a Forrásoknál van, linkkel.")
        : L3("Când vine răspunsul, îl publicăm aici și la Surse — exact ce scrie în el.", "When the answer arrives, we publish it here and under Sources — exactly what it says.", "Ha megjön a válasz, itt és a Forrásoknál közzétesszük — pontosan azt, ami benne áll.")));
  }));
}
