import React from 'react';
import {COLORS, FONT_MONO, FONT_SANS, FONT_SANS_FAMILY, kf, tween} from '../theme';
import {TYPE_WPS} from '../pacing';
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
  at: number; // scene seconds the bubble is in place (-Infinity = already there)
  time: string; // "9:02 AM"
  chip?: string; // tool result chip inside the agent bubble
  source?: string; // source chip under the agent bubble
  instant?: boolean;
  wps?: number; // agent: word reveal speed (words per second, src/pacing.ts)
  replay?: boolean; // already seen by the viewer: appears instantly with a 12px slide
  inputAt?: number; // customer: starts typing in the Message input
  inputEnd?: number; // customer: input typing done (then send press + bubble slides up)
  indicatorAt?: number; // agent: typing indicator before the bubble
};

// Light variant of the scenes 1-3 thread.
const FS = 26;
const LH = 36;
const PAD_X = 20;
const PAD_Y = 16;
/** Bubbles never exceed 82% of the card width. */
export const BUBBLE_MAX = Math.round(CHAT.width * 0.82);
const TEXT_MAX = BUBBLE_MAX - PAD_X * 2 - 2;
const FONT = `400 ${FS}px "${FONT_SANS_FAMILY}"`;
const AV = 44;
const BUBBLE_X = 24 + AV + 14;
const META = 34;
const GAP = 22;
export const PER_WORD = 0.06;
export const CHAT_TEXT = {fs: FS, lh: LH, padX: PAD_X, padY: PAD_Y, max: TEXT_MAX};
const CHIP_H = 48;
const SOURCE_H = 46;
const IND = {w: 104, h: 64};
const SEND_PRESS = 0.15;
const SLIDE = 0.3;

const bubbleDims = (text: string) => {
  const lines = wrapText(text, FONT, TEXT_MAX, FS * 0.5);
  const w = Math.max(...lines.map((l) => measureText(l, FONT, FS * 0.5)));
  return {lines, w: Math.ceil(w) + PAD_X * 2 + 2, h: lines.length * LH + PAD_Y * 2};
};

/** The final box of a message, pre-measured: it never changes size once on screen. */
export const messageBox = (m: Msg) => {
  const d = bubbleDims(m.text);
  const chipW = m.chip ? measureText(m.chip, `600 22px "Plus Jakarta Sans"`, 12) + 64 : 0;
  const bw = Math.min(BUBBLE_MAX, Math.max(d.w, m.chip ? chipW + PAD_X * 2 : 0));
  const bh = d.h + (m.chip ? CHIP_H + 12 : 0);
  const block = bh + (m.source ? SOURCE_H + 10 : 0) + META + GAP;
  return {lines: d.lines, bw, bh, textH: d.h, block};
};
const nWords = (t: string) => t.split(' ').length;
/** When everything in the bubble has appeared (agent: last word revealed). */
export const msgEnd = (m: Msg) => m.at + (m.from === 'agent' && !m.replay && m.wps ? nWords(m.text) / m.wps : 0);
/** From when the message block is on screen. */
const visibleFrom = (m: Msg) => (m.at === -Infinity ? -Infinity : m.from === 'maya' && m.inputAt !== undefined ? m.at - SLIDE : m.at);

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

const Avatar: React.FC<{agent: boolean; frame: number; orbColor: number}> = ({agent, frame, orbColor}) =>
  agent ? (
    <div style={{position: 'relative', width: AV, height: AV}}>
      <Orb cx={AV / 2} cy={AV / 2} size={AV} color={orbColor} frame={frame} shadow={false} />
    </div>
  ) : (
    <MAvatar size={AV} />
  );
const AVATAR_TOP = PAD_Y + LH / 2 - AV / 2; // level with the first text line, fixed

