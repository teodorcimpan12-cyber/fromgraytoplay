import { useEffect, useRef, useState } from "../../lib/react.js";

/* Polish: animated count-up for stat numbers */
export function useCountUp(target, duration) {
  const [val, setVal] = useState(0);
  const ref = useRef(target);
  ref.current = target;
  useEffect(() => {
    const end = Number(target) || 0;
    if (end === 0) { setVal(0); return; }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches) { setVal(end); return; }
    let raf, start;
    const dur = duration || 1100;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}
