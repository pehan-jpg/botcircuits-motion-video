import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, ease, kf, kfIO, popIn, press, tween} from '../theme';
import {sec} from '../timeline';
import {AGENT, BUILD7, CONFIG_VIEW, CONTENT, PUBLISH_BTN, SHELL, WHATSAPP_FINAL} from '../v7';
import {AppShell} from '../ui/AppShell';
import {RectMorph} from '../components/Morph';
import {beatUnderline} from '../ui/TextBeat';
import {Camera} from '../camera';
import {CameraRig, dissolve} from '../components/CameraRig';
import {CircleReveal} from '../components/CircleReveal';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {PublishButton} from '../ui/Panels';
import {Channel, ChannelLogo} from '../ui/ChannelLogo';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

// ---- 4 x 2 grid of channel logos, centred, fully inside the frame ----
const ORDER: Channel[] = ['whatsapp', 'messenger', 'instagram', 'telegram', 'slack', 'webchat', 'voice', 'mobile'];
const SIZE = 170;
const GAP_X = 190;
const GAP_Y = 150;
const slot = (i: number) => ({
  x: 960 + ((i % 4) - 1.5) * (SIZE + GAP_X),
  y: 540 + (Math.floor(i / 4) - 0.5) * (SIZE + GAP_Y),
});
const ORB_C = {x: 960, y: 515}; // slightly above the grid centre
const PAGE_ORB = {x: PUBLISH_BTN.cx, y: 450}; // the agent's orb on the Publish page (screen)

// ---- timeline (scene seconds) ----
const CLICK = 0.8;
const POP = (i: number) => 2.25 + i * 0.15;
const TRAVEL = 0.36;
const LANDED = POP(ORDER.length - 1) + TRAVEL; // ~4.11
const GLOW = (i: number) => LANDED + i * 0.25;
const BADGE = 3.95;
const ROLL = [4.2, 4.35, 4.5];
const HANDOFF = 5.25;
const REVEAL: [number, number] = [HANDOFF + 0.15, HANDOFF + 0.65];
/** From here scene 10 draws the green frame and the white logo (shared element). */
export const S9_HANDOVER = BUILD7.dur.s9 - 0.5;

/** Gentle drift (max 1.03), back to 1.0 for the hand-off. */
const camAt = (f: number): Camera => ({x: 960, y: 540, rotation: 0, scale: kfIO(f, [2.35, HANDOFF, HANDOFF + 0.4], [1, 1.03, 1])});

/** Point on the logo's single curved path from the orb to its slot. */
const pathPt = (i: number, t: number) => {
  const a = ORB_C;
  const b = slot(i);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const side = b.y < a.y ? -1 : 1;
  const c = {x: mx + dy * 0.25 * side, y: my - Math.abs(dx) * 0.25 * (b.y < a.y ? 1 : -0.4)};
  const u = 1 - t;
  return {pt: {x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y}, d: `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`};
};

