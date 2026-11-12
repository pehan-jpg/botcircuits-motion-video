import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, alpha, bob, kf, kfIO, popIn, tween} from '../theme';
import {BACKDROPS, BUILD_DURATIONS, NIGHT_START_S5, NODE_SLOTS, MARQUEE, ORB_CENTER, ORB_S5_END, marqueeSlot} from '../handoff';
import {camAt, CamKeys, IDENTITY, toScreen, World} from '../components/Stage';
import {Backdrop} from '../components/Backdrop';
import {FallbackPeach, ForegroundClouds, LilacSky} from '../components/ProceduralSky';
import {CircleReveal} from '../components/CircleReveal';
import {Cursor, CursorKey, cursorAt} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {LogoTile} from '../components/LogoTile';
import {Logo, LogoName} from '../components/logos';
import {VariableChip} from '../components/Chip';
import {StepRow, PEEK, peekLayout} from '../components/StepRow';
import {TypingDots} from '../components/TypingDots';
import {Cubic, Pt, StrokeLine, cubicPoint} from '../components/StrokeLine';
import {GChatBubble, GCheck, GLock, GPerson, GShieldCheck} from '../components/Glyphs';
import {NightBg} from './Scene05';

/** SCENE 6 (9 s) "Set the Procedure". */
const N = {
  ask: {x: 640, y: 540},
  verify: {x: 1460, y: 420},
  block: {x: 2280, y: 620},
  confirm: {x: 3100, y: 470},
  person: {x: 2020, y: 900},
};
const TILE = 260;
const ICON = 96;
const seg = (a: Pt, b: Pt): Cubic => {
  const dx = b.x - a.x;
  return [a, {x: a.x + dx * 0.55, y: a.y}, {x: b.x - dx * 0.55, y: b.y}, b];
};
const SEGS: Cubic[] = [seg(N.ask, N.verify), seg(N.verify, N.block), seg(N.block, N.confirm)];
const BRANCH: Cubic = [N.verify, {x: N.verify.x + 300, y: N.verify.y + 80}, {x: N.person.x - 260, y: N.person.y - 60}, N.person];
const DRAW: [number, number][] = [
  [1.25, 2.15],
  [6.05, 6.5],
  [6.6, 7.0],
];
const BRANCH_T: [number, number] = [4.75, 5.35];
const CLICK_VERIFY = 2.75;
const CLICK_BLOCK = 6.55;

export const S6_CAM: CamKeys = {
  t: [0, 1.0, 2.4, 2.6, 4.4, 4.6, 5.6, 6.0, 6.7, 7.35, 7.45, 8.2, 8.98],
  x: [960, 960, 1150, 1150, 1210, 1210, 1830, 1830, 2000, 2700, 2700, 1870, 1870],
  y: [540, 540, 490, 490, 470, 470, 680, 680, 600, 620, 620, 650, 650],
  s: [1, 1, 1, 1, 1.06, 1.06, 0.95, 0.95, 1, 1, 1, 0.55, 0.55],
  r: {t: [0, 8.2, 8.6, 8.98], v: [0, 0, -2.5, 0]},
};

/** Exit morph: node -> marquee slot, icon -> brand logo. */
const EXITS: {key: 'ask' | 'verify' | 'block' | 'confirm'; logo: LogoName}[] = [
  {key: 'ask', logo: NODE_SLOTS.ask.logo},
  {key: 'verify', logo: NODE_SLOTS.verify.logo},
  {key: 'block', logo: NODE_SLOTS.block.logo},
  {key: 'confirm', logo: NODE_SLOTS.confirm.logo},
];