const Message: React.FC<{m: Msg; frame: number; orbColor: number}> = ({m, frame, orbColor}) => {
  const isAgent = m.from === 'agent';
  const box = messageBox(m);
  const old = m.at === -Infinity;
  // arrival: replay = instant 12px slide; customer = slides up from the input; agent = appears at final size
  const p = old ? 1 : m.replay ? tween(frame, m.at, m.at + SLIDE) : m.from === 'maya' && m.inputAt !== undefined ? tween(frame, m.at - SLIDE, m.at) : tween(frame, m.at, m.at + 0.15);
  const slide = old ? 0 : m.replay ? 12 : m.from === 'maya' && m.inputAt !== undefined ? 70 : 4;
  const reveal = isAgent && !old && !m.replay && !!m.wps;
  const end = msgEnd(m);
  const after = old ? 1 : tween(frame, end, end + 0.3);
  let wi = 0;
  return (
    <div style={{position: 'relative', height: box.block, opacity: p, transform: `translateY(${(1 - p) * slide}px)`}}>
      <div style={{position: 'absolute', left: 24, top: AVATAR_TOP}}>
        <Avatar agent={isAgent} frame={frame} orbColor={orbColor} />
      </div>
      <div
        data-bubble
        style={{
          position: 'absolute',
          left: BUBBLE_X,
          top: 0,
          width: box.bw,
          height: box.bh,
          borderRadius: `26px 26px 26px 8px`,
          border: isAgent ? '1.5px solid transparent' : 'none',
          background: isAgent ? `linear-gradient(#F7F9F8, #F7F9F8) padding-box, linear-gradient(120deg, #6FD3A4, #CDE7FF) border-box` : '#EEF0F3',
          boxSizing: 'border-box',
        }}
      >
        <div style={{position: 'absolute', left: PAD_X, top: PAD_Y - (isAgent ? 1.5 : 0), fontFamily: FONT_SANS, fontSize: FS, lineHeight: `${LH}px`, color: UI.ink, whiteSpace: 'pre'}}>
          {box.lines.map((l, li) => (
            <div key={li}>
              {l.split(' ').map((w, j, arr) => {
                const k = wi++;
                const q = reveal ? tween(frame, m.at + k / m.wps!, m.at + k / m.wps! + 0.15) : 1;
                return (
                  <span key={j} style={{display: 'inline-block', opacity: q, transform: `translateY(${4 * (1 - q)}px)`}}>
                    {w}
                    {j < arr.length - 1 ? '\u00A0' : ''}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        {m.chip ? (
          <div style={{position: 'absolute', left: PAD_X - 4, top: box.textH - 6, opacity: after}}>
            <ResultChip label={m.chip} draw={old ? 1 : tween(frame, end + 0.1, end + 0.5)} />
          </div>
        ) : null}
      </div>
      {m.source ? (
        <div style={{position: 'absolute', left: BUBBLE_X, top: box.bh + 10, opacity: after}}>
          <SourceChip label={m.source} />
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: BUBBLE_X + 4,
          top: box.bh + (m.source ? SOURCE_H + 10 : 0) + 6,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: UI.text2,
          fontSize: 22,
          opacity: old ? 1 : tween(frame, end, end + 0.2),
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

/** Agent typing indicator: a small bubble at the orb avatar with three softly pulsing dots. */
const Indicator: React.FC<{frame: number; at: number; orbColor: number}> = ({frame, at, orbColor}) => {
  const p = tween(frame, at, at + 0.15);
  return (
    <div style={{position: 'relative', height: IND.h + GAP, opacity: p}}>
      <div style={{position: 'absolute', left: 24, top: IND.h / 2 - AV / 2}}>
        <Avatar agent frame={frame} orbColor={orbColor} />
      </div>
      <div style={{position: 'absolute', left: BUBBLE_X, top: 0, width: IND.w, height: IND.h, borderRadius: '26px 26px 26px 8px', border: '1.5px solid transparent', background: `linear-gradient(#F7F9F8, #F7F9F8) padding-box, linear-gradient(120deg, #6FD3A4, #CDE7FF) border-box`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
        {[0, 1, 2].map((i) => {
          const ph = Math.sin(((frame / 60 - at) * Math.PI * 2) / 0.9 - i * 0.9);
          return <span key={i} style={{width: 10, height: 10, borderRadius: 5, background: UI.text2, opacity: 0.35 + 0.45 * (0.5 + 0.5 * ph), transform: `translateY(${-2 * (0.5 + 0.5 * ph)}px)`}} />;
        })}
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
  const shown = msgs.filter((m) => s >= visibleFrom(m));
  const typingAgent = msgs.find((m) => m.indicatorAt !== undefined && s >= m.indicatorAt && s < m.at);
  const total = shown.reduce((a, m) => a + messageBox(m).block, 0) + (typingAgent ? IND.h + GAP : 0);
  const scroll = Math.max(0, total - visibleH + 8);
  // customer messages are typed in the Message input first (caret only there), then sent
  const typingCustomer = draft === undefined ? msgs.find((m) => m.inputAt !== undefined && s >= m.inputAt - 0.15 && s < m.at - SLIDE) : undefined;
  let inputText = draft;
  let inputFocus = focus;
  let inputPress = sendPress;
  if (typingCustomer) {
    const ws = typingCustomer.text.split(' ');
    const k = s < typingCustomer.inputAt! ? 0 : Math.min(ws.length, Math.floor((s - typingCustomer.inputAt!) * TYPE_WPS) + 1);
    inputText = ws.slice(0, k).join(' ');
    inputFocus = 1;
    inputPress = kf(frame, [typingCustomer.inputEnd!, typingCustomer.inputEnd! + SEND_PRESS / 2, typingCustomer.inputEnd! + SEND_PRESS], [0, 1, 0]);
  }
  const hasDraft = !!inputText && inputText.length > 0;
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
          {typingAgent ? <Indicator frame={frame} at={typingAgent.indicatorAt!} orbColor={orbColor} /> : null}
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
          background: inputFocus > 0.5 ? COLORS.white : '#F4F5F7',
          border: `${inputFocus > 0.5 ? 2 : 1}px solid ${inputFocus > 0.5 ? '#3CC37A' : UI.border}`,
          boxShadow: inputFocus > 0 ? `0 0 0 ${5 * inputFocus}px rgba(60,195,122,${0.15 * inputFocus})` : undefined,
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
            {inputText}
            <span style={{display: 'inline-block', width: 0}}>
              <Caret frame={frame} height={30} typingUntil={frame + 2} color={UI.ink} />
            </span>
          </>
        ) : (
          <>
            {inputFocus > 0.5 ? (
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
            transform: `scale(${1 - 0.1 * inputPress})`,
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
export const lastBlockGeom = (msgs: Msg[], height = CHAT.height) => {
  const m = msgs[msgs.length - 1];
  const AREA = {top: 112, bottom: height - 160};
  const box = messageBox(m);
  const top = AREA.bottom - 8 - box.block;
  return {bubble: {x: BUBBLE_X, y: top, w: box.bw, h: box.bh}, source: {x: BUBBLE_X, y: top + box.bh + 10, h: SOURCE_H}};
};

/** World position (relative to the card) of the send arrow and the message field. */
export const chatFieldPoints = (height = CHAT.height) => ({
  field: {x: 200, y: height - 90 + 32},
  send: {x: CHAT.width - 24 - 8 - 24, y: height - 90 + 32},
});

/** The conversation, continuing across scenes (scene-local times), timed by src/pacing.ts. */
export {CONVO} from '../pacing';
export const past = (...lists: Msg[][]) => lists.flat().map((m) => ({...m, at: -Infinity}));
