import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, alpha} from '../theme';
import {Camera} from '../camera';
import {Grain} from './Atmosphere';
import {sec} from '../timeline';

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/**
 * Smooth cloud band from SVG feTurbulence (baseFrequency 0.004, 5 octaves,
 * 60px blur at full resolution). Rendered at quarter resolution and scaled
 * 4x for speed. No compositing against the rect (that caused hard edges);
 * the band is faded top and bottom with a CSS mask and is wider than the
 * frame, so no rectangular edge is ever visible.
 */
export const CloudLayer: React.FC<{
  id: string;
  seed: number;
  y: number; // top of band (screen px)
  height: number; // band height (screen px)
  color: string;
  opacity: number;
  dx: number; // horizontal offset (px)
  rim?: string; // optional light catching the lower edges
  density?: number; // 0.8 - 1.4
}> = ({id, seed, y, height, color, opacity, dx, rim, density = 1}) => {
  const Q = 4;
  const W = 3200 / Q;
  const H = height / Q;
  const layer = (hex: string, fid: string) => {
    const [r, g, b] = rgb(hex);
    return (
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <filter id={fid} x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency={0.004 * Q} numOctaves={5} seed={seed} />
            <feColorMatrix type="matrix" values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  ${2.4 * density} 0 0 0 ${-0.95 * density}`} />
            <feGaussianBlur stdDeviation={60 / Q} />
          </filter>
        </defs>
        <rect width={W} height={H} filter={`url(#${fid})`} />
      </svg>
    );
  };
  const mask = 'linear-gradient(180deg, transparent 0%, #000 28%, #000 72%, transparent 100%)';
  return (
    <div
      style={{
        position: 'absolute',
        left: -640,
        top: y,
        width: W,
        height: H,
        transformOrigin: '0 0',
        transform: `translateX(${dx}px) scale(${Q})`,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      {rim ? <div style={{position: 'absolute', left: 0, top: 3, opacity: opacity * 0.8}}>{layer(rim, `${id}-rim`)}</div> : null}
      <div style={{position: 'absolute', left: 0, top: 0, opacity}}>{layer(color, id)}</div>
    </div>
  );
};

const Vignette: React.FC<{color: string; strength: number}> = ({color, strength}) => (
  <AbsoluteFill
    style={{background: `radial-gradient(ellipse 85% 80% at 50% 50%, ${alpha(color, 0)} 55%, ${alpha(color, strength)} 100%)`}}
  />
);

type SkyProps = {t: number; cam: Camera};
const par = (cam: Camera, k: number) => ({x: -(cam.x - 960) * k, y: -(cam.y - 540) * k});

/** Scene 4: warm cream with three drifting blurred blobs and 4% grain. */
export const CreamSky: React.FC<SkyProps & {frame: number}> = ({t, cam, frame}) => {
  const blobs = [
    {x: 1420, y: 300, size: 900, color: COLORS.peach, v: [-14, 6], k: 0.12},
    {x: 420, y: 760, size: 820, color: COLORS.lilac, v: [10, -5], k: 0.22},
    {x: 1180, y: 900, size: 640, color: COLORS.blush, v: [-6, -9], k: 0.32},
  ];
  return (
    <AbsoluteFill style={{background: COLORS.cream, overflow: 'hidden'}}>
      {blobs.map((b, i) => {
        const p = par(cam, b.k);
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
              background: b.color,
              opacity: 0.75,
              filter: 'blur(90px)',
              transform: `translate(${p.x + b.v[0] * t}px, ${p.y + b.v[1] * t}px)`,
            }}
          />
        );
      })}
      <Grain frame={frame} opacity={0.04} />
    </AbsoluteFill>
  );
};

