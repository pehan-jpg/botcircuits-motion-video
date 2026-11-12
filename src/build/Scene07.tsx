import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, popIn, tween} from '../theme';
import {ORB_CENTER} from '../handoff';
import {camAt, CamKeys, toScreen, World} from '../components/Stage';
import {DuskSky, LilacSky} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {LogoTile} from '../components/LogoTile';
import {LogoName} from '../components/logos';
import {Cubic, Pt, StrokeLine, cubicPoint} from '../components/StrokeLine';
import {Camera} from '../camera';

/** SCENE 7 (6 s) "Connect your systems". No text on screen. */
export const SYSTEMS: LogoName[] = ['salesforce', 'zendesk', 'hubspot', 'stripe', 'notion', 'google-drive', 'shopify', 'jira'];
export const S7_CAM: CamKeys = {
  t: [0, 0.8, 3.8, 4.5, 5.2, 5.98],
  x: [960, 960, 960, 960, 960, 960],
  y: [540, 540, 540, 500, 520, 540],
  s: [1, 0.95, 0.95, 1.45, 1.45, 1],
  r: {t: [0, 3.8, 4.5, 5.2], v: [0, 0, 1.5, 0]},
};
const RING_R = 380;
const TAPS = [1.0, 1.55, 2.1];
const LAUNCH = [...TAPS.map((t) => t + 0.05), 2.45, 2.65, 2.85, 3.05, 3.25];
const FLIGHT = [0.6, 0.6, 0.6, 0.45, 0.45, 0.45, 0.45, 0.45];
/** Screen points in the marquee where each tile launches from. */
const STARTS: Pt[] = [
  {x: 420, y: 318},
  {x: 1380, y: 792},
  {x: 1560, y: 288},
  {x: 260, y: 808},
  {x: 900, y: 330},
  {x: 1700, y: 760},
  {x: 640, y: 780},
  {x: 1180, y: 300},
];

const fromScreen = (c: Camera, p: Pt): Pt => ({x: c.x + (p.x - 960) / c.scale, y: c.y + (p.y - 540) / c.scale});

const Marquee: React.FC<{t: number; opacity: number; blur: number}> = ({t, opacity, blur}) => {
  const step = 180;
  const row = (y: number, dir: 1 | -1, offset: number) => {
    const shift = ((dir * 110 * t + offset) % (step * SYSTEMS.length) + step * SYSTEMS.length) % (step * SYSTEMS.length);
    return Array.from({length: 22}).map((_, i) => {
      const name = SYSTEMS[(i + (dir === 1 ? 3 : 0)) % SYSTEMS.length];
      return <LogoTile key={`${y}-${i}`} name={name} cx={-step * 4 + i * step + shift} cy={y} size={124} />;
    });
  };
  return (
    <AbsoluteFill style={{opacity, filter: `blur(${blur}px)`, transform: 'rotate(-4deg) scale(1.1)'}}>
      {row(330, -1, 0)}
      {row(770, 1, 90)}
    </AbsoluteFill>
  );
};

export const tileDock = (i: number): Pt => {
  const a = ((-90 + i * 45) * Math.PI) / 180;
  return {x: 960 + RING_R * Math.cos(a), y: 540 + RING_R * Math.sin(a)};
};

export const Scene07: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  const cam = camAt(f, S7_CAM);
  const spin = 10 * tween(f, 3.8, 5.2);
  const pullIn = (i: number) => tween(f, 5.2 + i * 0.03, 5.65 + i * 0.03);
  const lastDock = LAUNCH[7] + FLIGHT[7];
  const orbPulse = LAUNCH.reduce((m, l, i) => {
    const d = l + FLIGHT[i];
    return s >= d && s < d + 0.5 ? tween(f, d, d + 0.5) : m;
  }, 0);

  return (
    <AbsoluteFill>
      <LilacSky t={s + 0.7} cam={cam} />
      <AbsoluteFill style={{opacity: tween(f, 5.3, 5.98)}}>
        <DuskSky t={s - 5.3} cam={cam} frame={f} />
      </AbsoluteFill>

      <Marquee t={s} opacity={0.4 * tween(f, 0, 0.45) * (1 - tween(f, 2.0, lastDock))} blur={6 + 12 * tween(f, 2.0, lastDock)} />

      <World cam={cam}>
        {SYSTEMS.map((name, i) => {
          const L = LAUNCH[i];
          const d = L + FLIGHT[i];
          if (s < L) return null;
          const launchCam = camAt(Math.round(L * fps), S7_CAM);
          const from = fromScreen(launchCam, STARTS[i]);
          const dockA = tileDock(i);
          // slow ring rotation during the macro shot
          const ang = (Math.atan2(dockA.y - 540, dockA.x - 960) * 180) / Math.PI + spin;
          const dock = {x: 960 + RING_R * Math.cos((ang * Math.PI) / 180), y: 540 + RING_R * Math.sin((ang * Math.PI) / 180)};
          const fl = tween(f, L, d);
          const curve: Cubic = [from, {x: from.x, y: from.y + (540 - from.y) * 0.6}, {x: dock.x + (dock.x - 960) * 0.4, y: dock.y + (dock.y - 540) * 0.4}, dock];
          const p = cubicPoint(curve, fl);
          const k = pullIn(i);
          const q = {x: p.x + (960 - p.x) * k, y: p.y + (540 - p.y) * k};
          const line = tween(f, d, d + 0.3) * (1 - k);
          const settle = kf(f, [d, d + 0.12, d + 0.3], [1, 1.04, 1]);
          return (
            <React.Fragment key={name}>
              <StrokeLine
                curve={[q, q, {x: 960, y: 540}, {x: 960, y: 540}]}
                draw={line}
                dot={s > 3.9 && s < 5.1 ? (((s - 3.9 - i * 0.07) % 0.6) + 0.6) % 0.6 / 0.6 : undefined}
                dotOpacity={0.9}
                color={alpha(COLORS.ink, 0.45)}
                dotColor={COLORS.white}
                width={2}
                dotSize={10}
              />
              <LogoTile
                name={name}
                cx={q.x}
                cy={q.y}
                size={140}
                scale={kf(f, [L, L + 0.15], [0.85, 1]) * settle * (1 - k)}
                badge={popIn(f, d + 0.05, 0.3, 1.04)}
                badgeDraw={tween(f, d + 0.15, d + 0.4)}
              />
            </React.Fragment>
          );
        })}
        <Orb
          cx={ORB_CENTER.cx}
          cy={ORB_CENTER.cy}
          scale={ORB_CENTER.scale}
          pulse={orbPulse}
          glow={0.6}
          whiteGlow={tween(f, 5.35, 5.9)}
        />
      </World>

      <Cursor
        frame={f}
        keys={[
          {t: 0.4, x: 1960, y: 980},
          {t: 0.95, x: STARTS[0].x, y: STARTS[0].y},
          {t: 1.5, x: STARTS[1].x, y: STARTS[1].y},
          {t: 2.05, x: STARTS[2].x, y: STARTS[2].y},
          {t: 2.8, x: 1500, y: 1200},
        ]}
        clicks={TAPS}
        hand={[[0.8, 2.3]]}
        rippleColor={COLORS.white}
        opacity={tween(f, 0.4, 0.6) * (1 - tween(f, 2.5, 2.8))}
      />
    </AbsoluteFill>
  );
};

export const s7OrbScreen = () => toScreen(camAt(0, S7_CAM), {x: ORB_CENTER.cx, y: ORB_CENTER.cy});
