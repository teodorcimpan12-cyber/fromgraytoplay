export const SITE = "https://fromgreytoplay.netlify.app";
/* === Cycle through ro -> en -> hu === */
export const LANG_ORDER = ["ro", "en", "hu"];
export const LANG_LABEL = { ro: "EN", en: "HU", hu: "RO" };
export const ACTIVITY_ICONS = { "check-in": "🏀", petition: "✍️", photo: "📸", report: "⚠️", conditionReport: "🩺", game: "⚽", join: "🤝", pixel: "🎨", adopt: "💚" };
/* === Hash routing. "#courts" etc. select a page; "#court-{id}" deep-links
   into CourtsPage (used by shareCourt + manifest shortcuts). "#/admin" is
   handled separately in App. === */
export const PAGE_IDS = ["home", "courts", "reports", "petition", "community", "impact", "help", "association", "about", "profile", "press"];
export const THEME_FX_ALT = ["ball", "blackout", "spray", "whistle", "lines"];
export const LANG_NAMES = { ro: "Română", en: "English", hu: "Magyar" };
/* === Neighborhood Civic Race === */
export var HOOD_COURT_MAP = {
  tudor:      ["c5","c6","c7","c8","c19","c27"],
  auchan:     ["c3","c4"],
  mureseni:   ["c1","c2","c20","c28"],
  center:     ["c9","c10","c11","c12","c13","c18","c26","c29","c30"],
  pandurilor: ["c14","c15"],
  libertate:  ["c16"],
  unirii:     ["c17","c21"],
  dambu:      ["c22","c23"],
  cornesti:   ["c24","c25"]
};
export var HOOD_DISPLAY = {
  ro:{ tudor:"Tudor", auchan:"Zona Auchan", mureseni:"Mureșeni", center:"Centru", pandurilor:"Pandurilor", libertate:"Libertate", unirii:"Unirii", dambu:"Dâmbu Pietros", cornesti:"Cornești" },
  en:{ tudor:"Tudor", auchan:"Auchan Area", mureseni:"Mureșeni", center:"Center",  pandurilor:"Pandurilor", libertate:"Libertate", unirii:"Unirii", dambu:"Dâmbu Pietros", cornesti:"Cornești" },
  hu:{ tudor:"Tudor", auchan:"Auchan körzet", mureseni:"Mureșeni", center:"Közép", pandurilor:"Pandurilor", libertate:"Libertate", unirii:"Unirii", dambu:"Dâmbu Pietros", cornesti:"Cornești" }
};
/* === Pledge Wall === */
export var PLEDGE_EMOJIS = ["✊","🌿","🏀","⚽","🎨","🤝","🌟","🏃","📢","💪","🔧","🌈"];
/* ============================================================
   SEASON 3 — CINEMA PACK (components + strings)
   ============================================================ */
/* === Satellite archive: real dated captures (Esri World Imagery Wayback) ===
   data/timemachine.json is precomputed by tools/build_timemachine.mjs; courts not in it are
   resolved live with the same walk-back over data/wayback.json. */
export var WB_TILE = "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/";
export var WB_MAP = "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tilemap/";
export var tmCache = { pre: null, rel: null }; // TODO: HU review

/* === #3 Civic graffiti pixel wall — shared 48×48 canvas in pixels/{x_y} === */
export var PX_GRID = 48;
export var PX_COLORS = ["#10B981", "#0D9488", "#F97316", "#DC2626", "#F59E0B", "#8B5CF6", "#3B82F6", "#EC4899", "#FFFFFF", "#1A1A2E"];
export var PX_COOLDOWN_MS = 10 * 60 * 1000;
/* === #6 Ambient court status light — time-of-day tint + red flash on fresh reports.
   Approx. sunset hour in Târgu Mureș per month (local time, DST-adjusted). === */
