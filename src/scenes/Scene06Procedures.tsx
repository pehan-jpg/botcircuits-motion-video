import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, press, tween} from '../theme';
import {sec} from '../timeline';
import {BUILD7, CHAT_VIEW, CONFIG_VIEW, CONTENT, SHELL} from '../v7';
import {camAt, CamKeys, toScreen} from '../components/Stage';
import {CameraRig, dissolve, isPanning} from '../components/CameraRig';
import {LilacSky} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {AppShell, navPoint} from '../ui/AppShell';
import {ChatThread, CONVO, past} from '../ui/ChatThread';
import {StepsCard, STEPS_CARD, Section, rowTextEnd} from '../ui/Procedure';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

/** The procedure built in this scene. */
export const SECTIONS: Section[] = [
  {
    title: 'Verify the customer',
    at: 2.2,
    rows: [
      {id: '1.1', kind: 'RUN', text: 'Ask for the last four digits of the card and the date of birth. Confirm they match the account.', into: 'verified', at: 2.3},
      {id: '1.2', kind: 'IF', cond: 'verified', condIs: 'is yes', send: "Thanks Maya, you're verified. I'll block your card now.", at: 3.45},
      {id: '1.3', kind: 'ELSE', send: "I can't verify you here. Let me bring in a teammate.", at: 4.05},
    ],
  },
  {
    title: 'Block the card',
    at: 4.65,
    rows: [
      {id: '2.1', kind: 'RUN', text: 'Block the card using the card system.', into: 'card_status', at: 4.75},
      {id: '2.2', kind: 'SEND', text: 'Your card ending 4821 is blocked. A new one is on its way.', at: 5.3},
    ],
  },
];
const ALL_ROWS = SECTIONS.flatMap((s) => s.rows);
const SAVE_AT = 6.0;
export const SAVE = {x: SHELL.x + SHELL.width - 28 - 60, y: SHELL.y + SHELL.header / 2, w: 120, h: 52};
export const TOGGLE = {x: SAVE.x - 60 - 28 - 32, y: SAVE.y};

const CAM: CamKeys = {
  t: [0, 0.6, 1.4, 6.3, 7.1, 9.5, 10.0],
  x: [CHAT_VIEW.x, CHAT_VIEW.x, CONFIG_VIEW.x, CONFIG_VIEW.x, CHAT_VIEW.x, CHAT_VIEW.x, CONFIG_VIEW.x],
  y: [540, 540, 540, 540, 540, 540, 540],
  s: [1, 1, 1, 1, 1, 1, 1],
};

