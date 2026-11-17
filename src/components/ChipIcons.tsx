import React from "react";
import { INK } from "../constants";

/** Eight petal activity spinner. Steps 12 times a second (deterministic). */
export const PetalSpinner: React.FC<{ size: number; time: number; color?: string }> = ({
  size,
  time,
  color = INK,
}) => {
  const step = Math.floor(time * 12);
  const petals = 8;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {Array.from({ length: petals }).map((_, i) => {
        const age = (((step - i) % petals) + petals) % petals;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: size / 2 - size * 0.07,
              top: 0,
              width: size * 0.14,
              height: size * 0.32,
              borderRadius: size * 0.07,
              background: color,
              opacity: 1 - (age / petals) * 0.82,
              transformOrigin: `${size * 0.07}px ${size / 2}px`,
              transform: `rotate(${(360 / petals) * i}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

export const MINT_FILL = "#23A06B";

/** Mint disc with a check that draws in. */
export const MintCheck: React.FC<{ size: number; draw: number }> = ({ size, draw }) => {
  const len = 20;
  return (
    <svg width={size} height={size} viewBox="0 0 26 26">
      <circle cx={13} cy={13} r={13} fill={MINT_FILL} />
      <path
        d="M7.6 13.4 L11.4 17.1 L18.6 9.4"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
    </svg>
  );
};
