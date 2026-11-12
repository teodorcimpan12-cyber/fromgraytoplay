import { tmCache } from "../data/constants.js";

export function tmJson(url) {
  return fetch(url).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
}
export function tmPrecomputed() {
  if (!tmCache.pre) tmCache.pre = tmJson("/data/timemachine.json").then(function (d) { return d.courts || {}; }).catch(function () { tmCache.pre = null; return {}; });
  return tmCache.pre;
}
