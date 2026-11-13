import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS} from '../handoff';
import {BUILD7, CHAT, CHAT_VIEW, CONFIG_VIEW, CONTENT, SHELL} from '../v7';
import {camAt, CamKeys, toScreen} from '../components/Stage';
import {CameraRig, dissolve} from '../components/CameraRig';
import {Backdrop} from '../components/Backdrop';
import {FallbackPeach} from '../components/ProceduralSky';
import {Cursor} from '../components/Cursor';
import {StrokeLine, Cubic, cubicPoint} from '../components/StrokeLine';
import {AppShell, navPoint} from '../ui/AppShell';
import {ChatCard, CONVO, past} from '../ui/ChatCard';
import {FlipCounter, SourceIcon, SourceKind, SourceRow} from '../ui/Panels';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

const SOURCES: {kind: SourceKind; name: string}[] = [
  {kind: 'pdf', name: 'Card policy.pdf'},
  {kind: 'web', name: 'Help centre'},
  {kind: 'notion', name: 'Support wiki'},
];
const DROP = {x: CONTENT.x + 40, y: CONTENT.y + 36, width: CONTENT.width - 80, height: 250};
const ROWS_Y = DROP.y + DROP.height + 40;
const ROW_H = 100;
const ROW_GAP = 22;
const ARRIVE = [0.6, 1.0, 1.4];
const ORIGINS = [
  {x: SHELL.x + SHELL.width + 260, y: 180},
  {x: SHELL.x + SHELL.width + 300, y: 520},
  {x: SHELL.x + SHELL.width + 220, y: 860},
];
const rowCentre = (i: number) => ({x: DROP.x + DROP.width / 2, y: ROWS_Y + i * (ROW_H + ROW_GAP) + ROW_H / 2});
const LIST_C = {x: DROP.x + DROP.width / 2, y: ROWS_Y + (3 * ROW_H + 2 * ROW_GAP) / 2};
const ORB_BADGE = {x: CHAT.x + CHAT.width / 2, y: CHAT.y + 74};

const CAM: CamKeys = {
  t: [0, 0.5, 2.2, 2.8, 3.9, 4.4, 5.1, 6.6, 7.3, 8.0],
  x: [CONFIG_VIEW.x, CONFIG_VIEW.x, CONFIG_VIEW.x, LIST_C.x, LIST_C.x, CONFIG_VIEW.x, CHAT_VIEW.x, CHAT_VIEW.x, CONFIG_VIEW.x, CONFIG_VIEW.x],
  y: [CONFIG_VIEW.y, CONFIG_VIEW.y, CONFIG_VIEW.y, LIST_C.y, LIST_C.y, CONFIG_VIEW.y, CHAT_VIEW.y, CHAT_VIEW.y, CONFIG_VIEW.y, CONFIG_VIEW.y],
  s: [CONFIG_VIEW.scale, CONFIG_VIEW.scale, CONFIG_VIEW.scale, 1.45, 1.45, CONFIG_VIEW.scale, CHAT_VIEW.scale, CHAT_VIEW.scale, CONFIG_VIEW.scale, CONFIG_VIEW.scale],
};

/**
 * SCENE 7 (8 s) Knowledge, then proof. Peach clouds.
 */
