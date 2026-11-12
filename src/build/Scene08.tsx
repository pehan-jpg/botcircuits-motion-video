import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, alpha, bob, ease, kf, kfIO, lin, popIn, press, tween} from '../theme';
import {sec} from '../timeline';
import {COMET, WHATSAPP_CARD_FINAL} from '../handoff';
import {camAt, CamKeys, toScreen, World} from '../components/Stage';
import {ForegroundClouds} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {Logo, LogoName} from '../components/logos';
import {BRAND_GLOW, CARD, ChannelCard, cardLift} from '../components/ChannelCard';
import {CometSky, CometTrail, Dusk, cometOrb} from './comet';

/** SCENE 8 (7 s) "Publish everywhere": a travelling shot along tall channel cards. */
export const CHANNELS: LogoName[] = ['whatsapp', 'messenger', 'instagram', 'telegram', 'slack', 'webchat', 'voice', 'mobile'];
const ORB_P = {x: COMET.to.x, y: COMET.to.y};
const BUTTON = {cx: 640, cy: 640, w: 380, h: 96};
const CLICK = 1.75;
const cardX = (i: number) => 1040 + i * (CARD.width + CARD.gap);
const CARD_Y = 540;
const RISE = CHANNELS.map((_, i) => 2.05 + i * 0.12);
const WIDE = {x: 2235, y: 540, s: 0.45};

export const S8_CAM: CamKeys = {
  t: [0, 3.0, 5.4, 6.05, 6.45, 6.98],
  x: [960, 960, 3300, WIDE.x, cardX(0), cardX(0)],
  y: [540, 540, 540, WIDE.y, CARD_Y, CARD_Y],
  s: [1, 1, 1, WIDE.s, 1.4, 1.4],
};
const EXPAND: [number, number] = [6.45, 6.98];
const BADGE_IN = 6.05;
const ROLL = [6.65, 6.77, 6.89];

