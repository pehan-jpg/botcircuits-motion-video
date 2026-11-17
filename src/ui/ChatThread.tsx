import React from 'react';
import {COLORS, FONT_MONO, FONT_SANS, FONT_SANS_FAMILY, kf, tween} from '../theme';
import {CHIP_TIME, EXPAND_TIME, META_FADE, TYPE_CPS} from '../pacing';
import {charTimes, CHAR_FADE, typedChars} from './typewriter';
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
  typeStart?: number; // the first character starts to type
  typedEnd?: number; // the last character has started
  cps?: number; // characters per second (src/pacing.ts)
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
const LINE_GROW = 0.18; // the bubble grows one line at a time
const ENTER = 0.4; // a new block eases into the layout (smooth scroll)

const bubbleDims = (text: string) => {
  const lines = wrapText(text, FONT, TEXT_MAX, FS * 0.5);
  const w = Math.max(...lines.map((l) => measureText(l, FONT, FS * 0.5)));
  return {lines, w: Math.ceil(w) + PAD_X * 2 + 2, h: lines.length * LH + PAD_Y * 2};
};
const easeT = (s: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (s - a) / (b - a)));
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Pure geometry of a message at time s: final pre-wrapped lines and width,
 * per-character typing times, how many characters have started, the bubble's
 * current width and height (it grows one line at a time; it never shrinks and
 * never changes width once typing starts) and its layout height.
 */
