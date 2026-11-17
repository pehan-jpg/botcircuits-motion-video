import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {siWhatsapp} from 'simple-icons';
import {COLORS, FONT_SANS, alpha, kf, kfIO, popIn, press, tween} from '../theme';
import {BUILD7, CONFIG_VIEW, CONTENT, DANIEL_ROW, LOOP_RING, SHELL} from '../v7';
import {toScreen} from '../components/Stage';
import {CameraRig} from '../components/CameraRig';
import {PlannedCursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {GWaveform} from '../components/Glyphs';
import {AppShell, navPoint} from '../ui/AppShell';
import {UI, UI_FONT} from '../ui/tokens';
import {S12, TYPE_CPS} from '../pacing';
import {Indicator, ThreadMessage} from '../ui/ChatThread';
import {CHAR_FADE, charTimes} from '../ui/typewriter';
import {LineToCircle} from '../components/Morph';
import {beatUnderline} from '../ui/TextBeat';
import {envelope, SceneLayerProps} from './kit';

// ---- layout (screen px; the window is shown at CONFIG_VIEW, unzoomed) ----
const W = (p: {x: number; y: number}) => toScreen(CONFIG_VIEW, p);
const C0 = W({x: CONTENT.x, y: CONTENT.y}); // content top-left on screen
const LIST = {x: DANIEL_ROW.x, y: C0.y + 28, width: DANIEL_ROW.width, row: DANIEL_ROW.height, gap: 12};
const PANEL = {x: LIST.x + LIST.width + 24, y: C0.y + 28, width: C0.x + CONTENT.width - 32 - (LIST.x + LIST.width + 24), height: CONTENT.height - 56};
const AV = {x: PANEL.x + 56, y: PANEL.y + 48, size: 56}; // header avatar centre
const FIELD = {x: PANEL.x + 24, y: PANEL.y + PANEL.height - 24 - 64, width: PANEL.width - 48, height: 64};
const BTN = {right: PANEL.x + PANEL.width - 24, y: PANEL.y + 24, h: 52};

// ---- timeline ----
const NAV = 0.6;
// every time comes from src/pacing.ts (S12): the thread types, then Take over, then a teammate joins
const TAKE = S12.take;
const BACK = S12.back;
const OUT: [number, number] = [BACK + 0.7, BACK + 1.5];

type Conv = {name: string; letter: string; status: 'Resolved' | 'Needs a person'; channel: 'whatsapp' | 'voice'};
const CONVS: Conv[] = [
  {name: 'Maya', letter: 'M', status: 'Resolved', channel: 'whatsapp'},
  {name: 'Priya', letter: 'P', status: 'Needs a person', channel: 'whatsapp'},
  {name: 'Arjun', letter: 'A', status: 'Resolved', channel: 'whatsapp'},
];

const Ink: React.FC<{size: number; letter: string}> = ({size, letter}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: UI.ink, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SANS, fontWeight: 600, fontSize: size * 0.42, flexShrink: 0}}>{letter}</div>
);

const StatusChip: React.FC<{status: string}> = ({status}) => {
  const coral = status === 'Needs a person'; // 'Resolved' and 'With your team' are mint
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 12px', borderRadius: 16, background: coral ? '#FFE7DF' : UI.chipMint, color: coral ? '#B5401F' : UI.chipText, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap'}}>{status}</span>
  );
};

/** A teammate: an ink circle with a person glyph (no name or initials). */
const Person: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: UI.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7" />
    </svg>
  </div>
);

/** A centered system row (not a bubble): small, grey, a person glyph, typed with the same typewriter. */
const SystemRow: React.FC<{frame: number}> = ({frame}) => {
  const sNow = frame / 60;
  const t = charTimes(S12.system.text, S12.system.start, TYPE_CPS, S12.system.text);
  const enter = Math.min(1, Math.max(0, (sNow - (S12.system.start - 0.1)) / 0.3));
  return (
    <div style={{height: 56 * (1 - Math.pow(1 - enter, 3)), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: enter}}>
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={UI.text2} strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7" /></svg>
      <span style={{fontFamily: FONT_SANS, fontSize: 22, color: UI.text2, whiteSpace: 'pre'}}>
        {S12.system.text.split('').map((ch, i) => (
          <span key={i} style={{opacity: sNow < t.times[i] ? 0 : Math.min(1, (sNow - t.times[i]) / CHAR_FADE)}}>{ch}</span>
        ))}
      </span>
    </div>
  );
};

