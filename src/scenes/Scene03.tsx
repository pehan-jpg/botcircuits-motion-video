import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_MONO, ease} from '../theme';
import {BEATS, SEQUENCE_STARTS} from '../timeline';
import {DriftShapes, Shape} from '../components/Atmosphere';
import {Roll} from '../components/Roll';
import {SceneProps} from './types';

/**
 * SCENE 3 (270-480): "Follow ups go unanswered".
 * Background: ink with a warm (#2A1F1A) vignette that deepens over time and a
 * slow ~4% brightness pulse. HUD: muted wait-counter chip, digits roll.
 * Everything freezes from BEATS.settle (470) so the last 10 frames are still.
 */
const SHAPES: Shape[] = [
  {x: 1550, y: 300, size: 1300, color: 'rgba(90,70,60,0.10)', drift: [-0.18, 0.08], depth: 0.8},
  {x: 320, y: 860, size: 1100, color: 'rgba(243,245,242,0.035)', drift: [0.16, -0.08], depth: 0.45},
  {x: 1000, y: 1000, size: 900, color: 'rgba(42,31,26,0.35)', drift: [0.08, -0.12], depth: 1.2},
];

const WAITS = ['1h 3m', '1h 38m', '2h 18m'] as const;

export const Scene03: React.FC<SceneProps> = ({layer}) => {
  const frame = useCurrentFrame();
  const raw = frame + SEQUENCE_STARTS.scene03;
  const g = Math.min(raw, BEATS.settle); // hold still for the last 10 frames
  const local = g - SEQUENCE_STARTS.scene03;

  if (layer === 'background') {
    const vignette = ease(g, [264, BEATS.settle], [0.25, 0.9]);
    const pulse = 0.5 - 0.5 * Math.cos(((g - 270) / 72) * Math.PI * 2); // ~2.4 s period
    return (
      <AbsoluteFill style={{background: COLORS.ink, overflow: 'hidden'}}>
        <DriftShapes shapes={SHAPES} frame={local} globalFrame={g} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(42,31,26,0) 30%, ${COLORS.warm} 100%)`,
            opacity: vignette,
          }}
        />
        {/* slow brighten / dim pulse, about 4% */}
        <AbsoluteFill style={{background: COLORS.white, opacity: 0.02 * pulse}} />
        <AbsoluteFill style={{background: '#000', opacity: 0.02 * (1 - pulse)}} />
      </AbsoluteFill>
    );
  }

  // ---- HUD: wait counter chip ------------------------------------------------
  const chipIn = ease(g, [BEATS.followUps[0] - 6, BEATS.followUps[0] + 6], [0, 1]);
  const chipOut = ease(g, [BEATS.compress, BEATS.compress + 18], [0, 1]);
  const FS = 32;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 84,
          height: 72,
          padding: '0 30px 0 26px',
          borderRadius: 36,
          background: COLORS.charcoal2,
          border: '1px solid rgba(255,255,255,0.16)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: FONT_MONO,
          fontSize: FS,
          color: COLORS.mist,
          opacity: chipIn * (1 - chipOut),
          transform: `translateY(${(1 - chipIn) * -14}px)`,
        }}
      >
        <span style={{width: 10, height: 10, borderRadius: 5, background: COLORS.muted}} />
        <span style={{lineHeight: '44px'}}>Waiting</span>
        <Roll values={WAITS} at={BEATS.followUps} frame={g} duration={10} lineHeight={44} charWidth={FS * 0.6} />
      </div>
    </AbsoluteFill>
  );
};
