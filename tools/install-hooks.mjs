// Installs the safety hooks into .git/hooks. Run once per clone: node tools/install-hooks.mjs
import { copyFileSync, chmodSync } from "node:fs";
for (const h of ["pre-commit", "pre-push"]) {
  copyFileSync("tools/hooks/" + h, ".git/hooks/" + h);
  try { chmodSync(".git/hooks/" + h, 0o755); } catch {}
  console.log("installed " + h);
}
