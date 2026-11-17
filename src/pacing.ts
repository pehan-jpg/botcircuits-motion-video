// ---------------------------------------------------------------------------
// Chat pacing. Every chat bubble (ChatThread, the WhatsApp card, the call
// transcript, the Simulator chat) is timed from these constants, and every
// scene that contains a chat derives its length from chatTimeline() plus its
// fixed non chat time. Change a constant and the video length follows.
// (The Console prompt, Procedure rows and URL typing keep their own speed.)
// ---------------------------------------------------------------------------
import type {Msg} from './ui/ChatThread';
import type {Section} from './ui/Procedure';
import {charTimes} from './ui/typewriter';
import {TAGLINE} from './constants';

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
export const ELSE_TEXT = "I can't verify you here. Let me bring in a teammate."; // identical to the Procedure's ELSE row

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

// ---- the Procedure build (scene 6), slowed slightly so it can be read ------------
/** Every duration in the Procedure build phase is multiplied by this. */
export const PROCEDURE_BUILD_PACE = 1.15;
/** Procedure row typing speed (frames per character), scaled by the pace. */
export const PROC_PER_CHAR = 0.4 * PROCEDURE_BUILD_PACE;
const ROW_HOLD = 0.2; // after each step row completes
const LAST_ROW_HOLD = 0.4; // after the last row
export const VERIFIED_TEXT = "Thanks Maya, you're verified. I'll block your card now.";
export const ELSE_ROW = "I can't verify you here. Let me bring in a teammate.";
type RowSpec = {id: string; kind: string; [k: string]: string};
const PROC_SPEC: {title: string; rows: RowSpec[]}[] = [
  {
    title: 'Verify the customer',
    rows: [
      {id: '1.1', kind: 'RUN', text: 'Ask for the last four digits of the card and the date of birth. Confirm they match the account.', into: 'verified'},
      {id: '1.2', kind: 'IF', cond: 'verified', condIs: 'is yes', send: VERIFIED_TEXT},
      {id: '1.3', kind: 'ELSE', send: ELSE_ROW},
    ],
  },
  {
    title: 'Block the card',
    rows: [
      {id: '2.1', kind: 'RUN', text: 'Block the card using the card system.', into: 'card_status'},
      {id: '2.2', kind: 'SEND', text: 'Your card ending 4821 is blocked. A new one is on its way.'},
    ],
  },
];
const P = PROCEDURE_BUILD_PACE;
/** Row timing helpers (shared with src/ui/Procedure.tsx). */
export const procTextStart = (r: {kind: string; at: number}) => r.at + (r.kind === 'IF' || r.kind === 'ELSE' ? 0.2 : 0.15) * P;
export const procRowText = (r: {kind: string}) => (r.kind === 'RUN' || r.kind === 'SEND' ? (r as unknown as {text: string}).text : (r as unknown as {send: string}).send);
export const procTextEnd = (r: Section['rows'][number]) => procTextStart(r) + (procRowText(r).length * PROC_PER_CHAR) / 60 + 0.03;
/** A row is complete once its text has typed and its chip has flown into "into". */
const procRowDone = (r: Section['rows'][number]) => procTextEnd(r) + (r.kind === 'RUN' ? 0.45 : 0.1) * P;
export const PROC_SECTIONS: Section[] = (() => {
  let t = 0.95;
  return PROC_SPEC.map((sec) => {
    const at = t;
    let rt = at + 0.1 * P;
    const rows = sec.rows.map((r) => {
      const row = {...r, at: rt} as unknown as Section['rows'][number];
      rt = procRowDone(row) + ROW_HOLD;
      return row;
    });
    t = rt;
    return {title: sec.title, at, rows};
  });
})();
const LAST_ROW = PROC_SECTIONS[PROC_SECTIONS.length - 1].rows.slice(-1)[0];
/** Save, once the finished Procedure has been held for reading. */
export const PROC_SAVE_AT = procRowDone(LAST_ROW) + LAST_ROW_HOLD;

// ---- the chat sequences -------------------------------------------------------
const S5_CONSOLE = 5.0; // Console prompt, word lift off, orb (non chat time)
export const S6_BUILD = PROC_SAVE_AT + 0.6; // Procedure rows + Save (derived from the build plan)
const S7_ADDS = 6.0; // three ways of adding a source
const PAN = 0.6; // camera pan to the chat for a proof beat
const S8_LEAD = 0.5; // Simulator page arrives
const S8_RESULT = 3.0; // Test result card (counter 0 to 3, checks into chips)
const S10_LEAD = 0.9; // green -> WhatsApp card

