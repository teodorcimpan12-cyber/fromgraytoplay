import { BADGES } from "../../data/badges.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { getVoterKey } from "../../lib/get-voter-key.js";

export function BadgesGrid(props) {
  var lang = props.lang;
  var vk = getVoterKey();
  var raw = useFirebase(vk ? "achievements/" + vk : null);
  var earned = raw || {};
  var earnedCount = BADGES.filter(function(b) { return earned[b.id]; }).length;
  return React.createElement("div", null,
    React.createElement("div", { className:"flex justify-between items-center mb-2" },
      React.createElement("h4", { style:{fontSize:".88rem",fontWeight:700} },
        lang==="ro"?"Insignele mele":lang==="hu"?"Jelvényeim":"My Badges"
      ),
      React.createElement("span", { className:"badge badge-green", style:{fontSize:".7rem"} },
        earnedCount + "/" + BADGES.length
      )
    ),
    React.createElement("div", { className:"badges-grid" },
      BADGES.map(function(b) {
        var isEarned = !!earned[b.id];
        return React.createElement("div", {
          key:b.id,
          className:"badge-slot " + (isEarned?"earned":"locked"),
          title:(b.name[lang]||b.name.en) + " — " + (b.desc[lang]||b.desc.en)
        },
          React.createElement("span", { className:"bi" }, b.icon),
          React.createElement("span", { className:"bn" }, b.name[lang]||b.name.en)
        );
      })
    )
  );
}