/** Page header of the Procedure editor (inside the window header bar). */
export const ProcedureHeader: React.FC<{frame: number; saveAt: number}> = ({frame, saveAt}) => {
  const saved = tween(frame, saveAt + 0.08, saveAt + 0.25);
  const toggle = tween(frame, saveAt + 0.15, saveAt + 0.35);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, fontFamily: UI_FONT}}>
      <div data-safe="page title" style={{position: 'absolute', left: CONTENT.x + 32, top: SHELL.y + 18, height: 52, display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, whiteSpace: 'nowrap'}}>
        <span style={{color: UI.text2}}>Procedures</span>
        <span style={{color: '#9CA3AF'}}>/</span>
        <span style={{fontWeight: 700, fontSize: 26, color: UI.ink}}>Lost card</span>
      </div>
      <div style={{position: 'absolute', left: TOGGLE.x - 140, top: SHELL.y + 18, height: 52, display: 'flex', alignItems: 'center', fontSize: 22, color: UI.text2, whiteSpace: 'nowrap'}}>Auto save</div>
      <div style={{position: 'absolute', left: TOGGLE.x - 28, top: TOGGLE.y - 17, width: 56, height: 34, borderRadius: 17, background: toggle > 0.5 ? UI.ink : '#E5E7EB'}}>
        <div style={{position: 'absolute', left: 4 + 22 * toggle, top: 4, width: 26, height: 26, borderRadius: 13, background: COLORS.white, boxShadow: '0 1px 4px rgba(13,18,36,0.3)'}} />
      </div>
      <div style={{position: 'absolute', left: SAVE.x - SAVE.w / 2, top: SAVE.y - SAVE.h / 2, width: SAVE.w, height: SAVE.h, borderRadius: 14, background: UI.ink, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, transform: `scale(${press(frame, saveAt)})`}}>
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
  const panning = isPanning((fr) => camAt(fr, CAM), f);

  const config = kfIO(f, [0.6, 1.4, 6.3, 7.1, 9.5, 10.0], [0, 1, 1, 0, 0, 1]);
  const pageIn = tween(f, 1.85, 2.2); // skeleton -> live page after the click
  const orbColor = tween(f, 6.95, 7.3);
  const orbPulse = tween(f, 7.0, 7.6);
  const active = ALL_ROWS.reduce((a, r) => (s >= r.at ? r.id : a), ALL_ROWS[0].id);
  const spotlight = kf(f, [2.3, 2.5, rowTextEnd(ALL_ROWS[ALL_ROWS.length - 1]) + 0.2, rowTextEnd(ALL_ROWS[ALL_ROWS.length - 1]) + 0.5], [0, 1, 1, 0]);

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

      {show('shell') && env.ownsShared ? (
        <>
          <CameraRig cam={cam} dim={config} panning={panning}>
            <ChatThread frame={f} msgs={[...past(CONVO.s5), ...CONVO.s6]} orbColor={orbColor} orbPulse={orbPulse} />
          </CameraRig>
          <CameraRig cam={cam} dim={1 - config} panning={panning}>
            <div style={{position: 'absolute', left: SHELL.x - 200, top: SHELL.y - 160, width: SHELL.width + 400, height: SHELL.height + 320, borderRadius: '50%', background: `radial-gradient(ellipse, ${alpha(UI.glow.procedure, 0.4)} 0%, ${alpha(UI.glow.procedure, 0)} 62%)`, opacity: tween(f, 2.0, 2.6)}} />
            <AppShell from="Agent" to="Procedures" slide={kfIO(f, [1.85, 2.15], [0, 1])} />
          </CameraRig>
        </>
      ) : null}

      {show('fg') ? (
        <>
          <CameraRig cam={cam} dim={1 - config} panning={panning}>
            <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(1, env.outP), opacity: (0.45 + 0.55 * pageIn) * (1 - env.outP)}}>
              <ProcedureHeader frame={f} saveAt={SAVE_AT} />
              <StepsCard frame={f} sections={SECTIONS} active={active} spotlight={spotlight} skeleton={1 - pageIn} />
            </div>
          </CameraRig>
          {env.ownsShared ? (
            <Cursor
              frame={f}
              keys={[
                {t: 1.0, x: 1500, y: 1120},
                {t: 1.75, x: nav.x, y: nav.y},
                {t: 1.95, x: nav.x, y: nav.y},
                {t: 2.6, x: 1640, y: 1000},
                {t: 5.4, x: 1660, y: 990},
                {t: 5.9, x: save.x, y: save.y + 6},
                {t: 6.2, x: save.x, y: save.y + 6},
                {t: 6.7, x: 1780, y: 1010},
                {t: 9.5, x: 1500, y: 1000},
                {t: 10.0, x: ds.x, y: ds.y},
              ]}
              clicks={[1.8, SAVE_AT]}
              hand={[[1.55, 2.05], [5.75, 6.25], [9.75, 10.0]]}
              rippleColor={COLORS.inkNavy}
              opacity={tween(f, 1.0, 1.2) * (1 - kf(f, [6.35, 6.7, 9.35, 9.6], [0, 1, 1, 0]))}
            />
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
export const S6_STEPS_FINAL = STEPS_CARD;
