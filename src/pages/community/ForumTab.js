import { COURTS, db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { anonName, hoodName } from "../../lib/next-lang.js";
import { useState } from "../../lib/react.js";
import { ForumWelcome } from "./ForumWelcome.js";

export function ForumTab() {
  const {
    t,
    lang,
    toast,
    user
  } = useApp();
  const posts = useFirebase("forum");
  const [showNew, setShowNew] = useState(false);
  const [f, setF] = useState({
    title: "",
    body: "",
    category: "general",
    type: "discussion"
  });
  const [replyTo, setReplyTo] = useState(null);
  const [rt, setRt] = useState("");
  const [hoodFilter, setHoodFilter] = useState("all");
  const list = posts ? Object.entries(posts).map(([id, p]) => ({
    id,
    ...p
  })).filter(p => hoodFilter === "all" || p.category === hoodFilter).reverse() : [];
  const submit = () => {
    if (!f.title || !f.body) {
      toast(t.error);
      return;
    }
    db.ref("forum").push({
      ...f,
      neighbourhood: f.category,
      author: anonName(user?.name || "Anonim"),
      date: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      pinned: false,
      replies: {}
    });
    toast(t.success);
    setShowNew(false);
    setF({
      title: "",
      body: "",
      category: "general",
      type: "discussion"
    });
  };
  const vote = (id, d) => {
    db.ref(`forum/${id}/${d}`).transaction(v => (v || 0) + 1);
  };
  const addReply = pid => {
    if (!rt) return;
    db.ref(`forum/${pid}/replies`).push({
      author: anonName(user?.name || "Anonim"),
      body: rt,
      date: new Date().toISOString()
    });
    setReplyTo(null);
    setRt("");
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: hoodFilter,
    onChange: e => setHoodFilter(e.target.value),
    style: {
      width: "auto",
      padding: ".3rem",
      fontSize: ".82rem"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, t.allStatus), [...new Set(COURTS.map(c => c.neighbourhood))].map(h => React.createElement("option", {
    key: h,
    value: h
  }, hoodName(h, lang)))),/*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-sm",
    onClick: () => setShowNew(true)
  }, "+ ", t.newPost)), showNew && /*#__PURE__*/React.createElement("div", {
    className: "card mb-2"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: lang === "en" ? "Title" : lang === "hu" ? "Cím" : "Titlu",
    value: f.title,
    onChange: e => setF({
      ...f,
      title: e.target.value
    }),
    className: "mb-1"
  }), /*#__PURE__*/React.createElement("textarea", {
    placeholder: lang === "en" ? "What is it about?" : lang === "hu" ? "Miről szól?" : "Despre ce e vorba?",
    value: f.body,
    onChange: e => setF({
      ...f,
      body: e.target.value
    }),
    rows: 3,
    className: "mb-1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1 mb-1"
  }, /*#__PURE__*/React.createElement("select", {
    value: f.type,
    onChange: e => setF({
      ...f,
      type: e.target.value
    }),
    style: {
      width: "auto"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "discussion"
  }, "Discussion"), /*#__PURE__*/React.createElement("option", {
    value: "proposal"
  }, "Proposal"), /*#__PURE__*/React.createElement("option", {
    value: "volunteerCall"
  }, "Volunteer Call")), /*#__PURE__*/React.createElement("select", {
    value: f.category,
    onChange: e => setF({
      ...f,
      category: e.target.value
    }),
    style: {
      width: "auto"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "general"
  }, t.general), [...new Set(COURTS.map(c => c.neighbourhood))].map(h => React.createElement("option", {
    key: h,
    value: h
  }, hoodName(h, lang))))),/*#__PURE__*/React.createElement("div", {
    className: "flex gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-sm",
    onClick: submit
  }, t.submit), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline btn-sm",
    onClick: () => setShowNew(false)
  }, t.cancel))), React.createElement(ForumWelcome, null), list.length === 0 && !showNew && React.createElement("div", { className: "card cm-emptycard" },
    React.createElement("div", { style: { fontSize: "2rem" } }, "💬"),
    React.createElement("p", null, lang === "en" ? "No threads yet. Yours can be the first." : lang === "hu" ? "Még nincs téma. A tiéd lehet az első." : "Nicio discuție încă. A ta poate fi prima."),
    React.createElement("button", { className: "btn btn-green", onClick: () => setShowNew(true) }, "+ " + t.newPost)), list.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "card mb-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: `badge ${p.type === "proposal" ? "badge-green" : "badge-teal"}`
  }, p.type), /*#__PURE__*/React.createElement("span", {
    className: "text-xs",
    style: {
      color: "var(--textSec)"
    }
  }, p.date ? new Date(p.date).toLocaleDateString() : "")), /*#__PURE__*/React.createElement("h4", {
    className: "mt-1"
  }, p.pinned ? "📌 " : "", p.title), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1"
  }, p.body), /*#__PURE__*/React.createElement("p", {
    className: "text-xs",
    style: {
      color: "var(--textSec)"
    }
  }, "\u2014 ", anonName(p.author)), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1 mt-1"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-outline",
    onClick: () => vote(p.id, "upvotes")
  }, t.upvote, " ", p.upvotes || 0), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-outline",
    onClick: () => vote(p.id, "downvotes")
  }, t.downvote, " ", p.downvotes || 0), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-outline",
    onClick: () => setReplyTo(replyTo === p.id ? null : p.id)
  }, "\uD83D\uDCAC")), p.replies && Object.entries(p.replies).map(([rid, r]) => /*#__PURE__*/React.createElement("div", {
    key: rid,
    style: {
      marginLeft: "1.2rem",
      borderLeft: "2px solid var(--border)",
      paddingLeft: ".8rem",
      marginTop: ".4rem"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm"
  }, r.body), /*#__PURE__*/React.createElement("p", {
    className: "text-xs",
    style: {
      color: "var(--textSec)"
    }
  }, "\u2014 ", anonName(r.author)))), replyTo === p.id && /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1 mt-1"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: t.reply + "...",
    value: rt,
    onChange: e => setRt(e.target.value),
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-sm",
    onClick: () => addReply(p.id)
  }, t.submit)))));
}
