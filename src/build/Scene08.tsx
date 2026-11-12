import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, alpha, ease, kf, popIn, press, tween} from '../theme';
import {sec} from '../timeline';
import {ORB_CENTER, WHATSAPP_TILE_FINAL} from '../handoff';
import {camAt, CamKeys, toScreen, World} from '../components/Stage';
import {DuskSky} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {LogoTile} from '../components/LogoTile';
import {BRAND_HEX, Logo, LogoName} from '../components/logos';
import {StrokeLine, Pt} from '../components/StrokeLine';

/** SCENE 8 (6 s) "Publish everywhere". */
export const CHANNELS: LogoName[] = ['messenger', 'whatsapp', 'instagram', 'telegram', 'slack', 'webchat', 'voice', 'mobile'];
const WA = 1;
const CENTER = {x: 960, y: 470};
const RX = 520;
const RY = 320;
const TILE = 140;
const BUTTON = {cx: 960, cy: 650, w: 300, h: 88};
const CLICK = 3.1;
const POP0 = 0.8;

export const channelPos = (i: number): Pt => {
  const a = ((-90 + i * 45) * Math.PI) / 180;
  return {x: CENTER.x + RX * Math.cos(a), y: CENTER.y + RY * Math.sin(a)};
};

export const S8_CAM: CamKeys = {
  t: [0, 0.8, 2.2, 3.4, 4.6, 5.2],
  x: [960, 960, 960, 960, 960, channelPos(WA).x],
  y: [540, 530, 520, 520, 520, channelPos(WA).y],
  s: [1, 1, 1.02, 1.0, 1.03, 2.4],
};

const SHOCK = {t0: 3.4, t1: 4.3, r0: 110, r1: 820};
const shockR = (f: number) => ease(f, [sec(SHOCK.t0), sec(SHOCK.t1)], [SHOCK.r0, SHOCK.r1]);
/** First second at which the shockwave reaches a distance. */
const reachAt = (d: number) => {
  for (let fr = sec(SHOCK.t0); fr <= sec(SHOCK.t1); fr++) if (shockR(fr) >= d) return fr / sec(1);
  return SHOCK.t1;
};

