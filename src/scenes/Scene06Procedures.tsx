import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, press, tween} from '../theme';
import {sec} from '../timeline';
import {BUILD7, CHAT_VIEW, CONFIG_VIEW, CONTENT, SHELL} from '../v7';
import {camAt, CamKeys, toScreen} from '../components/Stage';
import {CameraRig, dissolve} from '../components/CameraRig';
import {LilacSky} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {AppShell, navPoint} from '../ui/AppShell';
import {ChatCard, CONVO, past} from '../ui/ChatCard';
import {StepsCard, STEPS_CARD, Section, layoutRows} from '../ui/Procedure';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

/** The procedure built in this scene (simplified from the real editor). */
export const SECTIONS: Section[] = [
  {
    title: 'Verify the customer',
    at: 2.5,
    rows: [
      {id: '1.1', kind: 'RUN', text: 'Ask for the last four digits of the card and the date of birth. Confirm they match the account.', into: 'verified', at: 2.6},
      {id: '1.2', kind: 'IF', cond: 'verified', condIs: 'is yes', send: "Thanks Maya, you're verified. I'll block your card now.", at: 3.95},
      {id: '1.3', kind: 'ELSE', send: "I can't verify you here. Let me bring in a teammate.", at: 4.55},
    ],
  },
  {
    title: 'Block the card',
    at: 5.15,
    rows: [
      {id: '2.1', kind: 'RUN', text: 'Block the card using the card system.', into: 'card_status', at: 5.3},
      {id: '2.2', kind: 'SEND', text: 'Your card ending 4821 is blocked. A new one is on its way.', at: 5.65},
    ],
  },
];
const L = layoutRows(SECTIONS);
const BODY_TOP = STEPS_CARD.y + STEPS_CARD.head + 19;
const rowY = (id: string) => BODY_TOP + L.rows[id].y + L.rows[id].h / 2;
const VIEWPORT = STEPS_CARD.height - STEPS_CARD.head - 19;
const SCROLL_MAX = Math.max(0, L.total - VIEWPORT + 20);
const ROW_X = STEPS_CARD.x + 560;

export const SAVE = {x: SHELL.x + SHELL.width - 30 - 70, y: SHELL.y + SHELL.header / 2, w: 140, h: 60};
export const TOGGLE = {x: SAVE.x - 70 - 30 - 40, y: SAVE.y};

const CAM: CamKeys = {
  t: [0, 0.6, 1.4, 2.5, 2.85, 3.85, 4.15, 5.1, 5.7, 6.5, 7.3, 9.6, 10.0],
  x: [CHAT_VIEW.x, CHAT_VIEW.x, CONFIG_VIEW.x, CONFIG_VIEW.x, ROW_X, ROW_X, ROW_X, ROW_X, CONFIG_VIEW.x, CONFIG_VIEW.x, CHAT_VIEW.x, CHAT_VIEW.x, CONFIG_VIEW.x],
  y: [CHAT_VIEW.y, CHAT_VIEW.y, CONFIG_VIEW.y, CONFIG_VIEW.y, rowY('1.1'), rowY('1.1'), (rowY('1.2') + rowY('1.3')) / 2, (rowY('1.2') + rowY('1.3')) / 2, CONFIG_VIEW.y, CONFIG_VIEW.y, CHAT_VIEW.y, CHAT_VIEW.y, CONFIG_VIEW.y],
  s: [CHAT_VIEW.scale, CHAT_VIEW.scale, CONFIG_VIEW.scale, CONFIG_VIEW.scale, 1.9, 1.9, 1.75, 1.75, CONFIG_VIEW.scale, CONFIG_VIEW.scale, CHAT_VIEW.scale, CHAT_VIEW.scale, CONFIG_VIEW.scale],
};
export const S6_CAM = CAM;

/** Page header of the Procedure editor (inside the shell header bar). */
export const ProcedureHeader: React.FC<{frame: number; saveAt: number}> = ({frame, saveAt}) => {
  const saved = tween(frame, saveAt + 0.08, saveAt + 0.25);
  const toggle = tween(frame, saveAt + 0.15, saveAt + 0.35);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, fontFamily: UI_FONT}}>
      <div style={{position: 'absolute', left: CONTENT.x + 32, top: SHELL.y, height: SHELL.header, display: 'flex', alignItems: 'center', gap: 14, fontSize: 31, whiteSpace: 'nowrap'}}>
        <span style={{color: UI.text2}}>Procedures</span>
        <span style={{color: '#9CA3AF'}}>/</span>
        <span style={{fontWeight: 700, fontSize: 34, color: UI.ink}}>Lost card</span>
      </div>
      <div style={{position: 'absolute', left: TOGGLE.x - 170, top: SHELL.y, height: SHELL.header, display: 'flex', alignItems: 'center', fontSize: 30, color: UI.text2, whiteSpace: 'nowrap'}}>Auto save</div>
      <div style={{position: 'absolute', left: TOGGLE.x - 32, top: TOGGLE.y - 19, width: 64, height: 38, borderRadius: 19, background: toggle > 0.5 ? '#0D1224' : '#E5E7EB', transition: undefined}}>
        <div style={{position: 'absolute', left: 4 + 26 * toggle, top: 4, width: 30, height: 30, borderRadius: 15, background: COLORS.white, boxShadow: '0 1px 4px rgba(13,18,36,0.3)'}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: SAVE.x - SAVE.w / 2,
          top: SAVE.y - SAVE.h / 2,
          width: SAVE.w,
          height: SAVE.h,
          borderRadius: 14,
          background: '#0D1224',
          color: COLORS.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          fontWeight: 600,
          transform: `scale(${press(frame, saveAt)})`,
        }}
      >
        <span style={{opacity: 1 - saved}}>Save</span>
        <span style={{position: 'absolute', opacity: saved}}>Saved</span>
      </div>
    </div>
  );
};

