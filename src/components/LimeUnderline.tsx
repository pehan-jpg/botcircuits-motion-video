import React from "react";
import { useCurrentFrame } from "remotion";
import { BRAND_LIME, sec } from "../constants";
import { progress } from "../anim";

/** 6px rounded lime bar that draws left to right over 0.4s with EASE. */
export const LimeUnderline: React.FC<{
  startFrame: number;
  style?: React.CSSProperties;
}> = ({ startFrame, style }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, startFrame, startFrame + sec(0.4));
  return (
    <div
      style={{
        height: 6,
        borderRadius: 3,
        background: BRAND_LIME,
        transformOrigin: "left center",
        transform: `scaleX(${p})`,
        opacity: p > 0 ? 1 : 0,
        ...style,
      }}
    />
  );
};