/** Scene 7: lilac sky, three parallax cloud layers, subtle vignette. */
export const LilacSky: React.FC<SkyProps> = ({t, cam}) => {
  const p1 = par(cam, 0.06);
  const p2 = par(cam, 0.12);
  const p3 = par(cam, 0.2);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${COLORS.lilac} 0%, ${COLORS.lilacFloor} 100%)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${p1.x}px, ${p1.y}px)`}}>
        <CloudLayer id="lil1" seed={3} y={-80} height={620} color="#FFFFFF" opacity={0.45} dx={-8 * t} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${p2.x}px, ${p2.y}px)`}}>
        <CloudLayer id="lil2" seed={11} y={300} height={600} color="#FFFFFF" opacity={0.52} dx={-16 * t - 120} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${p3.x}px, ${p3.y}px)`}}>
        <CloudLayer id="lil3" seed={27} y={640} height={620} color="#FFFFFF" opacity={0.6} dx={-28 * t - 240} />
      </div>
      <Vignette color={COLORS.spinnerViolet} strength={0.14} />
    </AbsoluteFill>
  );
};

/** Scene 8 fallback: smooth dusk (navy -> violet -> magenta -> coral/peach). */
export const DuskSky: React.FC<SkyProps & {frame: number; bloom?: number}> = ({t, cam, bloom = 0}) => {
  const p1 = par(cam, 0.05);
  const p2 = par(cam, 0.1);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.inkNavy} 0%, ${COLORS.deepViolet} 42%, ${COLORS.magenta} 74%, ${COLORS.coral} 91%, ${COLORS.peach} 100%)`,
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', inset: 0, transform: `translate(${p1.x}px, ${p1.y}px)`}}>
        <CloudLayer id="dusk1" seed={7} y={120} height={560} color={COLORS.deepViolet} rim={COLORS.coral} opacity={0.35} dx={-8 * t} density={0.9} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${p2.x}px, ${p2.y}px)`}}>
        <CloudLayer id="dusk2" seed={19} y={480} height={560} color={COLORS.deepViolet} rim={COLORS.coral} opacity={0.35} dx={-18 * t - 200} density={0.9} />
      </div>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% 100%, ${alpha(COLORS.peach, 0.8)} 0%, ${alpha(COLORS.coral, 0.35)} 40%, ${alpha(COLORS.coral, 0)} 75%)`,
          opacity: bloom,
          transformOrigin: '50% 100%',
          transform: `scaleX(${0.6 + 0.4 * bloom})`,
        }}
      />
      <Vignette color={COLORS.inkNavy} strength={0.4} />
    </AbsoluteFill>
  );
};

/** Fast foreground cloud wisps (third parallax layer), white at ~20%. */
export const ForegroundClouds: React.FC<{t: number; cam: Camera; opacity?: number; y?: number; id?: string}> = ({t, cam, opacity = 0.2, y = 700, id = 'fg'}) => {
  const p = par(cam, 1.35);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', transform: `translate(${p.x}px, ${p.y}px)`}}>
      <CloudLayer id={id} seed={41} y={y} height={520} color="#FFFFFF" opacity={opacity} dx={-60 * t} density={0.85} />
    </AbsoluteFill>
  );
};

/** Procedural fallbacks for the image backdrops. */
export const FallbackPeriwinkle: React.FC<SkyProps> = ({t, cam}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, #7F86F2 0%, ${COLORS.periwinkle} 60%, ${COLORS.lilac} 100%)`}}>
    <CloudLayer id="fbp1" seed={5} y={260} height={600} color="#fff" opacity={0.6} dx={-10 * t + par(cam, 0.1).x} />
  </AbsoluteFill>
);
export const FallbackNight: React.FC = () => (
  <AbsoluteFill
    style={{background: `radial-gradient(ellipse 60% 50% at 50% 100%, #6A35C0 0%, ${COLORS.deepViolet} 45%, #03031F 100%)`}}
  />
);
export const FallbackPeach: React.FC<SkyProps> = ({t, cam}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, #D99BD0 0%, ${COLORS.blush} 40%, ${COLORS.peach} 100%)`}}>
    <CloudLayer id="fbpe" seed={9} y={420} height={640} color="#FFE6D2" opacity={0.7} dx={-10 * t + par(cam, 0.1).x} />
  </AbsoluteFill>
);

export const secondsOf = (frame: number) => frame / sec(1);
