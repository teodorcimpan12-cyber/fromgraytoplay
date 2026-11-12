import { useApp } from "../../app/core.js";
import { COMMUNITY_TABS } from "../../data/constants.js";
import { useState } from "../../lib/react.js";
import { ActivityFeed } from "./ActivityFeed.js";
import { CommunityOverview } from "./CommunityOverview.js";
import { EventsTab } from "./EventsTab.js";
import { ForumTab } from "./ForumTab.js";
import { GalleryTab } from "./GalleryTab.js";
import { LBTab } from "./LBTab.js";
import { PixelWall } from "./PixelWall.js";
import { TeamsTab } from "./TeamsTab.js";
import { communityTabLabel } from "./helpers.js";

export function CommunityPage() {
  const { t, lang } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? hu : ro; // TODO: HU review
  const [tab, setTab] = useState("overview");
  const go = tb => { setTab(tb); const el = document.querySelector(".cm-tabs"); if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const purpose = {
    activity: L3("Tot ce se întâmplă acum: semnături, verificări, poze. În timp real.", "Everything happening right now: signatures, checks, photos. Live.", "Minden, ami most történik: aláírások, ellenőrzések, fotók. Élőben."),
    pixel: L3("Un mural comun de 48×48. Fiecare pune câte un pixel la 10 minute.", "One shared 48×48 mural. Everyone adds one pixel every 10 minutes.", "Egy közös 48×48-as falkép. Mindenki 10 percenként tehet egy pixelt."),
    forum: L3("Idei și probleme din cartierul tău. Votează ce contează.", "Ideas and problems from your neighbourhood. Vote for what matters.", "Ötletek és gondok a környékedről. Szavazz arra, ami számít."),
    events: L3("Meciuri și întâlniri pe terenuri. Propune unul în 2 minute.", "Games and meetups on the courts. Propose one in 2 minutes.", "Meccsek és találkozók a pályákon. Javasolj egyet 2 perc alatt."),
    gallery: L3("Cum arată terenurile azi, în pozele voastre.", "What the courts look like today, in your photos.", "Hogy néznek ki ma a pályák, a ti fotóitokon."),
    teams: L3("Fă-ți echipa de cartier și provoacă alte cartiere.", "Build your neighbourhood team and challenge the others.", "Alakíts környékbeli csapatot, és hívd ki a többieket."),
    leaderboard: L3("Cine ajută cel mai mult: voturi, sesizări, voluntariat.", "Who helps the most: votes, reports, volunteering.", "Ki segít a legtöbbet: szavazatok, bejelentések, önkéntesség.")
  };
  const e = React.createElement;
  return e("div", { className: "animate-in" },
    e("section", { className: "section" },
      e("div", { className: "container" },
        e("h2", { className: "section-title" }, t.community),
        e("div", { className: "tabs cm-tabs", role: "tablist" }, ["overview"].concat(COMMUNITY_TABS).map(tb => e("button", { key: tb, role: "tab", "aria-selected": tab === tb, className: tab === tb ? "active" : "", onClick: () => go(tb) }, communityTabLabel(tb, t)))),
        tab !== "overview" && e("p", { className: "cm-purpose" }, purpose[tab]),
        tab === "overview" && e(CommunityOverview, { go: go, purpose: purpose }),
        tab === "activity" && e(ActivityFeed, null),
        tab === "pixel" && e(PixelWall, null),
        tab === "forum" && e(ForumTab, null),
        tab === "events" && e(EventsTab, null),
        tab === "gallery" && e(GalleryTab, null),
        tab === "teams" && e(TeamsTab, null),
        tab === "leaderboard" && e(LBTab, null))));
}
