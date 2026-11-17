import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, press, tween} from '../theme';
import {sec} from '../timeline';
import {BUILD7, CHAT, CHAT_VIEW, CONFIG_VIEW, CONTENT, SHELL} from '../v7';
import {camAt, CamKeys, toScreen} from '../components/Stage';
import {CameraRig, dissolve, isPanning} from '../components/CameraRig';
import {LilacSky} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {AppShell, navPoint} from '../ui/AppShell';
import {ChatThread, CONVO, lastBlockGeom, past} from '../ui/ChatThread';
import {FlyChip} from '../ui/FlyChip';
import {RectMorph} from '../components/Morph';
import {beatUnderline} from '../ui/TextBeat';
import {StepsCard, STEPS_CARD, Section, rowTextAnchor, rowTextEnd} from '../ui/Procedure';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

const VERIFIED_TEXT = "Thanks Maya, you're verified. I'll block your card now.";
/** The procedure built in this scene. */
export const SECTIONS: Section[] = [
  {
    title: 'Verify the customer',
    at: 0.95,
    rows: [
      {id: '1.1', kind: 'RUN', text: 'Ask for the last four digits of the card and the date of birth. Confirm they match the account.', into: 'verified', at: 1.05},
      {id: '1.2', kind: 'IF', cond: 'verified', condIs: 'is yes', send: VERIFIED_TEXT, at: 2.0},
      {id: '1.3', kind: 'ELSE', send: "I can't verify you here. Let me bring in a teammate.", at: 2.5},
    ],
  },
  {
    title: 'Block the card',
    at: 2.95,
    rows: [
      {id: '2.1', kind: 'RUN', text: 'Block the card using the card system.', into: 'card_status', at: 3.05},
      {id: '2.2', kind: 'SEND', text: 'Your card ending 4821 is blocked. A new one is on its way.', at: 3.5},
    ],
  },
];
const ALL_ROWS = SECTIONS.flatMap((s) => s.rows);
const SAVE_AT = 4.15;
export const SAVE = {x: SHELL.x + SHELL.width - 28 - 60, y: SHELL.y + SHELL.header / 2, w: 120, h: 52};
export const TOGGLE = {x: SAVE.x - 60 - 28 - 32, y: SAVE.y};

