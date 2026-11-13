import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, popIn, tween} from '../theme';
import {BACKDROPS} from '../handoff';
import {BUILD7, CHAT_VIEW, CONFIG_VIEW, CONTENT, CURSOR_S7_END, SHELL} from '../v7';
import {camAt, CamKeys, toScreen} from '../components/Stage';
import {CameraRig, dissolve, isPanning} from '../components/CameraRig';
import {Backdrop} from '../components/Backdrop';
import {FallbackPeach} from '../components/ProceduralSky';
import {Cursor, cursorAt, CursorKey} from '../components/Cursor';
import {Cubic, cubicPath, cubicPoint} from '../components/StrokeLine';
import {Logo} from '../components/logos';
import {Caret, typedCount} from '../components/TypingText';
import {AppShell, navPoint} from '../ui/AppShell';
import {ChatThread, CONVO, past} from '../ui/ChatThread';
import {SourceIcon, SourceRow} from '../ui/Panels';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

type Rect = {x: number; y: number; width: number; height: number};
const c = (r: Rect) => ({x: r.x + r.width / 2, y: r.y + r.height / 2});

// ---- layout (world). Dropzone on the left, "Your sources" tray on the right ----
const DROP: Rect = {x: CONTENT.x + 36, y: CONTENT.y + 44, width: 760, height: 260};
const TRAY: Rect = {x: DROP.x + DROP.width + 40, y: DROP.y, width: 340, height: 224};
const PDF_TILE: Rect = {x: TRAY.x + 20, y: TRAY.y + 116, width: 300, height: 80};
const ADD_WEB: Rect = {x: DROP.x + DROP.width / 2 - 250, y: DROP.y + 176, width: 236, height: 56};
const CONNECT: Rect = {x: DROP.x + DROP.width / 2 + 14, y: DROP.y + 176, width: 236, height: 56};
const DROP_C = {x: DROP.x + DROP.width / 2, y: DROP.y + 110};
const FIELD: Rect = {x: DROP.x, y: DROP.y + DROP.height + 20, width: DROP.width, height: 76};
const FIELD_PUSH = FIELD.height + 20; // rows move down while the URL field is open
const ADD_BTN: Rect = {x: FIELD.x + FIELD.width - 12 - 104, y: FIELD.y + 12, width: 104, height: 52};
const POP: Rect = {x: CONNECT.x, y: CONNECT.y + CONNECT.height + 12, width: 340, height: 3 * 64 + 20};
const POP_PUSH = 240; // rows move down while the app popover is open
const ROWS_Y = DROP.y + DROP.height + 32;
const ROW_H = 88;
const ROW_GAP = 20;
const rowTop = (i: number) => ROWS_Y + i * (ROW_H + ROW_GAP);
const URL = 'https://yourbank.com/help';

// ---- timeline (scene seconds) ----------------------------------------------------
const T = {
  grab: 1.3,
  drop: 2.1,
  row1: 2.25,
  addWeb: 2.85,
  field: 3.35,
  type: 3.45,
  add: 4.15,
  row2: 4.3,
  connect: 4.7,
  hover: 5.1,
  pick: 5.35,
  row3: 5.75,
};
const READY = [T.row1 + 0.75, T.row2 + 0.7, T.row3 + 0.65];
const ROW_IN = [T.row1, T.row2, T.row3];

const CAM: CamKeys = {
  t: [0, 6.45, 7.15, 8.5, 9.0],
  x: [CONFIG_VIEW.x, CONFIG_VIEW.x, CHAT_VIEW.x, CHAT_VIEW.x, CONFIG_VIEW.x],
  y: [540, 540, 540, 540, 540],
  s: [1, 1, 1, 1, 1],
};
const W = (p: {x: number; y: number}) => toScreen(CONFIG_VIEW, p); // world -> screen while acting (camera locked at 1.0)

const Btn: React.FC<{r: Rect; label: string; icon: React.ReactNode; pressAt?: number; frame: number; dark?: boolean}> = ({r, label, icon, frame, pressAt, dark}) => (
  <div
    style={{
      position: 'absolute',
      left: r.x,
      top: r.y,
      width: r.width,
      height: r.height,
      borderRadius: 14,
      border: dark ? 'none' : `1px solid ${UI.border}`,
      background: dark ? UI.ink : COLORS.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      fontFamily: UI_FONT,
      fontSize: 22,
      fontWeight: 600,
      color: dark ? COLORS.white : UI.ink,
      transform: pressAt ? `scale(${kf(frame, [pressAt, pressAt + 0.07, pressAt + 0.22], [1, 0.96, 1])})` : undefined,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    }}
  >
    {icon}
    {label}
  </div>
);

