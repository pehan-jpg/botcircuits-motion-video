import React from "react";

export type OrbProps = {
  size: number;
  scale?: number;
  /** 0..1, drives a soft halo ring that expands and fades. */
  haloPulse?: number;
  style?: React.CSSProperties;
};

export const Orb: React.FC<OrbProps> = ({ size, scale = 1, haloPulse = 0, style }) => {
  const haloScale = 1 + 0.55 * haloPulse;
  const haloOpacity = haloPulse > 0 ? 0.55 * (1 - haloPulse) : 0;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(111,211,164,0.55) 0%, rgba(35,160,107,0.25) 55%, rgba(35,160,107,0) 72%)",
          transform: `scale(${haloScale * 1.25})`,
          opacity: haloOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "conic-gradient(from 210deg, #0B3B2C, #14684A, #23A06B, #6FD3A4, #23A06B, #14684A, #0B3B2C)",
          border: "1px solid rgba(11,59,44,0.35)",
          boxShadow: "0 14px 34px rgba(11,59,44,0.35)",
          boxSizing: "border-box",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.28) 18%, rgba(255,255,255,0) 42%)",
          }}
        />
      </div>
    </div>
  );
};
