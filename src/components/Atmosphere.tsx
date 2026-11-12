import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {CAMERA_ORIGIN, getCamera} from '../camera';

export type Shape = {
  /** Screen-space centre at frame 0 of the scene. */
  x: number;
  y: number;
  size: number;
  color: string; // rgba recommended
  /** Slow autonomous drift in px per frame. */
  drift: [number, number];
  /** Parallax strength (opposite to the camera). */
  depth: number;
};

/**
 * Large, soft, blurred shapes drifting slowly and moving opposite to the
 * camera for depth. Uses radial gradients (cheap) instead of CSS blur.
 */
export const DriftShapes: React.FC<{shapes: Shape[]; frame: number; globalFrame: number}> = ({
  shapes,
  frame,
  globalFrame,
}) => {
  const cam = getCamera(globalFrame);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {shapes.map((s, i) => {
        const px = (cam.x - CAMERA_ORIGIN.x) * s.depth * 0.35 + s.drift[0] * frame;
        const py = (cam.y - CAMERA_ORIGIN.y) * s.depth * 0.2 + s.drift[1] * frame;
        const sc = 1 - (cam.scale - 1) * s.depth * 0.6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x - s.size / 2,
              top: s.y - s.size / 2,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 50% 50%, ${s.color} 0%, rgba(0,0,0,0) 68%)`,
              transform: `translate(${px}px, ${py}px) scale(${sc})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Film grain. The noise tile is static; it jitters via transform each frame. */
export const Grain: React.FC<{frame: number; opacity: number}> = ({frame, opacity}) => {
  const dx = Math.round((random(`gx${frame}`) - 0.5) * 120);
  const dy = Math.round((random(`gy${frame}`) - 0.5) * 120);
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity}}>
      <svg
        width={2160}
        height={1320}
        style={{position: 'absolute', left: -120, top: -120, transform: `translate(${dx}px, ${dy}px)`}}
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
