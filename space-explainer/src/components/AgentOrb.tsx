import React, { useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, ORB } from "../theme";

export type AgentOrbProps = {
  /** Core diameter in px (before lead scaling). */
  size: number;
  /** Lead "Space" orb: 1.3x with a double ring. */
  lead?: boolean;
  /** Hue shift for specialist orbs, clamped to plus or minus 25 degrees. */
  hueShift?: number;
  /** Soft outer glow, for the night grade. */
  nightGlow?: boolean;
  /** 0 to 1. Used for the colourless problem scene. */
  saturation?: number;
  /** Phase offset of the orbiting satellite, in turns. */
  phase?: number;
  /** 0 to 1: second ring of the lead orb grows in. */
  leadRing?: number;
  /** Seconds added to the local clock, so an orb carried across scenes keeps its satellite position. */
  timeOffset?: number;
  style?: React.CSSProperties;
};

/**
 * Ringed agent orb. SVG, deterministic by frame.
 * Core radial gradient #8CC8FF, #3B6FE0, #1B2A6B; 2px halo ring at 60 percent
 * with a soft glow; one 10px satellite orbiting every 6s.
 */
export const AgentOrb: React.FC<AgentOrbProps> = ({
  size,
  lead = false,
  hueShift = 0,
  nightGlow = false,
  saturation = 1,
  phase = 0,
  leadRing,
  timeOffset = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, "");
  const t = frame / fps + timeOffset;
  const ringT = leadRing ?? (lead ? 1 : 0);
  const scale = 1 + (ORB.leadScale - 1) * ringT;
  const d = size * scale;
  const r = d / 2;
  const ring1 = r + Math.max(9, d * 0.1);
  const ring2 = ring1 + Math.max(10, d * 0.11);
  const outer = (ringT > 0 ? ring2 : ring1) + ORB.satelliteSize + 18;
  const box = outer * 2;
  const angle = (t / ORB.satellitePeriodSeconds + phase) * Math.PI * 2;
  const satR = ringT > 0.5 ? ring2 : ring1;
  const sx = Math.cos(angle) * satR;
  const sy = Math.sin(angle) * satR;
  const breathe = 1 + 0.012 * Math.sin((t / 4 + phase) * Math.PI * 2);
  const hue = Math.max(-ORB.maxHueShift, Math.min(ORB.maxHueShift, hueShift));
  const filters = [
    hue !== 0 ? `hue-rotate(${hue}deg)` : "",
    saturation !== 1 ? `saturate(${saturation})` : "",
    nightGlow ? "drop-shadow(0 0 28px rgba(140,200,255,0.55))" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      width={box}
      height={box}
      viewBox={`${-outer} ${-outer} ${box} ${box}`}
      style={{ overflow: "visible", filter: filters || undefined, ...style }}
    >
      <defs>
        <radialGradient id={`core-${uid}`} cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor={COLOR.orbLight} />
          <stop offset="52%" stopColor={COLOR.orbMid} />
          <stop offset="100%" stopColor={COLOR.orbDeep} />
        </radialGradient>
        <radialGradient id={`spec-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </radialGradient>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={3} />
        </filter>
      </defs>
      {/* Halo ring with soft glow */}
      <circle
        r={ring1}
        fill="none"
        stroke={COLOR.orbLight}
        strokeWidth={6}
        opacity={0.28}
        filter={`url(#glow-${uid})`}
      />
      <circle
        r={ring1}
        fill="none"
        stroke={COLOR.orbLight}
        strokeWidth={2}
        opacity={0.6}
      />
      {ringT > 0 ? (
        <g opacity={ringT}>
          <circle
            r={ring2}
            fill="none"
            stroke={COLOR.orbLight}
            strokeWidth={6}
            opacity={0.22}
            filter={`url(#glow-${uid})`}
          />
          <circle
            r={ring2}
            fill="none"
            stroke={COLOR.orbLight}
            strokeWidth={2}
            opacity={0.6}
          />
        </g>
      ) : null}
      {/* Core */}
      <g transform={`scale(${breathe})`}>
        <circle r={r} fill={`url(#core-${uid})`} />
        <ellipse
          cx={-r * 0.3}
          cy={-r * 0.36}
          rx={r * 0.42}
          ry={r * 0.28}
          fill={`url(#spec-${uid})`}
        />
      </g>
      {/* Satellite */}
      <circle
        cx={sx}
        cy={sy}
        r={ORB.satelliteSize / 2 + 3}
        fill={COLOR.orbLight}
        opacity={0.35}
        filter={`url(#glow-${uid})`}
      />
      <circle cx={sx} cy={sy} r={ORB.satelliteSize / 2} fill="#DCEEFF" />
    </svg>
  );
};

/** Pixel radius of the outermost ring, for layout math. */
export const orbOuterRadius = (size: number, lead = false) => {
  const d = size * (lead ? ORB.leadScale : 1);
  const r = d / 2;
  const ring1 = r + Math.max(9, d * 0.1);
  const ring2 = ring1 + Math.max(10, d * 0.11);
  return (lead ? ring2 : ring1) + ORB.satelliteSize / 2 + 3;
};
