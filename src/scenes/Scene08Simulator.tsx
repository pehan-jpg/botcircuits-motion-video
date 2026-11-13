import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kfIO, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS, NIGHT_START_S5} from '../handoff';
import {BUILD7, CONFIG_VIEW, CONTENT, PUBLISH_BTN, SHELL} from '../v7';
import {camAt, CamKeys, toScreen} from '../components/Stage';
import {CameraRig, dissolve} from '../components/CameraRig';
import {Backdrop} from '../components/Backdrop';
import {FallbackNight} from '../components/ProceduralSky';
import {AppShell} from '../ui/AppShell';
import {ChatCard, ChatMsg, CONVO, past} from '../ui/ChatCard';
import {PublishButton, TestResultCard, TracePanel} from '../ui/Panels';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

const SIM_MSGS: ChatMsg[] = [
  {from: 'maya', text: 'I lost my card.', at: 0.7},
  {from: 'agent', text: 'Can you confirm the last four digits of the card?', at: 0.95},
  {from: 'maya', text: "I don't know the number.", at: 1.75},
  {from: 'agent', text: "I can't verify you here. Let me bring in a teammate.", at: 2.0},
];
const TICKS = [1.0, 1.4, 2.05, 2.55];
const SIM = {x: CONTENT.x + 26, y: CONTENT.y + 16, scale: 0.94};
const TRACE = {x: CONTENT.x + 26 + 480 * 0.94 + 30, y: CONTENT.y + 30, width: CONTENT.width - 26 - 480 * 0.94 - 30 - 26, height: 520};
const CONTENT_C = {x: CONTENT.x + CONTENT.width / 2, y: CONTENT.y + CONTENT.height / 2};
const RESULT = {width: 900, cx: CONTENT_C.x, cy: CONTENT_C.y + 10};

const CAM: CamKeys = {
  t: [0, 0.5, 1.2, 3.0, 3.6, 4.35, 4.85, 5.5],
  x: [CONFIG_VIEW.x, CONFIG_VIEW.x, CONTENT_C.x, CONTENT_C.x, CONTENT_C.x, RESULT.cx, RESULT.cx, RESULT.cx],
  y: [CONFIG_VIEW.y, CONFIG_VIEW.y, CONTENT_C.y, CONTENT_C.y, CONTENT_C.y, RESULT.cy + 40, RESULT.cy + 40, RESULT.cy + 40],
  s: [CONFIG_VIEW.scale, CONFIG_VIEW.scale, 1.18, 1.18, 1.18, 1.62, 1.62, 1.62],
};

/**
 * SCENE 8 (6 s) Test in the Simulator. Night violet.
 */
export const Scene08Simulator: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s8;
  const env = envelope(f, dur);
  const cam = camAt(f, CAM);
  const shrinkChat = kfIO(f, [3.0, 3.45], [0, 1]);
  const resultIn = kfIO(f, [3.2, 3.7], [0, 1]);
  const toButton = kfIO(f, [4.9, 5.5], [0, 1]);
  // result card rect on screen at the start of the shrink
  const cam0 = camAt(sec(4.9), CAM);
  const rTL = toScreen(cam0, {x: RESULT.cx - RESULT.width / 2, y: RESULT.cy - 280});
  const r0 = {x: rTL.x, y: rTL.y, w: RESULT.width * cam0.scale, h: 560 * cam0.scale};
  const r1 = {x: PUBLISH_BTN.cx - PUBLISH_BTN.width / 2, y: PUBLISH_BTN.cy - PUBLISH_BTN.height / 2, w: PUBLISH_BTN.width, h: PUBLISH_BTN.height};
  const L = (a: number, b: number) => a + (b - a) * toButton;

  return (
    <AbsoluteFill>
      {show('bg') ? (
      <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <Backdrop src={BACKDROPS.night5b} t={s + NIGHT_START_S5} span={8} cam={{...cam, x: 960, y: 540}} scrim="dark" pan={[4, -3]} fallback={<FallbackNight />} />
        </AbsoluteFill>
      ) : null}

      {show('shell') ? (
        <>
      {/* the chat card hands over to the Simulator (blur dissolve) */}
      <CameraRig cam={cam} dim={1}>
        <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(1, tween(f, 0, 0.5))}}>
          <ChatCard frame={f} msgs={past(CONVO.s5, CONVO.s6, CONVO.s7)} orbColor={1} />
        </div>
      </CameraRig>

      <CameraRig cam={cam}>
        {/* shell: shared from scene 7, dissolves out at the tail */}
        <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(1, env.outP)}}>
          <AppShell from="Data Sources" to="Simulator" slide={kfIO(f, [0.05, 0.35], [0, 1])} />
        </div>
      </CameraRig>
        </>
      ) : null}
      {show('fg') ? (
        <>
      <CameraRig cam={cam}>
        <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(env.inP, env.outP), fontFamily: UI_FONT}}>
          <div style={{position: 'absolute', left: CONTENT.x + 32, top: SHELL.y, height: SHELL.header, display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 700, color: UI.ink}}>Simulator</div>
          {/* blue glow behind the trace */}
          <div style={{position: 'absolute', left: TRACE.x - 220, top: TRACE.y - 200, width: TRACE.width + 440, height: TRACE.height + 400, borderRadius: '50%', background: `radial-gradient(ellipse, ${alpha(UI.glow.testing, 0.45)} 0%, ${alpha(UI.glow.testing, 0)} 62%)`, opacity: tween(f, 0.6, 1.2) * (1 - resultIn * 0.6)}} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transformOrigin: `${SIM.x}px ${SIM.y}px`,
              transform: `translate(${SIM.x}px, ${SIM.y}px) scale(${SIM.scale * (1 - 0.45 * shrinkChat)}) translate(${-0}px, ${-140}px)`,
              opacity: 1 - 0.5 * shrinkChat,
            }}
          >
            <ChatCard frame={f} msgs={SIM_MSGS} orbColor={1} x={0} y={140} />
          </div>
          <div style={{position: 'absolute', left: TRACE.x, top: TRACE.y, opacity: 1 - 0.7 * resultIn, transform: `scale(${1 - 0.06 * resultIn})`}}>
            <TracePanel frame={f} ticks={TICKS} width={TRACE.width} height={TRACE.height} />
          </div>
          {/* test result card */}
          {resultIn > 0 && toButton === 0 ? (
            <div style={{position: 'absolute', left: RESULT.cx - RESULT.width / 2, top: RESULT.cy - 280, opacity: resultIn, transform: `translateY(${(1 - resultIn) * 80}px) perspective(2400px) rotateX(${3 * (1 - resultIn)}deg)`}}>
              <TestResultCard frame={f} at={3.2} width={RESULT.width} />
            </div>
          ) : null}
        </div>
      </CameraRig>

      {/* the result card shrinks into the dark Publish button (shared with scene 9) */}
      {toButton > 0 && env.ownsShared ? (
        <div
          style={{
            position: 'absolute',
            left: L(r0.x, r1.x),
            top: L(r0.y, r1.y),
            width: L(r0.w, r1.w),
            height: L(r0.h, r1.h),
            borderRadius: L(26 * cam0.scale, r1.h / 2),
            background: COLORS.white,
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(13,18,36,0.35)',
          }}
        >
          {/* the result card's content shrinks with it and fades as it turns into the button */}
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${L(r0.w, r1.w) / RESULT.width}, ${L(r0.h, r1.h) / 560})`, opacity: 1 - tween(f, 4.95, 5.2)}}>
            <TestResultCard frame={f} at={3.2} width={RESULT.width} />
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