/** Badge digit column rolling 3 -> 0 (0.12 s per step, blur while moving). */
const BadgeDigits: React.FC<{f: number; size: number}> = ({f, size}) => {
  const steps = [4.95, 5.07, 5.19];
  const pos = steps.reduce((m, t) => m + tween(f, t, t + 0.1), 0); // 0..3
  const moving = steps.some((t) => f > sec(t) && f < sec(t + 0.1));
  const h = size * 0.95;
  return (
    <div style={{height: h, overflow: 'hidden', position: 'relative', width: size}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: size, transform: `translateY(${-pos * h}px)`, filter: moving ? 'blur(1.6px)' : 'none'}}>
        {['3', '2', '1', '0'].map((d) => (
          <div key={d} style={{height: h, lineHeight: `${h}px`, textAlign: 'center'}}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

const Badge: React.FC<{f: number; cx: number; cy: number; size: number; scale: number}> = ({f, cx, cy, size, scale}) => (
  <div
    style={{
      position: 'absolute',
      left: cx - size / 2,
      top: cy - size / 2,
      width: size,
      height: size,
      borderRadius: size / 2,
      background: COLORS.badgeRed,
      border: `${Math.max(2, size * 0.06)}px solid ${COLORS.white}`,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: COLORS.white,
      fontFamily: FONT_SANS,
      fontWeight: 700,
      fontSize: size * 0.56,
      boxShadow: '0 6px 16px rgba(13,18,36,0.3)',
      transform: `scale(${scale})`,
    }}
  >
    <BadgeDigits f={f} size={size * 0.62} />
  </div>
);

export const Scene08: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  const cam = camAt(f, S8_CAM);

  const settle = tween(f, 0, 0.8);
  const orb = {cx: 960, cy: 540 + (CENTER.y - 540) * settle, scale: ORB_CENTER.scale + (1 - ORB_CENTER.scale) * settle};
  const ring = shockR(f);
  const btnIn = tween(f, 1.6, 1.95);
  const hoverGlow = tween(f, 2.75, 3.1);
  const expand = tween(f, 5.2, 5.98);
  const waScreen0 = toScreen(camAt(sec(5.2), S8_CAM), channelPos(WA));
  const waSize0 = TILE * S8_CAM.s[S8_CAM.s.length - 1];
  const lerp = (a: number, b: number) => a + (b - a) * expand;
  const badgeIn = popIn(f, 4.7, 0.3, 1.04);
  const B = WHATSAPP_TILE_FINAL;

  return (
    <AbsoluteFill>
      <DuskSky t={s + 0.7} cam={cam} frame={f} bloom={tween(f, 3.4, 4.8)} />

      <World cam={cam}>
        {/* glow behind the orb */}
        <div
          style={{
            position: 'absolute',
            left: orb.cx - 520,
            top: orb.cy - 520,
            width: 1040,
            height: 1040,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(COLORS.spinnerViolet, 0.55)} 0%, ${alpha(COLORS.glowViolet, 0.25)} 35%, ${alpha(COLORS.glowViolet, 0)} 65%)`,
            opacity: tween(f, 0, 0.8),
          }}
        />
        {CHANNELS.map((c, i) => {
          const p = channelPos(i);
          const t = POP0 + i * 0.1;
          return (
            <StrokeLine
              key={c}
              curve={[CENTER, CENTER, p, p]}
              draw={tween(f, t - 0.05, t + 0.25)}
              color={alpha(COLORS.white, 0.3)}
              width={2}
            />
          );
        })}
        {/* shockwave */}
        {s > SHOCK.t0 && s < SHOCK.t1 + 0.2 ? (
          <div
            style={{
              position: 'absolute',
              left: CENTER.x - ring,
              top: CENTER.y - ring,
              width: ring * 2,
              height: ring * 2,
              borderRadius: '50%',
              border: `4px solid ${alpha(COLORS.white, 0.75 * (1 - tween(f, SHOCK.t0 + 0.4, SHOCK.t1 + 0.2)))}`,
              boxShadow: `0 0 40px ${alpha(COLORS.peach, 0.5 * (1 - tween(f, SHOCK.t0 + 0.4, SHOCK.t1 + 0.2)))}`,
              boxSizing: 'border-box',
            }}
          />
        ) : null}
        {CHANNELS.map((c, i) => {
          const p = channelPos(i);
          const t = POP0 + i * 0.1;
          const d = Math.hypot(p.x - CENTER.x, p.y - CENTER.y);
          const hit = reachAt(d - TILE / 2);
          const hide = i === WA && s >= 5.2;
          return hide ? null : (
            <LogoTile
              key={c}
              name={c}
              cx={p.x}
              cy={p.y}
              size={TILE}
              scale={popIn(f, t, 0.35, 1.04) * kf(f, [hit, hit + 0.15, hit + 0.45], [1, 1.15, 1])}
              glow={tween(f, hit, hit + 0.3) * (i === WA ? 1 : 1 - tween(f, 4.7, 5.2))}
              glowColor={BRAND_HEX[c]}
            />
          );
        })}
        {s < 5.2 ? <Badge f={f} cx={channelPos(WA).x + 56} cy={channelPos(WA).y - 56} size={44} scale={badgeIn} /> : null}

        {/* warm glow behind the button, then the Publish pill */}
        <div
          style={{
            position: 'absolute',
            left: BUTTON.cx - 360,
            top: BUTTON.cy - 220,
            width: 720,
            height: 440,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${alpha(COLORS.peach, 0.75)} 0%, ${alpha(COLORS.coral, 0.45)} 35%, ${alpha(COLORS.coral, 0)} 68%)`,
            opacity: hoverGlow,
            transform: `scale(${1 + 1.6 * tween(f, 3.4, 4.6)})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: BUTTON.cx - BUTTON.w / 2,
            top: BUTTON.cy - BUTTON.h / 2,
            width: BUTTON.w,
            height: BUTTON.h,
            borderRadius: BUTTON.h / 2,
            background: COLORS.white,
            boxShadow: `0 ${16 - 10 * (1 - press(f, CLICK))}px 40px rgba(13,18,36,0.3)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            fontFamily: FONT_SANS,
            fontWeight: 600,
            fontSize: 34,
            color: COLORS.ink,
            opacity: btnIn,
            transform: `translateY(${(1 - btnIn) * 20}px) scale(${press(f, CLICK)})`,
          }}
        >
          Publish
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={COLORS.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </div>

        <Orb cx={orb.cx} cy={orb.cy} scale={orb.scale} glow={0.6 + 0.4 * settle} pulse={tween(f, SHOCK.t0, SHOCK.t0 + 0.5)} opacity={1 - tween(f, 4.6, 4.95)} />
      </World>

      <Cursor
        frame={f}
        keys={[
          {t: 2.2, x: 1960, y: 1140},
          {t: 2.85, x: BUTTON.cx + 40, y: BUTTON.cy + 14},
          {t: 3.3, x: BUTTON.cx + 40, y: BUTTON.cy + 14},
          {t: 3.9, x: 1560, y: 1180},
        ]}
        clicks={[CLICK]}
        hand={[[2.7, 3.4]]}
        rippleColor={COLORS.white}
        opacity={tween(f, 2.2, 2.4) * (1 - tween(f, 3.6, 3.9))}
      />

      {/* WhatsApp tile expands to fill the frame (morph into scene 9) */}
      {s >= 5.2 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: lerp(waScreen0.x - waSize0 / 2, B.x),
              top: lerp(waScreen0.y - waSize0 / 2, B.y),
              width: lerp(waSize0, B.width),
              height: lerp(waSize0, B.height),
              borderRadius: lerp(waSize0 * 0.26, B.borderRadius),
              background: COLORS.white,
              boxShadow: '0 30px 80px rgba(13,18,36,0.3)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: lerp(waScreen0.x, B.logo.centerX) - B.logo.size / 2,
              top: lerp(waScreen0.y, B.logo.centerY) - B.logo.size / 2,
              width: B.logo.size,
              height: B.logo.size,
            }}
          >
            <Logo name="whatsapp" size={B.logo.size} />
          </div>
          <Badge
            f={f}
            cx={lerp(waScreen0.x + 56 * 2.4, B.badge.centerX)}
            cy={lerp(waScreen0.y - 56 * 2.4, B.badge.centerY)}
            size={lerp(44 * 2.4, B.badge.size)}
            scale={1}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
