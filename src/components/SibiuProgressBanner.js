import { ACTIVE_CITY } from "../app/core.js";
import { SibiuProgressBannerInner } from "./SibiuProgressBannerInner.js";

/* === Sibiu Progress Banner: one dot per Sibiu court, lit once the community has checked it === */
export function SibiuProgressBanner() {
  return ACTIVE_CITY === "sibiu" ? React.createElement(SibiuProgressBannerInner, null) : null;
}
