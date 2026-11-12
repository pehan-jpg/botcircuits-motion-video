import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, alpha, kf, popIn, tween} from '../theme';
import {BACKDROPS, BUILD_DURATIONS, NIGHT_START_S5, ORB_CENTER, ORB_S5_END} from '../handoff';
import {camAt, CamKeys, IDENTITY, toScreen, World} from '../components/Stage';
import {Backdrop} from '../components/Backdrop';
import {FallbackPeach, LilacSky} from '../components/ProceduralSky';
import {CircleReveal} from '../components/CircleReveal';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {LogoTile} from '../components/LogoTile';
import {VariableChip} from '../components/Chip';
import {StepRow, stepRowLayout, STEP} from '../components/StepRow';
import {Cubic, Pt, StrokeLine, cubicPoint} from '../components/StrokeLine';
import {GChat, GCheck, GLock, GPerson, GShieldCheck} from '../components/Glyphs';
import {NightBg} from './Scene05';

/** SCENE 6 (6 s) "Set the Procedure". */
const N = {
  ask: {x: 640, y: 540},
  verify: {x: 1240, y: 470},
  block: {x: 1840, y: 600},
  confirm: {x: 2440, y: 500},
  person: {x: 1560, y: 880},
};
const TILE = 200;
const seg = (a: Pt, b: Pt): Cubic => {
  const dx = b.x - a.x;
  return [a, {x: a.x + dx * 0.5, y: a.y}, {x: b.x - dx * 0.5, y: b.y}, b];
};
const SEGS: Cubic[] = [seg(N.ask, N.verify), seg(N.verify, N.block), seg(N.block, N.confirm)];
const BRANCH: Cubic = [N.verify, {x: N.verify.x + 260, y: N.verify.y + 60}, {x: N.person.x - 160, y: N.person.y - 40}, N.person];
const DRAW = [
  [0.6, 1.4],
  [3.45, 3.9],
  [4.0, 4.45],
] as const;
const BRANCH_T = [2.5, 3.0] as const;

const L = stepRowLayout();
const CARD = {left: N.verify.x - L.width / 2, top: 720};
const CHIP0 = {x: CARD.left + L.chip + L.chipW / 2, y: CARD.top + STEP.height / 2};
const CHIP_PARK = {x: N.block.x - 170, y: N.block.y - 10};

export const S6_CAM: CamKeys = {
  t: [0, 0.6, 1.4, 1.75, 2.05, 2.45, 2.9, 3.45, 3.9, 4.45, 4.6, 5.2, 5.98],
  x: [960, 960, 1240, 1500, CHIP0.x, 1500, 1400, 1400, 1800, 2350, 2380, 1540, 1540],
  y: [540, 540, 520, 700, CHIP0.y, 700, 660, 660, 580, 520, 520, 620, 620],
  s: [1, 1, 1.05, 1.35, 1.6, 1.1, 0.95, 0.95, 1.05, 1.05, 1.05, 0.5, 0.5],
};

const Label: React.FC<{p: Pt; text: string; opacity: number}> = ({p, text, opacity}) => (
  <div
    style={{
      position: 'absolute',
      left: p.x - 150,
      width: 300,
      top: p.y + TILE / 2 + 22,
      textAlign: 'center',
      fontFamily: FONT_SANS,
      fontWeight: 600,
      fontSize: 32,
      color: COLORS.ink,
      opacity,
    }}
  >
    {text}
  </div>
);

