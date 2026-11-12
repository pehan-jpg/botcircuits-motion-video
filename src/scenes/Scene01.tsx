import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';
import {SEQUENCE_STARTS} from '../timeline';
import {DriftShapes, Grain, Shape} from '../components/Atmosphere';
import {SceneProps} from './types';

/**
 * SCENE 1 (0-120): "The customer reaches out".
 * Background: charcoal, soft radial gradient, 4% grain, drifting shapes.
 * The chat itself lives in ThreadStage (persistent across scenes).
 */
const SHAPES: Shape[] = [
  {x: 1500, y: 260, size: 1300, color: 'rgba(243,245,242,0.07)', drift: [-0.35, 0.12], depth: 0.9},
  {x: 260, y: 900, size: 1100, color: 'rgba(217,247,232,0.045)', drift: [0.3, -0.1], depth: 0.5},
  {x: 980, y: 1100, size: 900, color: 'rgba(138,145,144,0.08)', drift: [0.15, -0.2], depth: 1.3},
];

export const Scene01: React.FC<SceneProps> = ({layer}) => {
  const frame = useCurrentFrame();
  const globalFrame = frame + SEQUENCE_STARTS.scene01;
  if (layer === 'hud') return null;

  return (
    <AbsoluteFill style={{background: COLORS.charcoal}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 42% 38%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
      <DriftShapes shapes={SHAPES} frame={frame} globalFrame={globalFrame} />
      <Grain frame={frame} opacity={0.04} />
    </AbsoluteFill>
  );
};
