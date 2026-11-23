import React, { useMemo } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { ORB_PALETTE } from "../theme";

export type SpaceOrbProps = {
  /** Diameter of the sphere in px. */
  size: number;
  /** Breathing tick ring around the sphere. */
  ticks?: boolean;
  /** Gentle breathing scale and glow. */
  pulse?: boolean;
  /** Seconds added to the local clock, so an orb carried across scenes stays continuous. */
  timeOffset?: number;
  style?: React.CSSProperties;
};

const conic = (deg: number) =>
  `conic-gradient(from ${deg}deg at 50% 50%, ${ORB_PALETTE.stops.map(([c, a]) => `${c} ${a}deg`).join(", ")})`;

/** Outer radius including the tick ring, for layout. */
export const spaceOrbOuterRadius = (size: number, ticks = true) =>
  ticks
    ? size / 2 + size * (ORB_PALETTE.tick.gap + ORB_PALETTE.tick.maxLen)
    : size / 2;

/**
 * The Space orb: violet knob style sphere, deterministic by frame.
 * Renders centred on its own box (width and height = size).
 */
export const SpaceOrb: React.FC<SpaceOrbProps> = ({
  size,
  ticks = false,
  pulse = false,
  timeOffset = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + timeOffset;
  const sheen =
    ORB_PALETTE.conicFrom + (360 * t) / ORB_PALETTE.sheenTurnSeconds;
  const breathe = pulse ? 1 + 0.018 * Math.sin((t / 3.2) * Math.PI * 2) : 1;
  const glow = pulse ? 0.5 + 0.5 * Math.sin((t / 3.2) * Math.PI * 2) : 0;
  const T = ORB_PALETTE.tick;
  const phases = useMemo(
    () =>
      new Array(T.count)
        .fill(0)
        .map((_, i) => random(`tick-${i}`) * Math.PI * 2),
    [T.count],
  );
  const shadowScale = Math.min(1, size / 160);

  const tickSvg = ticks
    ? (() => {
        const r0 = size / 2 + size * T.gap;
        const outer = r0 + size * T.maxLen + 4;
        return (
          <svg
            width={outer * 2}
            height={outer * 2}
            viewBox={`${-outer} ${-outer} ${outer * 2} ${outer * 2}`}
            style={{
              position: "absolute",
              left: size / 2 - outer,
              top: size / 2 - outer,
              overflow: "visible",
            }}
          >
            {phases.map((ph, i) => {
              const a = (i / T.count) * Math.PI * 2 - Math.PI / 2;
              // Slow deterministic noise: two sines with a per tick phase, smoothed across neighbours.
              const n =
                0.5 +
                0.32 * Math.sin((t / T.noiseSeconds) * Math.PI * 2 + ph) +
                0.18 *
                  Math.sin(
                    (t / (T.noiseSeconds * 1.7)) * Math.PI * 2 + i * 0.55,
                  );
              const len =
                size *
                (T.minLen +
                  (T.maxLen - T.minLen) * Math.max(0, Math.min(1, n)));
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * r0}
                  y1={Math.sin(a) * r0}
                  x2={Math.cos(a) * (r0 + len)}
                  y2={Math.sin(a) * (r0 + len)}
                  stroke={T.color}
                  strokeWidth={T.width}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        );
      })()
    : null;

  return (
    <div style={{ position: "relative", width: size, height: size, ...style }}>
      {tickSvg}
      {pulse ? (
        <div
          style={{
            position: "absolute",
            inset: -size * 0.18,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,100,255,0.22) 0%, rgba(124,100,255,0) 70%)",
            opacity: 0.6 + 0.4 * glow,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          overflow: "hidden",
          transform: `scale(${breathe})`,
          boxShadow: `0 ${24 * shadowScale}px ${48 * shadowScale}px rgba(60,40,140,0.28), inset 0 0 0 1px ${ORB_PALETTE.rim}`,
        }}
      >
        <div
          style={{ position: "absolute", inset: 0, background: conic(sheen) }}
        />
        {/* Brushed metal sheen: fine radial lines turning with the sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `repeating-conic-gradient(from ${sheen * 0.5}deg at 50% 50%, rgba(255,255,255,0.06) 0deg 0.8deg, rgba(0,0,0,0.05) 0.8deg 1.8deg)`,
            mixBlendMode: "overlay",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 35% 30%, ${ORB_PALETTE.highlight} 0%, rgba(255,255,255,0) 45%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(10,5,40,0) 55%, rgba(10,5,40,0.45) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: size * 0.17,
            top: size * 0.13,
            width: size * 0.28,
            height: size * 0.17,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.35)",
            filter: `blur(${Math.max(1, size * 0.04)}px)`,
            transform: "rotate(-28deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            boxShadow: `inset 0 0 0 1px ${ORB_PALETTE.rim}`,
          }}
        />
      </div>
    </div>
  );
};
