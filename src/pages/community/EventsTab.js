import { db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { ProposeGame } from "./ProposeGame.js";

export function EventsTab() {
  const {
    t,
    lang,
    toast
  } = useApp();
  const evts = useFirebase("events");
  const list = evts ? Object.entries(evts).map(([id, e]) => ({
    id,
    ...e
  })) : [];
  const rsvp = id => {
    db.ref(`events/${id}/attendeeCount`).transaction(v => (v || 0) + 1);
    toast(t.success);
  };
  const addCal = ev => {
    const s = new Date(ev.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${s}/${s}&details=${encodeURIComponent(ev.desc || '')}`, '_blank');
  };
  if (!list.length) return React.createElement(ProposeGame, null);
  return /*#__PURE__*/React.createElement("div", {
    className: "grid gap-1"
  }, list.map(ev => /*#__PURE__*/React.createElement("div", {
    key: ev.id,
    className: "card card-accent"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-green"
  }, ev.type), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-bold"
  }, ev.date)), /*#__PURE__*/React.createElement("h3", {
    className: "mt-1"
  }, ev.title), /*#__PURE__*/React.createElement("p", {
    className: "text-sm",
    style: {
      color: "var(--textSec)"
    }
  }, ev.desc), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1"
  }, "\uD83D\uDCCD ", ev.location, " \xB7 \uD83D\uDC65 ", ev.attendeeCount || 0), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1 mt-1"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-sm",
    onClick: () => rsvp(ev.id)
  }, "\u2713 ", t.rsvp), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline btn-sm",
    onClick: () => addCal(ev)
  }, "\uD83D\uDCC5 ", t.addToCalendar)))), React.createElement(ProposeGame, { more: true }));
}
