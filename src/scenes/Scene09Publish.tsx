import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, bob, ease, kf, kfIO, lin, popIn, press, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS} from '../handoff';
import {BUILD7, PUBLISH_BTN, WHATSAPP_CARD_FINAL} from '../v7';
import {camAt, CamKeys, toScreen, IDENTITY} from '../components/Stage';
import {CameraRig, dissolve} from '../components/CameraRig';
import {Backdrop} from '../components/Backdrop';
import {DuskSky, ForegroundClouds} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {Logo, LogoName} from '../components/logos';
import {PublishButton} from '../ui/Panels';
import {CARD, ChannelCard} from '../ui/ChannelCard';
import {UI, UI_FONT, UI_MONO} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

const CHANNELS: LogoName[] = ['whatsapp', 'messenger', 'instagram', 'telegram', 'slack', 'webchat', 'voice', 'mobile'];
const cardX = (i: number) => 860 + i * (CARD.width + CARD.gap);
const CY = 540;
const ORB0 = {x: 960, y: 500, size: 150};
const ORB1 = {x: 420, y: 540, size: 180};
const PUB_CARD = {x: 510, y: 230, width: 900, height: 560};
const WIDE = {x: (330 + cardX(7) + CARD.width / 2) / 2, s: 0.5};
const WEB = cardX(5);
const RISE = CHANNELS.map((_, i) => 2.85 + i * 0.08);
const CLICK = 1.05;
const EXPAND: [number, number] = [6.45, 6.98];
const ROLL = [6.2, 6.32, 6.44];
const MAYA = {maya: 'I lost my card.', agent: "I'm sorry to hear that. Can you confirm the last four digits of the card?"};

const CAM: CamKeys = {
  t: [0, 2.6, 3.3, 3.6, 4.3, 5.0, 6.0, 6.45],
  x: [960, 960, WIDE.x, WIDE.x, WEB, WEB, cardX(0), cardX(0)],
  y: [540, 540, 540, 540, CY, CY, CY, CY],
  s: [1, 1, WIDE.s, WIDE.s, 1, 1, 1, 1.15],
};

