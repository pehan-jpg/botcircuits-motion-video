import { CHAT_CPS, DURATION } from "../constants";
import { typeSchedule, TypeSchedule } from "../components/Typewriter";

export { DURATION };

/** Converts seconds to (fractional) frames at 60 fps. */
const f = (s: number) => s * 60;

export type Side = "customer" | "agent";

export type MessageBeat = {
  kind: "message";
  id: string;
  side: Side;
  text: string;
  schedule: TypeSchedule;
  /** Bubble pop (0.2s), in frames. */
  pop: [number, number];
  typeStart: number;
  done: number;
  stamp: string;
};

export type ChipBeat = {
  kind: "chip";
  id: string;
  busy: string;
  doneLabel: string;
  indicator: [number, number];
  expand: [number, number];
  labelIn: [number, number];
  swap: [number, number];
  check: [number, number];
  done: number;
};

export type Beat = MessageBeat | ChipBeat;

const POP = 0.2;
const INDICATOR = 0.4;
const EXPAND = 0.25;
const BUSY = 0.6;
const SWAP = 0.15;

const message = (
  id: string,
  side: Side,
  text: string,
  popStart: number,
  typeDelay: number,
  stamp: string,
): MessageBeat => {
  const schedule = typeSchedule(text, CHAT_CPS);
  const typeStart = popStart + typeDelay;
  return {
    kind: "message",
    id,
    side,
    text,
    schedule,
    pop: [f(popStart), f(popStart + POP)],
    typeStart: f(typeStart),
    done: f(typeStart + schedule.done),
    stamp,
  };
};

const chip = (id: string, busy: string, doneLabel: string, indicatorStart: number): ChipBeat => {
  const e0 = indicatorStart + INDICATOR;
  const e1 = e0 + EXPAND;
  const s0 = e1 + BUSY - SWAP / 2;
  return {
    kind: "chip",
    id,
    busy,
    doneLabel,
    indicator: [f(indicatorStart), f(e0)],
    expand: [f(e0), f(e1)],
    labelIn: [f(e0 + EXPAND * 0.5), f(e1 + 0.04)],
    swap: [f(s0), f(s0 + SWAP)],
    check: [f(s0 + 0.02), f(s0 + 0.27)],
    done: f(s0 + SWAP),
  };
};

const sec = (frames: number) => frames / 60;

// Turn 1. The first message needs about 1.59s at 32 cps with the shared pauses,
// so its bubble pops at 0.3s (while the card settles) and typing starts at 0.48s.
export const C1 = message("c1", "customer", "Hi, I lost my card. Can you block it?", 0.3, 0.18, "09:41");
export const K1 = chip("k1", "Blocking card", "Card blocked", Math.max(1.9, sec(C1.done) + 0.03));
// Same turn: 0.2s after the chip resolves, no indicator.
export const A2 = message("a2", "agent", "Done. Shall I send you a new card?", sec(K1.done) + 0.2, 0.06, "09:41");
// Turn 2.
export const C2 = message("c2", "customer", "Yes, please.", Math.max(5.1, sec(A2.done) + 0.02), 0.15, "09:42");
export const K2 = chip("k2", "Ordering new card", "New card on its way", Math.max(5.9, sec(C2.done) + 0.03));

export const BEATS: Beat[] = [C1, K1, A2, C2, K2];
export const MESSAGES: MessageBeat[] = [C1, A2, C2];

export const T = {
  cardIn: [0, f(0.5)] as [number, number],
  openHalo: [f(0.05), f(0.85)] as [number, number],
  closeHalo: [Math.max(f(7.35), K2.done + f(0.05)), DURATION] as [number, number],
  scroll: f(0.4),
  stampFade: f(0.2),
  // LOOP: the thread fades out in the last 0.4s, leaving the empty card.
  loopOut: [DURATION - f(0.4), DURATION - f(0.12)] as [number, number],
  // END_MARK "symbol": the last 0.8s, starting once the second chip has resolved.
  endMark: Math.max(DURATION - f(0.8), K2.done + f(0.02)),
};
