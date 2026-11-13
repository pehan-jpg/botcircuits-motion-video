import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Camera, cameraTransform} from '../camera';

/**
 * World layer seen through a camera. `dim` 0..1 dims and blurs the layer
 * (opacity 0.5, blur 3px) when it is the inactive side of a config/chat pan.
 */
export const CameraRig: React.FC<{cam: Camera; dim?: number; children: React.ReactNode}> = ({cam, dim = 0, children}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
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
