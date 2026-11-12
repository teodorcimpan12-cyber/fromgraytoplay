/* === Easter eggs: rare critters crossing the screen + secret key combos.
   Both honor prefers-reduced-motion and the admin "effects" kill-switch. === */
/* === Mascot: a 3D basketball with a face, plus the big "swish" celebration === */
// Other components talk to it with window events, so nothing else needs to know it exists:
//   g2pCelebrate("petition" | "verify")  -> big 3D shot into a hoop
//   g2pMood("sad" | "happy" | "curious" | null) -> how the ball feels about the court on screen
export function g2pCelebrate(kind) { try { window.dispatchEvent(new CustomEvent("g2p:celebrate", { detail: { kind: kind } })); } catch (e) {} }
export function g2pMood(m) { window.__g2pMood = m; try { window.dispatchEvent(new CustomEvent("g2p:mood", { detail: { mood: m } })); } catch (e) {} }
export function mascotOff() { try { return localStorage.getItem("g2p_mascot_off") === "1"; } catch (e) { return false; } }
