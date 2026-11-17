import React from "react";
import { INK } from "../constants";

export const MINT = "#23A06B";
export const MINT_SOFT = "#E4F7EE";

export const BoltIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path
      d="M13.2 2.5 5.4 13.1c-.3.4 0 .9.5.9h4.9l-1.3 7.2c-.1.6.6.9 1 .4l7.8-10.6c.3-.4 0-.9-.5-.9h-4.9l1.3-7.2c.1-.6-.6-.9-1-.4Z"
      fill={INK}
    />
  </svg>
);

export const PersonIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <circle cx={12} cy={8} r={4} fill={INK} />
    <path d="M4.5 20.2c0-4 3.4-6.7 7.5-6.7s7.5 2.7 7.5 6.7c0 .5-.4.8-.8.8H5.3c-.4 0-.8-.3-.8-.8Z" fill={INK} />
  </svg>
);

/** Check mark stroke; `draw` 0..1 draws it along its path. */
export const CheckIcon: React.FC<{ size: number; color: string; strokeWidth?: number; draw?: number }> = ({
  size,
  color,
  strokeWidth = 2.6,
  draw = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path
      d="M5.5 12.5 10 17l8.5-9.5"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - draw}
    />
  </svg>
);

/** Slow spinning petal spinner (eight capsules, fading tail). */
export const PetalSpinner: React.FC<{ size: number; color: string; rotation: number }> = ({
  size,
  color,
  rotation,
}) => (
  <svg width={size} height={size} viewBox="-12 -12 24 24" style={{ display: "block" }}>
    <g transform={`rotate(${rotation})`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x={-1.6}
          y={-11}
          width={3.2}
          height={6.4}
          rx={1.6}
          fill={color}
          opacity={0.25 + (0.75 * i) / 7}
          transform={`rotate(${i * 45})`}
        />
      ))}
    </g>
  </svg>
);

export const ClockIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <circle cx={12} cy={12} r={8.6} fill="none" stroke={INK} strokeWidth={2.2} />
    <path d="M12 7.4V12l3.2 2.1" fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Tiny knowledge stack glyph (three stacked layers). */
export const StackIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path d="M12 3.5 21 8l-9 4.5L3 8Z" fill={INK} />
    <path d="m3 12 9 4.5 9-4.5" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="m3 16 9 4.5 9-4.5" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
