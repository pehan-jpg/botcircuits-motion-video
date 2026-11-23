import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {orb} from '../tokens';

/**
 * Animated gradient orb. Two blurred conic layers counter rotate, each making
 * exactly one full turn over the composition, so the loop is seamless.
 * Rotation is driven only by the frame number: no pulse, no scale change.
 */
export const Orb: React.FC<{size?: number}> = ({size = 64}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const turn = (frame / durationInFrames) * 360;
  const stops = orb.stops.join(', ');

  // Layers overhang the circle so the blur's soft edge and the corners of
  // the rotating square both stay outside the clip.
  const overhang = Math.ceil(size * 0.25);
  const layer = (fromDeg: number, rotate: number, opacity = 1): React.CSSProperties => ({
    position: 'absolute',
    inset: -overhang,
    background: `conic-gradient(from ${fromDeg}deg, ${stops})`,
    filter: `blur(${orb.blur}px)`,
    transform: `rotate(${rotate}deg)`,
    opacity,
  });

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        boxShadow: orb.glow,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        <div style={layer(0, turn)} />
        <div style={layer(orb.secondLayerOffsetDeg, -turn, orb.secondLayerOpacity)} />
        <div style={{position: 'absolute', inset: 0, background: orb.highlight}} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1px solid ${orb.border}`,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};