export var G2P_SUNSET = [16.8, 17.5, 18.3, 20.1, 20.8, 21.3, 21.3, 20.7, 19.7, 18.6, 16.7, 16.4];
/* Maintenance task templates (Feature 9). */
export var TASK_TEMPLATES = [
  { key: "lines",    emoji: "🎨", ro: "Revopsire marcaje",       en: "Repaint lines",    hu: "Vonalak újrafestése" },      // TODO: HU review
  { key: "net",      emoji: "🥅", ro: "Înlocuire plasă/filet",   en: "Replace net",      hu: "Háló cseréje" },             // TODO: HU review
  { key: "clean",    emoji: "🧹", ro: "Curățenie generală",      en: "General cleanup",  hu: "Általános takarítás" },      // TODO: HU review
  { key: "weeds",    emoji: "🌿", ro: "Defrișare vegetație",     en: "Clear weeds",      hu: "Gyomtalanítás" },            // TODO: HU review
  { key: "graffiti", emoji: "🧽", ro: "Curățare graffiti",       en: "Remove graffiti",  hu: "Graffiti eltávolítása" }     // TODO: HU review
];
export const CITY_CFG = {
  tgm: { nameRo:"Târgu Mureș", nameEn:"Târgu Mureș", nameHu:"Marosvásárhely", center:[46.5427,24.5572], zoom:13 },
  sibiu: { nameRo:"Sibiu", nameEn:"Sibiu / Hermannstadt", nameHu:"Nagyszeben", center:[45.7983,24.1256], zoom:13, hoods:{"strand":"Ștrand","broscarie":"Broscărie","centrul_istoric":"Centrul Istoric","valea_aurie":"Valea Aurie","centrul_civic":"Centrul Civic","hipodrom":"Hipodrom","vasile_aaron":"Vasile Aaron","dumbravii":"Dumbrăvii","tilisca":"Tilișca","terezian":"Terezian","tiglari":"Țiglari","lazaret":"Lazaret","doamna_stanca":"Doamna Stanca","resita":"Reșița"} }
};
/* Every other Sibiu court gets its 1-5 score from the team's satellite verdict (intact 4, worn 2, no court left 1),
   marked `estimate: "sat"` so the UI can say where the number comes from. */
export const SAT_SCORE = { ok: 4, worn: 2, gone: 1 };
export const SAT_DESC = [[/neverificat pe teren/, "stare estimată din satelit"], [/not field-verified/, "condition estimated from satellite"], [/helyszínen nem ellenőrzött/, "állapot műholdkép alapján becsülve"]];
export const FUNDING = [{
  name: "Erasmus+ Sport KA2",
  amount: "EUR 120K-450K",
  url: "https://erasmus-plus.ec.europa.eu/funding-calls",
  type: "EU"
}, {
  name: "Erasmus+ Youth KA1",
  amount: "—",
  url: "https://erasmus-plus.ec.europa.eu/funding-calls",
  type: "EU"
}, {
  name: "European Youth Together",
  amount: "—",
  url: "https://ec.europa.eu/info/funding-tenders/",
  type: "EU"
}, {
  name: "EU Sport Grassroot",
  amount: "—",
  url: "https://sport.ec.europa.eu/funding",
  type: "EU"
}, {
  name: "POR Regional",
  amount: "—",
  url: "https://mfe.gov.ro/",
  type: "National"
}, {
  name: "PNRR Pillar VI",
  amount: "—",
  url: "https://mfe.gov.ro/pnrr/",
  type: "National"
}, {
  name: "Law 350/2005",
  amount: "—",
  url: "https://politicisport.ro/",
  type: "National"
}, {
  name: "Buget Local TGM",
  amount: "—",
  url: "https://www.tirgumures.ro/",
  type: "Local"
}];
export const BUDGET = [{
  y: 2020,
  p: 2.1,
  s: 0.8
}, {
  y: 2021,
  p: 2.5,
  s: 1.0
}, {
  y: 2022,
  p: 3.0,
  s: 0.7
}, {
  y: 2023,
  p: 2.8,
  s: 0.9
}, {
  y: 2024,
  p: 3.5,
  s: 1.1
}, {
  y: 2025,
  p: 4.0,
  s: 0.6
}];
export const CITIES = {
  tgm: {
    name: "Târgu Mureș",
    b: 12,
    c: 3.2,
    r: 0
  },
  clj: {
    name: "Cluj-Napoca",
    b: 28,
    c: 7.1,
    r: 45
  },
  sib: {
    name: "Sibiu",
    b: 22,
    c: 5.8,
    r: 38
  },
  bv: {
    name: "Brașov",
    b: 25,
    c: 6.3,
    r: 42
  }
};
export const ADMIN_EMAIL = "teodor.cimpan12@gmail.com";
export const ADMIN_UID  = "IIdfYqliTrdlYqjS0swd0swlRkV2";
// Private nicknames shown only to the account owner, keyed by SHA-256 of the lower-cased email.
export const NICKNAMES = { "3d25d61745ac18cbc0c543ce2183779afde5a46599b187ea06fb579b6561f2f1": { ro: "Tata", en: "Dad", hu: "Apa" } };
export var HERO_ICON = { flip: "\uD83C\uDFC0", canvas: "\uD83C\uDFA8", locker: "\uD83D\uDCF2" };
/* === Courts === */
/* === Atlas Sport: courts they built in each city. Their terms forbid reusing their photos without consent
   (asked by email 27 Oct 2026), so until they say yes we only link to their own project pages. === */
