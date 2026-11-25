import React from "react";
import { COLOR, GLASS, HUMAN } from "../theme";

/**
 * The person who decides. Amber #F2A43A with halo #FFE2B3, on a white glass
 * disc so it reads on any plate. Use ONLY where a person decides.
 */
export const HumanGlyph: React.FC<{
  size?: number;
  style?: React.CSSProperties;
}> = ({ size = HUMAN.size, style }) => {
  const disc = size * 1.62;
  return (
    <div
      data-guard="decision"
      data-person="glyph"
      style={{
        width: disc,
        height: disc,
        borderRadius: "50%",
        ...GLASS,
        background: "rgba(255,255,255,0.82)",
        boxShadow: "0 10px 30px rgba(13,18,36,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="human-halo" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={4} />
          </filter>
        </defs>
        <g filter="url(#human-halo)" opacity={0.9}>
          <circle cx={32} cy={20} r={13} fill={COLOR.amberHalo} />
          <path
            d="M8 58 C8 42 18 35 32 35 C46 35 56 42 56 58 Z"
            fill={COLOR.amberHalo}
          />
        </g>
        <circle cx={32} cy={20} r={11} fill={COLOR.amber} />
        <path
          d="M11 57 C11 44 20 37.5 32 37.5 C44 37.5 53 44 53 57 Q53 59 51 59 L13 59 Q11 59 11 57 Z"
          fill={COLOR.amber}
        />
      </svg>
    </div>
  );
};
