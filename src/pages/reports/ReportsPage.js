import { ACTIVE_CITY, COURTS, useApp } from "../../app/core.js";
import { MapView } from "../../components/MapView.js";
import { QuickReportFAB } from "../../components/QuickReportFAB.js";
import { RequestTracker } from "../../components/RequestTracker.js";
import { REPORT_CATS, REPORT_STAGES } from "../../data/constants.js";
import { useFirebase } from "../../hooks/useFirebase.js";
import { extraCourts } from "../../lib/court-status-view.js";
import { getVoterKey } from "../../lib/get-voter-key.js";
import { hoodName } from "../../lib/next-lang.js";
import { useEffect, useState } from "../../lib/react.js";
import { EvidenceWall } from "./EvidenceWall.js";
import { ReportCard } from "./ReportCard.js";
import { reportStage, waitText } from "./helpers.js";

export function openReport(courtId) { try { window.dispatchEvent(new CustomEvent("g2p:report", { detail: { courtId: courtId || "" } })); } catch (e) {} }
export function ReportsPage() {
  const { t, lang, firebaseUser } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [tab, setTab] = useState("all");
  const [stage, setStage] = useState(-1);
  const [cat, setCat] = useState("all");
  const [hood, setHood] = useState("all");
  const [court, setCourt] = useState(null);
  const [view, setView] = useState("list");
  const [wide, setWide] = useState(() => !!(window.matchMedia && window.matchMedia("(min-width:900px)").matches));
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(min-width:900px)"), h = () => setWide(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", h) : mq.addListener(h);
    return () => { mq.removeEventListener ? mq.removeEventListener("change", h) : mq.removeListener(h); };
  }, []);
  const fbReports = useFirebase("reports");
  const fbCourts = useFirebase("courts");
  const vk = getVoterKey();
  const base = fbReports
    ? Object.entries(fbReports).map(([id, r]) => ({ id, ...r })).filter(r => r && (r.city || "tgm") === ACTIVE_CITY)
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    : [];
  const issues = base.filter(r => r.category !== "condition");
  const counts = REPORT_STAGES.map((s, i) => issues.filter(r => reportStage(r) === i).length);
  const visible = base.filter(r => {
    if (tab === "mine" && r.voterKey !== vk && !(firebaseUser && r.uid === firebaseUser.uid)) return false;
    if (stage >= 0 && (r.category === "condition" || reportStage(r) !== stage)) return false;
    if (cat !== "all" && r.category !== cat) return false;
    if (hood !== "all" && r.neighborhood !== hood) return false;
    if (court && r.courtId !== court) return false;
    return true;
  });
  const allCourts = [...COURTS, ...extraCourts(fbCourts)];
  const courtIds = [...new Set(visible.map(r => r.courtId))].sort().join(",");
  const mapCourts = React.useMemo(() => allCourts.filter(c => courtIds.split(",").indexOf(c.id) >= 0), [courtIds, fbCourts]);
  const courtName = court && ((allCourts.find(c => c.id === court) || {}).name || court);
  const oldest = issues.filter(r => reportStage(r) < 3 && r.createdAt).map(r => new Date(r.createdAt).getTime()).sort((a, b) => a - b)[0];
  const hoods = [...new Set(COURTS.filter(c => (c.city || "tgm") === ACTIVE_CITY).map(c => c.neighbourhood).filter(Boolean))];
  const stageNames = [t.statusReceived, t.statusAnalyzing, t.statusPlanned, t.statusResolved];
  const stageHelp = [
    L3("a ajuns la noi", "reached us", "megérkezett hozzánk"),
    L3("echipa a verificat", "the team checked it", "a csapat megnézte"),
    L3("trimis oficial, cu nr. de înregistrare", "sent officially, with a reg. number", "hivatalosan elküldve, iktatószámmal"),
    L3("reparat pe teren", "fixed on the ground", "megjavítva a pályán")
  ];
  const pickCourt = id => { setCourt(id); if (!wide) setView("list"); };
  const e = React.createElement;
  const map = e("div", { className: "rp-map" },
    mapCourts.length
      ? e(MapView, { courts: mapCourts, height: wide ? "520px" : "420px", onSelect: c => pickCourt(c.id) })
      : e("div", { className: "rp-map-empty" }, "🗺️ " + L3("Pe hartă apar terenurile cu sesizări.", "Courts with reports show up on the map.", "A térképen a bejelentett pályák jelennek meg.")));
  const listEl = e("div", { className: "rp-list" },
    visible.length === 0
      ? e("div", { className: "card rp-empty" },
          e("div", { style: { fontSize: "2.4rem" } }, base.length ? "🔎" : "📣"),
          e("h3", null, base.length ? L3("Nimic pe filtrul ăsta.", "Nothing for this filter.", "Erre a szűrőre nincs semmi.") : t.noReports),
          e("p", null, base.length
            ? L3("Schimbă filtrele sau vezi toate sesizările.", "Change the filters or see every report.", "Módosítsd a szűrőket, vagy nézd meg az összeset.")
            : L3("Ai văzut un coș rupt, gropi sau lumini stinse? Spune-ne în 20 de secunde.", "Seen a broken hoop, potholes or dead lights? Tell us in 20 seconds.", "Láttál törött kosarat, kátyút vagy nem működő világítást? Mondd el 20 másodperc alatt.")),
          base.length
            ? e("button", { className: "btn btn-outline btn-sm", onClick: () => { setStage(-1); setCat("all"); setHood("all"); setCourt(null); setTab("all"); } }, L3("Arată tot", "Show all", "Mindet mutasd"))
            : e("button", { className: "btn btn-green", onClick: () => openReport() }, "＋ " + L3("Fă prima sesizare", "Make the first report", "Tedd meg az első bejelentést")))
      : visible.map(r => e(ReportCard, { key: r.id, r: r, now: now, onCourt: pickCourt })));
  return e("div", { className: "animate-in" },
    e("section", { className: "section" },
      e("div", { className: "container" },
        e("div", { className: "rp-top" },
          e("div", null,
            e("h2", { className: "section-title" }, t.reportPageTitle),
            e("p", { className: "section-sub" }, L3("Fiecare sesizare are un drum: o vezi pas cu pas, până la Primărie și înapoi.", "Every report has a path: follow it step by step, to City Hall and back.", "Minden bejelentésnek útja van: kövesd lépésről lépésre a Városházáig és vissza."))),
          e("button", { className: "btn btn-green", onClick: () => openReport() }, "＋ " + t.reportNew)),
        e("div", { className: "rp-pipe", role: "group", "aria-label": L3("Drumul unei sesizări", "A report's path", "Egy bejelentés útja") },
          stageNames.map((n, i) => e("button", { key: i, className: "rp-stage s" + i + (stage === i ? " on" : ""), "aria-pressed": stage === i, onClick: () => setStage(stage === i ? -1 : i) },
            e("b", null, counts[i]), e("span", null, n), e("small", null, stageHelp[i])))),
        oldest && e("p", { className: "rp-oldest" }, "⏳ " + L3("Cea mai veche sesizare nerezolvată așteaptă de ", "The oldest unresolved report has waited ", "A legrégebbi megoldatlan bejelentés ennyi ideje vár: ") + waitText(now - oldest, lang) + "."),
        e(RequestTracker, null),
        e("div", { className: "rp-tools" },
          e("div", { className: "tabs" },
            e("button", { className: tab === "all" ? "active" : "", onClick: () => setTab("all") }, t.allReports),
            e("button", { className: tab === "mine" ? "active" : "", onClick: () => setTab("mine") }, t.myReportsOnly),
            e("button", { className: tab === "evidence" ? "active" : "", onClick: () => setTab("evidence") }, t.evidenceTab)),
          tab !== "evidence" && !wide && e("div", { className: "rp-view", role: "group" },
            e("button", { className: view === "list" ? "on" : "", "aria-pressed": view === "list", onClick: () => setView("list") }, "📋 " + L3("Listă", "List", "Lista")),
            e("button", { className: view === "map" ? "on" : "", "aria-pressed": view === "map", onClick: () => setView("map") }, "🗺️ " + L3("Hartă", "Map", "Térkép")))),
        tab === "evidence" ? e(EvidenceWall, null) : e(React.Fragment, null,
          e("div", { className: "rp-chips" },
            e("button", { className: "rp-chip" + (cat === "all" ? " on" : ""), onClick: () => setCat("all") }, "✨ " + L3("Toate", "All", "Mind")),
            REPORT_CATS.concat([["condition", "🩺"]]).map(c => e("button", { key: c[0], className: "rp-chip" + (cat === c[0] ? " on" : ""), onClick: () => setCat(cat === c[0] ? "all" : c[0]) },
              c[1] + " " + ({ surface: t.catSurface, hoop: t.catHoop, fence: t.catFence, lighting: t.catLighting, trash: t.catTrash, safety: t.catSafety, other: t.catOther, condition: t.conditionCheck }[c[0]]))),
            hoods.length > 1 && e("select", { value: hood, onChange: ev => setHood(ev.target.value), className: "rp-hood", "aria-label": t.neighbourhood },
              e("option", { value: "all" }, t.neighbourhood),
              hoods.map(h => e("option", { key: h, value: h }, hoodName(h, lang))))),
          court && e("button", { className: "rp-courtchip", onClick: () => setCourt(null) }, "📍 " + courtName + "  ✕"),
          wide
            ? e("div", { className: "rp-split" }, map, listEl)
            : view === "map" ? map : listEl)
      )),
    e(QuickReportFAB, null));
}