const Badge: React.FC<{f: number; size: number}> = ({f, size}) => {
  const pos = ROLL.reduce((m, t) => m + tween(f, t, t + 0.09), 0);
  const moving = ROLL.some((t) => f > sec(t) && f < sec(t + 0.09));
  const h = size * 0.62;
  return (
    <div style={{position: 'absolute', right: -size * 0.2, top: -size * 0.2, width: size, height: size, borderRadius: size / 2, background: COLORS.badgeRed, border: `${size * 0.06}px solid ${COLORS.white}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(13,18,36,0.2)', transform: `scale(${popIn(f, BADGE, 0.3, 1.04)})`, opacity: 1 - tween(f, 4.7, 4.85)}}>
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
 * SCENE 9 (7 s) Publish, then the channels on white: the agent becomes the
 * orb, eight logos pop into a 4 x 2 grid, breathe and glow in turn; WhatsApp
 * takes the centre and its green fills the frame.
 */
export const Scene09Publish: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s9;
  const env = envelope(f, dur, true, false, BUILD7.ov.s9);
  if (s >= S9_HANDOVER) return null;
  const cam = camAt(f);

  const spin = tween(f, CLICK + 0.05, CLICK + 0.2) * (1 - tween(f, 1.3, 1.4));
  const done = tween(f, 1.35, 1.6);
  const shrink = kfIO(f, [1.75, 2.25], [0, 1]);
  const orbIn = tween(f, 2.0, 2.25);
  const toCentre = kfIO(f, [2.0, 2.35], [0, 1]);
  const orbOut = kfIO(f, [2.6, LANDED - 0.1], [0, 1]); // shrinks and fades as the logos appear
  const reveal = kfIO(f, REVEAL, [0, 1]);
  const others = tween(f, HANDOFF, HANDOFF + 0.3);
  const waGlide = kfIO(f, [HANDOFF, HANDOFF + 0.45], [0, 1]);
  const waWhite = tween(f, HANDOFF + 0.2, HANDOFF + 0.36); // white as the green circle passes the logo
  const breathe = s > LANDED ? 1 + 0.015 * (1 - Math.cos(((s - LANDED) / 1.6) * Math.PI * 2)) * (1 - others) : 1;

  const logo = (i: number) => {
    const c = ORDER[i];
    const t = ease(f, [sec(POP(i)), sec(POP(i) + TRAVEL)], [0, 1]);
    const p = popIn(f, POP(i), TRAVEL, 1.04);
    const {pt} = pathPt(i, t);
    const glow = kf(f, [GLOW(i), GLOW(i) + 0.1, GLOW(i) + 0.35], [0, 1, 0]);
    return {c, p, pt, glow};
  };

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          {/* pure white, very faint lilac wash at the corners */}
          <AbsoluteFill
            style={{
              background: [
                `radial-gradient(circle at 0% 0%, ${alpha('#E9E3FF', 0.7)} 0%, ${alpha('#E9E3FF', 0)} 32%)`,
                `radial-gradient(circle at 100% 0%, ${alpha('#EFE6FF', 0.6)} 0%, ${alpha('#EFE6FF', 0)} 30%)`,
                `radial-gradient(circle at 0% 100%, ${alpha('#EFE6FF', 0.6)} 0%, ${alpha('#EFE6FF', 0)} 30%)`,
                `radial-gradient(circle at 100% 100%, ${alpha('#E9E3FF', 0.7)} 0%, ${alpha('#E9E3FF', 0)} 32%)`,
                '#FFFFFF',
              ].join(', '),
            }}
          />
        </AbsoluteFill>
      ) : null}

      {show('fg') ? (
        <>
          {/* soft coral glow + the Publish page, which then shrinks into the orb */}
          <AbsoluteFill style={{background: `radial-gradient(ellipse 40% 45% at 50% 50%, ${alpha(UI.glow.publish, 0.35)} 0%, ${alpha(UI.glow.publish, 0)} 70%)`, opacity: kf(f, [1.35, 1.6, 2.2], [0, 1, 0])}} />
          {shrink < 1 ? (
            <div style={{position: 'absolute', inset: 0, transformOrigin: `${PAGE_ORB.x}px ${PAGE_ORB.y}px`, transform: `scale(${1 - 0.9 * shrink})`, opacity: 1 - tween(f, 1.95, 2.25), filter: shrink > 0.01 ? `blur(${12 * shrink}px)` : undefined}}>
              {/* the Publish page inside the whole window (locked camera) */}
              <CameraRig cam={CONFIG_VIEW}>
                <div style={{position: 'absolute', left: 0, top: 0, opacity: tween(f, 0.1, 0.55), filter: f < 33 ? `blur(${12 * (1 - tween(f, 0.1, 0.55))}px)` : undefined}}>
                  <AppShell from="Simulator" to="Publish" slide={kfIO(f, [0.2, 0.5], [0, 1])} />
                  <div data-safe="page title" style={{position: 'absolute', left: CONTENT.x + 32, top: SHELL.y + 18, height: 52, display: 'flex', alignItems: 'center', fontFamily: UI_FONT, fontSize: 26, fontWeight: 700, color: UI.ink, whiteSpace: 'nowrap', opacity: env.inP}}>Publish</div>
                </div>
              </CameraRig>
              <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(tween(f, 0.15, 0.55), 0), fontFamily: UI_FONT}}>
                <div style={{position: 'absolute', left: PAGE_ORB.x - 300, top: 300, width: 600, height: 540, borderRadius: 30, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: `0 30px 80px rgba(13,18,36,0.10), 0 0 0 2px ${alpha(UI.glow.publish, 0.35 * kf(f, [1.35, 1.6, 2.2], [0, 1, 0]))}`}} />
                <div style={{position: 'absolute', left: PAGE_ORB.x - 300, width: 600, top: 540, textAlign: 'center', fontSize: 30, fontWeight: 700, color: UI.ink, whiteSpace: 'nowrap'}}>{AGENT}</div>
              </div>
              <Orb cx={PAGE_ORB.x} cy={PAGE_ORB.y} size={140} frame={f} opacity={tween(f, 0.2, 0.5)} />
            </div>
          ) : null}
          {shrink < 1 ? (
            <div data-safe="publish button" style={{position: 'absolute', left: PUBLISH_BTN.cx - PUBLISH_BTN.width / 2, top: PUBLISH_BTN.cy - PUBLISH_BTN.height / 2, ...dissolve(1, tween(f, 1.8, 2.15)), opacity: tween(f, 0.42, 0.55) * (1 - tween(f, 1.8, 2.15)), transform: `scale(${press(f, CLICK) * (1 - 0.9 * shrink)})`, transformOrigin: `${PAGE_ORB.x - (PUBLISH_BTN.cx - PUBLISH_BTN.width / 2)}px ${PAGE_ORB.y - (PUBLISH_BTN.cy - PUBLISH_BTN.height / 2)}px`}}>
              <PublishButton width={PUBLISH_BTN.width} height={PUBLISH_BTN.height} frame={f} spin={spin} done={done} />
            </div>
          ) : null}

          {/* TextBeat 5's underline thickens into the dark Publish button */}
          {s < 0.6 ? (
            <RectMorph from={beatUnderline('b5')} to={{x: PUBLISH_BTN.cx - PUBLISH_BTN.width / 2, y: PUBLISH_BTN.cy - PUBLISH_BTN.height / 2, w: PUBLISH_BTN.width, h: PUBLISH_BTN.height}} t={kfIO(f, [0, 0.45], [0, 1])} r0={3} r1={PUBLISH_BTN.height / 2} fill0="#8FD03C" fill1={UI.ink} opacity={1 - tween(f, 0.5, 0.6)} />
          ) : null}
          <CameraRig cam={cam}>
            {/* the greenish orb: centred, then shrinks and fades as the logos leave it */}
            {orbIn > 0 && orbOut < 1 ? <Orb cx={PAGE_ORB.x + (ORB_C.x - PAGE_ORB.x) * toCentre} cy={PAGE_ORB.y + (ORB_C.y - PAGE_ORB.y) * toCentre} size={140 + 10 * toCentre} frame={f} scale={1 - 0.6 * orbOut} opacity={Math.max(orbIn, 1 - tween(f, 1.95, 2.25) > 0 ? 1 : orbIn) * (1 - orbOut)} pulse={tween(f, 2.25, 2.75)} glow={1 - orbOut} /> : null}

            {/* one thin dotted guide arc per logo, only while it travels (at most three at once) */}
            {ORDER.map((c, i) => {
              const draw = tween(f, POP(i), POP(i) + 0.15);
              const fade = 1 - tween(f, POP(i) + 0.15, POP(i) + 0.45);
              if (draw <= 0 || fade <= 0) return null;
              const {d} = pathPt(i, 1);
              return (
                <svg key={c} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1} opacity={0.3 * fade}>
                  <defs>
                    <mask id={`m9-${c}`} maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
                      <path d={d} stroke="#fff" strokeWidth={10} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
                    </mask>
                  </defs>
                  <path d={d} stroke="#6B7280" strokeWidth={3} strokeDasharray="0.01 14" strokeLinecap="round" fill="none" mask={`url(#m9-${c})`} />
                </svg>
              );
            })}

            {/* the seven other logos (WhatsApp is drawn above the reveal) */}
            {ORDER.map((_, i) => {
              const L = logo(i);
              if (L.p <= 0 || L.c === 'whatsapp') return null;
              return (
                <ChannelLogo
                  key={L.c}
                  logo={L.c}
                  cx={L.pt.x}
                  cy={L.pt.y}
                  size={SIZE}
                  scale={(0.35 + 0.65 * L.p) * breathe * (1 - 0.3 * others)}
                  opacity={Math.min(1, L.p * 1.4) * (1 - others)}
                  blur={8 * Math.max(0, 1 - Math.min(1, L.p)) + 14 * others}
                  glow={L.glow}
                />
              );
            })}
          </CameraRig>

          {/* hand-off: WhatsApp glides to the centre, its green expands from behind it */}
          <CircleReveal cx={960} cy={540} progress={reveal}>
            <AbsoluteFill style={{background: WHATSAPP_FINAL.background}} />
          </CircleReveal>
          <CameraRig cam={cam}>
            {(() => {
              const L = logo(0);
              if (L.p <= 0) return null;
              const finalSize = WHATSAPP_FINAL.logo.size / cam.scale;
              const cx = L.pt.x + (WHATSAPP_FINAL.logo.centerX - L.pt.x) * waGlide;
              const cy = L.pt.y + (WHATSAPP_FINAL.logo.centerY - L.pt.y) * waGlide;
              const size = SIZE + (finalSize - SIZE) * waGlide;
              const sc = (0.35 + 0.65 * L.p) * (waGlide > 0 ? 1 : breathe);
              return (
                <>
                  <ChannelLogo logo="whatsapp" cx={cx} cy={cy} size={size} scale={sc} blur={8 * Math.max(0, 1 - Math.min(1, L.p))} glow={L.glow * (1 - reveal)} opacity={(1 - waWhite) * Math.min(1, L.p * 1.4)} shadow={1 - reveal} badge={s >= BADGE && s < 4.9 ? <Badge f={f} size={58} /> : null} />
                  {waWhite > 0 ? <ChannelLogo logo="whatsapp" cx={cx} cy={cy} size={size} color={WHATSAPP_FINAL.logo.color} opacity={waWhite} shadow={0} /> : null}
                </>
              );
            })()}
          </CameraRig>

          <Cursor
            frame={f}
            keys={[
              {t: 0.2, x: 1660, y: 1060},
              {t: CLICK - 0.1, x: PUBLISH_BTN.cx + 40, y: PUBLISH_BTN.cy + 12},
              {t: CLICK + 0.45, x: PUBLISH_BTN.cx + 40, y: PUBLISH_BTN.cy + 12},
              {t: 1.9, x: 1500, y: 1180},
            ]}
            clicks={[CLICK]}
            hand={[[CLICK - 0.3, CLICK + 0.35]]}
            rippleColor={COLORS.inkNavy}
            opacity={tween(f, 0.2, 0.4) * (1 - tween(f, 1.5, 1.9))}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
