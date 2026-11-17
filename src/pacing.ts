// ---------------------------------------------------------------------------
// Chat pacing. Every chat bubble (ChatThread, the WhatsApp card, the call
// transcript, the Simulator chat) is timed from these constants, and every
// scene that contains a chat derives its length from chatTimeline() plus its
// fixed non chat time. Change a constant and the video length follows.
// (The Console prompt, Procedure rows and URL typing keep their own speed.)
// ---------------------------------------------------------------------------
import type {Msg} from './ui/ChatThread';
import {charTimes} from './ui/typewriter';

export const TYPE_CPS = 32; // normal messages, characters per second (about 5 words per second)
export const REPLAY_CPS = 70; // replayed messages (already seen), about 2.2x faster
/** The guard's limit for normal messages. */
export const MAX_CPS = 40;
export const HOLD = (words: number) => Math.max(0.8, 0.4 + 0.04 * words); // after a bubble finishes typing
export const MSG_GAP = 0.3;
export const CHIP_TIME = 0.5; // a result or source chip drawing in
export const REPLAY_GAP = 0.15; // between replayed messages
export const REPLAY_HOLD = 0.3;
/** Readability limit checked by the ReadabilityGuard. */
export const MAX_WPS = 5.5;
/** Agent typing indicator before a bubble (shorter for messages of four words or fewer). */
export const INDICATOR_TIME = (words: number) => (words <= 4 ? 0.35 : 0.5);
/** Agent: the bubble expands from the indicator to its final width before typing. */
export const EXPAND_TIME = 0.25;
/** Customer (and replay): the avatar and an empty one line bubble pop in before typing. */
export const POP_TIME = 0.2;
/** Timestamps and ticks fade in after typing. */
export const META_FADE = 0.2;
/** The scene tail that overlaps the next item (blur dissolve). */
export const TAIL = 0.4;

export const OPENING = 'Hi, I lost my credit card. Can you block it?';
export const ASK = 'Can you confirm the last four digits of your card?';
export const ELSE_TEXT = "I can't verify you here. Let me bring in a teammate.";

export type Mode = 'normal' | 'replay';
export type In = {from: 'maya' | 'agent'; text: string; mode: Mode; time: string; chip?: string; source?: string};
export type Timed = Msg & {mode: Mode; typedEnd: number; chipEnd: number; holdEnd: number; words: number};
export const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

/**
 * Times a chat sequence from `startAt`. Every message types character by
 * character (src/ui/typewriter.ts), never appearing whole:
 *  - customer: the avatar and an empty one line bubble pop in (POP_TIME), then type at TYPE_CPS.
 *  - agent: typing indicator (INDICATOR_TIME), the bubble expands to its final width (EXPAND_TIME), then types.
 *  - after typing: timestamps fade (META_FADE) or a chip draws in (CHIP_TIME), then HOLD(words), then MSG_GAP.
 *  - replay: no indicator; pops in and types at REPLAY_CPS, REPLAY_GAP between messages, REPLAY_HOLD after the block.
 */
export const chatTimeline = (msgs: In[], startAt = 0) => {
  const out: Timed[] = [];
  let t = startAt;
  msgs.forEach((m, i) => {
    const w = words(m.text);
    const next = msgs[i + 1];
    const base = {from: m.from, text: m.text, time: m.time, chip: m.chip, source: m.source, mode: m.mode, words: w};
    if (m.mode === 'replay') {
      const at = t;
      const typeStart = at + POP_TIME;
      const tw = charTimes(m.text, typeStart, REPLAY_CPS, m.text);
      const holdEnd = tw.end + REPLAY_HOLD;
      out.push({...base, at, typeStart, cps: REPLAY_CPS, replay: true, typedEnd: tw.end, chipEnd: tw.end, holdEnd});
      t = next && next.mode === 'replay' ? tw.end + REPLAY_GAP : holdEnd;
      return;
    }
    let at: number;
    let typeStart: number;
    let extra: Partial<Msg> = {};
    if (m.from === 'maya') {
      at = t;
      typeStart = at + POP_TIME;
    } else {
      const indicatorAt = t;
      at = indicatorAt + INDICATOR_TIME(w);
      typeStart = at + EXPAND_TIME;
      extra = {indicatorAt};
    }
    const tw = charTimes(m.text, typeStart, TYPE_CPS, m.text);
    const chipEnd = tw.end + (m.chip || m.source ? CHIP_TIME : META_FADE);
    const holdEnd = chipEnd + HOLD(w);
    out.push({...base, ...extra, at, typeStart, cps: TYPE_CPS, typedEnd: tw.end, chipEnd, holdEnd});
    t = holdEnd + (next ? MSG_GAP : 0);
  });
  const end = Math.max(t, ...out.map((m) => m.holdEnd));
  return {msgs: out, start: startAt, end, total: end - startAt};
};

