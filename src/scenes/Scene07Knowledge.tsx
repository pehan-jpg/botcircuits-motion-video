import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS} from '../handoff';
import {BUILD7, CHAT_VIEW, CONFIG_VIEW, CONTENT, SHELL} from '../v7';
import {camAt, CamKeys, toScreen} from '../components/Stage';
import {CameraRig, dissolve, isPanning} from '../components/CameraRig';
import {Backdrop} from '../components/Backdrop';
import {FallbackPeach} from '../components/ProceduralSky';
import {Cursor, cursorAt, CursorKey} from '../components/Cursor';
import {Cubic, StrokeLine, cubicPoint} from '../components/StrokeLine';
import {Logo} from '../components/logos';
import {typedCount} from '../components/TypingText';
import {AppShell, navPoint} from '../ui/AppShell';
import {ChatThread, CONVO, past} from '../ui/ChatThread';
import {SourceIcon, SourceRow} from '../ui/Panels';
import {UI, UI_FONT, UI_MONO} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

// ---- layout (world) -----------------------------------------------------------
const DROP = {x: CONTENT.x + 40, y: CONTENT.y + 50, width: 700, height: 250};
const ROWS_Y = DROP.y + DROP.height + 32;
const ROW_H = 88;
const ROW_GAP = 20;
const rowTop = (i: number) => ROWS_Y + i * (ROW_H + ROW_GAP);
const TRAY = {x: CONTENT.x + CONTENT.width - 40 - 380, y: CONTENT.y + 50, width: 380, height: 470};
const PDF_TILE = {x: TRAY.x + 24, y: TRAY.y + 112, width: 332, height: 72};
const URL_PILL = {x: TRAY.x + 24, y: TRAY.y + 252, width: 332, height: 60};
const NOTION_TILE = {x: TRAY.x + 24, y: TRAY.y + 376, width: 332, height: 72};
const ADD_WEB = {x: DROP.x + DROP.width / 2 - 250, y: DROP.y + 172, width: 230, height: 52};
const CONNECT = {x: DROP.x + DROP.width / 2 + 20, y: DROP.y + 172, width: 230, height: 52};
const DROP_C = {x: DROP.x + DROP.width / 2, y: DROP.y + 100};
const c = (r: {x: number; y: number; width: number; height: number}) => ({x: r.x + r.width / 2, y: r.y + r.height / 2});

// ---- timeline -------------------------------------------------------------------
const T = {
  grab: 1.3,
  drop: 2.1,
  row1: 2.25,
  copy: 2.75,
  addWeb: 3.35,
  urlType: 3.45,
  row2: 4.0,
  connect: 4.4,
  pick: 4.8,
  row3: 5.15,
};
const READY = [T.row1 + 0.75, T.row2 + 0.75, T.row3 + 0.65];
const URL = 'yourbank.com/help';
const PICK_LIST = {x: CONNECT.x, y: CONNECT.y + 62, width: 300};

const CAM: CamKeys = {
  t: [0, 6.0, 6.8, 8.45, 9.0],
  x: [CONFIG_VIEW.x, CONFIG_VIEW.x, CHAT_VIEW.x, CHAT_VIEW.x, CONFIG_VIEW.x],
  y: [540, 540, 540, 540, 540],
  s: [1, 1, 1, 1, 1],
};

const Btn: React.FC<{r: {x: number; y: number; width: number; height: number}; label: string; icon: React.ReactNode; pressAt?: number; frame: number}> = ({r, label, icon, frame, pressAt}) => (
  <div
    style={{
      position: 'absolute',
      left: r.x,
      top: r.y,
      width: r.width,
      height: r.height,
      borderRadius: 14,
      border: `1px solid ${UI.border}`,
      background: COLORS.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      fontFamily: UI_FONT,
      fontSize: 22,
      fontWeight: 600,
      color: UI.ink,
      transform: pressAt ? `scale(${kf(frame, [pressAt, pressAt + 0.07, pressAt + 0.22], [1, 0.96, 1])})` : undefined,
      whiteSpace: 'nowrap',
    }}
  >
    {icon}
    {label}
  </div>
);

