import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, bob, kf, kfIO, popIn, press, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS} from '../handoff';
import {AGENT, BUILD7, PUBLISH_BTN, WHATSAPP_FINAL} from '../v7';
import {camAt, CamKeys, toScreen, IDENTITY} from '../components/Stage';
import {CameraRig, dissolve, isPanning} from '../components/CameraRig';
import {Backdrop} from '../components/Backdrop';
import {CircleReveal} from '../components/CircleReveal';
import {DuskSky, ForegroundClouds} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {PublishButton} from '../ui/Panels';
import {Channel, ChannelLogo} from '../ui/ChannelLogo';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

// WhatsApp is last so the pan ends on it, centred, for the hand-off.
const ORDER: Channel[] = ['messenger', 'instagram', 'telegram', 'slack', 'webchat', 'voice', 'mobile', 'whatsapp'];
const STEP = 340;
const X0 = 1300;
const ROW_Y = 560;
const logoX = (i: number) => X0 + i * STEP;
const WA_X = logoX(ORDER.length - 1);
const ORB_C = {x: 960, y: 540};
const PUB = {x: 510, y: 230, width: 900, height: 560};
const CLICK = 1.0;
const POP = (i: number) => 2.9 + i * 0.15;
const PAN: [number, number] = [4.0, 6.2];
const ROLL = [6.2, 6.32, 6.44];
const REVEAL: [number, number] = [6.5, 6.98];

const CAM: CamKeys = {t: [0, PAN[0], PAN[1], 7], x: [960, 960, WA_X, WA_X], y: [540, 540, 540, 540], s: [1, 1, 1, 1]};

