import React, { useMemo } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import type { Rect } from "../lib/guards";

/** Default text zones kept clear of stars and moon: TextBeat headline and centre title block. */
export const DEFAULT_TEXT_ZONES: Rect[] = [
  { x: 96, y: 96, w: 1350, h: 190 },
  { x: 420, y: 330, w: 1080, h: 520 },
];

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const inZone = (x: number, y: number, zones: Rect[], pad: number) =>
  zones.some(
    (z) =>
      x > z.x - pad &&
      x < z.x + z.w + pad &&
      y > z.y - pad &&
      y < z.y + z.h + pad,
  );

/** Image filter for the plate under a given night grade (0 day, 1 full night). */
export const nightFilter = (grade: number) =>
  `brightness(${1 - 0.65 * grade}) saturate(${1 - 0.2 * grade})`;

/**
 * Overlay half of NightGrade: #0F1A33 multiply tint up to 70 percent, 60 original
 * SVG stars with deterministic twinkle, and one original crescent moon on a gentle arc.
 */
export const NightOverlay: React.FC<{
  grade: number;
  zones?: Rect[];
  skyBottom?: number;
}> = ({ grade, zones = DEFAULT_TEXT_ZONES, skyBottom = 470 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  const stars = useMemo(() => {
    const out: {
      x: number;
      y: number;
      r: number;
      phase: number;
      speed: number;
      base: number;
    }[] = [];
    let i = 0;
    while (out.length < 60 && i < 2000) {
      const x = 110 + random(`star-x-${i}`) * 1700;
      const y = 110 + Math.pow(random(`star-y-${i}`), 1.3) * (skyBottom - 110);
      i++;
      if (inZone(x, y, zones, 24)) continue;
      out.push({
        x,
        y,
        r: 0.8 + random(`star-r-${i}`) * 1.6,
        phase: random(`star-p-${i}`) * Math.PI * 2,
        speed: 0.25 + random(`star-s-${i}`) * 0.5,
        base: 0.45 + random(`star-b-${i}`) * 0.55,
      });
    }
    return out;
  }, [zones, skyBottom]);

  const starOpacity = smooth(0.25, 0.85, grade);
  const moonOpacity = smooth(0.4, 0.95, grade);
  // Moon arc: travels slowly across the right of the sky over the sequence.
  const p = Math.min(1, frame / Math.max(1, durationInFrames));
  let mx = 1480 + 220 * p;
  let my = 250 - 70 * Math.sin(Math.PI * (0.25 + 0.5 * p));
  if (inZone(mx, my, zones, 60)) {
    mx = 1700;
    my = 200;
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COLOR.nightTint,
          mixBlendMode: "multiply",
          opacity: 0.7 * grade,
        }}
      />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <filter
            id="night-soft"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation={1.2} />
          </filter>
          <mask id="crescent">
            <rect x={-60} y={-60} width={120} height={120} fill="black" />
            <circle cx={0} cy={0} r={30} fill="white" />
            <circle cx={13} cy={-9} r={27} fill="black" />
          </mask>
          <radialGradient id="moon-glow">
            <stop offset="0%" stopColor="#FFF6DD" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FFF6DD" stopOpacity={0} />
          </radialGradient>
        </defs>
        <g opacity={starOpacity}>
          {stars.map((s, i) => {
            const tw =
              0.65 + 0.35 * Math.sin(t * s.speed * Math.PI * 2 + s.phase);
            return (
              <g key={i} opacity={s.base * tw}>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r * 2.2}
                  fill="#DCE8FF"
                  opacity={0.35}
                  filter="url(#night-soft)"
                />
                <circle cx={s.x} cy={s.y} r={s.r} fill="#F4F8FF" />
              </g>
            );
          })}
        </g>
        <g
          opacity={moonOpacity}
          transform={`translate(${mx} ${my}) rotate(-18)`}
        >
          <circle r={90} fill="url(#moon-glow)" />
          <rect
            x={-60}
            y={-60}
            width={120}
            height={120}
            fill="#FFF3D6"
            mask="url(#crescent)"
          />
        </g>
      </svg>
    </>
  );
};
