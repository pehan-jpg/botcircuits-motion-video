import React from 'react';
import {COLORS, FONT_MONO, FONT_SANS, FONT_SANS_FAMILY, ease, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {UI, UI_FONT} from './tokens';
import {AGENT, CHAT} from '../v7';
import {Orb} from '../components/Orb';
import {CheckStroke} from '../components/Chip';
import {Checks} from '../components/Bubble';
import {measureText, wrapText} from '../components/measure';
import {Caret} from '../components/TypingText';

export type Msg = {
  from: 'maya' | 'agent';
  text: string;
  at: number; // scene seconds (-Infinity = already there)
  time: string; // "9:02 AM"
  chip?: string; // tool result chip inside the agent bubble
  source?: string; // source chip under the agent bubble
  instant?: boolean; // appears complete (a chip landed on it) instead of typing
};

// Light variant of the scenes 1-3 thread.
const FS = 26;
const LH = 36;
const PAD_X = 20;
const PAD_Y = 16;
const TEXT_MAX = 440;
const FONT = `400 ${FS}px "${FONT_SANS_FAMILY}"`;
const AV = 44;
const BUBBLE_X = 24 + AV + 14;
const META = 34;
const GAP = 22;
export const PER_WORD = 0.06;
export const CHAT_TEXT = {fs: FS, lh: LH, padX: PAD_X, padY: PAD_Y, max: TEXT_MAX};
const CHIP_H = 48;
const SOURCE_H = 46;

const bubbleDims = (text: string) => {
  const lines = wrapText(text, FONT, TEXT_MAX, FS * 0.5);
  const w = Math.max(...lines.map((l) => measureText(l, FONT, FS * 0.5)));
  return {lines, w: Math.ceil(w) + PAD_X * 2 + 2, h: lines.length * LH + PAD_Y * 2};
};

/** Typed state of an agent message: visible words (fractional) and bubble size. */
const typedState = (m: Msg, s: number) => {
  const words = m.text.split(' ');
  if (m.from === 'maya' || m.at === -Infinity || m.instant) return {k: words.length, dims: bubbleDims(m.text), done: true};
  const t = (s - m.at) / PER_WORD; // words typed (fractional); the first word shows as the bubble appears
  const k = Math.max(1, Math.min(words.length, t + 1));
  const kf = Math.floor(k);
  const a = bubbleDims(words.slice(0, Math.max(1, kf)).join(' '));
  const b = bubbleDims(words.slice(0, Math.min(words.length, Math.max(1, kf + 1))).join(' '));
  const p = ease(k - kf, [0, 1], [0, 1]);
  return {k: kf, dims: {lines: a.lines, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p}, done: kf >= words.length};
};
export const msgEnd = (m: Msg) => m.at + (m.instant ? 0.15 : m.text.split(' ').length * PER_WORD);

/** Current height of a message block (bubble, chip, source, timestamp). */
const blockHeight = (m: Msg, s: number) => {
  const st = typedState(m, s);
  const end = msgEnd(m);
  const chip = m.chip ? (m.at === -Infinity ? 1 : tween(Math.round(s * 60), end + 0.05, end + 0.35)) : 0;
  const src = m.source ? (m.at === -Infinity ? 1 : tween(Math.round(s * 60), end + 0.1, end + 0.4)) : 0;
  return st.dims.h + chip * (CHIP_H + 12) + src * (SOURCE_H + 10) + META + GAP;
};

export const MAvatar: React.FC<{size: number; border?: boolean}> = ({size, border}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: COLORS.inkNavy,
      color: COLORS.white,
      border: border ? `2px solid ${COLORS.white}` : 'none',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT_SANS,
      fontWeight: 600,
      fontSize: size * 0.42,
      flexShrink: 0,
    }}
  >
    M
  </div>
);

export const ResultChip: React.FC<{label: string; draw: number}> = ({label, draw}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, height: CHIP_H, padding: '0 16px', borderRadius: CHIP_H / 2, background: UI.chipMint, color: UI.chipText, fontFamily: UI_FONT, fontWeight: 600, fontSize: 22, whiteSpace: 'nowrap'}}>
    <CheckStroke size={24} draw={draw} color={UI.chipText} width={3} />
    {label}
  </div>
);

