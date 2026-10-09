import React from "react";
import { COLORS } from "../theme";
import { BrandLogo } from "./BrandLogo";

// Shared layout for scenes 1–3: logo at the top, status dot, one line of copy below.
export const LOGO_Y = 186;
export const DOT_Y = 258;
export const LINE_Y = 314;

export const LogoTop: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: LOGO_Y,
      display: "flex",
      justifyContent: "center",
      ...style,
    }}
  >
    <BrandLogo height={40} />
  </div>
);

// `lime` 0→1 switches the dot from neutral grey to Pigmented Lime.
export const StatusDot: React.FC<{ scale: number; lime: number; opacity: number }> = ({
  scale,
  lime,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      left: 480 - 4,
      top: DOT_Y - 4,
      width: 8,
      height: 8,
      borderRadius: 4,
      opacity,
      scale: String(scale),
      background: lime > 0.5 ? COLORS.lime : "#D1D5DB",
      boxShadow: `0 0 ${14 * lime}px ${4 * lime}px rgba(210,248,0,${0.55 * lime})`,
    }}
  />
);

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
