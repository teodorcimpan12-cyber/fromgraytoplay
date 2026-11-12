import { db, useApp } from "../../app/core.js";
import { TASK_TEMPLATES } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { getVoterKey } from "../../lib/get-voter-key.js";
import { logActivity } from "../../lib/log-activity.js";

/* === S4-F9: Task Board ===
   Firebase tasks/{courtId}/{taskKey}/volunteers/{voterKey}: name.
   Shown in CourtDetail for degraded/inProgress courts. */
export function TaskBoard({ court }) {
  var _ref = useApp(), t = _ref.t, lang = _ref.lang, toast = _ref.toast;
  var vk = getVoterKey();
  var _jn = React.useState(""), joinName = _jn[0], setJoinName = _jn[1];
  var tasks = useFirebase("tasks/" + court.id) || {};
  var joinTask = function(taskKey) {
    if (!joinName.trim()) { toast(t.error); return; }
    db.ref("tasks/" + court.id + "/" + taskKey + "/volunteers/" + vk).set(joinName.trim());
    logActivity("task", joinName.trim(), court.id);
    toast(t.taskJoined || "Te-ai înscris la echipă!");
  };
  var leaveTask = function(taskKey) {
    db.ref("tasks/" + court.id + "/" + taskKey + "/volunteers/" + vk).remove();
  };
  return React.createElement("div", { className: "card mt-2" },
    React.createElement("h4", { className: "mb-1" }, t.taskBoard || "Echipa de reparații"),
    React.createElement("input", { placeholder: t.yourName || "Numele tău", value: joinName, onChange: function(e) { setJoinName(e.target.value); }, className: "mb-1" }),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: ".5rem" } },
      TASK_TEMPLATES.map(function(tmpl) {
        var taskData = tasks[tmpl.key] || {}, vols = taskData.volunteers || {};
        var volKeys = Object.keys(vols), volNames = Object.values(vols);
        var isJoined = !!vols[vk], full = volKeys.length >= 3;
        return React.createElement("div", { key: tmpl.key, className: "card", style: { padding: ".7rem" } },
          React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("span", null, tmpl.emoji, " ", tmpl[lang] || tmpl.en),
            React.createElement("div", { className: "flex gap-1 items-center" },
              volKeys.length > 0 && React.createElement("span", { className: "badge " + (full ? "badge-green" : "badge-coral") }, volKeys.length + "/3"),
              !isJoined && !full
                ? React.createElement("button", { className: "btn btn-green btn-sm", onClick: function() { joinTask(tmpl.key); } }, t.taskJoin || "Mă ocup eu")
                : isJoined
                ? React.createElement("button", { className: "btn btn-sm", style: { background: "var(--red)", color: "#fff" }, onClick: function() { leaveTask(tmpl.key); } }, t.taskLeave || "Înscris — Renunță")
                : null
            )
          ),
          full && React.createElement("p", { className: "text-xs mt-1", style: { color: "var(--green)" } }, "✅ ", t.taskReady || "Echipă completă — organizați-vă pe forum!"),
          volNames.length > 0 && React.createElement("div", { className: "text-xs mt-1", style: { color: "var(--textSec)" } }, volNames.join(", "))
        );
      })
    )
  );
}
