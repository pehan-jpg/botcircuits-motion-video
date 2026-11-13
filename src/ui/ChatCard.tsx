import React from 'react';
import {COLORS, alpha, ease, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {UI, UI_FONT, UI_FAMILY} from './tokens';
import {CHAT} from '../v7';
import {Orb} from '../components/Orb';
import {CheckStroke} from '../components/Chip';
import {measureText} from '../components/measure';

export type ChatMsg = {
  from: 'maya' | 'agent';
  text: string;
  at: number; // scene seconds it appears (-Infinity: already there)
  chip?: string; // tool result chip inside the agent bubble
  source?: string; // source chip under the bubble
};

export const PER_WORD = 0.05;
const FS = 26;
const LH = 36;
const PAD = 18;
const MAXW = {maya: 320, agent: 330};
const FONT = `500 ${FS}px "${UI_FAMILY}"`;

const wrap = (text: string, max: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const n = cur ? `${cur} ${w}` : w;
    if (cur && measureText(n, FONT, FS * 0.55) > max - PAD * 2) {
      lines.push(cur);
      cur = w;
    } else cur = n;
  }
  if (cur) lines.push(cur);
  return lines;
};

const msgHeight = (m: ChatMsg) => {
  const lines = wrap(m.text, MAXW[m.from]).length;
  return lines * LH + PAD * 2 + (m.chip ? 58 : 0) + (m.source ? 52 : 0) + 22;
};

/** Result chip with a stroke-drawn check (inside agent bubbles). */
export const ResultChip: React.FC<{label: string; draw: number; color?: string}> = ({label, draw, color = '#1E6A45'}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: 44,
      padding: '0 14px',
      borderRadius: 22,
      background: UI.chipMint,
      color,
      fontFamily: UI_FONT,
      fontWeight: 600,
      fontSize: 24,
      whiteSpace: 'nowrap',
    }}
  >
    <CheckStroke size={24} draw={draw} color={color} width={3} />
    {label}
  </div>
);

/** Source chip under an agent bubble. */
export const SourceChip: React.FC<{label: string}> = ({label}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: 40,
      padding: '0 14px',
      borderRadius: 20,
      background: COLORS.white,
      border: `1px solid ${UI.border}`,
      color: UI.text2,
      fontFamily: UI_FONT,
      fontWeight: 500,
      fontSize: 22,
      whiteSpace: 'nowrap',
    }}
  >
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={UI.text2} strokeWidth={2}>
      <path d="M6 2.8h8l4.5 4.5V20a1.2 1.2 0 0 1-1.2 1.2H6A1.2 1.2 0 0 1 4.8 20V4A1.2 1.2 0 0 1 6 2.8z" />
    </svg>
    {label}
  </div>
);

