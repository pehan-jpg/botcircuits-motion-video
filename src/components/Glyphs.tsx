import React from "react";
import { INK } from "../constants";

export type GlyphKind = "card" | "parcel" | "pin";

/**
 * Line glyphs drawn in ink. `draw` (0 to 1) reveals the strokes. All paths are
 * normalised with pathLength=1 so one dash value draws every stroke evenly.
 */
export const Glyph: React.FC<{ kind: GlyphKind; size: number; draw: number }> = ({ kind, size, draw }) => {
  const common = {
    fill: "none",
    stroke: INK,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - draw,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      {kind === "card" ? (
        <>
          <rect x={4} y={8} width={24} height={16} rx={3} {...common} />
          <path d="M4 13 H28" {...common} />
          <path d="M8 19.5 H14" {...common} />
        </>
      ) : null}
      {kind === "parcel" ? (
        <>
          <path d="M16 4.5 L27 10 V22 L16 27.5 L5 22 V10 Z" {...common} />
          <path d="M5 10 L16 15.5 L27 10" {...common} />
          <path d="M16 15.5 V27.5" {...common} />
          <path d="M10.5 7.3 L21.5 12.8" {...common} />
        </>
      ) : null}
      {kind === "pin" ? (
        <>
          <path d="M16 28 C16 28 7 19.5 7 13 A9 9 0 0 1 25 13 C25 19.5 16 28 16 28 Z" {...common} />
          <circle cx={16} cy={13} r={3.4} {...common} />
        </>
      ) : null}
    </svg>
  );
};

/** Generic microphone icon for the empty message field. */
export const MicIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round">
    <rect x={9} y={3} width={6} height={11} rx={3} />
    <path d="M5.5 11.5 A6.5 6.5 0 0 0 18.5 11.5" />
    <path d="M12 18 V21" />
  </svg>
);

/** Generic send (paper plane) icon. */
export const SendIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M3.4 20.4 L21 12 L3.4 3.6 L3.4 10.2 L15 12 L3.4 13.8 Z" />
  </svg>
);
