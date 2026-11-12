import { db } from "../app/core.js";
import { useFirebase } from "./useFirebase.js";
import { getVoterKey } from "../lib/get-voter-key.js";

/* B3 — follow / unfollow per voterKey */
export function useFollows() {
  const vk = getVoterKey ? getVoterKey() : (localStorage.getItem("g2p_vk") || "");
  const raw = useFirebase(vk ? "follows/" + vk : null);
  const follows = raw || {};
  const isFollowing = id => !!follows[id];
  const toggle = id => {
    if (!vk) return;
    if (follows[id]) db.ref("follows/" + vk + "/" + id).remove();
    else db.ref("follows/" + vk + "/" + id).set(true);
  };
  return { follows, isFollowing, toggle };
}
