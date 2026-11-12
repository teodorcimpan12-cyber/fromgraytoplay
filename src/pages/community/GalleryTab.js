import { COURTS, db, useApp } from "../../app/core.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { compressImage } from "../../lib/compress-image.js";
import { courtStatusView } from "../../lib/court-status-view.js";
import { logActivity } from "../../lib/log-activity.js";
import { anonName } from "../../lib/next-lang.js";
import { useRef, useState } from "../../lib/react.js";

export function GalleryTab() {
  const {
    t,
    lang,
    toast,
    user
  } = useApp();
  const gallery = useFirebase("gallery");
  const [court, setCourt] = useState(COURTS[0].id);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const imgs = gallery ? Object.entries(gallery).map(([id, g]) => ({
    id,
    ...g
  })).reverse() : [];
  const onFile = async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const data = await compressImage(file, 900, 0.7);
      setPreview(data);
    } catch (err) {
      toast(t.error);
    }
  };
  const upload = () => {
    if (!preview) {
      toast(t.needPhoto);
      return;
    }
    setBusy(true);
    const c = COURTS.find(x => x.id === court) || COURTS[0];
    db.ref("gallery").push({
      courtId: court,
      neighbourhood: c.neighbourhood,
      status: c.status,
      caption: caption.trim(),
      img: preview,
      author: anonName(user?.name || "Anonim"),
      votes: 0,
      timestamp: Date.now()
    }).then(() => {
      logActivity("photo", user?.name || "Anonim", court);
      toast(t.photoAdded);
      setPreview(null);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      setBusy(false);
    }).catch(() => {
      toast(t.error);
      setBusy(false);
    });
  };
  const statusCls = s => s === "satellite" ? "badge-teal" : s === "unverified" ? "badge-gray" : s === "degraded" ? "badge-red" : s === "inProgress" ? "badge-coral" : "badge-green";
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card mb-2",
    style: { borderLeftColor: "var(--green)" }
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold mb-1"
  }, "📸 ", t.addPhoto), /*#__PURE__*/React.createElement("label", {
    htmlFor: "g2p-photo",
    className: "flex flex-col items-center",
    style: { border: "2px dashed var(--border)", borderRadius: 10, padding: "1rem", cursor: "pointer", textAlign: "center" }
  }, /*#__PURE__*/React.createElement("div", {
    style: { fontSize: "1.6rem" }
  }, "📷"), /*#__PURE__*/React.createElement("div", {
    className: "text-sm",
    style: { color: "var(--textSec)" }
  }, t.choosePhoto)), /*#__PURE__*/React.createElement("input", {
    id: "g2p-photo",
    ref: fileRef,
    type: "file",
    accept: "image/*",
    capture: "environment",
    onChange: onFile,
    style: { display: "none" }
  }), preview && /*#__PURE__*/React.createElement("img", {
    src: preview,
    alt: "preview",
    style: { width: "100%", height: 160, objectFit: "cover", borderRadius: 8, marginTop: ".6rem" }
  }), /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold",
    style: { color: "var(--textSec)", display: "block", marginTop: ".6rem" }
  }, t.photoCourt), /*#__PURE__*/React.createElement("select", {
    value: court,
    onChange: e => setCourt(e.target.value),
    className: "mb-1"
  }, COURTS.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name))), /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold",
    style: { color: "var(--textSec)", display: "block" }
  }, t.photoCaption), /*#__PURE__*/React.createElement("textarea", {
    value: caption,
    onChange: e => setCaption(e.target.value),
    rows: 2,
    className: "mb-1",
    placeholder: t.photoCaptionPh
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green btn-block",
    onClick: upload,
    disabled: busy || !preview
  }, busy ? "…" : "＋ " + t.addToWall)), !imgs.length ? /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: { textAlign: "center", padding: "2rem" }
  }, /*#__PURE__*/React.createElement("div", {
    style: { fontSize: "2rem" }
  }, "📸"), /*#__PURE__*/React.createElement("p", {
    style: { color: "var(--textSec)" }
  }, lang === "en" ? "No photos yet. Show what your court looks like today, with the form above." : lang === "hu" ? "Még nincs fotó. Mutasd meg a fenti űrlappal, hogy néz ki ma a pályád." : "Nicio poză încă. Arată-ne cum arată azi terenul tău, din formularul de mai sus.")) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-3"
  }, imgs.map(im => {
    const c = COURTS.find(x => x.id === im.courtId);
    const nb = im.neighbourhood || (c && c.neighbourhood);
    const st = im.status || (c && c.status);
    const sv = !im.status && c ? courtStatusView(c, t) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: im.id,
      className: "card",
      style: { padding: ".6rem" }
    }, im.img ? /*#__PURE__*/React.createElement("img", {
      src: im.img,
      alt: "evidence",
      style: { width: "100%", height: 150, objectFit: "cover", borderRadius: 8, display: "block" }
    }) : /*#__PURE__*/React.createElement("div", {
      style: { background: "var(--border)", height: 150, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }
    }, "📷"), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-1 mt-1",
      style: { flexWrap: "wrap" }
    }, nb && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-teal"
    }, nb), st && /*#__PURE__*/React.createElement("span", {
      className: "badge " + (sv ? sv.badge : statusCls(st))
    }, sv ? sv.label : (t[st] || st))), c && /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-sm mt-1"
    }, c.name), im.caption && /*#__PURE__*/React.createElement("div", {
      className: "text-xs",
      style: { color: "var(--textSec)" }
    }, im.caption), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mt-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs",
      style: { color: "var(--textSec)" }
    }, anonName(im.author || "Anonim")), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm btn-outline",
      onClick: () => {
        db.ref(`gallery/${im.id}/votes`).transaction(v => (v || 0) + 1);
        toast("+1!");
      }
    }, "❤️ ", im.votes || 0)));
  })));
}