const Glow: React.FC<{p: Pt; v: number}> = ({p, v}) =>
  v > 0 ? (
    <div
      style={{
        position: 'absolute',
        left: p.x - 260,
        top: p.y - 260,
        width: 520,
        height: 520,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(COLORS.spinnerViolet, 0.55 * v)} 0%, ${alpha(COLORS.spinnerViolet, 0)} 62%)`,
      }}
    />
  ) : null;

export const Scene06: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  const cam = camAt(f, S6_CAM);

  const draws = DRAW.map(([a, b]) => tween(f, a, b));
  const branch = tween(f, BRANCH_T[0], BRANCH_T[1]);
  const labels = 1 - tween(f, 4.6, 4.95);
  const collapse = tween(f, 5.35, 5.85);
  const wave = kf(f, [4.85, 5.3], [0, 3]); // light travelling along the 3 segments
  const nodePulse = (i: number) => kf(f, [4.85 + i * 0.15, 4.95 + i * 0.15, 5.15 + i * 0.15], [1, 1.1, 1]);

  // nodes pop as the cursor reaches them
  const pops = {
    ask: popIn(f, 0.15, 0.4, 1.03),
    verify: popIn(f, 1.4, 0.35, 1.03),
    person: popIn(f, 3.0, 0.35, 1.03),
    block: popIn(f, 3.9, 0.35, 1.03),
    confirm: popIn(f, 4.45, 0.35, 1.03),
  };
  const glow = (t: number) => kf(f, [t, t + 0.2, t + 0.9], [0, 1, 0.35]) * (1 - collapse);

  // editor peek
  const cardIn = tween(f, 1.55, 1.85);
  const cardOut = tween(f, 2.2, 2.5);
  const chipGlow = kf(f, [1.95, 2.1, 2.4], [0, 1, 0]);
  const ride = tween(f, 2.1, 2.7);
  const rideCurve: Cubic = [CHIP0, {x: CHIP0.x + 120, y: CHIP0.y - 40}, {x: CHIP_PARK.x - 120, y: CHIP_PARK.y + 60}, CHIP_PARK];
  const chipPos = cubicPoint(rideCurve, ride);
  const chipIntoBlock = tween(f, 3.9, 4.1);

  // cursor: follows the drawn head during drags (screen space)
  const head = (i: number) => toScreen(cam, cubicPoint(SEGS[i], draws[i]));
  const at = (p: Pt) => toScreen(cam, p);
  let cur: Pt;
  if (s < 0.6) cur = at({x: N.ask.x + 30, y: N.ask.y + 20});
  else if (s < 1.45) cur = head(0);
  else if (s < 2.45) cur = at({x: N.verify.x + 30, y: N.verify.y + 20});
  else if (s < 3.05) cur = toScreen(cam, cubicPoint(BRANCH, branch));
  else if (s < 3.45) {
    const a = at(N.person);
    const b = at(N.verify);
    const k = tween(f, 3.05, 3.45);
    cur = {x: a.x + (b.x - a.x) * k + Math.sin(k * Math.PI) * 60, y: a.y + (b.y - a.y) * k};
  } else if (s < 3.95) cur = head(1);
  else if (s < 4.5) cur = head(2);
  else {
    const a = at(N.confirm);
    const k = tween(f, 4.5, 5.0);
    cur = {x: a.x + 300 * k, y: a.y + 420 * k};
  }

  const prevEnd = BUILD_DURATIONS.scene05 - 1;
  const lilacT = s - 5.3;
  const confirmScreen = at(N.confirm);
  const orbIn = kf(f, [5.55, 5.9], [0, ORB_CENTER.scale]);

  return (
    <AbsoluteFill>
      <NightBg t={prevEnd / fps - NIGHT_START_S5} cam={IDENTITY} />
      <CircleReveal cx={ORB_S5_END.cx} cy={ORB_S5_END.cy} progress={tween(f, 0, 0.7)}>
        <Backdrop src={BACKDROPS.peach6} t={s} span={6} cam={cam} scrim="light" pan={[-8, 2]} fallback={<FallbackPeach t={s} cam={cam} />} />
      </CircleReveal>
      <CircleReveal cx={confirmScreen.x} cy={confirmScreen.y} progress={tween(f, 5.3, 5.95)} ring={1 - tween(f, 5.8, 5.95)}>
        <LilacSky t={lilacT + 0} cam={IDENTITY} />
      </CircleReveal>

      <World cam={cam}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            opacity: 1 - collapse,
            transformOrigin: `${cam.x}px ${cam.y}px`,
            transform: `scale(${1 - collapse})`,
          }}
        >
          {/* path + human branch */}
          {SEGS.map((c, i) => (
            <StrokeLine key={i} curve={c} draw={draws[i]} color={COLORS.ink} width={6} dot={draws[i] > 0 && draws[i] < 1 ? draws[i] : undefined} dotSize={16} />
          ))}
          <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
            <defs>
              <mask id="branch-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={4000} height={2000}>
                <path
                  d={`M ${BRANCH[0].x} ${BRANCH[0].y} C ${BRANCH[1].x} ${BRANCH[1].y}, ${BRANCH[2].x} ${BRANCH[2].y}, ${BRANCH[3].x} ${BRANCH[3].y}`}
                  stroke="#fff"
                  strokeWidth={14}
                  fill="none"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - branch}
                />
              </mask>
            </defs>
            <path
              d={`M ${BRANCH[0].x} ${BRANCH[0].y} C ${BRANCH[1].x} ${BRANCH[1].y}, ${BRANCH[2].x} ${BRANCH[2].y}, ${BRANCH[3].x} ${BRANCH[3].y}`}
              stroke={COLORS.ink}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray="14 16"
              fill="none"
              mask="url(#branch-mask)"
            />
          </svg>
          {/* branch pulse */}
          <StrokeLine curve={BRANCH} draw={0} dot={tween(f, 3.1, 3.45)} dotOpacity={kf(f, [3.1, 3.15, 3.4, 3.45], [0, 1, 1, 0])} color={COLORS.spinnerViolet} dotSize={18} />
          {/* light wave along the whole path */}
          {wave > 0 && wave < 3 ? (
            <StrokeLine curve={SEGS[Math.min(2, Math.floor(wave))]} draw={0} dot={wave - Math.min(2, Math.floor(wave))} color={COLORS.white} dotSize={34} />
          ) : null}

          {/* nodes */}
          <Glow p={N.verify} v={glow(1.4)} />
          <Glow p={N.block} v={glow(3.9)} />
          <Glow p={N.confirm} v={glow(4.45)} />
          <LogoTile cx={N.ask.x} cy={N.ask.y} size={TILE} scale={pops.ask * nodePulse(0)}>
            <GChat size={100} color={COLORS.iconViolet} />
          </LogoTile>
          <LogoTile cx={N.verify.x} cy={N.verify.y} size={TILE} scale={pops.verify * nodePulse(1)} opacity={pops.verify > 0 ? 1 : 0}>
            <GShieldCheck size={100} color={COLORS.iconBlue} draw={tween(f, 1.5, 1.8)} />
          </LogoTile>
          <LogoTile cx={N.block.x} cy={N.block.y} size={TILE} scale={pops.block * nodePulse(2)} opacity={pops.block > 0 ? 1 : 0}>
            <GLock size={100} color={COLORS.coral} draw={tween(f, 4.0, 4.3)} />
          </LogoTile>
          <LogoTile cx={N.confirm.x} cy={N.confirm.y} size={TILE} scale={pops.confirm * nodePulse(3)} opacity={pops.confirm > 0 ? 1 : 0}>
            <GCheck size={100} color={COLORS.iconDeepBlue} stroke={2.6} draw={tween(f, 4.55, 4.85)} />
          </LogoTile>
          {/* the human in the loop */}
          <div
            style={{
              position: 'absolute',
              left: N.person.x - 80,
              top: N.person.y - 80,
              width: 160,
              height: 160,
              borderRadius: 80,
              background: COLORS.ink,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 24px 60px rgba(13,18,36,0.3)',
              opacity: pops.person > 0 ? 1 : 0,
              transform: `scale(${pops.person})`,
            }}
          >
            <GPerson size={78} color={COLORS.white} stroke={2.2} />
          </div>

          <Label p={N.ask} text="Ask" opacity={tween(f, 0.45, 0.8) * labels} />
          <Label p={N.verify} text="Verify" opacity={tween(f, 1.5, 1.8) * labels * (1 - cardIn * (1 - cardOut))} />
          <Label p={N.block} text="Block" opacity={tween(f, 4.0, 4.3) * labels} />
          <Label p={N.confirm} text="Confirm" opacity={tween(f, 4.55, 4.85) * labels} />
          <Label p={{x: N.person.x, y: N.person.y - 20}} text="Person" opacity={tween(f, 3.1, 3.4) * labels} />

          {/* real editor peek: one oversized row */}
          {s > 1.5 && s < 2.6 ? (
            <div
              style={{
                position: 'absolute',
                left: CARD.left,
                top: CARD.top,
                opacity: cardIn * (1 - cardOut),
                transform: `translateY(${(1 - cardIn) * 80 + cardOut * 60}px)`,
              }}
            >
              <StepRow glow={chipGlow} sweep={tween(f, 1.95, 2.3)} chipOpacity={s < 2.1 ? 1 : 0} />
            </div>
          ) : null}
          {/* the chip detaches and rides toward Block */}
          {s >= 2.1 && s < 4.1 ? (
            <div
              style={{
                position: 'absolute',
                left: chipPos.x,
                top: chipPos.y,
                transform: `translate(-50%, -50%) scale(${(1 - 0.35 * ride) * (1 - chipIntoBlock)})`,
              }}
            >
              <VariableChip name="card_last4" fontSize={32} glow={kf(f, [2.1, 2.3, 2.7], [1, 0.6, 0])} />
            </div>
          ) : null}
          {s >= 2.1 && s < 2.75 ? (
            <StrokeLine curve={rideCurve} draw={0} dot={Math.min(1, ride + 0.12)} color={COLORS.spinnerViolet} dotSize={16} />
          ) : null}
        </div>
      </World>

      {/* the orb re-forms at the centre as the path collapses into it */}
      {orbIn > 0 ? <Orb cx={ORB_CENTER.cx} cy={ORB_CENTER.cy} scale={orbIn} glow={0.6} /> : null}
      {/* scene-5 orb morphs into the Ask node */}
      {s < 0.6 ? (
        <Orb cx={ORB_S5_END.cx} cy={ORB_S5_END.cy} scale={kf(f, [0, 0.45], [1, 0.85])} opacity={1 - tween(f, 0.1, 0.45)} glow={0.7} />
      ) : null}

      <Cursor
        frame={f}
        keys={[{t: 0, x: cur.x, y: cur.y}]}
        clicks={[1.5]}
        hand={[[0.45, 4.55]]}
        rippleColor={COLORS.ink}
        opacity={tween(f, 0.35, 0.55) * (1 - tween(f, 4.6, 4.95))}
      />
    </AbsoluteFill>
  );
};
