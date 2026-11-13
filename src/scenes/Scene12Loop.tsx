import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {siWhatsapp} from 'simple-icons';
import {COLORS, FONT_SANS, alpha, kf, kfIO, popIn, press, tween} from '../theme';
import {BUILD7, CONFIG_VIEW, CONTENT, DANIEL_ROW, LOOP_RING, SHELL} from '../v7';
import {toScreen} from '../components/Stage';
import {CameraRig} from '../components/CameraRig';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {GWaveform} from '../components/Glyphs';
import {Caret} from '../components/TypingText';
import {AppShell, navPoint} from '../ui/AppShell';
import {UI, UI_FONT} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

// ---- layout (screen px; the window is shown at CONFIG_VIEW, unzoomed) ----
const W = (p: {x: number; y: number}) => toScreen(CONFIG_VIEW, p);
const C0 = W({x: CONTENT.x, y: CONTENT.y}); // content top-left on screen
const LIST = {x: DANIEL_ROW.x, y: C0.y + 28, width: DANIEL_ROW.width, row: DANIEL_ROW.height, gap: 12};
const PANEL = {x: LIST.x + LIST.width + 24, y: C0.y + 28, width: C0.x + CONTENT.width - 32 - (LIST.x + LIST.width + 24), height: CONTENT.height - 56};
const AV = {x: PANEL.x + 56, y: PANEL.y + 48, size: 56}; // header avatar centre
const FIELD = {x: PANEL.x + 24, y: PANEL.y + PANEL.height - 24 - 64, width: PANEL.width - 48, height: 64};
const BTN = {right: PANEL.x + PANEL.width - 24, y: PANEL.y + 24, h: 52};
const REPLY = "I'm reviewing the charge now, Daniel.";

// ---- timeline ----
const NAV = 0.45;
const TAKE = 2.0;
const TYPE_AT = 2.6;
const SEND = 3.5;
const BACK = 4.4;
const OUT: [number, number] = [5.2, 6.0];

type Conv = {name: string; letter: string; status: 'Resolved' | 'Needs a person'; channel: 'whatsapp' | 'voice'};
const CONVS: Conv[] = [
  {name: 'Maya', letter: 'M', status: 'Resolved', channel: 'whatsapp'},
  {name: 'Daniel', letter: 'D', status: 'Needs a person', channel: 'voice'},
  {name: 'Priya', letter: 'P', status: 'Resolved', channel: 'whatsapp'},
];

const Ink: React.FC<{size: number; letter: string}> = ({size, letter}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: UI.ink, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SANS, fontWeight: 600, fontSize: size * 0.42, flexShrink: 0}}>{letter}</div>
);

const StatusChip: React.FC<{status: string}> = ({status}) => {
  const coral = status === 'Needs a person';
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 12px', borderRadius: 16, background: coral ? '#FFE7DF' : UI.chipMint, color: coral ? '#B5401F' : UI.chipText, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap'}}>{status}</span>
  );
};

const Row: React.FC<{who: 'D' | 'agent' | 'N'; text: string; frame: number; opacity?: number}> = ({who, text, frame, opacity = 1}) => (
  <div style={{display: 'flex', gap: 16, alignItems: 'flex-start', padding: '12px 0', opacity}}>
    {who === 'agent' ? (
      <div style={{position: 'relative', width: 40, height: 40, flexShrink: 0}}>
        <Orb cx={20} cy={20} size={40} frame={frame} shadow={false} />
      </div>
    ) : (
      <Ink size={40} letter={who} />
    )}
    <div style={{fontFamily: FONT_SANS, fontSize: 26, lineHeight: '36px', color: UI.ink}}>{text}</div>
  </div>
);

/**
 * SCENE 12 (7 s) The human in the loop. Conversations: Daniel needs a person;
 * Nadia takes over, replies, and hands back to the agent. A dotted loop ring
 * traces agent, person, agent, then stays as a circle with the orb inside.
 */