const PdfTile: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{width: PDF_TILE.width, height: PDF_TILE.height, borderRadius: 16, background: '#F4F5F7', border: `1px solid ${UI.border}`, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14, fontSize: 22, fontWeight: 600, color: UI.ink, boxSizing: 'border-box', whiteSpace: 'nowrap', ...style}}>
    <div style={{width: 52, height: 52, borderRadius: 12, background: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <SourceIcon kind="pdf" size={52} />
    </div>
    Card policy.pdf
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
 * SCENE 7 (9.5 s) Knowledge: three ways of adding (drag a file, type a
 * website, pick an app), then the proof in the chat. Peach clouds.
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
  const config = kfIO(f, [6.45, 7.15, 8.5, 9.0], [1, 0, 0, 1]);

  // ---- step 1: drag a COPY of the PDF tile into the dropzone ----
  const pdfC = c(PDF_TILE);
  const grabPt = {x: PDF_TILE.x + 70, y: pdfC.y};
  const dragCurve: Cubic = [grabPt, {x: grabPt.x - 120, y: grabPt.y - 230}, {x: DROP_C.x + 260, y: DROP_C.y - 200}, DROP_C];
  const drag = kfIO(f, [T.grab + 0.05, T.drop], [0, 1]);
  const dragPt = cubicPoint(dragCurve, drag);
  const lift = tween(f, T.grab, T.grab + 0.15);
  const hover = kf(f, [1.75, 1.9, T.drop + 0.05, T.drop + 0.2], [0, 1, 1, 0]);
  const arcDraw = tween(f, T.grab + 0.05, T.grab + 0.4);
  const arcFade = 1 - tween(f, T.drop - 0.05, T.drop + 0.25);
  const tray = tween(f, 0.45, 0.85) * (1 - tween(f, 2.4, 2.8));

  // ---- step 2: website (click, type, Add) ----
  const fieldOpen = kfIO(f, [T.addWeb + 0.05, T.addWeb + 0.3, T.add + 0.05, T.add + 0.3], [0, 1, 1, 0]);
  const urlN = typedCount(f, Math.round(T.type * fps), URL.length, 1.1, 'url7');
  const fieldFocus = tween(f, T.field, T.field + 0.12);

  // ---- step 3: app selector (popover opens downward) ----
  const pop = kfIO(f, [T.connect + 0.05, T.connect + 0.25, T.pick + 0.05, T.pick + 0.2], [0, 1, 1, 0]);
  const push = kfIO(f, [T.connect + 0.05, T.connect + 0.3, T.pick + 0.05, T.pick + 0.35], [0, 1, 1, 0]);
  const notionHover = tween(f, T.hover, T.hover + 0.1);
  const rowShift = FIELD_PUSH * fieldOpen + POP_PUSH * push;
  // spotlight: rows that are not part of the current step drop to 45%
  const dimOld = kf(f, [T.addWeb - 0.1, T.addWeb + 0.1, T.row3 - 0.1, T.row3 + 0.2], [0, 1, 1, 0]);

  // ---- cursor (screen) ----
  const keys: CursorKey[] = [
    {t: 0.0, ...W(navPoint('Data Sources'))},
    {t: 0.5, x: 1450, y: 900},
    {t: 1.15, ...W(grabPt)},
    {t: T.grab + 0.05, ...W(grabPt)},
  ];
  const after: CursorKey[] = [
    {t: T.drop, ...W(DROP_C)},
    {t: T.drop + 0.25, ...W({x: DROP_C.x - 20, y: DROP_C.y + 30})},
    {t: T.addWeb - 0.05, ...W(c(ADD_WEB))},
    {t: T.addWeb + 0.1, ...W(c(ADD_WEB))},
    {t: T.field - 0.05, ...W({x: FIELD.x + 260, y: c(FIELD).y})},
    {t: T.field + 0.1, ...W({x: FIELD.x + 260, y: c(FIELD).y})},
    {t: T.type + 0.2, ...W({x: FIELD.x + 300, y: FIELD.y + FIELD.height + 60})},
    {t: T.add - 0.05, ...W(c(ADD_BTN))},
    {t: T.add + 0.15, ...W(c(ADD_BTN))},
    {t: T.connect - 0.05, ...W(c(CONNECT))},
    {t: T.connect + 0.1, ...W(c(CONNECT))},
    {t: T.hover, ...W({x: POP.x + 250, y: POP.y + 10 + 36})},
    {t: T.pick + 0.15, ...W({x: POP.x + 250, y: POP.y + 10 + 36})},
    {t: 6.3, x: 1620, y: 1000},
    {t: 8.75, x: 1100, y: 1000},
    {t: 9.0, ...CURSOR_S7_END},
  ];
  const cur = s < T.grab + 0.05 ? cursorAt(f, keys) : s < T.drop ? W(dragPt) : cursorAt(f, after);

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
                <RollCount times={ROW_IN} frame={f} size={26} />
                <span style={{color: UI.text2, fontWeight: 500}}>{ROW_IN.filter((t) => s >= t + 0.12).length === 1 ? 'source' : 'sources'}</span>
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
                  background: hover > 0 ? alpha('#D8F5E4', 0.6 * hover + 0.3) : alpha(COLORS.white, 0.75),
                  boxSizing: 'border-box',
                }}
              >
                <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', opacity: 1 - hover}}>
                  <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={alpha(UI.ink, 0.45)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                  </svg>
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, top: 100, textAlign: 'center', fontSize: 24, fontWeight: 500, color: UI.text2, opacity: 1 - hover}}>Drag files here, or add a source</div>
                <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#1E6A45', opacity: hover}}>Drop to add</div>
              </div>
              <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - hover}}>
                <Btn r={ADD_WEB} label="Add website" frame={f} pressAt={T.addWeb} icon={<SourceIcon kind="web" size={40} />} />
                <Btn r={CONNECT} label="Connect app" frame={f} pressAt={T.connect} icon={<svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={UI.ink} strokeWidth={2} strokeLinecap="round"><path d="M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1" /></svg>} />
              </div>

              {/* URL field: slides open under the dropzone, then collapses */}
              {fieldOpen > 0.001 ? (
                <div data-safe="url field" style={{position: 'absolute', left: FIELD.x, top: FIELD.y, width: FIELD.width, height: FIELD.height * fieldOpen, overflow: 'hidden', opacity: Math.min(1, fieldOpen * 1.5)}}>
                  <div style={{position: 'absolute', left: 0, top: 0, width: FIELD.width, height: FIELD.height, borderRadius: 18, background: COLORS.white, border: `2px solid ${fieldFocus > 0.5 ? '#3CC37A' : UI.border}`, boxShadow: `0 0 0 ${5 * fieldFocus}px ${alpha('#3CC37A', 0.15 * fieldFocus)}`, boxSizing: 'border-box'}}>
                    <div style={{position: 'absolute', left: 18, top: 0, height: FIELD.height - 4, display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 500, color: UI.ink, whiteSpace: 'pre'}}>
                      <SourceIcon kind="web" size={44} />
                      {urlN === 0 ? <span style={{color: '#9CA3AF', position: 'relative'}}><span style={{position: 'absolute', left: -4, top: 2}}><Caret frame={f} height={30} typingUntil={-1} color={UI.ink} /></span>Paste a website address</span> : (
                        <span>
                          {URL.slice(0, urlN)}
                          <span style={{display: 'inline-block', width: 0, verticalAlign: 'middle'}}>
                            <Caret frame={f} height={30} typingUntil={Math.round(T.type * fps) + URL.length * 1.1 + 6} color={UI.ink} />
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <Btn r={{...ADD_BTN, x: ADD_BTN.x - FIELD.x, y: ADD_BTN.y - FIELD.y}} label="Add" frame={f} pressAt={T.add} dark icon={null} />
                </div>
              ) : null}

              {/* rows (pushed down while the field or popover is open; spotlight dims the older ones) */}
              {(['pdf', 'web', 'notion'] as const).map((k, i) => {
                const p = popIn(f, ROW_IN[i], 0.35, 1.03);
                if (p <= 0) return null;
                const old = s < ROW_IN[i] + 0.4 ? 0 : dimOld;
                return (
                  <div key={k} style={{position: 'absolute', left: DROP.x, top: rowTop(i) + rowShift, opacity: Math.min(1, p) * (1 - 0.55 * old), transform: `scale(${0.96 + 0.04 * p})`, transformOrigin: 'left center'}}>
                    <SourceRow kind={k} name={['Card policy.pdf', 'Help centre', 'Support wiki'][i]} frame={f} readyAt={READY[i]} width={DROP.width} />
                  </div>
                );
              })}

              {/* the "Your sources" tray: one Documents folder with the PDF */}
              {tray > 0 ? (
                <div data-safe="sources tray" style={{position: 'absolute', left: TRAY.x, top: TRAY.y, width: TRAY.width, height: TRAY.height, opacity: tray, transform: `translateX(${(1 - tween(f, 0.45, 0.85)) * 40}px)`}}>
                  <div style={{position: 'absolute', inset: 0, borderRadius: 24, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: '0 30px 80px rgba(13,18,36,0.14)'}} />
                  <div style={{position: 'absolute', left: 22, top: 22, fontSize: 24, fontWeight: 700, color: UI.ink}}>Your sources</div>
                  <div style={{position: 'absolute', left: 22, top: 70, display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: UI.text2}}>
                    <svg width={26} height={26} viewBox="0 0 24 24" fill="#F6C95B" stroke="#C99A2E" strokeWidth={1.2}><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" /></svg>
                    Documents
                  </div>
                  {/* the original stays in place (40% once its copy is lifted) */}
                  <div style={{position: 'absolute', left: PDF_TILE.x - TRAY.x, top: PDF_TILE.y - TRAY.y, opacity: 1 - 0.6 * lift}}>
                    <PdfTile />
                  </div>
                </div>
              ) : null}

              {/* one dotted arc for the drag (tray tile -> dropzone), fading as the tile lands */}
              {arcDraw > 0 && arcFade > 0 ? (
                <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1} opacity={arcFade}>
                  <path d={cubicPath(dragCurve)} pathLength={1} fill="none" stroke="transparent" />
                  <defs>
                    <mask id="arc7" maskUnits="userSpaceOnUse" x={0} y={0} width={5000} height={2000}>
                      <path d={cubicPath(dragCurve)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arcDraw} stroke="#fff" strokeWidth={12} fill="none" />
                    </mask>
                  </defs>
                  <path d={cubicPath(dragCurve)} fill="none" stroke={alpha(UI.ink, 0.35)} strokeWidth={4} strokeDasharray="0.1 14" strokeLinecap="round" mask="url(#arc7)" />
                </svg>
              ) : null}

              {/* the dragged copy (soft shadow), released into the dropzone */}
              {s >= T.grab && s < T.drop + 0.15 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: (s < T.grab + 0.05 ? PDF_TILE.x : dragPt.x - (grabPt.x - PDF_TILE.x)),
                    top: (s < T.grab + 0.05 ? PDF_TILE.y : dragPt.y - PDF_TILE.height / 2) - 8 * lift,
                    opacity: 1 - tween(f, T.drop, T.drop + 0.15),
                    transform: `rotate(${-3 * lift * (1 - drag)}deg) scale(${1 + 0.04 * lift - 0.1 * tween(f, T.drop, T.drop + 0.15)})`,
                    filter: `drop-shadow(0 ${24 * lift}px ${30 * lift}px rgba(13,18,36,${0.25 * lift}))`,
                  }}
                >
                  <PdfTile style={{background: COLORS.white}} />
                </div>
              ) : null}

              {/* app popover: opens downward under "Connect app", above everything else */}
              {pop > 0.001 ? (
                <div data-safe="app picker" style={{position: 'absolute', left: POP.x, top: POP.y, width: POP.width, height: POP.height, borderRadius: 14, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: '0 24px 60px rgba(13,18,36,0.18)', padding: 10, boxSizing: 'border-box', opacity: pop, transform: `translateY(${(1 - pop) * -10}px)`, transformOrigin: 'top center'}}>
                  {(['notion', 'google-drive', 'zendesk'] as const).map((n, i) => (
                    <div key={n} style={{height: 64, display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 16, borderRadius: 10, background: i === 0 ? alpha('#EEF0F3', notionHover) : 'transparent', fontSize: 22, fontWeight: 600, color: UI.ink, whiteSpace: 'nowrap'}}>
                      <Logo name={n} size={32} />
                      {n === 'notion' ? 'Notion' : n === 'google-drive' ? 'Google Drive' : 'Zendesk'}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </CameraRig>
          {env.ownsShared ? (
            <Cursor
              frame={f}
              keys={[{t: 0, x: cur.x, y: cur.y}]}
              clicks={[0.0, T.addWeb, T.field, T.add, T.connect, T.pick]}
              hand={[[0, 0.25], [0.95, T.grab + 0.02], [T.addWeb - 0.25, T.addWeb + 0.2], [T.add - 0.25, T.add + 0.2], [T.connect - 0.25, T.connect + 0.2], [T.hover - 0.1, T.pick + 0.2]]}
              grab={[[T.grab, T.drop + 0.05]]}
              rippleColor={COLORS.inkNavy}
              opacity={1 - kf(f, [6.1, 6.4, 8.6, 8.8], [0, 1, 1, 0])}
            />
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
