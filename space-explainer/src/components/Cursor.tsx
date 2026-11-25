import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../theme";

export type CursorKey = { x: number; y: number; t: number; click?: boolean };

/** How long a click ripple lives. The cursor dwells on its hotspot for this long after every click. */
export const RIPPLE_SECONDS = 0.45;

/**
 * Inserts a dwell after every click so the cursor stays on the ripple's
 * centre until the ripple has finished. The next move is compressed into the
 * time that is left before the next key.
 */
const withDwell = (keys: CursorKey[]): CursorKey[] => {
  const out: CursorKey[] = [];
  keys.forEach((k, i) => {
    out.push(k);
    const next = keys[i + 1];
    if (k.click && next && next.t > k.t + RIPPLE_SECONDS) {
      out.push({ x: k.x, y: k.y, t: k.t + RIPPLE_SECONDS });
    }
  });
  return out;
};

/** Cursor hotspot (arrow tip) at time t, in the coordinates of its parent. */
export const cursorPosAt = (rawKeys: CursorKey[], t: number) => {
  const keys = withDwell(rawKeys);
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
      return {
        x: (1 - p) * (1 - p) * a.x + 2 * (1 - p) * p * cx + p * p * b.x,
        y: (1 - p) * (1 - p) * a.y + 2 * (1 - p) * p * cy + p * p * b.y,
      };
    } else if (t > b.t) {
      x = b.x;
      y = b.y;
    }
  }
  return { x, y };
};

/**
 * Check used by scripts/check-timing.ts: at every frame of every click's
 * ripple, the distance between the ripple centre and the cursor hotspot.
 */
export const cursorClickReport = (keys: CursorKey[], fps = 60) =>
  keys
    .filter((k) => k.click)
    .map((k) => {
      let worst = 0;
      for (let f = 0; f <= Math.round(RIPPLE_SECONDS * fps); f++) {
        const p = cursorPosAt(keys, k.t + f / fps);
        worst = Math.max(worst, Math.hypot(p.x - k.x, p.y - k.y));
      }
      return { t: k.t, x: k.x, y: k.y, worst };
    });

/** Arrow tip inside the SVG, in SVG pixels (viewBox 24x30 drawn at 36x44, tip at 2,1). */
const TIP = { x: 3, y: 1.5 };

/** Standard arrow cursor moving on eased, gently curved paths, with a soft neutral click ripple centred on the hotspot. */
export const Cursor: React.FC<{ keys: CursorKey[]; opacity?: number; ripple?: "violet" | "neutral" }> = ({ keys, opacity = 1, ripple = "violet" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { x, y } = cursorPosAt(keys, t);
  const ripples = keys
    .filter((k) => k.click && t >= k.t && t <= k.t + RIPPLE_SECONDS)
    .map((k, i) => {
      const p = interpolate(t, [k.t, k.t + RIPPLE_SECONDS], [0, 1]);
      const size = 56;
      return (
        <div
          key={i}
          data-guard="ripple"
          style={{
            position: "absolute",
            left: k.x - size / 2,
            top: k.y - size / 2,
            width: size,
            height: size,
            borderRadius: "50%",
            border: ripple === "neutral" ? "2px solid rgba(13,18,36,0.28)" : "2px solid rgba(124,98,240,0.45)",
            background: ripple === "neutral" ? "rgba(13,18,36,0.12)" : "rgba(124,98,240,0.25)",
            transform: `scale(${0.25 + EASE(p) * 0.85})`,
            opacity: (1 - p) * opacity,
          }}
        />
      );
    });
  const pressed = keys.some((k) => k.click && t >= k.t && t <= k.t + 0.12);
  return (
    <>
      {ripples}
      <svg
        data-guard="cursor"
        width={36}
        height={44}
        viewBox="0 0 24 30"
        style={{
          position: "absolute",
          left: x - TIP.x,
          top: y - TIP.y,
          opacity,
          transform: `scale(${pressed ? 0.9 : 1})`,
          transformOrigin: `${TIP.x}px ${TIP.y}px`,
          filter: "drop-shadow(0 3px 6px rgba(13,18,36,0.3))",
        }}
      >
        <path
          d="M2 1 L2 23 L7.5 17.8 L11.2 26.5 L15 24.9 L11.4 16.4 L19 16.4 Z"
          fill="#0D1224"
          stroke="#FFFFFF"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};
