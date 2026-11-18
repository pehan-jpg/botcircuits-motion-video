import { HEADLINE_CPS, sec } from "../constants";

export const BASE_DURATION = 600; // 10.0s at 60 fps
export const END_MARK_DURATION = 648; // 10.8s when END_MARK is "symbol"

export const CHAT_CPS = 32;
export const TABLE_CPS = CHAT_CPS * 1.4; // 40 percent faster than chat
export { HEADLINE_CPS };

type R = readonly [number, number];
const r = (a: number, b: number): R => [sec(a), sec(b)];

export const REQUEST_LINES = ["Prepare this week's invoice", "exceptions for review."];

export const ROWS = [
  { vendor: "Acme Ltd", amount: "4,200", status: "ok" as const, from: "inv" as const },
  { vendor: "Northwind", amount: "18,900", status: "over" as const, from: "pol" as const },
  { vendor: "Globex", amount: "2,750", status: "ok" as const, from: "inv" as const },
];

/** All beats in frames; arguments are seconds. */
export const T = {
  stageIn: r(0, 0.5),
  cardIn: (i: number): R => r(0.06 + 0.08 * i, 0.26 + 0.08 * i), // 0.08s stagger, 0.2s each

  // 0.5 to 2.4 request
  fieldIn: r(0.45, 0.6),
  typeRequest: sec(0.62),
  sendHighlight: r(2.12, 2.32),
  reqLine: r(2.2, 2.42),
  reqPulse: r(2.3, 2.52),

  // 2.4 to 3.4 agent team
  leadPulse: r(2.45, 2.8),
  agentLines: r(2.6, 2.9),
  agentPulse: r(2.6, 2.9),
  fillInvoice: r(2.85, 3.15),
  fillPolicy: r(2.95, 3.25),

  // 3.4 to 5.0 tools and Brain
  gmailChip: r(3.45, 3.65),
  gmailSpin: r(3.55, 4.05),
  sheetsChip: r(3.6, 3.8),
  sheetsSpin: r(3.7, 4.2),
  policyChip: r(3.45, 3.65),
  policySpin: r(4.05, 4.55),
  brainLine: r(3.45, 3.75),
  brainPulseOut: r(3.75, 3.98),
  brainFill: r(3.85, 4.15),
  highlight: r(4.2, 4.6),
  brainPulseBack: r(4.55, 4.78),
  cite: r(4.75, 4.95),

  // 5.0 to 6.4 table
  tableFill: r(4.85, 5.0),
  rowStart: [sec(5.0), sec(5.45), sec(5.9)],
  dataPulse: [r(4.75, 5.0), r(5.2, 5.45), r(5.65, 5.9)],

  // 6.4 to 7.0 review
  lift: r(6.4, 6.9),
  reviewFill: r(6.72, 6.98),
  calmIn: r(6.45, 6.7),

  // 7.0 to 7.8 cursor
  cursorIn: r(6.95, 7.05),
  cursorMove: r(7.0, 7.5),
  click: r(7.65, 7.8),

  // 7.8 to 8.6 approved
  approved: r(7.85, 8.1),
  wake: r(7.9, 8.35),
  statusFlip: r(8.0, 8.25),
  cursorOut: r(8.05, 8.3),
  delivery: r(8.25, 8.5),
  deliveryCheck: r(8.45, 8.6),

  // 8.6 to 10.0 hold
  ambient: [r(8.7, 8.88), r(8.88, 9.12), r(9.12, 9.28)],
  loopOut: r(9.6, 10.0),
  endCollapse: r(10.0, 10.2),
  endSymbol: r(10.1, 10.25),
};
