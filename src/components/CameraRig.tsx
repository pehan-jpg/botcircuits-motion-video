import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Camera, cameraTransform} from '../camera';

/**
 * World layer seen through a camera. `dim` 0..1 dims and blurs the layer
 * (opacity 0.5, blur 3px) when it is the inactive side of a config/chat pan.
 */
export const CameraRig: React.FC<{cam: Camera; dim?: number; panning?: boolean; children: React.ReactNode}> = ({cam, dim = 0, panning = false, children}) => (
  <AbsoluteFill style={{overflow: 'hidden'}} data-pan={panning ? '1' : '0'}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        transformOrigin: '0 0',
        transform: cameraTransform(cam),
        opacity: 1 - 0.5 * dim,
        filter: dim > 0.01 ? `blur(${3 * dim}px)` : undefined,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

/** Blur-dissolve envelope for a scene's own content (in at the head, out at the tail). */
export const dissolve = (inP: number, outP: number): React.CSSProperties => {
  const b = 14 * (1 - inP) + 14 * outP;
  return {opacity: inP * (1 - outP), filter: b > 0.05 ? `blur(${b}px)` : undefined};
};

/** True while the camera is travelling (pans are exempt from the safe-area guard). */
export const isPanning = (camAtFrame: (f: number) => Camera, frame: number) => {
  const a = camAtFrame(frame);
  const b = camAtFrame(frame + 1);
  return Math.abs(a.x - b.x) > 0.6 || Math.abs(a.y - b.y) > 0.6 || Math.abs(a.scale - b.scale) > 0.0008;
};