/** Badge with a vertical 3 -> 0 roll (slight blur on the moving digits). */
const Badge: React.FC<{f: number; cx: number; cy: number; size: number; scale: number}> = ({f, cx, cy, size, scale}) => {
  const pos = ROLL.reduce((m, t) => m + tween(f, t, t + 0.09), 0);
  const moving = ROLL.some((t) => f > sec(t) && f < sec(t + 0.09));
  const h = size * 0.6;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: COLORS.badgeRed,
        border: `${size * 0.05}px solid ${COLORS.white}`,
        boxSizing: 'border-box',
        boxShadow: '0 8px 20px rgba(13,18,36,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
      }}
    >
      <div style={{height: h, overflow: 'hidden', position: 'relative', width: size * 0.6}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', transform: `translateY(${-pos * h}px)`, filter: moving ? 'blur(1.4px)' : 'none'}}>
          {['3', '2', '1', '0'].map((d) => (
            <div key={d} style={{height: h, lineHeight: `${h}px`, textAlign: 'center', fontFamily: FONT_SANS, fontWeight: 700, fontSize: size * 0.52, color: COLORS.white}}>
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Scene08: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  const cam = camAt(f, S8_CAM);
  const c = s + (COMET.duration - 1.0); // comet clock (continues from scene 7)
  const inComet = c < COMET.duration;
  const comet = cometOrb(Math.min(c, COMET.duration));

  // activation of cards passing the centre during the travelling shot
  const act = (i: number, fr: number) => {
    const cm = camAt(fr, S8_CAM);
    const sx = toScreen(cm, {x: cardX(i), y: CARD_Y}).x;
    return Math.max(0, 1 - Math.abs(sx - 960) / 380) * (fr >= sec(2.95) && fr <= sec(5.45) ? 1 : 0);
  };
  const chatAt = CHANNELS.map((_, i) => {
    for (let fr = sec(2.95); fr <= sec(5.45); fr++) if (act(i, fr) > 0.55) return fr / fps;
    return undefined;
  });
  const beamHead = lin(f, [2.0, ...RISE], [ORB_P.x + 110, ...CHANNELS.map((_, i) => cardX(i))]);
  const beamOn = tween(f, 2.0, 2.08) * (1 - tween(f, 2.95, 3.25));
  const hover = tween(f, 1.35, 1.65);
  const expand = kfIO(f, EXPAND, [0, 1]);
  const ex0 = camAt(sec(EXPAND[0]), S8_CAM);
  const wa0 = toScreen(ex0, {x: cardX(0), y: CARD_Y});
  const F = WHATSAPP_CARD_FINAL;
  const lerp = (a: number, b: number) => a + (b - a) * expand;

  return (
    <AbsoluteFill>
      {inComet ? <CometSky c={c} lilacT={s + 6.7} duskT={c} cam={cam} frame={f} /> : <Dusk t={c} cam={cam} frame={f} bloom={tween(f, 2.0, 3.2) * 0.6} />}

      <World cam={cam}>
        {/* warm glow behind Publish */}
        <div
          style={{
            position: 'absolute',
            left: BUTTON.cx - 700,
            top: BUTTON.cy - 700,
            width: 1400,
            height: 1400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(COLORS.peach, 0.7)} 0%, ${alpha(COLORS.coral, 0.4)} 32%, ${alpha(COLORS.coral, 0)} 66%)`,
            opacity: hover * (1 - 0.4 * tween(f, 2.4, 3.2)),
            transform: `scale(${0.8 + 0.2 * hover})`,
          }}
        />
        {/* cards */}
        {CHANNELS.map((name, i) => {
          if (i === 0 && s >= EXPAND[0]) return null;
          const r = RISE[i];
          if (s < r) return null;
          const y = CARD_Y + 980 * cardLift(f, r) + bob(f, i * 0.9, 4) * tween(f, r + 0.5, r + 1);
          const a = act(i, f);
          const ripple = kf(f, [5.85 + i * 0.07, 5.97 + i * 0.07, 6.3 + i * 0.07], [0, 1, 0]);
          const at = chatAt[i];
          return (
            <ChannelCard
              key={name}
              name={name}
              frame={f}
              cx={cardX(i)}
              cy={y}
              scale={1 + 0.08 * a}
              glow={Math.max(a, ripple)}
              chatAt={at}
              logoPop={at === undefined ? 1 : kf(f, [at, at + 0.12, at + 0.3], [1, 1.12, 1])}
            />
          );
        })}
        {s >= BADGE_IN && s < EXPAND[0] ? (
          <Badge f={f} cx={cardX(0) + CARD.width / 2 - 34} cy={CARD_Y - CARD.height / 2 + 34} size={72 / 1.4} scale={popIn(f, BADGE_IN, 0.3, 1.04)} />
        ) : null}

        {/* beam of light shooting right from the orb */}
        {beamOn > 0 ? (
          <div style={{position: 'absolute', left: ORB_P.x + 110, top: ORB_P.y - 3, width: Math.max(0, beamHead - ORB_P.x - 110), height: 6, borderRadius: 3, background: alpha(COLORS.white, 0.6), boxShadow: `0 0 24px 6px ${alpha(COLORS.white, 0.45)}`, opacity: beamOn}} />
        ) : null}

        {/* Publish button */}
        <div
          style={{
            position: 'absolute',
            left: BUTTON.cx - BUTTON.w / 2,
            top: BUTTON.cy - BUTTON.h / 2,
            width: BUTTON.w,
            height: BUTTON.h,
            opacity: tween(f, 0.45, 1.0),
            transform: `translateY(${(1 - tween(f, 0.45, 1.0)) * 24}px) scale(${press(f, CLICK)})`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: BUTTON.h / 2,
              background: COLORS.white,
              border: `1.5px solid ${COLORS.inkNavy}`,
              boxSizing: 'border-box',
              boxShadow: '0 18px 44px rgba(13,18,36,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              fontFamily: FONT_SANS,
              fontWeight: 500,
              fontSize: 36,
              color: COLORS.inkNavy,
            }}
          >
            Publish
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={COLORS.inkNavy} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
        {!inComet ? <Orb cx={ORB_P.x} cy={ORB_P.y + bob(f, 0, 6)} scale={1} pulse={tween(f, 2.0, 2.5)} /> : null}
      </World>

      {inComet ? (
        <>
          <CometTrail c={c} />
          <Orb cx={comet.x} cy={comet.y} scale={comet.scale} light={1 - comet.k} glow={comet.k} />
        </>
      ) : null}

      <ForegroundClouds t={s} cam={cam} opacity={0.18 * tween(f, 0, 0.8)} y={760} id="fg8" />

      <Cursor
        frame={f}
        keys={[
          {t: 0.9, x: 1500, y: 1140},
          {t: 1.4, x: BUTTON.cx + 60, y: BUTTON.cy + 16},
          {t: 2.0, x: BUTTON.cx + 60, y: BUTTON.cy + 16},
          {t: 2.6, x: 1200, y: 1200},
        ]}
        clicks={[CLICK]}
        hand={[[1.3, 2.05]]}
        rippleColor={COLORS.white}
        opacity={tween(f, 0.9, 1.1) * (1 - tween(f, 2.3, 2.6))}
      />

      {/* WhatsApp card -> full frame (morph into scene 9) */}
      {s >= EXPAND[0] ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: lerp(wa0.x - (CARD.width * ex0.scale) / 2, F.x),
              top: lerp(wa0.y - (CARD.height * ex0.scale) / 2, F.y),
              width: lerp(CARD.width * ex0.scale, F.width),
              height: lerp(CARD.height * ex0.scale, F.height),
              borderRadius: lerp(CARD.radius * ex0.scale, F.borderRadius),
              overflow: 'hidden',
              background: `linear-gradient(160deg, #1FAF5A, #128C7E)`,
            }}
          >
            <div style={{position: 'absolute', inset: 0, background: COLORS.white, opacity: ease(f, [sec(EXPAND[0]), sec(EXPAND[0] + 0.35)], [0, 1])}} />
          </div>
          {(() => {
            const logo0 = {x: wa0.x, y: wa0.y + (-CARD.height / 2 + 70 + CARD.logoCircle / 2) * ex0.scale, size: CARD.logo * ex0.scale};
            const size = lerp(logo0.size, F.logo.size);
            return (
              <div style={{position: 'absolute', left: lerp(logo0.x, F.logo.centerX) - size / 2, top: lerp(logo0.y, F.logo.centerY) - size / 2, width: size, height: size}}>
                <Logo name="whatsapp" size={size} />
              </div>
            );
          })()}
          <Badge
            f={f}
            cx={lerp(wa0.x + (CARD.width / 2 - 34) * ex0.scale, F.badge.centerX)}
            cy={lerp(wa0.y + (-CARD.height / 2 + 34) * ex0.scale, F.badge.centerY)}
            size={F.badge.size}
            scale={1}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const glowColor = (n: LogoName) => BRAND_GLOW[n];
