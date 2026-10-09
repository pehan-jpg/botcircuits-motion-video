import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { COLORS, STAGE_H, STAGE_W, fontFamily } from "../theme";

// Logical 960×540 stage, scaled up to the composition size.
export const Stage: React.FC<{
  children: React.ReactNode;
  background?: string;
}> = ({ children, background = COLORS.canvas }) => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: STAGE_W,
          height: STAGE_H,
          transformOrigin: "0 0",
          scale: String(width / STAGE_W),
          fontFamily,
          color: COLORS.ink,
          fontWeight: 400,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