const Badge: React.FC<{f: number; cx: number; cy: number; size: number; scale: number}> = ({f, cx, cy, size, scale}) => {
  const pos = ROLL.reduce((m, t) => m + tween(f, t, t + 0.09), 0);
  const moving = ROLL.some((t) => f > sec(t) && f < sec(t + 0.09));
  const h = size * 0.6;
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, borderRadius: size / 2, background: COLORS.badgeRed, border: `${size * 0.05}px solid ${COLORS.white}`, boxSizing: 'border-box', boxShadow: '0 8px 20px rgba(13,18,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${scale})`}}>
      <div style={{height: h, overflow: 'hidden', position: 'relative', width: size * 0.6}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', transform: `translateY(${-pos * h}px)`, filter: moving ? 'blur(1.4px)' : undefined}}>
          {['3', '2', '1', '0'].map((d) => (
            <div key={d} style={{height: h, lineHeight: `${h}px`, textAlign: 'center', fontFamily: UI_FONT, fontWeight: 700, fontSize: size * 0.52, color: COLORS.white}}>
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Dotted arc that draws itself (mask reveal). */
const DottedArc: React.FC<{id: string; d: string; draw: number; opacity: number}> = ({id, d, draw, opacity}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1} opacity={opacity}>
    <defs>
      <mask id={id} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={8000} height={5000}>
        <path d={d} stroke="#fff" strokeWidth={14} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      </mask>
    </defs>
    <path d={d} stroke={alpha(COLORS.white, 0.75)} strokeWidth={4} strokeDasharray="2 16" strokeLinecap="round" fill="none" mask={`url(#${id})`} />
  </svg>
);

/**
 * SCENE 9 (7 s) Publish across channels. Dusk sky.
 */
export const Scene09Publish: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s9;
  const env = envelope(f, dur, true, false);
  const cam = camAt(f, CAM);

  const spin = tween(f, CLICK + 0.05, CLICK + 0.2) * (1 - tween(f, 1.65, 1.75));
  const done = tween(f, 1.7, 1.95);
  const cardOut = tween(f, 2.2, 2.7);
  const orbMove = kfIO(f, [2.3, 2.85], [0, 1]);
  const orb = {x: ORB0.x + (ORB1.x - ORB0.x) * orbMove, y: ORB0.y + (ORB1.y - ORB0.y) * orbMove, size: ORB0.size + (ORB1.size - ORB0.size) * orbMove};
  const beamHead = lin(f, [2.8, 3.4], [ORB1.x + 90, cardX(7) + 200]);
  const beam = tween(f, 2.8, 2.88) * (1 - tween(f, 3.45, 3.8));
  const showChat = tween(f, 4.0, 4.3);
  const expand = kfIO(f, EXPAND, [0, 1]);
  const ex0 = camAt(sec(EXPAND[0]), CAM);
  const wa0 = toScreen(ex0, {x: cardX(0), y: CY});
  const F = WHATSAPP_CARD_FINAL;
  const Lp = (a: number, b: number) => a + (b - a) * expand;
  // centre-zone activation (glow) during the pan
  const act = (i: number) => {
    const sx = toScreen(cam, {x: cardX(i), y: CY}).x;
    return s > 3.9 && s < 6.3 ? Math.max(0, 1 - Math.abs(sx - 960) / 420) : 0;
  };
  const chatAt = CHANNELS.map((_, i) => {
    for (let fr = sec(3.9); fr <= sec(6.2); fr++) {
      const sx = toScreen(camAt(fr, CAM), {x: cardX(i), y: CY}).x;
      if (Math.abs(sx - 960) < 260) return fr / fps;
    }
    return undefined;
  });
  const embed = popIn(f, 4.3, 0.3, 1.04);
  const copied = kf(f, [4.5, 4.62, 5.05, 5.2], [0, 1, 1, 0]);
  const launcher = kfIO(f, [4.6, 5.0], [0, 1]);
  const btnScreen = {x: PUBLISH_BTN.cx, y: PUBLISH_BTN.cy};

  return (
    <AbsoluteFill>
      {show('bg') ? (
      <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <Backdrop src={BACKDROPS.dusk8} t={s} span={8} cam={{...cam, x: 960, y: 540}} scrim="dark" fallback={<DuskSky t={s} cam={IDENTITY} frame={f} />} />
        </AbsoluteFill>
      ) : null}

      {show('fg') ? (
        <>
      <CameraRig cam={cam}>
        {/* coral glow pulse behind the publish card */}
        <div style={{position: 'absolute', left: 960 - 760, top: 540 - 560, width: 1520, height: 1120, borderRadius: '50%', background: `radial-gradient(ellipse, ${alpha(UI.glow.publish, 0.55)} 0%, ${alpha(UI.glow.publish, 0)} 62%)`, opacity: kf(f, [1.7, 1.95, 2.6], [0, 1, 0])}} />
        {/* publish card */}
        <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(env.inP, cardOut), fontFamily: UI_FONT}}>
          <div style={{position: 'absolute', left: PUB_CARD.x, top: PUB_CARD.y, width: PUB_CARD.width, height: PUB_CARD.height, borderRadius: 30, background: COLORS.white, boxShadow: UI.shadow}} />
          <div style={{position: 'absolute', left: PUB_CARD.x + 48, top: PUB_CARD.y + 36, fontSize: 44, fontWeight: 700, color: UI.ink}}>Publish</div>
          <div style={{position: 'absolute', left: PUB_CARD.x + 48, top: PUB_CARD.y + 100, fontSize: 31, color: UI.text2, whiteSpace: 'nowrap'}}>BotCircuits Website Agent</div>
        </div>
        {/* dotted arcs from the orb to each card */}
        {CHANNELS.map((c, i) => {
          const tx = cardX(i);
          const ty = CY - CARD.height / 2 - 20;
          const d = `M ${ORB1.x} ${ORB1.y - 90} C ${ORB1.x + 200} ${ORB1.y - 520}, ${tx - 200} ${ty - 260}, ${tx} ${ty}`;
          return <DottedArc key={c} id={`arc-${c}`} d={d} draw={tween(f, 3.0 + i * 0.06, 3.5 + i * 0.06)} opacity={1 - tween(f, 4.0, 4.4)} />;
        })}
        {/* beam of light */}
        {beam > 0 ? <div style={{position: 'absolute', left: ORB1.x + 90, top: CY - 3, width: Math.max(0, beamHead - ORB1.x - 90), height: 6, borderRadius: 3, background: alpha(COLORS.white, 0.6), boxShadow: `0 0 24px 6px ${alpha(COLORS.white, 0.45)}`, opacity: beam}} /> : null}
        {/* channel cards */}
        {CHANNELS.map((c, i) => {
          if (i === 0 && s >= EXPAND[0]) return null;
          if (s < RISE[i]) return null;
          const y = CY + 980 * kf(f, [RISE[i], RISE[i] + 0.32, RISE[i] + 0.5], [1, -0.035, 0]) + bob(f, i, 4) * tween(f, RISE[i] + 0.5, RISE[i] + 1);
          return (
            <ChannelCard
              key={c}
              name={c}
              frame={f}
              cx={cardX(i)}
              cy={y}
              scale={1 + 0.06 * act(i)}
              glow={act(i)}
              chatAt={chatAt[i]}
              convo={c === 'whatsapp' ? MAYA : undefined}
              showChat={showChat}
            />
          );
        })}
        {/* web chat: embed line, "Copied!" and the launcher */}
        {embed > 0 ? (
          <div style={{position: 'absolute', left: WEB - 230, top: CY + 210, width: 460, height: 64, borderRadius: 16, background: UI.ink, color: COLORS.white, fontFamily: UI_MONO, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${embed})`, opacity: Math.min(1, embed) * (1 - tween(f, 5.3, 5.6))}}>
            {'<script src="bc.js">'}
          </div>
        ) : null}
        {copied > 0 ? (
          <div style={{position: 'absolute', left: WEB - 80, top: CY + 130, width: 160, height: 60, borderRadius: 14, background: COLORS.white, color: UI.ink, fontFamily: UI_FONT, fontWeight: 600, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: UI.shadow, opacity: copied, transform: `translateY(${(1 - copied) * 10}px)`}}>
            Copied!
          </div>
        ) : null}
        {launcher > 0 ? (
          <Orb cx={WEB - 230 + (WEB + CARD.width / 2 - 56 - (WEB - 230)) * launcher} cy={CY + 242 + (CY + CARD.height / 2 - 56 - (CY + 242)) * launcher - Math.sin(launcher * Math.PI) * 80} size={72} frame={f} />
        ) : null}
        {/* the orb */}
        <Orb cx={orb.x} cy={orb.y + (s > 3 ? bob(f, 0, 6) : 0)} size={orb.size} frame={f} pulse={tween(f, 1.75, 2.3)} opacity={env.inP} blur={14 * (1 - env.inP)} />
        {/* WhatsApp badge */}
        {s >= 5.95 && s < EXPAND[0] ? <Badge f={f} cx={cardX(0) + CARD.width / 2 - 30} cy={CY - CARD.height / 2 + 30} size={72 / 1.15} scale={popIn(f, 5.95, 0.3, 1.04)} /> : null}
      </CameraRig>

      {/* the Publish button (shared from scene 8) */}
      {cardOut < 1 ? (
        <div style={{position: 'absolute', left: PUBLISH_BTN.cx - PUBLISH_BTN.width / 2, top: PUBLISH_BTN.cy - PUBLISH_BTN.height / 2, ...dissolve(1, cardOut), transform: `scale(${press(f, CLICK)})`}}>
          <PublishButton width={PUBLISH_BTN.width} height={PUBLISH_BTN.height} frame={f} spin={spin} done={done} />
        </div>
      ) : null}

      <ForegroundClouds t={s} cam={cam} opacity={0.16 * tween(f, 2.6, 3.4)} y={780} id="fg9" />

      <Cursor
        frame={f}
        keys={[
          {t: 0.3, x: 1700, y: 1120},
          {t: 0.95, x: btnScreen.x + 40, y: btnScreen.y + 12},
          {t: 1.5, x: btnScreen.x + 40, y: btnScreen.y + 12},
          {t: 2.2, x: 1500, y: 1180},
        ]}
        clicks={[CLICK]}
        hand={[[0.75, 1.4]]}
        rippleColor={COLORS.white}
        opacity={tween(f, 0.3, 0.5) * (1 - tween(f, 1.8, 2.2))}
      />

      {/* WhatsApp card -> full frame (hand-off to scene 10) */}
      {s >= EXPAND[0] ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: Lp(wa0.x - (CARD.width * ex0.scale) / 2, F.x),
              top: Lp(wa0.y - (CARD.height * ex0.scale) / 2, F.y),
              width: Lp(CARD.width * ex0.scale, F.width),
              height: Lp(CARD.height * ex0.scale, F.height),
              borderRadius: Lp(CARD.radius * ex0.scale, F.borderRadius),
              overflow: 'hidden',
              background: 'linear-gradient(160deg, #1FAF5A, #128C7E)',
            }}
          >
            <div style={{position: 'absolute', inset: 0, background: COLORS.white, opacity: ease(f, [sec(EXPAND[0]), sec(EXPAND[0] + 0.3)], [0, 1])}} />
          </div>
          {(() => {
            const logo0 = {x: wa0.x, y: wa0.y + (-CARD.height / 2 + 60 + CARD.logoCircle / 2) * ex0.scale, size: CARD.logo * ex0.scale};
            const size = Lp(logo0.size, F.logo.size);
            return (
              <div style={{position: 'absolute', left: Lp(logo0.x, F.logo.centerX) - size / 2, top: Lp(logo0.y, F.logo.centerY) - size / 2, width: size, height: size}}>
                <Logo name="whatsapp" size={size} />
              </div>
            );
          })()}
          <Badge f={f} cx={Lp(wa0.x + (CARD.width / 2 - 30) * ex0.scale, F.badge.centerX)} cy={Lp(wa0.y + (-CARD.height / 2 + 30) * ex0.scale, F.badge.centerY)} size={F.badge.size} scale={1} />
        </>
      ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
