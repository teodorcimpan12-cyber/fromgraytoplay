import { db } from "../app/core.js";
import { useEffect, useState } from "../lib/react.js";

// `last`: read only the newest N children (push keys are chronological), for lists that only show recent rows.
export function useFirebase(path, last) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!path) return;
    const ref = last ? db.ref(path).limitToLast(last) : db.ref(path);
    const fn = snap => setData(snap.val());
    ref.on('value', fn);
    return () => ref.off('value', fn);
  }, [path, last]);
  return data;
}
