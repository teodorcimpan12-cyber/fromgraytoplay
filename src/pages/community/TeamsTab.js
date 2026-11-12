import { db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useState } from "../../lib/react.js";

export function TeamsTab() {
  const {
    t,
    lang,
    toast
  } = useApp();
  const teams = useFirebase("teams");
  const [show, setShow] = useState(false);
  const [tn, setTn] = useState("");
  const [th, setTh] = useState("tudor");
  const create = () => {
    if (!tn) return;
    db.ref("teams").push({
      name: tn,
      neighbourhood: th,
      members: [],
      wins: 0,
      losses: 0
    });
    toast(t.success);
    setShow(false);
    setTn("");
  };
  const list = teams ? Object.entries(teams).map(([id, tm]) => ({
    id,
    ...tm
  })) : [];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-2"
  }, /*#__PURE__*/React.createElement("h3", null, "\u26BD ", t.teams), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-sm",
    onClick: () => setShow(!show)
  }, "+ ", lang === "ro" ? "Creează echipă" : "Create team")), show && /*#__PURE__*/React.createElement("div", {
    className: "card mb-2"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: lang === "ro" ? "Numele echipei" : "Team name",
    value: tn,
    onChange: e => setTn(e.target.value),
    className: "mb-1"
  }), /*#__PURE__*/React.createElement("select", {
    value: th,
    onChange: e => setTh(e.target.value),
    className: "mb-1"
  }, /*#__PURE__*/React.createElement("option", {
    value: "tudor"
  }, t.tudor), /*#__PURE__*/React.createElement("option", {
    value: "auchan"
  }, t.auchan), /*#__PURE__*/React.createElement("option", {
    value: "mureseni"
  }, t.mureseni), /*#__PURE__*/React.createElement("option", {
    value: "center"
  }, t.center), /*#__PURE__*/React.createElement("option", {
    value: "pandurilor"
  }, t.pandurilor), /*#__PURE__*/React.createElement("option", {
    value: "libertate"
  }, t.libertate), /*#__PURE__*/React.createElement("option", {
    value: "unirii"
  }, t.unirii)), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-sm",
    onClick: create
  }, t.submit)), list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      textAlign: "center",
      padding: "2rem"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--textSec)"
    }
  }, lang === "en" ? "No teams yet. Your neighbourhood can be the first." : lang === "hu" ? "Még nincs csapat. A te környéked lehet az első." : "Nicio echipă încă. Cartierul tău poate fi primul."), !show && React.createElement("button", { className: "btn btn-green mt-1", onClick: () => setShow(true) }, "⚽ " + (lang === "en" ? "Start the first team" : lang === "hu" ? "Alapítsd meg az első csapatot" : "Fă prima echipă"))) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-3"
  }, list.map(tm => /*#__PURE__*/React.createElement("div", {
    key: tm.id,
    className: "card card-accent"
  }, /*#__PURE__*/React.createElement("h4", null, tm.name), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-teal"
  }, tm.neighbourhood), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1"
  }, "\uD83D\uDC65 ", tm.members?.length || 0)))));
}
