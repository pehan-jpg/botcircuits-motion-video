import React from "react";
import { interpolate } from "remotion";
import { GLIDE, ease } from "../theme";

export type CursorKey = { f: number; x: number; y: number };

export const cursorAt = (frame: number, keys: CursorKey[]) => {
  if (frame <= keys[0].f) return { x: keys[0].x, y: keys[0].y };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame <= b.f) {
      const opts = {
        extrapolateLeft: "clamp" as const,
        extrapolateRight: "clamp" as const,
        easing: GLIDE,
      };
      return {
        x: interpolate(frame, [a.f, b.f], [a.x, b.x], opts),
        y: interpolate(frame, [a.f, b.f], [a.y, b.y], opts),
      };
    }
  }
  const last = keys[keys.length - 1];
  return { x: last.x, y: last.y };
};

// Vector pointer with click feedback. `counterScale` keeps it a constant size under camera zoom.
export const Cursor: React.FC<{
  frame: number;
  keys: CursorKey[];
  clicks: number[];
  opacity: number;
  counterScale?: number;
}> = ({ frame, keys, clicks, opacity, counterScale = 1 }) => {
  const { x, y } = cursorAt(frame, keys);
  const press = clicks.reduce(
    (acc, c) => Math.min(acc, frame >= c - 3 && frame <= c + 6 ? ease(Math.abs(frame - c), [0, 4], [0.82, 1]) : 1),
    1,
  );
  const lastClick = clicks.filter((c) => frame >= c).pop();
  const ring = lastClick === undefined ? 0 : ease(frame, [lastClick, lastClick + 22], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity,
        scale: String(counterScale),
        transformOrigin: "0 0",
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      {lastClick !== undefined && ring < 1 ? (
        <div
          style={{
            position: "absolute",
            left: -14,
            top: -14,
            width: 28,
            height: 28,
            borderRadius: 14,
            border: "1.5px solid rgba(17,24,39,0.35)",
            scale: String(0.3 + ring * 0.9),
            opacity: 1 - ring,
          }}
        />
      ) : null}
      <svg
        width={16}
        height={20}
        viewBox="0 0 16 20"
        style={{ position: "absolute", left: -1, top: -1, scale: String(press), transformOrigin: "1px 1px", filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.25))" }}
      >
        <path
          d="M1 1 L1 15.5 L4.8 12 L7.4 18 L10 16.9 L7.5 11 L12.5 11 Z"
          fill="#111827"
          stroke="#FFFFFF"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
