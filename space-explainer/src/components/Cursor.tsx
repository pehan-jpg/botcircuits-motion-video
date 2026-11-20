import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../theme";

export type CursorKey = { x: number; y: number; t: number; click?: boolean };

/** Standard arrow cursor moving on eased, gently curved paths, with a soft click ripple. */
export const Cursor: React.FC<{ keys: CursorKey[]; opacity?: number }> = ({
  keys,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = EASE((t - a.t) / Math.max(0.001, b.t - a.t));
      // Quadratic curve with a perpendicular control offset.
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const cx = mx + (-dy / len) * len * 0.12;
      const cy = my + (dx / len) * len * 0.12;
      x = (1 - p) * (1 - p) * a.x + 2 * (1 - p) * p * cx + p * p * b.x;
      y = (1 - p) * (1 - p) * a.y + 2 * (1 - p) * p * cy + p * p * b.y;
    } else if (t > b.t) {
      x = b.x;
      y = b.y;
    }
  }
  const ripples = keys
    .filter((k) => k.click && t >= k.t && t <= k.t + 0.6)
    .map((k, i) => {
      const p = interpolate(t, [k.t, k.t + 0.6], [0, 1]);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: k.x - 30,
            top: k.y - 30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "2px solid rgba(59,111,224,0.6)",
            background: "rgba(140,200,255,0.18)",
            transform: `scale(${0.3 + EASE(p) * 0.9})`,
            opacity: 1 - p,
          }}
        />
      );
    });
  const pressed = keys.some((k) => k.click && t >= k.t && t <= k.t + 0.12);
  return (
    <>
      {ripples}
      <svg
        width={36}
        height={44}
        viewBox="0 0 24 30"
        style={{
          position: "absolute",
          left: x - 3,
          top: y - 2,
          opacity,
          transform: `scale(${pressed ? 0.9 : 1})`,
          transformOrigin: "3px 2px",
          filter: "drop-shadow(0 3px 6px rgba(13,18,36,0.3))",
        }}
      >
        <path
          d="M2 1 L2 23 L7.5 17.8 L11.2 26.5 L15 24.9 L11.4 16.4 L19 16.4 Z"
          fill="#FFFFFF"
          stroke="#0D1224"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};
