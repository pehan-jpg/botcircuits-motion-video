import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kfIO, tween} from '../theme';
import {BACKDROPS, NIGHT_START_S5} from '../handoff';
import {BUILD7, CHAT, CONFIG_VIEW, CONTENT, PUBLISH_BTN, SHELL} from '../v7';
import {toScreen} from '../components/Stage';
import {CameraRig, dissolve} from '../components/CameraRig';
import {Backdrop} from '../components/Backdrop';
import {FallbackNight} from '../components/ProceduralSky';
import {AppShell} from '../ui/AppShell';
import {ChatThread, Msg} from '../ui/ChatThread';
import {PublishButton, TestResultCard, TracePanel} from '../ui/Panels';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

const SIM_MSGS: Msg[] = [
  {from: 'maya', text: 'Hi, I lost my credit card. Can you block it?', at: 0.6, time: '9:10 AM'},
  {from: 'agent', text: 'Can you confirm the last four digits of the card?', at: 0.95, time: '9:10 AM'},
  {from: 'maya', text: "I don't know the number.", at: 1.75, time: '9:10 AM'},
  {from: 'agent', text: "I can't verify you here. Let me bring in a teammate.", at: 2.05, time: '9:11 AM'},
];
const TICKS = [1.0, 1.45, 2.15, 2.8];
const SIM_SCALE = 0.84;
const SIM = {x: CONTENT.x + 32, y: CONTENT.y + 28};
const TRACE = {x: SIM.x + CHAT.width * SIM_SCALE + 32, y: CONTENT.y + 28, height: 440};
const TRACE_W = CONTENT.x + CONTENT.width - 32 - TRACE.x;
const RESULT = {width: 820, height: 500, cx: CONTENT.x + CONTENT.width / 2, cy: CONTENT.y + CONTENT.height / 2};
const cam = CONFIG_VIEW;

/**
 * SCENE 8 (6 s) Test in the Simulator. Night violet. Whole window visible.
 */
export const Scene08Simulator: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s8;
  const env = envelope(f, dur);
  const resultIn = kfIO(f, [3.1, 3.6], [0, 1]);
  const toButton = kfIO(f, [4.9, 5.5], [0, 1]);
  const rTL = toScreen(cam, {x: RESULT.cx - RESULT.width / 2, y: RESULT.cy - RESULT.height / 2});
  const r0 = {x: rTL.x, y: rTL.y, w: RESULT.width, h: RESULT.height};
  const r1 = {x: PUBLISH_BTN.cx - PUBLISH_BTN.width / 2, y: PUBLISH_BTN.cy - PUBLISH_BTN.height / 2, w: PUBLISH_BTN.width, h: PUBLISH_BTN.height};
  const L = (a: number, b: number) => a + (b - a) * toButton;
  const spot = resultIn; // chat and trace drop to 45% while the result is shown

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
            <div style={{position: 'absolute', left: TRACE.x - 200, top: TRACE.y - 180, width: TRACE_W + 400, height: 800, borderRadius: '50%', background: `radial-gradient(ellipse, ${alpha(UI.glow.testing, 0.45)} 0%, ${alpha(UI.glow.testing, 0)} 62%)`, opacity: tween(f, 0.6, 1.2)}} />
            <AppShell from="Data Sources" to="Simulator" slide={kfIO(f, [0.05, 0.35], [0, 1])} />
          </div>
        </CameraRig>
      ) : null}

      {show('fg') ? (
        <>
          <CameraRig cam={cam}>
            <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(env.inP, env.outP), fontFamily: UI_FONT}}>
              <div data-safe="page title" style={{position: 'absolute', left: CONTENT.x + 32, top: SHELL.y + 18, height: 52, display: 'flex', alignItems: 'center', fontSize: 26, fontWeight: 700, color: UI.ink, whiteSpace: 'nowrap'}}>Simulator</div>
              <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - 0.55 * spot}}>
                <ChatThread frame={f} msgs={SIM_MSGS} orbColor={1} x={SIM.x} y={SIM.y} scale={SIM_SCALE} />
              </div>
              <div style={{position: 'absolute', left: TRACE.x, top: TRACE.y, opacity: 1 - 0.55 * spot}}>
                <TracePanel frame={f} ticks={TICKS} width={TRACE_W} height={TRACE.height} />
              </div>
              {resultIn > 0 && toButton === 0 ? (
                <div style={{position: 'absolute', left: RESULT.cx - RESULT.width / 2, top: RESULT.cy - RESULT.height / 2, opacity: resultIn, transform: `translateY(${(1 - resultIn) * 60}px) perspective(2400px) rotateX(${3 * (1 - resultIn)}deg)`}}>
                  <TestResultCard frame={f} at={3.1} width={RESULT.width} />
                </div>
              ) : null}
            </div>
          </CameraRig>

          {/* the result card shrinks into the dark Publish button (shared with scene 9) */}
          {toButton > 0 && env.ownsShared ? (
            <div style={{position: 'absolute', left: L(r0.x, r1.x), top: L(r0.y, r1.y), width: L(r0.w, r1.w), height: L(r0.h, r1.h), borderRadius: L(26, r1.h / 2), background: COLORS.white, overflow: 'hidden', boxShadow: '0 30px 80px rgba(13,18,36,0.35)'}}>
              <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${L(r0.w, r1.w) / RESULT.width}, ${L(r0.h, r1.h) / RESULT.height})`, opacity: 1 - tween(f, 4.95, 5.2)}}>
                <TestResultCard frame={f} at={3.1} width={RESULT.width} />
              </div>
              <div style={{position: 'absolute', inset: 0, background: UI.ink, opacity: tween(f, 5.05, 5.4)}} />
              <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: tween(f, 5.2, 5.45)}}>
                <PublishButton width={PUBLISH_BTN.width} height={PUBLISH_BTN.height} frame={f} />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
