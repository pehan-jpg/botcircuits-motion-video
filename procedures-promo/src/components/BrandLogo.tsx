import React from "react";
import { Img, staticFile } from "remotion";

const RATIO = 1898 / 390;

// Official BotCircuits logo (icon + wordmark), unmodified.
export const BrandLogo: React.FC<{ height: number; style?: React.CSSProperties }> = ({
  height,
  style,
}) => (
  <Img
    src={staticFile("botcircuits-logo.png")}
    style={{ height, width: height * RATIO, display: "block", ...style }}
  />
);

export const BrandMark: React.FC<{ size: number; style?: React.CSSProperties }> = ({
  size,
  style,
}) => (
  <Img
    src={staticFile("bc-mark.png")}
    style={{ height: size, width: (size * 349) / 390, display: "block", ...style }}
  />
);
