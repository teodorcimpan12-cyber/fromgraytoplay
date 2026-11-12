/* === voterKey helper === */
export function getVoterKey() {
  let k = localStorage.getItem("g2p_vk");
  if (!k) { k = "vk_" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("g2p_vk", k); }
  return k;
}
