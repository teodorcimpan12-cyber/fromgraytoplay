import { db } from "../app/core.js";
import { BADGES } from "../data/badges.js";
import { useFirebase } from "./useFirebase.js";
import { getVoterKey } from "../lib/get-voter-key.js";

export function useBadges() {
  var vk = getVoterKey();
  var raw = useFirebase(vk ? "achievements/" + vk : null);
  var earned = raw || {};
  var awardBadge = function(badgeId, cb) {
    if (earned[badgeId]) return;
    db.ref("achievements/" + vk + "/" + badgeId).set(Date.now());
    if (cb) cb(BADGES.find(function(b) { return b.id === badgeId; }));
  };
  return { earned: earned, awardBadge: awardBadge };
}
