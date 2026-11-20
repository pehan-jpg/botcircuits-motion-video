import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, FONT, GLASS } from "../theme";

/** Frosted glass pill with a small spinner and a 28px label. */
export const StatusPill: React.FC<{
  label: string;
  spinning?: boolean;
  style?: React.CSSProperties;
}> = ({ label, spinning = true, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rot = ((frame / fps) * 360) / 0.9;
  return (
    <div
      data-guard="text"
      data-guard-label={`StatusPill: ${label}`}
      style={{
        ...GLASS,
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 26px 14px 20px",
        borderRadius: 999,
        fontFamily: FONT.sans,
        fontWeight: 600,
        fontSize: 28,
        color: COLOR.ink,
        boxShadow: "0 8px 30px rgba(13,18,36,0.10)",
        ...style,
      }}
    >
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        style={{ transform: `rotate(${spinning ? rot : 0}deg)` }}
      >
        <circle
          cx={12}
          cy={12}
          r={9}
          fill="none"
          stroke="rgba(13,18,36,0.15)"
          strokeWidth={3}
        />
        <path
          d="M12 3 A9 9 0 0 1 21 12"
          fill="none"
          stroke={COLOR.orbMid}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
      {label}
    </div>
  );
};
