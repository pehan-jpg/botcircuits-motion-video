import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Camera, cameraTransform} from '../camera';
import {kfIO} from '../theme';
import {WIDTH, HEIGHT} from '../timeline';
import {Pt} from './StrokeLine';

export const IDENTITY: Camera = {x: WIDTH / 2, y: HEIGHT / 2, scale: 1, rotation: 0};

/** Camera keyframes in seconds. Rotation optional. */
export type CamKeys = {t: number[]; x: number[]; y: number[]; s: number[]; r?: {t: number[]; v: number[]}};

export const camAt = (frame: number, k: CamKeys): Camera => ({
  x: kfIO(frame, k.t, k.x),
  y: kfIO(frame, k.t, k.y),
  scale: kfIO(frame, k.t, k.s),
  rotation: k.r ? kfIO(frame, k.r.t, k.r.v) : 0,
});

/** World -> screen for a camera (matches cameraTransform). */
export const toScreen = (c: Camera, p: Pt): Pt => {
  const r = (c.rotation * Math.PI) / 180;
  const dx = (p.x - c.x) * c.scale;
  const dy = (p.y - c.y) * c.scale;
  return {x: WIDTH / 2 + dx * Math.cos(r) - dy * Math.sin(r), y: HEIGHT / 2 + dx * Math.sin(r) + dy * Math.cos(r)};
};

/** A layer whose children are in world coordinates, seen through `cam`. */
export const World: React.FC<{cam: Camera; children: React.ReactNode}> = ({cam, children}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <div
      style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1, transformOrigin: '0 0', transform: cameraTransform(cam)}}
    >
      {children}
    </div>
  </AbsoluteFill>
);

export type Blob = {x: number; y: number; size: number; color: string; drift: [number, number]; depth: number};

/**
 * Large soft shapes drifting slowly (px per second) and moving opposite to
 * the camera for parallax. Radial gradients, no CSS blur.
 */
export const Blobs: React.FC<{blobs: Blob[]; seconds: number; cam: Camera}> = ({blobs, seconds, cam}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {blobs.map((b, i) => {
      const px = (cam.x - WIDTH / 2) * b.depth * 0.25 + b.drift[0] * seconds;
      const py = (cam.y - HEIGHT / 2) * b.depth * 0.25 + b.drift[1] * seconds;
      const sc = 1 - (cam.scale - 1) * b.depth * 0.35;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x - b.size / 2,
            top: b.y - b.size / 2,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 50% 50%, ${b.color} 0%, rgba(255,255,255,0) 68%)`,
            transform: `translate(${px}px, ${py}px) scale(${sc})`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);
