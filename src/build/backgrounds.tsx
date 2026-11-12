import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, alpha} from '../theme';
import {Camera} from '../camera';
import {Blob, Blobs} from '../components/Stage';

/**
 * Backgrounds of the Build scenes. Each is a pure function of
 * (seconds, camera, extra) so the next scene can render the previous
 * background at its last frame and dissolve from it (no hard cuts).
 */
type BgProps = {seconds: number; cam: Camera; wash?: number; reveal?: number};

const LimeWash: React.FC<{opacity: number; rise?: number; x?: string; y?: string; strength?: number}> = ({
  opacity,
  rise = 0,
  x = '88%',
  y = '96%',
  strength = 0.42,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 60% 65% at ${x} ${y}, ${alpha(COLORS.lime, strength)} 0%, ${alpha(COLORS.lime, 0)} 70%)`,
      opacity,
      transform: `translateY(${rise}px)`,
    }}
  />
);

// Scene 4 -------------------------------------------------------------------
const S4_BLOBS: Blob[] = [
  {x: 1500, y: 260, size: 1200, color: alpha(COLORS.mint, 0.55), drift: [-10, 4], depth: 0.6},
  {x: 300, y: 900, size: 1000, color: alpha(COLORS.mist, 0.9), drift: [8, -4], depth: 1.1},
];
export const Scene04Bg: React.FC<BgProps> = ({seconds, cam, wash = 0}) => (
  <AbsoluteFill style={{background: COLORS.white}}>
    <Blobs blobs={S4_BLOBS} seconds={seconds} cam={cam} />
    <LimeWash opacity={wash} rise={(1 - wash) * 220} />
  </AbsoluteFill>
);

// Scene 5 -------------------------------------------------------------------
const S5_BLOBS: Blob[] = [
  {x: 1550, y: 300, size: 1300, color: alpha(COLORS.white, 0.95), drift: [-12, 5], depth: 0.6},
  {x: 260, y: 820, size: 1100, color: alpha(COLORS.mint, 0.7), drift: [10, -6], depth: 1.0},
  {x: 1000, y: 1000, size: 900, color: alpha(COLORS.lime, 0.14), drift: [-6, -8], depth: 1.4},
];
export const Scene05Bg: React.FC<BgProps> = ({seconds, cam}) => (
  <AbsoluteFill style={{background: COLORS.mist}}>
    <Blobs blobs={S5_BLOBS} seconds={seconds} cam={cam} />
    <LimeWash opacity={1} strength={0.3} x="85%" y="100%" />
  </AbsoluteFill>
);

// Scene 6 -------------------------------------------------------------------
const S6_BLOBS: Blob[] = [
  {x: 1650, y: 980, size: 1100, color: alpha(COLORS.lime, 0.16), drift: [-8, -4], depth: 1.0},
  {x: 300, y: 250, size: 1100, color: alpha(COLORS.mint, 0.45), drift: [10, 4], depth: 0.5},
];
export const Scene06Bg: React.FC<BgProps> = ({seconds, cam}) => {
  // faint grid, moving with a fraction of the camera for depth (transform only)
  const gx = -((cam.x - 960) * 0.15) % 48;
  const gy = -((cam.y - 540) * 0.15) % 48;
  return (
    <AbsoluteFill style={{background: COLORS.white, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: -96,
          top: -96,
          width: 1920 + 192,
          height: 1080 + 192,
          backgroundImage: `linear-gradient(${alpha(COLORS.ink, 0.045)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(COLORS.ink, 0.045)} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          transform: `translate(${gx}px, ${gy}px)`,
        }}
      />
      <Blobs blobs={S6_BLOBS} seconds={seconds} cam={cam} />
      <LimeWash opacity={1} strength={0.3} />
    </AbsoluteFill>
  );
};

// Scene 7 -------------------------------------------------------------------
const S7_BLOBS: Blob[] = [
  {x: 1500, y: 300, size: 1200, color: alpha(COLORS.lime, 0.16), drift: [-10, 6], depth: 0.8},
  {x: 400, y: 900, size: 1100, color: alpha(COLORS.mint, 0.6), drift: [10, -5], depth: 0.5},
  {x: 1100, y: 1000, size: 800, color: alpha(COLORS.white, 0.9), drift: [-4, -10], depth: 1.3},
];
export const Scene07Bg: React.FC<BgProps> = ({seconds, cam}) => (
  <AbsoluteFill style={{backgroundColor: COLORS.white, backgroundImage: `linear-gradient(160deg, ${alpha(COLORS.lime, 0)} 35%, ${alpha(COLORS.lime, 0.18)} 100%)`}}>
    <Blobs blobs={S7_BLOBS} seconds={seconds} cam={cam} />
  </AbsoluteFill>
);

// Scene 8 -------------------------------------------------------------------
const S8_BLOBS: Blob[] = [
  {x: 1600, y: 200, size: 1200, color: alpha(COLORS.white, 0.45), drift: [-12, 6], depth: 0.7},
  {x: 250, y: 950, size: 1100, color: alpha(COLORS.mint, 0.8), drift: [12, -6], depth: 0.5},
  {x: 960, y: 560, size: 900, color: alpha(COLORS.white, 0.35), drift: [0, -6], depth: 1.3},
];
/** Publish gradient: lime -> mint, angle drifting 15deg (rotating layer). */
export const Scene08Bg: React.FC<BgProps> = ({seconds, cam}) => (
  <AbsoluteFill style={{background: COLORS.mint, overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        left: 960 - 1500,
        top: 540 - 1500,
        width: 3000,
        height: 3000,
        background: `linear-gradient(90deg, ${COLORS.lime} 30%, ${COLORS.mint} 70%)`,
        transform: `rotate(${120 + Math.min(seconds, 6) * 2.5}deg)`,
      }}
    />
    <Blobs blobs={S8_BLOBS} seconds={seconds} cam={cam} />
  </AbsoluteFill>
);

/** Dissolve helper: previous scene's background under this one. */
export const Dissolve: React.FC<{from: React.ReactNode; to: React.ReactNode; progress: number}> = ({from, to, progress}) => (
  <AbsoluteFill>
    {progress < 1 ? <AbsoluteFill>{from}</AbsoluteFill> : null}
    <AbsoluteFill style={{opacity: progress}}>{to}</AbsoluteFill>
  </AbsoluteFill>
);
