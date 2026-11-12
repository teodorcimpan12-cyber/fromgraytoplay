import { REPORT_STAGES } from "../../data/constants.js";

export function reportStage(r) { const i = REPORT_STAGES.indexOf(r && r.status); return i < 0 ? 0 : i; }
export function waitText(ms, lang) {
  const h = Math.max(0, Math.floor(ms / 3600000)), d = Math.floor(h / 24);
  if (lang === "en") return d ? d + " d " + (h % 24) + " h" : h + " h";
  if (lang === "hu") return d ? d + " n " + (h % 24) + " ó" : h + " ó";
  return d ? d + (d === 1 ? " zi " : " zile ") + (h % 24) + " h" : h + " h";
}
