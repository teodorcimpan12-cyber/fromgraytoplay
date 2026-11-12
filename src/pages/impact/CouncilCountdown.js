import { ACTIVE_CITY, COUNCIL_DATES, useApp } from "../../app/core.js";
import { Reveal } from "../../components/Reveal.js";
import { useEffect, useState } from "../../lib/react.js";

export function getNextCouncilDate() {
  var now = new Date();
  return COUNCIL_DATES.find(function(d) { return d > now; }) || COUNCIL_DATES[COUNCIL_DATES.length - 1];
}
export function CouncilCountdown() {
  if (ACTIVE_CITY !== "tgm") return null; // the session calendar below is Târgu Mureș's; the city never changes without a reload
  var appCtx = useApp();
  var t = appCtx.t, lang = appCtx.lang;
  var diffState = useState(0);
  var diff = diffState[0], setDiff = diffState[1];
  var nextDate = getNextCouncilDate();

  useEffect(function() {
    var tick = function() { setDiff(Math.max(0, nextDate - Date.now())); };
    tick();
    var iv = setInterval(tick, 60000);
    return function() { clearInterval(iv); };
  }, []);

  var days = Math.floor(diff / 86400000);
  var hours = Math.floor((diff % 86400000) / 3600000);
  var mins = Math.floor((diff % 3600000) / 60000);

  return React.createElement(Reveal, { as:"div", className:"card mb-2" },
    React.createElement("div", { className:"flex items-center gap-2 mb-2" },
      React.createElement("span", { style:{fontSize:"1.2rem"} }, "🏛️"),
      React.createElement("h4", { style:{fontFamily:"'Space Mono',monospace",fontSize:".88rem",fontWeight:700} },
        t.countdownTitle || "Până la următoarea ședință de consiliu"
      )
    ),
    React.createElement("div", { className:"countdown-wrap" },
      React.createElement("div", { className:"countdown-unit" },
        React.createElement("div", { className:"countdown-num" }, days),
        React.createElement("div", { className:"countdown-label" }, t.countdownDays||"zile")
      ),
      React.createElement("div", { className:"countdown-sep" }, ":"),
      React.createElement("div", { className:"countdown-unit" },
        React.createElement("div", { className:"countdown-num" }, String(hours).padStart(2,"0")),
        React.createElement("div", { className:"countdown-label" }, t.countdownHours||"ore")
      ),
      React.createElement("div", { className:"countdown-sep" }, ":"),
      React.createElement("div", { className:"countdown-unit" },
        React.createElement("div", { className:"countdown-num" }, String(mins).padStart(2,"0")),
        React.createElement("div", { className:"countdown-label" }, t.countdownMins||"min")
      )
    ),
    React.createElement("p", { className:"text-xs", style:{textAlign:"center",color:"var(--textSec)"} },
      (lang==="ro"?"Ședința din ":lang==="hu"?"Következő ülés: ":"Session on ") +
      nextDate.toLocaleDateString(lang==="ro"?"ro-RO":lang==="hu"?"hu-HU":"en-GB", {day:"numeric",month:"long",year:"numeric"})
    )
  );
}
