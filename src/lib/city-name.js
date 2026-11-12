import { ACTIVE_CITY } from "../app/core.js";
import { CITY_CFG } from "../data/constants.js";

export function cityName(lang) {
  const c = CITY_CFG[ACTIVE_CITY];
  return lang === "hu" ? c.nameHu : lang === "en" ? c.nameEn : c.nameRo;
}
