import { db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { useState } from "../../lib/react.js";

/* === Booking Modal === */
export function BookingModal({
  court,
  onClose
}) {
  const {
    t,
    lang,
    toast,
    user
  } = useApp();
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [hour, setHour] = useState("");
  const bk = useFirebase(date ? "bookings/" + court.id + "/" + date : null);
  const taken = bk ? Object.keys(bk).map(k => k.replace("-", ":")) : [];
  const hours = Array.from({
    length: 12
  }, (_, i) => `${8 + i}:00`);
  const book = () => {
    if (!hour) return;
    db.ref(`bookings/${court.id}/${date}/${hour.replace(":", "-")}`).set({
      name: user?.name || "Guest",
      uid: user?.id || "g" + Date.now(),
      hour,
      ts: Date.now()
    });
    toast(t.success);
    setHour("");
  };
  const cancel = h => {
    db.ref(`bookings/${court.id}/${date}/${h.replace(":", "-")}`).remove();
    toast(lang === "ro" ? "Anulat" : "Cancelled");
  };
  const myUid = user?.id || "";
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-lg",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-2"
  }, /*#__PURE__*/React.createElement("h2", null, t.bookCourt, ": ", court.name), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      fontSize: "1.4rem",
      color: "var(--text)"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value),
    min: new Date().toISOString().split("T")[0],
    className: "mb-2"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))",
      gap: ".35rem",
      marginBottom: "1rem"
    }
  }, hours.map(h => {
    const booked = taken.includes(h);
    const bd = booked && bk ? bk[h.replace(":", "-")] : null;
    const mine = bd && bd.uid === myUid;
    return /*#__PURE__*/React.createElement("div", {
      key: h,
      onClick: () => {
        if (!booked) setHour(h);
      },
      style: {
        padding: ".4rem",
        borderRadius: 8,
        textAlign: "center",
        cursor: booked ? "default" : "pointer",
        border: hour === h ? "2px solid var(--green)" : "2px solid var(--border)",
        background: booked ? mine ? "rgba(16,185,129,.08)" : "rgba(220,38,38,.05)" : hour === h ? "rgba(16,185,129,.06)" : "var(--bgCard)",
        opacity: booked && !mine ? .55 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Space Mono',monospace",
        fontWeight: 700,
        fontSize: ".85rem",
        color: booked ? "var(--red)" : "var(--text)"
      }
    }, h), booked ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-xs",
      style: {
        color: "var(--textSec)"
      }
    }, bd?.name || "Booked"), mine && /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        cancel(h);
      },
      className: "text-xs",
      style: {
        color: "var(--red)",
        background: "none",
        border: "none",
        cursor: "pointer",
        textDecoration: "underline"
      }
    }, t.cancel)) : /*#__PURE__*/React.createElement("div", {
      className: "text-xs",
      style: {
        color: "var(--green)"
      }
    }, lang === "ro" ? "Liber" : "Free"));
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-block",
    disabled: !hour,
    onClick: book,
    style: {
      opacity: hour ? 1 : .5,
      cursor: hour ? "pointer" : "not-allowed"
    }
  }, hour ? `📅 ${t.bookCourt} ${hour}` : lang === "ro" ? "Selectează o oră" : "Select an hour"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline",
    onClick: onClose
  }, t.cancel))));
}
