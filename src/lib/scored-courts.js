import { COURTS } from "../app/core.js";
 // TODO: HU review

/* Inequality views only use courts with a real 1–5 score (all of TGM; field-verified Sibiu courts) and
   need at least two scored neighbourhoods — a gap has two sides. Unscored courts never count as 0. */
export function scoredCourts() { return COURTS.filter(function (c) { return c.condition != null; }); }
export function gapReady() {
  var hs = {}; scoredCourts().forEach(function (c) { hs[c.neighbourhood] = 1; });
  return Object.keys(hs).length >= 2;
}
