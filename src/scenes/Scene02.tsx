import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_MONO, ease} from '../theme';
import {BEATS, CLOCK_TIMES, SEQUENCE_STARTS} from '../timeline';
import {DriftShapes, Shape} from '../components/Atmosphere';
import {Roll} from '../components/Roll';
import {SceneProps} from './types';

/**
 * SCENE 2 (120-270): "One reply, then silence".
 * Background: cool desaturated slate with a faint diagonal light sweep.
 * HUD: self-drawing timeline with a marker + large ticking monospace clock.
 */
const SHAPES: Shape[] = [
  {x: 1600, y: 820, size: 1400, color: 'rgba(170,190,205,0.07)', drift: [-0.25, -0.08], depth: 0.8},
  {x: 300, y: 200, size: 1000, color: 'rgba(243,245,242,0.045)', drift: [0.2, 0.15], depth: 0.45},
  {x: 900, y: 600, size: 800, color: 'rgba(120,140,155,0.06)', drift: [-0.1, 0.1], depth: 1.25},
];

const LINE = {x1: 120, x2: 1800, y: 1006};
// Marker position (0..1 of the line) at each clock swap: proportional to the
// minutes elapsed (9:02 -> 9:14 -> 9:41 -> 10:05), so time visibly accelerates.
const MARKS = [0.02, 0.19, 0.6, 0.94];

export const Scene02: React.FC<SceneProps> = ({layer}) => {
  const frame = useCurrentFrame();
  const g = frame + SEQUENCE_STARTS.scene02;

  if (layer === 'background') {
    const sweep = ease(g, [114, 276], [-1500, 1900]);
    return (
      <AbsoluteFill style={{background: COLORS.slate, overflow: 'hidden'}}>
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 60% 45%, rgba(200,215,225,0.05) 0%, rgba(0,0,0,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: -700,
            width: 700,
            height: 2600,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(225,235,240,0.05) 50%, rgba(255,255,255,0) 100%)',
            transform: `translateX(${sweep}px) rotate(28deg)`,
          }}
        />
        <DriftShapes shapes={SHAPES} frame={frame} globalFrame={g} />
      </AbsoluteFill>
    );
  }

  // ---- HUD -----------------------------------------------------------------
  const [s0, s1, s2, s3] = BEATS.clockSwaps;
  const hudIn = ease(g, [s0, s0 + 10], [0, 1]);
  const head = ease(g, [s0, s0 + 12, s1, s2, s3, 270], [0, MARKS[0], MARKS[1], MARKS[2], MARKS[3], 0.97]);
  const len = LINE.x2 - LINE.x1;

  return (
    <AbsoluteFill>
      {/* scrim so the HUD reads over the thread */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(27,32,36,0) 62%, rgba(20,24,27,0.85) 100%)',
          opacity: hudIn,
        }}
      />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <line
          x1={LINE.x1}
          x2={LINE.x2}
          y1={LINE.y}
          y2={LINE.y}
          stroke="rgba(243,245,242,0.12)"
          strokeWidth={2}
          opacity={hudIn}
        />
        <line
          x1={LINE.x1}
          x2={LINE.x2}
          y1={LINE.y}
          y2={LINE.y}
          stroke={COLORS.mist}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - head}
          opacity={0.75}
        />
        {BEATS.clockSwaps.map((t, i) => {
          const p = ease(g, [t, t + 8], [0, 1]);
          return (
            <line
              key={t}
              x1={LINE.x1 + len * MARKS[i]}
              x2={LINE.x1 + len * MARKS[i]}
              y1={LINE.y - 12}
              y2={LINE.y + 12}
              stroke={COLORS.muted}
              strokeWidth={2}
              opacity={p}
              style={{transformBox: 'fill-box', transformOrigin: 'center', transform: `scaleY(${p})`}}
            />
          );
        })}
      </svg>
      {/* marker riding the head of the line */}
      <div
        style={{
          position: 'absolute',
          left: LINE.x1 - 9,
          top: LINE.y - 9,
          width: 18,
          height: 18,
          borderRadius: 9,
          background: COLORS.white,
          boxShadow: '0 0 0 6px rgba(255,255,255,0.08)',
          opacity: hudIn,
          transform: `translateX(${len * head}px)`,
        }}
      />
      {/* big clock, lower-right */}
      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 812,
          height: 140,
          display: 'flex',
          justifyContent: 'flex-end',
          fontFamily: FONT_MONO,
          fontSize: 128,
          fontWeight: 400,
          color: COLORS.mist,
          letterSpacing: '-0.02em',
          opacity: hudIn,
          transform: `translateY(${(1 - hudIn) * 16}px)`,
        }}
      >
        <Roll
          values={CLOCK_TIMES}
          at={BEATS.clockSwaps}
          frame={g}
          duration={10}
          lineHeight={140}
          charWidth={128 * 0.6 - 128 * 0.02}
          stagger={1}
        />
      </div>
    </AbsoluteFill>
  );
};
