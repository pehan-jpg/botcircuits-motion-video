import React from 'react';
import {AbsoluteFill, Img, getStaticFiles, staticFile} from 'remotion';
import {COLORS, alpha} from '../theme';
import {Camera} from '../camera';
import {WIDTH, HEIGHT} from '../timeline';

export const fileExists = (name: string): boolean => {
  try {
    return getStaticFiles().some((f) => f.name === name);
  } catch {
    return false;
  }
};

/**
 * Photographic backdrop: fills the frame at 120%, slow Ken Burns (1.1 -> 1.2
 * over `span` seconds), and moves with a fraction of the camera (parallax,
 * slower than the UI). Renders `fallback` when the image file is missing.
 */
export const Backdrop: React.FC<{
  src: string;
  t: number; // seconds since this backdrop appeared
  span: number;
  cam: Camera;
  scrim?: 'light' | 'dark' | null;
  pan?: [number, number]; // px per second
  fallback: React.ReactNode;
}> = ({src, t, span, cam, scrim = null, pan = [-6, -2], fallback}) => {
  const kb = 1.1 + 0.1 * Math.min(1, Math.max(0, t / span));
  const par = 0.18;
  const ps = 1 + (cam.scale - 1) * par;
  // never pan past the image edge: clamp to the margin the scale provides
  const mx = Math.max(0, ((kb * ps - 1) * WIDTH) / 2 - 4);
  const my = Math.max(0, ((kb * ps - 1) * HEIGHT) / 2 - 4);
  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
  const px = clamp(-(cam.x - WIDTH / 2) * par + pan[0] * t, mx);
  const py = clamp(-(cam.y - HEIGHT / 2) * par + pan[1] * t, my);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: COLORS.inkNavy}}>
      <AbsoluteFill style={{transform: `translate(${px}px, ${py}px) scale(${kb * ps}) rotate(${cam.rotation * par}deg)`}}>
        {fileExists(src) ? (
          <Img src={staticFile(src)} style={{width: WIDTH, height: HEIGHT, objectFit: 'cover'}} />
        ) : (
          fallback
        )}
      </AbsoluteFill>
      {scrim ? (
        <AbsoluteFill style={{background: scrim === 'light' ? alpha(COLORS.white, 0.08) : alpha(COLORS.ink, 0.2)}} />
      ) : null}
    </AbsoluteFill>
  );
};
