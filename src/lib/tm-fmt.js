export function tmFmt(date, lang, short) {
  var d = new Date(date + "T12:00:00Z");
  return d.toLocaleDateString(lang === "hu" ? "hu-HU" : lang === "en" ? "en-GB" : "ro-RO", short ? { month: "short", year: "numeric" } : { day: "numeric", month: "long", year: "numeric" });
}
export function tmSpan(a, b, lang) {
  var d1 = new Date(a), d2 = new Date(b);
  var months = Math.max(0, (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth());
  var y = Math.floor(months / 12), m = months % 12;
  if (lang === "en") return (y ? y + (y === 1 ? " year" : " years") : "") + (y && m ? " " : "") + (m ? m + (m === 1 ? " month" : " months") : "") || "same month";
  if (lang === "hu") return (y ? y + " év" : "") + (y && m ? " " : "") + (m ? m + " hónap" : "") || "ugyanaz a hónap"; // TODO: HU review
  return (y ? y + (y === 1 ? " an" : " ani") : "") + (y && m ? " și " : "") + (m ? m + (m === 1 ? " lună" : " luni") : "") || "aceeași lună";
}
