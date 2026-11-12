import { db } from "../app/core.js";
import { useEffect, useState } from "../lib/react.js";

export function useFirebase(path) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!path) return;
    const ref = db.ref(path);
    const fn = snap => setData(snap.val());
    ref.on('value', fn);
    return () => ref.off('value', fn);
  }, [path]);
  return data;
}