export const Scene12Loop: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s12;
  const env = envelope(f, dur, true, true, BUILD7.ov.s12);
  const winIn = tween(f, 0, 0.5);
  const panelIn = tween(f, 0.25, 0.65);
  const ui = 1 - tween(f, OUT[0], OUT[0] + 0.5);
  const camS = kfIO(f, [OUT[0] - 0.2, dur], [1, 0.96]);
  // avatar swap orb <-> N (cross rotate, 0.5 s)
  const toN = kfIO(f, [TAKE + 0.05, TAKE + 0.55], [0, 1]) * (1 - kfIO(f, [BACK + 0.05, BACK + 0.55], [0, 1]));
  const withN = s >= TAKE + 0.3 && s < BACK + 0.3;
  const btnW = 170 + (250 - 170) * kfIO(f, [TAKE + 0.1, TAKE + 0.4], [0, 1]);
  const handedBack = s >= BACK + 0.2;
  // the composer stays empty; its send button highlights briefly as the human message finishes
  const sendFlash = kf(f, [S12.human.typedEnd, S12.human.typedEnd + 0.1, S12.human.typedEnd + 0.2], [0, 1, 0]);
  // loop ring around the header avatar, a marker travels it once: agent, person, agent
  // the dotted ring docked (dim) around the header avatar since TextBeat 7; it brightens at Take over
  const ringDraw = s >= 0.7 ? 0.35 + 0.65 * tween(f, TAKE - 0.25, TAKE + 0.1) : 0;
  const ulRing = kfIO(f, [0, 0.35], [0, 1]);
  const dock = kfIO(f, [0.3, 0.72], [0, 1]);
  const marker = kfIO(f, [TAKE, BACK + 0.55], [0, 1]);
  // the ring and orb glide to the frame centre
  const glide = kfIO(f, [OUT[0] + 0.1, OUT[1] + 0.2], [0, 1]);
  const ringC = {x: AV.x + (LOOP_RING.cx - AV.x) * glide, y: AV.y + (LOOP_RING.cy - AV.y) * glide};
  const ringR = 44 + (LOOP_RING.r - 44) * glide;
  const orbS = AV.size + (LOOP_RING.orb - AV.size) * glide;
  const dotted = 1 - tween(f, OUT[1], OUT[1] + 0.3);
  const owns = env.ownsShared;

  const nav = W(navPoint('Conversations'));
  const takeBtn = {x: BTN.right - btnW / 2, y: BTN.y + BTN.h / 2};

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <AbsoluteFill style={{background: `radial-gradient(circle at 15% 15%, ${alpha('#E6E0FF', 0.8)} 0%, ${alpha('#E6E0FF', 0)} 40%), radial-gradient(circle at 90% 90%, ${alpha('#EAF8EF', 0.9)} 0%, ${alpha('#EAF8EF', 0)} 45%), #FAFAFC`}} />
        </AbsoluteFill>
      ) : null}

      {show('fg') ? (
        <>
          {/* the window (scaled 1.0 -> 0.96 at the end) */}
          <div style={{position: 'absolute', inset: 0, transformOrigin: '960px 540px', transform: `scale(${camS})`, opacity: ui * (1 - env.outP), filter: ui < 0.99 ? `blur(${10 * (1 - ui)}px)` : undefined}}>
            <div style={{position: 'absolute', inset: 0, opacity: winIn, filter: winIn < 0.99 ? `blur(${12 * (1 - winIn)}px)` : undefined}}>
              <CameraRig cam={CONFIG_VIEW}>
                <AppShell from="Publish" to="Conversations" slide={kfIO(f, [NAV, NAV + 0.3], [0, 1])} />
                <div data-safe="page title" style={{position: 'absolute', left: CONTENT.x + 32, top: SHELL.y + 18, height: 52, display: 'flex', alignItems: 'center', fontFamily: UI_FONT, fontSize: 26, fontWeight: 700, color: UI.ink, whiteSpace: 'nowrap'}}>Conversations</div>
              </CameraRig>
            </div>

            {/* conversation list */}
            {CONVS.map((c, i) => {
              const p = popIn(f, 0.15 + i * 0.08, 0.3, 1.03);
              if (p <= 0) return null;
              const sel = i === 1 ? tween(f, 0.6, 0.8) : 0;
              const resolved = i === 1 && handedBack;
              return (
                <div key={c.name} data-safe={`conversation ${c.name}`} style={{position: 'absolute', left: LIST.x, top: LIST.y + i * (LIST.row + LIST.gap), width: LIST.width, height: LIST.row, borderRadius: 20, background: COLORS.white, border: `1px solid ${sel > 0.5 ? alpha('#23A06B', 0.5) : UI.border}`, boxShadow: sel > 0 ? `0 12px 30px rgba(13,18,36,${0.08 * sel})` : undefined, display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 20, paddingRight: 20, boxSizing: 'border-box', fontFamily: UI_FONT, opacity: Math.min(1, p) * (i === 1 || s < 1.2 ? 1 : 1 - 0.55 * kf(f, [1.2, 1.4, OUT[0], OUT[0] + 0.2], [0, 1, 1, 0])), transform: `scale(${0.97 + 0.03 * Math.min(1, p)})`}}>
                  <Ink size={48} letter={c.letter} />
                  <div style={{display: 'flex', flexDirection: 'column', gap: 6, flex: 1}}>
                    <span style={{fontSize: 24, fontWeight: 600, color: UI.ink}}>{c.name}</span>
                    <span>
                      <StatusChip status={resolved ? 'Resolved' : i === 1 && s >= TAKE + 0.05 ? 'With your team' : c.status} />
                    </span>
                  </div>
                  {c.channel === 'whatsapp' ? (
                    <svg width={28} height={28} viewBox="0 0 24 24"><path d={siWhatsapp.path} fill="#25D366" /></svg>
                  ) : (
                    <GWaveform size={28} color={UI.ink} stroke={2} />
                  )}
                </div>
              );
            })}

            {/* the selected conversation */}
            <div data-safe="conversation panel" style={{position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.width, height: PANEL.height, opacity: panelIn, filter: panelIn < 0.99 ? `blur(${10 * (1 - panelIn)}px)` : undefined, transform: `translateX(${(1 - panelIn) * 30}px)`, fontFamily: UI_FONT}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 24, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: `0 30px 80px rgba(13,18,36,0.10), 0 0 0 2px ${alpha('#23A06B', 0.18)}`}} />
              <div style={{position: 'absolute', left: 104, top: 22, fontSize: 26, fontWeight: 600, color: UI.ink}}>Priya</div>
              <div style={{position: 'absolute', left: 104, top: 56, fontSize: 22, color: UI.text2, whiteSpace: 'nowrap'}}>WhatsApp</div>
              <div style={{position: 'absolute', left: 205, top: 30}}>
                <span style={{display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 16px', borderRadius: 20, background: withN ? '#EEF0F3' : UI.chipMint, color: withN ? UI.ink : UI.chipText, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap'}}>{withN ? 'With your team' : 'With agent'}</span>
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 96, height: 1, background: UI.border}} />
              {/* the thread starts empty; every line types (src/pacing.ts S12) */}
              <div style={{position: 'absolute', left: 0, right: 0, top: 112}}>
                {S12.msgs.map((m, i) => {
                  if (m.indicatorAt !== undefined && s >= m.indicatorAt && s < m.at) return <Indicator key={i} frame={f} at={m.indicatorAt} orbColor={1} />;
                  if (s < m.at) return null;
                  return <ThreadMessage key={i} m={m} frame={f} orbColor={1} avatar={m.from === 'maya' ? <Ink size={44} letter="P" /> : undefined} />;
                })}
                {s >= S12.system.start - 0.1 ? <SystemRow frame={f} /> : null}
                {s >= S12.human.at ? <ThreadMessage m={S12.human} frame={f} orbColor={1} avatar={<Person size={44} />} /> : null}
              </div>
              {/* message field (active once the team takes over) */}
              <div style={{position: 'absolute', left: FIELD.x - PANEL.x, top: FIELD.y - PANEL.y, width: FIELD.width, height: FIELD.height, borderRadius: 32, background: '#F4F5F7', border: `1px solid ${UI.border}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', paddingLeft: 26, fontFamily: FONT_SANS, fontSize: 22, color: '#9CA3AF', whiteSpace: 'pre'}}>
                Message
                <div style={{position: 'absolute', right: 8, top: 7, width: 48, height: 48, borderRadius: 24, background: `color-mix(in srgb, ${UI.ink} ${Math.round(100 * sendFlash)}%, #E5E7EB)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={sendFlash > 0.5 ? COLORS.white : '#9CA3AF'} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
                </div>
              </div>
            </div>
            {/* Take over / Hand back to agent */}
            <div style={{position: 'absolute', left: BTN.right - btnW, top: BTN.y, width: btnW, height: BTN.h, borderRadius: 14, background: s < TAKE + 0.25 ? UI.ink : COLORS.white, border: s < TAKE + 0.25 ? 'none' : `1px solid ${UI.border}`, color: s < TAKE + 0.25 ? COLORS.white : UI.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI_FONT, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap', boxSizing: 'border-box', opacity: panelIn * (handedBack ? 1 - tween(f, BACK + 0.2, BACK + 0.4) : 1), transform: `scale(${press(f, TAKE) * press(f, BACK)})`}}>
              {s < TAKE + 0.25 ? 'Take over' : 'Hand back to agent'}
            </div>
          </div>

          {/* header avatar (orb <-> N cross-rotate) with the loop ring; glides to the frame centre */}
          {owns ? (
            <div style={{position: 'absolute', left: 0, top: 0, opacity: Math.max(panelIn, glide)}}>
              {ringDraw > 0 ? (
                <svg width={2 * ringR + 20} height={2 * ringR + 20} style={{position: 'absolute', left: ringC.x - ringR - 10, top: ringC.y - ringR - 10, overflow: 'visible'}}>
                  <circle cx={ringR + 10} cy={ringR + 10} r={ringR} fill="none" stroke={alpha(UI.ink, 0.75)} strokeWidth={3.5} strokeDasharray={dotted > 0.5 ? '0.1 9' : undefined} strokeLinecap="round" pathLength={undefined} transform={`rotate(-90 ${ringR + 10} ${ringR + 10})`} style={{strokeDashoffset: 0}} opacity={ringDraw} />
                  {marker > 0 && marker < 1 ? (
                    <circle cx={ringR + 10 + Math.cos(-Math.PI / 2 + marker * Math.PI * 2) * ringR} cy={ringR + 10 + Math.sin(-Math.PI / 2 + marker * Math.PI * 2) * ringR} r={7} fill={UI.ink} />
                  ) : null}
                </svg>
              ) : null}
              <div style={{position: 'absolute', left: ringC.x - orbS / 2, top: ringC.y - orbS / 2, width: orbS, height: orbS, transform: `perspective(600px) rotateY(${180 * toN}deg)`, transformStyle: 'preserve-3d'}}>
                <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden'}}>
                  <Orb cx={orbS / 2} cy={orbS / 2} size={orbS} frame={f} shadow={glide > 0.5} />
                </div>
                <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}>
                  <Person size={orbS} />
                </div>
              </div>
            </div>
          ) : null}

          {/* TextBeat 7's underline curves into a dotted ring that drifts to the header avatar */}
          {s < 0.75 ? (() => {
            const u = beatUnderline('b7');
            const c0 = {x: u.x + u.w / 2, y: u.y};
            const c = {x: c0.x + (AV.x - c0.x) * dock, y: c0.y + (AV.y - c0.y) * dock};
            const lineAtDock = {x: u.x + (c.x - c0.x), y: u.y + (c.y - c0.y), w: u.w, h: u.h};
            return <LineToCircle line={lineAtDock} cx={c.x} cy={c.y} r={44} t={ulRing} stroke={`color-mix(in srgb, rgba(13,18,36,0.75) ${Math.round(100 * ulRing)}%, #8FD03C)`} width={6 - 2.5 * ulRing} dash={ulRing > 0.3 ? '0.1 9' : undefined} opacity={1 - 0.65 * dock} />;
          })() : null}
          {owns ? (
            <PlannedCursor
              frame={f}
              targets={[
                {t: NAV, ...nav, click: true, hand: true},
                {t: TAKE, ...takeBtn, click: true, hand: true},
                {t: BACK, x: BTN.right - 140, y: BTN.y + BTN.h / 2, click: true, hand: true},
              ]}
              rippleColor={COLORS.inkNavy}
            />
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
