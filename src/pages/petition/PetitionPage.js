import { MoreSection } from "../../components/MoreSection.js";
import { ACTIVE_CITY, db, useApp } from "../../app/core.js";
import { BadgeUnlockModal } from "../../components/BadgeUnlockModal.js";
import { InequalityReceipt } from "../../components/InequalityReceipt.js";
import { PrivacyPolicyModal } from "../../components/PrivacyPolicyModal.js";
import { CONFETTI_COLS, MILESTONES, SITE } from "../../data/constants.js";
import { useBadges } from "../../hooks/useBadges.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { cityName } from "../../lib/city-name.js";
import { fxReduced } from "../../lib/fx-reduced.js";
import { g2pCelebrate } from "../../lib/g2p-celebrate.js";
import { logActivity } from "../../lib/log-activity.js";
import { useEffect, useState } from "../../lib/react.js";
import { CivicMomentum } from "./CivicMomentum.js";
import { LetterModal } from "./LetterModal.js";
import { PetitionAccountStep } from "./PetitionAccountStep.js";
import { PetitionMilestoneBar } from "./PetitionMilestoneBar.js";
import { PetitionShare } from "./PetitionShare.js";
import { PetitionSteps } from "./PetitionSteps.js";
import { PledgeWall } from "./PledgeWall.js";
import { ShareCardCanvas } from "./ShareCardCanvas.js";

/* === S4-F3: Letter Counter ===
   Reads letterCount/total — shown on PetitionPage. */
