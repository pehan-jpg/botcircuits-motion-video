import React from "react";
import { BRAND_LIME, sec } from "../constants";
import { tween } from "../anim";

export const UNDERLINE_THICKNESS = 6;
export const UNDERLINE_DRAW = sec(0.4);

/** 6px rounded lime rule that draws left to right over 0.4s with EASE. */
export const LimeUnderline: React.FC<{
  frame: number;
  startFrame: number;
  width: number;
  style?: React.CSSProperties;
}> = ({ frame, startFrame, width, style }) => {
  const p = tween(frame, [startFrame, startFrame + UNDERLINE_DRAW]);
  if (p <= 0) return null;
  const t = UNDERLINE_THICKNESS;
  return (
    <div
      data-guard="underline"
      style={{
        position: "absolute",
        height: t,
        borderRadius: t / 2,
        background: BRAND_LIME,
        width: t + (width - t) * p,
        opacity: Math.min(1, p * 8),
        ...style,
      }}
    />
  );
};