// ---- the chat sequences -------------------------------------------------------
const S5_CONSOLE = 5.0; // Console prompt, word lift off, orb (non chat time)
const S6_BUILD = 4.5; // Procedure rows + Save
const S7_ADDS = 6.0; // three ways of adding a source
const PAN = 0.6; // camera pan to the chat for a proof beat
const S8_LEAD = 0.5; // Simulator page arrives
const S8_RESULT = 3.0; // Test result card (counter 0 to 3, checks into chips)
const S10_LEAD = 0.9; // green -> WhatsApp card

const s5 = chatTimeline(
  [
    {from: 'maya', text: OPENING, mode: 'replay', time: '9:02 AM'},
    {from: 'agent', text: "Sorry, I can't help with that yet.", mode: 'normal', time: '9:02 AM'},
  ],
  S5_CONSOLE - TAIL,
);
const s6 = chatTimeline(
  [
    {from: 'agent', text: ASK, mode: 'normal', time: '9:05 AM'},
    {from: 'maya', text: '4821', mode: 'normal', time: '9:05 AM'},
    {from: 'agent', text: "Thanks Maya, you're verified. I'll block your card now.", mode: 'normal', time: '9:06 AM', chip: 'Card blocked'},
  ],
  S6_BUILD + PAN,
);
const s7 = chatTimeline(
  [
    {from: 'maya', text: 'When will my new card arrive?', mode: 'normal', time: '9:07 AM'},
    {from: 'agent', text: 'Your new card should arrive in 5 to 7 business days.', mode: 'normal', time: '9:07 AM', source: 'Card policy.pdf'},
  ],
  S7_ADDS + PAN,
);
const s8 = chatTimeline(
  [
    {from: 'maya', text: 'I lost my card.', mode: 'replay', time: '9:10 AM'},
    {from: 'agent', text: ASK, mode: 'replay', time: '9:10 AM'},
    {from: 'maya', text: "I don't know the number.", mode: 'normal', time: '9:10 AM'},
    {from: 'agent', text: ELSE_TEXT, mode: 'normal', time: '9:11 AM'},
  ],
  S8_LEAD,
);
const s10 = chatTimeline(
  [
    {from: 'maya', text: OPENING, mode: 'replay', time: '9:02 AM'},
    {from: 'agent', text: ASK, mode: 'replay', time: '9:02 AM'},
    {from: 'maya', text: '4821', mode: 'replay', time: '9:02 AM'},
    {from: 'agent', text: 'Verified. Your card is blocked, and a new one is on its way.', mode: 'normal', time: '9:02 AM', chip: 'Card blocked'},
  ],
  S10_LEAD,
);

export const CHATS = {s5, s6, s7, s8, s10};
export const CONVO = {s5: s5.msgs as Msg[], s6: s6.msgs as Msg[], s7: s7.msgs as Msg[]};

// ---- scene 11: a hospitality voice call (separately recorded voices, silent gaps) ----
/** Set false to drop the last customer line ("Thank you.") and its gap. */
export const INCLUDE_THANKS = true;
export type Slot = {who: 'customer' | 'agent'; text: string; from: number; to: number};
const SLOTS_ALL: Slot[] = [
  {who: 'customer', text: 'Hello, this is Daniel speaking from room 219. Can you extend my stay by one night?', from: 0.8, to: 7.2},
  {who: 'agent', text: 'Of course, Daniel. Let me check that for you.', from: 8.0, to: 11.4},
  {who: 'agent', text: 'Done. Your stay is now extended until Saturday, and a confirmation is on its way.', from: 12.4, to: 18.0},
  {who: 'customer', text: 'Thank you.', from: 18.8, to: 20.0},
];
const SLOTS = INCLUDE_THANKS ? SLOTS_ALL : SLOTS_ALL.slice(0, 4);
const LAST = SLOTS[SLOTS.length - 1].to;
export const CALL = {
  agentName: 'Guest Concierge',
  business: 'Harbour Hotel',
  caller: 'Room 219', // the caller's name comes from his own words
  connected: 0.8, // "Calling" -> "Connected"
  slots: SLOTS,
  tool: {from: 11.4, done: 12.2, to: 12.4, busy: 'Checking availability', ok: 'Saturday available', after: 'Booking updated'},
  collapse: [LAST, LAST + 0.6] as [number, number],
  end: LAST + 0.6,
  /** Scene 12 (Priya's conversation, replay). */
  team: {customer: "I don't recognise a charge on my statement.", agent: "I'll bring in a teammate to review it.", reply: "I'm reviewing the charge now."},
};

