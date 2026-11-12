import { db } from "../../app/core.js";
import { useEffect, useState } from "../../lib/react.js";

/* Impact → "Rezultate": live counts straight from the database. Nothing estimated, nothing rounded up:
   demo reports are excluded, zero is shown as zero, and a count that has not loaded shows "…". */
export function useFbCount(path, keep) {
  const [n, setN] = useState(null);
  useEffect(() => {
    const ref = db.ref(path);
    const fn = snap => { const v = snap.val() || {}; setN(Object.values(v).filter(x => x && typeof x === "object" && (!keep || keep(x)))); };
    ref.on("value", fn);
    return () => ref.off("value", fn);
  }, [path]);
  return n;
}
