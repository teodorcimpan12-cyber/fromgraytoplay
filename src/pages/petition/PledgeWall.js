import { db, useApp } from "../../app/core.js";
import { Reveal } from "../../components/Reveal.js";
import { PLEDGE_EMOJIS } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useState } from "../../lib/react.js";

export function PledgeWall() {
  var appCtx = useApp();
  var t = appCtx.t, lang = appCtx.lang, toast = appCtx.toast;
  var nameState = useState("");
  var name = nameState[0], setName = nameState[1];
  var pledgeState = useState("");
  var pledge = pledgeState[0], setPledge = pledgeState[1];
  var emojiState = useState("✊");
  var emoji = emojiState[0], setEmoji = emojiState[1];
  var raw = useFirebase("pledges");
  var items = raw ? Object.entries(raw).map(function(e){return Object.assign({id:e[0]},e[1]);}).sort(function(a,b){return b.ts-a.ts;}).slice(0,60) : [];

  var submit = function() {
    if (!name.trim() || !pledge.trim()) { toast(lang==="ro"?"Completează toate câmpurile":"Fill all fields"); return; }
    db.ref("pledges").push({ name:name.trim().slice(0,30), pledge:pledge.trim().slice(0,80), emoji:emoji, ts:Date.now() });
    toast("✊ " + (lang==="ro"?"Promisiunea ta a fost adăugată!":lang==="hu"?"Ígéreted hozzáadva!":"Your pledge was added!"));
    setName(""); setPledge(""); setEmoji("✊");
  };

  return React.createElement(Reveal, { as:"section", className:"section" },
    React.createElement("div", { className:"container" },
      React.createElement("div", { className:"flex items-center gap-2 mb-1" },
        React.createElement("span", { style:{fontSize:"1.4rem"} }, "✊"),
        React.createElement("h2", { className:"section-title" }, t.pledgeWall || "Zidul schimbării")
      ),
      React.createElement("p", { className:"text-sm mb-3", style:{color:"var(--textSec)"} },
        lang==="ro"?"Fiecare promisiune contează. Lasă-ți amprenta pe zidul schimbării.":lang==="hu"?"Minden ígéret számít. Hagyd el a nyomad.":"Every pledge counts. Leave your mark on the wall of change."
      ),
      React.createElement("div", { className:"card mb-2", style:{maxWidth:480} },
        React.createElement("h4", { className:"mb-2", style:{fontSize:".88rem"} }, t.pledgeYours || "Lasă-ți amprenta"),
        React.createElement("div", { className:"flex gap-1 mb-1", style:{flexWrap:"wrap"} },
          PLEDGE_EMOJIS.map(function(e) { return React.createElement("button", {
            key:e, onClick:function(){setEmoji(e);},
            style:{
              width:36,height:36,border:"1.5px solid",borderRadius:8,
              borderColor:emoji===e?"var(--green)":"var(--border)",
              background:emoji===e?"rgba(16,185,129,.15)":"none",
              fontSize:"1.2rem",cursor:"pointer",transition:"all .15s"
            }
          }, e); })
        ),
        React.createElement("input", { placeholder:lang==="ro"?"Numele tău":lang==="hu"?"A neved":"Your name", value:name, onChange:function(e){setName(e.target.value);}, className:"mb-1", maxLength:30 }),
        React.createElement("textarea", { placeholder:t.pledgePlaceholder||"Promit că voi...", value:pledge, onChange:function(e){setPledge(e.target.value);}, rows:2, className:"mb-1", maxLength:80, style:{resize:"none"} }),
        React.createElement("div", { className:"flex justify-between items-center" },
          React.createElement("span", { style:{fontSize:".7rem",color:"var(--textSec)"} }, pledge.length + "/80"),
          React.createElement("button", { className:"btn btn-green btn-sm", onClick:submit }, t.pledgeAdd || "Adaugă promisiunea")
        )
      ),
      items.length === 0
        ? React.createElement("p", { className:"text-sm", style:{color:"var(--textSec)",textAlign:"center",padding:"2rem 0"} }, t.pledgeEmpty||"Fii primul!")
        : React.createElement("div", { className:"pledge-grid" },
            items.map(function(p, i) { return React.createElement("div", { key:p.id, className:"pledge-tile" + (i<3?" pledge-tile-new":"") },
              React.createElement("span", { className:"pt-emoji" }, p.emoji||"✊"),
              React.createElement("div", { className:"pt-name" }, p.name),
              React.createElement("div", { className:"pt-text" }, p.pledge)
            ); })
          )
    )
  );
}
