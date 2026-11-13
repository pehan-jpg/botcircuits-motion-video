import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, tween} from '../theme';
import {sec} from '../timeline';
import {BUILD7, CHAT, CONFIG_VIEW, CONTENT, PUBLISH_BTN, SHELL} from '../v7';
import {toScreen} from '../components/Stage';
import {CameraRig, dissolve} from '../components/CameraRig';
import {CreamSky} from '../components/ProceduralSky';
import {IDENTITY} from '../components/Stage';
import {Cursor} from '../components/Cursor';
import {typedCount} from '../components/TypingText';
import {AppShell} from '../ui/AppShell';
import {ChatThread, chatFieldPoints, Msg} from '../ui/ChatThread';
import {PublishButton, RESULT_H, TestResultCard, TracePanel} from '../ui/Panels';
import {UI, UI_FONT} from '../ui/tokens';
import {CheckStroke} from '../components/Chip';
import {beatUnderline} from '../ui/TextBeat';
import {envelope, SceneLayerProps} from './kit';

// ---- timeline (scene seconds) ----
const NAV_CLICK = 0.2; // the pill slides to Simulator as the page arrives (TextBeat 4 introduces it)
const PAGE_IN: [number, number] = [0.4, 0.85];
const FIELD_CLICK = 1.1;
const TYPE_AT = 1.2;
const PER_CHAR = 1.0; // frames
const FIRST = 'Hi, I lost my credit card. Can you block it?';
const SEND = 2.2;
const SIM_MSGS: Msg[] = [
  {from: 'maya', text: FIRST, at: SEND + 0.05, time: '9:10 AM'},
  {from: 'agent', text: 'Can you confirm the last four digits of the card?', at: 2.6, time: '9:10 AM'},
  {from: 'maya', text: "I don't know the number.", at: 3.6, time: '9:10 AM'},
  {from: 'agent', text: "I can't verify you here. Let me bring in a teammate.", at: 3.95, time: '9:11 AM'},
];
const TICKS = [2.4, 2.75, 4.0, 4.65];
const RESULT_AT = 5.0;
const TO_BUTTON: [number, number] = [99, 100]; // the Publish button now forms from TextBeat 5's underline

// ---- layout (world): whole window, camera locked at 1.0 ----
const SIM = {x: CONTENT.x + 32, y: CONTENT.y + 28, height: CONTENT.height - 56};
const TRACE = {x: SIM.x + CHAT.width + 32, y: CONTENT.y + 28, height: 440};
const TRACE_W = CONTENT.x + CONTENT.width - 32 - TRACE.x;
const RESULT = {width: 820, height: RESULT_H, cx: CONTENT.x + CONTENT.width / 2, cy: CONTENT.y + CONTENT.height / 2};
const cam = CONFIG_VIEW;
const W = (p: {x: number; y: number}) => toScreen(cam, p);

/**
 * SCENE 8 (8 s) Simulator: click Simulator in the sidebar, the empty page,
 * type Maya's first message and send it, the agent replies while the Trace
 * lights up step by step, then the Test result. Night violet.
 */