/** One chat bubble. Agent text types in word by word. */
export const ChatBubble: React.FC<{m: ChatMsg; frame: number; orbColor: number}> = ({m, frame, orbColor}) => {
  const lines = wrap(m.text, MAXW[m.from]);
  const appear = m.at === -Infinity ? 1 : popIn(frame, m.at, 0.3, 1.03);
  const words = m.text.split(' ');
  const perWord = PER_WORD;
  const shown = m.from === 'agent' && m.at !== -Infinity ? Math.floor(Math.max(0, (frame / sec(1) - m.at - 0.15) / perWord) + (frame / sec(1) >= m.at + 0.15 ? 1 : 0)) : words.length;
  let wordIdx = 0;
  const textEnd = m.at === -Infinity ? -Infinity : m.at + 0.15 + words.length * perWord;
  const isAgent = m.from === 'agent';
  return (
    <div style={{display: 'flex', justifyContent: isAgent ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: 10, opacity: Math.min(1, appear), transform: `scale(${appear})`, transformOrigin: isAgent ? '0 100%' : '100% 100%'}}>
      {isAgent ? <div style={{position: 'relative', width: 40, height: 40, flexShrink: 0}}><Orb cx={20} cy={20} size={40} color={orbColor} frame={frame} shadow={false} /></div> : null}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: isAgent ? 'flex-start' : 'flex-end', gap: 10}}>
        <div
          style={{
            maxWidth: MAXW[m.from],
            padding: PAD,
            borderRadius: isAgent ? '22px 22px 22px 6px' : '22px 22px 6px 22px',
            border: isAgent ? '2px solid transparent' : 'none',
            background: isAgent
              ? `linear-gradient(${COLORS.white}, ${COLORS.white}) padding-box, linear-gradient(120deg, ${COLORS.periwinkle}, ${COLORS.blush}, ${COLORS.peach}) border-box`
              : '#EEF0F3',
            fontFamily: UI_FONT,
            fontWeight: 500,
            fontSize: FS,
            lineHeight: `${LH}px`,
            color: UI.ink,
            boxSizing: 'border-box',
          }}
        >
          {lines.map((l, li) => (
            <div key={li} style={{whiteSpace: 'pre'}}>
              {l.split(' ').map((w, wi) => {
                const k = wordIdx++;
                const vis = k < shown;
                return (
                  <span key={wi} style={{opacity: vis ? 1 : 0}}>
                    {w}
                    {wi < l.split(' ').length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </div>
          ))}
          {m.chip ? (
            <div style={{marginTop: 12, opacity: textEnd === -Infinity ? 1 : tween(frame, textEnd + 0.1, textEnd + 0.3)}}>
              <ResultChip label={m.chip} draw={textEnd === -Infinity ? 1 : tween(frame, textEnd + 0.2, textEnd + 0.5)} />
            </div>
          ) : null}
        </div>
        {m.source ? (
          <div style={{opacity: textEnd === -Infinity ? 1 : tween(frame, textEnd + 0.15, textEnd + 0.4), transform: `translateY(${textEnd === -Infinity ? 0 : (1 - tween(frame, textEnd + 0.15, textEnd + 0.4)) * 10}px)`}}>
            <SourceChip label={m.source} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

/**
 * The persistent, unlabelled chat card (world coords CHAT). Orb avatar badge
 * at the top, messages bottom-aligned; older ones scroll up out of view.
 */
export const ChatCard: React.FC<{frame: number; msgs: ChatMsg[]; orbColor: number; orbPulse?: number; opacity?: number; x?: number; y?: number; badgeOpacity?: number}> = ({
  frame,
  msgs,
  orbColor,
  orbPulse = 0,
  opacity = 1,
  x = CHAT.x,
  y = CHAT.y,
  badgeOpacity = 1,
}) => {
  const s = frame / sec(1);
  const listTop = 150;
  const visibleH = CHAT.height - listTop - 24;
  const visible = msgs.filter((m) => m.at === -Infinity || s >= m.at);
  // scroll position eases toward showing the newest message
  let total = 0;
  let scroll = 0;
  msgs.forEach((m) => {
    total += msgHeight(m);
    const target = Math.max(0, total - visibleH);
    if (m.at === -Infinity) scroll = target;
    else scroll += (target - scroll) * ease(frame, [sec(m.at - 0.05), sec(m.at + 0.3)], [0, 1]);
  });
  return (
    <div style={{position: 'absolute', left: x, top: y, width: CHAT.width, height: CHAT.height, opacity}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: CHAT.radius,
          background: alpha(COLORS.white, 0.92),
          border: `1px solid ${UI.border}`,
          boxShadow: UI.shadow,
        }}
      />
      <div style={{position: 'absolute', left: CHAT.width / 2, top: 74, opacity: badgeOpacity}}>
        <Orb cx={0} cy={0} size={92} color={orbColor} pulse={orbPulse} frame={frame} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, height: 1, background: UI.border}} />
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          top: listTop,
          height: visibleH,
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 60px)',
          maskImage: 'linear-gradient(180deg, transparent 0, #000 60px)',
        }}
      >
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${-scroll}px)`}}>
          {visible.map((m, i) => (
            <div key={i} style={{height: msgHeight(m), boxSizing: 'border-box', paddingTop: 22}}>
              <ChatBubble m={m} frame={frame} orbColor={orbColor} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** The conversation, built up across scenes (scene-local times). */
export const CONVO = {
  s5: [
    {from: 'maya', text: 'I lost my card.', at: 5.5},
    {from: 'agent', text: "Sorry, I can't help with that yet.", at: 5.85},
  ] as ChatMsg[],
  s6: [
    {from: 'maya', text: 'I lost my card.', at: 7.3},
    {from: 'agent', text: "I'm sorry to hear that. Can you confirm the last four digits of the card?", at: 7.55},
    {from: 'maya', text: '4821', at: 8.45},
    {from: 'agent', text: "Thanks Maya, you're verified. I'll block your card now.", at: 8.65, chip: 'Card blocked'},
  ] as ChatMsg[],
  s7: [
    {from: 'maya', text: 'When will my new card arrive?', at: 5.15},
    {from: 'agent', text: 'Your new card should arrive in 5 to 7 business days.', at: 5.45, source: 'Card policy.pdf'},
  ] as ChatMsg[],
};
/** Messages of earlier scenes, already present. */
export const past = (...lists: ChatMsg[][]) => lists.flat().map((m) => ({...m, at: -Infinity}));
export const chatEnds = (m: ChatMsg) => m.at + 0.15 + m.text.split(' ').length * PER_WORD;
