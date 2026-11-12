import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, alpha, bob, kf, kfIO, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS, CAM_S4_END, FIELD, NIGHT_START_S5, ORB, ORB_S5_END, SKY5A_START_S4} from '../handoff';
import {camAt, CamKeys, toScreen, World} from '../components/Stage';
import {Backdrop} from '../components/Backdrop';
import {FallbackNight} from '../components/ProceduralSky';
import {FieldInput} from '../components/FieldInput';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {PetalSpinner} from '../components/PetalSpinner';
import {GlassPlate, PlateKind, PLATE_INFO} from '../components/GlassPlate';
import {typedCount, typingEnd} from '../components/TypingText';
import {CircleReveal} from '../components/CircleReveal';
import {Camera} from '../camera';
import {Sky5A} from './Scene04';

/** SCENE 5 (9 s): A typing (0 - 4.2 s), B the agent built as glass layers (4.2 - 9 s). */
export const S5_PROMPT = 'Build a customer service agent that can handle card related requests.';
export const AGENT_NAME = 'Card Support Agent';

const S5A_CAM: CamKeys = {
  t: [0, 1.4, 3.7, 4.2],
  x: [CAM_S4_END.x, 960, 960, 960],
  y: [CAM_S4_END.y, 540, 540, 540],
  s: [CAM_S4_END.scale, 1, 1.05, 1.05],
};
const TYPE_START = sec(0.7);
const PER_CHAR = 2.57; // ~23 characters per second so the line fits 0.7 - 3.7 s

// ---- part B --------------------------------------------------------------
const PLATES: PlateKind[] = ['instructions', 'skills', 'tools', 'memory'];
const LAND = [5.3, 5.85, 6.4, 6.95];
const GAP_Z = 90;
const STAGE = {x: 960, y: 700, persp: 2600};
const ORB_HOVER = {x: 960, y: 200};
const ORB_SHOW = {x: 960, y: 420};