export const ATLAS_PROJECTS = {
  tgm: [
    { ro: "Teren de baschet din dale modulare, Parcul Municipal", en: "Modular-tile basketball court, Municipal Park", hu: "Moduláris lapokból épült kosárlabdapálya, Városi park", url: "https://www.atlassport.ro/project/teren-baschet-din-dale-modulare-parcul-municipal-targu-mures-fotovideo/" }, // TODO: HU review
    { ro: "Loc de joacă, Parcul Diamant", en: "Playground, Diamant Park", hu: "Játszótér, Diamant park", url: "https://www.atlassport.ro/project/loc-de-joaca-pentru-copii-parcu-diamant-targu-mures/" } // TODO: HU review
  ],
  sibiu: [
    { ro: "Bază sportivă: fotbal, tenis, baschet, tribune", en: "Sports base: football, tennis, basketball, stands", hu: "Sportbázis: foci, tenisz, kosárlabda, lelátók", url: "https://www.atlassport.ro/project/baza-sportiva-sibiu/" }, // TODO: HU review
    { ro: "Bază sportivă Sibiu, foto și video", en: "Sibiu sports base, photos and video", hu: "Szebeni sportbázis, fotók és videó", url: "https://www.atlassport.ro/project/baza-sportiva-sibiu-sb-fotovideo/" }, // TODO: HU review
    { ro: "Teren multisport, Păltiniș (jud. Sibiu)", en: "Multi-sport court, Păltiniș (Sibiu county)", hu: "Multisportpálya, Szebenjuharos (Szeben megye)", url: "https://www.atlassport.ro/project/teren-multisport-paltinis-fotovideo/" } // TODO: HU review
  ]
};
/* === Court Ratings + Radar (#3.1) === */
export const RATE_DIMS = ["surface", "lighting", "equipment", "safety"];
/* === Petition === */
export const MILESTONES = [50, 100, 250, 500, 1000];
export const CONFETTI_COLS = ["#10B981","#F97316","#0D9488","#F59E0B","#EC4899","#8B5CF6","#3B82F6","#EF4444"];
export const COMMUNITY_TABS = ["activity", "pixel", "forum", "events", "gallery", "teams", "leaderboard"];
// Who manages a court: c.admin in cityhall | school | private; anything else is shown as unknown (never guessed).
export const COURT_ADMIN = { cityhall: ["Primăria", "City Hall", "Városháza"], school: ["Școală", "School", "Iskola"], private: ["Privat", "Private", "Magán"], unknown: ["Necunoscut", "Unknown", "Ismeretlen"] }; // TODO: HU review
// Our real Law 544/2001 requests, extended to 30 days by the city halls; answers due 25.11.2026.
export const CITY_544 = { tgm: { to: "Primăria Târgu Mureș", no: "51941/04.11.2026", due: "2026-11-25" }, sibiu: { to: "Primăria Sibiu", no: "89234/03.11.2026", due: "2026-11-25" } };
/* === CSM Târgu Mureș — official investments + repairs on sports grounds 2022–2025 ===
   Source: CSM reply nr. 2692/03.11.2026 to our Law 544/2001 request nr. 51941/26.10.2026
   (annex "Lista cu investitii si reparatii terenuri de sport 2022-2025 CSM TGM.xlsx").
   Item text is copied verbatim from the document. l3 = work done for Liga 3 homologation.
   CSM total spending per year = BVC CSM (HCL 299/2022, 374/2023, 294/2024, 276/2025). */
