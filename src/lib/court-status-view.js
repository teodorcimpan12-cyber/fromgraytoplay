import { ACTIVE_CITY, COURTS_ALL } from "../app/core.js";
 // TODO: HU review

/* === Court status view: one place that turns a court's status into colour, badge and label ===
   "verified" = scored on a team field visit (Sibiu, tools/import_field.mjs). It is coloured by the real
   condition and never labelled "renovated": a well-kept court is not a renovated one. */
export function courtStatusView(court, t) {
  var s = court && court.status;
  if (s === "verified") {
    var cond = court.condition, tone = cond >= 4 ? "green" : cond === 3 ? "coral" : "red";
    return { color: tone === "green" ? "#10B981" : tone === "coral" ? "#F97316" : "#DC2626", badge: "badge-" + tone,
      admin: tone === "red" ? "a-badge-r" : "a-badge-g", label: (t.fieldVerified || "Verificat pe teren") + " · " + cond + "/5", bad: cond <= 2 };
  }
  if (s === "unverified") return { color: "#6B7280", badge: "badge-gray", admin: "a-badge-t", label: t.unverified || "Neverificat", bad: false };
  if (s === "excellent") return { color: "#10B981", badge: "badge-green", admin: "a-badge-g", label: t.excellent || "Excelent", bad: false };
  if (s === "satellite") {
    // Same words and colours as Târgu Mureș; the satellite origin is shown in the court detail (SatFinding).
    var sv = (court.sat && court.sat.v) || "ok";
    return sv === "gone" ? { color: "#9F1239", badge: "badge-red", admin: "a-badge-r", label: t.satGone || "Dispărut", bad: true }
      : sv === "worn" ? { color: "#DC2626", badge: "badge-red", admin: "a-badge-r", label: t.satWorn || "Degradat", bad: true }
      : { color: "#10B981", badge: "badge-green", admin: "a-badge-g", label: t.satOk || "Bun", bad: false };
  }
  if (s === "degraded") return { color: "#DC2626", badge: "badge-red", admin: "a-badge-r", label: t.degraded || "Degradat", bad: true };
  if (s === "inProgress") return { color: "#F97316", badge: "badge-coral", admin: "a-badge-o", label: t.inProgress || "În lucru", bad: false };
  return { color: "#10B981", badge: "badge-green", admin: "a-badge-g", label: t.renovated || "Renovat", bad: false };
}
/* Citizen-submitted courts live at courts/{pushId}. The same node also stores check-ins for the
   built-in courts (courts/sb28/checkins), which must not be read as an extra court. */
export function extraCourts(fbCourts, allCities) {
  if (!fbCourts) return [];
  var known = {};
  COURTS_ALL.forEach(function (c) { known[c.id] = 1; });
  return Object.keys(fbCourts).filter(function (id) {
    var c = fbCourts[id];
    return !known[id] && c && c.name && (allCities || (c.city || "tgm") === ACTIVE_CITY);
  }).map(function (id) { return Object.assign({ id: id }, fbCourts[id]); });
}
/* === Court weather helper (#12 from build brief) === */
/* Maps the existing 1-5 condition score to a weather chip. */
export function getCourtWeather(condition, t) {
  if (condition == null) return { icon: "❔", key: "unverified", color: "#6B7280", label: t.unverified || "Neverificat" };
  const c =Math.max(0, Math.min(5, Number(condition) || 0)) / 5;
  if (c >= 0.8) return { icon: "☀️", key: "weatherExcellent", color: "#10B981", label: t.weatherExcellent };
  if (c >= 0.6) return { icon: "🌤️", key: "weatherGood", color: "#22C55E", label: t.weatherGood };
  if (c >= 0.4) return { icon: "⛅", key: "weatherOkay", color: "#F59E0B", label: t.weatherOkay };
  if (c >= 0.2) return { icon: "🌧️", key: "weatherPoor", color: "#F97316", label: t.weatherPoor };
  return { icon: "⛈️", key: "weatherBroken", color: "#DC2626", label: t.weatherBroken };
}