// ---- scene lengths (derived) ---------------------------------------------------
export const SCENE_LEN = {
  s4: 5.5,
  s5: s5.end + TAIL, // console 5.0 + chat
  s6: s6.end + TAIL, // build 4.5 + proof (pan + chat + tail)
  s7: s7.end + TAIL, // adds 6.0 + proof
  s8: s8.end + S8_RESULT, // lead + chat + result card
  s9: 6.5,
  s10: s10.end + TAIL,
  s11: CALL.end,
  s12: 7.0,
  s13: 6.5,
};
export const BEAT_LEN = {b1: 2.0, b2: 2.0, b3: 2.0, b4: 2.0, b5: 2.0, b6: 2.4, b7: 2.0};
export const S8_RESULT_AT = s8.end;

// ---- dev guards ------------------------------------------------------------------
/**
 * ReadabilityGuard: a normal bubble must not type faster than MAX_WPS and must
 * hold for at least HOLD(words) before the next change on screen.
 */
export const readabilityWarnings = (): string[] => {
  const w: string[] = [];
  const check = (scene: string, tl: ReturnType<typeof chatTimeline>, nextChangeAfterLast: number) => {
    tl.msgs.forEach((m, i) => {
      if (m.mode !== 'normal') return;
      // every message types character by character; normal messages no faster than MAX_CPS
      const cps = m.text.length / (m.typedEnd - m.typeStart!);
      if (cps > MAX_CPS + 1e-6 || TYPE_CPS * 1.1 > MAX_CPS) w.push(`READABILITY ${scene} "${m.text}" types at ${cps.toFixed(1)} chars/s`);
      const next = i < tl.msgs.length - 1 ? tl.msgs[i + 1].at : nextChangeAfterLast;
      const hold = next - m.chipEnd;
      if (hold < HOLD(m.words) - 1e-6) w.push(`READABILITY ${scene} "${m.text}" holds ${hold.toFixed(2)} s < ${HOLD(m.words).toFixed(2)} s`);
    });
  };
  check('s5', s5, SCENE_LEN.s5 - TAIL);
  check('s6', s6, SCENE_LEN.s6 - TAIL);
  check('s7', s7, SCENE_LEN.s7 - TAIL);
  check('s8', s8, S8_RESULT_AT);
  check('s10', s10, SCENE_LEN.s10 - TAIL);
  // the call transcript (words revealed across each voice slot)
  for (const sl of CALL.slots) {
    const r = sl.text.length / (sl.to - sl.from);
    if (r > MAX_CPS) w.push(`READABILITY s11 "${sl.text}" types at ${r.toFixed(1)} chars/s`);
  }
  return w;
};

/** assertGaps (scene 11): >= 0.8 s silence between slots (1.0 s around the tool chip), >= 0.5 s before the first and after the last. */
export const gapWarnings = (): string[] => {
  const w: string[] = [];
  const sl = CALL.slots;
  if (sl[0].from < 0.5) w.push(`GAPS s11 only ${sl[0].from} s before the first slot`);
  for (let i = 1; i < sl.length; i++) {
    const gap = sl[i].from - sl[i - 1].to;
    const aroundTool = sl[i - 1].to <= CALL.tool.from + 1e-6 && sl[i].from >= CALL.tool.to - 1e-6;
    const need = aroundTool ? 1.0 : 0.8;
    if (gap < need - 1e-6) w.push(`GAPS s11 gap before "${sl[i].text}" is ${gap.toFixed(2)} s (< ${need})`);
  }
  if (CALL.end - sl[sl.length - 1].to < 0.5 - 1e-6) w.push(`GAPS s11 only ${(CALL.end - sl[sl.length - 1].to).toFixed(2)} s after the last slot`);
  return w;
};