/** Counter that rolls up one step at each time (0 -> 1 -> 2 -> 3). */
const RollCount: React.FC<{times: number[]; frame: number; size: number}> = ({times, frame, size}) => {
  const pos = times.reduce((m, t) => m + kfIO(frame, [t, t + 0.25], [0, 1]), 0);
  const h = size * 1.4;
  return (
    <span style={{display: 'inline-block', height: h, overflow: 'hidden'}}>
      <span style={{display: 'block', transform: `translateY(${-pos * h}px)`}}>
        {[0, 1, 2, 3].map((d) => (
          <span key={d} style={{display: 'block', height: h, lineHeight: `${h}px`, fontSize: size, fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>{d}</span>
        ))}
      </span>
    </span>
  );
};

/**
 * SCENE 7 (9.5 s) Knowledge, then proof. Peach clouds.
 */
export const Scene07Knowledge: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s7;
  const env = envelope(f, dur);
  const cam = camAt(f, CAM);
  const panning = isPanning((fr) => camAt(fr, CAM), f);
  const config = kfIO(f, [6.0, 6.8, 8.45, 9.0], [1, 0, 0, 1]);
  const W = (p: {x: number; y: number}) => toScreen(cam, p); // world -> screen (camera static while acting)

  // cursor path (screen; the camera is static in the window view while it acts)
  const pdfC = c(PDF_TILE);
  const keys: CursorKey[] = [
    {t: 0.0, ...W(navPoint('Data Sources'))},
    {t: 0.55, x: 1500, y: 980},
    {t: 1.2, ...W({x: pdfC.x - 60, y: pdfC.y})},
    {t: T.grab + 0.05, ...W({x: pdfC.x - 60, y: pdfC.y})},
  ];
  // drag path for the PDF tile (world)
  const dragCurve: Cubic = [{x: pdfC.x - 60, y: pdfC.y}, {x: pdfC.x - 260, y: pdfC.y - 260}, {x: DROP_C.x + 220, y: DROP_C.y - 220}, {x: DROP_C.x, y: DROP_C.y}];
  const drag = kfIO(f, [T.grab + 0.05, T.drop], [0, 1]);
  const dragPt = cubicPoint(dragCurve, drag);
  let cur = cursorAt(f, keys);
  if (s >= T.grab + 0.05 && s < T.drop) cur = W(dragPt);
  else if (s >= T.drop) {
    const after: CursorKey[] = [
      {t: T.drop, ...W(DROP_C)},
      {t: 2.65, ...W({x: URL_PILL.x + 120, y: URL_PILL.y + 34})},
      {t: 2.85, ...W({x: URL_PILL.x + 120, y: URL_PILL.y + 34})},
      {t: 3.3, ...W({x: ADD_WEB.x + 120, y: ADD_WEB.y + 30})},
      {t: 3.5, ...W({x: ADD_WEB.x + 120, y: ADD_WEB.y + 30})},
      {t: 4.3, ...W({x: CONNECT.x + 120, y: CONNECT.y + 30})},
      {t: 4.5, ...W({x: CONNECT.x + 120, y: CONNECT.y + 30})},
      {t: 4.75, ...W({x: PICK_LIST.x + 120, y: PICK_LIST.y + 38})},
      {t: 4.95, ...W({x: PICK_LIST.x + 120, y: PICK_LIST.y + 38})},
      {t: 5.7, x: 1620, y: 1000},
      {t: 8.6, x: 1600, y: 990},
      {t: 9.0, ...toScreen(camAt(sec(9.0), CAM), navPoint('Simulator'))},
    ];
    cur = cursorAt(f, after);
  }

  const hover = kf(f, [1.75, 1.9, T.drop, T.drop + 0.15], [0, 1, 1, 0]);
  const copied = kf(f, [T.copy + 0.05, T.copy + 0.17, T.copy + 0.55, T.copy + 0.7], [0, 1, 1, 0]);
  const urlField = kf(f, [T.addWeb + 0.05, T.addWeb + 0.2, T.row2 - 0.05, T.row2 + 0.1], [0, 1, 1, 0]);
  const urlN = typedCount(f, sec(T.urlType), URL.length, 1.2, 'url');
  const picker = kf(f, [T.connect + 0.05, T.connect + 0.2, T.pick + 0.1, T.pick + 0.25], [0, 1, 1, 0]);
  const tray = tween(f, 0.45, 0.85) * (1 - tween(f, 5.6, 6.0));
  const rowIn = [T.row1, T.row2, T.row3];
  const arcs: {from: {x: number; y: number}; at: number}[] = [
    {from: {x: pdfC.x - 60, y: pdfC.y}, at: T.grab + 0.05},
    {from: c(URL_PILL), at: T.addWeb + 0.05},
    {from: c(NOTION_TILE), at: T.pick + 0.05},
  ];

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <Backdrop src={BACKDROPS.peach6} t={s} span={9} cam={{...cam, x: 960, y: 540}} scrim="light" fallback={<FallbackPeach t={s} cam={cam} />} />
        </AbsoluteFill>
      ) : null}

      {show('shell') && env.ownsShared ? (
        <>
          <CameraRig cam={cam} dim={config} panning={panning}>
            <ChatThread frame={f} msgs={[...past(CONVO.s5, CONVO.s6), ...CONVO.s7]} orbColor={1} />
          </CameraRig>
          <CameraRig cam={cam} dim={1 - config} panning={panning}>
            <div style={{position: 'absolute', left: DROP.x - 300, top: DROP.y - 220, width: DROP.width + 600, height: 900, borderRadius: '50%', background: `radial-gradient(ellipse, ${alpha(UI.glow.knowledge, 0.45)} 0%, ${alpha(UI.glow.knowledge, 0)} 62%)`, opacity: tween(f, 1.0, 1.8)}} />
            <AppShell from="Procedures" to="Data Sources" slide={kfIO(f, [0.05, 0.35], [0, 1])} />
          </CameraRig>
        </>
      ) : null}

      {show('fg') ? (
        <>
          <CameraRig cam={cam} dim={1 - config} panning={panning}>
            <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(env.inP, env.outP), fontFamily: UI_FONT}}>
              {/* header: title + counter (ticks 1, 2, 3 as rows appear) */}
              <div data-safe="page title" style={{position: 'absolute', left: CONTENT.x + 32, top: SHELL.y + 18, height: 52, display: 'flex', alignItems: 'center', fontSize: 26, fontWeight: 700, color: UI.ink, whiteSpace: 'nowrap'}}>Data Sources</div>
              <div data-safe="counter" style={{position: 'absolute', left: SHELL.x + SHELL.width - 230, top: SHELL.y + 18, height: 52, display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 600, color: UI.ink, whiteSpace: 'nowrap'}}>
                <RollCount times={rowIn} frame={f} size={26} />
                <span style={{color: UI.text2, fontWeight: 500}}>{rowIn.filter((t) => s >= t + 0.12).length === 1 ? 'source' : 'sources'}</span>
              </div>
              {/* dropzone */}
              <div
                data-safe="dropzone"
                style={{
                  position: 'absolute',
                  left: DROP.x,
                  top: DROP.y,
                  width: DROP.width,
                  height: DROP.height,
                  borderRadius: 24,
                  border: `3px ${hover > 0.5 ? 'solid' : 'dashed'} ${hover > 0.5 ? '#3CC37A' : alpha(UI.ink, 0.22)}`,
                  background: hover > 0 ? alpha('#D8F5E4', 0.6 * hover + 0.3) : alpha(COLORS.white, 0.7),
                  boxSizing: 'border-box',
                }}
              >
                <div style={{position: 'absolute', left: 0, right: 0, top: 44, display: 'flex', justifyContent: 'center', opacity: 1 - hover - urlField}}>
                  <svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke={alpha(UI.ink, 0.45)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                  </svg>
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', fontSize: 26, fontWeight: 600, color: '#1E6A45', opacity: hover}}>Drop to add</div>
                {/* URL field (website) */}
                <div style={{position: 'absolute', left: 60, right: 60, top: 70, height: 64, borderRadius: 14, border: `2px solid ${UI.consoleLime}`, background: COLORS.white, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 20, fontFamily: UI_MONO, fontSize: 24, color: UI.ink, opacity: urlField, boxSizing: 'border-box'}}>
                  <SourceIcon kind="web" size={44} />
                  {URL.slice(0, urlN)}
                </div>
              </div>
              <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - hover}}>
                <Btn r={{...ADD_WEB, x: ADD_WEB.x, y: ADD_WEB.y}} label="Add website" frame={f} pressAt={T.addWeb} icon={<SourceIcon kind="web" size={40} />} />
                <Btn r={CONNECT} label="Connect app" frame={f} pressAt={T.connect} icon={<svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={UI.ink} strokeWidth={2} strokeLinecap="round"><path d="M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1" /></svg>} />
              </div>
              {/* app picker */}
              {picker > 0 ? (
                <div data-safe="app picker" style={{position: 'absolute', left: PICK_LIST.x, top: PICK_LIST.y, width: PICK_LIST.width, borderRadius: 18, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: UI.shadow, padding: 8, opacity: picker, transform: `translateY(${(1 - picker) * 10}px)`}}>
                  {(['notion', 'google-drive', 'zendesk'] as const).map((n, i) => (
                    <div key={n} style={{height: 60, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 14, borderRadius: 12, background: i === 0 && s > T.pick - 0.15 ? '#F1F2F4' : 'transparent', fontSize: 22, fontWeight: 600, color: UI.ink}}>
                      <Logo name={n} size={30} />
                      {n === 'notion' ? 'Notion' : n === 'google-drive' ? 'Google Drive' : 'Zendesk'}
                    </div>
                  ))}
                </div>
              ) : null}
              {/* dotted arcs from each origin to the dropzone */}
              {arcs.map((a, i) => {
                const curve: Cubic = [a.from, {x: a.from.x - 200, y: a.from.y - 240}, {x: DROP_C.x + 200, y: DROP_C.y - 200}, DROP_C];
                const d = tween(f, a.at, a.at + 0.6) * (1 - tween(f, a.at + 0.9, a.at + 1.2));
                return d > 0 ? <StrokeLine key={i} curve={curve} draw={tween(f, a.at, a.at + 0.6)} color={alpha(UI.ink, 0.35 * d)} width={3} dot={i === 0 ? undefined : tween(f, a.at, a.at + 0.6)} dotColor={COLORS.white} dotSize={12} /> : null;
              })}
              {/* rows */}
              {(['pdf', 'web', 'notion'] as const).map((k, i) => {
                const p = popIn(f, rowIn[i], 0.35, 1.03);
                if (p <= 0) return null;
                return (
                  <div key={k} style={{position: 'absolute', left: DROP.x, top: rowTop(i), opacity: Math.min(1, p), transform: `scale(${0.96 + 0.04 * p})`, transformOrigin: 'left center'}}>
                    <SourceRow kind={k} name={['Card policy.pdf', 'Help centre', 'Support wiki'][i]} frame={f} readyAt={READY[i]} width={DROP.width} />
                  </div>
                );
              })}
              {/* the sources tray (origins) */}
              {tray > 0 ? (
                <div data-safe="sources tray" style={{position: 'absolute', left: TRAY.x, top: TRAY.y, width: TRAY.width, height: TRAY.height, opacity: tray, transform: `translateX(${(1 - tween(f, 0.45, 0.85)) * 40}px)`}}>
                  <div style={{position: 'absolute', inset: 0, borderRadius: 24, background: alpha(COLORS.white, 0.96), border: `1px solid ${UI.border}`, boxShadow: '0 30px 80px rgba(13,18,36,0.16)'}} />
                  <div style={{position: 'absolute', left: 24, top: 22, fontSize: 24, fontWeight: 700, color: UI.ink}}>Your sources</div>
                  <div style={{position: 'absolute', left: 24, top: 72, display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: UI.text2}}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={UI.text2} strokeWidth={1.8}><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" /></svg>
                    Documents
                  </div>
                  {/* PDF tile (picked up and dragged) */}
                  {s < T.grab + 0.05 ? (
                    <div style={{position: 'absolute', left: PDF_TILE.x - TRAY.x, top: PDF_TILE.y - TRAY.y, width: PDF_TILE.width, height: PDF_TILE.height, borderRadius: 16, background: '#F4F5F7', display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14, fontSize: 22, fontWeight: 600, color: UI.ink, boxSizing: 'border-box'}}>
                      <SourceIcon kind="pdf" size={48} />
                      Card policy.pdf
                    </div>
                  ) : (
                    <div style={{position: 'absolute', left: PDF_TILE.x - TRAY.x, top: PDF_TILE.y - TRAY.y, width: PDF_TILE.width, height: PDF_TILE.height, borderRadius: 16, border: `2px dashed ${UI.border}`, boxSizing: 'border-box'}} />
                  )}
                  <div style={{position: 'absolute', left: 24, top: 212, fontSize: 22, color: UI.text2}}>Website</div>
                  <div style={{position: 'absolute', left: URL_PILL.x - TRAY.x, top: URL_PILL.y - TRAY.y, width: URL_PILL.width, height: URL_PILL.height, borderRadius: 30, background: '#F4F5F7', border: `1px solid ${UI.border}`, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, fontFamily: UI_MONO, fontSize: 22, color: UI.ink, boxSizing: 'border-box', boxShadow: copied > 0 ? `0 0 0 3px ${alpha('#3CC37A', 0.5 * copied)}` : undefined}}>
                    <SourceIcon kind="web" size={40} />
                    {URL}
                  </div>
                  {copied > 0 ? (
                    <div style={{position: 'absolute', left: URL_PILL.x - TRAY.x + 110, top: URL_PILL.y - TRAY.y - 54, height: 44, padding: '0 16px', borderRadius: 12, background: UI.ink, color: COLORS.white, display: 'flex', alignItems: 'center', fontSize: 22, fontWeight: 600, opacity: copied, transform: `translateY(${(1 - copied) * 8}px)`}}>Copied</div>
                  ) : null}
                  <div style={{position: 'absolute', left: 24, top: 336, fontSize: 22, color: UI.text2}}>Apps</div>
                  <div style={{position: 'absolute', left: NOTION_TILE.x - TRAY.x, top: NOTION_TILE.y - TRAY.y, width: NOTION_TILE.width, height: NOTION_TILE.height, borderRadius: 16, background: '#F4F5F7', display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14, fontSize: 22, fontWeight: 600, color: UI.ink, boxSizing: 'border-box'}}>
                    <div style={{width: 48, height: 48, borderRadius: 12, background: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Logo name="notion" size={30} /></div>
                    Support wiki
                  </div>
                </div>
              ) : null}
              {/* the dragged PDF tile (soft drop shadow) */}
              {s >= T.grab + 0.05 && s < T.drop + 0.12 ? (
                <div style={{position: 'absolute', left: dragPt.x - 40, top: dragPt.y - PDF_TILE.height / 2, width: PDF_TILE.width, height: PDF_TILE.height, borderRadius: 16, background: COLORS.white, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14, fontSize: 22, fontWeight: 600, color: UI.ink, boxSizing: 'border-box', boxShadow: '0 24px 60px rgba(13,18,36,0.28)', transform: `rotate(${-3 * (1 - drag)}deg) scale(${1.04 - 0.08 * tween(f, T.drop, T.drop + 0.12)})`, opacity: 1 - tween(f, T.drop, T.drop + 0.12)}}>
                  <SourceIcon kind="pdf" size={48} />
                  Card policy.pdf
                </div>
              ) : null}
            </div>
          </CameraRig>
          {env.ownsShared ? (
            <Cursor
              frame={f}
              keys={[{t: 0, x: cur.x, y: cur.y}]}
              clicks={[0.0, T.copy, T.addWeb, T.connect, T.pick]}
              hand={[[0, 0.25], [2.5, 3.5], [4.2, 5.0], [8.75, 9.0]]}
              grab={[[T.grab, T.drop + 0.05]]}
              rippleColor={COLORS.inkNavy}
              opacity={1 - kf(f, [5.75, 6.05, 8.5, 8.7], [0, 1, 1, 0])}
            />
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
