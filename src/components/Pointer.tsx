import React from "react";
import { useTimeline } from "../anim";
import { C, EASE_CAMERA } from "../theme";

// Finger tip position inside the 80 px icon.
const TIP = { x: 27, y: 7 };

// Hand pointer that travels along an eased curve to `target` (finger tip),
// presses at `tapAt`, then fades. Coordinates are in the parent's space.
export const Pointer: React.FC<{
  target: { x: number; y: number };
  inAt: number;
  arriveAt: number;
  outAt: number;
  tapAt: number;
}> = ({ target, inAt, arriveAt, outAt, tapAt }) => {
  const { p, since } = useTimeline();
  const move = p(inAt, arriveAt - inAt, EASE_CAMERA);
  const show = p(inAt, 0.2) * (1 - p(outAt, 0.3));
  if (show <= 0) return null;
  const start = { x: target.x + 230, y: target.y + 320 };
  const ctrl = { x: target.x + 250, y: target.y + 60 };
  const u = 1 - move;
  const x = u * u * start.x + 2 * u * move * ctrl.x + move * move * target.x;
  const y = u * u * start.y + 2 * u * move * ctrl.y + move * move * target.y;
  const s = since(tapAt);
  const press = s >= 0 && s <= 0.26 ? Math.sin((s / 0.26) * Math.PI) : 0;
  return (
    <svg
      width={80}
      height={80}
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: x - TIP.x,
        top: y - TIP.y,
        opacity: show,
        scale: String(1 - press * 0.08),
        transformOrigin: `${TIP.x}px ${TIP.y}px`,
        filter: "drop-shadow(0 6px 10px rgba(29, 33, 37, 0.18))",
        overflow: "visible",
        zIndex: 5,
      }}
      fill={C.bg}
      stroke={C.ink}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 14V4a2 2 0 0 1 4 0v5a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L6 14z" />
      <path d="M10 9v2.5M14 10v2M18 11v1.5" fill="none" />
    </svg>
  );
};
