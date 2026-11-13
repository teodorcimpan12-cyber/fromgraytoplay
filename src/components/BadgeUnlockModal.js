import { useEffect } from "../lib/react.js";

export function BadgeUnlockModal(props) {
  var badge = props.badge, lang = props.lang, onClose = props.onClose;
  var name = badge.name[lang] || badge.name.en;
  var desc = badge.desc[lang] || badge.desc.en;
  useEffect(function() { var tid = setTimeout(onClose, 4500); return function() { clearTimeout(tid); }; }, []);
  return React.createElement("div", { className:"badge-unlock-overlay", onClick:onClose, role:"dialog", "aria-modal":"true" },
    React.createElement("div", { className:"badge-unlock-card", onClick:function(e){e.stopPropagation();} },
      React.createElement("div", { className:"badge-unlock-kicker" }, "🎉 " + (lang==="ro"?"Insignă deblocată!":lang==="hu"?"Jelvény feloldva!":"Badge unlocked!")),
      React.createElement("span", { className:"badge-unlock-icon" }, badge.icon),
      React.createElement("div", { className:"badge-unlock-name" }, name),
      React.createElement("p", { className:"badge-unlock-desc" }, desc),
      React.createElement("button", { className:"btn btn-green btn-sm", onClick:onClose, style:{minWidth:80} }, "Ok")
    )
  );
}
