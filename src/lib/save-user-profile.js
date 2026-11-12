import { db } from "../app/core.js";

// Create users/{uid} on first sign-in; never overwrite an existing profile.
export function saveUserProfile(fbUser, displayName) {
  if (!fbUser) return;
  const ref = db.ref("users/" + fbUser.uid);
  ref.once("value").then(snap => {
    if (!snap.exists()) ref.set({
      name: displayName || fbUser.displayName || (fbUser.email || fbUser.phoneNumber || "user").split("@")[0],
      email: fbUser.email || "",
      role: "user",
      points: 0,
      badges: ["🌱"],
      createdAt: Date.now()
    });
    else if (displayName && !snap.val().name) ref.child("name").set(displayName);
  }).catch(() => {});
}
// Admin site colours: primary (--green) + secondary (--teal); cached locally
// so the next load paints the right colour before Firebase answers.
export function applyAccent(p, s2) {
  const r = document.documentElement;
  if (p) {
    r.style.setProperty("--green", p);
    if (s2) r.style.setProperty("--teal", s2); else r.style.removeProperty("--teal");
    r.classList.add("accent-on");
    try { localStorage.setItem("g2p_accent", JSON.stringify({ p, s: s2 || "" })); } catch (e) {}
  } else {
    r.style.removeProperty("--green");
    r.style.removeProperty("--teal");
    r.classList.remove("accent-on");
    try { localStorage.removeItem("g2p_accent"); } catch (e) {}
  }
}