const Badge: React.FC<{f: number; size: number}> = ({f, size}) => {
  const pos = ROLL.reduce((m, t) => m + tween(f, t, t + 0.09), 0);
  const moving = ROLL.some((t) => f > sec(t) && f < sec(t + 0.09));
  const h = size * 0.62;
  return (
    <div style={{position: 'absolute', right: -size * 0.15, top: -size * 0.15, width: size, height: size, borderRadius: size / 2, background: COLORS.badgeRed, border: `${size * 0.06}px solid ${COLORS.white}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(13,18,36,0.3)', transform: `scale(${popIn(f, 6.0, 0.3, 1.04)})`, opacity: 1 - tween(f, 6.55, 6.7)}}>
      <div style={{height: h, overflow: 'hidden', width: size * 0.6}}>
        <div style={{transform: `translateY(${-pos * h}px)`, filter: moving ? 'blur(1.4px)' : undefined}}>
          {['3', '2', '1', '0'].map((d) => (
            <div key={d} style={{height: h, lineHeight: `${h}px`, textAlign: 'center', fontFamily: UI_FONT, fontWeight: 700, fontSize: size * 0.5, color: COLORS.white}}>{d}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * SCENE 9 (7 s) Publish and channels (logos only). Dusk sky.
 */
export const Scene09Publish: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s9;
  const env = envelope(f, dur, true, false);
  const cam = camAt(f, CAM);
  const panning = isPanning((fr) => camAt(fr, CAM), f) || s >= 2.85; // logo pop-in + pan: edge bleed allowed

  const spin = tween(f, CLICK + 0.05, CLICK + 0.2) * (1 - tween(f, 1.55, 1.65));
  const done = tween(f, 1.6, 1.85);
  const shrink = kfIO(f, [2.1, 2.65], [0, 1]);
  const orbIn = tween(f, 2.35, 2.65);
  const orbFade = tween(f, 3.8, 4.3);
  const reveal = kfIO(f, REVEAL, [0, 1]);
  const others = tween(f, REVEAL[0], REVEAL[0] + 0.3);
  const waWhite = tween(f, 6.6, 6.9);
  const waScreen = toScreen(cam, {x: WA_X, y: ROW_Y});

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <Backdrop src={BACKDROPS.dusk8} t={s} span={8} cam={{...cam, x: 960, y: 540}} scrim="dark" fallback={<DuskSky t={s} cam={IDENTITY} frame={f} />} />
          {/* the background light the orb fades into */}
          <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${alpha('#CFF5DE', 0.35)} 0%, ${alpha('#CFF5DE', 0)} 40%)`, opacity: kf(f, [3.8, 4.3, 5.0], [0, 1, 0.3])}} />
        </AbsoluteFill>
      ) : null}

      {show('fg') ? (
        <>
          {/* coral glow pulse + the Publish page, which then shrinks into the orb */}
          <AbsoluteFill style={{background: `radial-gradient(ellipse 40% 45% at 50% 50%, ${alpha(UI.glow.publish, 0.5)} 0%, ${alpha(UI.glow.publish, 0)} 70%)`, opacity: kf(f, [1.6, 1.85, 2.5], [0, 1, 0])}} />
          {shrink < 1 ? (
            <div
              data-safe="publish page"
              style={{
                position: 'absolute',
                left: PUB.x,
                top: PUB.y,
                width: PUB.width,
                height: PUB.height,
                transformOrigin: `${ORB_C.x - PUB.x}px ${ORB_C.y - PUB.y}px`,
                transform: `scale(${1 - 0.85 * shrink})`,
                ...dissolve(env.inP, tween(f, 2.2, 2.6)),
                fontFamily: UI_FONT,
              }}
            >
              <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: COLORS.white, boxShadow: UI.shadow}} />
              <div style={{position: 'absolute', left: 48, top: 40, fontSize: 32, fontWeight: 700, color: UI.ink}}>Publish</div>
              <div style={{position: 'absolute', left: 48, top: 88, fontSize: 24, color: UI.text2, whiteSpace: 'nowrap'}}>{AGENT}</div>
              <Orb cx={ORB_C.x - PUB.x} cy={ORB_C.y - PUB.y - 40} size={140} frame={f} />
            </div>
          ) : null}
          {/* the Publish button (shared from scene 8) */}
          {shrink < 1 ? (
            <div data-safe="publish button" style={{position: 'absolute', left: PUBLISH_BTN.cx - PUBLISH_BTN.width / 2, top: PUBLISH_BTN.cy - PUBLISH_BTN.height / 2, ...dissolve(1, tween(f, 2.1, 2.5)), transform: `scale(${press(f, CLICK) * (1 - 0.85 * shrink)})`, transformOrigin: `${ORB_C.x - (PUBLISH_BTN.cx - PUBLISH_BTN.width / 2)}px ${ORB_C.y - (PUBLISH_BTN.cy - PUBLISH_BTN.height / 2)}px`}}>
              <PublishButton width={PUBLISH_BTN.width} height={PUBLISH_BTN.height} frame={f} spin={spin} done={done} />
            </div>
          ) : null}

          <CameraRig cam={cam} panning={panning}>
            {/* the greenish orb (ends centred), then fades into the light */}
            {orbIn > 0 && orbFade < 1 ? <Orb cx={ORB_C.x} cy={ORB_C.y + (s > 2.8 ? bob(f, 0, 6) : 0)} size={170} frame={f} opacity={orbIn * (1 - orbFade)} blur={10 * orbFade} pulse={tween(f, 2.75, 3.3)} /> : null}
            {/* beam + dotted arcs from the orb to each logo */}
            {ORDER.map((c, i) => {
              const tx = logoX(i);
              const d = `M ${ORB_C.x + 80} ${ORB_C.y} C ${ORB_C.x + 300} ${ORB_C.y - 260}, ${tx - 200} ${ROW_Y - 260}, ${tx} ${ROW_Y - 110}`;
              const draw = tween(f, POP(i) - 0.25, POP(i) + 0.1);
              const fade = 1 - tween(f, 4.2, 4.7);
              return draw > 0 && fade > 0 ? (
                <svg key={c} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1} opacity={fade}>
                  <defs>
                    <mask id={`m9-${c}`} maskUnits="userSpaceOnUse" x={-1000} y={-1000} width={7000} height={4000}>
                      <path d={d} stroke="#fff" strokeWidth={14} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
                    </mask>
                  </defs>
                  <path d={d} stroke={alpha(COLORS.white, 0.7)} strokeWidth={4} strokeDasharray="2 16" strokeLinecap="round" fill="none" mask={`url(#m9-${c})`} />
                </svg>
              ) : null;
            })}
            {s > 2.75 && s < 3.4 ? <div style={{position: 'absolute', left: ORB_C.x + 80, top: ORB_C.y - 3, width: 1200 * tween(f, 2.75, 3.1), height: 6, borderRadius: 3, background: alpha(COLORS.white, 0.6), boxShadow: `0 0 24px 6px ${alpha(COLORS.white, 0.4)}`, opacity: 1 - tween(f, 3.1, 3.4)}} /> : null}
            {/* the eight channel logos */}
            {ORDER.map((c, i) => {
              const p = popIn(f, POP(i), 0.35, 1.04);
              if (p <= 0) return null;
              const sx = toScreen(cam, {x: logoX(i), y: ROW_Y}).x;
              const pass = s > PAN[0] - 0.2 && s < REVEAL[0] ? Math.max(0, 1 - Math.abs(sx - 960) / 360) : 0;
              const isWA = c === 'whatsapp';
              if (isWA) return null; // drawn above the reveal
              return (
                <ChannelLogo
                  key={c}
                  logo={c}
                  cx={logoX(i)}
                  cy={ROW_Y + bob(f, i * 0.8, 5)}
                  size={200}
                  scale={p}
                  opacity={Math.min(1, p) * (1 - others)}
                  blur={8 * Math.max(0, 1 - Math.min(1, p)) + 14 * others}
                  glow={pass}
                />
              );
            })}
          </CameraRig>

          {/* hand-off: WhatsApp-green circle expands from behind the logo */}
          <CircleReveal cx={waScreen.x} cy={waScreen.y} progress={reveal}>
            <AbsoluteFill style={{background: WHATSAPP_FINAL.background}} />
          </CircleReveal>
          <CameraRig cam={cam} panning={panning}>
            {(() => {
              const i = ORDER.length - 1;
              const p = popIn(f, POP(i), 0.35, 1.04);
              if (p <= 0) return null;
              const sx = toScreen(cam, {x: WA_X, y: ROW_Y}).x;
              const pass = s > PAN[0] - 0.2 && s < REVEAL[0] ? Math.max(0, 1 - Math.abs(sx - 960) / 360) : 0;
              const y = ROW_Y + bob(f, i * 0.8, 5) * (1 - tween(f, 6.2, 6.5)) + (WHATSAPP_FINAL.logo.centerY - ROW_Y) * tween(f, 6.2, 6.5);
              return (
                <>
                  <ChannelLogo logo="whatsapp" cx={WA_X} cy={y} size={200} scale={p} blur={8 * Math.max(0, 1 - Math.min(1, p))} glow={pass * (1 - reveal)} opacity={(1 - waWhite) * Math.min(1, p)} badge={s >= 6.0 && s < 6.7 ? <Badge f={f} size={64} /> : null} />
                  {waWhite > 0 ? <ChannelLogo logo="whatsapp" cx={WA_X} cy={y} size={200} color={WHATSAPP_FINAL.logo.color} opacity={waWhite} /> : null}
                </>
              );
            })()}
          </CameraRig>

          <ForegroundClouds t={s} cam={cam} opacity={0.14 * tween(f, 2.6, 3.4) * (1 - reveal)} y={800} id="fg9" />

          <Cursor
            frame={f}
            keys={[
              {t: 0.3, x: 1660, y: 1060},
              {t: 0.9, x: PUBLISH_BTN.cx + 40, y: PUBLISH_BTN.cy + 12},
              {t: 1.45, x: PUBLISH_BTN.cx + 40, y: PUBLISH_BTN.cy + 12},
              {t: 2.1, x: 1500, y: 1180},
            ]}
            clicks={[CLICK]}
            hand={[[0.7, 1.35]]}
            rippleColor={COLORS.white}
            opacity={tween(f, 0.3, 0.5) * (1 - tween(f, 1.7, 2.1))}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
