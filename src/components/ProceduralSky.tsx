import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, alpha} from '../theme';
import {Camera} from '../camera';
import {Grain} from './Atmosphere';
import {sec} from '../timeline';

/**
 * Soft cloud band from SVG feTurbulence (baseFrequency ~0.008, 4 octaves),
 * rendered at half resolution and scaled 2x (so the 20px blur reads as 40px).
 * Drifts horizontally via transform.
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
}> = ({id, seed, y, height, color, opacity, dx, rim}) => {
  const W = 1300; // half-res width (2600 px on screen)
  const H = height / 2;
  const layer = (fill: string, fid: string) => (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <filter id={fid} x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={seed} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.6 0 0 0 -1.15" />
          <feGaussianBlur stdDeviation={24} />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <linearGradient id={`${fid}-m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.35" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.7" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={fill} filter={`url(#${fid})`} mask={undefined} />
    </svg>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: -340,
        top: y,
        width: W,
        height: H,
        transformOrigin: '0 0',
        transform: `translateX(${dx}px) scale(2)`,
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)',
        maskImage: 'linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)',
      }}
    >
      {rim ? <div style={{position: 'absolute', left: 0, top: 6, opacity: opacity * 0.9}}>{layer(rim, `${id}-rim`)}</div> : null}
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
        <CloudLayer id="lil1" seed={3} y={-40} height={560} color="#fff" opacity={0.45} dx={-8 * t} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${p2.x}px, ${p2.y}px)`}}>
        <CloudLayer id="lil2" seed={11} y={340} height={520} color="#fff" opacity={0.52} dx={-18 * t - 120} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${p3.x}px, ${p3.y}px)`}}>
        <CloudLayer id="lil3" seed={27} y={660} height={560} color="#fff" opacity={0.6} dx={-32 * t - 240} />
      </div>
      <Vignette color={COLORS.spinnerViolet} strength={0.16} />
    </AbsoluteFill>
  );
};

/** Scene 8: dusk sky (navy -> violet -> magenta -> coral/peach horizon). */
export const DuskSky: React.FC<SkyProps & {frame: number; bloom?: number}> = ({t, cam, frame, bloom = 0}) => {
  const p1 = par(cam, 0.08);
  const p2 = par(cam, 0.18);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.inkNavy} 0%, ${COLORS.deepViolet} 45%, ${COLORS.magenta} 75%, ${COLORS.coral} 92%, ${COLORS.peach} 100%)`,
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', inset: 0, transform: `translate(${p1.x}px, ${p1.y}px)`}}>
        <CloudLayer id="dusk1" seed={7} y={180} height={480} color={COLORS.deepViolet} rim={COLORS.coral} opacity={0.35} dx={-10 * t} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${p2.x}px, ${p2.y}px)`}}>
        <CloudLayer id="dusk2" seed={19} y={520} height={520} color={COLORS.deepViolet} rim={COLORS.coral} opacity={0.35} dx={-24 * t - 200} />
      </div>
      {/* peach light bloom opening along the horizon */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% 100%, ${alpha(COLORS.peach, 0.85)} 0%, ${alpha(COLORS.coral, 0.4)} 40%, ${alpha(COLORS.coral, 0)} 75%)`,
          opacity: bloom,
          transformOrigin: '50% 100%',
          transform: `scaleX(${0.6 + 0.4 * bloom})`,
        }}
      />
      <Grain frame={frame} opacity={0.04} />
      <Vignette color={COLORS.inkNavy} strength={0.45} />
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