const Label: React.FC<{p: Pt; text: string; opacity: number; size?: number}> = ({p, text, opacity, size = TILE}) => (
  <div
    style={{
      position: 'absolute',
      left: p.x - 200,
      width: 400,
      top: p.y + size / 2 + 22,
      textAlign: 'center',
      fontFamily: FONT_SANS,
      fontWeight: 600,
      fontSize: 40,
      color: COLORS.inkNavy,
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
        left: p.x - 320,
        top: p.y - 320,
        width: 640,
        height: 640,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(COLORS.spinnerViolet, 0.5 * v)} 0%, ${alpha(COLORS.spinnerViolet, 0)} 62%)`,
      }}
    />
  ) : null;

const icon = (key: string, f: number) => {
  if (key === 'ask')
    return (
      <div style={{position: 'relative', width: ICON, height: ICON}}>
        <GChatBubble size={ICON} color={COLORS.iconViolet} stroke={2} />
        <div style={{position: 'absolute', left: 26, top: 31}}>
          <TypingDots frame={f} size={10} gap={7} color={COLORS.iconViolet} />
        </div>
      </div>
    );
  if (key === 'verify') return <GShieldCheck size={ICON} color={COLORS.iconBlue} draw={tween(f, 2.25, 2.6)} />;
  if (key === 'block') return <GLock size={ICON} color={COLORS.coral} draw={tween(f, 6.6, 6.95)} />;
  return <GCheck size={ICON} color={COLORS.iconDeepBlue} stroke={2.6} draw={tween(f, 7.05, 7.4)} />;
};

export const Scene06: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  const cam = camAt(f, S6_CAM);

  const draws = DRAW.map(([a, b]) => tween(f, a, b) * (1 - tween(f, 8.2, 8.45)));
  const branch = tween(f, BRANCH_T[0], BRANCH_T[1]) * (1 - tween(f, 8.2, 8.4));
  const labels = 1 - tween(f, 7.45, 7.75);
  const wave = kf(f, [7.75, 8.2], [0, 3]);
  const nodePulse = (i: number) => kf(f, [7.75 + i * 0.15, 7.85 + i * 0.15, 8.05 + i * 0.15], [1, 1.1, 1]);
  const bobY = (i: number) => (s < 8.25 ? bob(f, i * 1.3, 6) : 0);
  const pops = {
    verify: popIn(f, 2.15, 0.4, 1.03),
    person: popIn(f, 5.35, 0.4, 1.03),
    block: popIn(f, 6.5, 0.4, 1.03),
    confirm: popIn(f, 7.0, 0.4, 1.03),
  };
  const glow = (t: number) => kf(f, [t, t + 0.25, t + 1.0], [0, 1, 0.35]) * (1 - tween(f, 8.2, 8.45));

  // ---- Ask: orb -> rounded-square tile -------------------------------------
  const m = kfIO(f, [0.1, 0.75], [0, 1]);

  // ---- editor peek -----------------------------------------------------------
  const cardIn = tween(f, 2.8, 3.2);
  const cardOut = tween(f, 4.25, 4.6);
  const push = kfIO(f, [3.2, 4.2], [1, 1.05]);
  const L = peekLayout();
  const CARD_C = {x: 960, y: 640};
  const chipLocal = {x: L.chip + L.chipW / 2 - PEEK.width / 2, y: 0};
  const chipScreen0 = {x: CARD_C.x + chipLocal.x * push, y: CARD_C.y + chipLocal.y * push};
  const rideA = kfIO(f, [4.2, 4.45], [0, 1]);
  const rideB = kfIO(f, [4.45, 5.0], [0, 0.4]);
  const merge = tween(f, 6.5, 6.65);
  const rideWorld = cubicPoint(SEGS[1], 0.2 + rideB);
  const rideScreen = toScreen(cam, rideWorld);
  const chipPos = {x: chipScreen0.x + (rideScreen.x - chipScreen0.x) * rideA, y: chipScreen0.y + (rideScreen.y - chipScreen0.y) * rideA};
  const chipScale = (1 + (0.5 * cam.scale - 1) * rideA) * (1 - merge);

  // ---- cursor (screen) ---------------------------------------------------------
  const at = (p: Pt, dx = 18, dy = 14) => {
    const q = toScreen(cam, p);
    return {x: q.x + dx, y: q.y + dy};
  };
  const head = (i: number) => toScreen(cam, cubicPoint(SEGS[i], tween(f, DRAW[i][0], DRAW[i][1])));
  let cur: Pt;
  if (s < 1.0) {
    const keys: CursorKey[] = [
      {t: 0.5, x: 1500, y: 1120},
      {t: 1.0, x: at(N.ask).x, y: at(N.ask).y},
    ];
    cur = cursorAt(f, keys);
  } else if (s < 1.25) cur = at(N.ask);
  else if (s < 2.15) cur = head(0);
  else if (s < 2.95) cur = at(N.verify);
  else if (s < 4.55) {
    const a = at(N.verify);
    const k = kfIO(f, [2.95, 3.35, 4.2, 4.55], [0, 1, 1, 0]);
    cur = {x: a.x + (1560 - a.x) * k, y: a.y + (980 - a.y) * k};
  } else if (s < 4.75) cur = at(N.verify);
  else if (s < 5.35) cur = toScreen(cam, cubicPoint(BRANCH, branch));
  else if (s < 5.7) cur = at(N.person, 30, 40);
  else if (s < 6.05) {
    const a = at(N.person, 30, 40);
    const b = at(N.verify);
    const k = kfIO(f, [5.7, 6.05], [0, 1]);
    cur = {x: a.x + (b.x - a.x) * k + Math.sin(k * Math.PI) * 80, y: a.y + (b.y - a.y) * k};
  } else if (s < 6.5) cur = head(1);
  else if (s < 6.6) cur = at(N.block);
  else if (s < 7.0) cur = head(2);
  else if (s < 7.4) cur = at(N.confirm);
  else {
    const a = at(N.confirm);
    const k = kfIO(f, [7.4, 7.9], [0, 1]);
    cur = {x: a.x + 360 * k, y: a.y + 520 * k};
  }

  const prevEnd = BUILD_DURATIONS.scene05 - 1;
  const lilac = tween(f, 8.3, 8.98);
  const orbIn = popIn(f, 8.55, 0.42, 1.04) * ORB_CENTER.scale;

  // nodes rendered in world until the exit, then in screen space
  const nodeWorld = (key: 'ask' | 'verify' | 'block' | 'confirm', i: number) => ({x: N[key].x, y: N[key].y + bobY(i)});

  return (
    <AbsoluteFill>
      <NightBg t={prevEnd / fps - NIGHT_START_S5} cam={IDENTITY} />
      <CircleReveal cx={ORB_S5_END.cx} cy={ORB_S5_END.cy} progress={kfIO(f, [0, 0.9], [0, 1])}>
        <Backdrop src={BACKDROPS.peach6} t={s} span={9} cam={cam} scrim="light" pan={[-6, 2]} fallback={<FallbackPeach t={s} cam={cam} />} />
      </CircleReveal>
      {lilac > 0 ? (
        <AbsoluteFill style={{opacity: lilac}}>
          <LilacSky t={s - 8.3} cam={IDENTITY} />
        </AbsoluteFill>
      ) : null}

      <World cam={cam}>
        {/* path, guide for the riding chip, human branch */}
        {s > 4.4 && s < 6.5 ? (
          <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1} opacity={tween(f, 4.4, 4.6) * 0.35}>
            <path
              d={`M ${SEGS[1][0].x} ${SEGS[1][0].y} C ${SEGS[1][1].x} ${SEGS[1][1].y}, ${SEGS[1][2].x} ${SEGS[1][2].y}, ${SEGS[1][3].x} ${SEGS[1][3].y}`}
              stroke={COLORS.inkNavy}
              strokeWidth={4}
              strokeDasharray="4 16"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        ) : null}
        {SEGS.map((c, i) => (
          <StrokeLine key={i} curve={c} draw={draws[i]} color={COLORS.inkNavy} width={6} dot={draws[i] > 0 && draws[i] < 1 && s < 8.2 ? draws[i] : undefined} dotSize={18} />
        ))}
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
          <defs>
            <mask id="branch-mask6" maskUnits="userSpaceOnUse" x={0} y={0} width={4000} height={2000}>
              <path
                d={`M ${BRANCH[0].x} ${BRANCH[0].y} C ${BRANCH[1].x} ${BRANCH[1].y}, ${BRANCH[2].x} ${BRANCH[2].y}, ${BRANCH[3].x} ${BRANCH[3].y}`}
                stroke="#fff"
                strokeWidth={16}
                fill="none"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - branch}
              />
            </mask>
          </defs>
          <path
            d={`M ${BRANCH[0].x} ${BRANCH[0].y} C ${BRANCH[1].x} ${BRANCH[1].y}, ${BRANCH[2].x} ${BRANCH[2].y}, ${BRANCH[3].x} ${BRANCH[3].y}`}
            stroke={COLORS.inkNavy}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="16 18"
            fill="none"
            mask="url(#branch-mask6)"
          />
        </svg>
        {/* handoff bubble travelling Verify -> Person */}
        {s > 5.35 && s < 5.85 ? (
          (() => {
            const p = cubicPoint(BRANCH, kfIO(f, [5.35, 5.8], [0, 1]));
            return (
              <div
                style={{
                  position: 'absolute',
                  left: p.x - 46,
                  top: p.y - 36,
                  width: 92,
                  height: 64,
                  borderRadius: '24px 24px 24px 6px',
                  background: COLORS.white,
                  boxShadow: '0 12px 30px rgba(13,18,36,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: kf(f, [5.35, 5.42, 5.75, 5.85], [0, 1, 1, 0]),
                }}
              >
                <TypingDots frame={f} size={10} gap={7} color={COLORS.inkNavy} />
              </div>
            );
          })()
        ) : null}
        {/* light wave along the path */}
        {wave > 0 && wave < 3 ? (
          <StrokeLine curve={SEGS[Math.min(2, Math.floor(wave))]} draw={0} dot={wave - Math.min(2, Math.floor(wave))} color={COLORS.white} dotSize={44} />
        ) : null}

        <Glow p={N.verify} v={glow(2.15)} />
        <Glow p={N.block} v={glow(6.5)} />
        <Glow p={N.confirm} v={glow(7.0)} />

        {/* Ask: the scene-5 orb morphing into a tile */}
        {s < 8.25 ? (
          <Orb
            cx={N.ask.x}
            cy={N.ask.y + bobY(0)}
            scale={ORB_S5_END.scale * nodePulse(0)}
            square={m}
            iconMix={kfIO(f, [0.3, 0.7], [0, 1])}
            light={m}
            glow={1 - m}
            ringOpacity={1 - m}
          >
            <div style={{transform: `scale(${1 / ORB_S5_END.scale})`}}>{icon('ask', f)}</div>
          </Orb>
        ) : null}
        {s < 8.25
          ? (['verify', 'block', 'confirm'] as const).map((k, i) => {
              const p = nodeWorld(k, i + 1);
              return (
                <LogoTile key={k} cx={p.x} cy={p.y} size={TILE} scale={pops[k] * nodePulse(i + 1)} opacity={pops[k] > 0 ? 1 : 0}>
                  {icon(k, f)}
                </LogoTile>
              );
            })
          : null}

        {/* the person node (human in the loop) */}
        <div
          style={{
            position: 'absolute',
            left: N.person.x - 100,
            top: N.person.y - 100 + bobY(5),
            width: 200,
            height: 200,
            borderRadius: 100,
            background: COLORS.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 24px 60px rgba(13,18,36,0.3)',
            opacity: (pops.person > 0 ? 1 : 0) * (1 - tween(f, 8.2, 8.45)),
            transform: `scale(${pops.person * (1 - 0.6 * tween(f, 8.2, 8.45))})`,
          }}
        >
          <GPerson size={96} color={COLORS.white} stroke={2.2} />
        </div>
        {s > 5.8 && s < 6.4 ? (
          <div
            style={{
              position: 'absolute',
              left: N.person.x - 100,
              top: N.person.y - 100 + bobY(5),
              width: 200,
              height: 200,
              borderRadius: 100,
              border: `4px solid ${alpha(COLORS.inkNavy, 0.6 * (1 - tween(f, 5.8, 6.4)))}`,
              transform: `scale(${1 + 0.8 * tween(f, 5.8, 6.4)})`,
            }}
          />
        ) : null}

        <Label p={{x: N.ask.x, y: N.ask.y + bobY(0)}} text="Ask" opacity={tween(f, 0.55, 0.9) * labels} />
        <Label p={nodeWorld('verify', 1)} text="Verify" opacity={tween(f, 2.25, 2.55) * labels} />
        <Label p={nodeWorld('block', 2)} text="Block" opacity={tween(f, 6.6, 6.9) * labels} />
        <Label p={nodeWorld('confirm', 3)} text="Confirm" opacity={tween(f, 7.1, 7.4) * labels} />
        <Label p={{x: N.person.x, y: N.person.y + bobY(5)}} size={200} text="Person" opacity={tween(f, 5.45, 5.75) * labels} />
      </World>

      {/* the four nodes lift off and glide into the scene-7 marquee */}
      {s >= 8.25
        ? EXITS.map(({key, logo}, i) => {
            const slot = NODE_SLOTS[key];
            const from = toScreen(camAt(Math.round(8.25 * fps), S6_CAM), N[key]);
            const to = marqueeSlot(slot.row, slot.slot, 0);
            const k = kfIO(f, [8.25 + i * 0.04, 8.9 + i * 0.02], [0, 1]);
            const lift = Math.sin(k * Math.PI) * -60;
            const size0 = TILE * camAt(Math.round(8.25 * fps), S6_CAM).scale;
            const sc = (size0 + (MARQUEE.size - size0) * k) / MARQUEE.size;
            const mix = tween(f, 8.45 + i * 0.03, 8.8 + i * 0.03);
            return (
              <div key={key}>
                <LogoTile cx={from.x + (to.x - from.x) * k} cy={from.y + (to.y - from.y) * k + lift} size={MARQUEE.size} scale={sc} rotate={MARQUEE.rotate * k}>
                  <div style={{position: 'relative', width: MARQUEE.size * 0.5, height: MARQUEE.size * 0.5}}>
                    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - mix}}>
                      <div style={{transform: `scale(${(MARQUEE.size * 0.5) / ICON})`}}>{icon(key, f)}</div>
                    </div>
                    <div style={{position: 'absolute', inset: 0, opacity: mix}}>
                      <Logo name={logo} size={MARQUEE.size * 0.5} />
                    </div>
                  </div>
                </LogoTile>
              </div>
            );
          })
        : null}

      {/* the orb appears at the centre as the tiles settle */}
      {orbIn > 0 ? <Orb cx={ORB_CENTER.cx} cy={ORB_CENTER.cy} scale={orbIn} light={1} /> : null}

      {/* the editor peek (in front of the camera) */}
      {s > 2.8 && s < 4.62 ? (
        <div
          style={{
            position: 'absolute',
            left: CARD_C.x - PEEK.width / 2,
            top: CARD_C.y - PEEK.height / 2,
            opacity: cardIn * (1 - cardOut),
            transformOrigin: `${PEEK.width / 2 + chipLocal.x}px ${PEEK.height / 2}px`,
            transform: `translateY(${(1 - cardIn) * 160 + cardOut * 140}px) scale(${push})`,
          }}
        >
          <StepRow glow={kf(f, [3.4, 3.7, 4.2], [0, 1, 0.4])} sweep={tween(f, 3.5, 3.95)} chipOpacity={s < 4.2 ? 1 : 0} />
        </div>
      ) : null}
      {/* the chip detaches and rides the path toward Block */}
      {s >= 4.2 && s < 6.65 ? (
        <div style={{position: 'absolute', left: chipPos.x, top: chipPos.y, transform: `translate(-50%, -50%) scale(${chipScale})`}}>
          <VariableChip name="card_last4" fontSize={PEEK.chipFont} height={PEEK.chipH} glow={kf(f, [4.2, 4.4, 5.0], [0.6, 0.6, 0])} />
        </div>
      ) : null}
      {s >= 4.45 && s < 5.05 ? <StrokeDot p={toScreen(cam, cubicPoint(SEGS[1], Math.min(1, 0.28 + rideB)))} /> : null}

      <ForegroundClouds t={s} cam={cam} opacity={0.2 * tween(f, 0, 0.8) * (1 - lilac)} y={720} id="fg6" />

      <Cursor
        frame={f}
        keys={[{t: 0, x: cur.x, y: cur.y}]}
        clicks={[CLICK_VERIFY, CLICK_BLOCK]}
        hand={[[0.9, 7.45]]}
        rippleColor={COLORS.inkNavy}
        opacity={tween(f, 0.5, 0.7) * (1 - tween(f, 7.6, 7.9))}
      />
    </AbsoluteFill>
  );
};

const StrokeDot: React.FC<{p: Pt}> = ({p}) => (
  <div
    style={{
      position: 'absolute',
      left: p.x - 12,
      top: p.y - 12,
      width: 24,
      height: 24,
      borderRadius: 12,
      background: COLORS.inkNavy,
      boxShadow: `0 0 0 8px ${alpha(COLORS.inkNavy, 0.18)}`,
    }}
  />
);