export const Scene08Simulator: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s8;
  const env = envelope(f, dur, true, true, BUILD7.ov.s8);
  const pageIn = tween(f, PAGE_IN[0], PAGE_IN[1]);
  const resultIn = kfIO(f, [RESULT_AT, RESULT_AT + 0.5], [0, 1]);
  const toButton = kfIO(f, TO_BUTTON, [0, 1]);
  const rTL = toScreen(cam, {x: RESULT.cx - RESULT.width / 2, y: RESULT.cy - RESULT.height / 2});
  const r0 = {x: rTL.x, y: rTL.y, w: RESULT.width, h: RESULT.height};
  const r1 = {x: PUBLISH_BTN.cx - PUBLISH_BTN.width / 2, y: PUBLISH_BTN.cy - PUBLISH_BTN.height / 2, w: PUBLISH_BTN.width, h: PUBLISH_BTN.height};
  const L = (a: number, b: number) => a + (b - a) * toButton;
  const spot = resultIn; // chat and trace drop to 45% while the result is shown

  // Maya's first message typed into the field, then sent
  const n = s < SEND ? typedCount(f, sec(TYPE_AT), FIRST.length, PER_CHAR, 'sim8') : 0;
  const focus = kf(f, [FIELD_CLICK, FIELD_CLICK + 0.1, SEND + 0.1, SEND + 0.3], [0, 1, 1, 0]);
  const pts = chatFieldPoints(SIM.height);
  const fieldPt = W({x: SIM.x + pts.field.x, y: SIM.y + pts.field.y});
  const sendPt = W({x: SIM.x + pts.send.x, y: SIM.y + pts.send.y});

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <CreamSky t={s} cam={IDENTITY} frame={f} />
        </AbsoluteFill>
      ) : null}

      {show('shell') ? (
        <CameraRig cam={cam}>
          <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(tween(f, 0.1, 0.55), env.outP)}}>
            <div style={{position: 'absolute', left: TRACE.x - 200, top: TRACE.y - 180, width: TRACE_W + 400, height: 800, borderRadius: '50%', background: `radial-gradient(ellipse, ${alpha(UI.glow.testing, 0.45)} 0%, ${alpha(UI.glow.testing, 0)} 62%)`, opacity: tween(f, 2.2, 2.8)}} />
            <AppShell from="Data Sources" to="Simulator" slide={kfIO(f, [NAV_CLICK, NAV_CLICK + 0.3], [0, 1])} />
          </div>
        </CameraRig>
      ) : null}

      {show('fg') ? (
        <>
          <CameraRig cam={cam}>
            <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(pageIn, env.outP), fontFamily: UI_FONT}}>
              <div data-safe="page title" style={{position: 'absolute', left: CONTENT.x + 32, top: SHELL.y + 18, height: 52, display: 'flex', alignItems: 'center', fontSize: 26, fontWeight: 700, color: UI.ink, whiteSpace: 'nowrap'}}>Simulator</div>
              <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - 0.55 * spot}}>
                <ChatThread frame={f} msgs={SIM_MSGS} orbColor={1} x={SIM.x} y={SIM.y} height={SIM.height} draft={FIRST.slice(0, n)} focus={focus} sendPress={kf(f, [SEND, SEND + 0.07, SEND + 0.22], [0, 1, 0])} />
              </div>
              <div style={{position: 'absolute', left: TRACE.x, top: TRACE.y, opacity: 1 - 0.55 * spot}}>
                <TracePanel frame={f} ticks={TICKS} width={TRACE_W} height={TRACE.height} lineOpacity={tween(f, 0.45, 0.55)} markersAt={0.5} />
              </div>
              {/* the Trace check marks fly into the result chips */}
              {[0, 1, 3].map((step, i) => {
                const land = RESULT_AT + 0.3 + i * 0.2;
                const p = kfIO(f, [land - 0.4, land], [0, 1]);
                if (s < land - 0.4 || s > land + 0.08) return null;
                const a = {x: TRACE.x + 30 + 24, y: TRACE.y + 96 + step * 84 + 26};
                const b = {x: RESULT.cx - RESULT.width / 2 + 40 + 22 + 13, y: RESULT.cy - RESULT.height / 2 + 100 + i * 78 + 30};
                const c = {x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 120};
                const u = 1 - p;
                const x = u * u * a.x + 2 * u * p * c.x + p * p * b.x;
                const y = u * u * a.y + 2 * u * p * c.y + p * p * b.y;
                const size = 48 + (28 - 48) * p;
                return (
                  <div key={step} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2, background: '#3CC37A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(13,18,36,0.2)', zIndex: 5, opacity: 1 - tween(f, land, land + 0.08)}}>
                    <CheckStroke size={size * 0.58} draw={1} color={COLORS.white} width={3} />
                  </div>
                );
              })}
              {resultIn > 0 && toButton === 0 ? (
                <div style={{position: 'absolute', left: RESULT.cx - RESULT.width / 2, top: RESULT.cy - RESULT.height / 2, opacity: resultIn, transform: `translateY(${(1 - resultIn) * 60}px)`}}>
                  <TestResultCard frame={f} at={RESULT_AT} width={RESULT.width} />
                </div>
              ) : null}
            </div>
          </CameraRig>

          {/* the result card shrinks into the dark Publish button (shared with scene 9) */}
          {toButton > 0 && env.ownsShared ? (
            <div style={{position: 'absolute', left: L(r0.x, r1.x), top: L(r0.y, r1.y), width: L(r0.w, r1.w), height: L(r0.h, r1.h), borderRadius: L(26, r1.h / 2), background: COLORS.white, overflow: 'hidden', boxShadow: '0 30px 80px rgba(13,18,36,0.35)'}}>
              <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${L(r0.w, r1.w) / RESULT.width}, ${L(r0.h, r1.h) / RESULT.height})`, opacity: 1 - tween(f, TO_BUTTON[0] + 0.05, TO_BUTTON[0] + 0.3)}}>
                <TestResultCard frame={f} at={RESULT_AT} width={RESULT.width} />
              </div>
              <div style={{position: 'absolute', inset: 0, background: UI.ink, opacity: tween(f, TO_BUTTON[0] + 0.15, TO_BUTTON[0] + 0.5)}} />
              <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: tween(f, TO_BUTTON[0] + 0.3, TO_BUTTON[0] + 0.55)}}>
                <PublishButton width={PUBLISH_BTN.width} height={PUBLISH_BTN.height} frame={f} />
              </div>
            </div>
          ) : null}

          {/* TextBeat 4's underline rotates vertical and becomes the Trace timeline */}
          {s < 0.6 ? (() => {
            const u = beatUnderline('b4');
            const p = kfIO(f, [0, 0.5], [0, 1]);
            const a = W({x: TRACE.x + 53 + 1.5, y: TRACE.y + 120 + 126});
            const c0 = {x: u.x + u.w / 2, y: u.y + u.h / 2};
            const cx = c0.x + (a.x - c0.x) * p;
            const cy = c0.y + (a.y - c0.y) * p;
            const len = u.w + (252 - u.w) * p;
            const th = 6 + (3 - 6) * p;
            return <div style={{position: 'absolute', left: cx - len / 2, top: cy - th / 2, width: len, height: th, borderRadius: th / 2, background: `color-mix(in srgb, ${UI.border} ${Math.round(100 * p)}%, #8FD03C)`, transform: `rotate(${90 * p}deg)`, opacity: 1 - tween(f, 0.5, 0.6)}} />;
          })() : null}
          {/* cursor: the Message field, the send arrow */}
          <Cursor
            frame={f}
            keys={[
              {t: 0.5, x: 1500, y: 1000},
              {t: FIELD_CLICK - 0.05, ...fieldPt},
              {t: FIELD_CLICK + 0.15, ...fieldPt},
              {t: TYPE_AT + 0.4, x: fieldPt.x + 40, y: fieldPt.y + 110},
              {t: SEND - 0.05, ...sendPt},
              {t: SEND + 0.15, ...sendPt},
              {t: SEND + 0.8, x: 1500, y: 1000},
            ]}
            clicks={[FIELD_CLICK, SEND]}
            hand={[[FIELD_CLICK - 0.15, FIELD_CLICK + 0.15], [SEND - 0.25, SEND + 0.2]]}
            rippleColor={COLORS.inkNavy}
            opacity={tween(f, 0.5, 0.7) * (1 - tween(f, SEND + 0.35, SEND + 0.7))}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
