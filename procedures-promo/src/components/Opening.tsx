import React from "react";
import { COLORS } from "../theme";

// Shared layout for scenes 1–4: a single centred line of copy on a clean canvas.
export const LINE_Y = 270;

export const Line: React.FC<{
  children: React.ReactNode;
  size: number;
  weight: 400 | 500;
  style?: React.CSSProperties;
}> = ({ children, size, weight, style }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: LINE_Y - size * 0.6,
      textAlign: "center",
      fontSize: size,
      fontWeight: weight,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      color: COLORS.ink,
      ...style,
    }}
  >
    {children}
  </div>
);
