import React from "react";
import { Img, staticFile } from "remotion";
import { INK } from "../constants";

export const LOGO_FILE = "botcircuits-logo.svg";
export const WORDMARK_FILE = "botcircuits-wordmark.svg";

/**
 * PLACEHOLDER aspect ratio for the wordmark (width / height).
 * Set to the real file's viewBox ratio once botcircuits-wordmark.svg is supplied.
 */
export const WORDMARK_ASPECT = 4.6;

/**
 * Placeholder: a dashed box with a cross, the conventional "asset goes here" mark.
 * It carries no words (rule: no words on screen except the title line) and is
 * labelled in code, in data attributes and in the render report instead.
 * Never a redrawn or invented logo.
 */
const Placeholder: React.FC<{ width: number; height: number; radius: number; label: string }> = ({
  width,
  height,
  radius,
  label,
}) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    data-placeholder={label}
    style={{ display: "block", overflow: "visible" }}
  >
    <title>{`PLACEHOLDER: ${label}`}</title>
    <rect
      x={1.5}
      y={1.5}
      width={width - 3}
      height={height - 3}
      rx={radius}
      fill="rgba(13,18,36,0.04)"
      stroke={INK}
      strokeOpacity={0.55}
      strokeWidth={3}
      strokeDasharray="10 8"
    />
    <path
      d={`M ${radius} ${radius} L ${width - radius} ${height - radius} M ${width - radius} ${radius} L ${radius} ${height - radius}`}
      stroke={INK}
      strokeOpacity={0.3}
      strokeWidth={2}
    />
  </svg>
);

/** The BotCircuits symbol, rendered in ink via a CSS mask (any source colour becomes ink). */
export const BrandSymbol: React.FC<{ size: number; available: boolean }> = ({ size, available }) => {
  if (!available) {
    return <Placeholder width={size} height={size} radius={size * 0.22} label={LOGO_FILE} />;
  }
  const url = `url("${staticFile(LOGO_FILE)}")`;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: INK,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
};

/** The BotCircuits wordmark (ink artwork, used as supplied). */
export const BrandWordmark: React.FC<{ height: number; available: boolean }> = ({ height, available }) => {
  const width = height * WORDMARK_ASPECT;
  if (!available) {
    return <Placeholder width={width} height={height} radius={12} label={WORDMARK_FILE} />;
  }
  return (
    <Img
      src={staticFile(WORDMARK_FILE)}
      style={{ width, height, objectFit: "contain", objectPosition: "left center", display: "block" }}
    />
  );
};
