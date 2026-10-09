import React from "react";
import { useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { RevealWords } from "./RevealText";

// A block of copy centred on the stage (scenes 1–4).
export const Line: React.FC<{
  children: React.ReactNode;
  size: number;
  weight: 400 | 500;
  style?: React.CSSProperties;
}> = ({ children, size, weight, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontSize: size,
      fontWeight: weight,
      lineHeight: 1.18,
      letterSpacing: "-0.025em",
      color: COLORS.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

// Multi-line masked reveal; the word stagger continues across line breaks.
export const RevealLines: React.FC<{ lines: string[]; start: number; staggerMs?: number; offsetY?: number }> = ({
  lines,
  start,
  staggerMs = 35,
  offsetY = 18,
}) => {
  const { fps } = useVideoConfig();
  const stagger = (staggerMs / 1000) * fps;
  let before = 0;
  return (
    <>
      {lines.map((l) => {
        const s = start + before * stagger;
        before += l.split(" ").length;
        return (
          <div key={l}>
            <RevealWords text={l} start={s} staggerMs={staggerMs} offsetY={offsetY} />
          </div>
        );
      })}
    </>
  );
};

export const StaticLines: React.FC<{ lines: string[] }> = ({ lines }) => (
  <>
    {lines.map((l) => (
      <div key={l}>{l}</div>
    ))}
  </>
);