/**
 * SCENE 6 (10.5 s) Procedures, then proof. Lilac sky.
 */
export const Scene06Procedures: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s6;
  const env = envelope(f, dur);
  const cam = camAt(f, CAM);

  const SAVE_AT = 6.25;
  // which side is active: 1 = config (chat dims), 0 = chat (shell dims)
  const config = kfIO(f, [0.6, 1.4, 6.5, 7.3, 9.6, 10.0], [0, 1, 1, 0, 0, 1]);
  const shellIn = tween(f, 0.3, 1.0);
  const stepsIn = tween(f, 2.0, 2.6);
  const scroll = kfIO(f, [5.1, 5.5], [0, SCROLL_MAX]);
  const orbColor = tween(f, 7.0, 7.4);
  const orbPulse = tween(f, 7.1, 7.7);
  const active = s < 3.95 ? '1.1' : s < 4.55 ? '1.2' : s < 5.15 ? '1.3' : s < 5.65 ? '2.1' : '2.2';
  const activeGlow = kf(f, [2.55, 2.75, 6.0, 6.3], [0, 1, 1, 0]);

  const P = (p: {x: number; y: number}, t: number) => toScreen(camAt(sec(t), CAM), p);
  const nav = P(navPoint('Procedures'), 1.8);
  const save = P({x: SAVE.x, y: SAVE.y}, SAVE_AT);
  const ds = P(navPoint('Data Sources'), 10.0);

  return (
    <AbsoluteFill>
      {show('bg') ? (
      <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <LilacSky t={s} cam={{...cam, x: 960, y: 540}} />
        </AbsoluteFill>
      ) : null}

      {/* chat card (shared with scenes 5 and 7) */}
      {show('shell') && env.ownsShared ? (
        <CameraRig cam={cam} dim={config}>
          <ChatCard frame={f} msgs={[...past(CONVO.s5), ...CONVO.s6]} orbColor={orbColor} orbPulse={orbPulse} />
        </CameraRig>
      ) : null}

      {show('shell') ? (
        <CameraRig cam={cam} dim={1 - config}>
          {/* violet glow behind the Steps card */}
          <div
            style={{
              position: 'absolute',
              left: STEPS_CARD.x - 200,
              top: STEPS_CARD.y - 160,
              width: STEPS_CARD.width + 400,
              height: STEPS_CARD.height + 320,
              borderRadius: '50%',
              background: `radial-gradient(ellipse, ${alpha(UI.glow.procedure, 0.45)} 0%, ${alpha(UI.glow.procedure, 0)} 65%)`,
              opacity: stepsIn * (1 - env.outP),
            }}
          />
          {/* shell frame (shared with scenes 7 and 8) */}
          {env.ownsShared ? (
            <div style={{position: 'absolute', left: 0, top: 0, opacity: shellIn, filter: shellIn < 0.99 ? `blur(${14 * (1 - shellIn)}px)` : undefined, transformOrigin: `${SHELL.x + SHELL.width / 2}px ${SHELL.y + SHELL.height / 2}px`, transform: `perspective(2400px) rotateY(${-3 * (1 - shellIn)}deg)`}}>
              <AppShell from="Agent" to="Procedures" slide={kfIO(f, [1.85, 2.15], [0, 1])} />
            </div>
          ) : null}
        </CameraRig>
      ) : null}
      {show('fg') ? (
      <CameraRig cam={cam} dim={1 - config}>
        {/* page content (blur-dissolves at the seams) */}
        <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(tween(f, 1.9, 2.3), env.outP)}}>
          <ProcedureHeader frame={f} saveAt={SAVE_AT} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            ...dissolve(stepsIn, env.outP),
            transformOrigin: `${STEPS_CARD.x + STEPS_CARD.width / 2}px ${STEPS_CARD.y + STEPS_CARD.height / 2}px`,
            transform: `translateX(${(1 - stepsIn) * 200}px) perspective(2400px) rotateY(${-3 * (1 - stepsIn)}deg)`,
          }}
        >
          <StepsCard frame={f} sections={SECTIONS} scroll={scroll} activeRow={active} activeGlow={activeGlow} />
        </div>
      </CameraRig>
      ) : null}

      {show('fg') && env.ownsShared ? (
        <Cursor
          frame={f}
          keys={[
            {t: 1.1, x: 1500, y: 1120},
            {t: 1.75, x: nav.x, y: nav.y},
            {t: 1.95, x: nav.x, y: nav.y},
            {t: 2.6, x: 1720, y: 1010},
            {t: 5.7, x: 1700, y: 1000},
            {t: 6.2, x: save.x, y: save.y + 6},
            {t: 6.45, x: save.x, y: save.y + 6},
            {t: 7.1, x: 1820, y: 900},
            {t: 9.5, x: 1800, y: 920},
            {t: 10.0, x: ds.x, y: ds.y},
          ]}
          clicks={[1.8, SAVE_AT]}
          hand={[[1.55, 2.05], [6.0, 6.5], [9.75, 10.0]]}
          rippleColor={COLORS.inkNavy}
          opacity={tween(f, 1.1, 1.3) * (1 - kf(f, [6.6, 7.0, 9.35, 9.6], [0, 1, 1, 0]))}
        />
      ) : null}
    </AbsoluteFill>
  );
};