export const Scene07Knowledge: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s7;
  const env = envelope(f, dur);
  const cam = camAt(f, CAM);
  const config = kfIO(f, [4.4, 5.1, 6.6, 7.3], [1, 0, 0, 1]);
  const READY = ARRIVE.map((a) => a + 1.4);
  const focusRow = kf(f, [2.9, 3.2, 3.5, 3.8], [0, 1, 1, 2]);
  const collapse = (i: number) => kfIO(f, [6.75 + i * 0.12, 7.25 + i * 0.12], [0, 1]);
  const P = (p: {x: number; y: number}, t: number) => toScreen(camAt(sec(t), CAM), p);
  const sim = P(navPoint('Simulator'), 7.5);
  const listScreen = P({x: LIST_C.x + 300, y: LIST_C.y + 40}, 3.0);

  return (
    <AbsoluteFill>
      {show('bg') ? (
      <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <Backdrop src={BACKDROPS.peach6} t={s} span={8} cam={cam} scrim="light" fallback={<FallbackPeach t={s} cam={cam} />} />
        </AbsoluteFill>
      ) : null}

      {show('shell') && env.ownsShared ? (
        <CameraRig cam={cam} dim={config}>
          <ChatCard frame={f} msgs={[...past(CONVO.s5, CONVO.s6), ...CONVO.s7]} orbColor={1} orbPulse={SOURCES.reduce((m, _, i) => (s > 7.15 + i * 0.12 && s < 7.65 + i * 0.12 ? tween(f, 7.15 + i * 0.12, 7.65 + i * 0.12) : m), 0)} />
        </CameraRig>
      ) : null}

      {show('shell') ? (
        <CameraRig cam={cam} dim={1 - config}>
        {/* mint glow behind the list */}
        <div
          style={{
            position: 'absolute',
            left: LIST_C.x - 700,
            top: LIST_C.y - 420,
            width: 1400,
            height: 840,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${alpha(UI.glow.knowledge, 0.5)} 0%, ${alpha(UI.glow.knowledge, 0)} 62%)`,
            opacity: tween(f, 1.0, 1.8) * (1 - env.outP),
          }}
        />
        {env.ownsShared ? <AppShell from="Procedures" to="Data Sources" slide={kfIO(f, [0.05, 0.35], [0, 1])} /> : null}

        </CameraRig>
      ) : null}
      {show('fg') ? (
      <CameraRig cam={cam} dim={1 - config}>
        <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(env.inP, env.outP), fontFamily: UI_FONT}}>
          {/* header: title + counter */}
          <div style={{position: 'absolute', left: CONTENT.x + 32, top: SHELL.y, height: SHELL.header, display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 700, color: UI.ink, whiteSpace: 'nowrap'}}>Data Sources</div>
          <div style={{position: 'absolute', left: SHELL.x + SHELL.width - 260, top: SHELL.y + 22, height: 56, display: 'flex', alignItems: 'center', gap: 12, fontSize: 31, fontWeight: 600, color: UI.ink}}>
            <FlipCounter value={3} at={READY[0]} per={READY[1] - READY[0]} frame={f} size={34} />
            <span style={{color: UI.text2, fontWeight: 500}}>sources</span>
          </div>
          {/* dashed dropzone */}
          <div
            style={{
              position: 'absolute',
              left: DROP.x,
              top: DROP.y,
              width: DROP.width,
              height: DROP.height,
              borderRadius: 24,
              border: `3px dashed ${alpha(UI.ink, 0.22)}`,
              background: alpha(COLORS.white, 0.6),
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 1 - collapse(2) * 0.4,
            }}
          >
            <svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke={alpha(UI.ink, 0.45)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
            </svg>
          </div>
          {/* sources arrive along dotted arcs, then settle into rows */}
          {SOURCES.map((src, i) => {
            const a = ARRIVE[i];
            const target = {x: DROP.x + DROP.width / 2, y: DROP.y + DROP.height / 2};
            const arc: Cubic = [ORIGINS[i], {x: ORIGINS[i].x - 200, y: ORIGINS[i].y - 260}, {x: target.x + 300, y: target.y - 220}, target];
            const fl = kfIO(f, [a, a + 0.55], [0, 1]);
            const settle = kfIO(f, [a + 0.55, a + 0.9], [0, 1]);
            const rc = rowCentre(i);
            const p = cubicPoint(arc, fl);
            const pos = {x: p.x + (rc.x - p.x) * settle, y: p.y + (rc.y - p.y) * settle};
            const c = collapse(i);
            const back: Cubic = [rc, {x: rc.x - 400, y: rc.y - 380}, {x: ORB_BADGE.x + 420, y: ORB_BADGE.y - 120}, ORB_BADGE];
            const q = cubicPoint(back, c);
            const final = c > 0 ? q : pos;
            const dist = Math.abs(i - focusRow);
            const focus = s > 2.85 && s < 4.2 ? Math.max(0, 1 - dist) : 0;
            const dim = s > 2.85 && s < 4.2 ? Math.min(0.6, dist * 0.32) : 0;
            return (
              <React.Fragment key={src.name}>
                <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1} opacity={tween(f, a - 0.3, a) * (1 - tween(f, a + 0.7, a + 1.1)) * 0.8}>
                  <path d={`M ${arc[0].x} ${arc[0].y} C ${arc[1].x} ${arc[1].y}, ${arc[2].x} ${arc[2].y}, ${arc[3].x} ${arc[3].y}`} fill="none" stroke={UI.ink} strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" pathLength={undefined} />
                </svg>
                {c > 0 && c < 1 ? <StrokeLine curve={back} draw={c} color={alpha(UI.ink, 0.5)} width={3} dot={c} dotColor={COLORS.white} dotSize={14} /> : null}
                {s >= a && c < 1 ? (
                  settle < 1 ? (
                    <div style={{position: 'absolute', left: final.x - 50, top: final.y - 50, width: 100, height: 100, borderRadius: 24, background: COLORS.white, boxShadow: UI.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: tween(f, a, a + 0.15)}}>
                      <SourceIcon kind={src.kind} size={100} />
                    </div>
                  ) : (
                    <div style={{position: 'absolute', left: final.x - DROP.width / 2, top: final.y - ROW_H / 2, transformOrigin: `${DROP.width / 2}px ${ROW_H / 2}px`, transform: `scale(${1 - 0.92 * c})`, opacity: 1 - tween(f, 7.1 + i * 0.12, 7.35 + i * 0.12)}}>
                      <SourceRow kind={src.kind} name={src.name} frame={f} readyAt={READY[i]} width={DROP.width} focus={focus} dim={dim} />
                    </div>
                  )
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </CameraRig>
      ) : null}

      {show('fg') && env.ownsShared ? (
        <Cursor
          frame={f}
          keys={[
            {t: 0, x: P(navPoint('Data Sources'), 0).x, y: P(navPoint('Data Sources'), 0).y},
            {t: 0.6, x: 1700, y: 1010},
            {t: 2.8, x: 1720, y: 1000},
            {t: 3.1, x: listScreen.x, y: listScreen.y - 60},
            {t: 3.9, x: listScreen.x, y: listScreen.y + 60},
            {t: 4.4, x: 1780, y: 1020},
            {t: 7.0, x: 1760, y: 1000},
            {t: 7.5, x: sim.x, y: sim.y},
          ]}
          clicks={[0.0]}
          hand={[[0, 0.25], [7.25, 7.5]]}
          rippleColor={COLORS.inkNavy}
          opacity={1 - kf(f, [4.3, 4.6, 6.8, 7.05], [0, 1, 1, 0])}
        />
      ) : null}
    </AbsoluteFill>
  );
};