export function LetterCounter() {
  var _ref = useApp(), t = _ref.t;
  var cnt = useFirebase("letterCount/total") || 0;
  return React.createElement("div", { className: "card mb-2", style: { textAlign: "center", padding: "1.2rem", borderLeft: "4px solid var(--teal)" } },
    React.createElement("div", { className: "stat-number", style: { color: "var(--teal)" } }, cnt),
    React.createElement("div", { className: "stat-label" }, t.lettersSent || "letters generated to the council")
  );
}
export function MilestoneConfetti({ onDone }) {
  var pieces = [];
  for (var _i = 0; _i < 90; _i++) {
    pieces.push({
      id: _i,
      left: Math.random() * 100,
      delay: (Math.random() * 1.8).toFixed(2),
      dur: (2.2 + Math.random() * 2.2).toFixed(2),
      color: CONFETTI_COLS[_i % CONFETTI_COLS.length],
      size: 7 + Math.floor(Math.random() * 9),
      radius: Math.random() > 0.55 ? "50%" : "2px",
      rot: Math.floor(Math.random() * 360)
    });
  }
  useEffect(function() {
    var _t = setTimeout(onDone, 4200);
    return function() { clearTimeout(_t); };
  }, []);
  return React.createElement("div", { className: "confetti-overlay" },
    pieces.map(function(p) {
      return React.createElement("div", {
        key: p.id,
        className: "confetti-dot",
        style: {
          left: p.left + "%",
          top: -30,
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: p.radius,
          animationDelay: p.delay + "s",
          animationDuration: p.dur + "s",
          transform: "rotate(" + p.rot + "deg)"
        }
      });
    })
  );
}
export function PetitionPage() {
  const {
    t,
    lang,
    toast,
    user,
    firebaseUser,
    authReady,
    openAuth
  } = useApp();
  const votes = useFirebase("votes");
  const [noAcct, setNoAcct] = useState(false);
  const [shared, setShared] = useState(() => !!localStorage.getItem("g2p_shared"));
  const [ch, setCh] = useState("");
  const [voted, setVoted] = useState(() => !!localStorage.getItem("g2p_voted"));
  const [hoopDone, setHoopDone] = useState(() => !!localStorage.getItem("g2p_hoop"));
  const hoopFinish = () => {
    localStorage.setItem("g2p_hoop", "1");
    setHoopDone(true);
    setTimeout(() => {
      const el = document.getElementById("g2p-vote-form");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  // Fill name + email from the account as soon as the person signs in.
  useEffect(() => {
    if (!user) return;
    if (!name && user.name) setName(user.name);
    if (!email && user.email && user.email.indexOf("@") > 0) setEmail(user.email);
  }, [user && user.id]);
  const [vol, setVol] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [celebrateMilestone, setCelebrateMilestone] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [unlockBadge, setUnlockBadge] = useState(null);
  const { awardBadge } = useBadges();
  const flip = votes?.flip || 0,
    mural = votes?.mural || 0,
    both = votes?.both || 0,
    total = flip + mural + both,
    mx = Math.max(flip, mural, both, 1);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const ok = name.trim().length >= 2 && emailOk && ch !== "" && consent;
  const doVote = () => {
    if (!ok) return;
    const key = ch;
    db.ref("votes/" + key).transaction(v => (v || 0) + 1);
    const signupDate = new Date().toISOString();
    const signupRef = db.ref("signups").push();
    signupRef.set({
      name: name.trim(),
      email: email.trim(),
      choice: key,
      volunteer: vol,
      city: ACTIVE_CITY,
      date: signupDate
    });
    db.ref("signupStats/" + signupRef.key).set({ volunteer: vol, city: ACTIVE_CITY, date: signupDate });
    logActivity("petition", name);
    const lbKey = user?.id || name.trim().replace(/[.#$/\[\]]/g, '_');
    db.ref("leaderboard/" + lbKey).transaction(v => ({
      ...(v || {}),
      points: (v?.points || 0) + 10,
      name: name.trim()
    }));
    setVoted(true);
    localStorage.setItem("g2p_voted", "1");
    // The big 3D celebration plays first; badges pop after it so they do not stack on top.
    const celebrating = !fxReduced();
    if (celebrating) g2pCelebrate("petition"); else setShowConfetti(true);
    const later = fn => setTimeout(fn, celebrating ? 3300 : 0);
    awardBadge("vocal", function(b) { later(() => setUnlockBadge(b)); });
    awardBadge("voter", function(b) { later(() => setUnlockBadge(b)); });
    toast(t.success + " +10 " + t.points);
  };
  useEffect(function() {
    if (!total) return;
    var seen = localStorage.getItem("g2p_ms_seen");
    // First visit: remember where the count is, no confetti for milestones reached before this visitor came.
    if (seen === null) { var past = MILESTONES.filter(function(m) { return m <= total; }); localStorage.setItem("g2p_ms_seen", String(past.length ? Math.max.apply(null, past) : 0)); return; }
    var lastSeen = parseInt(seen || "0");
    var achieved = MILESTONES.filter(function(m) { return m <= total && m > lastSeen; });
    if (achieved.length > 0) {
      var highest = Math.max.apply(null, achieved);
      setCelebrateMilestone(highest);
      setShowConfetti(true);
      localStorage.setItem("g2p_ms_seen", String(highest));
    }
  }, [total]);
  const url = SITE + "/";
  const st = lang === "ro" ? `Am votat pe From Grey to Play! ${total} voturi.` : `I voted on From Grey to Play! ${total} votes.`;
  const opts = [{
    k: "flip",
    emoji: "🏀",
    sel: "sel-flip"
  }, {
    k: "mural",
    emoji: "🎨",
    sel: "sel-mural"
  }, {
    k: "both",
    emoji: "✨",
    sel: "sel-both"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-in"
  }, /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "section-title",
    style: {
      textAlign: "center"
    }
  }, t.voteTitle), /*#__PURE__*/React.createElement("p", {
    className: "section-sub",
    style: {
      textAlign: "center"
    }
  }, lang === "ro" ? "Alege viziunea ta pentru terenurile din " + cityName(lang) : "Choose your vision for " + cityName(lang) + " courts"), React.createElement(PetitionMilestoneBar, { total: total }),
  React.createElement(PetitionSteps, { step: voted ? (shared ? 5 : 4) : (firebaseUser || noAcct) ? (name.trim().length >= 2 && emailOk ? 3 : 2) : 1 }),
  !voted && authReady && !firebaseUser && !noAcct && React.createElement(PetitionAccountStep, { onSignup: () => openAuth("signup"), onLogin: () => openAuth(), onSkip: () => setNoAcct(true) }),
  voted && React.createElement(PetitionShare, { total: total, onShared: () => { setShared(true); try { localStorage.setItem("g2p_shared", "1"); } catch (e) {} } }),
  !voted && !(firebaseUser || noAcct) ? null : !voted ? /*#__PURE__*/React.createElement("div", {
    id: "g2p-vote-form",
    style: {
      maxWidth: 600,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: ".7rem"
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold",
    style: {
      color: "var(--textSec)"
    }
  }, lang === "ro" ? "NUMELE TĂU" : "YOUR NAME", " *"), /*#__PURE__*/React.createElement("input", {
    placeholder: lang === "ro" ? "ex: Popescu Ion" : "e.g. John Smith",
    value: name,
    onChange: e => setName(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: ".7rem"
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold",
    style: {
      color: "var(--textSec)"
    }
  }, t.email, " *"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    placeholder: "email@example.com",
    value: email,
    onChange: e => setEmail(e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold",
    style: {
      color: "var(--textSec)",
      display: "block",
      marginBottom: ".4rem"
    }
  }, lang === "ro" ? "ALEGE PROPUNEREA" : "CHOOSE PROPOSAL", " *"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-3",
    style: {
      marginBottom: ".8rem"
    }
  }, opts.map(o => /*#__PURE__*/React.createElement("div", {
    key: o.k,
    className: `petition-option ${ch === o.k ? o.sel : ""}`,
    onClick: () => setCh(o.k)
  }, /*#__PURE__*/React.createElement("div", {
    className: "po-radio"
  }, /*#__PURE__*/React.createElement("span", {
    className: "po-radio-dot"
  })), /*#__PURE__*/React.createElement("div", {
    className: "po-emoji"
  }, o.emoji), /*#__PURE__*/React.createElement("div", {
    className: "po-label"
  }, o.k === "flip" ? t.flipCourt : o.k === "mural" ? t.streetCanvas : lang === "ro" ? "Ambele" : "Both"), /*#__PURE__*/React.createElement("div", {
    className: "po-desc"
  }, o.k === "flip" ? lang === "ro" ? "Renovare 3 terenuri + dulap echipament" : "Resurface 3 courts + equipment cabinet" : o.k === "mural" ? lang === "ro" ? "Murale colorate cu artiștii locali" : "Colourful murals with local artists" : lang === "ro" ? "Ambele proiecte combinate" : "Both projects combined")))), /*#__PURE__*/React.createElement("div", {
    className: `vol-check ${vol ? "on" : ""}`,
    onClick: () => setVol(!vol),
    style: {
      marginBottom: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "vol-box"
  }, vol && "✓"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: ".88rem"
    }
  }, "\uD83E\uDD1D ", lang === "ro" ? "Vreau să fiu voluntar" : "I want to volunteer"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: "var(--textSec)"
    }
  }, lang === "ro" ? "Participă la evenimente" : "Join events and earn points"))),
  React.createElement("div", {
    style: { display: "flex", alignItems: "flex-start", gap: ".6rem", marginBottom: "1rem", padding: ".7rem", background: "var(--bgCard)", borderRadius: 8, border: "1px solid var(--border)" }
  },
    React.createElement("input", {
      type: "checkbox", id: "g2p-consent", checked: consent,
      onChange: function(e) { setConsent(e.target.checked); },
      style: { marginTop: ".15rem", accentColor: "var(--green)", width: 16, height: 16, flexShrink: 0, cursor: "pointer" }
    }),
    React.createElement("label", { htmlFor: "g2p-consent", className: "text-xs", style: { color: "var(--textSec)", cursor: "pointer", lineHeight: 1.5 } },
      t.gdprConsent || "Sunt de acord cu prelucrarea datelor personale.",
      " ",
      React.createElement("a", {
        href: "#",
        onClick: function(e) { e.preventDefault(); setShowPrivacy(true); },
        style: { color: "var(--green)", fontWeight: 600 }
      }, t.privacyPolicy || "Politică de Confidențialitate"),
      " *"
    )
  ),
  /*#__PURE__*/React.createElement("button", {
    className: "pet-submit",
    disabled: !ok,
    onClick: doVote
  }, ok ? lang === "ro" ? "Semnează petiția" : "Sign the petition" : lang === "ro" ? "Completează toate câmpurile + acceptă RGPD" : "Fill all fields + accept privacy policy"),
  showPrivacy && React.createElement(PrivacyPolicyModal, { onClose: function() { setShowPrivacy(false); } })) : /*#__PURE__*/React.createElement("div", {
    className: "card mt-2",
    style: {
      textAlign: "center",
      background: "rgba(16,185,129,.07)",
      padding: "2rem",
      maxWidth: 550,
      margin: "1rem auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "2.5rem",
      marginBottom: ".3rem"
    }
  }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "1.2rem",
      fontWeight: 700,
      color: "var(--green)"
    }
  }, lang === "ro" ? "Mulțumim!" : "Thank you!"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm",
    style: {
      color: "var(--textSec)"
    }
  }, lang === "ro" ? "Votul tău a fost înregistrat." : "Your vote has been recorded.")), /*#__PURE__*/React.createElement("div", {
    className: "card mt-3"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "mb-2"
  }, t.liveResults), [{
    l: "🏀 " + t.flipCourt,
    v: flip,
    c: "var(--green)"
  }, {
    l: "🎨 " + t.streetCanvas,
    v: mural,
    c: "var(--coral)"
  }, {
    l: "✨ " + t.both,
    v: both,
    c: "var(--teal)"
  }].map(r => /*#__PURE__*/React.createElement("div", {
    key: r.l,
    style: {
      marginBottom: ".7rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-sm mb-1"
  }, /*#__PURE__*/React.createElement("span", null, r.l), /*#__PURE__*/React.createElement("span", {
    className: "font-bold",
    style: {
      color: r.c
    }
  }, r.v)), /*#__PURE__*/React.createElement("div", {
    className: "progress-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill",
    style: {
      width: r.v / mx * 100 + "%",
      background: r.c
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-number",
    style: {
      fontSize: "2.2rem"
    }
  }, total), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, t.totalVotes))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-coral",
    onClick: () => setShowLetter(true)
  }, "", t.generateLetter)), React.createElement(InequalityReceipt, null))),
    celebrateMilestone && React.createElement("div", { className: "milestone-cel" },
      React.createElement("div", { style: { fontSize: "3rem", marginBottom: ".4rem" } }, "\uD83C\uDF89"),
      React.createElement("div", { style: { fontFamily: "'Barlow Condensed',monospace", fontSize: "2.6rem", fontWeight: 800, color: "var(--green)" } }, celebrateMilestone),
      React.createElement("div", { style: { fontWeight: 700, fontSize: "1.05rem", margin: ".3rem 0" } },
        lang === "ro" ? "SEMNĂTURI ATINSE!" : lang === "hu" ? "ALÁÍRÁS ELÉRVE!" : "SIGNATURES REACHED!"
      ),
      React.createElement("p", { style: { color: "var(--textSec)", fontSize: ".85rem", marginBottom: ".8rem" } },
        lang === "ro" ? "Petiția a ajuns la " + celebrateMilestone + " de semnături. Mulțumim comunității!"
        : lang === "hu" ? "A petíció elérte a(z) " + celebrateMilestone + " aláírást!"
        : "The petition has reached " + celebrateMilestone + " signatures. Thank you, community!"
      ),
      React.createElement("button", { className: "btn btn-green", onClick: function() { setCelebrateMilestone(null); } },
        lang === "ro" ? "Continuă!" : "Continue!"
      )
    ),
    showConfetti && React.createElement(MilestoneConfetti, { onDone: function() { setShowConfetti(false); } }),
    showLetter && /*#__PURE__*/React.createElement(LetterModal, {
    onClose: () => setShowLetter(false),
    total: total
  }),
  unlockBadge && React.createElement(BadgeUnlockModal, { badge:unlockBadge, lang:lang, onClose:function(){setUnlockBadge(null);} }),
  React.createElement(MoreSection, { id: "petition" },
    React.createElement(ShareCardCanvas, { total: total }),
    React.createElement(CivicMomentum, null),
    React.createElement(LetterCounter, null),
    React.createElement(PledgeWall, null)));
}
