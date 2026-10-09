import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";

// Soft, slow-moving blurred mesh: cool slate, fog grey and a faint graphite depth.
// `t` drives the drift; `wash` (0→1) dissolves it into the flat off-white canvas.
export const MeshBackground: React.FC<{ t: number; wash?: number }> = ({ t, wash = 0 }) => {
  const blob = (cx: number, cy: number, r: number, color: string, phase: number): React.CSSProperties => ({
    position: "absolute",
    left: `${cx + 6 * Math.sin(t / 110 + phase)}%`,
    top: `${cy + 5 * Math.cos(t / 130 + phase)}%`,
    width: `${r}%`,
    height: `${r * 1.6}%`,
    translate: "-50% -50%",
    borderRadius: "50%",
    background: `radial-gradient(closest-side, ${color}, transparent)`,
  });
  return (
    <AbsoluteFill style={{ background: "#F1F5F9", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: "blur(60px)" }}>
        <div style={blob(22, 30, 70, "#E2E8F0", 0)} />
        <div style={blob(78, 70, 75, "#E2E8F0", 2.1)} />
        <div style={blob(62, 22, 50, "rgba(15,23,42,0.10)", 4.2)} />
        <div style={blob(30, 82, 45, "rgba(15,23,42,0.08)", 1.3)} />
        <div style={blob(50, 50, 55, "#F1F5F9", 3.3)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: COLORS.canvas, opacity: wash }} />
    </AbsoluteFill>
  );
};
