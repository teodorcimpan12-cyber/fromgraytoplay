import { EASTER_DAYS, PARTY_DAYS } from "../data/constants.js";
import { EGGS } from "../data/eggs.js";
import { fxReduced } from "./fx-reduced.js";

export function g2pEgg(id) { try { window.dispatchEvent(new CustomEvent("g2p:egg", { detail: { id: id } })); } catch (e) {} }
export function eggsFound() { try { return JSON.parse(localStorage.getItem("g2p_eggs") || "{}") || {}; } catch (e) { return {}; } }
export function eggCount() { const f = eggsFound(); return EGGS.filter(x => f[x.id]).length; }
export function animOff() { try { return localStorage.getItem("g2p_anim_off") === "1"; } catch (e) { return false; } }
export function funFx() { return !fxReduced() && !animOff(); }
// iOS asks for motion permission (button in FunPanel); elsewhere motion is on unless switched off.
export function motionNeedsPerm() { return typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function"; }
export function motionOn() { let v = null; try { v = localStorage.getItem("g2p_motion"); } catch (e) {} return motionNeedsPerm() ? v === "1" : v !== "0"; }
export function partyKind() {
  const d = new Date(), md = String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  if (EASTER_DAYS.indexOf(d.getFullYear() + "-" + md) >= 0) return "easter";
  return PARTY_DAYS[md] || null;
}
export function isPartyDay() { return !!partyKind(); }
export function eggL(o, lang) { return o[lang] || o.ro; }
