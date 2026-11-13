import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS, NIGHT_START_S5} from '../handoff';
import {BUILD7, CHAT, CONFIG_VIEW, CONTENT, CURSOR_S7_END, PUBLISH_BTN, SHELL} from '../v7';
import {toScreen} from '../components/Stage';
import {CameraRig, dissolve} from '../components/CameraRig';
import {Backdrop} from '../components/Backdrop';
import {FallbackNight} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {typedCount} from '../components/TypingText';
import {AppShell, navPoint} from '../ui/AppShell';
import {ChatThread, chatFieldPoints, Msg} from '../ui/ChatThread';
import {PublishButton, RESULT_H, TestResultCard, TracePanel} from '../ui/Panels';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

// ---- timeline (scene seconds) ----
const NAV_CLICK = 0.35;
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
const TO_BUTTON: [number, number] = [6.9, 7.5];

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
  const env = envelope(f, dur);
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
  const navPt = W(navPoint('Simulator'));

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <Backdrop src={BACKDROPS.night5b} t={s + NIGHT_START_S5} span={8} cam={{...cam, x: 960, y: 540}} scrim="dark" pan={[4, -3]} fallback={<FallbackNight />} />
        </AbsoluteFill>
      ) : null}

      {show('shell') ? (
        <CameraRig cam={cam}>
          <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(1, env.outP)}}>
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
                <TracePanel frame={f} ticks={TICKS} width={TRACE_W} height={TRACE.height} />
              </div>
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

          {/* cursor: Simulator in the sidebar, the Message field, the send arrow */}
          <Cursor
            frame={f}
            keys={[
              {t: 0, ...CURSOR_S7_END},
              {t: NAV_CLICK - 0.05, ...navPt},
              {t: NAV_CLICK + 0.15, ...navPt},
              {t: FIELD_CLICK - 0.05, ...fieldPt},
              {t: FIELD_CLICK + 0.15, ...fieldPt},
              {t: TYPE_AT + 0.4, x: fieldPt.x + 40, y: fieldPt.y + 110},
              {t: SEND - 0.05, ...sendPt},
              {t: SEND + 0.15, ...sendPt},
              {t: SEND + 0.8, x: 1500, y: 1000},
            ]}
            clicks={[NAV_CLICK, FIELD_CLICK, SEND]}
            hand={[[NAV_CLICK - 0.2, NAV_CLICK + 0.15], [FIELD_CLICK - 0.15, FIELD_CLICK + 0.15], [SEND - 0.25, SEND + 0.2]]}
            rippleColor={COLORS.inkNavy}
            opacity={1 - tween(f, SEND + 0.35, SEND + 0.7)}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
