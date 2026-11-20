import React from "react";
import { Img, staticFile } from "remotion";
import { MIN_LOGO_PX } from "../theme";

const ASPECT = 1898 / 390;

/**
 * The BotCircuits logo, exactly as supplied. LogoGuard: always on white,
 * never below 28px high.
 */
export const Logo: React.FC<{
  height: number;
  style?: React.CSSProperties;
  padding?: number;
}> = ({ height, style, padding = 16 }) => {
  if (height < MIN_LOGO_PX) {
    console.warn(
      `[LogoGuard] logo height ${height}px is below ${MIN_LOGO_PX}px, clamped`,
    );
  }
  const h = Math.max(MIN_LOGO_PX, height);
  return (
    <div
      data-guard="logo"
      style={{
        background: "#FFFFFF",
        borderRadius: 999,
        padding: `${padding}px ${padding * 1.8}px`,
        boxShadow: "0 10px 30px rgba(13,18,36,0.10)",
        display: "inline-flex",
        ...style,
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{ height: h, width: h * ASPECT, display: "block" }}
      />
    </div>
  );
};