const s5 = chatTimeline(
  [
    {from: 'maya', text: OPENING, mode: 'replay', time: '9:02 AM'},
    {from: 'agent', text: "I'm sorry to hear that, Maya. I'm your Card Services Agent, and I can help with lost or stolen cards.", mode: 'normal', time: '9:02 AM'},
  ],
  S5_CONSOLE - TAIL,
);
const s6 = chatTimeline(
  [
    {from: 'maya', text: 'Yes, please block it.', mode: 'normal', time: '9:05 AM'},
    {from: 'agent', text: 'Of course. First, can you confirm the last four digits of your card?', mode: 'normal', time: '9:05 AM'},
    {from: 'maya', text: '4821', mode: 'normal', time: '9:05 AM'},
    {from: 'agent', text: VERIFIED_TEXT, mode: 'normal', time: '9:06 AM', chip: 'Card blocked'},
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
  team: {customer: "I don't recognise a charge on my statement.", agent: "I'll bring in a teammate to review it.", reply: "Hi Priya, this is the card team. I'm reviewing the charge now."},
};

// ---- scene 12: human in the loop (every line typed, new to the viewer) ------------
const S12_CHAT_AT = 0.9; // the Conversations window and the empty Priya thread arrive first
const s12 = chatTimeline(
  [
    {from: 'maya', text: CALL.team.customer, mode: 'normal', time: '9:14 AM'},
    {from: 'agent', text: CALL.team.agent, mode: 'normal', time: '9:14 AM'},
  ],
  S12_CHAT_AT,
);
const S12_TAKE = s12.end + 0.2; // the cursor clicks "Take over"
const SYSTEM_TEXT = 'A team member joined the conversation';
const sysType = charTimes(SYSTEM_TEXT, S12_TAKE + 0.45, TYPE_CPS, SYSTEM_TEXT);
const humanAt = sysType.end + META_FADE + MSG_GAP;
const humanType = charTimes(CALL.team.reply, humanAt + POP_TIME, TYPE_CPS, CALL.team.reply);
const human: Timed = {from: 'maya', text: CALL.team.reply, time: '9:15 AM', mode: 'normal', words: words(CALL.team.reply), at: humanAt, typeStart: humanAt + POP_TIME, cps: TYPE_CPS, typedEnd: humanType.end, chipEnd: humanType.end + META_FADE, holdEnd: humanType.end + META_FADE + 1.2};
export const S12 = {
  msgs: s12.msgs,
  take: S12_TAKE,
  system: {text: SYSTEM_TEXT, start: S12_TAKE + 0.45, end: sysType.end},
  human,
  /** "Hand back to agent", 1.2 s after the human message finishes. */
  back: human.typedEnd + 1.2,
};

// ---- scene 13: the end line types with the same typewriter (large display text) ----
export const HEADLINE_CPS = 20;
/** The guard's limit for the end line. */
export const MAX_HEADLINE_CPS = 24;
const TAG_BREAK = TAGLINE.indexOf('. ', TAGLINE.indexOf('. ') + 1);
/** Line 1 / line 2 with a forced break after "everywhere." */
export const TAGLINE_LINES = TAG_BREAK >= 0 ? [TAGLINE.slice(0, TAG_BREAK + 1), TAGLINE.slice(TAG_BREAK + 2)] : [TAGLINE];
/** The typed text: the line break is a character too (it carries the pause after the full stop). */
const TAG_TEXT = TAGLINE_LINES.join('\n');
const TAG_TYPE_AT = 0.3; // after the orb ring dissolve
export const TAGLINE_TYPING = {text: TAG_TEXT, lines: TAGLINE_LINES, start: TAG_TYPE_AT, ...charTimes(TAG_TEXT, TAG_TYPE_AT, HEADLINE_CPS, TAG_TEXT)};
/** Hold 1.2 s after the last character, then the dissolve to the lockup (1.9 s, ending on the 1.2 s lockup hold). */
export const S13_OUT = TAGLINE_TYPING.end + 1.2;

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
  s12: S12.back + 2.5, // hand back, the loop ring, the pull back
  s13: S13_OUT + 1.9,
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
  check('s12', s12, S12_TAKE);
  // scene 12: nothing in the thread at the scene's first frame; every line types (never appears whole)
  for (const m of [...s12.msgs, human]) if (!(m.typeStart! > 0) || !(m.typedEnd > m.typeStart!)) w.push(`READABILITY s12 "${m.text}" appears without typing`);
  if (!(S12.system.start > 0 && S12.system.end > S12.system.start)) w.push('READABILITY s12 system row appears without typing');
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