export const CSM_SRC = "CSM Târgu Mureș, adresa nr. 2692/03.11.2026 (răspuns la cererea Legea 544/2001 nr. 51941/26.10.2026)";
export const CSM_BUDGET = { 2022: 12698000, 2023: 13418000, 2024: 19231000, 2025: 21611000 };
/* === Help === */
/* === Sources: one registry behind every sourced number on the site.
   <SrcRef id="..."/> draws the small number next to a figure: hover card on desktop, bottom panel on
   phone, and a jump to About -> Sources; each source card links back to where its number appears.
   TGM-only sources never show on Sibiu and vice versa ("general" shows on both). === */
export const SRC_KIND_IC = { news: "📰", study: "📚", gov: "🏛️", map: "🗺️", data: "🧭", survey: "📋", sat: "🛰️" };
export const SRC_UI = {
  ro: { src: "Sursa", open: "Deschide sursa ↗", all: "Vezi în Surse", essay: "Citește lucrarea", close: "Închide", isNew: "nou", copy: "Copiază citarea", copied: "Citare copiată ✓", back: "↩ Înapoi la cifră", usedAt: "Apare în:", nowhere: "Doar în lista de surse", filterAll: "Toate", general: "Generale", count: "surse" },
  en: { src: "Source", open: "Open source ↗", all: "See in Sources", essay: "Read the essay", close: "Close", isNew: "new", copy: "Copy citation", copied: "Citation copied ✓", back: "↩ Back to the number", usedAt: "Used on:", nowhere: "Only in the sources list", filterAll: "All", general: "General", count: "sources" },
  hu: { src: "Forrás", open: "Forrás megnyitása ↗", all: "Megnézem a Forrásokban", essay: "A dolgozat", close: "Bezár", isNew: "új", copy: "Hivatkozás másolása", copied: "Hivatkozás másolva ✓", back: "↩ Vissza a számhoz", usedAt: "Itt szerepel:", nowhere: "Csak a forráslistában", filterAll: "Mind", general: "Általános", count: "forrás" } // TODO: HU review
};
/* Funding & partnerships: honest numbers first (what the platform costs, why the renovation cost
   is not on the site yet, where money could come from), then what a partner would get. */
/* === Formularul 230: 3.5% of the income tax. Honest about status: we cannot receive anything until the
   association is registered and listed by ANAF. Source: ANAF guide "Ghid 3,5%" (static.anaf.ro). === */
export const ANAF_GUIDE_URL = "https://static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_3_5_2025.pdf";
/* === Press: data, release and PDF. /press (or #press) is hidden from the nav; reached from the
   footer, from About and by QR. The PDF is built in the browser from live numbers. === */
export const G2P_EMAIL = "teodor.cimpan12@gmail.com";
export const G2P_PRESS_PHONE = "+40 770 115 654";
/* === How to help: one scroll. "5 min / 1 hour / a day?" picks the matching actions; progress and
   a badge per tier are saved on the device (localStorage g2p_help) and under achievements/{voterKey}
   (help_{id}), which follows the account when signed in. No donation button. === */
