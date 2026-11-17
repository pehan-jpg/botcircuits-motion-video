import { CHAT_CPS, HEADLINE_CPS, sec } from "../constants";
import { typeSchedule } from "../components/Typewriter";

export const DURATION = 336; // 5.6s at 60 fps

export const CUSTOMER_TEXT = "Block my lost card.";
export const TITLE_TEXT = "Concierge by";
export const UNDERLINED_WORD = "Concierge";
export const CHIP_BUSY = "Blocking card";
export const CHIP_DONE = "Card blocked";

export const chatSchedule = typeSchedule(CUSTOMER_TEXT, CHAT_CPS);
export const titleSchedule = typeSchedule(TITLE_TEXT, HEADLINE_CPS);

/** All beats in frames. */
export const T = {
  // 0.0 to 0.4: card pops in.
  cardIn: [0, sec(0.4)] as [number, number],
  // 0.4 to 1.3: customer row pops (0.2s), then typing.
  customerIn: [sec(0.4), sec(0.6)] as [number, number],
  chatTypeStart: sec(0.62),
  // 1.3 to 1.7: agent row with typing indicator.
  agentIn: [sec(1.3), sec(1.5)] as [number, number],
  // 1.7 to 2.7: indicator expands (0.25s) into the action chip.
  chipExpand: [sec(1.7), sec(1.95)] as [number, number],
  chipLabelIn: [sec(1.84), sec(1.98)] as [number, number],
  chipSwap: [sec(2.34), sec(2.49)] as [number, number],
  checkDraw: [sec(2.36), sec(2.6)] as [number, number],
  // 2.7 to 3.3: card collapses into the orb, pulses, becomes the symbol.
  collapse: [sec(2.7), sec(2.97)] as [number, number],
  contentOut: [sec(2.7), sec(2.85)] as [number, number],
  orbFill: [sec(2.8), sec(2.97)] as [number, number],
  pulse: [sec(2.95), sec(3.12)] as [number, number],
  toSymbol: [sec(3.08), sec(3.34)] as [number, number],
  inkTint: [sec(3.14), sec(3.3)] as [number, number],
  symbolIn: [sec(3.2), sec(3.34)] as [number, number],
  // 3.3 to 4.6: title typing, then the wordmark.
  titleStart: sec(3.3),
  wordmarkIn: [0, 0] as [number, number], // filled below
  // 4.6 to 5.6: hold; underline from 4.7s.
  underlineStart: sec(4.7),
  // LOOP: last 0.4s.
  loopOut: [DURATION - sec(0.4), DURATION] as [number, number],
};

const titleDoneFrame = T.titleStart + Math.ceil(titleSchedule.done * 60);
T.wordmarkIn = [titleDoneFrame + sec(0.06), titleDoneFrame + sec(0.06) + sec(0.5)];