const CAM: CamKeys = {
  t: [0, 4.5, 5.1],
  x: [CONFIG_VIEW.x, CONFIG_VIEW.x, CHAT_VIEW.x],
  y: [540, 540, 540],
  s: [1, 1, 1],
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
  const env = envelope(f, dur, true, true, BUILD7.ov.s6);
  const cam = camAt(f, CAM);
  const panning = isPanning((fr) => camAt(fr, CAM), f);

  const config = kfIO(f, [4.5, 5.1], [1, 0]);
  const shellIn = tween(f, 0.1, 0.55);
  const pageIn = tween(f, 0.75, 1.0); // skeleton -> live page after the click
  const unroll = kfIO(f, [0.35, 0.8], [0, 1]);
  const ulMorph = kfIO(f, [0, 0.4], [0, 1]);
  const orbColor = tween(f, 5.0, 5.35); // the first configured reply
  const orbPulse = tween(f, 5.1, 5.7);
  const active = ALL_ROWS.reduce((a, r) => (s >= r.at ? r.id : a), ALL_ROWS[0].id);
  const spotlight = kf(f, [1.1, 1.3, rowTextEnd(ALL_ROWS[ALL_ROWS.length - 1]) + 0.2, rowTextEnd(ALL_ROWS[ALL_ROWS.length - 1]) + 0.5], [0, 1, 1, 0]);

  const P = (p: {x: number; y: number}, t: number) => toScreen(camAt(sec(t), CAM), p);
  const nav = P(navPoint('Procedures'), 0.7);
  const save = P({x: SAVE.x, y: SAVE.y}, SAVE_AT);
  // shared element: the SEND text of step 1.2 lifts out and lands as the verified bubble
  const LIFT = 4.3;
  const anchor = rowTextAnchor(SECTIONS, '1.2', sec(LIFT));
  const a0 = P({x: anchor.x - 20, y: anchor.y - 16}, LIFT);
  const msgs6 = [...past(CONVO.s5), ...CONVO.s6];
  const g = lastBlockGeom(msgs6, CHAT.height, false);
  const land = toScreen(CHAT_VIEW, {x: CHAT.x + g.bubble.x, y: CHAT.y + g.bubble.y});
  const LAND = CONVO.s6[2].at;
  const flyKeys = [
    {t: LIFT, x: a0.x, y: a0.y, w: anchor.w + 40, o: 0},
    {t: LIFT + 0.2, x: a0.x, y: a0.y - 30, w: anchor.w + 40},
    {t: 5.1, x: 1300, y: 470, w: g.bubble.w, s: 0.85, o: 0.6},
    {t: LAND - 0.25, x: 1290, y: 455, w: g.bubble.w, s: 0.85, o: 0.6},
    {t: LAND, x: land.x, y: land.y, w: g.bubble.w},
    {t: LAND + 0.3, x: land.x, y: land.y, w: g.bubble.w, o: 0},
  ];

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
            <ChatThread frame={f} msgs={msgs6} orbColor={orbColor} orbPulse={orbPulse} />
          </CameraRig>
          <CameraRig cam={cam} dim={1 - config} panning={panning}>
            <div style={{position: 'absolute', left: SHELL.x - 200, top: SHELL.y - 160, width: SHELL.width + 400, height: SHELL.height + 320, borderRadius: '50%', background: `radial-gradient(ellipse, ${alpha(UI.glow.procedure, 0.4)} 0%, ${alpha(UI.glow.procedure, 0)} 62%)`, opacity: tween(f, 0.6, 1.2)}} />
            <div style={{position: 'absolute', left: 0, top: 0, opacity: shellIn, filter: shellIn < 0.99 ? `blur(${12 * (1 - shellIn)}px)` : undefined}}>
              <AppShell from="Agent" to="Procedures" slide={kfIO(f, [0.7, 1.0], [0, 1])} />
            </div>
          </CameraRig>
        </>
      ) : null}

      {show('fg') ? (
        <>
          <CameraRig cam={cam} dim={1 - config} panning={panning}>
            <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(1, env.outP), opacity: (0.6 + 0.4 * pageIn) * (1 - env.outP)}}>
              <div style={{opacity: shellIn}}><ProcedureHeader frame={f} saveAt={SAVE_AT} /></div>
              <StepsCard frame={f} sections={SECTIONS} active={active} spotlight={spotlight} skeleton={1 - pageIn} unroll={unroll} />
            </div>
          </CameraRig>
          {s < 0.65 ? (
            <RectMorph from={beatUnderline('b2')} to={{...P({x: STEPS_CARD.x, y: STEPS_CARD.y}, 0), w: STEPS_CARD.width, h: 6}} t={ulMorph} r0={3} r1={3} fill0="#8FD03C" fill1="#8FD03C" opacity={1 - tween(f, 0.45, 0.65)} />
          ) : null}
          <FlyChip frame={f} keys={flyKeys}>{VERIFIED_TEXT}</FlyChip>
          {env.ownsShared ? (
            <Cursor
              frame={f}
              keys={[
                {t: 0.3, x: 1500, y: 1000},
                {t: 0.65, x: nav.x, y: nav.y},
                {t: 0.85, x: nav.x, y: nav.y},
                {t: 1.4, x: 1640, y: 1000},
                {t: 3.6, x: 1660, y: 990},
                {t: SAVE_AT - 0.1, x: save.x, y: save.y + 6},
                {t: SAVE_AT + 0.2, x: save.x, y: save.y + 6},
                {t: 4.8, x: 1780, y: 1010},
              ]}
              clicks={[0.7, SAVE_AT]}
              hand={[[0.5, 0.9], [SAVE_AT - 0.25, SAVE_AT + 0.25]]}
              rippleColor={COLORS.inkNavy}
              opacity={tween(f, 0.3, 0.5) * (1 - tween(f, 4.5, 4.75))}
            />
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
export const S6_STEPS_FINAL = STEPS_CARD;