export const HELP_TIERS = [
  { k: "5m", ic: "⏱️", badge: "⚡" },
  { k: "1h", ic: "🕐", badge: "🔥" },
  { k: "1d", ic: "📅", badge: "🏆" }
];
/* === Admin === */
// Sheriffs edit the site and run the community: every tab except raw database access (God Mode),
// people's emails (signups, users) and the sheriff list. Destructive buttons (.dng/.a-del/.a-normal) are hidden.
export const SHERIF_TABS = ["site", "moderation", "votes", "reports", "courts", "forum", "events", "leaderboard"];
/* ============================================================
   ADMIN — SITE CONTROL. Writes settings/ which every client
   follows in realtime: maintenance, banner, broadcast, feature
   flags, featured court, accent color, danger zone.
   ============================================================ */
// G2P palette for the admin colour picker: [primary, secondary, name].
// Presets set both --green (primary) and --teal (secondary); swatches set the
// primary only. All are dark enough for white button text.
export const ACCENT_PRESETS = [
  ["", "", "G2P Classic"],
  ["#059669", "#0F766E", "G2P Forest"],
  ["#047857", "#065F46", "G2P Pine"],
  ["#16A34A", "#0D9488", "G2P Court"],
  ["#65A30D", "#059669", "G2P Lime"],
  ["#0D9488", "#0891B2", "G2P Lagoon"],
  ["#0891B2", "#2563EB", "Ocean"],
  ["#2563EB", "#7C3AED", "Royal"],
  ["#7C3AED", "#DB2777", "Neon"],
  ["#DB2777", "#F97316", "Mural"],
  ["#EA580C", "#DC2626", "Sunset"],
  ["#B45309", "#65A30D", "Clay court"],
  ["#475569", "#0D9488", "Concrete"]
];
export const ACCENT_SHADES = [
  ["G2P green", ["#34D399", "#10B981", "#059669", "#047857", "#065F46", "#064E3B"]],
  ["Grass", ["#4ADE80", "#22C55E", "#16A34A", "#15803D", "#166534"]],
  ["Lime", ["#84CC16", "#65A30D", "#4D7C0F", "#3F6212"]],
  ["Teal", ["#14B8A6", "#0D9488", "#0F766E", "#115E59"]],
  ["Cyan", ["#06B6D4", "#0891B2", "#0E7490", "#155E75"]],
  ["Blue", ["#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#4F46E5"]],
  ["Purple", ["#A855F7", "#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6"]],
  ["Pink", ["#EC4899", "#DB2777", "#BE185D", "#E11D48"]],
  ["Warm", ["#F97316", "#EA580C", "#F59E0B", "#D97706", "#DC2626", "#B91C1C"]],
  ["Neutral", ["#64748B", "#475569", "#334155", "#1F2937"]]
];
export const BANNER_COLORS = [["", "Auto (by type)"], ["#10B981", "Green"], ["#0D9488", "Teal"], ["#2563EB", "Blue"], ["#7C3AED", "Purple"], ["#DB2777", "Pink"], ["#F97316", "Orange"], ["#DC2626", "Red"], ["#1F2937", "Dark"]];
/* === Quick Report FAB + 3-step Modal ===
   Court → issue → photo, about 20 seconds. No account needed to send (anti-spam: 2 per 10 min per device); a visitor who is not
   who wants an account can still sign in later; the draft (sessionStorage g2p_report_draft) survives it,
   back exactly as they left it — also after a full-page Google redirect. */
