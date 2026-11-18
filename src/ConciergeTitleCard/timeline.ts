import { CHAT_CPS, DURATION, END_MARK_EXTRA } from "../constants";
import { typeSchedule, TypeSchedule, TYPE_RULES } from "../components/Typewriter";
import { GlyphKind } from "../components/Glyphs";

export { DURATION };

/** Seconds to (fractional) frames at 60 fps. */
const f = (s: number) => s * 60;
const sec = (frames: number) => frames / 60;
type Range = [number, number];

export type Side = "customer" | "agent";

export type MessageBeat = {
  kind: "message";
  id: string;
  side: Side;
  text: string;
  schedule: TypeSchedule;
  /** Customer: the bubble pop. Agent: the bubble expanding from the indicator pill. */
  enter: Range;
  /** Agent messages that follow a chip have no indicator. */
  indicator: Range | null;
  typeStart: number;
  done: number;
  /** Caret fully gone. */
  settled: number;
};

export type Receipt = { glyph: GlyphKind; title: string; detail: string; time: string; tint: string };

export type ChipSpec = {
  id: string;
  busy: string;
  doneLabel: string;
  /** Spinner turns into a mint check (0.2s). */
  check: Range;
  /** Shared element flight from the chat to the rail (0.5s). */
  lift: Range;
  /** Rail slot index, 0 based. */
  slot: number;
  receipt: Receipt;
};

export type ChipRowBeat = {
  kind: "chips";
  id: string;
  indicator: Range;
  expand: Range;
  chips: ChipSpec[];
};

export type Beat = MessageBeat | ChipRowBeat;

const POP = 0.2;
const INDICATOR = 0.35;
const EXPAND = 0.25;
const SPINNER = 0.6;
const CHECK = 0.2;
const LIFT = 0.5;
const LIFT_STAGGER = 0.1;

const customer = (id: string, text: string, popStart: number, typeDelay = 0.12): MessageBeat => {
  const schedule = typeSchedule(text, CHAT_CPS);
  const typeStart = popStart + typeDelay;
  return {
    kind: "message",
    id,
    side: "customer",
    text,
    schedule,
    enter: [f(popStart), f(popStart + POP)],
    indicator: null,
    typeStart: f(typeStart),
    done: f(typeStart + schedule.done),
    settled: f(typeStart + schedule.caretGone),
  };
};

/** Agent message. With an indicator it shows dots first; without, the pill expands at once. */
const agent = (id: string, text: string, start: number, withIndicator: boolean): MessageBeat => {
  const schedule = typeSchedule(text, CHAT_CPS);
  const e0 = withIndicator ? start + INDICATOR : start;
  const typeStart = e0 + EXPAND + 0.02;
  return {
    kind: "message",
    id,
    side: "agent",
    text,
    schedule,
    enter: [f(e0), f(e0 + EXPAND)],
    indicator: withIndicator ? [f(start), f(e0)] : null,
    typeStart: f(typeStart),
    done: f(typeStart + schedule.done),
    settled: f(typeStart + schedule.caretGone),
  };
};

const chipRow = (
  id: string,
  indicatorStart: number,
  liftAt: number,
  chips: Omit<ChipSpec, "check" | "lift">[],
): ChipRowBeat => {
  const e0 = indicatorStart + INDICATOR;
  const checkAt = e0 + SPINNER;
  const lift0 = Math.max(liftAt, checkAt + 0.1);
  return {
    kind: "chips",
    id,
    indicator: [f(indicatorStart), f(e0)],
    expand: [f(e0), f(e0 + EXPAND)],
    chips: chips.map((c, i) => ({
      ...c,
      check: [f(checkAt), f(checkAt + CHECK)],
      lift: [f(lift0 + i * LIFT_STAGGER), f(lift0 + i * LIFT_STAGGER + LIFT)],
    })),
  };
};

const LILAC_TINT = "#EEE9FB";
const PEACH_TINT = "#FCE8DA";
const MINT_TINT = "#E3F6EC";

// Turn 1. At 28 cps with the shared pauses the first message needs about 1.75s,
// so its bubble pops at 0.40s (as the stage settles) and typing starts at 0.52s.
export const C1 = customer("c1", "Hi, I lost my card. Can you block it?", 0.4);
export const K1 = chipRow("k1", Math.max(2.3, sec(C1.done) + 0.02), 3.4, [
  {
    id: "r1",
    busy: "Blocking card",
    doneLabel: "Card blocked",
    slot: 0,
    receipt: { glyph: "card", title: "Card blocked", detail: "Ending 4821", time: "9:02 AM", tint: LILAC_TINT },
  },
]);
// Follows the chip in the same turn: no indicator. The pill opens while the receipt is landing.
export const A1 = agent("a1", "Done. Shall I send a new card too?", sec(K1.chips[0].lift[0]) + 0.35, false);
// Turn 2.
export const C2 = customer("c2", "Yes, please.", Math.max(5.5, sec(A1.done) + 0.02));
export const K2 = chipRow("k2", Math.max(6.2, sec(C2.done) + 0.02), 7.2, [
  {
    id: "r2",
    busy: "Ordering card",
    doneLabel: "Card ordered",
    slot: 1,
    receipt: { glyph: "parcel", title: "New card ordered", detail: "Arrives in 5 to 7 days", time: "9:03 AM", tint: PEACH_TINT },
  },
  {
    id: "r3",
    busy: "Confirming address",
    doneLabel: "Address confirmed",
    slot: 2,
    receipt: { glyph: "pin", title: "Delivery address confirmed", detail: "Same as on file", time: "9:03 AM", tint: MINT_TINT },
  },
]);
// Same turn as the chips: no indicator. Starts once both receipts are in the air,
// so its caret has gone before the final hold.
export const A2 = agent("a2", "All done, Maya.", Math.max(7.55, sec(K2.chips[1].lift[0]) + 0.15), false);

export const BEATS: Beat[] = [C1, K1, A1, C2, K2, A2];
export const MESSAGES: MessageBeat[] = [C1, A1, C2, A2];
export const CHIPS: ChipSpec[] = [...K1.chips, ...K2.chips];

const lastLand = sec(K2.chips[1].lift[1]);
// Starts at 8.35s (not 8.5s) so the line, the badge pulse and the halo have all
// finished by 9.0s and the last second is a clean hold.
const lineStart = Math.max(8.35, lastLand + 0.3);

export const T = {
  stageIn: [0, f(0.6)] as Range,
  chatIn: [f(0.08), f(0.5)] as Range,
  slotIn: (i: number) => [f(0.25 + 0.1 * i), f(0.45 + 0.1 * i)] as Range,
  scroll: f(0.4),
  lineGrow: TYPE_RULES.lineGrow,
  // Finale: lime rail line, badge pulse, header halo.
  limeDraw: [f(lineStart), f(lineStart + 0.5)] as Range,
  badgePulse: [f(lineStart + 0.3), f(lineStart + 0.62)] as Range,
  limeFade: [f(lineStart + 0.5), f(lineStart + 0.65)] as Range,
  halo: [f(lineStart), f(lineStart + 0.62)] as Range,
  // LOOP: the stage contents fade in the last 0.4s, back to the empty chat and slots.
  loopOut: [DURATION - f(0.4), DURATION - f(0.1)] as Range,
  // END_MARK "symbol": the clip extends to 10.8s; collapse 10.0 to 10.2, hold 0.6s.
  endMark: [DURATION, DURATION + f(0.2)] as Range,
};

export const durationFor = (endMark: "none" | "symbol") =>
  endMark === "symbol" ? DURATION + END_MARK_EXTRA : DURATION;