export const SourceChip: React.FC<{label: string}> = ({label}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, height: SOURCE_H, padding: '0 16px', borderRadius: SOURCE_H / 2, background: COLORS.white, border: `1px solid ${UI.border}`, color: UI.text2, fontFamily: UI_FONT, fontWeight: 500, fontSize: 22, whiteSpace: 'nowrap'}}>
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#E5484D" strokeWidth={2}>
      <path d="M6 2.8h8l4.5 4.5V20a1.2 1.2 0 0 1-1.2 1.2H6A1.2 1.2 0 0 1 4.8 20V4A1.2 1.2 0 0 1 6 2.8z" />
    </svg>
    {label}
  </div>
);

const Message: React.FC<{m: Msg; frame: number; orbColor: number}> = ({m, frame, orbColor}) => {
  const s = frame / sec(1);
  const isAgent = m.from === 'agent';
  const appear = m.at === -Infinity ? 1 : popIn(frame, m.at, 0.3, 1.03);
  const st = typedState(m, s);
  const end = msgEnd(m);
  const chip = m.chip ? (m.at === -Infinity ? 1 : tween(frame, end + 0.05, end + 0.35)) : 0;
  const src = m.source ? (m.at === -Infinity ? 1 : tween(frame, end + 0.1, end + 0.4)) : 0;
  let wi = 0;
  const finalLines = bubbleDims(m.text).lines;
  const chipW = isAgent && m.chip ? measureText(m.chip, `600 22px "Plus Jakarta Sans"`, 12) + 64 : 0;
  const bw = Math.max(st.dims.w, chip > 0 ? chipW + PAD_X * 2 : 0);
  const bh = st.dims.h + chip * (CHIP_H + 12);
  return (
    <div style={{position: 'relative', height: blockHeight(m, s), opacity: Math.min(1, appear), transform: `scale(${appear})`, transformOrigin: '0 100%'}}>
      <div style={{position: 'absolute', left: 24, top: bh - AV}}>
        {isAgent ? (
          <div style={{position: 'relative', width: AV, height: AV}}>
            <Orb cx={AV / 2} cy={AV / 2} size={AV} color={orbColor} frame={frame} shadow={false} />
          </div>
        ) : (
          <MAvatar size={AV} />
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          left: BUBBLE_X,
          top: 0,
          width: bw,
          height: bh,
          borderRadius: `26px 26px 26px 8px`,
          border: isAgent ? '1.5px solid transparent' : 'none',
          background: isAgent
            ? `linear-gradient(#F7F9F8, #F7F9F8) padding-box, linear-gradient(120deg, #6FD3A4, #CDE7FF) border-box`
            : '#EEF0F3',
          boxSizing: 'border-box',
        }}
      >
        <div style={{position: 'absolute', left: PAD_X, top: PAD_Y - (isAgent ? 1.5 : 0), fontFamily: FONT_SANS, fontSize: FS, lineHeight: `${LH}px`, color: UI.ink, whiteSpace: 'pre'}}>
          {finalLines.map((l, li) => (
            <div key={li}>
              {l.split(' ').map((w, j, arr) => {
                const k = wi++;
                return (
                  <span key={j} style={{opacity: k < st.k ? 1 : 0}}>
                    {w}
                    {j < arr.length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        {m.chip && chip > 0 ? (
          <div style={{position: 'absolute', left: PAD_X - 4, top: st.dims.h - 6, opacity: chip}}>
            <ResultChip label={m.chip} draw={m.at === -Infinity ? 1 : tween(frame, end + 0.15, end + 0.5)} />
          </div>
        ) : null}
      </div>
      {m.source && src > 0 ? (
        <div style={{position: 'absolute', left: BUBBLE_X, top: bh + 10, opacity: src, transform: `translateY(${(1 - src) * 8}px)`}}>
          <SourceChip label={m.source} />
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: BUBBLE_X + 4,
          top: bh + src * (SOURCE_H + 10) + 6,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: UI.text2,
          fontSize: 22,
          opacity: st.done ? (m.at === -Infinity ? 1 : tween(frame, end, end + 0.2)) : 0,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{fontFamily: FONT_MONO}}>{m.time}</span>
        {!isAgent ? (
          <>
            <span style={{fontFamily: FONT_SANS}}>·</span>
            <span style={{fontFamily: FONT_SANS, fontWeight: 500}}>Delivered</span>
            <span style={{display: 'inline-block', width: 30, transform: 'translateY(2px) scale(0.85)', transformOrigin: 'left center'}}>
              <Checks first={1} second={0} color={UI.text2} />
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Chat thread (light). Header with Maya, left-aligned messages with avatars,
 * timestamps, footer status + "Message" field. World coords CHAT.
 * Messages are bottom-aligned; older ones scroll up under a soft top fade.
 */
export const ChatThread: React.FC<{
  frame: number;
  msgs: Msg[];
  orbColor: number;
  orbPulse?: number;
  x?: number;
  y?: number;
  footerOrbOpacity?: number;
  scale?: number;
  height?: number;
  /** Text being typed into the "Message" field (with caret), and its focus 0..1. */
  draft?: string;
  focus?: number;
  sendPress?: number;
  /** Replace the Maya header (e.g. the WhatsApp view of the agent). */
  header?: React.ReactNode;
  /** Hide the footer status line (used when the header already names the agent). */
  hideStatus?: boolean;
}> = ({frame, msgs, orbColor, orbPulse = 0, x = CHAT.x, y = CHAT.y, footerOrbOpacity = 1, scale = 1, height = CHAT.height, draft, focus = 0, sendPress = 0, header, hideStatus = false}) => {
  const s = frame / sec(1);
  const AREA = {top: 112, bottom: height - 160};
  const visibleH = AREA.bottom - AREA.top;
  const shown = msgs.filter((m) => m.at === -Infinity || s >= m.at);
  const total = shown.reduce((a, m) => a + blockHeight(m, s), 0);
  const scroll = Math.max(0, total - visibleH + 8);
  const hasDraft = !!draft && draft.length > 0;
  return (
    <div data-safe="chat card" style={{position: 'absolute', left: x, top: y, width: CHAT.width, height, fontFamily: FONT_SANS, transformOrigin: '0 0', transform: scale !== 1 ? `scale(${scale})` : undefined}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: CHAT.radius, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: UI.shadow}} />
      {/* header */}
      {header ?? (
        <>
          <div style={{position: 'absolute', left: 28, top: 22}}>
            <MAvatar size={52} />
          </div>
          <div style={{position: 'absolute', left: 96, top: 18, fontSize: 26, fontWeight: 600, color: UI.ink}}>Maya</div>
          <div style={{position: 'absolute', left: 96, top: 52, display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, color: UI.text2}}>
            <span style={{width: 10, height: 10, borderRadius: 5, background: '#3CC37A'}} />
            Online
          </div>
        </>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 96, height: 1, background: UI.border}} />
      {/* messages */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: AREA.top,
          height: visibleH,
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 56px)',
          maskImage: 'linear-gradient(180deg, transparent 0, #000 56px)',
        }}
      >
        <div style={{position: 'absolute', left: 0, right: 0, top: Math.max(0, visibleH - total - 8) - scroll}}>
          {shown.map((m, i) => (
            <Message key={i} m={m} frame={frame} orbColor={orbColor} />
          ))}
        </div>
      </div>
      {/* footer */}
      <div style={{position: 'absolute', left: 0, right: 0, top: height - 154, height: 1, background: UI.border}} />
      <div style={{position: 'absolute', left: 28, top: height - 142, height: 34, opacity: hideStatus ? 0 : 1, display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, color: UI.text2, whiteSpace: 'nowrap'}}>
        <div style={{position: 'relative', width: 28, height: 28, opacity: footerOrbOpacity}}>
          <Orb cx={14} cy={14} size={28} color={orbColor} frame={frame} shadow={false} pulse={orbPulse} />
        </div>
        <span style={{fontFamily: UI_FONT, fontWeight: 600, color: UI.ink}}>{AGENT}</span>
        <span>·</span>
        <span>Online</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          top: height - 90,
          height: 64,
          borderRadius: 32,
          background: focus > 0.5 ? COLORS.white : '#F4F5F7',
          border: `${focus > 0.5 ? 2 : 1}px solid ${focus > 0.5 ? '#3CC37A' : UI.border}`,
          boxShadow: focus > 0 ? `0 0 0 ${5 * focus}px rgba(60,195,122,${0.15 * focus})` : undefined,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 26,
          fontSize: hasDraft ? 26 : 22,
          color: hasDraft ? UI.ink : '#9CA3AF',
          boxSizing: 'border-box',
          whiteSpace: 'pre',
        }}
      >
        {hasDraft ? (
          <>
            {draft}
            <span style={{display: 'inline-block', width: 0}}>
              <Caret frame={frame} height={30} typingUntil={frame + 2} color={UI.ink} />
            </span>
          </>
        ) : (
          <>
            {focus > 0.5 ? (
              <span style={{display: 'inline-block', width: 0, marginLeft: -4}}>
                <Caret frame={frame} height={30} typingUntil={-1} color={UI.ink} />
              </span>
            ) : null}
            Message
          </>
        )}
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: 7,
            width: 48,
            height: 48,
            borderRadius: 24,
            background: hasDraft ? UI.ink : '#E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${1 - 0.08 * sendPress})`,
          }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={hasDraft ? COLORS.white : '#9CA3AF'} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * Geometry (relative to the card) of the LAST message once complete: its
 * bubble and the source chip under it. Messages are bottom aligned, so the
 * last block always ends at the bottom of the message area.
 */
export const lastBlockGeom = (msgs: Msg[], height = CHAT.height, settled = true) => {
  const m = msgs[msgs.length - 1];
  const AREA = {top: 112, bottom: height - 160};
  const bh = settled ? blockHeight({...m, at: -Infinity}, 1e6) : bubbleDims(m.text).h + META + GAP;
  const top = AREA.bottom - 8 - bh;
  const d = bubbleDims(m.text);
  return {bubble: {x: BUBBLE_X, y: top, w: d.w, h: d.h}, source: {x: BUBBLE_X, y: top + d.h + 10, h: SOURCE_H}};
};

/** World position (relative to the card) of the send arrow and the message field. */
export const chatFieldPoints = (height = CHAT.height) => ({
  field: {x: 200, y: height - 90 + 32},
  send: {x: CHAT.width - 24 - 8 - 24, y: height - 90 + 32},
});

/** The conversation, continuing across scenes (scene-local times). */
export const CONVO = {
  s5: [
    {from: 'maya', text: 'Hi, I lost my credit card. Can you block it?', at: 5.5, time: '9:02 AM'},
    {from: 'agent', text: "Sorry, I can't help with that yet.", at: 5.85, time: '9:02 AM'},
  ] as Msg[],
  s6: [
    {from: 'agent', text: "I'm sorry to hear that, Maya. Can you confirm the last four digits of the card?", at: 5.95, time: '9:05 AM'},
    {from: 'maya', text: '4821', at: 7.05, time: '9:05 AM'},
    {from: 'agent', text: "Thanks Maya, you're verified. I'll block your card now.", at: 7.25, time: '9:06 AM', chip: 'Card blocked', instant: true},
  ] as Msg[],
  s7: [
    {from: 'maya', text: 'When will my new card arrive?', at: 5.95, time: '9:07 AM'},
    {from: 'agent', text: 'Your new card should arrive in 5 to 7 business days.', at: 6.15, time: '9:07 AM', source: 'Card policy.pdf'},
  ] as Msg[],
};
export const past = (...lists: Msg[][]) => lists.flat().map((m) => ({...m, at: -Infinity}));