/** Night backdrop with a violet glow (scene 5B; under scene 6's reveal). */
export const NightBg: React.FC<{t: number; cam: Camera}> = ({t, cam}) => (
  <AbsoluteFill>
    <Backdrop src={BACKDROPS.night5b} t={t} span={5} cam={cam} scrim="dark" pan={[4, -3]} fallback={<FallbackNight />} />
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, ${alpha(COLORS.glowViolet, 0.75)} 0%, ${alpha(COLORS.glowViolet, 0)} 45%)`}} />
  </AbsoluteFill>
);

/** Orb state through part B (also scene 6's first frame). */
export const orbS5 = (f: number) => {
  const grow = popIn(f, 4.35, 0.45, 1.04);
  const lift = kfIO(f, [4.8, 5.2], [0, 1]);
  const show = kfIO(f, [7.95, 8.35], [0, 1]);
  const toLeft = kfIO(f, [8.55, 8.98], [0, 1]);
  const pulseBeat = kf(f, [8.0, 8.12, 8.3], [1, 1.08, 1]);
  const x = 960 + (ORB_S5_END.cx - 960) * toLeft;
  const y0 = 540 + (ORB_HOVER.y - 540) * lift;
  const y1 = y0 + (ORB_SHOW.y - y0) * show;
  const y = y1 + (ORB_S5_END.cy - y1) * toLeft;
  const sc = (1 + (ORB_S5_END.scale - 1) * show) * pulseBeat;
  const idle = toLeft > 0 ? 0 : bob(f, 0, 6) * tween(f, 4.8, 5.2) * (1 - show);
  return {cx: x, cy: y + idle, scale: grow * sc, lift, show, toLeft};
};

export const Scene05: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  const cam = camAt(f, S5A_CAM);

  // ---- part A --------------------------------------------------------------
  const typedUntil = typingEnd(TYPE_START, S5_PROMPT.length, PER_CHAR);
  const clickPt = toScreen(camAt(sec(0.6), S5A_CAM), {x: FIELD.cx - FIELD.width / 2 + 260, y: FIELD.cy + 10});

  // ---- part B --------------------------------------------------------------
  const orb = orbS5(f);
  const tilt = kfIO(f, [4.8, 5.2, 7.95, 8.35], [0, 1, 1, 0]);
  const az = kfIO(f, [5.2, 7.8], [-28, -10]);
  const nudge = LAND.reduce((m, d) => m + kf(f, [d + 0.3, d + 0.38, d + 0.8], [0, 0.012, 0]), 0);
  const stScale = kfIO(f, [5.0, 7.8], [0.85, 0.92]) + nudge;
  const close = tween(f, 7.45, 7.8);
  const slab = tween(f, 7.75, 8.05);
  const ax = 58 * tilt;
  const plateZ = (k: number) => {
    const rise = kf(f, [LAND[k] - 0.45, LAND[k] - 0.08, LAND[k]], [-520, 8, 0]);
    return k * (GAP_Z + (10 - GAP_Z) * close) + rise;
  };
  const project = (z: number) => {
    const a = (ax * Math.PI) / 180;
    const zp = z * Math.cos(a);
    const k = STAGE.persp / (STAGE.persp - zp);
    return {x: STAGE.x, y: STAGE.y + -z * Math.sin(a) * k * stScale};
  };
  const ringR = (ORB.size / 2) * orb.scale + 18;
  const nameN = typedCount(f, sec(8.1), AGENT_NAME.length, 1.15, 'agent-name');

  return (
    <AbsoluteFill>
      {s < 4.65 ? <Sky5A t={s + (5 - SKY5A_START_S4)} cam={cam} /> : null}
      {s < 4.4 ? (
        <World cam={cam}>
          <FieldInput
            frame={f}
            text={S5_PROMPT}
            typeStart={TYPE_START}
            perChar={PER_CHAR}
            typingUntil={Math.max(typedUntil, sec(0.6))}
            focus={tween(f, 0.6, 0.8)}
            enterIn={tween(f, 3.7, 3.85)}
            enterPress={kf(f, [3.85, 3.92, 4.0], [0, 1, 0])}
            liftAt={3.98}
            collapse={tween(f, 4.05, 4.3)}
          />
        </World>
      ) : null}

      {s >= NIGHT_START_S5 ? (
        <CircleReveal cx={960} cy={540} progress={tween(f, 4.2, 4.6)}>
          <NightBg t={s - NIGHT_START_S5} cam={{x: 960, y: 540, scale: 1, rotation: 0}} />
        </CircleReveal>
      ) : null}

      {s >= 4.3 ? (
        <AbsoluteFill>
          {/* the glass stack (isometric) */}
          {s >= 4.7 && slab < 1 ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 1,
                height: 1,
                opacity: 1 - slab,
                transformStyle: 'preserve-3d',
                transform: `translate(${STAGE.x}px, ${STAGE.y + (ORB_HOVER.y + 40 - STAGE.y) * slab}px) scale(${stScale * (1 - 0.88 * slab)}) perspective(${STAGE.persp}px) rotateX(${ax}deg) rotateZ(${az * tilt}deg)`,
              }}
            >
              {PLATES.map((k, i) => {
                const z = plateZ(i);
                const vis = tween(f, LAND[i] - 0.3, LAND[i] - 0.15) * tween(f, 5.0, 5.2);
                return vis > 0 ? (
                  <div key={k} style={{position: 'absolute', left: 0, top: 0, opacity: vis, transformStyle: 'preserve-3d', transform: `translateZ(${z}px)`}}>
                    <GlassPlate kind={k} frame={f} land={LAND[i]} />
                  </div>
                ) : null;
              })}
            </div>
          ) : null}

          {/* beams from each landed plate up to the orb, and the ring arcs */}
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <defs>
              <filter id="beamGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={6} />
              </filter>
            </defs>
            {PLATES.map((k, i) => {
              const d = LAND[i] + 0.3;
              const draw = tween(f, d, d + 0.25);
              const fade = 1 - tween(f, d + 0.45, d + 0.8);
              if (draw <= 0 || fade <= 0) return null;
              const p = project(plateZ(i));
              const top = orb.cy + ringR;
              const y = p.y - (p.y - top) * draw;
              const c = PLATE_INFO[k].edge;
              return (
                <g key={k} opacity={fade}>
                  <line x1={p.x} x2={p.x} y1={p.y} y2={y} stroke={c} strokeWidth={10} filter="url(#beamGlow)" opacity={0.8} />
                  <line x1={p.x} x2={p.x} y1={p.y} y2={y} stroke={COLORS.white} strokeWidth={3} strokeLinecap="round" />
                </g>
              );
            })}
            {PLATES.map((k, i) => {
              const draw = tween(f, LAND[i] + 0.5, LAND[i] + 0.75) * (1 - tween(f, 7.95, 8.2));
              if (draw <= 0) return null;
              const a0 = ((-90 + i * 90 + 4) * Math.PI) / 180;
              const a1 = ((-90 + (i + 1) * 90 - 4) * Math.PI) / 180;
              const d = `M ${orb.cx + ringR * Math.cos(a0)} ${orb.cy + ringR * Math.sin(a0)} A ${ringR} ${ringR} 0 0 1 ${orb.cx + ringR * Math.cos(a1)} ${orb.cy + ringR * Math.sin(a1)}`;
              return (
                <path key={k} d={d} fill="none" stroke={PLATE_INFO[k].edge} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
              );
            })}
          </svg>

          <PetalSpinner
            cx={orb.cx}
            cy={orb.cy}
            radius={170}
            ringRadius={104}
            frame={f}
            opacity={tween(f, 4.4, 4.6) * (1 - tween(f, 5.12, 5.22))}
            converge={tween(f, 4.8, 5.2)}
          />
          <Orb
            cx={orb.cx}
            cy={orb.cy}
            scale={orb.scale}
            pulse={LAND.reduce((m, d) => (s >= d + 0.55 && s < d + 1.05 ? tween(f, d + 0.55, d + 1.05) : m), 0)}
            whiteRing={kf(f, [7.95, 8.2, 8.5, 8.8], [0, 1, 1, 0])}
            check={tween(f, 8.05, 8.35) * (1 - tween(f, 8.55, 8.8))}
          />
          <div
            style={{
              position: 'absolute',
              left: 960 - 500,
              width: 1000,
              top: ORB_SHOW.y + 175,
              textAlign: 'center',
              fontFamily: FONT_SANS,
              fontWeight: 600,
              fontSize: 56,
              color: COLORS.white,
              whiteSpace: 'pre',
              opacity: 1 - tween(f, 8.55, 8.78),
              textShadow: '0 4px 18px rgba(13,18,36,0.45)',
            }}
          >
            {AGENT_NAME.slice(0, nameN)}
            <span style={{opacity: 0}}>{AGENT_NAME.slice(nameN)}</span>
          </div>
        </AbsoluteFill>
      ) : null}

      <Cursor
        frame={f}
        keys={[
          {t: 0, x: 1820, y: 1000},
          {t: 0.55, x: clickPt.x, y: clickPt.y},
          {t: 0.8, x: clickPt.x, y: clickPt.y},
          {t: 1.7, x: 1500, y: 1200},
        ]}
        clicks={[0.6]}
        rippleColor={COLORS.inkNavy}
        opacity={tween(f, 0, 0.2) * (1 - tween(f, 1.4, 1.7))}
      />
    </AbsoluteFill>
  );
};
