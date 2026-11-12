import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, alpha, kf, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS, CAM_S4_END, FIELD, NIGHT_START_S5, ORB_S5_END, SKY5A_START_S4} from '../handoff';
import {camAt, CamKeys, toScreen, World} from '../components/Stage';
import {Backdrop} from '../components/Backdrop';
import {FallbackNight} from '../components/ProceduralSky';
import {FieldInput} from '../components/FieldInput';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {PetalSpinner} from '../components/PetalSpinner';
import {LogoTile} from '../components/LogoTile';
import {GBolt, GDocument, GSpark, GWrench} from '../components/Glyphs';
import {typedCount, typingEnd} from '../components/TypingText';
import {cubicPoint} from '../components/StrokeLine';
import {Camera} from '../camera';
import {CircleReveal} from '../components/CircleReveal';
import {Sky5A} from './Scene04';

/** SCENE 5 (8 s) "Describe the agent, and watch it get built". */
export const S5_PROMPT = 'Build a customer service agent that can handle card related requests.';
export const AGENT_NAME = 'Card Support Agent';

export const S5_CAM: CamKeys = {
  t: [0, 1.2, 3.7, 4.2, 4.9, 6.1, 7.55, 7.98],
  x: [CAM_S4_END.x, 960, 960, 960, 960, 960, 960, 960],
  y: [CAM_S4_END.y, 540, 540, 540, 520, 520, 520, 540],
  s: [CAM_S4_END.scale, 1, 1.08, 1.08, 1, 1.06, 1.12, 1],
  r: {t: [0, 4.2, 4.9, 6.1], v: [0, 0, 2, 0]},
};

const TYPE_START = sec(0.7);
const PER_CHAR = 2.57; // ~23 characters per second
const ORB_Y = 480;
const DOCK_R = 310;
const DOCKS = [3.6, 3.95, 4.3, 4.65].map((d) => d + 1.4); // 5.0, 5.35, 5.7, 6.05
const CAPS = [
  {Glyph: GDocument, color: COLORS.iconBlue, from: {x: -160, y: -160}, to: {x: 960, y: ORB_Y - DOCK_R}},
  {Glyph: GWrench, color: COLORS.iconOrange, from: {x: 2080, y: -160}, to: {x: 960 + DOCK_R, y: ORB_Y}},
  {Glyph: GSpark, color: COLORS.iconPink, from: {x: 2080, y: 1240}, to: {x: 960, y: ORB_Y + DOCK_R}},
  {Glyph: GBolt, color: COLORS.iconViolet, from: {x: -160, y: 1240}, to: {x: 960 - DOCK_R, y: ORB_Y}},
];

/** Night backdrop with a violet glow (scene 5B; under scene 6's reveal). */
export const NightBg: React.FC<{t: number; cam: Camera}> = ({t, cam}) => (
  <AbsoluteFill>
    <Backdrop src={BACKDROPS.night5b} t={t} span={5} cam={cam} scrim="dark" pan={[4, -3]} fallback={<FallbackNight />} />
    <AbsoluteFill
      style={{background: `radial-gradient(circle at 50% 46%, ${alpha(COLORS.glowViolet, 0.75)} 0%, ${alpha(COLORS.glowViolet, 0)} 45%)`}}
    />
  </AbsoluteFill>
);

/** Orb state in scene 5 (also used as scene 6's first frame). */
export const orbS5 = (f: number) => {
  const move = tween(f, 7.6, 7.98);
  const grow = popIn(f, 4.35, 0.45, 1.04);
  const pulseBeat = kf(f, [6.75, 6.9, 7.1], [1, 1.08, 1]);
  return {
    cx: 960 + (ORB_S5_END.cx - 960) * move,
    cy: 540 + (ORB_Y - 540) * tween(f, 4.35, 4.8) + (ORB_S5_END.cy - ORB_Y) * move,
    scale: grow * pulseBeat,
    pulse: DOCKS.reduce((m, d) => (f >= sec(d) && f < sec(d + 0.5) ? tween(f, d, d + 0.5) : m), 0),
    check: tween(f, 7.1, 7.4) * (1 - move),
  };
};

