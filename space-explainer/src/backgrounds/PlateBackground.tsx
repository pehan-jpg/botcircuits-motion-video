import React, { useMemo, useState } from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EASE } from "../theme";
import { PLATES, type PlateKey } from "../timeline";
import { NightOverlay, nightFilter } from "./NightGrade";
import type { Rect } from "../lib/guards";

/** Procedural fallback: a soft sky gradient with rolling hills, used only if a plate is missing. */
const PROCEDURAL: Record<PlateKey, { sky: string[]; hills: string[] }> = {
  "01": {
    sky: ["#A9BFE0", "#E9C9D6", "#F6B49A"],
    hills: ["#8E97A6", "#7F9184", "#7C9970"],
  },
  "02": {
    sky: ["#8EC3DE", "#D9E9EC", "#F3DFC4"],
    hills: ["#A8B7BE", "#8FB08A", "#7FAE68"],
  },
  "03": {
    sky: ["#A7CDEB", "#D8E9F5", "#EEF4F8"],
    hills: ["#AFC0D0", "#9CC08A", "#86BA62"],
  },
  "04": {
    sky: ["#8E86E0", "#D49BD8", "#F6A060"],
    hills: ["#55648F", "#4C6A66", "#5E8A50"],
  },
};

const ProceduralPlate: React.FC<{ plate: PlateKey }> = ({ plate }) => {
  const c = PROCEDURAL[plate];
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <linearGradient id={`sky-${plate}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.sky[0]} />
          <stop offset="70%" stopColor={c.sky[1]} />
          <stop offset="100%" stopColor={c.sky[2]} />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill={`url(#sky-${plate})`} />
      <path
        d="M0 600 C300 540 520 560 760 590 C1000 620 1240 540 1500 560 C1700 575 1820 600 1920 590 L1920 1080 L0 1080 Z"
        fill={c.hills[0]}
        opacity={0.7}
      />
      <path
        d="M0 690 C380 640 700 700 1000 670 C1300 640 1600 690 1920 660 L1920 1080 L0 1080 Z"
        fill={c.hills[1]}
      />
      <path
        d="M0 800 C500 760 900 820 1300 790 C1600 770 1800 800 1920 790 L1920 1080 L0 1080 Z"
        fill={c.hills[2]}
      />
    </svg>
  );
};

const PlateImage: React.FC<{ plate: PlateKey; filter?: string }> = ({
  plate,
  filter,
}) => {
  const [missing, setMissing] = useState(false);
  return (
    <AbsoluteFill style={{ filter }}>
      {missing ? (
        <ProceduralPlate plate={plate} />
      ) : (
        <Img
          src={staticFile(PLATES[plate])}
          onError={() => {
            console.warn(
              `[PlateBackground] plate ${plate} missing, using procedural fallback`,
            );
            setMissing(true);
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </AbsoluteFill>
  );
};

const FloatingDots: React.FC<{ count: number }> = ({ count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dots = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        x: 160 + random(`dot-x-${i}`) * 1600,
        y: 140 + random(`dot-y-${i}`) * 760,
        size: 8 + random(`dot-s-${i}`) * 6,
        ax: 18 + random(`dot-ax-${i}`) * 30,
        ay: 14 + random(`dot-ay-${i}`) * 24,
        sp: 0.03 + random(`dot-sp-${i}`) * 0.04,
        ph: random(`dot-ph-${i}`) * Math.PI * 2,
      })),
    [count],
  );
  return (
    <>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x + Math.sin(t * d.sp * Math.PI * 2 + d.ph) * d.ax,
            top:
              d.y -
              t * 6 +
              Math.cos(t * d.sp * Math.PI * 2 * 0.8 + d.ph) * d.ay,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "#FFFFFF",
            opacity: 0.4,
            filter: "blur(1.5px)",
          }}
        />
      ))}
    </>
  );
};

const GRAIN_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='256' height='256' filter='url(#n)'/></svg>`,
)}`;

/** 3 percent film grain. The tile shifts every frame, deterministically. */
export const FilmGrain: React.FC<{ opacity?: number }> = ({
  opacity = 0.03,
}) => {
  const frame = useCurrentFrame();
  const ox = Math.floor(random(`grain-x-${frame}`) * 256);
  const oy = Math.floor(random(`grain-y-${frame}`) * 256);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN_URI}")`,
        backgroundSize: "256px 256px",
        backgroundPosition: `${ox}px ${oy}px`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export type PlateBackgroundProps = {
  plate: PlateKey;
  /** Optional second plate to crossfade to. */
  to?: PlateKey;
  /** Frame at which the crossfade starts. */
  crossfadeAt?: number;
  crossfadeSeconds?: number;
  /** Ken Burns: scale from 1 to 1 + zoom (max 0.04) across `duration` frames. */
  zoom?: number;
  panX?: number;
  panY?: number;
  duration?: number;
  /** Strength of the soft legibility gradient, 0 to 1. */
  overlay?: number;
  dots?: number;
  grain?: number;
  /** NightGrade time value from 0 to 1. Undefined means no grade. */
  night?: number;
  nightZones?: Rect[];
};

export const PlateBackground: React.FC<PlateBackgroundProps> = ({
  plate,
  to,
  crossfadeAt = 0,
  crossfadeSeconds = 1.5,
  zoom = 0.03,
  panX = -14,
  panY = -6,
  duration,
  overlay = 0.5,
  dots = 8,
  grain = 0.03,
  night,
  nightZones,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const dur = duration ?? durationInFrames;
  const z = Math.min(0.04, zoom);
  const p = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: "clamp" });
  const kb = `translate(${panX * p}px, ${panY * p}px) scale(${1 + z * p})`;
  const mix = to
    ? EASE(
        interpolate(
          frame,
          [crossfadeAt, crossfadeAt + crossfadeSeconds * fps],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      )
    : 0;
  const nf = night !== undefined ? nightFilter(night) : undefined;
  const dotCount = Math.max(6, Math.min(10, dots));

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#DDE3EA" }}>
      <AbsoluteFill style={{ transform: kb, transformOrigin: "50% 60%" }}>
        <PlateImage plate={plate} filter={nf} />
        {to ? (
          <AbsoluteFill style={{ opacity: mix }}>
            <PlateImage plate={to} />
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
      {night !== undefined ? (
        <NightOverlay grade={night * (1 - mix)} zones={nightZones} />
      ) : null}
      {/* Soft legibility gradient: lifts the top band and the centre a little. */}
      <AbsoluteFill
        style={{
          opacity: overlay,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.0) 30%, rgba(255,255,255,0.0) 60%, rgba(255,255,255,0.18) 100%)",
        }}
      />
      <FloatingDots count={dotCount} />
      <FilmGrain opacity={grain} />
    </AbsoluteFill>
  );
};