export const REPORT_CATS = [["surface", "🏗️"], ["hoop", "🏀"], ["fence", "🚧"], ["lighting", "💡"], ["trash", "🗑️"], ["safety", "⚠️"], ["other", "📌"]];
export const CITY_HALL_EMAIL = { tgm: "primaria@tirgumures.ro", sibiu: "pms@sibiu.ro" };
/* Letter v2 (docs/SPEC_6NOV.md §2). Legal basis the citizen picks: OG 27/2002 petition (30 days) or
   Law 544/2001 information request (10 days). Romanian only: the letter goes to a Romanian City Hall. */
export const LETTER_BASIS = {
  og27: { days: 30, law: "OG nr. 27/2002", ro: "Petiție: cer verificarea și repararea", en: "Petition: ask for a check and repair", hu: "Petíció: ellenőrzést és javítást kérek",
    subj: "Petiție (OG nr. 27/2002) privind terenul: " },
  l544: { days: 10, law: "Legea nr. 544/2001", ro: "Cerere de informații: cine îl întreține și cu ce bani", en: "Information request: who maintains it and with what money", hu: "Információkérés: ki tartja karban és miből",
    subj: "Cerere de informații de interes public (Legea nr. 544/2001) privind: " }
}; // TODO: HU review
export const CITY_RO = { tgm: "Târgu Mureș", sibiu: "Sibiu" };
/* === "Sibiul se verifică singur" (docs/SPEC_6NOV.md §5) ===
   Residents answer 3 questions (+ up to 3 photos without people) for a court -> verifications/{id}.
   A court is "verified by the community" only when 2 different devices agree; one answer stays "reported by 1 person".
   Never "field-verified by the team"; never written to the court's condition. */
export const VERIFY_MISSING = [["hoop", "🏀", "coș / panou", "hoop / backboard", "kosár / palánk"], ["goal", "🥅", "poartă / plasă", "goal / net", "kapu / háló"], ["surface", "🕳️", "suprafață bună", "a good surface", "jó burkolat"],
  ["fence", "🚧", "gard", "fence", "kerítés"], ["lighting", "💡", "iluminat", "lighting", "világítás"], ["clean", "🧹", "curățenie", "cleanliness", "tisztaság"]];
/* === Report Status Timeline ===
   Status keys stay as stored (received/analyzing/planned/resolved); the labels say what
   they mean for the visitor: sent → seen → at City Hall → resolved. "planned" is the
   City Hall step and carries the proof (cityHall.sentAt + cityHall.regNo). */
export const REPORT_STAGES = ["received", "analyzing", "planned", "resolved"];
// Month-day keys for the party egg: 1 June = Children's Day in Romania, 12 Nov = a team birthday,
// 24-26 Dec = Christmas. Easter moves every year, so its Sundays + Mondays (Orthodox and Catholic) are listed by full date.
export const PARTY_DAYS = { "06-01": "kids", "11-12": "bday", "12-24": "xmas", "12-25": "xmas", "12-26": "xmas" };
export const EASTER_DAYS = ["2026-04-05", "2026-04-06", "2026-04-12", "2026-04-13", "2027-03-28", "2027-03-29", "2027-05-02", "2027-05-03", "2028-04-16", "2028-04-17", "2029-04-01", "2029-04-02", "2029-04-08", "2029-04-09", "2030-04-21", "2030-04-22", "2030-04-28", "2030-04-29"];
// who speaks: change the names here if the team on stage changes
export const DEMO_WHO = { T: "Teo", M: "Matei", G: "Gabriel" };

/* Mentors: shown with their full public name and a MENTOR tag (blue of sibiu-it.ro), pinned first on the leaderboard.
   `hash` = SHA-256 of the account email (no address in the repo): when the owner is signed in, the account is made a sheriff. */
export const MENTOR_BLUE = "#2F6CF7";
export const MENTORS = [{ name: "Daniel Ferecatu", hash: "96375884595ce07b64488b7ea63d21b494d9263023b85cea3a395914a58670c8" }];
export function isMentor(name) { const n = String(name || "").trim().toLowerCase().replace(/\s+/g, " "); return !!n && MENTORS.some(m => m.name.toLowerCase() === n); }