export const Scene12Loop: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s12;
  const env = envelope(f, dur);
  const winIn = tween(f, 0, 0.5);
  const panelIn = tween(f, 0.75, 1.15);
  const ui = 1 - tween(f, OUT[0], OUT[0] + 0.5);
  const camS = kfIO(f, [OUT[0] - 0.2, dur], [1, 0.96]);
  // avatar swap orb <-> N (cross rotate, 0.5 s)
  const toN = kfIO(f, [TAKE + 0.05, TAKE + 0.55], [0, 1]) * (1 - kfIO(f, [BACK + 0.05, BACK + 0.55], [0, 1]));
  const withN = s >= TAKE + 0.3 && s < BACK + 0.3;
  const btnW = 170 + (280 - 170) * kfIO(f, [TAKE + 0.1, TAKE + 0.4], [0, 1]);
  const handedBack = s >= BACK + 0.2;
  const fieldOn = tween(f, TAKE + 0.4, TAKE + 0.55) * (1 - tween(f, BACK, BACK + 0.2));
  const words = REPLY.split(' ');
  const typed = s < SEND ? Math.max(0, Math.min(words.length, Math.floor((s - TYPE_AT) / 0.1) + 1)) : 0;
  const sent = popIn(f, SEND + 0.05, 0.3, 1.03);
  // loop ring around the header avatar, a marker travels it once: agent, person, agent
  const ringDraw = tween(f, TAKE - 0.25, TAKE + 0.1);
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
  const sendPt = {x: FIELD.x + FIELD.width - 32, y: FIELD.y + FIELD.height / 2};

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

            {/* conversation list (Daniel's row arrives from the call card) */}
            {CONVS.map((c, i) => {
              const p = i === 1 ? 1 : popIn(f, 0.35 + i * 0.08, 0.3, 1.03);
              if (p <= 0) return null;
              const sel = i === 1 ? tween(f, 0.7, 0.9) : 0;
              const resolved = i === 1 && handedBack;
              return (
                <div key={c.name} data-safe={`conversation ${c.name}`} style={{position: 'absolute', left: LIST.x, top: LIST.y + i * (LIST.row + LIST.gap), width: LIST.width, height: LIST.row, borderRadius: 20, background: COLORS.white, border: `1px solid ${sel > 0.5 ? alpha('#23A06B', 0.5) : UI.border}`, boxShadow: sel > 0 ? `0 12px 30px rgba(13,18,36,${0.08 * sel})` : undefined, display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 20, paddingRight: 20, boxSizing: 'border-box', fontFamily: UI_FONT, opacity: Math.min(1, p) * (i === 1 || s < 1.2 ? 1 : 1 - 0.55 * kf(f, [1.2, 1.4, OUT[0], OUT[0] + 0.2], [0, 1, 1, 0])), transform: `scale(${0.97 + 0.03 * Math.min(1, p)})`}}>
                  <Ink size={48} letter={c.letter} />
                  <div style={{display: 'flex', flexDirection: 'column', gap: 6, flex: 1}}>
                    <span style={{fontSize: 24, fontWeight: 600, color: UI.ink}}>{c.name}</span>
                    <span style={{opacity: i === 1 ? tween(f, 0.5, 0.8) : 1}}>
                      <StatusChip status={resolved ? 'Resolved' : c.status} />
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
              <div style={{position: 'absolute', left: 104, top: 22, fontSize: 26, fontWeight: 600, color: UI.ink}}>Daniel</div>
              <div style={{position: 'absolute', left: 104, top: 56, fontSize: 22, color: UI.text2, whiteSpace: 'nowrap'}}>Voice call</div>
              <div style={{position: 'absolute', left: 260, top: 30}}>
                <span style={{display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 16px', borderRadius: 20, background: withN ? '#EEF0F3' : UI.chipMint, color: withN ? UI.ink : UI.chipText, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap'}}>{withN ? 'With Nadia' : 'With agent'}</span>
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 96, height: 1, background: UI.border}} />
              <div style={{position: 'absolute', left: 28, right: 28, top: 116}}>
                <Row who="D" text="I don't recognise a charge on my statement." frame={f} />
                <Row who="agent" text="I can help with that. This needs a teammate to review it, so I'm bringing one in now." frame={f} />
                {sent > 0 ? <Row who="N" text={REPLY} frame={f} opacity={Math.min(1, sent)} /> : null}
              </div>
              {/* message field (active once Nadia takes over) */}
              <div style={{position: 'absolute', left: FIELD.x - PANEL.x, top: FIELD.y - PANEL.y, width: FIELD.width, height: FIELD.height, borderRadius: 32, background: fieldOn > 0.5 ? COLORS.white : '#F4F5F7', border: `${fieldOn > 0.5 ? 2 : 1}px solid ${fieldOn > 0.5 ? '#3CC37A' : UI.border}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', paddingLeft: 26, fontFamily: FONT_SANS, fontSize: typed > 0 ? 26 : 22, color: typed > 0 ? UI.ink : '#9CA3AF', whiteSpace: 'pre'}}>
                {typed > 0 ? (
                  <>
                    {words.slice(0, typed).join(' ')}
                    <span style={{display: 'inline-block', width: 0}}><Caret frame={f} height={30} typingUntil={f + 2} color={UI.ink} /></span>
                  </>
                ) : (
                  'Message'
                )}
                <div style={{position: 'absolute', right: 8, top: 7, width: 48, height: 48, borderRadius: 24, background: typed > 0 ? UI.ink : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${press(f, SEND)})`}}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={typed > 0 ? COLORS.white : '#9CA3AF'} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
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
                  <Ink size={orbS} letter="N" />
                </div>
              </div>
            </div>
          ) : null}

          {owns ? (
            <Cursor
              frame={f}
              keys={[
                {t: 0.0, x: 1500, y: 1000},
                {t: NAV - 0.05, ...nav},
                {t: NAV + 0.15, ...nav},
                {t: TAKE - 0.05, ...takeBtn},
                {t: TAKE + 0.15, ...takeBtn},
                {t: TYPE_AT + 0.3, x: sendPt.x - 120, y: sendPt.y + 70},
                {t: SEND - 0.05, ...sendPt},
                {t: SEND + 0.15, ...sendPt},
                {t: BACK - 0.05, x: BTN.right - 140, y: BTN.y + BTN.h / 2},
                {t: BACK + 0.15, x: BTN.right - 140, y: BTN.y + BTN.h / 2},
                {t: BACK + 0.7, x: 1700, y: 1000},
              ]}
              clicks={[NAV, TAKE, SEND, BACK]}
              hand={[[NAV - 0.2, NAV + 0.15], [TAKE - 0.25, TAKE + 0.15], [SEND - 0.25, SEND + 0.15], [BACK - 0.25, BACK + 0.15]]}
              rippleColor={COLORS.inkNavy}
              opacity={tween(f, 0.0, 0.2) * (1 - tween(f, BACK + 0.4, BACK + 0.7))}
            />
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
