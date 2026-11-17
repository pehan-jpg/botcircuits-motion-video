import React from "react";

export const ORB_STOPS = ["#0B3B2C", "#14684A", "#23A06B", "#6FD3A4"] as const;
const REFERENCE_SIZE = 112;

/**
 * The orb's painted surface (gradient, specular, edge) without size or shadow,
 * so a parent can morph into it (the chat card uses this during the collapse).
 */
export const OrbSurface: React.FC<{ radius?: number | string }> = ({
  radius = "50%",
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: radius,
      background: `conic-gradient(from 210deg at 50% 50%, ${ORB_STOPS[0]}, ${ORB_STOPS[1]}, ${ORB_STOPS[2]}, ${ORB_STOPS[3]}, ${ORB_STOPS[2]}, ${ORB_STOPS[1]}, ${ORB_STOPS[0]})`,
    }}
  >
    {/* Soft top left specular highlight. */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: radius,
        background:
          "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.22) 22%, rgba(255,255,255,0) 46%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: radius,
        boxShadow: "inset 0 0 0 1px rgba(11,59,44,0.35)",
      }}
    />
  </div>
);

export const orbShadow = (size: number) => {
  // The spec shadow is tuned for the hero orb; small avatars get it scaled down.
  const k = Math.min(1, size / REFERENCE_SIZE);
  return `0 ${14 * k}px ${34 * k}px rgba(11,59,44,${0.35 * Math.max(0.6, k)})`;
};

export const Orb: React.FC<{
  size: number;
  scale?: number;
  /** 0 to 1 progress of a single halo ring pulse; 0 means no halo. */
  haloPulse?: number;
  style?: React.CSSProperties;
}> = ({ size, scale = 1, haloPulse = 0, style }) => {
  const haloOn = haloPulse > 0 && haloPulse < 1;
  return (
    <div
      data-guard="orb"
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {haloOn ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid rgba(35,160,107,0.55)",
            transform: `scale(${1 + 0.32 * haloPulse})`,
            opacity: 0.8 * (1 - haloPulse),
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: orbShadow(size),
        }}
      />
      <OrbSurface />
    </div>
  );
};