export const Scene05: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  // camera with a small nudge on every docking
  const base = camAt(f, S5_CAM);
  const nudge = DOCKS.reduce((m, d) => m + kf(f, [d, d + 0.08, d + 0.45], [0, 0.015, 0]), 0);
  const cam = {...base, scale: base.scale + nudge};

  // ---- Part A: field ---------------------------------------------------------
  const typedUntil = typingEnd(TYPE_START, S5_PROMPT.length, PER_CHAR);
  const clickCam = camAt(sec(0.6), S5_CAM);
  const clickPt = toScreen(clickCam, {x: FIELD.cx - FIELD.width / 2 + 220, y: FIELD.cy + 8});

  // ---- Part B: orb -----------------------------------------------------------
  const orb = orbS5(f);
  const retract = tween(f, 7.6, 7.9);
  const n = typedCount(f, sec(6.95), AGENT_NAME.length, 1.6, 'agent-name');

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

      {/* circular reveal into the night, from the dot */}
      {s >= NIGHT_START_S5 ? (
        <CircleReveal cx={960} cy={540} progress={tween(f, 4.2, 4.6)}>
          <NightBg t={s - NIGHT_START_S5} cam={cam} />
        </CircleReveal>
      ) : null}

      {s >= 4.3 ? (
        <World cam={cam}>
          <PetalSpinner
            cx={orb.cx}
            cy={orb.cy}
            radius={178}
            ringRadius={112}
            frame={f}
            opacity={tween(f, 4.55, 4.75) * (1 - tween(f, 6.7, 6.8))}
            converge={tween(f, 6.45, 6.75)}
          />
          {CAPS.map((c, i) => {
            const d = DOCKS[i];
            const fly = tween(f, d - 0.55, d);
            const ctrl1 = {x: c.from.x + (c.to.x - c.from.x) * 0.2 + (i % 2 ? -260 : 260), y: c.from.y + (c.to.y - c.from.y) * 0.7};
            const ctrl2 = {x: c.to.x + (i % 2 ? 160 : -160) * 0.6, y: c.to.y - (c.to.y - ORB_Y) * 0.2};
            const p = cubicPoint([c.from, ctrl1, ctrl2, c.to], fly);
            const q = {x: p.x + (orb.cx - p.x) * retract, y: p.y + (orb.cy - p.y) * retract};
            const settle = kf(f, [d, d + 0.12, d + 0.3], [1, 1.04, 1]);
            return (
              <LogoTile key={i} cx={q.x} cy={q.y} size={110} scale={settle * (1 - retract)} opacity={fly > 0 ? 1 : 0}>
                <c.Glyph size={58} color={c.color} stroke={2.2} />
              </LogoTile>
            );
          })}
          <Orb cx={orb.cx} cy={orb.cy} scale={orb.scale} pulse={orb.pulse} check={orb.check} glow={0.7} />
          <div
            style={{
              position: 'absolute',
              left: 960 - 400,
              width: 800,
              top: ORB_Y + 170,
              textAlign: 'center',
              fontFamily: FONT_SANS,
              fontWeight: 600,
              fontSize: 44,
              color: COLORS.white,
              whiteSpace: 'pre',
              opacity: 1 - tween(f, 7.55, 7.75),
              textShadow: '0 4px 18px rgba(13,18,36,0.45)',
            }}
          >
            {AGENT_NAME.slice(0, n)}
            <span style={{opacity: 0}}>{AGENT_NAME.slice(n)}</span>
          </div>
        </World>
      ) : null}

      <Cursor
        frame={f}
        keys={[
          {t: 0, x: 1820, y: 1000},
          {t: 0.55, x: clickPt.x, y: clickPt.y},
          {t: 0.75, x: clickPt.x, y: clickPt.y},
          {t: 1.6, x: 1500, y: 1180},
        ]}
        clicks={[0.6]}
        rippleColor={COLORS.ink}
        opacity={tween(f, 0, 0.2) * (1 - tween(f, 1.3, 1.6))}
      />
    </AbsoluteFill>
  );
};
