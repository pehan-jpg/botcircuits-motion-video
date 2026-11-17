// ---------------------------------------------------------------------------
// Chat pacing. Every chat bubble (ChatThread, the WhatsApp card, the call
// transcript, the Simulator chat) is timed from these constants, and every
// scene that contains a chat derives its length from chatTimeline() plus its
// fixed non chat time. Change a constant and the video length follows.
// (The Console prompt, Procedure rows and URL typing keep their own speed.)
// ---------------------------------------------------------------------------
import type {Msg} from './ui/ChatThread';

export const TYPE_WPS = 5; // normal bubbles, words per second
export const HOLD = (words: number) => Math.max(0.8, 0.4 + 0.04 * words); // after a bubble finishes typing
export const MSG_GAP = 0.3;
export const CHIP_TIME = 0.5; // a result or source chip drawing in
export const REPLAY_WPS = 10; // content the viewer has already seen
export const REPLAY_STAGGER = 0.3;
export const REPLAY_HOLD = 0.3;
/** Readability limit checked by the ReadabilityGuard. */
export const MAX_WPS = 5.5;
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
 * Times a chat sequence from `startAt`. Normal: typed at TYPE_WPS with a caret,
 * then an optional chip (CHIP_TIME), then HOLD(words), then MSG_GAP. Replay:
 * consecutive messages start REPLAY_STAGGER apart at REPLAY_WPS without a
 * caret; the block ends REPLAY_HOLD after its last word.
 */
export const chatTimeline = (msgs: In[], startAt = 0) => {
  const out: Timed[] = [];
  let t = startAt;
  let replayEnd = startAt;
  msgs.forEach((m, i) => {
    const w = words(m.text);
    const wps = m.mode === 'replay' ? REPLAY_WPS : TYPE_WPS;
    const start = t;
    const typedEnd = start + w / wps;
    const chipEnd = typedEnd + (m.chip || m.source ? CHIP_TIME : 0);
    const holdEnd = chipEnd + (m.mode === 'replay' ? REPLAY_HOLD : HOLD(w));
    out.push({from: m.from, text: m.text, time: m.time, chip: m.chip, source: m.source, at: start, wps, replay: m.mode === 'replay', mode: m.mode, typedEnd, chipEnd, holdEnd, words: w});
    const next = msgs[i + 1];
    if (m.mode === 'replay') {
      replayEnd = Math.max(replayEnd, holdEnd);
      t = next && next.mode === 'replay' ? start + REPLAY_STAGGER : replayEnd;
    } else {
      t = holdEnd + (next ? MSG_GAP : 0);
    }
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

// ---- scene 11: three separate voices with silent gaps ------------------------
export const CALL = {
  connect: 0.8,
  customer: [0.8, 3.2] as [number, number],
  agent: [4.2, 7.7] as [number, number],
  narrator: [8.7, 11.1] as [number, number],
  collapse: [11.1, 11.45] as [number, number], // the card collapses into a conversation row before TextBeat 7 types
  end: 11.6,
  lines: {customer: "I don't recognise this charge.", agent: "I'll bring in a teammate to review it.", system: 'Nadia joined the call'},
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
      const wps = m.words / (m.typedEnd - m.at);
      if (wps > MAX_WPS + 1e-6) w.push(`READABILITY ${scene} "${m.text}" types at ${wps.toFixed(2)} wps`);
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
  // the call transcript (typed across each voice slot)
  const c = words(CALL.lines.customer) / (CALL.customer[1] - CALL.customer[0]);
  const a = words(CALL.lines.agent) / (CALL.agent[1] - CALL.agent[0]);
  if (c > MAX_WPS || a > MAX_WPS) w.push(`READABILITY s11 transcript too fast (${c.toFixed(2)}, ${a.toFixed(2)} wps)`);
  if (CALL.agent[0] - CALL.customer[1] < HOLD(words(CALL.lines.customer))) w.push('READABILITY s11 customer line hold too short');
  if (CALL.narrator[0] - CALL.agent[1] < HOLD(words(CALL.lines.agent))) w.push('READABILITY s11 agent line hold too short');
  return w;
};

/** assertGaps (scene 11): >= 1.0 s silence between slots, >= 0.5 s before the first and after the last. */
export const gapWarnings = (): string[] => {
  const w: string[] = [];
  const slots = [CALL.customer, CALL.agent, CALL.narrator];
  if (slots[0][0] < 0.5) w.push(`GAPS s11 only ${slots[0][0]} s before the first slot`);
  for (let i = 1; i < slots.length; i++) if (slots[i][0] - slots[i - 1][1] < 1.0 - 1e-6) w.push(`GAPS s11 gap ${i} is ${(slots[i][0] - slots[i - 1][1]).toFixed(2)} s`);
  if (CALL.end - slots[2][1] < 0.5 - 1e-6) w.push(`GAPS s11 only ${(CALL.end - slots[2][1]).toFixed(2)} s after the last slot`);
  return w;
};