export const messageGeom = (m: Msg, s: number) => {
  const d = bubbleDims(m.text);
  const chipW = m.chip ? measureText(m.chip, `600 22px "Plus Jakarta Sans"`, 12) + 64 : 0;
  const bw = Math.min(BUBBLE_MAX, Math.max(d.w, m.chip ? chipW + PAD_X * 2 : 0));
  const old = m.at === -Infinity;
  const typeStart = m.typeStart ?? m.at;
  const tw = old ? {times: m.text.split('').map(() => -Infinity), end: -Infinity} : charTimes(m.text, typeStart, m.cps ?? TYPE_CPS, m.text);
  const lineStart: number[] = [];
  let acc = 0;
  d.lines.forEach((l) => {
    lineStart.push(acc);
    acc += l.length + 1;
  });
  const chars = old ? m.text.length : typedChars(tw.times, s);
  // height: one line, then +1 line (0.18 s ease) as typing reaches each new line
  const grow = d.lines.reduce((h, _, k) => (k === 0 ? h : h + (old ? 1 : easeT(s, tw.times[lineStart[k]], tw.times[lineStart[k]] + LINE_GROW))), 1);
  const after = old ? 1 : easeT(s, tw.end, tw.end + META_FADE);
  const textH = PAD_Y * 2 + LH * grow;
  const bh = textH + (m.chip ? (CHIP_H + 12) * after : 0);
  // agent: expands from the typing indicator to its final width before typing
  const expand = old || m.indicatorAt === undefined ? 1 : easeT(s, m.at, m.at + EXPAND_TIME);
  const w = IND.w + (bw - IND.w) * expand;
  const h = m.indicatorAt === undefined || old ? bh : IND.h + (bh - IND.h) * expand;
  const block = h + (m.source ? (SOURCE_H + 10) * after : 0) + META + GAP;
  // layout: customer and replay blocks ease in; agent blocks continue from the indicator
  const enter = old ? 1 : m.indicatorAt !== undefined ? 1 : easeT(s, m.at, m.at + ENTER);
  const layoutH = m.indicatorAt !== undefined && !old ? block : block * enter;
  return {lines: d.lines, lineStart, bw, w, h, textH, block, layoutH, times: tw.times, typedEnd: tw.end, chars, linesWithText: d.lines.filter((_, k) => lineStart[k] < chars).length, grow, after};
};
/** When the last character has started (timestamps and chips follow). */
export const msgEnd = (m: Msg) => (m.at === -Infinity ? -Infinity : messageGeom(m, 0).typedEnd);
const visibleFrom = (m: Msg) => (m.at === -Infinity ? -Infinity : m.at);

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
  const s = frame / 60;
  const isAgent = m.from === 'agent';
  const g = messageGeom(m, s);
  const old = m.at === -Infinity;
  // customer / replay: the avatar and an empty one line bubble pop in (0.2 s, scale 0.96 -> 1)
  const pop = old || m.indicatorAt !== undefined ? 1 : easeT(s, m.at, m.at + 0.2);
  const dots = m.indicatorAt !== undefined && !old ? 1 - easeT(s, m.at, m.at + 0.15) : 0;
  const metaP = old ? 1 : easeT(s, g.typedEnd, g.typedEnd + META_FADE);
  // chips fade in with the space that opens for them (never an empty area)
  const chipP = old ? 1 : easeT(s, g.typedEnd + 0.03, g.typedEnd + 0.25);
  // caret: 2px ink at 70%, blinking at 1.1 Hz at the typing position; fades 0.3 s after the last character
  const typing = !old && s >= (m.typeStart ?? m.at);
  const caretFade = old ? 0 : 1 - easeT(s, g.typedEnd, g.typedEnd + 0.3);
  const blink = Math.floor((s - (m.typeStart ?? 0)) * 2.2) % 2 === 0 ? 1 : 0.15;
  const curLine = Math.max(0, g.lineStart.reduce((k, st, i) => (st <= Math.max(0, g.chars - 1) ? i : k), 0));
  const inLine = g.chars - g.lineStart[curLine];
  const caretX = PAD_X + measureText(g.lines[curLine].slice(0, Math.max(0, inLine)), FONT, FS * 0.5) + 2;
  let ci = 0;
  return (
    <div style={{position: 'relative', height: g.layoutH, opacity: pop, transform: `scale(${0.96 + 0.04 * pop})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', left: 24, top: AVATAR_TOP}}>
        <Avatar agent={isAgent} frame={frame} orbColor={orbColor} />
      </div>
      <div
        data-bubble
        style={{
          position: 'absolute',
          left: BUBBLE_X,
          top: 0,
          width: g.w,
          height: g.h,
          borderRadius: `26px 26px 26px 8px`,
          border: isAgent ? '1.5px solid transparent' : 'none',
          background: isAgent ? `linear-gradient(#F7F9F8, #F7F9F8) padding-box, linear-gradient(120deg, #6FD3A4, #CDE7FF) border-box` : '#EEF0F3',
          boxSizing: 'border-box',
          overflow: 'visible',
        }}
      >
        {dots > 0 ? (
          <div style={{position: 'absolute', left: 0, top: 0, width: IND.w, height: IND.h, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: dots}}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{width: 10, height: 10, borderRadius: 5, background: UI.text2, opacity: 0.6}} />
            ))}
          </div>
        ) : null}
        <div style={{position: 'absolute', left: PAD_X, top: PAD_Y - (isAgent ? 1.5 : 0), fontFamily: FONT_SANS, fontSize: FS, lineHeight: `${LH}px`, color: UI.ink, whiteSpace: 'pre'}}>
          {g.lines.map((l, li) => {
            const start = ci;
            ci += l.length + 1;
            return (
              <div key={li} style={{height: LH}}>
                {l.split('').map((ch, j) => {
                  const t = g.times[start + j];
                  const q = old ? 1 : s < t ? 0 : Math.min(1, (s - t) / CHAR_FADE);
                  return (
                    <span key={j} style={{opacity: q}}>
                      {ch}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
        {typing && caretFade > 0 ? <div style={{position: 'absolute', left: caretX, top: PAD_Y + curLine * LH + 4, width: 2, height: LH - 8, background: UI.ink, opacity: 0.7 * blink * caretFade}} /> : null}
        {m.chip && g.after > 0 ? (
          <div style={{position: 'absolute', left: PAD_X - 4, top: g.textH - 6, opacity: chipP}}>
            <ResultChip label={m.chip} draw={old ? 1 : easeT(s, g.typedEnd + 0.1, g.typedEnd + CHIP_TIME)} />
          </div>
        ) : null}
      </div>
      {m.source && g.after > 0 ? (
        <div style={{position: 'absolute', left: BUBBLE_X, top: g.h + 10, opacity: chipP}}>
          <SourceChip label={m.source} />
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: BUBBLE_X + 4,
          top: g.h + (m.source ? (SOURCE_H + 10) * g.after : 0) + 6,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: UI.text2,
          fontSize: 22,
          opacity: metaP,
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
  const enter = easeT(frame / 60, at, at + ENTER);
  return (
    <div style={{position: 'relative', height: (IND.h + META + GAP) * enter, opacity: p}}>
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
  const total = shown.reduce((a, m) => a + messageGeom(m, s).layoutH, 0) + (typingAgent ? (IND.h + META + GAP) * easeT(s, typingAgent.indicatorAt!, typingAgent.indicatorAt! + ENTER) : 0);
  const scroll = Math.max(0, total - visibleH + 8);
  const inputText = draft;
  const inputFocus = focus;
  const inputPress = sendPress;
  const hasDraft = !!inputText && inputText.length > 0;
  void kf;
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
  const g = messageGeom({...m, at: -Infinity}, 0);
  const top = AREA.bottom - 8 - g.block;
  return {bubble: {x: BUBBLE_X, y: top, w: g.bw, h: g.h}, source: {x: BUBBLE_X, y: top + g.h + 10, h: SOURCE_H}};
};

/** World position (relative to the card) of the send arrow and the message field. */
export const chatFieldPoints = (height = CHAT.height) => ({
  field: {x: 200, y: height - 90 + 32},
  send: {x: CHAT.width - 24 - 8 - 24, y: height - 90 + 32},
});

/** The conversation, continuing across scenes (scene-local times), timed by src/pacing.ts. */
export {CONVO} from '../pacing';
export const past = (...lists: Msg[][]) => lists.flat().map((m) => ({...m, at: -Infinity}));
