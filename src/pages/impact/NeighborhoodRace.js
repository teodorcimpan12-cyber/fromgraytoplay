import { ACTIVE_CITY, COURTS, useApp } from "../../app/core.js";
import { Reveal } from "../../components/Reveal.js";
import { HOOD_COURT_MAP } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { hoodName } from "../../lib/next-lang.js";

export function NeighborhoodRace() {
  var appCtx = useApp();
  var t = appCtx.t, lang = appCtx.lang;
  var activity = useFirebase("activity");
  var reports = useFirebase("reports");
  var hoodMap = ACTIVE_CITY === "tgm" ? HOOD_COURT_MAP : COURTS.reduce(function(m, c) { (m[c.neighbourhood] = m[c.neighbourhood] || []).push(c.id); return m; }, {});
  var hoods = Object.keys(hoodMap);
  var scores = hoods.map(function(hood) {
    var courtIds = hoodMap[hood];
    var score = 0;
    if (activity) Object.values(activity).forEach(function(a) { if (courtIds.includes(a.courtId)) score += 1; });
    if (reports) Object.values(reports).forEach(function(r) { if (courtIds.includes(r.courtId)) score += 2; });
    return { hood:hood, score:score, label:hoodName(hood, lang) };
  });
  scores.sort(function(a,b) { return b.score - a.score; });
  var maxScore = Math.max.apply(null, scores.map(function(s){return s.score;}).concat([1]));
  var medals = ["🥇","🥈","🥉"];
  return React.createElement(Reveal, { as:"div" },
    React.createElement("div", { className:"card" },
      React.createElement("div", { className:"flex items-center gap-2 mb-2" },
        React.createElement("span", { style:{fontSize:"1.3rem"} }, "🏁"),
        React.createElement("h3", { style:{fontSize:"1rem",fontWeight:700} }, t.neighborhoodRace || "Cursa cartierelor"),
        React.createElement("span", { className:"badge badge-green", style:{fontSize:".65rem",marginLeft:"auto"} }, "live")
      ),
      React.createElement("p", { className:"text-xs mb-2", style:{color:"var(--textSec)"} },
        lang==="ro"?"Cartierul cu cel mai mult activism civic câștigă":lang==="hu"?"A legtöbb polgári aktivizmust mutató kerület nyer":"The most civically active neighbourhood wins"
      ),
      scores.map(function(s, i) { return React.createElement("div", { key:s.hood, className:"race-row" },
        React.createElement("div", { className:"race-rank" },
          i < 3 ? React.createElement("span", { className:"race-medal" }, medals[i]) : React.createElement("span", { style:{color:"var(--textSec)",fontSize:"1rem"} }, i+1)
        ),
        React.createElement("div", null,
          React.createElement("div", { className:"race-label" }, s.label),
          React.createElement("div", { className:"race-bar-wrap" },
            React.createElement("div", { className:"race-bar", style:{
              width:(s.score/maxScore*100)+"%",
              background:i===0?"linear-gradient(90deg,var(--green),var(--teal))":i===1?"linear-gradient(90deg,var(--teal),#7DF7C9)":"var(--border)"
            }})
          )
        ),
        React.createElement("div", { className:"race-score", style:{color:i<3?"var(--green)":"var(--textSec)"} }, s.score)
      ); }),
      React.createElement("p", { className:"text-xs mt-2", style:{color:"var(--textSec)",textAlign:"center"} },
        lang==="ro"?"Scor: 1 activitate = 1pt · 1 raport = 2pt":lang==="hu"?"Pontok: 1 aktivitás = 1pt · 1 jelentés = 2pt":"Score: 1 activity = 1pt · 1 report = 2pt"
      )
    )
  );
}
