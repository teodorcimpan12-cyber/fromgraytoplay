import { useTilt } from "../hooks/useTilt.js";

/* Show-off: div with 3D tilt. Use like a normal div; optional max (deg). */
export function TiltDiv(props) {
  const ref = useTilt(props.max);
  const p = { ...props, ref, className: (props.className || "") + " tilt" };
  delete p.max;
  return React.createElement("div", p);
}
